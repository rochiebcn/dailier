const { app, BrowserWindow, dialog } = require('electron');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const http = require('node:http');
const net = require('node:net');
const path = require('node:path');
const { spawn } = require('node:child_process');

const HOST = '127.0.0.1';
const BACKEND_BOOT_TIMEOUT_MS = 45_000;

let backendProcess;
let frontendServer;

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function getAppAssetRoot() {
  return app.isPackaged ? path.join(process.resourcesPath, 'app') : path.join(__dirname, 'app');
}

async function findFrontendRoot(assetRoot) {
  const candidates = [
    path.join(assetRoot, 'frontend', 'browser'),
    path.join(assetRoot, 'frontend')
  ];

  for (const candidate of candidates) {
    try {
      await fsp.access(path.join(candidate, 'index.html'));
      return candidate;
    } catch {
      // Try next candidate.
    }
  }

  throw new Error(`Frontend build not found in ${assetRoot}. Run: npm run prepare:bundle`);
}

function reservePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once('error', reject);
    server.listen(0, HOST, () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close(() => reject(new Error('Failed to reserve a free port.')));
        return;
      }

      const { port } = address;
      server.close((closeError) => {
        if (closeError) {
          reject(closeError);
          return;
        }
        resolve(port);
      });
    });
  });
}

function waitForPort(port, timeoutMs) {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const socket = new net.Socket();
      socket.setTimeout(1_000);

      socket.once('connect', () => {
        socket.end();
        resolve();
      });

      const onRetry = () => {
        socket.destroy();
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Timeout waiting for backend on port ${port}.`));
          return;
        }
        setTimeout(tryConnect, 500);
      };

      socket.once('timeout', onRetry);
      socket.once('error', onRetry);
      socket.connect(port, HOST);
    };

    tryConnect();
  });
}

function createProxyRequestOptions(targetBaseUrl, req) {
  const targetUrl = new URL(req.url || '/', targetBaseUrl);
  const hostHeader = targetUrl.port
    ? `${targetUrl.hostname}:${targetUrl.port}`
    : targetUrl.hostname;

  return {
    protocol: targetUrl.protocol,
    hostname: targetUrl.hostname,
    port: targetUrl.port,
    method: req.method,
    path: `${targetUrl.pathname}${targetUrl.search}`,
    headers: {
      ...req.headers,
      host: hostHeader
    }
  };
}

function proxyApiRequest(targetBaseUrl, req, res) {
  const proxyOptions = createProxyRequestOptions(targetBaseUrl, req);
  const client = proxyOptions.protocol === 'https:' ? require('node:https') : http;

  const proxyReq = client.request(proxyOptions, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', () => {
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ message: 'Failed to reach backend.' }));
  });

  req.pipe(proxyReq);
}

function serveFile(frontendRoot, requestPath, res) {
  const normalized = path.normalize(requestPath).replace(/^[\\/]+/, '');
  const targetPath = path.join(frontendRoot, normalized || 'index.html');
  const safeRoot = `${path.resolve(frontendRoot)}${path.sep}`;
  const safePath = path.resolve(targetPath);

  if (!safePath.startsWith(safeRoot) && safePath !== path.resolve(path.join(frontendRoot, 'index.html'))) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const finalPath = fs.existsSync(safePath) && fs.statSync(safePath).isFile()
    ? safePath
    : path.join(frontendRoot, 'index.html');

  const ext = path.extname(finalPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(finalPath).pipe(res);
}

function startFrontendServer(frontendRoot, backendPort) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if ((req.url || '').startsWith('/api/')) {
        proxyApiRequest(`http://${HOST}:${backendPort}`, req, res);
        return;
      }

      const parsedUrl = new URL(req.url || '/', `http://${HOST}`);
      serveFile(frontendRoot, decodeURIComponent(parsedUrl.pathname), res);
    });

    server.once('error', (error) => {
      reject(new Error(`Failed to start frontend server: ${error.message}`));
    });
    server.listen(0, HOST, () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Failed to start local frontend server.'));
        return;
      }
      console.log(`[Electron] Frontend server listening on port ${address.port}`);
      resolve({ server, port: address.port });
    });
  });
}

