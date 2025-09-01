#!/usr/bin/env node

// Script to clean install UltraChat dependencies
// Usage: node scripts/clean-install.js

import { exec } from 'child_process';
import { promisify } from 'util';
import { platform } from 'process';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

const execPromise = promisify(exec);

async function runCommand(command, description) {
  console.log(`\n🔧 ${description}`);
  console.log(`   Command: ${command}`);
  
  try {
    const { stdout, stderr } = await execPromise(command);
    if (stdout) console.log(stdout);
    if (stderr) console.log(stderr);
    console.log(`✅ ${description} completed successfully`);
  } catch (error) {
    console.log(`❌ ${description} failed: ${error.message}`);
    throw error;
  }
}

async function main() {
  console.log('🚀 UltraChat Clean Installation Script');
  console.log('=====================================');
  
  try {
    // Remove node_modules directories
    console.log('\n🗑️  Removing node_modules directories...');
    
    const rootNodeModules = join(process.cwd(), 'node_modules');
    const backendNodeModules = join(process.cwd(), 'backend', 'node_modules');
    
    if (existsSync(rootNodeModules)) {
      console.log('   Removing root node_modules...');
      rmSync(rootNodeModules, { recursive: true, force: true });
      console.log('   ✅ Root node_modules removed');
    } else {
      console.log('   ℹ️  Root node_modules not found');
    }
    
    if (existsSync(backendNodeModules)) {
      console.log('   Removing backend node_modules...');
      rmSync(backendNodeModules, { recursive: true, force: true });
      console.log('   ✅ Backend node_modules removed');
    } else {
      console.log('   ℹ️  Backend node_modules not found');
    }
    
    // Remove package-lock.json files
    console.log('\n🗑️  Removing package-lock.json files...');
    
    const rootLock = join(process.cwd(), 'package-lock.json');
    const backendLock = join(process.cwd(), 'backend', 'package-lock.json');
    
    if (existsSync(rootLock)) {
      rmSync(rootLock, { force: true });
      console.log('   ✅ Root package-lock.json removed');
    } else {
      console.log('   ℹ️  Root package-lock.json not found');
    }
    
    if (existsSync(backendLock)) {
      rmSync(backendLock, { force: true });
      console.log('   ✅ Backend package-lock.json removed');
    } else {
      console.log('   ℹ️  Backend package-lock.json not found');
    }
    
    // Install dependencies
    console.log('\n📥 Installing dependencies...');
    await runCommand('npm install', 'Installing root dependencies');
    await runCommand('cd backend && npm install', 'Installing backend dependencies');
    
    // Run security audit
    console.log('\n🛡️  Running security audit...');
    try {
      await runCommand('npm audit --production', 'Running npm audit');
    } catch (error) {
      console.log('⚠️  Security vulnerabilities found. Please review and address them.');
    }
    
    console.log('\n🎉 Clean installation completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Start the backend: cd backend && npm start');
    console.log('   2. In another terminal, start the frontend: npm run dev');
    console.log('   3. Open your browser at http://localhost:3000');
    
  } catch (error) {
    console.error('\n💥 Clean installation failed:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);