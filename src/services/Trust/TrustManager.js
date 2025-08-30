// Trust Manager - Web of Trust System
// Handles endorsements, trust calculations, and verification

import LocalStorage from '../../utils/LocalStorage.js'
import CryptoUtils from '../../utils/CryptoUtils.js'
import { TRUST_LEVELS, PROFILE_MODES } from '../../utils/Constants.js'

class TrustManager {
  constructor() {
    this.storage = new LocalStorage()
    this.crypto = new CryptoUtils()
    this.initialized = false
  }

  // Initialize trust system
  async initialize() {
    try {
      await this.storage.initialize()
      this.initialized = true
      return true
    } catch (error) {
      console.error('Trust manager initialization failed:', error)
      return false
    }
  }

  // Create an endorsement
  async createEndorsement(endorseeId, endorsementData) {
    if (!this.initialized) await this.initialize()

    try {
      const endorsement = {
        id: this.crypto.generateUUID(),
        endorseeId,
        endorserId: await this.getCurrentUserId(),
        message: endorsementData.message || '',
        trustScore: endorsementData.trustScore || 50,
        categories: endorsementData.categories || ['general'],
        timestamp: new Date().toISOString(),
        expires: endorsementData.expires || null,
        signature: null
      }

      // Sign the endorsement for verification
      endorsement.signature = await this.signEndorsement(endorsement)

      // Store locally
      await this.storeEndorsement(endorsement)

      return endorsement
    } catch (error) {
      throw new Error(`Failed to create endorsement: ${error.message}`)
    }
  }

  // Sign an endorsement
  async signEndorsement(endorsement) {
    try {
      const dataToSign = {
        endorseeId: endorsement.endorseeId,
        endorserId: endorsement.endorserId,
        message: endorsement.message,
        trustScore: endorsement.trustScore,
        timestamp: endorsement.timestamp
      }

      return await this.crypto.sign(JSON.stringify(dataToSign))
    } catch (error) {
      throw new Error(`Failed to sign endorsement: ${error.message}`)
    }
  }

  // Verify an endorsement signature
  async verifyEndorsement(endorsement, publicKey) {
    try {
      const dataToVerify = {
        endorseeId: endorsement.endorseeId,
        endorserId: endorsement.endorserId,
        message: endorsement.message,
        trustScore: endorsement.trustScore,
        timestamp: endorsement.timestamp
      }

      return await this.crypto.verify(
        JSON.stringify(dataToVerify),
        endorsement.signature,
        publicKey
      )
    } catch (error) {
      console.error('Endorsement verification failed:', error)
      return false
    }
  }

  // Store endorsement locally
  async storeEndorsement(endorsement) {
    const endorsements = await this.storage.retrieve('endorsements', [])
    endorsements.push(endorsement)

    // Keep only recent endorsements (last 100)
    if (endorsements.length > 100) {
      endorsements.splice(0, endorsements.length - 100)
    }

    await this.storage.store('endorsements', endorsements)
  }

  // Get endorsements for a user
  async getEndorsements(userId = null) {
    const endorsements = await this.storage.retrieve('endorsements', [])
    
    if (!userId) {
      return endorsements
    }

    return endorsements.filter(e => e.endorseeId === userId || e.endorserId === userId)
  }

