// Test script for UltraTextGenerator
import UltraTextGenerator from './UltraTextGenerator.js';

async function testUltraTextGenerator() {
  console.log('Testing UltraTextGenerator...');
  
  try {
    const generator = new UltraTextGenerator();
    // Skip full initialization for Node.js testing
    console.log('\n✅ UltraTextGenerator created successfully');
    
    // Test rich nickname generation
    console.log('\n🎭 Testing Rich Nickname Generation:');
    for (let i = 0; i < 5; i++) {
      const nickname = generator.generateRichNickname();
      console.log(`  ${nickname}`);
    }
    
    // Test viral message generation
    console.log('\n💬 Testing Viral Message Generation:');
    for (let i = 0; i < 3; i++) {
      const message = generator.generateViralMessage();
      console.log(`  ${message}`);
    }
    
    // Test story snippet generation
    console.log('\n📖 Testing Story Snippet Generation:');
    const story = generator.generateStorySnippet();
    console.log(`  ${story}`);
    
    // Test tech spec generation
    console.log('\n⚙️ Testing Tech Spec Generation:');
    const spec = generator.generateTechSpec();
    console.log(`  ${spec}`);
    
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testUltraTextGenerator();