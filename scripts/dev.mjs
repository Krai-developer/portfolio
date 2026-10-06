import { spawn } from 'node:child_process';

const npmCli = process.env.npm_execpath;
const npmCommand = npmCli ? process.execPath : process.platform === 'win32' ? 'npm.cmd' : 'npm';
const npmPrefix = npmCli ? [npmCli] : [];
const children = new Set();
let shuttingDown = false;

function runNpm(args) {
  const child = spawn(npmCommand, [...npmPrefix, ...args], {
    stdio: 'inherit',
    shell: !npmCli && process.platform === 'win32',
    env: process.env
  });

  children.add(child);
  child.once('exit', (code, signal) => {
    children.delete(child);
    if (!shuttingDown) {
      console.error(`[dev] A development process exited (${signal ?? code ?? 'unknown'}). Stopping the other process.`);
      shutdown(code ?? 1);
    }
  });
  child.once('error', (error) => {
    console.error('[dev] Could not start a development process:', error.message);
    shutdown(1);
  });

  return child;
}

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) child.kill('SIGTERM');
  process.exitCode = exitCode;
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

let apiReady = false;

try {
  const response = await fetch('http://127.0.0.1:5000/api/health', { signal: AbortSignal.timeout(1000) });
  apiReady = response.ok;
} catch {
  // No healthy API is listening yet.
}

if (!apiReady) {
  console.log('[dev] Starting the API and waiting for MongoDB before launching the frontend...');
  const api = runNpm(['--prefix', 'server', 'run', 'dev']);
  const apiExited = new Promise((resolve) => api.once('exit', (code, signal) => resolve({ code, signal })));
  const apiDeadline = Date.now() + 45_000;

  while (!shuttingDown && Date.now() < apiDeadline) {
    const exited = await Promise.race([
      apiExited,
      new Promise((resolve) => setTimeout(() => resolve(null), 750))
    ]);

    if (exited) {
      console.error(`[dev] API stopped before becoming ready (${exited.signal ?? exited.code ?? 'unknown'}).`);
      shutdown(exited.code ?? 1);
      break;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/api/health', { signal: AbortSignal.timeout(1000) });
      if (response.ok) {
        apiReady = true;
        break;
      }
    } catch {
      // The API is still starting or MongoDB has not connected yet.
    }
  }
}

if (!shuttingDown && apiReady) {
  let frontendAlreadyRunning = false;
  try {
    const response = await fetch('http://127.0.0.1:5173', { signal: AbortSignal.timeout(1000) });
    frontendAlreadyRunning = response.ok && (await response.text()).includes('/@vite/client');
  } catch {
    // No frontend is listening on the expected development port.
  }

  if (frontendAlreadyRunning) {
    console.log('[dev] API is ready. The Vite frontend is already running at http://localhost:5173.');
  } else {
    console.log('[dev] API is ready. Starting the frontend...');
    runNpm(['--prefix', 'client', 'run', 'dev']);
  }
} else if (!shuttingDown) {
  console.error('[dev] API did not become healthy within 45 seconds. Check that MongoDB is running and server/.env is configured.');
  shutdown(1);
}
