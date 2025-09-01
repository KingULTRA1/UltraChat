#!/usr/bin/env node

// Script to kill processes using UltraChat ports
// Usage: node scripts/kill-ports.js

import { exec } from 'child_process';
import { promisify } from 'util';
import process from 'process';

const execPromise = promisify(exec);

async function killPort(port) {
  try {
    let stdout;
    
    if (process.platform === 'win32') {
      // Windows command to find processes using the port
      const result = await execPromise(`netstat -ano | findstr :${port}`);
      stdout = result.stdout;
    } else {
      // Unix/Linux/macOS command to find processes using the port
      try {
        const result = await execPromise(`lsof -ti :${port}`);
        stdout = result.stdout;
      } catch (error) {
        // If lsof fails, try netstat
        const result = await execPromise(`netstat -an | grep ${port}`);
        stdout = result.stdout;
      }
    }
    
    if (stdout && stdout.trim()) {
      console.log(`\n🔍 Found processes using port ${port}:`);
      console.log(stdout);
      
      if (process.platform === 'win32') {
        // Extract PIDs and kill them (Windows)
        const lines = stdout.split('\n');
        const pids = [];
        
        for (const line of lines) {
          const match = line.match(/(\d+)$/);
          if (match) {
            const pid = match[1];
            if (!pids.includes(pid)) {
              pids.push(pid);
            }
          }
        }
        
        for (const pid of pids) {
          try {
            await execPromise(`taskkill /PID ${pid} /F`);
            console.log(`✅ Killed process with PID ${pid}`);
          } catch (error) {
            console.log(`❌ Failed to kill process with PID ${pid}: ${error.message}`);
          }
        }
      } else {
        // Kill processes (Unix/Linux/macOS)
        try {
          await execPromise(`lsof -ti :${port} | xargs kill -9 2>/dev/null || echo "No processes to kill"`);
          console.log(`✅ Killed processes using port ${port}`);
        } catch (error) {
          console.log(`❌ Failed to kill processes using port ${port}: ${error.message}`);
        }
      }
    } else {
      console.log(`✅ No processes found using port ${port}`);
    }
  } catch (error) {
    console.log(`✅ No processes found using port ${port} or command failed`);
  }
}

async function main() {
  console.log('🚀 UltraChat Port Killer');
  console.log('======================');
  
  // Kill processes on common UltraChat ports
  const ports = [3000, 3001, 3002, 3003];
  
  for (const port of ports) {
    await killPort(port);
  }
  
  console.log('\n✅ Done! You can now start UltraChat without port conflicts.');
  console.log('💡 Tip: Run "npm run check-ports" to verify ports are free');
}

main().catch(console.error);