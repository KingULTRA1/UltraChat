// Alert Sounds Generator - Privacy-First Audio Notifications
// Generates notification sounds locally without external resources

class AlertSounds {
  constructor() {
    this.audioContext = null
    this.enabled = true
  }

  // Initialize audio context
  initialize() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      return true
    } catch (error) {
      console.error('Audio context initialization failed:', error)
      return false
    }
  }

  // Play notification sound
  async playSound(type = 'default', volume = 0.1) {
    if (!this.enabled || !this.audioContext) {
      if (!this.initialize()) return false
    }

    try {
      const soundConfig = this.getSoundConfig(type)
      await this.generateTone(soundConfig, volume)
      return true
    } catch (error) {
      console.error('Failed to play sound:', error)
      return false
    }
  }

  // Get sound configuration by type
  getSoundConfig(type) {
    const configs = {
      default: {
        frequency: 440,
        duration: 0.3,
        type: 'sine'
      },
      message: {
        frequency: 440,
        duration: 0.2,
        type: 'sine'
      },
      endorsement: {
        frequency: 523,
        duration: 0.4,
        type: 'sine'
      },
      security: {
        frequency: 349,
        duration: 0.6,
        type: 'triangle'
      },
      error: {
        frequency: 200,
        duration: 0.5,
        type: 'sawtooth'
      },
      success: {
        frequency: 659,
        duration: 0.3,
        type: 'sine'
      }
    }

    return configs[type] || configs.default
  }

  // Generate audio tone
  async generateTone(config, volume) {
    const { frequency, duration, type } = config
    const currentTime = this.audioContext.currentTime

    // Create oscillator
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    // Connect nodes
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // Configure oscillator
    oscillator.frequency.setValueAtTime(frequency, currentTime)
    oscillator.type = type

    // Configure gain (volume envelope)
    gainNode.gain.setValueAtTime(0, currentTime)
    gainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.05)
    gainNode.gain.linearRampToValueAtTime(volume * 0.8, currentTime + duration * 0.8)
    gainNode.gain.linearRampToValueAtTime(0, currentTime + duration)

    // Play sound
    oscillator.start(currentTime)
    oscillator.stop(currentTime + duration)

    // Return promise that resolves when sound finishes
    return new Promise(resolve => {
      setTimeout(resolve, duration * 1000)
    })
  }

  // Play notification sequence
  async playSequence(sounds, gap = 0.1) {
    for (const sound of sounds) {
      await this.playSound(sound.type, sound.volume)
      if (gap > 0) {
        await new Promise(resolve => setTimeout(resolve, gap * 1000))
      }
    }
  }

  // Play startup sound
  async playStartup() {
    const sequence = [
      { type: 'message', volume: 0.05 },
      { type: 'endorsement', volume: 0.05 },
      { type: 'success', volume: 0.08 }
    ]
    await this.playSequence(sequence, 0.1)
  }

  // Enable/disable sounds
  setEnabled(enabled) {
    this.enabled = enabled
  }

  // Check if sounds are enabled
  isEnabled() {
    return this.enabled
  }

  // Clean up audio context
  destroy() {
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }
}

export default AlertSounds