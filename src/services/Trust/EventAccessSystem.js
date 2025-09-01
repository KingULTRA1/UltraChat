// Event Access System - Web of Trust Driven Event Permissions
// Handles gated event access without leaving traceable data

import TrustManager from './TrustManager.js'
import CryptoUtils from '../../utils/CryptoUtils.js'

class EventAccessSystem {
  constructor() {
    this.trustManager = new TrustManager()
    this.cryptoUtils = new CryptoUtils()
    this.events = new Map() // In-memory event storage
    this.eventAccessLogs = new Map() // Privacy-focused access tracking
    this.userPrivacyHandles = new Map() // Store privacy handles for users
  }

  // Account types with their hierarchy and permissions
  static ACCOUNT_TYPES = {
    // Standard / Default
    PRO: {
      name: "Pro",
      description: "Baseline account, default for all users",
      accessLevel: 1,
      permissions: {
        publicEvents: true,
        privateEvents: false,
        eliteEvents: false,
        hosting: false,
        moderation: false
      },
      eventLimit: 5
    },
    
    // Early / Historic Users (special tags)
    LEGACY: {
      name: "Legacy",
      description: "Original users, marked for recognition",
      accessLevel: 1,
      permissions: {
        publicEvents: true,
        privateEvents: false,
        eliteEvents: false,
        hosting: false,
        moderation: false
      },
      eventLimit: 5,
      specialTag: true
    },
    
    OG: {
      name: "OG",
      description: "Founder-level early adopter",
      accessLevel: 1,
      permissions: {
        publicEvents: true,
        privateEvents: false,
        eliteEvents: false,
        hosting: false,
        moderation: false
      },
      eventLimit: 5,
      specialTag: true
    },
    
    // Premium / Growth Tiers
    ULTRA: {
      name: "Ultra",
      description: "Enhanced access to private events, perks, or exclusive content",
      accessLevel: 2,
      permissions: {
        publicEvents: true,
        privateEvents: true,
        eliteEvents: false,
        hosting: true,
        moderation: false
      },
      eventLimit: 15
    },
    
    ULTRA_ELITE: {
      name: "Ultra Elite",
      description: "Access to higher-tier events, invitations, and exclusive tools",
      accessLevel: 3,
      permissions: {
        publicEvents: true,
        privateEvents: true,
        eliteEvents: true,
        hosting: true,
        moderation: false
      },
      eventLimit: 30,
      customIdentifierAllowed: true
    },
    
    SUPER: {
      name: "Super",
      description: "Intermediate premium tier for curated experiences or limited-event access",
      accessLevel: 4,
      permissions: {
        publicEvents: true,
        privateEvents: true,
        eliteEvents: true,
        hosting: true,
        moderation: false
      },
      eventLimit: 25
    },
    
    // Exclusive / VIP
    ROYAL: {
      name: "Royal",
      description: "Full access to elite events, gatherings, and Web of Trust networking",
      accessLevel: 5,
      permissions: {
        publicEvents: true,
        privateEvents: true,
        eliteEvents: true,
        hosting: true,
        moderation: true
      },
      eventLimit: 50,
      customIdentifierAllowed: true
    },
    
    SCHOLAR: {
      name: "Scholar",
      description: "Access for verified experts, educators, or contributors",
      accessLevel: 5,
      permissions: {
        publicEvents: true,
        privateEvents: true,
        eliteEvents: true,
        hosting: true,
        moderation: true
      },
      eventLimit: 50,
      customIdentifierAllowed: true
    },
    
    // Anonymous / Privacy-Focused
    ANON: {
      name: "Anon",
      description: "Minimal traceable data, can receive invites only through Web of Trust",
      accessLevel: 0,
      permissions: {
        publicEvents: false,
        privateEvents: false,
        eliteEvents: false,
        hosting: false,
        moderation: false
      },
      eventLimit: 0,
      privacyFocused: true,
      customIdentifierAllowed: true,
      maxAnonEvents: 5
    }
  }

  // Hierarchy for feature access: Pro → Ultra → Ultra Elite → Super → Royal → Scholar
  static ACCESS_HIERARCHY = [
    "PRO", "ULTRA", "ULTRA_ELITE", "SUPER", "ROYAL", "SCHOLAR"
  ]

