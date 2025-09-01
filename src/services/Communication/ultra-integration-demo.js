// Ultra Integration Demo
// Demonstrates the integration between UltraGenerator and UltraTextGenerator

import ultraGenerator from './UltraGenerator.js';
import ultraTextGenerator from './UltraTextGenerator.js';

console.log('🚀 Ultra Integration Demo');
console.log('======================');

async function runDemo() {
  try {
    // Initialize UltraTextGenerator
    await ultraTextGenerator.initialize();
    console.log('✅ UltraTextGenerator initialized');
    
    // Generate predefined handles
    console.log('\n🔧 Predefined Handles:');
    for (let i = 0; i < 5; i++) {
      console.log(`  ${ultraGenerator.generatePredefinedHandle()}`);
    }

    // Generate dynamic nicknames
    console.log('\n🎭 Dynamic Nicknames:');
    for (let i = 0; i < 5; i++) {
      console.log(`  ${ultraGenerator.generateDynamicNickname()}`);
    }

    // Generate UltraSpeak responses
    console.log('\n💬 UltraSpeak Responses:');
    for (let i = 0; i < 5; i++) {
      console.log(`  ${ultraGenerator.generateUltraSpeak()}`);
    }

    // Generate personalized UltraSpeak
    console.log('\n👤 Personalized UltraSpeak:');
    const sampleNick = 'GlitchPhantom007';
    for (let i = 0; i < 3; i++) {
      console.log(`  ${ultraGenerator.generateUltraSpeak(sampleNick)}`);
    }

    // Generate viral one-liners
    console.log('\n🔥 Viral One-Liners:');
    for (let i = 0; i < 5; i++) {
      console.log(`  ${ultraGenerator.generateViralOneLiner()}`);
    }

    // Generate emoji-enhanced text
    console.log('\n🎮 Emoji-Enhanced Text:');
    const sampleText = 'Level up, player!';
    console.log(`  Gamer: ${ultraGenerator.generateEmojiText(sampleText, 'gamer')}`);
    console.log(`  Coder: ${ultraGenerator.generateEmojiText(sampleText, 'coder')}`);
    console.log(`  Crypto: ${ultraGenerator.generateEmojiText(sampleText, 'crypto')}`);

    // Generate complete profiles
    console.log('\n🌟 Complete Profiles:');
    const userTypes = ['gamer', 'coder', 'casual', 'crypto'];
    userTypes.forEach(type => {
      const profile = ultraGenerator.generateUltraProfile(type);
      console.log(`\n  ${type.toUpperCase()} Profile:`);
      console.log(`    Nickname: ${profile.nickname}`);
      console.log(`    Enhanced: ${profile.enhancedNickname}`);
      console.log(`    UltraSpeak: ${profile.ultraSpeak}`);
      console.log(`    One-Liner: ${profile.oneLiner}`);
    });

    // Integration with UltraTextGenerator
    console.log('\n🔄 Integration with UltraTextGenerator:');
    console.log(`  Dynamic Nickname: ${ultraTextGenerator.generateDynamicNickname()}`);
    console.log(`  UltraSpeak: ${ultraTextGenerator.generateUltraSpeak()}`);
    console.log(`  Personalized UltraSpeak: ${ultraTextGenerator.generateUltraSpeak('NeonViper⚡')}`);

    console.log('\n✅ Integration demo completed!');
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Run the demo
runDemo();