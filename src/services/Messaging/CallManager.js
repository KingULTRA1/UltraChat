// WebRTC Call Manager for UltraChat
// Handles voice and video calls with end-to-end encryption

import { CALL_STATES, CALL_TYPES, WEBRTC_CONFIG, MESSAGE_TYPES } from '../../utils/Constants.js'

class CallManager {
  constructor(messageEngine, cryptoUtils) {
    this.messageEngine = messageEngine
    this.crypto = cryptoUtils
    
    // Call state
    this.currentCall = null
    this.callState = CALL_STATES.IDLE
    this.localStream = null
    this.remoteStream = null
    this.peerConnection = null
    
    // SMS and phone integration
    this.smsSupported = 'sms' in navigator || typeof window !== 'undefined'
    this.phoneSupported = typeof window !== 'undefined' && navigator.mediaDevices
    
    // Event handlers
    this.onCallStateChange = null
    this.onRemoteStream = null
    this.onLocalStream = null
    this.onCallError = null
    
    // Initialize WebRTC configuration
    this.rtcConfig = WEBRTC_CONFIG
    
    // Bind methods
    this.handleIncomingCall = this.handleIncomingCall.bind(this)
    this.handleCallResponse = this.handleCallResponse.bind(this)
    this.handleCallEnd = this.handleCallEnd.bind(this)
    this.handleIceCandidate = this.handleIceCandidate.bind(this)
  }

  // Initialize call manager
  async initialize() {
    try {
      // Register message handlers for call-related messages
      if (this.messageEngine) {
        this.messageEngine.onMessage(MESSAGE_TYPES.CALL_REQUEST, this.handleIncomingCall)
        this.messageEngine.onMessage(MESSAGE_TYPES.CALL_ACCEPT, this.handleCallResponse)
        this.messageEngine.onMessage(MESSAGE_TYPES.CALL_REJECT, this.handleCallResponse)
        this.messageEngine.onMessage(MESSAGE_TYPES.CALL_END, this.handleCallEnd)
      }
      
      return true
    } catch (error) {
      console.error('Failed to initialize CallManager:', error)
      return false
    }
  }

  // Check if SMS is supported
  isSMSSupported() {
    return this.smsSupported
  }

  // Check if phone calls are supported
  isPhoneSupported() {
    return this.phoneSupported
  }

  // Send SMS message
  async sendSMS(phoneNumber, message) {
    try {
      // Validate phone number
      if (!this.isValidPhoneNumber(phoneNumber)) {
        throw new Error('Invalid phone number format')
      }

      // In a real implementation, you would use a native API or service
      // For now, we'll simulate the SMS sending
      console.log(`📱 Sending SMS to ${phoneNumber}: ${message}`)
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
      
      // Simulate success/failure
      const success = Math.random() > 0.1 // 90% success rate
      
      if (success) {
        return {
          success: true,
          messageId: `sms_${Date.now()}`,
          timestamp: new Date().toISOString(),
          cost: 0.01 // Simulated cost
        }
      } else {
        throw new Error('SMS delivery failed')
      }
    } catch (error) {
      console.error('❌ SMS sending failed:', error)
      throw error
    }
  }

  // Make phone call
  async makePhoneCall(phoneNumber) {
    try {
      // Validate phone number
      if (!this.isValidPhoneNumber(phoneNumber)) {
        throw new Error('Invalid phone number format')
      }

      // In a real implementation, you would use a native API or service
      // For now, we'll simulate the phone call
      console.log(`📞 Making phone call to ${phoneNumber}`)
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))
      
      // Simulate success/failure
      const success = Math.random() > 0.05 // 95% success rate
      
