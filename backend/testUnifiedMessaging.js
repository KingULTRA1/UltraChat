// Test script for Unified Messaging Service

import unifiedMessagingService from './unifiedMessaging.js'
import deviceIdentityManager from './deviceIdentity.js'

async function testUnifiedMessaging() {
  console.log('🚀 Testing Unified Messaging Service...')
  
  try {
    // Initialize the service
    await unifiedMessagingService.initialize()
    console.log('✅ Service initialized')
    
    // Test device identity
    const deviceId = deviceIdentityManager.getDeviceId()
    console.log(`✅ Device ID: ${deviceId}`)
    
    // Test account types
    console.log('📋 Testing account types...')
    const accountTypes = unifiedMessagingService.accountTypes
    console.log('Available account types:', Object.values(accountTypes))
    
    // Test permissions for Legacy (merged Legacy/OG)
    console.log('\n📋 Testing Legacy account permissions...')
    unifiedMessagingService.setUserPermissions('testUser1', accountTypes.LEGACY)
    const hasMessaging = unifiedMessagingService.hasPermission('testUser1', 'messaging')
    const hasVoiceChat = unifiedMessagingService.hasPermission('testUser1', 'voiceChat')
    const hasEvents = unifiedMessagingService.hasPermission('testUser1', 'eventsCalendar')
    console.log(`Legacy user messaging permission: ${hasMessaging}`)
    console.log(`Legacy user voice chat permission: ${hasVoiceChat}`)
    console.log(`Legacy user events permission: ${hasEvents}`)
    
    // Test permissions for Ultra
    console.log('\n📋 Testing Ultra account permissions...')
    unifiedMessagingService.setUserPermissions('testUser2', accountTypes.ULTRA)
    const ultraHasMessaging = unifiedMessagingService.hasPermission('testUser2', 'messaging')
    const ultraHasVoiceChat = unifiedMessagingService.hasPermission('testUser2', 'voiceChat')
    console.log(`Ultra user messaging permission: ${ultraHasMessaging}`)
    console.log(`Ultra user voice chat permission: ${ultraHasVoiceChat}`)
    
    // Test message creation
    console.log('\n📝 Testing message creation...')
    const testMessage = await unifiedMessagingService.createMessage(
      'testUser1', 
      'testUser2', 
      'Hello, this is a test message!',
      { type: 'text' }
    )
    console.log(`✅ Message created with ID: ${testMessage.id}`)
    
    // Test message retrieval
    console.log('\n📝 Testing message retrieval...')
    const retrievedMessage = await unifiedMessagingService.retrieveMessage(testMessage.id)
    console.log(`✅ Message retrieved: ${retrievedMessage.content}`)
    
    console.log('\n🎉 All tests passed!')
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testUnifiedMessaging()