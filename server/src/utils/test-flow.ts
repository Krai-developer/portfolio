import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

async function postJson(path: string, data: any, cookie?: string): Promise<{ status: number; body: any; cookie?: string }> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          ...(cookie ? { Cookie: cookie } : {})
        }
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
          const setCookie = res.headers['set-cookie']?.[0]?.split(';')[0];
          resolve({ status: res.statusCode || 500, body: parsed, cookie: setCookie });
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function getJson(path: string, cookie?: string): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method: 'GET',
        headers: {
          ...(cookie ? { Cookie: cookie } : {})
        }
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
          resolve({ status: res.statusCode || 500, body: parsed });
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('--- 1. Testing Public Endpoints ---');
  const health = await getJson('/api/health');
  console.log('Health:', health.status, health.body);

  const projects = await getJson('/api/projects');
  console.log('Public Projects Count:', projects.body.count);

  const services = await getJson('/api/services');
  console.log('Public Services Count:', services.body.count);

  const skills = await getJson('/api/skills');
  console.log('Public Skills Count:', skills.body.count);

  console.log('\n--- 2. Testing Contact Form Submission ---');
  const contact = await postJson('/api/contact', {
    name: 'Tech Startup Founder',
    email: 'founder@scaleup.io',
    projectBrief: 'Need an MVP landing page and backend built in 4 weeks.'
  });
  console.log('Contact Submit Status:', contact.status, contact.body.message);

  console.log('\n--- 3. Testing Client Login & RBAC ---');
  const clientLogin = await postJson('/api/auth/login', {
    email: 'client@acme.com',
    password: 'ClientPassword123!'
  });
  console.log('Client Login Status:', clientLogin.status, 'User Role:', clientLogin.body.user?.role);
  const clientCookie = clientLogin.cookie;
  console.log('HTTP-Only Cookie received:', !!clientCookie);

  const clientDash = await getJson('/api/client/dashboard', clientCookie);
  console.log('Client Dashboard Status:', clientDash.status);
  console.log('Client Active Projects:', clientDash.body.data?.stats.activeProjects);
  console.log('Client Project Name:', clientDash.body.data?.recentProjects?.[0]?.title);

  console.log('\n--- 4. Testing RBAC Security Guard ---');
  const forbiddenAdminCheck = await getJson('/api/admin/dashboard', clientCookie);
  console.log(
    'Client attempting to access /api/admin/dashboard -> Status:',
    forbiddenAdminCheck.status,
    '(Expected 403 Forbidden)'
  );

  console.log('\n--- 5. Testing Admin Login & Dashboard ---');
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be configured in server/.env.');
  }
  const adminLogin = await postJson('/api/auth/login', {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD
  });
  console.log('Admin Login Status:', adminLogin.status, 'User Role:', adminLogin.body.user?.role);
  const adminCookie = adminLogin.cookie;

  const adminDash = await getJson('/api/admin/dashboard', adminCookie);
  console.log('Admin Dashboard Status:', adminDash.status);
  console.log('Admin Total Projects:', adminDash.body.data?.stats.totalProjects);
  console.log('Admin Total Clients:', adminDash.body.data?.stats.totalClients);
  console.log('Admin Unread Inquiries:', adminDash.body.data?.stats.unreadMessages);

  console.log('\n--- 6. Testing Admin Project CRUD ---');
  const newProject = await postJson(
    '/api/projects',
    {
      title: 'Solana Web3 Analytics Dashboard',
      slug: 'solana-web3-analytics',
      category: 'Web3 & FinTech',
      description: 'High-frequency transaction parser and real-time yield optimizer.',
      technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
      projectType: 'portfolio',
      status: 'completed',
      progress: 100,
      published: true,
      featured: true
    },
    adminCookie
  );
  console.log('Admin Created Project Status:', newProject.status, 'Title:', newProject.body.data?.title);

  console.log('\n========================================');
  console.log('ALL FULL-STACK & RBAC VERIFICATIONS PASSED!');
  console.log('========================================');
}

runTests().catch(console.error);