      if (success) {
        return {
          success: true,
          callId: `call_${Date.now()}`,
          timestamp: new Date().toISOString(),
          duration: 0 // Will be updated when call ends
        }
      } else {
        throw new Error('Phone call failed')
      }
    } catch (error) {
      console.error('❌ Phone call failed:', error)
      throw error
    }
  }

  // Validate phone number format
  isValidPhoneNumber(phoneNumber) {
    // Basic validation for international format
    return /^\+?[1-9]\d{10,14}$/.test(phoneNumber.replace(/\s/g, ''))
  }

  // Start an outgoing call
  async startCall(contactId, callType = CALL_TYPES.VOICE) {
    try {
      if (this.callState !== CALL_STATES.IDLE) {
        throw new Error('Call already in progress')
      }

      this.currentCall = {
        contactId,
        callType,
        isOutgoing: true,
        startTime: new Date(),
        callId: this.generateCallId()
      }

      this.setCallState(CALL_STATES.CALLING)

      // Get user media
      const stream = await this.getUserMedia(callType)
      this.localStream = stream
      
      if (this.onLocalStream) {
        this.onLocalStream(stream)
      }

      // Create peer connection
      await this.createPeerConnection()
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, stream)
      })

      // Create offer
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === CALL_TYPES.VIDEO
      })
      
      await this.peerConnection.setLocalDescription(offer)

      // Send call request to contact
      const callMessage = {
        type: MESSAGE_TYPES.CALL_REQUEST,
        callId: this.currentCall.callId,
        callType,
        offer: offer,
        timestamp: new Date().toISOString()
      }

      await this.sendCallMessage(contactId, callMessage)
      
      // Set timeout for call response
      this.callTimeout = setTimeout(() => {
        this.endCall('No response')
      }, 30000) // 30 seconds timeout

      return this.currentCall.callId
      
    } catch (error) {
      console.error('Failed to start call:', error)
      this.handleCallError(error)
      throw error
    }
  }

  // Handle incoming call
  async handleIncomingCall(message) {
    try {
      if (this.callState !== CALL_STATES.IDLE) {
        // Send busy signal
        await this.sendCallMessage(message.senderId, {
          type: MESSAGE_TYPES.CALL_REJECT,
          callId: message.callId,
          reason: 'busy'
        })
        return
      }

      this.currentCall = {
        contactId: message.senderId,
        callType: message.callType,
        isOutgoing: false,
        callId: message.callId,
        offer: message.offer
      }

      this.setCallState(CALL_STATES.RINGING)

      // Notify UI about incoming call
      if (this.onCallStateChange) {
        this.onCallStateChange(this.callState, this.currentCall)
      }

    } catch (error) {
      console.error('Failed to handle incoming call:', error)
      this.handleCallError(error)
    }
  }

  // Accept an incoming call
  async acceptCall() {
    try {
      if (!this.currentCall || this.callState !== CALL_STATES.RINGING) {
        throw new Error('No incoming call to accept')
      }

      // Get user media
      const stream = await this.getUserMedia(this.currentCall.callType)
      this.localStream = stream
      
      if (this.onLocalStream) {
        this.onLocalStream(stream)
      }

      // Create peer connection
      await this.createPeerConnection()
      
      // Add local stream
      stream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, stream)
      })

      // Set remote description from offer
      await this.peerConnection.setRemoteDescription(this.currentCall.offer)

      // Create answer
      const answer = await this.peerConnection.createAnswer()
      await this.peerConnection.setLocalDescription(answer)

      // Send accept message with answer
      const acceptMessage = {
        type: MESSAGE_TYPES.CALL_ACCEPT,
        callId: this.currentCall.callId,
        answer: answer,
        timestamp: new Date().toISOString()
      }

      await this.sendCallMessage(this.currentCall.contactId, acceptMessage)
      
      this.setCallState(CALL_STATES.CONNECTED)

    } catch (error) {
      console.error('Failed to accept call:', error)
      this.handleCallError(error)
      throw error
    }
  }

  // Reject an incoming call
  async rejectCall(reason = 'declined') {
    try {
      if (!this.currentCall || this.callState !== CALL_STATES.RINGING) {
        throw new Error('No incoming call to reject')
      }

      const rejectMessage = {
        type: MESSAGE_TYPES.CALL_REJECT,
        callId: this.currentCall.callId,
        reason,
        timestamp: new Date().toISOString()
      }

      await this.sendCallMessage(this.currentCall.contactId, rejectMessage)
      
      this.cleanup()

    } catch (error) {
      console.error('Failed to reject call:', error)
      this.handleCallError(error)
    }
  }

  // Handle call response (accept/reject)
  async handleCallResponse(message) {
    try {
      if (!this.currentCall || message.callId !== this.currentCall.callId) {
        return // Not our call
      }

      if (this.callTimeout) {
        clearTimeout(this.callTimeout)
        this.callTimeout = null
      }

      if (message.type === MESSAGE_TYPES.CALL_ACCEPT) {
        // Set remote description from answer
        await this.peerConnection.setRemoteDescription(message.answer)
        this.setCallState(CALL_STATES.CONNECTED)
        
      } else if (message.type === MESSAGE_TYPES.CALL_REJECT) {
        this.endCall(message.reason || 'Call rejected')
      }

    } catch (error) {
      console.error('Failed to handle call response:', error)
      this.handleCallError(error)
    }
  }

  // End current call
  async endCall(reason = 'User ended call') {
    try {
      if (this.currentCall) {
        // Send end call message
        const endMessage = {
          type: MESSAGE_TYPES.CALL_END,
          callId: this.currentCall.callId,
          reason,
          timestamp: new Date().toISOString()
        }

        await this.sendCallMessage(this.currentCall.contactId, endMessage)
      }

      this.cleanup()

    } catch (error) {
      console.error('Failed to end call:', error)
      this.cleanup() // Cleanup anyway
    }
  }

  // Handle call end
  handleCallEnd(message) {
    if (this.currentCall && message.callId === this.currentCall.callId) {
      this.cleanup()
    }
  }

  // Toggle video during call
  async toggleVideo() {
    try {
      if (!this.localStream) return false

      const videoTrack = this.localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        return videoTrack.enabled
      }

      return false
    } catch (error) {
      console.error('Failed to toggle video:', error)
      return false
    }
  }

  // Toggle audio during call
  async toggleAudio() {
    try {
      if (!this.localStream) return false

      const audioTrack = this.localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        return audioTrack.enabled
      }

      return false
    } catch (error) {
      console.error('Failed to toggle audio:', error)
      return false
    }
  }

  // Private methods

  // Get user media based on call type
  async getUserMedia(callType) {
    const constraints = {
      audio: true,
      video: callType === CALL_TYPES.VIDEO ? {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      } : false
    }

    return await navigator.mediaDevices.getUserMedia(constraints)
  }

  // Create WebRTC peer connection
  async createPeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.rtcConfig)

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0]
      if (this.onRemoteStream) {
        this.onRemoteStream(this.remoteStream)
      }
    }

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.handleIceCandidate(event.candidate)
      }
    }

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection.connectionState
      console.log('Connection state:', state)
      
      if (state === 'failed' || state === 'disconnected' || state === 'closed') {
        this.endCall('Connection failed')
      }
    }
  }

  // Handle ICE candidate
  async handleIceCandidate(candidate) {
    try {
      if (this.currentCall) {
        // In a real implementation, you would send this through your signaling server
        // For now, we'll use the message system
        const candidateMessage = {
          type: 'ice_candidate',
          callId: this.currentCall.callId,
          candidate: candidate,
          timestamp: new Date().toISOString()
        }

        await this.sendCallMessage(this.currentCall.contactId, candidateMessage)
      }
    } catch (error) {
      console.error('Failed to handle ICE candidate:', error)
    }
  }

  // Send call-related message
  async sendCallMessage(contactId, message) {
    if (this.messageEngine) {
      return await this.messageEngine.sendMessage(contactId, message)
    } else {
      console.warn('No message engine available for call signaling')
    }
  }

  // Set call state and notify listeners
  setCallState(newState) {
    const oldState = this.callState
    this.callState = newState
    
    console.log(`Call state changed: ${oldState} -> ${newState}`)
    
    if (this.onCallStateChange) {
      this.onCallStateChange(newState, this.currentCall)
    }
  }

  // Handle call errors
  handleCallError(error) {
    console.error('Call error:', error)
    
    if (this.onCallError) {
      this.onCallError(error)
    }
    
    this.cleanup()
  }

  // Cleanup call resources
  cleanup() {
    // Clear timeout
    if (this.callTimeout) {
      clearTimeout(this.callTimeout)
      this.callTimeout = null
    }

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }

    // Reset state
    this.remoteStream = null
    this.currentCall = null
    this.setCallState(CALL_STATES.IDLE)
  }

  // Generate unique call ID
  generateCallId() {
    return 'call_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  // Get current call info
  getCurrentCall() {
    return this.currentCall
  }

  // Get current call state
  getCallState() {
    return this.callState
  }

  // Check if media devices are available
  async checkMediaDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      
      return {
        hasAudioInput: devices.some(device => device.kind === 'audioinput'),
        hasVideoInput: devices.some(device => device.kind === 'videoinput'),
        hasAudioOutput: devices.some(device => device.kind === 'audiooutput')
      }
    } catch (error) {
      console.error('Failed to check media devices:', error)
      return {
        hasAudioInput: false,
        hasVideoInput: false,
        hasAudioOutput: false
      }
    }
  }
}

export default CallManager