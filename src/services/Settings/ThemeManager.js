// 🚀 UltraChat v1.2.3.4 Final - PRIVACY FIRST
// Theme Manager Service

import { THEME_MODES } from '../../utils/Constants'

class ThemeManager {
  constructor() {
    this.currentTheme = THEME_MODES.BLACK
    this.blueFilterEnabled = true
    this.customTheme = null
  }

  async initialize() {
    try {
      this.loadThemeFromStorage()
      this.applyTheme(this.currentTheme)
      console.log('✅ ThemeManager initialized')
    } catch (error) {
      console.error('❌ ThemeManager initialization failed:', error)
      throw error
    }
  }

  loadThemeFromStorage() {
    const savedTheme = localStorage.getItem('ultrachat-theme') || THEME_MODES.BLACK
    const savedBlueFilter = localStorage.getItem('ultrachat-blue-filter') !== 'false'
    
    this.currentTheme = savedTheme
    this.blueFilterEnabled = savedBlueFilter
  }

  applyTheme(themeName) {
    this.currentTheme = themeName
    document.documentElement.setAttribute('data-theme', themeName)
    document.documentElement.setAttribute('data-blue-filter', this.blueFilterEnabled)
    
    localStorage.setItem('ultrachat-theme', themeName)
    localStorage.setItem('ultrachat-blue-filter', this.blueFilterEnabled)
  }

  toggleBlueFilter() {
    this.blueFilterEnabled = !this.blueFilterEnabled
    document.documentElement.setAttribute('data-blue-filter', this.blueFilterEnabled)
    localStorage.setItem('ultrachat-blue-filter', this.blueFilterEnabled)
    return this.blueFilterEnabled
  }

  setCustomTheme(themeConfig) {
    this.customTheme = themeConfig
    localStorage.setItem('ultrachat-custom-theme', JSON.stringify(themeConfig))
  }

  getCurrentTheme() {
    return this.currentTheme
  }

  getAvailableThemes() {
    return Object.values(THEME_MODES)
  }

  isBlueFilterEnabled() {
    return this.blueFilterEnabled
  }
}

export default ThemeManager