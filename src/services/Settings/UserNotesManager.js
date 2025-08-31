// User Notes Manager - Handles local notes about contacts and users
// This service manages user-specific notes, categories, and contact info

import LocalStorage from '../../utils/LocalStorage.js'
import { PROFESSIONAL_CATEGORIES, USER_NOTE_TYPES, TRUST_REMINDER_SETTINGS } from '../../utils/Constants.js'

class UserNotesManager {
  constructor() {
    this.storage = new LocalStorage()
    this.initialized = false
  }

  // Initialize notes management
  async initialize() {
    try {
      await this.storage.initialize()
      this.initialized = true
      return true
    } catch (error) {
      console.error('User notes initialization failed:', error)
      return false
    }
  }

  // Get all notes for a user/contact
  async getUserNotes(contactId) {
    if (!this.initialized) await this.initialize()
    
    const notesKey = `user_notes_${contactId}`
    const defaultNotes = {
      contactId,
      general: '',
      professional: {
        category: null,
        skills: [],
        company: '',
        role: '',
        experience: ''
      },
      personal: {
        interests: [],
        location: '',
        timezone: '',
        languages: []
      },
      trust: {
        rating: 0,
        chatCount: 0,
        locked: false,
        lastRatingUpdate: null,
        reminderDue: null
      },
      contact: {
        phone: '',
        email: '',
        socials: {},
        avatar: null
      },
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }
    
    return await this.storage.retrieve(notesKey, defaultNotes)
  }

  // Update user notes
  async updateUserNotes(contactId, updates) {
    if (!this.initialized) await this.initialize()
    
    const existing = await this.getUserNotes(contactId)
    const updated = {
      ...existing,
      ...updates,
      lastUpdated: new Date().toISOString()
    }
    
    const notesKey = `user_notes_${contactId}`
    await this.storage.store(notesKey, updated, true)
    
    this.emitNotesUpdate(contactId, updated)
    return updated
  }

  // Add/update professional category
  async updateProfessionalInfo(contactId, professionalData) {
    const existing = await this.getUserNotes(contactId)
    
    const updated = {
      ...existing,
      professional: {
        ...existing.professional,
        ...professionalData
      },
      lastUpdated: new Date().toISOString()
    }
    
    return await this.updateUserNotes(contactId, updated)
  }

  // Update trust rating with auto-lock logic
  async updateTrustRating(contactId, rating, chatCount = null) {
    const existing = await this.getUserNotes(contactId)
    const currentChatCount = chatCount !== null ? chatCount : (existing.trust.chatCount + 1)
    
    // Check if rating should be locked
    const shouldLock = currentChatCount >= TRUST_REMINDER_SETTINGS.LOCK_THRESHOLD
    
    const trustUpdate = {
      rating,
      chatCount: currentChatCount,
      locked: shouldLock,
      lastRatingUpdate: new Date().toISOString(),
      reminderDue: shouldLock ? null : this.calculateReminderDate()
    }
    
    const updated = {
      ...existing,
      trust: {
        ...existing.trust,
        ...trustUpdate
      },
      lastUpdated: new Date().toISOString()
    }
    
    await this.updateUserNotes(contactId, updated)
    
    // Emit trust update event
    this.emitTrustUpdate(contactId, trustUpdate)
    
    return updated
  }

  // Calculate reminder date based on settings
  calculateReminderDate() {
    return new Date(Date.now() + TRUST_REMINDER_SETTINGS.REMINDER_DELAY).toISOString()
  }

  // Update contact information
  async updateContactInfo(contactId, contactData) {
    const existing = await this.getUserNotes(contactId)
    
    const updated = {
      ...existing,
      contact: {
        ...existing.contact,
        ...contactData
      },
      lastUpdated: new Date().toISOString()
    }
    
    return await this.updateUserNotes(contactId, updated)
  }

  // Get contacts that need trust rating reminders
  async getTrustReminders() {
    if (!this.initialized) await this.initialize()
    
    const now = new Date().toISOString()
    const reminders = []
    
    // Get all user notes
    const allKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('ultrachat_user_notes_')
    )
    
    for (const key of allKeys) {
      try {
        const notes = await this.storage.retrieve(key.replace('ultrachat_', ''), null)
        if (notes && notes.trust.reminderDue && notes.trust.reminderDue <= now && !notes.trust.locked) {
          reminders.push({
            contactId: notes.contactId,
            chatCount: notes.trust.chatCount,
            currentRating: notes.trust.rating,
            reminderDue: notes.trust.reminderDue
          })
        }
      } catch (error) {
        console.error('Error checking reminder for key:', key, error)
      }
    }
    