function findJava() {
  const { execSync } = require('node:child_process');

  const javaCandidates = [
    process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME, 'bin', 'java.exe') : null,
    'java',
    'C:\\Program Files\\Java\\jdk-25\\bin\\java.exe',
    'C:\\Program Files\\Java\\jdk-21.0.12-corretto\\jdk21.0.12_8\\bin\\java.exe',
    'C:\\Java\\jdk-25\\bin\\java.exe',
    'C:\\Java\\jdk-21.0.12-corretto\\jdk21.0.12_8\\bin\\java.exe'
  ].filter(Boolean);

  for (const javaPath of javaCandidates) {
    try {
      execSync(`"${javaPath}" -version`, { stdio: 'pipe' });
      return javaPath;
    } catch {
      // Continue to the next candidate
    }
  }

  throw new Error('Java not found in system. Please install Java 21+ and restart the application.');
}

function spawnBackend(assetRoot, backendPort) {
  const backendJar = path.join(assetRoot, 'backend', 'dailier-backend.jar');
  if (!fs.existsSync(backendJar)) {
    throw new Error(`Backend JAR not found at ${backendJar}. Run: npm run prepare:bundle`);
  }

  const javaPath = findJava();
  const userDataDir = app.getPath('userData');
  const logsDir = path.join(userDataDir, 'logs');
  
  try {
    fs.mkdirSync(logsDir, { recursive: true });
  } catch {
    // Folder already exists
  }

  const logFile = path.join(logsDir, `backend-${new Date().toISOString().split('T')[0]}.log`);

  backendProcess = spawn(javaPath, ['-jar', backendJar], {
    cwd: userDataDir,
    env: {
      ...process.env,
      SERVER_PORT: `${backendPort}`
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true
  });

  // Capture backend logs
  const logStream = fs.createWriteStream(logFile, { flags: 'a' });
  backendProcess.stdout?.pipe(logStream);
  backendProcess.stderr?.pipe(logStream);

  backendProcess.on('exit', (code) => {
    logStream.end();
    if (code !== 0 && !app.isQuitting) {
      dialog.showErrorBox(
        'Backend Failed',
        `Backend process exited with code ${code}.\n\nLogs saved at:\n${logFile}\n\nCheck the file for details.`
      );
    }
  });
}

async function createMainWindow(frontendPort, frontendRoot) {
  const windowIconPath = path.join(frontendRoot, 'icon.ico');
  const window = new BrowserWindow({
    width: 1300,
    height: 850,
    minWidth: 980,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    icon: fs.existsSync(windowIconPath) ? windowIconPath : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  await window.loadURL(`http://${HOST}:${frontendPort}`);
  window.once('ready-to-show', () => window.show());
}

async function bootstrap() {
  const assetRoot = getAppAssetRoot();
  console.log(`[Electron] Asset root: ${assetRoot}`);
  
  const frontendRoot = await findFrontendRoot(assetRoot);
  console.log(`[Electron] Frontend root: ${frontendRoot}`);

  const backendPort = await reservePort();
  console.log(`[Electron] Backend port: ${backendPort}`);
  
  spawnBackend(assetRoot, backendPort);
  console.log('[Electron] Backend process spawned, waiting for port...');
  
  await waitForPort(backendPort, BACKEND_BOOT_TIMEOUT_MS);
  console.log('[Electron] Backend is ready');

  const frontend = await startFrontendServer(frontendRoot, backendPort);
  frontendServer = frontend.server;
  console.log(`[Electron] Frontend server started on port ${frontend.port}`);

  await createMainWindow(frontend.port, frontendRoot);
  console.log('[Electron] Main window created');
}

function shutdown() {
  app.isQuitting = true;

  if (frontendServer) {
    frontendServer.close();
  }

  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill();
  }
}

app.whenReady().then(bootstrap).catch((error) => {
  dialog.showErrorBox('Failed to start Dailier', error.message);
  app.quit();
});

app.on('before-quit', shutdown);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
