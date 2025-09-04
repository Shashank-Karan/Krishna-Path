
#!/usr/bin/env node

// Simple local development startup script
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Krishna Path locally...\n');

// Set NODE_ENV if not already set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

// Start the development server
const devProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

devProcess.on('error', (error) => {
  console.error('Failed to start development server:', error);
  process.exit(1);
});

devProcess.on('close', (code) => {
  console.log(`Development server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  devProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\nShutting down gracefully...');
  devProcess.kill('SIGTERM');
});