    return reminders
  }

  // Search notes by professional category
  async searchByProfession(category) {
    if (!this.initialized) await this.initialize()
    
    if (!Object.values(PROFESSIONAL_CATEGORIES).includes(category)) {
      throw new Error(`Invalid professional category: ${category}`)
    }
    
    const results = []
    const allKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('ultrachat_user_notes_')
    )
    
    for (const key of allKeys) {
      try {
        const notes = await this.storage.retrieve(key.replace('ultrachat_', ''), null)
        if (notes && notes.professional.category === category) {
          results.push({
            contactId: notes.contactId,
            professional: notes.professional,
            trust: notes.trust,
            lastUpdated: notes.lastUpdated
          })
        }
      } catch (error) {
        console.error('Error searching notes for key:', key, error)
      }
    }
    
    return results
  }

  // Get all contacts with notes
  async getAllContactsWithNotes() {
    if (!this.initialized) await this.initialize()
    
    const contacts = []
    const allKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('ultrachat_user_notes_')
    )
    
    for (const key of allKeys) {
      try {
        const notes = await this.storage.retrieve(key.replace('ultrachat_', ''), null)
        if (notes) {
          contacts.push({
            contactId: notes.contactId,
            displayInfo: {
              professional: notes.professional,
              trust: notes.trust,
              hasPhone: !!notes.contact.phone,
              hasSocials: Object.keys(notes.contact.socials).length > 0,
              lastContact: notes.lastUpdated
            }
          })
        }
      } catch (error) {
        console.error('Error loading contact notes for key:', key, error)
      }
    }
    
    return contacts
  }

  // Export all user notes for backup
  async exportAllNotes() {
    if (!this.initialized) await this.initialize()
    
    const notesExport = {
      version: '1.0',
      exported: new Date().toISOString(),
      notes: {},
      summary: {
        totalContacts: 0,
        categories: {},
        averageTrustRating: 0
      }
    }
    
    const allKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('ultrachat_user_notes_')
    )
    
    let totalRating = 0
    let ratedContacts = 0
    
    for (const key of allKeys) {
      try {
        const notes = await this.storage.retrieve(key.replace('ultrachat_', ''), null)
        if (notes) {
          notesExport.notes[notes.contactId] = notes
          notesExport.summary.totalContacts++
          
          // Track categories
          if (notes.professional.category) {
            notesExport.summary.categories[notes.professional.category] = 
              (notesExport.summary.categories[notes.professional.category] || 0) + 1
          }
          
          // Track trust ratings
          if (notes.trust.rating > 0) {
            totalRating += notes.trust.rating
            ratedContacts++
          }
        }
      } catch (error) {
        console.error('Error exporting notes for key:', key, error)
      }
    }
    
    notesExport.summary.averageTrustRating = ratedContacts > 0 ? 
      Math.round(totalRating / ratedContacts) : 0
    
    return notesExport
  }

  // Import user notes from backup
  async importNotes(notesData) {
    if (!this.initialized) await this.initialize()
    
    if (!notesData.notes || typeof notesData.notes !== 'object') {
      throw new Error('Invalid notes data format')
    }
    
    const results = {
      imported: 0,
      updated: 0,
      errors: []
    }
    
    for (const [contactId, notes] of Object.entries(notesData.notes)) {
      try {
        const existing = await this.getUserNotes(contactId)
        const isUpdate = existing.contactId === contactId && existing.lastUpdated !== existing.created
        
        await this.updateUserNotes(contactId, notes)
        
        if (isUpdate) {
          results.updated++
        } else {
          results.imported++
        }
      } catch (error) {
        results.errors.push(`Contact ${contactId}: ${error.message}`)
      }
    }
    
    this.emitNotesImported(results)
    return results
  }

  // Delete all notes for a contact
  async deleteUserNotes(contactId) {
    if (!this.initialized) await this.initialize()
    
    const notesKey = `user_notes_${contactId}`
    this.storage.remove(notesKey)
    
    this.emitNotesDeleted(contactId)
    return true
  }

  // Event emitters for UI updates
  emitNotesUpdate(contactId, notes) {
    window.dispatchEvent(new CustomEvent('userNotesUpdated', {
      detail: { contactId, notes }
    }))
  }

  emitTrustUpdate(contactId, trustData) {
    window.dispatchEvent(new CustomEvent('trustRatingUpdated', {
      detail: { contactId, trust: trustData }
    }))
  }

  emitNotesImported(results) {
    window.dispatchEvent(new CustomEvent('userNotesImported', {
      detail: results
    }))
  }

  emitNotesDeleted(contactId) {
    window.dispatchEvent(new CustomEvent('userNotesDeleted', {
      detail: { contactId }
    }))
  }

  // Event listeners for UI components
  onNotesUpdate(callback) {
    window.addEventListener('userNotesUpdated', callback)
    return () => window.removeEventListener('userNotesUpdated', callback)
  }

  onTrustUpdate(callback) {
    window.addEventListener('trustRatingUpdated', callback)
    return () => window.removeEventListener('trustRatingUpdated', callback)
  }
}

export default UserNotesManager