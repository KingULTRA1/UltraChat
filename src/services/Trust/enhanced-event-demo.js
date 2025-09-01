// Enhanced Event Access System Demo
// Demonstrates privacy handles and crypto-style identifiers

import EventAccessSystem from './EventAccessSystem.js'

async function runEnhancedEventDemo() {
  console.log('🚀 UltraChat Enhanced Event Access System Demo')
  console.log('=============================================')
  
  try {
    // Initialize the event access system
    const eventSystem = new EventAccessSystem()
    
    console.log('\n🔐 Privacy Handle Generation:')
    console.log('----------------------------')
    
    // Generate privacy handles for different account types
    const privacyHandles = [
      { userId: 'user_001', accountType: 'ANON', baseHandle: 'GhostUser' },
      { userId: 'user_002', accountType: 'ROYAL', baseHandle: 'KingUltra' },
      { userId: 'user_003', accountType: 'SCHOLAR', baseHandle: 'DrSmith' },
      { userId: 'user_004', accountType: 'ULTRA_ELITE', baseHandle: 'EliteGamer' },
      { userId: 'user_005', accountType: 'PRO', baseHandle: 'RegularUser' }
    ]
    
    privacyHandles.forEach(({ userId, accountType, baseHandle }) => {
      const privacyHandle = eventSystem.generatePrivacyHandle(userId, accountType, baseHandle)
      console.log(`${accountType} (${baseHandle}): ${privacyHandle}`)
    })
    
    console.log('\n🎉 Event Creation with Privacy Handles:')
    console.log('--------------------------------------')
    
    // Create an event with privacy handle support
    const eventData = {
      title: "UltraChat Developer Meetup",
      description: "Monthly gathering for UltraChat developers",
      type: "meetup",
      privacy: "private",
      maxParticipants: 10,
      startsAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      location: "Virtual (UltraChat)",
      tags: ["development", "networking", "ultrachat"],
      creatorHandle: "KingUltra"
    }
    
    const event = await eventSystem.createEvent('user_002', eventData)
    console.log(`✅ Created event: "${event.title}"`)
    console.log(`   Creator Display Name: ${event.creatorDisplayName}`)
    console.log(`   Privacy: ${event.privacy}`)
    console.log(`   Tags: ${event.tags.join(', ')}`)
    
    console.log('\n👥 Web of Trust Invitation with Privacy Handles:')
    console.log('-----------------------------------------------')
    
    // Mock the Web of Trust connection check
    eventSystem.checkWebOfTrustConnection = async (inviterId, inviteeId) => {
      // Simulate that users are connected in Web of Trust
      return true
    }
    
    // Invite users with privacy handles
    await eventSystem.inviteToEvent(event.id, 'user_002', 'user_001')
    await eventSystem.inviteToEvent(event.id, 'user_002', 'user_003')
    
    console.log(`Invited users to "${event.title}":`)
    event.invitedUsers.forEach(user => {
      console.log(`  - ${user.displayName} (${user.userId})`)
    })
    
    console.log('\n✅ Enhanced Event Access System Demo completed successfully!')
    
  } catch (error) {
    console.error('❌ Demo failed:', error)
  }
}

// Run the demo
runEnhancedEventDemo()

export default runEnhancedEventDemo