  // Create a new event
  async createEvent(userId, eventData) {
    try {
      // Validate user permissions
      const userAccountType = await this.getUserAccountType(userId)
      const accountConfig = EventAccessSystem.ACCOUNT_TYPES[userAccountType]
      
      if (!accountConfig.permissions.hosting) {
        throw new Error(`Account type ${userAccountType} does not have permission to host events`)
      }
      
      // Check event limit
      const userEvents = this.getUserEvents(userId)
      if (userEvents.length >= accountConfig.eventLimit) {
        throw new Error(`Event limit reached for account type ${userAccountType}`)
      }
      
      const eventId = this.generateEventId()
      const event = {
        id: eventId,
        creatorId: userId,
        creatorAccountType: userAccountType,
        creatorDisplayName: this.getUserDisplayName(userId, userAccountType, eventData.creatorHandle),
        title: eventData.title,
        description: eventData.description,
        type: eventData.type || "meetup", // meetup, party, cookout, etc.
        privacy: eventData.privacy || "private", // public, private, invite_only
        maxParticipants: eventData.maxParticipants || 10,
        participants: [{
          userId: userId,
          displayName: this.getUserDisplayName(userId, userAccountType, eventData.creatorHandle)
        }], // Creator is automatically a participant
        invitedUsers: [], // Users invited through Web of Trust
        createdAt: new Date().toISOString(),
        startsAt: eventData.startsAt,
        endsAt: eventData.endsAt,
        location: eventData.location || "Virtual",
        tags: eventData.tags || [],
        customIdentifierAllowed: accountConfig.customIdentifierAllowed || false
      }
      
      // Store event
      this.events.set(eventId, event)
      
      console.log(`Event created: ${event.title} by user ${userId}`)
      return event
    } catch (error) {
      throw new Error(`Failed to create event: ${error.message}`)
    }
  }

  // Invite users to event based on Web of Trust
  async inviteToEvent(eventId, inviterId, inviteeId) {
    try {
      const event = this.events.get(eventId)
      if (!event) {
        throw new Error("Event not found")
      }
      
      // Check if inviter is the event creator or already a participant
      if (event.creatorId !== inviterId && !event.participants.includes(inviterId)) {
        throw new Error("Only event creator or participants can invite others")
      }
      
      // Check Web of Trust connection
      const isConnected = await this.checkWebOfTrustConnection(inviterId, inviteeId)
      if (!isConnected) {
        throw new Error("Invitee is not in the inviter's Web of Trust network")
      }
      
      // Add to invited users if not already invited
      const inviteeAccountType = await this.getUserAccountType(inviteeId);
      const inviteeDisplayName = this.getUserDisplayName(inviteeId, inviteeAccountType);
      
      if (!event.invitedUsers.some(user => user.userId === inviteeId)) {
        event.invitedUsers.push({
          userId: inviteeId,
          displayName: inviteeDisplayName
        });
        console.log(`User ${inviteeId} (${inviteeDisplayName}) invited to event ${event.title} by ${inviterId}`);
      }
      
      return event
    } catch (error) {
      throw new Error(`Failed to invite user: ${error.message}`)
    }
  }

  // Accept event invitation
  async acceptEventInvitation(eventId, userId) {
    try {
      const event = this.events.get(eventId)
      if (!event) {
        throw new Error("Event not found")
      }
      
      // Check if user was invited
      if (!event.invitedUsers.some(user => user.userId === userId)) {
        throw new Error("User was not invited to this event")
      }
      
      // Check account type permissions
      const userAccountType = await this.getUserAccountType(userId)
      const accountConfig = EventAccessSystem.ACCOUNT_TYPES[userAccountType]
      
      // Validate event type permissions
      if (event.privacy === "elite" && !accountConfig.permissions.eliteEvents) {
        throw new Error(`Account type ${userAccountType} does not have permission to join elite events`)
      }
      
      if (event.privacy === "private" && !accountConfig.permissions.privateEvents) {
        throw new Error(`Account type ${userAccountType} does not have permission to join private events`)
      }
      
      // Check participant limit
      if (event.participants.length >= event.maxParticipants) {
        throw new Error("Event has reached maximum participants")
      }
      
      // Add user to participants
      const userAccountType = await this.getUserAccountType(userId);
      const userDisplayName = this.getUserDisplayName(userId, userAccountType);
      
      if (!event.participants.some(user => user.userId === userId)) {
        event.participants.push({
          userId: userId,
          displayName: userDisplayName
        });
        console.log(`User ${userId} (${userDisplayName}) joined event ${event.title}`);
      }
      
      return event
    } catch (error) {
      throw new Error(`Failed to accept invitation: ${error.message}`)
    }
  }

  // Check Web of Trust connection between two users
  async checkWebOfTrustConnection(userId1, userId2) {
    try {
      // Get trust network for user1
      const trustNetwork = await this.trustManager.getTrustNetwork(userId1)
      
      // Check if user2 is in the endorsers or mutual connections
      const isEndorser = trustNetwork.endorsers.some(e => e.userId === userId2)
      const isMutualConnection = trustNetwork.mutualConnections.includes(userId2)
      
      return isEndorser || isMutualConnection
    } catch (error) {
      console.error("Failed to check Web of Trust connection:", error)
      return false
    }
  }

