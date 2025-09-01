// 🚀 UltraChat v1.2.3.4 Final - Multi-Mode Live Communication Interface
// PRIVACY FIRST - Real-time communication with PTT, Video Rooms, Text Overlay

import { useState, useEffect, useRef } from 'react'
import PTTManager from '../../services/Communication/PTTManager'
import VideoRoomManager from '../../services/Communication/VideoRoomManager'
import RealTimeManager from '../../services/Communication/RealTimeManager'
import QRJoinManager from '../../services/Communication/QRJoinManager'
import UltraTextGenerator from '../../services/Communication/UltraTextGenerator'
import RealTimeModerationService from '../../services/Moderation/RealTimeModerationService'
import './LiveCommunicationInterface.css'

const COMMUNICATION_MODES = {
  TEXT: 'text',
  VOICE: 'voice', 
  VIDEO: 'video',
  PTT: 'ptt',
  HYBRID: 'hybrid'
}

const LiveCommunicationInterface = ({ selectedChat, currentUser, onModeChange }) => {
  // Core communication state
  const [currentMode, setCurrentMode] = useState(COMMUNICATION_MODES.TEXT)
  const [isConnected, setIsConnected] = useState(false)
  const [activeRoom, setActiveRoom] = useState(null)
  const [participants, setParticipants] = useState([])
  
  // Service managers
  const [realTimeManager, setRealTimeManager] = useState(null)
  const [pttManager, setPttManager] = useState(null)
  const [videoManager, setVideoManager] = useState(null)
  const [qrManager, setQrManager] = useState(null)
  const [textGenerator, setTextGenerator] = useState(null)
  
  // PTT state
  const [isPTTActive, setIsPTTActive] = useState(false)
  const [pttKeyPressed, setPttKeyPressed] = useState(false)
  const [voiceLevel, setVoiceLevel] = useState(0)
  
  // Video state
  const [videoEnabled, setVideoEnabled] = useState(false)
  const [screenSharing, setScreenSharing] = useState(false)
  
  // Text overlay state
  const [showTextOverlay, setShowTextOverlay] = useState(false)
  const [overlayMessages, setOverlayMessages] = useState([])
  const [quickMessage, setQuickMessage] = useState('')
  
  // QR Join state
  const [showQRJoin, setShowQRJoin] = useState(false)
  const [roomQRCode, setRoomQRCode] = useState(null)
  
  // UI state
  const [showModeSelector, setShowModeSelector] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [latency, setLatency] = useState(0)
  
  const videoRef = useRef(null)

  // Initialize communication services
  useEffect(() => {
    initializeCommunicationServices()
    
    return () => {
      cleanup()
    }
  }, [cleanup])

  // Handle chat selection changes
  useEffect(() => {
    if (selectedChat && realTimeManager) {
      handleChatChange()
    }
  }, [selectedChat, realTimeManager, handleChatChange])

  const initializeCommunicationServices = async () => {
    try {
      console.log('🚀 Initializing Live Communication Services...')
      
      // Initialize Real-Time Manager (central hub)
      const rtManager = new RealTimeManager()
      await rtManager.initialize()
      setRealTimeManager(rtManager)
      
      // Initialize PTT Manager
      const ptt = new PTTManager()
      await ptt.initialize()
      setPttManager(ptt)
      
      // Initialize Video Room Manager
      const video = new VideoRoomManager()
      await video.initialize()
      setVideoManager(video)
      
      // Initialize QR Join Manager
      const qr = new QRJoinManager()
      await qr.initialize()
      setQrManager(qr)
      
      // Initialize Ultra Text Generator
      const textGen = new UltraTextGenerator()
      await textGen.initialize()
      setTextGenerator(textGen)
      
      // Initialize real-time moderation
      const realTimeModeration = new RealTimeModerationService()
      await realTimeModeration.initialize()
      setRealTimeModerationService(realTimeModeration)
      
      // Set up event listeners
      setupEventListeners(rtManager, ptt, video)
      
      console.log('✅ Live Communication Services initialized successfully')
      
    } catch (error) {
      console.error('❌ Failed to initialize communication services:', error)
    }
  }

  const setupEventListeners = (rtManager, ptt, video) => {
    // Real-time events
    rtManager.on('roomJoined', handleRoomJoined)
    rtManager.on('participantJoined', handleParticipantJoined)
    rtManager.on('participantLeft', handleParticipantLeft)
    rtManager.on('connectionStatusChanged', setConnectionStatus)
    rtManager.on('latencyUpdate', setLatency)
    
    // PTT events
    ptt.on('transmissionStarted', () => setIsPTTActive(true))
    ptt.on('transmissionEnded', () => setIsPTTActive(false))
    ptt.on('voiceLevelUpdate', setVoiceLevel)
    
    // Video events
    video.on('videoEnabled', () => setVideoEnabled(true))
    video.on('videoDisabled', () => setVideoEnabled(false))
    video.on('screenShareStarted', () => setScreenSharing(true))
    video.on('screenShareStopped', () => setScreenSharing(false))
    
    // Keyboard listeners for PTT
    setupPTTKeyListeners(ptt)
  }

  const setupPTTKeyListeners = (ptt) => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && currentMode === COMMUNICATION_MODES.PTT && !pttKeyPressed) {
        e.preventDefault()
        
        // Emit PTT activated event for moderation
        window.dispatchEvent(new CustomEvent('pttActivated', {
          detail: {
            user: currentUser,
            room: activeRoom
          }
        }))
        
        setPttKeyPressed(true)
        ptt.startTransmission(selectedChat?.id, currentUser?.id)
      }
    }
    
    const handleKeyUp = (e) => {
      if (e.code === 'Space' && currentMode === COMMUNICATION_MODES.PTT && pttKeyPressed) {
        e.preventDefault()
        setPttKeyPressed(false)
        ptt.stopTransmission()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }

  const handleChatChange = async () => {
    try {
      // Leave current room if any
      if (activeRoom) {
        await realTimeManager.leaveRoom(activeRoom.id)
      }
      
      // Create or join room for selected chat
      const roomOptions = {
        chatId: selectedChat.id,
        mode: currentMode,
        privacy: 'private',
        encryption: true
      }
      
      const room = await realTimeManager.createRoom(roomOptions)
      setActiveRoom(room)
      
      // Generate QR code for room joining
      if (qrManager) {
        const qrCode = await qrManager.generateRoomQR(room.id, {
          style: 'modern',
          includeRoomInfo: true
        })
        setRoomQRCode(qrCode)
      }
      
    } catch (error) {
      console.error('Failed to handle chat change:', error)
    }
  }

  const switchCommunicationMode = async (newMode) => {
    if (newMode === currentMode) return
    
    try {
      // Cleanup current mode
      await cleanupCurrentMode()
      
      // Initialize new mode
      await initializeMode(newMode)
      
      setCurrentMode(newMode)
      onModeChange?.(newMode)
      
    } catch (error) {
      console.error('Failed to switch communication mode:', error)
    }
  }

  const cleanupCurrentMode = async () => {
    switch (currentMode) {
      case COMMUNICATION_MODES.PTT:
        if (pttManager && isPTTActive) {
          await pttManager.stopTransmission()
        }
        break
      case COMMUNICATION_MODES.VIDEO:
        if (videoManager && videoEnabled) {
          await videoManager.disableVideo()
        }
        break
      case COMMUNICATION_MODES.VOICE:
        if (videoManager && audioEnabled) {
          await videoManager.disableAudio()
        }
        break
    }
  }

  const initializeMode = async (mode) => {
    switch (mode) {
      case COMMUNICATION_MODES.PTT:
        if (pttManager && activeRoom) {
          await pttManager.joinChannel(activeRoom.id, currentUser?.id)
        }
        break
      case COMMUNICATION_MODES.VIDEO:
        if (videoManager && activeRoom) {
          await videoManager.joinVideoRoom(activeRoom.id, {
            video: true,
            audio: true,
            quality: videoQuality
          })
        }
        break
      case COMMUNICATION_MODES.VOICE:
        if (videoManager && activeRoom) {
          await videoManager.joinVideoRoom(activeRoom.id, {
            video: false,
            audio: true
          })
        }
        break
      case COMMUNICATION_MODES.HYBRID:
        // Enable multiple modes simultaneously
        setShowTextOverlay(true)
        if (pttManager && activeRoom) {
          await pttManager.joinChannel(activeRoom.id, currentUser?.id)
        }
        break
    }
  }

  // Event handlers
  const handleRoomJoined = (room) => {
    setActiveRoom(room)
    setIsConnected(true)
    console.log('✅ Joined room:', room.id)
  }

  const handleParticipantJoined = (participant) => {
    setParticipants(prev => [...prev, participant])
    console.log('👥 Participant joined:', participant.name)
  }

  const handleParticipantLeft = (participantId) => {
    setParticipants(prev => prev.filter(p => p.id !== participantId))
    console.log('👋 Participant left:', participantId)
  }

  const handleToggleVideo = async () => {
    if (!videoManager || !activeRoom) return
    
    try {
      // Emit video call started event for moderation
      if (!videoEnabled) {
        window.dispatchEvent(new CustomEvent('videoCallStarted', {
          detail: {
            call: {
              id: activeRoom.id,
              type: 'video',
              room: activeRoom
            },
            participants: [currentUser, ...participants]
          }
        }))
      }
      
      if (videoEnabled) {
        await videoManager.disableVideo()
      } else {
        await videoManager.enableVideo(videoRef.current)
      }
    } catch (error) {
      console.error('Failed to toggle video:', error)
    }
  }

  const handleToggleAudio = async () => {
    if (!videoManager || !activeRoom) return
    
    try {
      // Emit voice call started event for moderation
      if (!audioEnabled) {
        window.dispatchEvent(new CustomEvent('voiceCallStarted', {
          detail: {
            call: {
              id: activeRoom.id,
              type: 'voice',
              room: activeRoom
            },
            participants: [currentUser, ...participants]
          }
        }))
      }
      
      if (audioEnabled) {
        await videoManager.disableAudio()
      } else {
        await videoManager.enableAudio()
      }
    } catch (error) {
      console.error('Failed to toggle audio:', error)
    }
  }

  const handleStartScreenShare = async () => {
    if (!videoManager || !activeRoom) return
    
    try {
      await videoManager.startScreenShare()
    } catch (error) {
      console.error('Failed to start screen share:', error)
    }
  }

  const handleSendQuickMessage = async () => {
    if (!quickMessage.trim() || !textGenerator) return
    
    try {
      const formattedMessage = await textGenerator.applyFormatting(
        quickMessage,
        'overlay',
        { timestamp: true, sender: currentUser?.name }
      )
      
      setOverlayMessages(prev => [...prev, {
        id: Date.now(),
        content: formattedMessage,
        sender: currentUser?.name,
        timestamp: new Date()
      }])
      
      setQuickMessage('')
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setOverlayMessages(prev => prev.slice(1))
      }, 5000)
      
    } catch (error) {
      console.error('Failed to send quick message:', error)
    }
  }

  const handleJoinViaQR = async () => {
    if (!qrManager) return
    
    try {
      setShowQRJoin(true)
    } catch (error) {
      console.error('Failed to show QR join:', error)
    }
  }

  const cleanup = () => {
    if (pttManager) pttManager.destroy()
    if (videoManager) videoManager.destroy()
    if (realTimeManager) realTimeManager.destroy()
    if (qrManager) qrManager.destroy()
    if (textGenerator) textGenerator.destroy()
  }

  if (!selectedChat) {
    return (
      <div className="live-communication-placeholder">
        <div className="placeholder-content">
          <h3>🚀 UltraChat Live Communication</h3>
          <p>Select a chat to start real-time communication</p>
          <div className="feature-grid">
            <div className="feature-card">
              <span className="feature-icon">🎙️</span>
              <span>Push-to-Talk</span>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📹</span>
              <span>Video Rooms</span>
            </div>
            <div className="feature-card">
              <span className="feature-icon">💬</span>
              <span>Text Overlay</span>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📱</span>
              <span>QR Join</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="live-communication-interface">
      {/* Mode Selector */}
      <div className="communication-controls">
        <div className="mode-selector">
          {Object.values(COMMUNICATION_MODES).map(mode => (
            <button
              key={mode}
              className={`mode-btn ${currentMode === mode ? 'active' : ''}`}
              onClick={() => switchCommunicationMode(mode)}
            >
              {mode === COMMUNICATION_MODES.TEXT && '💬'}
              {mode === COMMUNICATION_MODES.VOICE && '🎵'}
              {mode === COMMUNICATION_MODES.VIDEO && '📹'}
              {mode === COMMUNICATION_MODES.PTT && '🎙️'}
              {mode === COMMUNICATION_MODES.HYBRID && '🔀'}
              <span>{mode.toUpperCase()}</span>
            </button>
          ))}
        </div>
        
        {/* Connection Status */}
        <div className="connection-status">
          <div className={`status-indicator ${connectionStatus}`}></div>
          <span>{connectionStatus}</span>
          {latency > 0 && <span className="latency">{latency}ms</span>}
        </div>
      </div>

      {/* Main Communication Area */}
      <div className="communication-area">
        {/* Video Display */}
        {(currentMode === COMMUNICATION_MODES.VIDEO || currentMode === COMMUNICATION_MODES.HYBRID) && (
          <div className="video-container">
            <video
              ref={videoRef}
              className="local-video"
              autoPlay
              muted
              playsInline
            />
            {participants.map(participant => (
              <video
                key={participant.id}
                className="remote-video"
                autoPlay
                playsInline
              />
            ))}
            
            {/* Video Controls */}
            <div className="video-controls">
              <button
                className={`control-btn ${videoEnabled ? 'active' : ''}`}
                onClick={handleToggleVideo}
              >
                📹
              </button>
              <button
                className={`control-btn ${audioEnabled ? 'active' : ''}`}
                onClick={handleToggleAudio}
              >
                🎵
              </button>
              <button
                className={`control-btn ${screenSharing ? 'active' : ''}`}
                onClick={handleStartScreenShare}
              >
                🖥️
              </button>
            </div>
          </div>
        )}

        {/* PTT Interface */}
        {(currentMode === COMMUNICATION_MODES.PTT || currentMode === COMMUNICATION_MODES.HYBRID) && (
          <div className="ptt-interface">
            <div className={`ptt-button ${isPTTActive ? 'active' : ''}`}>
              <div className="ptt-ring">
                <button className="ptt-center">
                  🎙️
                </button>
              </div>
              <div className="ptt-instructions">
                Hold SPACEBAR to talk
              </div>
            </div>
            
            {/* Voice Level Indicator */}
            <div className="voice-level">
              <div 
                className="voice-bar"
                style={{ width: `${voiceLevel}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Participants List */}
        {participants.length > 0 && (
          <div className="participants-panel">
            <h4>Participants ({participants.length + 1})</h4>
            <div className="participant-list">
              <div className="participant self">
                <span className="participant-name">{currentUser?.name || 'You'}</span>
                <span className="participant-status">🟢</span>
              </div>
              {participants.map(participant => (
                <div key={participant.id} className="participant">
                  <span className="participant-name">{participant.name}</span>
                  <span className="participant-status">
                    {participant.talking ? '🎙️' : '🟢'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Text Overlay */}
      {showTextOverlay && (
        <div className="text-overlay">
          <div className="overlay-messages">
            {overlayMessages.map(msg => (
              <div key={msg.id} className="overlay-message">
                <span className="sender">{msg.sender}:</span>
                <span className="content">{msg.content}</span>
              </div>
            ))}
          </div>
          
          <div className="quick-message-input">
            <input
              type="text"
              value={quickMessage}
              onChange={(e) => setQuickMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendQuickMessage()}
              placeholder="Quick message..."
            />
            <button onClick={handleSendQuickMessage}>Send</button>
          </div>
        </div>
      )}

      {/* QR Join Modal */}
      {showQRJoin && roomQRCode && (
        <div className="qr-join-modal">
          <div className="qr-join-content">
            <h3>Join via QR Code</h3>
            <div className="qr-code-display">
              <img src={roomQRCode.image} alt="Room QR Code" />
            </div>
            <p>Scan to join the room</p>
            <button onClick={() => setShowQRJoin(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <button
          className="action-btn"
          onClick={() => setShowTextOverlay(!showTextOverlay)}
        >
          💬 Text Overlay
        </button>
        <button
          className="action-btn"
          onClick={handleJoinViaQR}
        >
          📱 QR Join
        </button>
        <button
          className="action-btn"
          onClick={() => setShowModeSelector(!showModeSelector)}
        >
          ⚙️ Settings
        </button>
      </div>
    </div>
  )
}

export default LiveCommunicationInterface