// Ultra Unified Demo
// Demonstrates the new unified cross-platform messaging and contact sharing features

import UltraTextGenerator from './UltraTextGenerator.js'
import CrossServiceMessaging from '../Messaging/CrossServiceMessaging.js'
import QRJoinManager from './QRJoinManager.js'
import ContactShareManager from './ContactShareManager.js'
import CallManager from '../Messaging/CallManager.js'

async function runUnifiedDemo() {
  console.log('🚀 UltraChat Unified Features Demo')
  console.log('==================================')
  
  try {
    // Initialize components
    const textGenerator = new UltraTextGenerator()
    await textGenerator.initialize()
    
    const crossServiceMessaging = new CrossServiceMessaging()
    await crossServiceMessaging.initialize()
    
    const qrManager = new QRJoinManager()
    await qrManager.initialize()
    
    const contactManager = new ContactShareManager(qrManager)
    
    const callManager = new CallManager()
    
    console.log('\n✅ All components initialized successfully')
    
    // Demo 1: Auto-naming and viral responses
    console.log('\n🎭 Auto-Naming & Viral Responses Demo:')
    console.log('-------------------------------------')
    
    const autoNames = textGenerator.generateAutoNameSuggestions(3)
    console.log('Auto-generated names:', autoNames)
    
    const viralResponse = textGenerator.generateViralResponse()
    console.log('Viral response:', viralResponse)
    
    const funText = textGenerator.generateFunText('Hello UltraChat!', { randomEffect: true })
    console.log('Fun text with effects:', funText)
    
    // Demo 2: Unified cross-platform messaging
    console.log('\n📱 Unified Cross-Platform Messaging Demo:')
    console.log('----------------------------------------')
    
    const messageContent = textGenerator.generateViralMessage('UltraUser')
    console.log('Message to send:', messageContent)
    
    // Show supported platforms
    const platforms = crossServiceMessaging.getSupportedServices()
    console.log('Supported platforms:', platforms.map(p => p.name))
    
    // Demo 3: QR-based contact sharing
    console.log('\n🔗 QR-Based Contact Sharing Demo:')
    console.log('-------------------------------')
    
    const contactQR = await contactManager.generateContactShareQR('user_123', {
      encrypt: true,
      trustLevel: 80
    })
    console.log('Contact QR generated:', contactQR.id)
    
    // Demo 4: SMS and phone call integration
    console.log('\n📞 SMS & Phone Integration Demo:')
    console.log('------------------------------')
    
    console.log('SMS supported:', callManager.isSMSSupported())
    console.log('Phone calls supported:', callManager.isPhoneSupported())
    
    // Demo 5: Fun text chat settings
    console.log('\n🎪 Fun Text Chat Settings Demo:')
    console.log('-----------------------------')
    
    console.log('Auto-naming enabled:', textGenerator.enableAutoNaming(true))
    console.log('Viral responses enabled:', textGenerator.enableViralResponses(true))
    console.log('Fun effects enabled:', textGenerator.enableFunEffects(true))
    
    console.log('\n🎉 All demos completed successfully!')
    console.log('\n🚀 UltraChat v1.2.3.4 Final is ready for release!')
    
  } catch (error) {
    console.error('❌ Demo failed:', error)
  }
}

// Run the demo
runUnifiedDemo()

export default runUnifiedDemo