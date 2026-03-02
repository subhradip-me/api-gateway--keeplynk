#!/usr/bin/env node

/**
 * Server startup script with proper background handling
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting KeepLynk API Gateway...\n');

const server = spawn('node', ['index.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  detached: false
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});

server.on('exit', (code, signal) => {
  if (signal === 'SIGINT' || signal === 'SIGTERM') {
    console.log('✅ Server stopped gracefully');
  } else if (code !== 0) {
    console.error(`❌ Server exited with code ${code}`);
    process.exit(code);
  }
});

// Handle Ctrl+C to gracefully stop the server
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  server.kill('SIGTERM');
});

// Keep the process alive
process.stdin.resume();