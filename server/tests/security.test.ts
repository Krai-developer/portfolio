import test from 'node:test';
import assert from 'node:assert/strict';
import { isSafeHttpUrl } from '../src/utils/validation';
import { getJwtSecret } from '../src/utils/token';
import { requireAdmin, requireClient, checkProjectOwnership, AuthRequest } from '../src/middleware/auth';
import { login, register } from '../src/controllers/authController';
import { uploadProjectFile } from '../src/controllers/projectController';
import { Project } from '../src/models/Project';

const createMockRes = () => {
  const res: any = {
    statusCode: 200,
    body: undefined,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.body = payload;
      return this;
    }
  };
  return res;
};

test('isSafeHttpUrl allows valid http and https URLs and blocks dangerous schemes', () => {
  assert.equal(isSafeHttpUrl('https://krai-dev.vercel.app/files/spec.pdf'), true);
  assert.equal(isSafeHttpUrl('http://localhost:5000/doc'), true);
  assert.equal(isSafeHttpUrl('javascript:alert(1)'), false);
  assert.equal(isSafeHttpUrl('data:text/html,<script>alert(1)</script>'), false);
  assert.equal(isSafeHttpUrl('vbscript:msgbox(1)'), false);
  assert.equal(isSafeHttpUrl(''), false);
  assert.equal(isSafeHttpUrl(null), false);
  assert.equal(isSafeHttpUrl(`https://example.com/${'a'.repeat(2050)}`), false);
});

test('getJwtSecret never uses the hardcoded dev secret in production', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalSecret = process.env.JWT_SECRET;

  try {
    process.env.NODE_ENV = 'production';
    delete process.env.JWT_SECRET;
    const prodFallback = getJwtSecret();
    assert.notEqual(prodFallback, 'dev_super_secret_jwt_key_2026');
    assert.equal(prodFallback.length, 64);

    process.env.JWT_SECRET = 'prod_strong_secret_key';
    assert.equal(getJwtSecret(), 'prod_strong_secret_key');

    process.env.NODE_ENV = 'development';
    delete process.env.JWT_SECRET;
    assert.equal(getJwtSecret(), 'dev_super_secret_jwt_key_2026');
  } finally {
    process.env.NODE_ENV = originalEnv;
    if (originalSecret !== undefined) {
      process.env.JWT_SECRET = originalSecret;
    } else {
      delete process.env.JWT_SECRET;
    }
  }
});

test('RBAC middlewares enforce 401 unauthenticated and 403 forbidden roles', () => {
  // Unauthenticated
  const unauthRes = createMockRes();
  let nextCalled = false;
  requireAdmin({} as AuthRequest, unauthRes, () => {
    nextCalled = true;
  });
  assert.equal(nextCalled, false);
  assert.equal(unauthRes.statusCode, 401);

  // Client hitting admin route -> 403
  const forbiddenRes = createMockRes();
  requireAdmin({ user: { role: 'client' } } as unknown as AuthRequest, forbiddenRes, () => {
    nextCalled = true;
  });
  assert.equal(nextCalled, false);
  assert.equal(forbiddenRes.statusCode, 403);

  // Admin hitting admin route -> passes
  const adminRes = createMockRes();
  requireAdmin({ user: { role: 'admin' } } as unknown as AuthRequest, adminRes, () => {
    nextCalled = true;
  });
  assert.equal(nextCalled, true);

  // Admin hitting client-only route -> 403
  let clientNext = false;
  const clientForbiddenRes = createMockRes();
  requireClient({ user: { role: 'admin' } } as unknown as AuthRequest, clientForbiddenRes, () => {
    clientNext = true;
  });
  assert.equal(clientNext, false);
  assert.equal(clientForbiddenRes.statusCode, 403);
});

test('checkProjectOwnership blocks IDOR access from non-owning clients', async () => {
  const originalFindById = Project.findById;
  (Project as any).findById = async (id: string) => {
    if (id === 'missing') return null;
    return { _id: id, clientId: 'owner-user-123' };
  };

  try {
    // Non-owner client -> 403
    const res403 = createMockRes();
    let nextCalled = false;
    await checkProjectOwnership(
      {
        params: { projectId: 'proj-1' },
        user: { _id: 'attacker-user-999', role: 'client' }
      } as unknown as AuthRequest,
      res403,
      () => {
        nextCalled = true;
      }
    );
    assert.equal(nextCalled, false);
    assert.equal(res403.statusCode, 403);

    // Owner client -> passes
    const resOwner = createMockRes();
    let ownerNext = false;
    await checkProjectOwnership(
      {
        params: { projectId: 'proj-1' },
        user: { _id: 'owner-user-123', role: 'client' }
      } as unknown as AuthRequest,
      resOwner,
      () => {
        ownerNext = true;
      }
    );
    assert.equal(ownerNext, true);

    // Admin -> passes
    const resAdmin = createMockRes();
    let adminNext = false;
    await checkProjectOwnership(
      {
        params: { projectId: 'proj-1' },
        user: { _id: 'admin-1', role: 'admin' }
      } as unknown as AuthRequest,
      resAdmin,
      () => {
        adminNext = true;
      }
    );
    assert.equal(adminNext, true);
  } finally {
    (Project as any).findById = originalFindById;
  }
});

test('login and register reject NoSQL operator objects instead of throwing 500', async () => {
  const loginRes = createMockRes();
  await login(
    { body: { email: { $ne: '' }, password: 'password123' } } as any,
    loginRes
  );
  assert.equal(loginRes.statusCode, 400);
  assert.equal(loginRes.body.success, false);

  const registerRes = createMockRes();
  await register(
    { body: { name: 'Test', email: { $gt: '' }, password: 'password123' } } as any,
    registerRes
  );
  assert.equal(registerRes.statusCode, 400);
  assert.equal(registerRes.body.success, false);
});

test('uploadProjectFile rejects javascript: URLs with 400', async () => {
  const res = createMockRes();
  await uploadProjectFile(
    {
      params: { projectId: 'proj-1' },
      body: { name: 'Malicious', url: 'javascript:alert(document.cookie)' },
      user: { _id: 'user-1', role: 'client' }
    } as unknown as AuthRequest,
    res
  );
  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /http:\/\/ or https:\/\//i);
});
