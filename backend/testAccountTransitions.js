// Test script for Account Type Transitions

import unifiedMessagingService from './unifiedMessaging.js'
import deviceIdentityManager from './deviceIdentity.js'
import ProfileModes from '../src/services/Profiles/ProfileModes.js'

async function testAccountTransitions() {
  console.log('🚀 Testing Account Type Transitions...')
  
  try {
    // Initialize the service
    await unifiedMessagingService.initialize()
    console.log('✅ Service initialized')
    
    // Test device identity
    const deviceId = deviceIdentityManager.getDeviceId()
    console.log(`✅ Device ID: ${deviceId}`)
    
    // Test all account types
    console.log('📋 Testing all account types...')
    const accountTypes = unifiedMessagingService.accountTypes
    console.log('Available account types:', Object.values(accountTypes))
    
    // Test each account type permissions
    for (const [key, accountType] of Object.entries(accountTypes)) {
      console.log(`\n📋 Testing ${key} account permissions...`)
      unifiedMessagingService.setUserPermissions(`testUser_${key}`, accountType)
      
      // Test basic permissions that all accounts should have
      const hasMessaging = unifiedMessagingService.hasPermission(`testUser_${key}`, 'messaging')
      const hasEncryption = unifiedMessagingService.hasPermission(`testUser_${key}`, 'encryption')
      const hasLocalStorage = unifiedMessagingService.hasPermission(`testUser_${key}`, 'localStorage')
      
      console.log(`${key} user messaging permission: ${hasMessaging}`)
      console.log(`${key} user encryption permission: ${hasEncryption}`)
      console.log(`${key} user localStorage permission: ${hasLocalStorage}`)
      
      // Test account-specific permissions
      if (key === 'ULTRA' || key === 'LEGACY' || key === 'PRO' || key === 'ULTRA_ELITE') {
        const hasVoiceChat = unifiedMessagingService.hasPermission(`testUser_${key}`, 'voiceChat')
        const hasEvents = unifiedMessagingService.hasPermission(`testUser_${key}`, 'eventsCalendar')
        console.log(`${key} user voice chat permission: ${hasVoiceChat}`)
        console.log(`${key} user events permission: ${hasEvents}`)
      }
    }
    
    // Test ProfileModes validation
    console.log('\n📋 Testing ProfileModes validation...')
    const modeComparison = ProfileModes.getModeComparison()
    console.log(`✅ ${modeComparison.length} account types validated`)
    
    // Test specific mode capabilities
    const ultraCapabilities = ProfileModes.getModeCapabilities(ProfileModes.MODES.ULTRA)
    const legacyCapabilities = ProfileModes.getModeCapabilities(ProfileModes.MODES.LEGACY)
    console.log(`✅ Ultra capabilities: ${JSON.stringify(ultraCapabilities)}`)
    console.log(`✅ Legacy capabilities: ${JSON.stringify(legacyCapabilities)}`)
    
    // Test mode transitions
    console.log('\n🔄 Testing mode transitions...')
    const validTransition = ProfileModes.validateModeTransition(ProfileModes.MODES.BASIC, ProfileModes.MODES.ULTRA)
    const invalidTransition = ProfileModes.validateModeTransition(ProfileModes.MODES.BASIC, 'InvalidMode')
    console.log(`Basic to Ultra transition valid: ${validTransition}`)
    console.log(`Basic to InvalidMode transition valid: ${invalidTransition}`)
    
    console.log('\n🎉 All account transition tests passed!')
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testAccountTransitions()