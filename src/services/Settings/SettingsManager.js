// 🚀 UltraChat v1.2.3.4 Final - PRIVACY FIRST
// Settings Manager Service

import LocalStorage from '../../utils/LocalStorage'
import { THEME_MODES, PRIVACY_LEVELS, STORAGE_KEYS } from '../../utils/Constants'

class SettingsManager {
  constructor() {
    this.localStorage = new LocalStorage()
    this.settings = {
      theme: THEME_MODES.BLACK,
      blueFilter: true,
      privacy: PRIVACY_LEVELS.HIGH,
      notifications: true,
      sounds: true,
      autoReply: false,
      encryptionLevel: 'maximum'
    }
  }

  async initialize() {
    try {
      await this.localStorage.initialize()
      await this.loadSettings()
      console.log('✅ SettingsManager initialized')
    } catch (error) {
      console.error('❌ SettingsManager initialization failed:', error)
      throw error
    }
  }

  async loadSettings() {
    try {
      const saved = await this.localStorage.getItem(STORAGE_KEYS.SETTINGS)
      if (saved) {
        this.settings = { ...this.settings, ...saved }
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  async saveSettings() {
    try {
      await this.localStorage.setItem(STORAGE_KEYS.SETTINGS, this.settings)
    } catch (error) {
      console.error('Failed to save settings:', error)
      throw error
    }
  }

  async updateSetting(key, value) {
    this.settings[key] = value
    await this.saveSettings()
    return this.settings
  }

  getSetting(key) {
    return this.settings[key]
  }

  getAllSettings() {
    return { ...this.settings }
  }

  async resetSettings() {
    this.settings = {
      theme: THEME_MODES.BLACK,
      blueFilter: true,
      privacy: PRIVACY_LEVELS.HIGH,
      notifications: true,
      sounds: true,
      autoReply: false,
      encryptionLevel: 'maximum'
    }
    await this.saveSettings()
    return this.settings
  }
}

export default SettingsManager
