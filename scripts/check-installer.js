#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const rootDir = dirname(fileURLToPath(import.meta.url));

function runCommand(command) {
  try {
    return execSync(command, { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
  } catch {
    return null;
  }
}

function checkBinary(name, command) {
  const result = runCommand(command);
  if (result) {
    console.log(`✔ ${name}: ${result}`);
    return true;
  }
  console.warn(`✗ ${name} não encontrado ou falha ao executar: ${command}`);
  return false;
}

function checkFile(relativePath) {
  const absolutePath = join(rootDir, '..', relativePath);
  if (existsSync(absolutePath)) {
    console.log(`✔ Arquivo encontrado: ${relativePath}`);
    return true;
  }
  console.warn(`✗ Arquivo não encontrado: ${relativePath}`);
  return false;
}

console.log('🔎 Verificando ambiente de instalação do PeA-Plan...');

const checks = [
  checkBinary('Node.js', 'node --version'),
  checkBinary('npm', 'npm --version'),
  checkBinary('pnpm', 'pnpm --version'),
  checkFile('.env.example'),
  checkFile('install.bat'),
  checkFile('install.sh'),
  checkFile('client/public/manifest.json'),
  checkFile('client/public/sw.js'),
  checkFile('client/src/lib/pwa.ts'),
];

console.log('');

if (checks.every(Boolean)) {
  console.log('✅ Verificação de instalação concluída com sucesso.');
  process.exit(0);
}

console.error('❌ Há problemas no ambiente de instalação. Corrija os itens acima antes de prosseguir.');
process.exit(1);
