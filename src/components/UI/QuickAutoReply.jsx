/*
 * Quick Auto-Reply Component - UltraChat v1.2.3
 * 
 * Provides quick auto-reply buttons with:
 * - Predefined quick replies
 * - Custom user-defined replies
 * - Emoji-only quick reactions
 * - Fresh 2025 UI with smooth animations
 */

import { useState, useEffect } from 'react'
import './QuickAutoReply.css'

const QuickAutoReply = ({ autoReplyManager, onSendReply, isVisible = true }) => {
  const [quickReplies, setQuickReplies] = useState([])
  const [emojiReplies, setEmojiReplies] = useState([])
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customText, setCustomText] = useState('')
  const [showEmojis, setShowEmojis] = useState(false)

  useEffect(() => {
    if (autoReplyManager?.initialized) {
      loadReplies()
    }
  }, [autoReplyManager])

  const loadReplies = async () => {
    try {
      const replies = autoReplyManager.getQuickReplies()
      const emojis = autoReplyManager.getEmojiReplies()
      
      setQuickReplies(replies)
      setEmojiReplies(emojis)
    } catch (error) {
      console.error('Failed to load auto-replies:', error)
    }
  }

  const handleQuickReply = (reply) => {
    onSendReply({
      text: reply.text,
      type: 'auto_reply',
      preset: reply.id,
      isAutoReply: true
    })
  }

  const handleEmojiReply = (emoji) => {
    onSendReply({
      text: emoji,
      type: 'auto_reply_emoji',
      isAutoReply: true,
      emojiOnly: true
    })
  }

  const handleCustomReply = async (e) => {
    e.preventDefault()
    if (!customText.trim()) return

    try {
      // Add to custom replies for future use
      await autoReplyManager.addCustomReply(customText.trim())
      
      // Send the reply
      onSendReply({
        text: customText.trim(),
        type: 'auto_reply',
        isAutoReply: true,
        custom: true
      })

      // Reset form
      setCustomText('')
      setShowCustomForm(false)
      
      // Reload replies to show the new custom one
      await loadReplies()
    } catch (error) {
      console.error('Failed to add custom reply:', error)
      alert(error.message)
    }
  }

  const removeCustomReply = async (replyId) => {
    try {
      await autoReplyManager.removeCustomReply(replyId)
      await loadReplies()
    } catch (error) {
      console.error('Failed to remove custom reply:', error)
    }
  }

  if (!isVisible || !autoReplyManager?.initialized) {
    return null
  }

  return (
    <div className="quick-auto-reply">
      {/* Quick Reply Buttons */}
      <div className="reply-section">
        <div className="section-header">
          <h4>Quick Replies</h4>
          <button 
            className="add-custom-btn"
            onClick={() => setShowCustomForm(!showCustomForm)}
            title="Add custom reply"
          >
            +
          </button>
        </div>
        
        <div className="quick-replies">
          {quickReplies.map((reply, index) => (
            <div key={reply.id || index} className="reply-item">
              <button
                className={`quick-reply-btn ${reply.category}`}
                onClick={() => handleQuickReply(reply)}
                title={reply.text}
              >
                {reply.emoji && <span className="reply-emoji">{reply.emoji}</span>}
                <span className="reply-text">{reply.text}</span>
              </button>
              
              {reply.category === 'custom' && (
                <button
                  className="remove-reply-btn"
                  onClick={() => removeCustomReply(reply.id)}
                  title="Remove custom reply"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Custom Reply Form */}
      {showCustomForm && (
        <div className="custom-reply-form">
          <form onSubmit={handleCustomReply}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Enter your custom auto-reply..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                maxLength={300}
                required
              />
              <div className="char-counter">
                {customText.length}/300
              </div>
            </div>
            <div className="form-actions">
              <button type="button" onClick={() => setShowCustomForm(false)}>
                Cancel
              </button>
              <button type="submit">
                Add & Send
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Emoji Quick Replies */}
      <div className="emoji-section">
        <div className="section-header">
          <h4>Quick Reactions</h4>
          <button 
            className="toggle-emojis-btn"
            onClick={() => setShowEmojis(!showEmojis)}
            title={showEmojis ? 'Hide emojis' : 'Show more emojis'}
          >
            {showEmojis ? '↑' : '😀'}
          </button>
        </div>
        
        <div className={`emoji-replies ${showEmojis ? 'expanded' : 'collapsed'}`}>
          {emojiReplies.slice(0, showEmojis ? emojiReplies.length : 8).map((emoji, index) => (
            <button
              key={index}
              className="emoji-reply-btn"
              onClick={() => handleEmojiReply(emoji)}
              title={`Send ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default QuickAutoReply