  // Calculate trust score for a user
  async calculateTrustScore(userId) {
    try {
      const endorsements = await this.getEndorsements(userId)
      const receivedEndorsements = endorsements.filter(e => e.endorseeId === userId)

      if (receivedEndorsements.length === 0) {
        return {
          score: 0,
          level: 'UNKNOWN',
          endorsementCount: 0,
          lastUpdated: new Date().toISOString()
        }
      }

      // Calculate weighted average
      let totalWeight = 0
      let weightedSum = 0

      for (const endorsement of receivedEndorsements) {
        // Check if endorsement is still valid
        if (this.isEndorsementValid(endorsement)) {
          const weight = this.calculateEndorsementWeight(endorsement)
          totalWeight += weight
          weightedSum += endorsement.trustScore * weight
        }
      }

      const averageScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0
      const trustLevel = this.getTrustLevel(averageScore)

      return {
        score: averageScore,
        level: trustLevel,
        endorsementCount: receivedEndorsements.length,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Trust score calculation failed:', error)
      return {
        score: 0,
        level: 'UNKNOWN',
        endorsementCount: 0,
        lastUpdated: new Date().toISOString(),
        error: error.message
      }
    }
  }

  // Check if endorsement is still valid
  isEndorsementValid(endorsement) {
    // Check expiration
    if (endorsement.expires && new Date(endorsement.expires) < new Date()) {
      return false
    }

    // Check age (endorsements older than 1 year are less reliable)
    const age = Date.now() - new Date(endorsement.timestamp).getTime()
    const oneYear = 365 * 24 * 60 * 60 * 1000
    
    return age < oneYear
  }

  // Calculate weight of an endorsement
  calculateEndorsementWeight(endorsement) {
    let weight = 1.0

    // Recent endorsements have more weight
    const age = Date.now() - new Date(endorsement.timestamp).getTime()
    const sixMonths = 180 * 24 * 60 * 60 * 1000
    
    if (age < sixMonths) {
      weight *= 1.2 // 20% boost for recent endorsements
    }

    // Length and detail of message affects weight
    if (endorsement.message && endorsement.message.length > 50) {
      weight *= 1.1 // 10% boost for detailed endorsements
    }

    return weight
  }

  // Get trust level from score
  getTrustLevel(score) {
    if (score >= TRUST_LEVELS.MAXIMUM) return 'MAXIMUM'
    if (score >= TRUST_LEVELS.VERIFIED) return 'VERIFIED'
    if (score >= TRUST_LEVELS.HIGH) return 'HIGH'
    if (score >= TRUST_LEVELS.MEDIUM) return 'MEDIUM'
    if (score >= TRUST_LEVELS.LOW) return 'LOW'
    return 'UNKNOWN'
  }

  // Request endorsement from another user
  async requestEndorsement(targetUserId, message = '') {
    if (!this.initialized) await this.initialize()

    try {
      const request = {
        id: this.crypto.generateUUID(),
        requesterId: await this.getCurrentUserId(),
        targetUserId,
        message,
        timestamp: new Date().toISOString(),
        status: 'pending'
      }

      // Store request locally
      const requests = await this.storage.retrieve('endorsement_requests', [])
      requests.push(request)
      await this.storage.store('endorsement_requests', requests)

      return request
    } catch (error) {
      throw new Error(`Failed to request endorsement: ${error.message}`)
    }
  }

  // Get endorsement requests
  async getEndorsementRequests() {
    return await this.storage.retrieve('endorsement_requests', [])
  }

  // Verify user identity (for Ultra mode)
  async verifyUserIdentity(userId, verificationMethod, proof) {
    try {
      const verification = {
        id: this.crypto.generateUUID(),
        userId,
        method: verificationMethod,
        proof,
        timestamp: new Date().toISOString(),
        verified: false,
        verifiedBy: 'system'
      }

      // Simulate verification process
      switch (verificationMethod) {
        case 'tweet':
          verification.verified = await this.verifyTwitterPost(proof)
          break
        case 'repo':
          verification.verified = await this.verifyGitHubRepo(proof)
          break
        case 'signature':
          verification.verified = await this.verifyDigitalSignature(proof)
          break
        default:
          verification.verified = false
      }

      // Store verification result
      const verifications = await this.storage.retrieve('verifications', [])
      verifications.push(verification)
      await this.storage.store('verifications', verifications)

      return verification
    } catch (error) {
      throw new Error(`Verification failed: ${error.message}`)
    }
  }

  // Simulate Twitter verification
  async verifyTwitterPost(proof) {
    // In a real implementation, this would check Twitter API
    return proof && proof.includes('ultrachat') && proof.includes('verification')
  }

  // Simulate GitHub verification
  async verifyGitHubRepo(proof) {
    // In a real implementation, this would check GitHub API
    return proof && proof.includes('github.com') && proof.includes('ultrachat')
  }

  // Verify digital signature
  async verifyDigitalSignature(proof) {
    try {
      return await this.crypto.verify(proof.message, proof.signature, proof.publicKey)
    } catch (error) {
      return false
    }
  }

  // Get current user ID
  async getCurrentUserId() {
    const userData = await this.storage.retrieve('user_data_local', {})
    return userData.userId || 'anonymous'
  }

  // Get trust network for a user
  async getTrustNetwork(userId) {
    const endorsements = await this.getEndorsements(userId)
    
    const network = {
      userId,
      endorsers: [],
      endorsed: [],
      mutualConnections: []
    }

    // Build network graph
    endorsements.forEach(endorsement => {
      if (endorsement.endorseeId === userId) {
        network.endorsers.push({
          userId: endorsement.endorserId,
          trustScore: endorsement.trustScore,
          timestamp: endorsement.timestamp
        })
      } else if (endorsement.endorserId === userId) {
        network.endorsed.push({
          userId: endorsement.endorseeId,
          trustScore: endorsement.trustScore,
          timestamp: endorsement.timestamp
        })
      }
    })

    // Find mutual connections
    const endorserIds = network.endorsers.map(e => e.userId)
    const endorsedIds = network.endorsed.map(e => e.userId)
    network.mutualConnections = endorserIds.filter(id => endorsedIds.includes(id))

    return network
  }

  // Export trust data (for backup)
  async exportTrustData() {
    return {
      endorsements: await this.storage.retrieve('endorsements', []),
      requests: await this.storage.retrieve('endorsement_requests', []),
      verifications: await this.storage.retrieve('verifications', []),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
  }

  // Import trust data (from backup)
  async importTrustData(trustData) {
    try {
      if (trustData.endorsements) {
        await this.storage.store('endorsements', trustData.endorsements)
      }
      if (trustData.requests) {
        await this.storage.store('endorsement_requests', trustData.requests)
      }
      if (trustData.verifications) {
        await this.storage.store('verifications', trustData.verifications)
      }
      return true
    } catch (error) {
      throw new Error(`Trust data import failed: ${error.message}`)
    }
  }

  // Clean up old data
  async cleanupOldData() {
    try {
      const cutoffDate = new Date()
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 2) // 2 years

      // Clean endorsements
      const endorsements = await this.storage.retrieve('endorsements', [])
      const validEndorsements = endorsements.filter(e => 
        new Date(e.timestamp) > cutoffDate
      )
      await this.storage.store('endorsements', validEndorsements)

      // Clean requests
      const requests = await this.storage.retrieve('endorsement_requests', [])
      const validRequests = requests.filter(r => 
        new Date(r.timestamp) > cutoffDate
      )
      await this.storage.store('endorsement_requests', validRequests)

      return {
        endorsementsRemoved: endorsements.length - validEndorsements.length,
        requestsRemoved: requests.length - validRequests.length
      }
    } catch (error) {
      throw new Error(`Cleanup failed: ${error.message}`)
    }
  }
}

export default TrustManager