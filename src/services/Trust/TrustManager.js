// Trust Manager - Web of Trust System
// Handles endorsements, trust calculations, and verification

import CryptoUtils from '../../utils/CryptoUtils.js';
import LocalStorage from '../../utils/LocalStorage.js';
import * as Constants from '../../utils/Constants.js';

class TrustManager {
  constructor() {
    this.signingKey = null;
    this.publicKey = null;
    this.privateKey = null;
    this.isInitialized = false;
    this.endorsements = new Map();
    this.trustScores = new Map();
  }

  async initialize() {
    try {
      console.log('TrustManager: Starting initialization');
      
      // Check if we have stored keys
      const storedSigningKey = await LocalStorage.getItem('signingKey');
      const storedPublicKey = await LocalStorage.getItem('publicKey');
      const storedPrivateKey = await LocalStorage.getItem('privateKey');
      
      console.log('TrustManager: Checking for stored keys');
      
      if (storedSigningKey && storedPublicKey && storedPrivateKey) {
        console.log('TrustManager: Found stored keys, importing them');
        try {
          // Import existing keys
          this.signingKey = await crypto.subtle.importKey(
            'jwk',
            storedSigningKey,
            { name: 'ECDSA', namedCurve: 'P-256' },
            true,
            ['sign']
          );
          
          this.publicKey = await crypto.subtle.importKey(
            'jwk',
            storedPublicKey,
            { name: 'ECDSA', namedCurve: 'P-256' },
            true,
            ['verify']
          );
          
          this.privateKey = await crypto.subtle.importKey(
            'jwk',
            storedPrivateKey,
            { name: 'ECDSA', namedCurve: 'P-256' },
            true,
            ['sign']
          );
          
          console.log('TrustManager: Successfully imported stored keys');
        } catch (importError) {
          console.warn('TrustManager: Failed to import stored keys, generating new ones:', importError);
          await this.generateNewKeys();
        }
      } else {
        console.log('TrustManager: No stored keys found, generating new ones');
        // Generate new keys if none exist
        await this.generateNewKeys();
      }
      
      // Load endorsements and trust scores
      console.log('TrustManager: Loading endorsements and trust scores');
      try {
        const storedEndorsements = await LocalStorage.getItem('endorsements');
        const storedTrustScores = await LocalStorage.getItem('trustScores');
        
        if (storedEndorsements) {
          this.endorsements = new Map(Object.entries(storedEndorsements));
          console.log('TrustManager: Loaded endorsements:', this.endorsements.size);
        }
        
        if (storedTrustScores) {
          this.trustScores = new Map(Object.entries(storedTrustScores));
          console.log('TrustManager: Loaded trust scores:', this.trustScores.size);
        }
      } catch (loadError) {
        console.warn('TrustManager: Warning loading endorsements/trust scores:', loadError);
      }
      
      this.isInitialized = true;
      console.log('TrustManager: Initialization completed successfully');
    } catch (error) {
      console.error('TrustManager: Initialization error:', error);
      console.error('TrustManager: Error stack:', error.stack);
      
      // Even if initialization fails, we'll mark as initialized to prevent blocking the app
      this.isInitialized = true;
      console.log('TrustManager: Marking as initialized despite errors to prevent app blocking');
    }
  }

  async generateNewKeys() {
    try {
      const keyPair = await crypto.subtle.generateKey(
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['sign', 'verify']
      );
      
      this.signingKey = keyPair.privateKey;
      this.publicKey = keyPair.publicKey;
      
      // Export and store keys
      const signingKeyJwk = await crypto.subtle.exportKey('jwk', this.signingKey);
      const publicKeyJwk = await crypto.subtle.exportKey('jwk', this.publicKey);
      const privateKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
      
      await LocalStorage.setItem('signingKey', signingKeyJwk);
      await LocalStorage.setItem('publicKey', publicKeyJwk);
      await LocalStorage.setItem('privateKey', privateKeyJwk);
      
      console.log('TrustManager: Successfully generated and stored new keys');
    } catch (keyError) {
      console.error('TrustManager: Failed to generate new keys:', keyError);
      throw keyError;
    }
  }

  async createEndorsement(targetUserId, trustLevel, comment = '') {
    if (!this.isInitialized || !this.signingKey) {
      console.warn('TrustManager: Not initialized or missing signing key');
      throw new Error('TrustManager not properly initialized');
    }
    
    try {
      const endorsement = {
        endorser: 'current_user', // This would be the current user's ID in a real implementation
        target: targetUserId,
        trustLevel,
        comment,
        timestamp: Date.now()
      };
      
      // Create a signature for the endorsement
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(endorsement));
      const signature = await crypto.subtle.sign(
        { name: 'ECDSA', hash: { name: 'SHA-256' } },
        this.signingKey,
        data
      );
      
      
      const fullEndorsement = {
        ...endorsement,
        signature: Array.from(new Uint8Array(signature))
      };
      
      // Store the endorsement
      this.endorsements.set(targetUserId, fullEndorsement);
      await LocalStorage.setItem('endorsements', Object.fromEntries(this.endorsements));
      
      // Update trust score
      this.updateTrustScore(targetUserId, trustLevel);
      
      return fullEndorsement;
    } catch (error) {
      console.error('TrustManager: Error creating endorsement:', error);
      throw error;
    }
  }

  updateTrustScore(userId, trustLevel) {
    try {
      let currentScore = this.trustScores.get(userId) || 0;
      
      // Simple trust scoring algorithm
      switch (trustLevel) {
        case 'high':
          currentScore += 10;
          break;
        case 'medium':
          currentScore += 5;
          break;
        case 'low':
          currentScore += 1;
          break;
        default:
          break;
      }
      
      this.trustScores.set(userId, currentScore);
      LocalStorage.setItem('trustScores', Object.fromEntries(this.trustScores));
      
      return currentScore;
    } catch (error) {
      console.error('TrustManager: Error updating trust score:', error);
    }
  }

  getTrustScore(userId) {
    return this.trustScores.get(userId) || 0;
  }

  getEndorsement(userId) {
    return this.endorsements.get(userId);
  }

  getAllEndorsements() {
    return Array.from(this.endorsements.values());
  }

  async verifyEndorsement(endorsement) {
    if (!this.publicKey) {
      throw new Error('Public key not available');
    }
    
    try {
      const { signature, ...endorsementData } = endorsement;
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(endorsementData));
      
      const isValid = await crypto.subtle.verify(
        { name: 'ECDSA', hash: { name: 'SHA-256' } },
        this.publicKey,
        new Uint8Array(signature),
        data
      );
      
      return isValid;
    } catch (error) {
      console.error('TrustManager: Error verifying endorsement:', error);
      return false;
    }
  }
}

// Export singleton instance
export default new TrustManager();