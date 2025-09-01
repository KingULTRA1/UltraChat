// Ultra Text Enhanced Demo
// Demonstrates the enhanced capabilities of UltraTextGenerator with the new word library

import UltraTextGenerator from './UltraTextGenerator.js';

console.log('🚀 Ultra Text Enhanced Demo');
console.log('==========================');

async function runDemo() {
  try {
    // Create UltraTextGenerator without full browser initialization
    const ultraTextGenerator = new UltraTextGenerator();
    console.log('✅ UltraTextGenerator created (Node.js mode)');
    
    // Generate rich nicknames
    console.log('\n🎭 Rich Nicknames:');
    for (let i = 0; i < 10; i++) {
      console.log(`  ${ultraTextGenerator.generateRichNickname()}`);
    }

    // Generate viral messages
    console.log('\n💬 Viral Messages:');
    for (let i = 0; i < 10; i++) {
      console.log(`  ${ultraTextGenerator.generateViralMessage()}`);
    }

    // Generate personalized viral messages
    console.log('\n👤 Personalized Viral Messages:');
    const sampleNick = ultraTextGenerator.generateRichNickname();
    for (let i = 0; i < 5; i++) {
      console.log(`  ${ultraTextGenerator.generateViralMessage(sampleNick)}`);
    }

    // Generate story snippets
    console.log('\n📖 Story Snippets:');
    for (let i = 0; i < 5; i++) {
      console.log(`  ${ultraTextGenerator.generateStorySnippet()}`);
    }

    // Generate tech specs
    console.log('\n⚙️ Tech Specs:');
    for (let i = 0; i < 5; i++) {
      console.log(`  ${ultraTextGenerator.generateTechSpec()}`);
    }

    // Integration with existing methods
    console.log('\n🔄 Integration with Existing Methods:');
    console.log(`  Dynamic Nickname: ${ultraTextGenerator.generateDynamicNickname()}`);
    console.log(`  UltraSpeak: ${ultraTextGenerator.generateUltraSpeak()}`);
    console.log(`  Personalized UltraSpeak: ${ultraTextGenerator.generateUltraSpeak(ultraTextGenerator.generateRichNickname())}`);

    console.log('\n✅ Enhanced demo completed!');
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Run the demo
runDemo();