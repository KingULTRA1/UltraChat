// 🚀 UltraChat v1.2.3.4 Final - Multi-Mode Interface
// PRIVACY FIRST - Unified interface for all communication modes

import { useState, useEffect } from 'react'
import LiveCommunicationInterface from './LiveCommunicationInterface'
import GroupManager from './GroupManager'
import UltraProfileGenerator from './UltraProfileGenerator'
import './MultiModeInterface.css'

const INTERFACE_MODES = {
  STANDARD: 'standard',      // Regular chat interface
  LIVE: 'live',             // Live communication (PTT, Video, Voice)
  GROUPS: 'groups',         // Group management
  PROFILE_GEN: 'profile_gen', // Ultra Profile Generator
  VIDEO_CALL: 'video_call', // Full-screen video call
  PTT_ONLY: 'ptt_only',     // PTT-only mode
  HYBRID: 'hybrid'          // Multiple modes combined
}

const QUICK_ACTIONS = {
  START_VIDEO: 'start_video',
  START_VOICE: 'start_voice',
  START_PTT: 'start_ptt',
  CREATE_GROUP: 'create_group',
  JOIN_GROUP: 'join_group',
  SHARE_SCREEN: 'share_screen',
  RECORD_SESSION: 'record_session'
}

const MultiModeInterface = ({ 
  selectedChat, 
  currentUser, 
  trustManager,
  onModeChange,
  onChatSelect 
}) => {
  // Core state
  const [currentMode, setCurrentMode] = useState(INTERFACE_MODES.STANDARD)
  const [previousMode, setPreviousMode] = useState(null)
  const [communicationActive, setCommunicationActive] = useState(false)
  
  // Multi-mode state
  const [activeWindows, setActiveWindows] = useState([])
  const [pinnedControls, setPinnedControls] = useState([])
  const [quickActionsVisible, setQuickActionsVisible] = useState(true)
  
  // Session state
  const [currentSession, setCurrentSession] = useState(null)
  const [sessionParticipants, setSessionParticipants] = useState([])
  const [sessionRecording, setSessionRecording] = useState(false)
  
  // UI state
  const [showModeSelector, setShowModeSelector] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [dragWindow, setDragWindow] = useState(null)

  useEffect(() => {
    // Initialize interface based on selected chat
    if (selectedChat) {
      initializeForChat()
    }
    
    // Set up global event listeners
    setupGlobalEventListeners()
    
    return () => {
      cleanup()
    }
  }, [selectedChat])

  const initializeForChat = () => {
    // Determine best mode based on chat type and features
    if (selectedChat && selectedChat.type === 'group') {
      setCurrentMode(INTERFACE_MODES.GROUPS)
    } else if (selectedChat && selectedChat.hasVideoCall) {
      setCurrentMode(INTERFACE_MODES.LIVE)
    } else {
      setCurrentMode(INTERFACE_MODES.STANDARD)
    }
  }

  const setupGlobalEventListeners = () => {
    // Listen for communication events
    window.addEventListener('communicationStarted', handleCommunicationStarted)
    window.addEventListener('communicationEnded', handleCommunicationEnded)
    window.addEventListener('participantJoined', handleParticipantJoined)
    window.addEventListener('participantLeft', handleParticipantLeft)
    window.addEventListener('sessionRecordingStarted', handleRecordingStarted)
    window.addEventListener('sessionRecordingStopped', handleRecordingStopped)
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts)
  }

  const handleKeyboardShortcuts = (e) => {
    // Only handle shortcuts when not typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
    
    switch (e.key) {
      case 'v':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault()
          handleQuickAction(QUICK_ACTIONS.START_VIDEO)
        }
        break
      case 'p':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault()
          handleQuickAction(QUICK_ACTIONS.START_PTT)
        }
        break
      case 'g':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault()
          switchMode(INTERFACE_MODES.GROUPS)
        }
        break
      case 'u':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault()
          switchMode(INTERFACE_MODES.PROFILE_GEN)
        }
        break
      case 'h':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault()
          switchMode(INTERFACE_MODES.HYBRID)
        }
        break
      case 'Escape':
        if (currentMode !== INTERFACE_MODES.STANDARD) {
          switchMode(INTERFACE_MODES.STANDARD)
        }
        break
    }
  }

  const switchMode = (newMode) => {
    if (newMode === currentMode) return
    
    setPreviousMode(currentMode)
    setCurrentMode(newMode)
    onModeChange?.(newMode)
    
    // Handle mode-specific initialization
    switch (newMode) {
      case INTERFACE_MODES.HYBRID:
        // Enable multiple windows
        setActiveWindows(['live', 'text_overlay'])
        break
      case INTERFACE_MODES.VIDEO_CALL:
        // Full-screen video mode
        setActiveWindows(['video_call'])
        setPinnedControls(['ptt', 'text'])
        break
      case INTERFACE_MODES.PTT_ONLY:
        // PTT-focused mode
        setActiveWindows(['ptt'])
        setPinnedControls(['text_overlay'])
        break
      default:
        setActiveWindows([])
        setPinnedControls([])
    }
    
    addNotification(`Switched to ${newMode} mode`, 'info')
  }

  const handleQuickAction = async (action) => {
    try {
      switch (action) {
        case QUICK_ACTIONS.START_VIDEO:
          switchMode(INTERFACE_MODES.VIDEO_CALL)
          await startVideoSession()
          break
        case QUICK_ACTIONS.START_VOICE:
          switchMode(INTERFACE_MODES.LIVE)
          await startVoiceSession()
          break
        case QUICK_ACTIONS.START_PTT:
          switchMode(INTERFACE_MODES.PTT_ONLY)
          await startPTTSession()
          break
        case QUICK_ACTIONS.CREATE_GROUP:
          switchMode(INTERFACE_MODES.GROUPS)
          break
        case QUICK_ACTIONS.JOIN_GROUP:
          switchMode(INTERFACE_MODES.GROUPS)
          break
        case QUICK_ACTIONS.SHARE_SCREEN:
          await startScreenShare()
          break
        case QUICK_ACTIONS.RECORD_SESSION:
          await toggleSessionRecording()
          break
      }
    } catch (error) {
      console.error('Quick action failed:', error)
      addNotification(`Failed to ${action}: ${error.message}`, 'error')
    }
  }

  const startVideoSession = async () => {
    setCommunicationActive(true)
    setCurrentSession({
      type: 'video',
      chatId: selectedChat?.id || 'default',
      startTime: new Date()
    })
    addNotification('Video session started', 'success')
  }

  const startVoiceSession = async () => {
    setCommunicationActive(true)
    setCurrentSession({
      type: 'voice',
      chatId: selectedChat?.id || 'default',
      startTime: new Date()
    })
    addNotification('Voice session started', 'success')
  }

  const startPTTSession = async () => {
    setCommunicationActive(true)
    setCurrentSession({
      type: 'ptt',
      chatId: selectedChat?.id || 'default',
      startTime: new Date()
    })
    addNotification('PTT session started', 'success')
  }

  const startScreenShare = async () => {
    // Implementation for screen sharing
    addNotification('Screen sharing started', 'info')
  }

  const toggleSessionRecording = async () => {
    if (sessionRecording) {
      setSessionRecording(false)
      addNotification('Recording stopped', 'info')
    } else {
      setSessionRecording(true)
      addNotification('Recording started', 'success')
    }
  }

  // Event handlers
  const handleCommunicationStarted = (event) => {
    setCommunicationActive(true)
    addNotification(`${event.detail.type} communication started`, 'success')
  }

  const handleCommunicationEnded = (event) => {
    setCommunicationActive(false)
    setCurrentSession(null)
    addNotification(`${event.detail.type} communication ended`, 'info')
  }

  const handleParticipantJoined = (event) => {
    const participant = event.detail
    setSessionParticipants(prev => [...prev, participant])
    addNotification(`${participant.name} joined`, 'info')
  }

  const handleParticipantLeft = (event) => {
    const participantId = event.detail.participantId
    setSessionParticipants(prev => prev.filter(p => p.id !== participantId))
    addNotification(`Participant left`, 'info')
  }

  const handleRecordingStarted = () => {
    setSessionRecording(true)
  }

  const handleRecordingStopped = () => {
    setSessionRecording(false)
  }

  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    }
    
    setNotifications(prev => [...prev, notification])
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)
  }

  const getQuickActions = () => {
    const actions = []
    
    actions.push(
      { id: QUICK_ACTIONS.START_VIDEO, icon: '📹', label: 'Video Call', shortcut: 'Ctrl+V' },
      { id: QUICK_ACTIONS.START_VOICE, icon: '🎵', label: 'Voice Call', shortcut: 'Ctrl+A' },
      { id: QUICK_ACTIONS.START_PTT, icon: '🎙️', label: 'Push-to-Talk', shortcut: 'Ctrl+P' }
    )
    
    actions.push(
      { id: QUICK_ACTIONS.CREATE_GROUP, icon: '👥', label: 'Create Group', shortcut: 'Ctrl+G' },
      { id: QUICK_ACTIONS.JOIN_GROUP, icon: '📱', label: 'Join Group', shortcut: 'Ctrl+J' }
    )
    
    if (communicationActive) {
      actions.push(
        { id: QUICK_ACTIONS.SHARE_SCREEN, icon: '🖥️', label: 'Share Screen' },
        { id: QUICK_ACTIONS.RECORD_SESSION, icon: sessionRecording ? '⏹️' : '⏺️', label: sessionRecording ? 'Stop Recording' : 'Record Session' }
      )
    }
    
    return actions
  }

  const cleanup = () => {
    window.removeEventListener('communicationStarted', handleCommunicationStarted)
    window.removeEventListener('communicationEnded', handleCommunicationEnded)
    window.removeEventListener('participantJoined', handleParticipantJoined)
    window.removeEventListener('participantLeft', handleParticipantLeft)
    window.removeEventListener('sessionRecordingStarted', handleRecordingStarted)
    window.removeEventListener('sessionRecordingStopped', handleRecordingStopped)
    document.removeEventListener('keydown', handleKeyboardShortcuts)
  }

  return (
    <div className="multi-mode-interface">
      {/* Mode Selector */}
      <div className="interface-header">
        <div className="mode-selector">
          {Object.values(INTERFACE_MODES).map(mode => (
            <button
              key={mode}
              className={`mode-btn ${currentMode === mode ? 'active' : ''}`}
              onClick={() => switchMode(mode)}
              title={`Switch to ${mode} mode`}
            >
              {mode === INTERFACE_MODES.STANDARD && '💬'}
              {mode === INTERFACE_MODES.LIVE && '🎥'}
              {mode === INTERFACE_MODES.GROUPS && '👥'}
              {mode === INTERFACE_MODES.PROFILE_GEN && '🎭'}
              {mode === INTERFACE_MODES.VIDEO_CALL && '📹'}
              {mode === INTERFACE_MODES.PTT_ONLY && '🎙️'}
              {mode === INTERFACE_MODES.HYBRID && '🔀'}
              <span>{mode.replace('_', ' ').toUpperCase()}</span>
            </button>
          ))}
        </div>
        
        {/* Session Status */}
        {currentSession && (
          <div className="session-status">
            <div className="session-indicator">
              <span className="session-type">{currentSession.type.toUpperCase()}</span>
              <span className="session-duration">
                {Math.floor((Date.now() - currentSession.startTime) / 60000)}m
              </span>
              {sessionRecording && <span className="recording-indicator">🔴 REC</span>}
            </div>
          </div>
        )}
        
        {/* Participants Count */}
        {sessionParticipants.length > 0 && (
          <div className="participants-count">
            👥 {sessionParticipants.length + 1}
          </div>
        )}
      </div>

      {/* Main Interface Area */}
      <div className="interface-content">
        {/* Standard Mode - Regular chat */}
        {currentMode === INTERFACE_MODES.STANDARD && (
          <div className="standard-interface">
            <div className="chat-placeholder">
              <h3>💬 Standard Chat Mode</h3>
              <p>Select a chat to start messaging, or switch to other modes for advanced features.</p>
              <p>Try switching to "Groups" mode to create or join chat rooms!</p>
            </div>
          </div>
        )}

        {/* Live Communication Mode */}
        {currentMode === INTERFACE_MODES.LIVE && (
          <LiveCommunicationInterface
            selectedChat={selectedChat}
            currentUser={currentUser}
            onModeChange={onModeChange}
          />
        )}

        {/* Groups Mode */}
        {currentMode === INTERFACE_MODES.GROUPS && (
          <GroupManager
            currentUser={currentUser}
            onGroupCreated={(group) => {
              onChatSelect?.(group)
              switchMode(INTERFACE_MODES.STANDARD)
            }}
            onGroupJoined={(group) => {
              onChatSelect?.(group)
              switchMode(INTERFACE_MODES.STANDARD)
            }}
          />
        )}

        {/* Ultra Profile Generator Mode */}
        {currentMode === INTERFACE_MODES.PROFILE_GEN && (
          <UltraProfileGenerator
            currentUser={currentUser}
            onProfileUpdate={(updatedProfile) => {
              // Update user profile with new identity
              console.log('🎭 Profile updated:', updatedProfile)
              addNotification(`Profile updated to: ${updatedProfile.displayName}`, 'success')
            }}
          />
        )}

        {/* Video Call Mode */}
        {currentMode === INTERFACE_MODES.VIDEO_CALL && (
          <VideoCallWindow
            selectedChat={selectedChat}
            currentUser={currentUser}
            onCallEnd={() => switchMode(INTERFACE_MODES.STANDARD)}
          />
        )}

        {/* PTT Only Mode */}
        {currentMode === INTERFACE_MODES.PTT_ONLY && (
          <PTTWindow
            selectedChat={selectedChat}
            currentUser={currentUser}
            onPTTEnd={() => switchMode(INTERFACE_MODES.STANDARD)}
          />
        )}

        {/* Hybrid Mode - Multiple windows */}
        {currentMode === INTERFACE_MODES.HYBRID && (
          <div className="hybrid-interface">
            <div className="main-window">
              <LiveCommunicationInterface
                selectedChat={selectedChat}
                currentUser={currentUser}
                onModeChange={onModeChange}
              />
            </div>
            
            {activeWindows.includes('text_overlay') && (
              <TextOverlayWindow
                selectedChat={selectedChat}
                currentUser={currentUser}
                position="bottom-right"
              />
            )}
          </div>
        )}
      </div>

      {/* Quick Actions Panel */}
      {quickActionsVisible && (
        <div className="quick-actions-panel">
          <div className="quick-actions-header">
            <h4>Quick Actions</h4>
            <button 
              className="toggle-btn"
              onClick={() => setQuickActionsVisible(false)}
            >
              ×
            </button>
          </div>
          
          <div className="quick-actions-grid">
            {getQuickActions().map(action => (
              <button
                key={action.id}
                className="quick-action-btn"
                onClick={() => handleQuickAction(action.id)}
                title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
              >
                <span className="action-icon">{action.icon}</span>
                <span className="action-label">{action.label}</span>
                {action.shortcut && (
                  <span className="action-shortcut">{action.shortcut}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Quick Action Button (when panel is hidden) */}
      {!quickActionsVisible && (
        <button 
          className="floating-actions-btn"
          onClick={() => setQuickActionsVisible(true)}
          title="Show Quick Actions"
        >
          ⚡
        </button>
      )}

      {/* Notifications */}
      <div className="notifications-container">
        {notifications.map(notification => (
          <div 
            key={notification.id}
            className={`notification ${notification.type}`}
          >
            <span className="notification-message">{notification.message}</span>
            <button 
              className="notification-close"
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// Placeholder components for the individual windows
const VideoCallWindow = ({ selectedChat, currentUser, onCallEnd }) => (
  <div className="video-call-window">
    <h3>📹 Full-Screen Video Call</h3>
    <p>Video call with {selectedChat?.name || 'someone'}</p>
    <button onClick={onCallEnd}>End Call</button>
  </div>
)

const PTTWindow = ({ selectedChat, currentUser, onPTTEnd }) => (
  <div className="ptt-window">
    <h3>🎙️ Push-to-Talk Mode</h3>
    <p>PTT session with {selectedChat?.name || 'someone'}</p>
    <button onClick={onPTTEnd}>End PTT</button>
  </div>
)

const TextOverlayWindow = ({ selectedChat, currentUser, position }) => (
  <div className={`text-overlay-window ${position}`}>
    <h4>💬 Text Overlay</h4>
    <p>Quick text for {selectedChat?.name || 'someone'}</p>
  </div>
)

export default MultiModeInterface