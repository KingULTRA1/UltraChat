import React, { useState, useEffect, useRef } from 'react'
import { CALL_STATES, CALL_TYPES } from '../../utils/Constants'
import './CallModal.css'

const CallModal = ({ 
  callManager, 
  callState, 
  currentCall, 
  onEndCall, 
  onAcceptCall, 
  onRejectCall 
}) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [callDuration, setCallDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const callStartTimeRef = useRef(null)

  // Update call duration
  useEffect(() => {
    let interval = null
    
    if (callState === CALL_STATES.CONNECTED) {
      callStartTimeRef.current = Date.now()
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - callStartTimeRef.current) / 1000)
        setCallDuration(elapsed)
      }, 1000)
    } else {
      setCallDuration(0)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [callState])

  // Handle local stream
  useEffect(() => {
    if (callManager && callManager.onLocalStream) {
      callManager.onLocalStream = (stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
      }
    }
  }, [callManager])

  // Handle remote stream
  useEffect(() => {
    if (callManager && callManager.onRemoteStream) {
      callManager.onRemoteStream = (stream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream
        }
      }
    }
  }, [callManager])

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleToggleVideo = async () => {
    if (callManager) {
      const enabled = await callManager.toggleVideo()
      setIsVideoEnabled(enabled)
    }
  }

  const handleToggleAudio = async () => {
    if (callManager) {
      const enabled = await callManager.toggleAudio()
      setIsAudioEnabled(enabled)
    }
  }

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen)
  }

  const getCallStateText = () => {
    switch (callState) {
      case CALL_STATES.CALLING:
        return 'Calling...'
      case CALL_STATES.RINGING:
        return 'Incoming call'
      case CALL_STATES.CONNECTED:
        return formatDuration(callDuration)
      default:
        return ''
    }
  }

  const getCallIcon = () => {
    return currentCall?.callType === CALL_TYPES.VIDEO ? '📹' : '📞'
  }

  if (!currentCall || callState === CALL_STATES.IDLE) {
    return null
  }

  return (
    <div className={`call-modal ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="call-overlay">
        {/* Call Header */}
        <div className="call-header">
          <div className="call-info">
            <h3 className="contact-name">
              {currentCall.contactName || `Contact ${currentCall.contactId}`}
            </h3>
            <p className="call-status">
              {getCallIcon()} {getCallStateText()}
            </p>
          </div>
          
          {callState === CALL_STATES.CONNECTED && (
            <button 
              className="fullscreen-btn"
              onClick={handleFullscreenToggle}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? '⛶' : '⛶'}
            </button>
          )}
        </div>

        {/* Video Area */}
        {currentCall.callType === CALL_TYPES.VIDEO && (
          <div className="video-container">
            {/* Remote Video */}
            <video
              ref={remoteVideoRef}
              className="remote-video"
              autoPlay
              playsInline
            />
            
            {/* Local Video */}
            <video
              ref={localVideoRef}
              className="local-video"
              autoPlay
              playsInline
              muted
            />

            {/* Video disabled overlay */}
            {!isVideoEnabled && (
              <div className="video-disabled-overlay">
                <div className="video-disabled-message">
                  <span className="video-disabled-icon">📹</span>
                  <p>Camera is off</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Voice Call Avatar */}
        {currentCall.callType === CALL_TYPES.VOICE && (
          <div className="voice-call-container">
            <div className="contact-avatar large">
              {(currentCall.contactName || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="audio-visualization">
              {/* Simple audio bars animation */}
              <div className="audio-bar"></div>
              <div className="audio-bar"></div>
              <div className="audio-bar"></div>
              <div className="audio-bar"></div>
              <div className="audio-bar"></div>
            </div>
          </div>
        )}

        {/* Call Controls */}
        <div className="call-controls">
          {/* Incoming call controls */}
          {callState === CALL_STATES.RINGING && !currentCall.isOutgoing && (
            <div className="incoming-controls">
              <button 
                className="call-btn reject"
                onClick={() => onRejectCall('declined')}
                title="Reject Call"
              >
                ✕
              </button>
              <button 
                className="call-btn accept"
                onClick={onAcceptCall}
                title="Accept Call"
              >
                ✓
              </button>
            </div>
          )}

          {/* Active call controls */}
          {(callState === CALL_STATES.CONNECTED || callState === CALL_STATES.CALLING) && (
            <div className="active-controls">
              {/* Audio toggle */}
              <button 
                className={`control-btn ${!isAudioEnabled ? 'disabled' : ''}`}
                onClick={handleToggleAudio}
                title={isAudioEnabled ? 'Mute' : 'Unmute'}
              >
                {isAudioEnabled ? '🎤' : '🔇'}
              </button>

              {/* Video toggle (if video call) */}
              {currentCall.callType === CALL_TYPES.VIDEO && (
                <button 
                  className={`control-btn ${!isVideoEnabled ? 'disabled' : ''}`}
                  onClick={handleToggleVideo}
                  title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                >
                  {isVideoEnabled ? '📹' : '📷'}
                </button>
              )}

              {/* End call */}
              <button 
                className="call-btn end-call"
                onClick={() => onEndCall('User ended call')}
                title="End Call"
              >
                📞
              </button>

              {/* Settings (placeholder) */}
              <button 
                className="control-btn"
                title="Call Settings"
              >
                ⚙️
              </button>
            </div>
          )}
        </div>

        {/* Call Status Messages */}
        {callState === CALL_STATES.CALLING && (
          <div className="call-message">
            <p>Connecting...</p>
          </div>
        )}

        {callState === CALL_STATES.RINGING && currentCall.isOutgoing && (
          <div className="call-message">
            <p>Ringing...</p>
            <button 
              className="cancel-btn"
              onClick={() => onEndCall('Call cancelled')}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CallModal