#!/usr/bin/env node

// Script to check which processes are using UltraChat ports
// Usage: node scripts/check-ports.js

import { exec } from 'child_process';
import { promisify } from 'util';
import process from 'process';

const execPromise = promisify(exec);

async function checkPort(port) {
  try {
    let stdout;
    
    if (process.platform === 'win32') {
      // Windows command to check port usage
      const result = await execPromise(`netstat -ano | findstr :${port}`);
      stdout = result.stdout;
    } else {
      // Unix/Linux/macOS command to check port usage
      const result = await execPromise(`lsof -i :${port} 2>/dev/null || netstat -an | grep ${port}`);
      stdout = result.stdout;
    }
    
    if (stdout && stdout.trim()) {
      console.log(`\n📍 Port ${port} is in use:`);
      console.log(stdout);
      
      // Extract PID and get process name (Windows only)
      if (process.platform === 'win32') {
        const lines = stdout.split('\n');
        for (const line of lines) {
          const match = line.match(/(\d+)$/);
          if (match) {
            const pid = match[1];
            try {
              const { stdout: processInfo } = await execPromise(`tasklist /fi "PID eq ${pid}" /fo csv`);
              console.log(`📊 Process details for PID ${pid}:`);
              console.log(processInfo);
            } catch (error) {
              console.log(`⚠️ Could not get process details for PID ${pid}`);
            }
            break;
          }
        }
      }
    } else {
      console.log(`✅ Port ${port} is not in use`);
    }
  } catch (error) {
    console.log(`✅ Port ${port} is not in use or command failed`);
  }
}

async function main() {
  console.log('🚀 UltraChat Port Checker');
  console.log('========================');
  
  // Check common UltraChat ports
  const ports = [3000, 3001, 3002, 3003];
  
  for (const port of ports) {
    await checkPort(port);
  }
  
  console.log('\n💡 Tips:');
  if (process.platform === 'win32') {
    console.log('- If a port is in use, you can kill the process with: taskkill /PID <process_id> /F');
    console.log('- Or run: npm run kill-ports (from project root)');
  } else {
    console.log('- If a port is in use, you can kill the process with: kill -9 <process_id>');
    console.log('- Or run: npm run kill-ports (from project root)');
  }
  console.log('- Make sure to stop any running UltraChat instances before starting new ones');
}

main().catch(console.error);