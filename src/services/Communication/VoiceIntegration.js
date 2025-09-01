// Voice Integration Service
// 🚀 UltraChat v1.2.3.4 Final - PRIVACY FIRST

class VoiceIntegration {
  constructor() {
    this.isSupported = 'speechSynthesis' in window;
    this.isListeningSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    this.synth = this.isSupported ? window.speechSynthesis : null;
    this.recognition = null;
    
    // Voice settings
    this.settings = {
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      voice: null
    };
    
    // Voice profiles for different user types
    this.voiceProfiles = {
      gamer: { rate: 1.2, pitch: 1.3, volume: 1.0 },
      coder: { rate: 1.1, pitch: 0.8, volume: 1.0 },
      crypto: { rate: 1.0, pitch: 1.2, volume: 1.0 },
      casual: { rate: 1.0, pitch: 1.0, volume: 1.0 },
      artist: { rate: 0.9, pitch: 1.1, volume: 1.0 },
      musician: { rate: 1.0, pitch: 1.3, volume: 1.0 }
    };
    
    // Emoji-based voice modifications
    this.emojiVoiceModifiers = {
      '🎮': { rate: 1.3, pitch: 1.2 },  // Gaming - excited
      '💻': { rate: 1.1, pitch: 0.9 },  // Coding - technical
      '₿': { rate: 1.0, pitch: 1.2 },   // Crypto - confident
      '🔥': { rate: 1.1, pitch: 1.3 },  // Fire - energetic
      '⚡': { rate: 1.2, pitch: 1.1 },  // Lightning - quick
      '🚀': { rate: 1.1, pitch: 1.2 },  // Rocket - enthusiastic
      '😎': { rate: 0.9, pitch: 1.1 },  // Cool - relaxed
      '🤯': { rate: 1.3, pitch: 1.4 },  // Mind blown - exaggerated
      '🥶': { rate: 0.8, pitch: 0.9 },  // Cold - slow
      '🤠': { rate: 1.0, pitch: 1.1 }   // Cowboy - distinctive
    };
    
    // Available voices
    this.voices = [];
    
    // Initialize voices if supported
    if (this.isSupported) {
      this.initializeVoices();
    }
  }
  
  // Initialize available voices
  initializeVoices() {
    if (!this.isSupported) return;
    
    const loadVoices = () => {
      this.voices = this.synth.getVoices();
      console.log('✅ Voice integration initialized with', this.voices.length, 'voices');
    };
    
    // Chrome loads voices asynchronously
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    } else {
      // Firefox and others
      loadVoices();
    }
  }
  
  // Set voice settings
  setSettings(settings) {
    this.settings = { ...this.settings, ...settings };
  }
  
  // Apply voice profile based on user type
  applyVoiceProfile(userType) {
    if (this.voiceProfiles[userType]) {
      this.setSettings(this.voiceProfiles[userType]);
      return true;
    }
    return false;
  }
  
  // Apply emoji-based voice modifications
  applyEmojiModifiers(emojis) {
    if (!emojis || emojis.length === 0) return;
    
    // Find matching emoji modifiers
    for (const emoji of emojis) {
      if (this.emojiVoiceModifiers[emoji]) {
        this.setSettings(this.emojiVoiceModifiers[emoji]);
        return true;
      }
    }
    return false;
  }
  
  // Speak text using TTS
  speakText(text, options = {}) {
    if (!this.isSupported) {
      console.warn('⚠️ Text-to-speech not supported in this browser');
      return false;
    }
    
    // Cancel any ongoing speech
    this.synth.cancel();
    
    // Create speech utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply settings
    utterance.rate = this.settings.rate;
    utterance.pitch = this.settings.pitch;
    utterance.volume = this.settings.volume;
    
    // Set voice if specified
    if (this.settings.voice) {
      utterance.voice = this.settings.voice;
    }
    
    // Set callbacks
    if (options.onEnd) {
      utterance.onend = options.onEnd;
    }
    
    if (options.onStart) {
      utterance.onstart = options.onStart;
    }
    
    if (options.onError) {
      utterance.onerror = options.onError;
    }
    
    // Speak the text
    this.synth.speak(utterance);
    console.log('🔊 Speaking:', text);
    return true;
  }
  
  // Stop speaking
  stopSpeaking() {
    if (this.isSupported) {
      this.synth.cancel();
    }
  }
  
  // Get available voices
  getVoices() {
    return this.voices;
  }
  
  // Set specific voice by name
  setVoiceByName(voiceName) {
    const voice = this.voices.find(v => v.name === voiceName);
    if (voice) {
      this.settings.voice = voice;
      return true;
    }
    return false;
  }
  
  // Initialize speech recognition
  initializeRecognition() {
    if (!this.isListeningSupported) {
      console.warn('⚠️ Speech recognition not supported in this browser');
      return false;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    // Configure recognition
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';
    
    console.log('✅ Speech recognition initialized');
    return true;
  }
  
  // Start listening for speech
  startListening(onResult, onError) {
    if (!this.recognition) {
      const initialized = this.initializeRecognition();
      if (!initialized) return false;
    }
    
    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('🎤 Recognized speech:', transcript);
      if (onResult) onResult(transcript);
    };
    
    this.recognition.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error);
      if (onError) onError(event.error);
    };
    
    try {
      this.recognition.start();
      console.log('🎤 Started listening...');
      return true;
    } catch (error) {
      console.error('❌ Failed to start speech recognition:', error);
      return false;
    }
  }
  
  // Stop listening
  stopListening() {
    if (this.recognition && this.recognition.state !== 'inactive') {
      this.recognition.stop();
      console.log('🔇 Stopped listening');
    }
  }
  
  // Check if browser supports voice features
  isVoiceSupported() {
    return this.isSupported;
  }
  
  // Check if browser supports speech recognition
  isSpeechRecognitionSupported() {
    return this.isListeningSupported;
  }
}

// Export as singleton
const voiceIntegration = new VoiceIntegration();
export default voiceIntegration;