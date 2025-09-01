// UltraLive Node.js Test
// 🚀 UltraChat v1.2.3.4 Final - PRIVACY FIRST

import UltraLive from './UltraLive.js';

// Sample user profiles
const users = [
  {
    handle: "UltraKing",
    screenName: "Ultra",
    accountType: "Ultra Elite",
    mood: "Chill",
    voiceEnabled: true,
    mirrorText: true,
    uppercase: false,
    liveColor: "red",
    messages: ["Hello everyone!", "Ready to rock UltraChat!", "Let's make some noise!"]
  },
  {
    handle: "AnonGhost",
    screenName: "Ghost",
    accountType: "Anon",
    mood: "Party",
    voiceEnabled: true,
    mirrorText: false,
    uppercase: true,
    liveColor: "blue",
    messages: ["Stealth mode activated!", "Let's vibe!", "Invisible and unstoppable!"]
  }
];

// Run the Node.js test
async function runNodeTest() {
  console.log('🚀 UltraLive Node.js Test');
  console.log('========================');
  
  try {
    // Test text transformations
    console.log('\n🔤 Text Transformation Tests:');
    console.log('---------------------------');
    
    const sampleText = "UltraChat Rocks";
    console.log(`Original: ${sampleText}`);
    console.log(`Mirrored: ${UltraLive.mirrorText(sampleText)}`);
    
    // Test voice settings
    console.log('\n🗣️ Voice Settings Tests:');
    console.log('----------------------');
    
    const accountTypes = ["Legacy", "Pro", "Ultra", "Ultra Elite", "Anon"];
    accountTypes.forEach(type => {
      const settings = UltraLive.getVoiceSettings(type);
      console.log(`${type.padEnd(12)}: Pitch ${settings.pitch}, Rate ${settings.rate}`);
    });
    
    // Test text transformations with user preferences
    console.log('\n🔄 User-Specific Transformations:');
    console.log('--------------------------------');
    
    users.forEach(user => {
      console.log(`\n${user.handle} (${user.accountType}):`);
      user.messages.forEach(message => {
        const transformed = UltraLive.transformText(user, message);
        console.log(`  "${message}" → "${transformed}"`);
      });
    });
    
    // Test mood fetching
    console.log('\n🎭 Mood Fetching Tests:');
    console.log('---------------------');
    
    for (const user of users) {
      const moods = await UltraLive.fetchMoods(user.accountType);
      console.log(`${user.accountType}: ${moods.join(', ')}`);
    }
    
    console.log('\n✅ UltraLive Node.js Test completed successfully!');
    console.log('\nNote: DOM-related functions (renderLiveOverlay, etc.) require a browser environment.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
runNodeTest();