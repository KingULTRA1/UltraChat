// UltraLive Demo
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
  },
  {
    handle: "CryptoLord",
    screenName: " Satoshi",
    accountType: "Pro",
    mood: "Focused",
    voiceEnabled: true,
    mirrorText: false,
    uppercase: false,
    liveColor: "gold",
    messages: ["To the moon!", "Diamond hands!", "HODL strong!"]
  }
];

// Run the demo
async function runDemo() {
  console.log('🚀 UltraLive Demo');
  console.log('================');
  
  try {
    // Initialize multi-user live session
    console.log('\nInitializing multi-user live session...');
    UltraLive.initMultiUserLive(users);
    
    // Demonstrate text transformations
    console.log('\n🔤 Text Transformation Examples:');
    console.log('------------------------------');
    
    const sampleText = "UltraChat Rocks";
    console.log(`Original: ${sampleText}`);
    console.log(`Mirrored: ${UltraLive.mirrorText(sampleText)}`);
    
    // Demonstrate voice settings
    console.log('\n🗣️ Voice Settings by Account Type:');
    console.log('---------------------------------');
    
    const accountTypes = ["Legacy", "Pro", "Ultra", "Ultra Elite", "Anon"];
    accountTypes.forEach(type => {
      const settings = UltraLive.getVoiceSettings(type);
      console.log(`${type.padEnd(12)}: Pitch ${settings.pitch}, Rate ${settings.rate}`);
    });
    
    // Demonstrate mood fetching
    console.log('\n🎭 Dynamic Moods by Account Type:');
    console.log('--------------------------------');
    
    for (const user of users) {
      const moods = await UltraLive.fetchMoods(user.accountType);
      console.log(`${user.accountType}: ${moods.join(', ')}`);
    }
    
    console.log('\n✅ UltraLive Demo completed!');
    console.log('\nIn a browser environment with DOM support, you would see:');
    console.log('- Live overlays for each user with their handle, account type, and mood');
    console.log('- Text transformations applied based on user preferences');
    console.log('- Voice output with profile-specific pitch and rate settings');
    console.log('- Dynamic mood dropdowns based on account type');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Run the demo
runDemo();