  // Get events accessible to a user
  async getUserAccessibleEvents(userId) {
    try {
      const userAccountType = await this.getUserAccountType(userId)
      const accountConfig = EventAccessSystem.ACCOUNT_TYPES[userAccountType]
      
      const accessibleEvents = []
      
      // Iterate through all events
      for (const [eventId, event] of this.events.entries()) {
        // Public events are accessible to all account types with publicEvents permission
        if (event.privacy === "public" && accountConfig.permissions.publicEvents) {
          accessibleEvents.push(event)
          continue
        }
        
        // Private events require invitation or being the creator
        if (event.privacy === "private") {
          if (event.creatorId === userId || 
              event.participants.includes(userId) || 
              event.invitedUsers.includes(userId)) {
            accessibleEvents.push(event)
            continue
          }
          
          // Check account type permissions for private events
          if (accountConfig.permissions.privateEvents) {
            accessibleEvents.push(event)
            continue
          }
        }
        
        // Elite events require specific permissions
        if (event.privacy === "elite" && accountConfig.permissions.eliteEvents) {
          accessibleEvents.push(event)
          continue
        }
        
        // Check Web of Trust connections for invite-only events
        if (event.privacy === "invite_only") {
          const isConnected = await this.checkWebOfTrustConnection(event.creatorId, userId)
          if (isConnected) {
            accessibleEvents.push(event)
          }
        }
      }
      
      return accessibleEvents
    } catch (error) {
      throw new Error(`Failed to get accessible events: ${error.message}`)
    }
  }

  // Get user's own events (created or participating)
  getUserEvents(userId) {
    const userEvents = []
    
    for (const [eventId, event] of this.events.entries()) {
      const isCreator = event.creatorId === userId;
      const isParticipant = event.participants.some(user => user.userId === userId);
      const isInvited = event.invitedUsers.some(user => user.userId === userId);
      
      if (isCreator || isParticipant || isInvited) {
        userEvents.push(event);
      }
    }
    
    return userEvents
  }

  // Generate unique event ID
  generateEventId() {
    return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  // Mock function to get user account type (in real implementation, this would query the ProfileManager)
  async getUserAccountType(userId) {
    // This is a mock implementation - in real system, this would query ProfileManager
    // For demo purposes, we'll return a random account type
    const accountTypes = Object.keys(EventAccessSystem.ACCOUNT_TYPES)
    return accountTypes[Math.floor(Math.random() * accountTypes.length)]
  }

  // Get account type information
  getAccountTypeInfo(accountType) {
    return EventAccessSystem.ACCOUNT_TYPES[accountType] || null
  }

  // Get access hierarchy
  getAccessHierarchy() {
    return EventAccessSystem.ACCESS_HIERARCHY
  }

  // Check if account type has specific permission
  hasPermission(accountType, permission) {
    const config = EventAccessSystem.ACCOUNT_TYPES[accountType]
    return config && config.permissions[permission] || false
  }

  // Generate privacy handle for a user
  generatePrivacyHandle(userId, accountType, baseHandle = null) {
    // Check if user already has a privacy handle
    if (this.userPrivacyHandles.has(userId)) {
      return this.userPrivacyHandles.get(userId)
    }

    // For Anon and high-value accounts, generate crypto-style handles
    if (accountType === "ANON" || ["ROYAL", "SCHOLAR", "ULTRA_ELITE"].includes(accountType)) {
      // Generate crypto-style identifier
      const handle = this.generateCryptoStyleID(baseHandle || userId, accountType);
      this.userPrivacyHandles.set(userId, handle);
      return handle;
    }

    // For other accounts, use a masked version
    const handle = baseHandle || userId;
    const maskedHandle = `${handle.substring(0, 3)}***${handle.substring(handle.length - 2)}`;
    this.userPrivacyHandles.set(userId, maskedHandle);
    return maskedHandle;
  }

  // Generate crypto-style ID similar to the UltraTextGenerator
  generateCryptoStyleID(base, accountType) {
    // Create a hash of the base string
    const hash = this.cryptoUtils.hash(base + Date.now());
    
    // Take first 8 characters and make them uppercase
    const hashPart = hash.substring(0, 8).toUpperCase();
    
    // Add account type specific prefix
    switch (accountType) {
      case "ROYAL":
        return `ROYAL-${hashPart}`;
      case "SCHOLAR":
        return `SCHOLAR-${hashPart}`;
      case "ULTRA_ELITE":
        return `ELITE-${hashPart}`;
      case "ANON":
        return `ANON-${hashPart}`;
      default:
        // For Anon accounts, use BTC-style
        return `1${hashPart}${Math.random().toString(36).substr(2, 5)}`;
    }
  }

  // Get display name for a user (respects privacy settings)
  getUserDisplayName(userId, accountType, baseHandle = null) {
    // For Anon accounts, always use privacy handle
    if (accountType === "ANON") {
      return this.generatePrivacyHandle(userId, accountType, baseHandle);
    }

    // Check if user has a custom privacy handle
    if (this.userPrivacyHandles.has(userId)) {
      return this.userPrivacyHandles.get(userId);
    }

    // For high-value accounts, generate privacy handle if not exists
    if (["ROYAL", "SCHOLAR", "ULTRA_ELITE"].includes(accountType)) {
      return this.generatePrivacyHandle(userId, accountType, baseHandle);
    }

    // For other accounts, use base handle
    return baseHandle || userId;
  }
}

export default EventAccessSystem