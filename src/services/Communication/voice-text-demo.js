// Voice + Text Integration Demo
// 🚀 UltraChat v1.2.3.4 Final - PRIVACY FIRST

import UltraTextGenerator from './UltraTextGenerator.js';

async function runVoiceTextDemo() {
  console.log('🚀 UltraChat Voice + Text Integration Demo');
  console.log('==========================================');
  
  try {
    // Initialize UltraTextGenerator with voice integration
    const generator = new UltraTextGenerator();
    await generator.initialize();
    console.log('✅ UltraTextGenerator initialized with voice integration');
    
    // Check if voice is supported
    if (generator.voiceIntegration && generator.voiceIntegration.isVoiceSupported()) {
      console.log('✅ Voice synthesis is supported in this browser');
    } else {
      console.warn('⚠️ Voice synthesis is not supported in this browser');
    }
    
    // Demo 1: Generate and display mirrored text
    console.log('\n🔤 Mirrored Text Generation:');
    console.log('---------------------------');
    const mirroredText = generator.mirrorStack('UltraChat');
    console.log(mirroredText);
    
    // Demo 2: Generate rich nicknames
    console.log('\n🎭 Rich Nickname Generation:');
    console.log('---------------------------');
    for (let i = 0; i < 3; i++) {
      const nickname = generator.generateRichNickname();
      console.log(`  ${nickname}`);
    }
    
    // Demo 3: Generate viral messages
    console.log('\n💬 Viral Message Generation:');
    console.log('---------------------------');
    for (let i = 0; i < 3; i++) {
      const message = generator.generateViralMessage();
      console.log(`  ${message}`);
    }
    
    // Demo 4: Generate UltraSpeak responses
    console.log('\n🗣️ UltraSpeak Generation:');
    console.log('------------------------');
    for (let i = 0; i < 3; i++) {
      const ultraSpeak = generator.generateUltraSpeak();
      console.log(`  ${ultraSpeak}`);
    }
    
    // Demo 5: Speak a mirrored text (if voice is supported)
    console.log('\n🔊 Voice Integration Demo:');
    console.log('-------------------------');
    if (generator.voiceIntegration && generator.voiceIntegration.isVoiceSupported()) {
      console.log('Speaking mirrored text: "Welcome to UltraChat"');
      generator.generateAndSpeakMirrorStack('Welcome to UltraChat');
      
      // Wait a moment between speeches
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('Speaking UltraSpeak response');
      generator.generateAndSpeakUltraSpeak('NeonViper');
      
      // Wait a moment between speeches
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('Speaking viral message');
      generator.generateAndSpeakViralMessage('CyberNinja');
    } else {
      console.log('Voice features not available in this environment');
    }
    
    console.log('\n✅ Voice + Text Integration Demo completed!');
    console.log('\nNote: In a browser environment, you would hear the spoken text.');
    console.log('In Node.js, voice features are not available.');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Run the demo
runVoiceTextDemo();