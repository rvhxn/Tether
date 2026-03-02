const { spawn } = require('child_process');
const path = require('path');

console.log("==========================================");
console.log("🚀 STARTING TETHER FRONTEND & BACKEND 🚀");
console.log("==========================================\n");

// 1. Start the Expo Frontend (Interactive Mode)
// Inheriting stdio is CRITICAL here so Expo retains TTY and prints the QR code
const expo = spawn(/^win/.test(process.platform) ? 'npx.cmd' : 'npx', ['expo', 'start'], {
    stdio: 'inherit',
    shell: true
});

// 2. Start the Express Backend
const backendPath = path.resolve(__dirname, '../src/backend');
const backend = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'dev'], {
    cwd: backendPath,
    shell: true
});

// Capture and prefix backend logs so they don't visually break Expo's CLI
backend.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
        if (line.trim()) process.stdout.write(`\x1b[36m[Backend]\x1b[0m ${line}\n`);
    });
});

backend.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
        if (line.trim()) process.stderr.write(`\x1b[31m[Backend Err]\x1b[0m ${line}\n`);
    });
});

// Cleanup processes on exit
process.on('SIGINT', () => {
    console.log("\nShutting down Tether servers...");
    expo.kill('SIGINT');
    backend.kill('SIGINT');
    process.exit();
});
