// 🚀 UltraChat v1.2.3.4 Final - Group Management System
// PRIVACY FIRST - Create, manage, and join groups with QR codes

import { useState, useEffect } from 'react'
import RealTimeManager from '../../services/Communication/RealTimeManager'
import QRJoinManager from '../../services/Communication/QRJoinManager'
import UltraTextGenerator from '../../services/Communication/UltraTextGenerator'
import RealTimeModerationService from '../../services/Moderation/RealTimeModerationService'
import './GroupManager.css'

const GROUP_TYPES = {
  PRIVATE: 'private',
  PUBLIC: 'public',
  INVITE_ONLY: 'invite_only',
  TEMPORARY: 'temporary'
}

const GROUP_FEATURES = {
  TEXT_CHAT: 'text_chat',
  VOICE_CHAT: 'voice_chat',
  VIDEO_CHAT: 'video_chat',
  FILE_SHARING: 'file_sharing',
  SCREEN_SHARE: 'screen_share',
  REACTIONS: 'reactions',
  POLLS: 'polls'
}

const GroupManager = ({ currentUser, onGroupCreated, onGroupJoined }) => {
  // Core state
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  
  // Services
  const [realTimeManager, setRealTimeManager] = useState(null)
  const [qrManager, setQrManager] = useState(null)
  const [textGenerator, setTextGenerator] = useState(null)
  
  // Create Group form data
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    type: GROUP_TYPES.PRIVATE,
    features: [GROUP_FEATURES.TEXT_CHAT],
    maxMembers: 10,
    autoExpire: false,
    expireHours: 24,
    requireApproval: true,
    allowInvites: true
  })
  
  // Join Group state
  const [joinCode, setJoinCode] = useState('')
  const [scannedData, setScannedData] = useState(null)
  
  // Group management state
  const [groupQRCode, setGroupQRCode] = useState(null)

  useEffect(() => {
    initializeServices()
    loadExistingGroups()
    
    return () => {
      cleanup()
    }
  }, [cleanup])

  const initializeServices = async () => {
    try {
      console.log('🚀 Initializing Group Management Services...')
      
      const rtManager = new RealTimeManager()
      await rtManager.initialize()
      setRealTimeManager(rtManager)
      
      const qr = new QRJoinManager()
      await qr.initialize()
      setQrManager(qr)
      
      const textGen = new UltraTextGenerator()
      await textGen.initialize()
      setTextGenerator(textGen)
      
      // Initialize real-time moderation
      const realTimeModeration = new RealTimeModerationService()
      await realTimeModeration.initialize()
      setRealTimeModerationService(realTimeModeration)
      
      console.log('✅ Group Management Services initialized')
      
    } catch (error) {
      console.error('❌ Failed to initialize group services:', error)
    }
  }

  const loadExistingGroups = () => {
    // Load groups from localStorage or service
    const savedGroups = localStorage.getItem('ultrachat-groups')
    if (savedGroups) {
      try {
        const parsedGroups = JSON.parse(savedGroups)
        setGroups(parsedGroups)
      } catch (error) {
        console.error('Failed to load groups:', error)
      }
    }
    
    // Add some sample groups for demo
    const sampleGroups = [
      {
        id: 'group-1',
        name: 'Development Team',
        description: 'Core development discussion',
        type: GROUP_TYPES.PRIVATE,
        features: [GROUP_FEATURES.TEXT_CHAT, GROUP_FEATURES.VOICE_CHAT, GROUP_FEATURES.FILE_SHARING],
        members: 5,
        maxMembers: 15,
        isOwner: true,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
        unreadCount: 3
      },
      {
        id: 'group-2', 
        name: 'Project Alpha',
        description: 'Secret project collaboration',
        type: GROUP_TYPES.INVITE_ONLY,
        features: [GROUP_FEATURES.TEXT_CHAT, GROUP_FEATURES.VIDEO_CHAT, GROUP_FEATURES.SCREEN_SHARE],
        members: 8,
        maxMembers: 12,
        isOwner: false,
        lastActivity: new Date(Date.now() - 30 * 60 * 1000),
        unreadCount: 0
      },
      {
        id: 'group-3',
        name: 'Quick Standup',
        description: 'Temporary group for today\'s standup',
        type: GROUP_TYPES.TEMPORARY,
        features: [GROUP_FEATURES.VOICE_CHAT, GROUP_FEATURES.REACTIONS],
        members: 12,
        maxMembers: 20,
        isOwner: false,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 5 * 60 * 1000),
        unreadCount: 1
      }
    ]
    
    setGroups(prev => prev.length === 0 ? sampleGroups : prev)
  }

  const handleCreateGroup = async (e) => {
    e.preventDefault()
    
    try {
      if (!realTimeManager || !qrManager) {
        throw new Error('Services not initialized')
      }
      
      // Create room via RealTimeManager
      const roomOptions = {
        name: groupForm.name,
        description: groupForm.description,
        type: 'group',
        privacy: groupForm.type,
        features: groupForm.features,
        maxParticipants: groupForm.maxMembers,
        autoExpire: groupForm.autoExpire,
        expireAfter: groupForm.autoExpire ? groupForm.expireHours * 60 * 60 * 1000 : null,
        requireApproval: groupForm.requireApproval,
        allowInvites: groupForm.allowInvites,
        ownerId: currentUser?.id
      }
      
      const room = await realTimeManager.createRoom(roomOptions)
      
      // Generate QR code for group
      const qrCode = await qrManager.generateRoomQR(room.id, {
        style: 'modern',
        includeRoomInfo: true,
        title: groupForm.name,
        description: groupForm.description
      })
      
      // Create group object
      const newGroup = {
        id: room.id,
        name: groupForm.name,
        description: groupForm.description,
        type: groupForm.type,
        features: groupForm.features,
        members: 1,
        maxMembers: groupForm.maxMembers,
        isOwner: true,
        createdAt: new Date(),
        lastActivity: new Date(),
        unreadCount: 0,
        qrCode: qrCode,
        joinCode: room.joinCode
      }
      
      // Add to groups list
      const updatedGroups = [...groups, newGroup]
      setGroups(updatedGroups)
      localStorage.setItem('ultrachat-groups', JSON.stringify(updatedGroups))
      
      // Emit room created event for moderation tracking
      window.dispatchEvent(new CustomEvent('roomCreated', {
        detail: {
          room: {
            id: room.id,
            name: newGroup.name,
            type: newGroup.type,
            features: newGroup.features
          },
          creator: currentUser
        }
      }))
      
      // Reset form and close modal
      setGroupForm({
        name: '',
        description: '',
        type: GROUP_TYPES.PRIVATE,
        features: [GROUP_FEATURES.TEXT_CHAT],
        maxMembers: 10,
        autoExpire: false,
        expireHours: 24,
        requireApproval: true,
        allowInvites: true
      })
      setShowCreateModal(false)
      
      // Notify parent component
      onGroupCreated?.(newGroup)
      
      console.log('✅ Group created successfully:', newGroup.name)
      
    } catch (error) {
      console.error('❌ Failed to create group:', error)
      alert('Failed to create group: ' + error.message)
    }
  }

  const handleJoinGroup = async (e) => {
    e.preventDefault()
    
    try {
      if (!realTimeManager) {
        throw new Error('RealTimeManager not initialized')
      }
      
      let roomData = null
      
      // Try to join by code or QR data
      if (scannedData) {
        roomData = await realTimeManager.joinRoomByQR(scannedData)
      } else if (joinCode) {
        roomData = await realTimeManager.joinRoomByCode(joinCode)
      } else {
        throw new Error('No join code or QR data provided')
      }
      
      // Create group object for joined group
      const joinedGroup = {
        id: roomData.id,
        name: roomData.name || 'Joined Group',
        description: roomData.description || '',
        type: roomData.privacy || GROUP_TYPES.PRIVATE,
        features: roomData.features || [GROUP_FEATURES.TEXT_CHAT],
        members: roomData.memberCount || 1,
        maxMembers: roomData.maxParticipants || 10,
        isOwner: false,
        joinedAt: new Date(),
        lastActivity: new Date(),
        unreadCount: 0
      }
      
      // Add to groups list
      const updatedGroups = [...groups, joinedGroup]
      setGroups(updatedGroups)
      localStorage.setItem('ultrachat-groups', JSON.stringify(updatedGroups))
      
      // Emit room joined event for moderation tracking
      window.dispatchEvent(new CustomEvent('roomJoined', {
        detail: {
          room: {
            id: joinedGroup.id,
            name: joinedGroup.name,
            type: joinedGroup.type,
            features: joinedGroup.features
          },
          user: currentUser,
          participant: {
            id: currentUser?.id,
            name: currentUser?.username || currentUser?.displayName,
            joinMethod: scannedData ? 'qr_code' : 'invite_code'
          }
        }
      }))
      
      // Reset and close modal
      setJoinCode('')
      setScannedData(null)
      setShowJoinModal(false)
      
      // Notify parent component
      onGroupJoined?.(joinedGroup)
      
      console.log('✅ Joined group successfully:', joinedGroup.name)
      
    } catch (error) {
      console.error('❌ Failed to join group:', error)
      alert('Failed to join group: ' + error.message)
    }
  }

  const handleLeaveGroup = async (groupId) => {
    try {
      if (!realTimeManager) return
      
      // Leave the room
      await realTimeManager.leaveRoom(groupId)
      
      // Remove from local groups
      const updatedGroups = groups.filter(g => g.id !== groupId)
      setGroups(updatedGroups)
      localStorage.setItem('ultrachat-groups', JSON.stringify(updatedGroups))
      
      if (selectedGroup?.id === groupId) {
        setSelectedGroup(null)
      }
      
      console.log('✅ Left group successfully')
      
    } catch (error) {
      console.error('❌ Failed to leave group:', error)
      alert('Failed to leave group: ' + error.message)
    }
  }

  const handleDeleteGroup = async (groupId) => {
    try {
      if (!realTimeManager) return
      
      const group = groups.find(g => g.id === groupId)
      if (!group?.isOwner) {
        alert('Only group owners can delete groups')
        return
      }
      
      if (!confirm(`Are you sure you want to delete "${group.name}"? This action cannot be undone.`)) {
        return
      }
      
      // Delete the room
      await realTimeManager.deleteRoom(groupId)
      
      // Remove from local groups
      const updatedGroups = groups.filter(g => g.id !== groupId)
      setGroups(updatedGroups)
      localStorage.setItem('ultrachat-groups', JSON.stringify(updatedGroups))
      
      if (selectedGroup?.id === groupId) {
        setSelectedGroup(null)
      }
      
      console.log('✅ Group deleted successfully')
      
    } catch (error) {
      console.error('❌ Failed to delete group:', error)
      alert('Failed to delete group: ' + error.message)
    }
  }

  const handleGenerateQR = async (groupId) => {
    try {
      if (!qrManager) return
      
      const group = groups.find(g => g.id === groupId)
      if (!group) return
      
      const qrCode = await qrManager.generateRoomQR(groupId, {
        style: 'modern',
        includeRoomInfo: true,
        title: group.name,
        description: group.description
      })
      
      setGroupQRCode(qrCode)
      
    } catch (error) {
      console.error('Failed to generate QR code:', error)
    }
  }

  const formatLastActivity = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return timestamp.toLocaleDateString()
  }

  const getGroupTypeIcon = (type) => {
    switch (type) {
      case GROUP_TYPES.PRIVATE: return '🔒'
      case GROUP_TYPES.PUBLIC: return '🌐'
      case GROUP_TYPES.INVITE_ONLY: return '📨'
      case GROUP_TYPES.TEMPORARY: return '⏰'
      default: return '👥'
    }
  }

  const getFeatureIcons = (features) => {
    const icons = {
      [GROUP_FEATURES.TEXT_CHAT]: '💬',
      [GROUP_FEATURES.VOICE_CHAT]: '🎵',
      [GROUP_FEATURES.VIDEO_CHAT]: '📹',
      [GROUP_FEATURES.FILE_SHARING]: '📁',
      [GROUP_FEATURES.SCREEN_SHARE]: '🖥️',
      [GROUP_FEATURES.REACTIONS]: '😀',
      [GROUP_FEATURES.POLLS]: '📊'
    }
    
    return features.map(feature => icons[feature]).filter(Boolean).join(' ')
  }

  const cleanup = () => {
    if (realTimeManager) realTimeManager.destroy()
    if (qrManager) qrManager.destroy()
    if (textGenerator) textGenerator.destroy()
  }

  return (
    <div className="group-manager">
      {/* Header */}
      <div className="group-header">
        <h2>👥 Group Management</h2>
        <div className="header-actions">
          <button 
            className="action-btn primary"
            onClick={() => setShowCreateModal(true)}
          >
            ➕ Create Group
          </button>
          <button 
            className="action-btn secondary"
            onClick={() => setShowJoinModal(true)}
          >
            📱 Join Group
          </button>
        </div>
      </div>

      {/* Groups List */}
      <div className="groups-list">
        {groups.length === 0 ? (
          <div className="empty-state">
            <p>No groups yet. Create or join a group to get started!</p>
          </div>
        ) : (
          groups.map(group => (
            <div key={group.id} className="group-card">
              <div className="group-info">
                <div className="group-title">
                  <span className="group-type">{getGroupTypeIcon(group.type)}</span>
                  <h3>{group.name}</h3>
                  {group.unreadCount > 0 && (
                    <span className="unread-badge">{group.unreadCount}</span>
                  )}
                </div>
                <p className="group-description">{group.description}</p>
                <div className="group-meta">
                  <span className="members">{group.members}/{group.maxMembers} members</span>
                  <span className="features">{getFeatureIcons(group.features)}</span>
                  <span className="last-activity">{formatLastActivity(group.lastActivity)}</span>
                  {group.expiresAt && (
                    <span className="expires">
                      Expires: {group.expiresAt.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="group-actions">
                <button 
                  className="action-btn small"
                  onClick={() => setSelectedGroup(group)}
                >
                  Open
                </button>
                {group.isOwner && (
                  <>
                    <button 
                      className="action-btn small secondary"
                      onClick={() => handleGenerateQR(group.id)}
                    >
                      QR
                    </button>
                    <button 
                      className="action-btn small danger"
                      onClick={() => handleDeleteGroup(group.id)}
                    >
                      Delete
                    </button>
                  </>
                )}
                {!group.isOwner && (
                  <button 
                    className="action-btn small warning"
                    onClick={() => handleLeaveGroup(group.id)}
                  >
                    Leave
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create New Group</h3>
            <form onSubmit={handleCreateGroup}>
              <div className="form-group">
                <label>Group Name</label>
                <input
                  type="text"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({...groupForm, name: e.target.value})}
                  required
                  placeholder="Enter group name..."
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({...groupForm, description: e.target.value})}
                  placeholder="Group description (optional)..."
                />
              </div>
              
              <div className="form-group">
                <label>Group Type</label>
                <select
                  value={groupForm.type}
                  onChange={(e) => setGroupForm({...groupForm, type: e.target.value})}
                >
                  <option value={GROUP_TYPES.PRIVATE}>🔒 Private</option>
                  <option value={GROUP_TYPES.PUBLIC}>🌐 Public</option>
                  <option value={GROUP_TYPES.INVITE_ONLY}>📨 Invite Only</option>
                  <option value={GROUP_TYPES.TEMPORARY}>⏰ Temporary</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Max Members</label>
                <input
                  type="number"
                  min="2"
                  max="100"
                  value={groupForm.maxMembers}
                  onChange={(e) => setGroupForm({...groupForm, maxMembers: parseInt(e.target.value)})}
                />
              </div>
              
              <div className="form-group">
                <label>Features</label>
                <div className="feature-checkboxes">
                  {Object.values(GROUP_FEATURES).map(feature => (
                    <label key={feature} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={groupForm.features.includes(feature)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setGroupForm({...groupForm, features: [...groupForm.features, feature]})
                          } else {
                            setGroupForm({...groupForm, features: groupForm.features.filter(f => f !== feature)})
                          }
                        }}
                      />
                      <span>{feature.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {groupForm.type === GROUP_TYPES.TEMPORARY && (
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={groupForm.autoExpire}
                      onChange={(e) => setGroupForm({...groupForm, autoExpire: e.target.checked})}
                    />
                    Auto-expire after 
                    <input
                      type="number"
                      min="1"
                      max="168"
                      value={groupForm.expireHours}
                      onChange={(e) => setGroupForm({...groupForm, expireHours: parseInt(e.target.value)})}
                      disabled={!groupForm.autoExpire}
                    />
                    hours
                  </label>
                </div>
              )}
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Group Modal */}
      {showJoinModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Join Group</h3>
            <form onSubmit={handleJoinGroup}>
              <div className="form-group">
                <label>Join Code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Enter group join code..."
                />
              </div>
              
              <div className="divider">OR</div>
              
              <div className="form-group">
                <button 
                  type="button"
                  className="qr-scan-btn"
                  onClick={() => setQrScanning(true)}
                >
                  📱 Scan QR Code
                </button>
                {scannedData && (
                  <div className="scanned-info">
                    ✅ QR Code scanned: {scannedData.roomName || 'Group'}
                  </div>
                )}
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowJoinModal(false)}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="primary"
                  disabled={!joinCode && !scannedData}
                >
                  Join Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Display Modal */}
      {groupQRCode && (
        <div className="modal-overlay">
          <div className="modal-content qr-modal">
            <h3>Group QR Code</h3>
            <div className="qr-display">
              <img src={groupQRCode.image} alt="Group QR Code" />
            </div>
            <p>Share this QR code to invite others to the group</p>
            <div className="modal-actions">
              <button onClick={() => setGroupQRCode(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GroupManager