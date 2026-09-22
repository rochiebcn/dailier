import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const args = new Set(process.argv.slice(2));

if (args.has('--help') || args.has('-h')) {
  console.log('Uso: node scripts/prepare-bundle.mjs [--skip-build] [--dry-run]');
  process.exit(0);
}

const isDryRun = args.has('--dry-run');
const skipBuild = args.has('--skip-build') || isDryRun;

const desktopDir = path.resolve(process.cwd());
const repoRoot = path.resolve(desktopDir, '..');
const backendDir = path.join(repoRoot, 'backend');
const frontendDir = path.join(repoRoot, 'frontend');

const appDir = path.join(desktopDir, 'app');
const appBackendDir = path.join(appDir, 'backend');
const appFrontendDir = path.join(appDir, 'frontend');

function resolveBin(command) {
  if (process.platform === 'win32') {
    return `${command}.cmd`;
  }
  return command;
}

function run(command, commandArgs, cwd) {
  console.log(`> ${command} ${commandArgs.join(' ')} (${cwd})`);
  const result = spawnSync(resolveBin(command), commandArgs, {
    cwd,
    stdio: 'inherit',
    shell: false
  });

  if (result.status !== 0) {
    throw new Error(`Fallo ejecutando: ${command} ${commandArgs.join(' ')}`);
  }
}

function ensureDirectory(targetPath) {
  if (!existsSync(targetPath)) {
    mkdirSync(targetPath, { recursive: true });
  }
}

function clearDirectory(targetPath) {
  if (existsSync(targetPath)) {
    rmSync(targetPath, { recursive: true, force: true });
  }
  ensureDirectory(targetPath);
}

function findBackendJar() {
  const targetDir = path.join(backendDir, 'target');
  if (!existsSync(targetDir)) {
    throw new Error('No existe backend/target. Ejecuta el build del backend primero.');
  }

  const files = readdirSync(targetDir)
    .filter((name) => name.startsWith('dailier-backend-') && name.endsWith('.jar') && !name.startsWith('dailier-backend-0.0.1-SNAPSHOT.jar.original'))
    .map((name) => path.join(targetDir, name))
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);

  if (files.length === 0) {
    throw new Error('No se encontro ningun JAR de backend en backend/target.');
  }

  return files[0];
}

function findFrontendDist() {
  const candidates = [
    path.join(frontendDir, 'dist', 'frontend', 'browser'),
    path.join(frontendDir, 'dist', 'frontend')
  ];

  const match = candidates.find((candidate) => existsSync(path.join(candidate, 'index.html')));
  if (!match) {
    throw new Error('No se encontro el build del frontend en frontend/dist.');
  }

  return match;
}

function copyBundleAssets() {
  const backendJar = findBackendJar();
  const frontendDist = findFrontendDist();

  clearDirectory(appDir);
  ensureDirectory(appBackendDir);

  cpSync(backendJar, path.join(appBackendDir, 'dailier-backend.jar'));
  cpSync(frontendDist, appFrontendDir, { recursive: true });

  console.log('Assets embebidos preparados en desktop/app');
}

try {
  if (!skipBuild) {
    run(path.join(repoRoot, 'mvnw.cmd'), ['-q', '-pl', 'backend', '-DskipTests', 'package'], repoRoot);
    run('npm', ['run', 'build'], frontendDir);
  } else {
    console.log('Build omitido (--skip-build/--dry-run).');
  }

  if (isDryRun) {
    console.log('Modo dry-run: no se copian artefactos.');
    process.exit(0);
  }

  copyBundleAssets();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

