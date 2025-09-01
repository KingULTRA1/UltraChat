// Simple test script for UltraTextGenerator
// 🚀 UltraChat v1.2.3.4 Final - PRIVACY FIRST

import UltraTextGenerator from './UltraTextGenerator.js';

console.log('🚀 UltraTextGenerator Test Script');
console.log('=================================');

// Initialize the generator
const generator = new UltraTextGenerator();

// Test the new mirrorStack function
console.log('\n🔍 Testing mirrorStack function:');
console.log('--------------------------------');
console.log(generator.mirrorStack('UltraChat'));
console.log('\n' + generator.mirrorStack('Hello World!'));
console.log('\n' + generator.mirrorStack('JavaScript 🚀'));

// Test rich nickname generation
console.log('\n🎭 Testing rich nickname generation:');
console.log('-----------------------------------');
for (let i = 0; i < 3; i++) {
  console.log(generator.generateRichNickname());
}

// Test viral message generation
console.log('\n💬 Testing viral message generation:');
console.log('-----------------------------------');
for (let i = 0; i < 3; i++) {
  console.log(generator.generateViralMessage());
}

console.log('\n✅ Test completed successfully!');