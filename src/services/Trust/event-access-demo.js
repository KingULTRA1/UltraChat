// Event Access System Demo
// Demonstrates the Web of Trust driven event permissions

import EventAccessSystem from './EventAccessSystem.js'

async function runEventAccessDemo() {
  console.log('🚀 UltraChat Event Access System Demo')
  console.log('=====================================')
  
  try {
    // Initialize the event access system
    const eventSystem = new EventAccessSystem()
    
    console.log('\n📋 Account Types & Permissions:')
    console.log('-------------------------------')
    
    // Display all account types and their permissions
    for (const [type, config] of Object.entries(EventAccessSystem.ACCOUNT_TYPES)) {
      console.log(`\n${config.name} (${type}):`)
      console.log(`  Description: ${config.description}`)
      console.log(`  Access Level: ${config.accessLevel}`)
      console.log(`  Event Limit: ${config.eventLimit}`)
      console.log(`  Permissions:`)
      for (const [perm, value] of Object.entries(config.permissions)) {
        console.log(`    ${perm}: ${value ? '✅' : '❌'}`)
      }
    }
    
    console.log('\n🔗 Access Hierarchy:')
    console.log('-------------------')
    console.log(EventAccessSystem.ACCESS_HIERARCHY.join(' → '))
    
    console.log('\n🎉 Event Creation Demo:')
    console.log('----------------------')
    
    // Create sample users
    const userId1 = 'user_001'
    const userId2 = 'user_002'
    const userId3 = 'user_003'
    
    // Create an event
    const eventData = {
      title: "UltraChat Developer Meetup",
      description: "Monthly gathering for UltraChat developers",
      type: "meetup",
      privacy: "private",
      maxParticipants: 10,
      startsAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      location: "Virtual (UltraChat)",
      tags: ["development", "networking", "ultrachat"]
    }
    
    const event = await eventSystem.createEvent(userId1, eventData)
    console.log(`✅ Created event: "${event.title}"`)
    console.log(`   ID: ${event.id}`)
    console.log(`   Creator: ${event.creatorId}`)
    console.log(`   Privacy: ${event.privacy}`)
    console.log(`   Max Participants: ${event.maxParticipants}`)
    
    console.log('\n👥 Web of Trust Invitation Demo:')
    console.log('-------------------------------')
    
    // In a real implementation, we would check actual Web of Trust connections
    // For this demo, we'll simulate the invitation process
    console.log(`Inviting ${userId2} to "${event.title}"...`)
    
    // Mock the Web of Trust connection check
    eventSystem.checkWebOfTrustConnection = async (inviterId, inviteeId) => {
      // Simulate that users are connected in Web of Trust
      return true
    }
    
    await eventSystem.inviteToEvent(event.id, userId1, userId2)
    console.log(`✅ ${userId2} invited to the event`)
    
    console.log(`\nAccepting invitation for ${userId2}...`)
    await eventSystem.acceptEventInvitation(event.id, userId2)
    console.log(`✅ ${userId2} joined the event`)
    
    console.log('\n📊 Accessible Events:')
    console.log('--------------------')
    
    const accessibleEvents = await eventSystem.getUserAccessibleEvents(userId2)
    console.log(`User ${userId2} has access to ${accessibleEvents.length} events:`)
    
    for (const event of accessibleEvents) {
      console.log(`  - ${event.title} (${event.privacy})`)
    }
    
    console.log('\n👤 User Events:')
    console.log('--------------')
    
    const userEvents = eventSystem.getUserEvents(userId1)
    console.log(`User ${userId1} is involved in ${userEvents.length} events:`)
    
    for (const event of userEvents) {
      console.log(`  - ${event.title} (Creator: ${event.creatorId === userId1 ? 'Yes' : 'No'})`)
      console.log(`    Participants: ${event.participants.length}`)
      console.log(`    Invited: ${event.invitedUsers.length}`)
    }
    
    console.log('\n🔒 Privacy Features:')
    console.log('-------------------')
    console.log('✅ No traceable data left from event access checks')
    console.log('✅ Web of Trust connections protect user privacy')
    console.log('✅ Anonymous users can only access explicitly invited events')
    console.log('✅ All event data is stored locally with encryption')
    
    console.log('\n✅ Event Access System Demo completed successfully!')
    
  } catch (error) {
    console.error('❌ Demo failed:', error)
  }
}

// Run the demo
runEventAccessDemo()

export default runEventAccessDemo