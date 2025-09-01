// Ultra Text Generator
// 🚀 UltraChat v1.2.3.4 Final - PRIVACY FIRST

// ===============================
// UltraChat Identity Transformer
// ===============================

// Upside-down mapping for letters & symbols
const upsideDownMap = {
  a:'ɐ', b:'q', c:'ɔ', d:'p', e:'ǝ', f:'ɟ', g:'ƃ', h:'ɥ', i:'ᴉ',
  j:'ɾ', k:'ʞ', l:'ʃ', m:'ɯ', n:'u', o:'o', p:'d', q:'b', r:'ɹ',
  s:'s', t:'ʇ', u:'n', v:'ʌ', w:'ʍ', x:'x', y:'ʎ', z:'z',
  A:'∀', B:'𐐒', C:'Ɔ', D:'◖', E:'Ǝ', F:'Ⅎ', G:'⅁', H:'H', I:'I',
  J:'ſ', K:'ʞ', L:'⅂', M:'W', N:'N', O:'O', P:'Ԁ', Q:'Ό', R:'ᴚ',
  S:'S', T:'⊥', U:'∩', V:'Λ', W:'M', X:'X', Y:'⅄', Z:'Z',
  '1':'Ɩ','2':'ᄅ','3':'Ɛ','4':'ㄣ','5':'ϛ','6':'9','7':'ㄥ','8':'8','9':'6','0':'0',
  '.':'˙', ',':'\\', '\\':',', '"':',,','?':'¿','!':'¡','[':']',']':'[','(':')',')':'(',
  '{':'}','}':'{','<':'>','>':'<','_':'‾','&':'⅋'
};

// Reverse string
function reverseString(str) {
  return str.split('').reverse().join('');
}

// Upside-down transform
function upsideDown(str) {
  return str.split('').map(c => upsideDownMap[c] || c).reverse().join('');
}

// Randomized shuffle
function randomizeString(str) {
  const chars = str.split('');
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

// Layered transformation pipeline
function generateEphemeralID(base, options = { reverse:true, upsideDown:false, randomize:false }) {
  let result = base;
  if (options.reverse) result = reverseString(result);
  if (options.upsideDown) result = upsideDown(result);
  if (options.randomize) result = randomizeString(result);
  return result;
}

// Generate multiple variants
function generateVariants(base, count = 10) {
  const variants = [];
  for (let i = 0; i < count; i++) {
    variants.push(generateEphemeralID(base, {
      reverse: Math.random() > 0.5,
      upsideDown: Math.random() > 0.5,
      randomize: Math.random() > 0.5
    }));
  }
  return variants;
}

// ===============================
// Ultra Word Library v2.0
// ===============================

// Extensive vocabulary for generating rich, dynamic content
const ultraWordLibrary = {
  // Adjectives for vivid descriptions
  adjectives: [
    // Intensity & Power
    'epic', 'savage', 'legendary', 'mythic', 'godlike', 'supreme', 'ultimate', 'prime', 'elite', 'master',
    // Speed & Agility
    'blazing', 'swift', 'rapid', 'hyper', 'turbo', 'sonic', 'lightning', 'flash', 'quick', 'nimble',
    // Stealth & Mystery
    'stealth', 'shadow', 'ghost', 'phantom', 'silent', 'covert', 'hidden', 'veiled', 'cryptic', 'mystic',
    // Technology & Digital
    'cyber', 'digital', 'virtual', 'neon', 'holographic', 'quantum', 'nano', 'tech', 'synthetic', 'electric',
    // Cosmic & Space
    'cosmic', 'stellar', 'galactic', 'interstellar', 'astral', 'celestial', 'orbital', 'planetary', 'void', 'nebula',
    // Elemental
    'fiery', 'icy', 'stormy', 'thunderous', 'volcanic', 'crystalline', 'toxic', 'radioactive', 'plasma', 'atomic',
    // Emotions & Attitude
    'fierce', 'bold', 'audacious', 'daring', 'reckless', 'unstoppable', 'relentless', 'ruthless', 'merciless', 'brutal',
    // Visual & Aesthetic
    'radiant', 'luminous', 'glowing', 'shimmering', 'sparkling', 'brilliant', 'vibrant', 'fluorescent', 'prismatic', 'iridescent'
  ],

  // Nouns for characters, objects, and concepts
  nouns: [
    // Characters & Beings
    'ninja', 'samurai', 'warrior', 'knight', 'vanguard', 'sentinel', 'guardian', 'champion', 'hero', 'legend',
    // Creatures & Animals
    'dragon', 'phoenix', 'wolf', 'lynx', 'falcon', 'raven', 'serpent', 'tiger', 'panther', 'hawk',
    // Technology & Digital
    'cipher', 'matrix', 'algorithm', 'protocol', 'network', 'system', 'interface', 'module', 'engine', 'core',
    // Weapons & Tools
    'blade', 'edge', 'saber', 'scythe', 'hammer', 'gauntlet', 'claw', 'fang', 'sting', 'thorn',
    // Vehicles & Machines
    'jet', 'rocket', 'mech', 'tank', 'vessel', 'craft', 'vehicle', 'machine', 'automaton', 'drone',
    // Natural Phenomena
    'storm', 'tempest', 'cyclone', 'typhoon', 'hurricane', 'tornado', 'blizzard', 'inferno', 'tsunami', 'earthquake',
    // Abstract Concepts
    'pulse', 'wave', 'signal', 'frequency', 'vibration', 'resonance', 'harmony', 'chaos', 'entropy', 'paradox',
    // Locations & Places
    'fortress', 'citadel', 'stronghold', 'bunker', 'outpost', 'station', 'base', 'hub', 'nexus', 'sanctuary'
  ],

  // Verbs for actions and movements
  verbs: [
    // Combat & Conflict
    'annihilate', 'obliterate', 'vanquish', 'conquer', 'dominate', 'subjugate', 'crush', 'demolish', 'destroy', 'eliminate',
    // Movement & Speed
    'dash', 'sprint', 'vault', 'leap', 'bound', 'soar', 'glide', 'dart', 'zoom', 'rush',
    // Technology & Digital
    'hack', 'encrypt', 'decrypt', 'transmit', 'download', 'upload', 'sync', 'stream', 'buffer', 'cache',
    // Magic & Power
    'summon', 'invoke', 'channel', 'unleash', 'release', 'activate', 'trigger', 'initiate', 'execute', 'deploy',
    // Communication
    'transmit', 'broadcast', 'relay', 'dispatch', 'send', 'signal', 'alert', 'notify', 'inform', 'announce',
    // Creation & Transformation
    'forge', 'craft', 'build', 'construct', 'assemble', 'generate', 'produce', 'create', 'synthesize', 'manifest'
  ],

  // Adverbs for enhanced descriptions
  adverbs: [
    // Intensity
    'ferociously', 'relentlessly', 'mercilessly', 'brutally', 'savagely', 'fiercely', 'violently', 'aggressively', 'forcefully', 'powerfully',
    // Speed
    'swiftly', 'rapidly', 'quickly', 'speedily', 'hastily', 'instantly', 'immediately', 'promptly', 'expeditiously', 'posthaste',
    // Manner
    'stealthily', 'silently', 'covertly', 'secretly', 'discreetly', 'clandestinely', 'surreptitiously', 'unobtrusively', 'invisibly', 'imperceptibly',
    // Technology
    'digitally', 'electronically', 'virtually', 'cybernetically', 'algorithmically', 'systematically', 'automatically', 'programmatically', 'digitally', 'wirelessly'
  ],

  // Emojis categorized by type for contextual enhancement
  emojiCategories: {
    // Gaming & Tech
    gaming: ['🎮', '🕹️', '🎯', '🏆', '👾', '⚔️', '🛡️', '🕹', '🎮', '🎲'],
    // Coding & Tech
    coding: ['💻', '⌨️', '🖥️', '🖱️', '💾', '🔧', '⚙️', '🔌', '🔋', '📡'],
    // Social & Casual
    social: ['😎', ' chill', '🤙', '👋', '👍', '👌', '✌️', '💯', '🔥', '✨'],
    // Crypto & Finance
    crypto: ['₿', '💎', '🚀', '💰', '💳', '📈', '🏦', '🪙', '💸', '💎'],
    // Nature & Elements
    nature: ['🌌', '🌠', '⚡', '🔥', '❄️', '🌪️', '🌊', '🌋', '🌙', '☀️'],
    // Emotions & Expressions
    emotions: ['🤯', '🥶', '🤠', '🥸', '🕶️', '😈', '😏', '😎', '🤩', '🥳']
  },

  // Viral phrases and expressions for engaging content
  viralPhrases: [
    // Call to Action
    'Level up your game!',
    'Join the revolution!',
    'Break the matrix!',
    'Hack the system!',
    'Unleash your potential!',
    'Go beyond limits!',
    'Transcend reality!',
    'Ignite the future!',
    'Shape the digital world!',
    'Become unstoppable!',
    
    // Descriptive & Atmospheric
    'Where legends are born',
    'In the realm of the digital gods',
    'Beyond the veil of reality',
    'In the nexus of innovation',
    'At the edge of tomorrow',
    'Where fire meets ice',
    'In the eye of the storm',
    'Between dimensions',
    'Across the digital divide',
    'Through the quantum tunnel',
    
    // Community & Belonging
    'One among the chosen few',
    'Part of the elite squad',
    'Member of the inner circle',
    'Initiate of the digital order',
    'Guardian of the cyber realm',
    'Keeper of the sacred protocols',
    'Master of the hidden arts',
    'Wielder of the ancient codes',
    'Bearer of the legendary badge',
    'Champion of the virtual arena'
  ],
  
  // Fun text chat settings and effects
  chatEffects: [
    'bouncing', 'glowing', 'pulsing', 'spinning', 'shaking', 'waving', 'floating', 'zooming', 'fading', 'sliding'
  ],
  
  // Auto-naming patterns
  namingPatterns: [
    '{adjective}{noun}{number}',
    '{noun}{verb}{suffix}',
    '{adverb}{adjective}{noun}',
    '{letter}{letter}{number}',
    '{techPrefix}{number}'
  ],
  
  // Tech prefixes for naming
  techPrefixes: ['ULTRA', 'CYBER', 'DIGI', 'NEO', 'QUANTUM', 'VIRTUAL', 'CRYPTO', 'STEALTH', 'PHANTOM', 'NEXUS']
};

class UltraTextGenerator {
  constructor() {
    this.styles = new Map()
    this.templates = new Map()
    this.customFormats = new Map()
    this.isInitialized = false
    
    // Identity transformation features
    this.identityTransforms = {
      REVERSE: 'reverse',
      UPSIDE_DOWN: 'upsideDown',
      RANDOMIZE: 'randomize',
      LAYERED: 'layered'
    }
    
    // Ephemeral ID cache for preventing reuse
    this.usedIDs = new Set()
    this.idHistory = new Map()
    
    // Text formatting options
    this.formats = {
      BOLD: 'bold',
      ITALIC: 'italic',
      UNDERLINE: 'underline',
      STRIKETHROUGH: 'strikethrough',
      CODE: 'code',
      SPOILER: 'spoiler',
      RAINBOW: 'rainbow',
      GLOW: 'glow',
      SHADOW: 'shadow',
      GRADIENT: 'gradient'
    }
    
    // Color themes
    this.colorThemes = {
      ULTRACHAT: {
        primary: '#0088cc',
        secondary: '#00a6cc',
        accent: '#00ff88',
        warning: '#ffaa00',
        error: '#ff4444',
        text: '#ffffff'
      },
      NEON: {
        primary: '#ff00ff',
        secondary: '#00ffff',
        accent: '#ffff00',
        warning: '#ff8800',
        error: '#ff0088',
        text: '#ffffff'
      },
      SUNSET: {
        primary: '#ff6b35',
        secondary: '#f7931e',
        accent: '#ffcd3c',
        warning: '#ff8800',
        error: '#e63946',
        text: '#ffffff'
      },
      OCEAN: {
        primary: '#006994',
        secondary: '#0081a7',
        accent: '#00afb9',
        warning: '#ffd60a',
        error: '#e63946',
        text: '#ffffff'
      }
    }
    
    // Emoji categories
    this.emojiCategories = {
      FACES: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚'],
      GESTURES: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏'],
      OBJECTS: ['📱', '💻', '🖥️', '🖨️', '⌨️', '🖱️', '💾', '💿', '📀', '🎮', '📷', '📹', '🎥', '📞', '☎️', '📠', '📺', '📻', '🔊', '🔇'],
      SYMBOLS: ['❤️', '💕', '💖', '💗', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍', '🤎', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💬'],
      CRYPTO: ['₿', '⟠', '◇', '💎', '🚀', '🌙', '📈', '📉', '💰', '💸', '🏦', '💳', '💴', '💵', '💶', '💷', '🪙', '🎯', '⚡', '🔥']
    }
    
    // Text effects
    this.effects = {
      TYPING: 'typing',
      FADE_IN: 'fadeIn',
      SLIDE_IN: 'slideIn',
      BOUNCE: 'bounce',
      PULSE: 'pulse',
      SHAKE: 'shake',
      GLOW_PULSE: 'glowPulse',
      RAINBOW_CYCLE: 'rainbowCycle'
    }
    
    // Fun text chat settings
    this.chatSettings = {
      AUTO_NAMING: 'autoNaming',
      VIRAL_RESPONSES: 'viralResponses',
      FUN_EFFECTS: 'funEffects',
      AUTO_REFRESH: 'autoRefresh'
    }
    
    // Import UltraGenerator for dynamic content
    this.ultraGenerator = null;
    
    // UltraSpeak responses for chat
    this.ultraSpeakResponses = [
      'Yo Ultra\'s calling—don\'t sleep on this!',
      '2AM bootycall locked… pay or pray 😏',
      'Ultra deployed: brace yourself!',
      'Crypto vibes incoming 🚀',
      'This one\'s on fire 🔥 Ultra approved!',
      'Level up, player!',
      'Snack break? Ultra says yes 🍕',
      'Epic drop, Ultra style ⚡',
      'DM Ultra if you dare 😎',
      'Ultra says: hack the night 🌙',
      'Ultra alert: incoming hotness 🔥',
      'Game on, Ultra style 🎮',
      'Ultra mode: activated ⚡',
      'Vibe check: Ultra approved ✅',
      'Warning: Ultra energy detected ⚡'
    ];
    
    // Import the ultra word library
    this.wordLibrary = ultraWordLibrary;
    
    // Voice integration
    this.voiceIntegration = null;
  }

  // Initialize Ultra Text Generator
  async initialize() {
    try {
      console.log('✨ Initializing Ultra Text Generator...')
      
      // Lazy load UltraGenerator to avoid circular dependencies
      if (!this.ultraGenerator) {
        const { default: UltraGenerator } = await import('./UltraGenerator.js');
        this.ultraGenerator = UltraGenerator;
      }
      
      // Load default styles
      this.loadDefaultStyles()
      
      // Load templates
      this.loadDefaultTemplates()
      
      // Initialize custom formats
      this.initializeCustomFormats()
      
      // Initialize voice integration
      this.initializeVoiceIntegration()
      
      this.isInitialized = true
      console.log('✅ Ultra Text Generator initialized')
      
    } catch (error) {
      console.error('❌ Failed to initialize Ultra Text Generator:', error)
      throw error
    }
  }

  // Initialize voice integration
  async initializeVoiceIntegration() {
    try {
      const { default: VoiceIntegration } = await import('./VoiceIntegration.js');
      this.voiceIntegration = VoiceIntegration;
      console.log('✅ Voice integration initialized')
    } catch (error) {
      console.warn('⚠️ Voice integration not available:', error)
      this.voiceIntegration = null;
    }
  }

  // Load default styles
  loadDefaultStyles() {
    // Bold style
    this.styles.set(this.formats.BOLD, {
      fontWeight: 'bold',
      prefix: '**',
      suffix: '**',
      css: 'font-weight: bold;'
    })
    
    // Italic style
    this.styles.set(this.formats.ITALIC, {
      fontStyle: 'italic',
      prefix: '*',
      suffix: '*',
      css: 'font-style: italic;'
    })
    
    // Underline style
    this.styles.set(this.formats.UNDERLINE, {
      textDecoration: 'underline',
      prefix: '__',
      suffix: '__',
      css: 'text-decoration: underline;'
    })
    
    // Strikethrough style
    this.styles.set(this.formats.STRIKETHROUGH, {
      textDecoration: 'line-through',
      prefix: '~~',
      suffix: '~~',
      css: 'text-decoration: line-through;'
    })
    
    // Code style
    this.styles.set(this.formats.CODE, {
      fontFamily: 'monospace',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      prefix: '`',
      suffix: '`',
      css: 'font-family: monospace; background: rgba(255,255,255,0.1); padding: 2px 4px; border-radius: 3px;'
    })
    
    // Spoiler style
    this.styles.set(this.formats.SPOILER, {
      backgroundColor: '#333',
      color: '#333',
      prefix: '||',
      suffix: '||',
      css: 'background: #333; color: #333; transition: all 0.3s;'
    })
    
    // Rainbow style
    this.styles.set(this.formats.RAINBOW, {
      background: 'linear-gradient(45deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080)',
      webkitBackgroundClip: 'text',
      webkitTextFillColor: 'transparent',
      prefix: '🌈',
      suffix: '🌈',
      css: 'background: linear-gradient(45deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-size: 200% 200%; animation: rainbow 3s ease-in-out infinite;'
    })
    
    // Glow style
    this.styles.set(this.formats.GLOW, {
      textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
      prefix: '✨',
      suffix: '✨',
      css: 'text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor;'
    })
    
    console.log('✅ Default styles loaded')
  }

  // Load default templates
  loadDefaultTemplates() {
    // Announcement template
    this.templates.set('announcement', {
      name: 'Announcement',
      template: '📢 **{title}**\n\n{content}\n\n---\n*{timestamp}*',
      variables: ['title', 'content', 'timestamp'],
      style: this.formats.BOLD
    })
    
    // QR Join template
    this.templates.set('qr_join', {
      name: 'QR Join Invite',
      template: '🚀 **Join UltraChat Room**\n\n📱 Scan the QR code below:\n{qr_code}\n\n🏷️ Room: **{room_name}**\n👥 {participant_count} participants\n🔒 {access_level}\n\n{custom_message}',
      variables: ['qr_code', 'room_name', 'participant_count', 'access_level', 'custom_message'],
      style: this.formats.BOLD
    })
    
    // Crypto tip template
    this.templates.set('crypto_tip', {
      name: 'Crypto Tip',
      template: '💰 **Crypto Tip Sent!**\n\n{amount} {currency} → @{recipient}\n\n💬 *"{message}"*\n\n🧾 TX: `{transaction_id}`',
      variables: ['amount', 'currency', 'recipient', 'message', 'transaction_id'],
      style: this.formats.CODE
    })
    
    // Welcome template
    this.templates.set('welcome', {
      name: 'Welcome Message',
      template: '🎉 **Welcome to {room_name}!**\n\n👋 Hi @{username}!\n\n📋 Quick tips:\n• Press `Space` for Push-to-Talk\n• Use `/commands` for help\n• Respect others and have fun!\n\n{custom_rules}',
      variables: ['room_name', 'username', 'custom_rules'],
      style: this.formats.BOLD
    })
    
    // Poll template
    this.templates.set('poll', {
      name: 'Poll/Vote',
      template: '📊 **{poll_title}**\n\n{poll_description}\n\n{options}\n\n⏰ Ends: {end_time}\n👥 {vote_count} votes',
      variables: ['poll_title', 'poll_description', 'options', 'end_time', 'vote_count'],
      style: this.formats.BOLD
    })
    
    console.log('✅ Default templates loaded')
  }

  // Initialize custom formats
  initializeCustomFormats() {
    // Only run in browser environment
    if (typeof document === 'undefined') {
      console.log('ℹ️ Custom formats skipped (Node.js environment)');
      return;
    }
    
    // Create CSS keyframes for animations
    const styleSheet = document.createElement('style')
    styleSheet.textContent = `
      @keyframes rainbow {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      @keyframes typing {
        from { width: 0; }
        to { width: 100%; }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideIn {
        from { transform: translateX(-100%); }
        to { transform: translateX(0); }
      }
      
      @keyframes bounce {
        0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
        40%, 43% { transform: translateY(-30px); }
        70% { transform: translateY(-15px); }
        90% { transform: translateY(-4px); }
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
      
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
      }
      
      @keyframes glowPulse {
        0%, 100% { text-shadow: 0 0 5px currentColor; }
        50% { text-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
      }
      
      .ultra-text-effect-typing {
        overflow: hidden;
        border-right: 2px solid;
        white-space: nowrap;
        animation: typing 2s steps(40, end), blink-caret 0.75s step-end infinite;
      }
      
      .ultra-text-effect-fadeIn { animation: fadeIn 1s ease-in; }
      .ultra-text-effect-slideIn { animation: slideIn 0.5s ease-out; }
      .ultra-text-effect-bounce { animation: bounce 1s; }
      .ultra-text-effect-pulse { animation: pulse 2s infinite; }
      .ultra-text-effect-shake { animation: shake 0.5s; }
      .ultra-text-effect-glowPulse { animation: glowPulse 2s infinite; }
      .ultra-text-effect-rainbowCycle { animation: rainbow 3s ease-in-out infinite; }
      
      .ultra-text-spoiler:hover {
        background: transparent !important;
        color: inherit !important;
      }
    `
    document.head.appendChild(styleSheet)
    
    console.log('✅ Custom formats initialized')
  }

  // Apply formatting to text
  applyFormatting(text, format, options = {}) {
    try {
      const style = this.styles.get(format)
      if (!style) {
        console.warn(`⚠️ Unknown format: ${format}`)
        return text
      }
      
      let formattedText = text
      
      // Apply prefix/suffix for markdown-style formatting
      if (style.prefix && style.suffix) {
        formattedText = `${style.prefix}${text}${style.suffix}`
      }
      
      // Return object with both text and styling info
      return {
        text: formattedText,
        style: style,
        css: style.css,
        className: `ultra-text-${format}`,
        options: options
      }
    } catch (error) {
      console.error('❌ Failed to apply formatting:', error)
      return text
    }
  }

  // Generate colored text
  generateColoredText(text, colorTheme = 'ULTRACHAT', customColors = null) {
    try {
      const theme = customColors || this.colorThemes[colorTheme]
      if (!theme) {
        console.warn(`⚠️ Unknown color theme: ${colorTheme}`)
        return text
      }
      
      // Create gradient text
      const css = `
        background: linear-gradient(45deg, ${theme.primary}, ${theme.secondary}, ${theme.accent});
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-size: 200% 200%;
        animation: rainbow 3s ease-in-out infinite;
      `
      
      return {
        text: text,
        css: css,
        className: 'ultra-text-colored',
        theme: colorTheme
      }
    } catch (error) {
      console.error('❌ Failed to generate colored text:', error)
      return text
    }
  }

  // Add emoji to text
  addEmoji(text, category = 'FACES', position = 'end') {
    try {
      const emojis = this.emojiCategories[category]
      if (!emojis) {
        console.warn(`⚠️ Unknown emoji category: ${category}`)
        return text
      }
      
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
      
      switch (position) {
        case 'start':
          return `${randomEmoji} ${text}`
        case 'end':
          return `${text} ${randomEmoji}`
        case 'both':
          return `${randomEmoji} ${text} ${randomEmoji}`
        case 'random':
          const words = text.split(' ')
          const randomIndex = Math.floor(Math.random() * (words.length + 1))
          words.splice(randomIndex, 0, randomEmoji)
          return words.join(' ')
        default:
          return `${text} ${randomEmoji}`
      }
    } catch (error) {
      console.error('❌ Failed to add emoji:', error)
      return text
    }
  }

  // Apply text effect/animation
  applyEffect(text, effect, duration = 1000) {
    try {
      return {
        text: text,
        effect: effect,
        className: `ultra-text-effect-${effect}`,
        duration: duration,
        css: `animation-duration: ${duration}ms;`
      }
    } catch (error) {
      console.error('❌ Failed to apply effect:', error)
      return text
    }
  }

  // Generate text with template
  generateFromTemplate(templateId, variables = {}) {
    try {
      const template = this.templates.get(templateId)
      if (!template) {
        console.warn(`⚠️ Unknown template: ${templateId}`)
        return null
      }
      
      let generatedText = template.template
      
      // Replace variables
      for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{${key}}`
        generatedText = generatedText.replace(new RegExp(placeholder, 'g'), value)
      }
      
      // Apply default styling
      const formatted = this.applyFormatting(generatedText, template.style)
      
      return {
        text: formatted.text,
        html: this.convertToHTML(formatted),
        template: template,
        variables: variables
      }
    } catch (error) {
      console.error('❌ Failed to generate from template:', error)
      return null
    }
  }

  // Convert formatted text to HTML
  convertToHTML(formattedText) {
    try {
      if (typeof formattedText === 'string') {
        return formattedText
      }
      
      const { text, css, className, effect } = formattedText
      
      let html = `<span class="${className || ''} ${effect ? `ultra-text-effect-${effect}` : ''}" style="${css || ''}">`
      html += this.escapeHTML(text)
      html += '</span>'
      
      return html
    } catch (error) {
      console.error('❌ Failed to convert to HTML:', error)
      return text
    }
  }

  // Convert markdown-style formatting to HTML
  parseMarkdown(text) {
    try {
      let html = text
      
      // Bold
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      
      // Italic
      html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      // Underline
      html = html.replace(/__(.*?)__/g, '<u>$1</u>')
      
      // Strikethrough
      html = html.replace(/~~(.*?)~~/g, '<del>$1</del>')
      
      // Code
      html = html.replace(/`(.*?)`/g, '<code>$1</code>')
      
      // Spoiler
      html = html.replace(/\|\|(.*?)\|\|/g, '<span class="ultra-text-spoiler">$1</span>')
      
      return html
    } catch (error) {
      console.error('❌ Failed to parse markdown:', error)
      return text
    }
  }

  // Create custom style
  createCustomStyle(name, styleDefinition) {
    try {
      this.customFormats.set(name, {
        ...styleDefinition,
        custom: true,
        createdAt: new Date()
      })
      
      console.log(`✅ Custom style created: ${name}`)
      return true
    } catch (error) {
      console.error('❌ Failed to create custom style:', error)
      return false
    }
  }

  // Create custom template
  createCustomTemplate(id, template) {
    try {
      this.templates.set(id, {
        ...template,
        custom: true,
        createdAt: new Date()
      })
      
      console.log(`✅ Custom template created: ${id}`)
      return true
    } catch (error) {
      console.error('❌ Failed to create custom template:', error)
      return false
    }
  }

  // Live preview generation
  generateLivePreview(text, formatOptions = {}) {
    try {
      let preview = text
      
      // Apply formatting
      if (formatOptions.format) {
        preview = this.applyFormatting(preview, formatOptions.format, formatOptions)
      }
      
      // Apply colors
      if (formatOptions.colorTheme) {
        preview = this.generateColoredText(preview.text || preview, formatOptions.colorTheme)
      }
      
      // Add emojis
      if (formatOptions.emoji) {
        preview = this.addEmoji(preview.text || preview, formatOptions.emoji.category, formatOptions.emoji.position)
      }
      
      // Apply effects
      if (formatOptions.effect) {
        preview = this.applyEffect(preview.text || preview, formatOptions.effect, formatOptions.effectDuration)
      }
      
      return {
        text: preview.text || preview,
        html: this.convertToHTML(preview),
        preview: true,
        options: formatOptions
      }
    } catch (error) {
      console.error('❌ Failed to generate live preview:', error)
      return { text, html: text }
    }
  }

  // Escape HTML for security
  escapeHTML(text) {
    // Handle Node.js environment
    if (typeof document === 'undefined') {
      // Simple HTML escaping for Node.js
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
    
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  // Get available styles
  getAvailableStyles() {
    return Array.from(this.styles.keys())
  }

  // Get available templates
  getAvailableTemplates() {
    return Array.from(this.templates.keys())
  }

  // Get color themes
  getColorThemes() {
    return Object.keys(this.colorThemes)
  }

  // Get emoji categories
  getEmojiCategories() {
    return Object.keys(this.emojiCategories)
  }

  // Get effects
  getAvailableEffects() {
    return Object.values(this.effects)
  }

  // Export styles (for sharing)
  exportStyles() {
    return {
      styles: Array.from(this.styles.entries()),
      templates: Array.from(this.templates.entries()),
      customFormats: Array.from(this.customFormats.entries()),
      version: '1.2.3'
    }
  }

  // Import styles
  importStyles(styleData) {
    try {
      if (styleData.styles) {
        styleData.styles.forEach(([key, value]) => {
          this.styles.set(key, value)
        })
      }
      
      if (styleData.templates) {
        styleData.templates.forEach(([key, value]) => {
          this.templates.set(key, value)
        })
      }
      
      if (styleData.customFormats) {
        styleData.customFormats.forEach(([key, value]) => {
          this.customFormats.set(key, value)
        })
      }
      
      console.log('✅ Styles imported successfully')
      return true
    } catch (error) {
      console.error('❌ Failed to import styles:', error)
      return false
    }
  }

  // ===============================
  // Identity Transformation Methods
  // ===============================

  // Generate ephemeral ID with transformation options
  generateEphemeralID(base, options = { reverse: true, upsideDown: false, randomize: false }) {
    return generateEphemeralID(base, options)
  }

  // New mirrorStack function for two-line stacking text transformation
  mirrorStack(text) {
    // Use the existing upsideDownMap
    const flipped = text.split('').map(c => upsideDownMap[c] || c).reverse().join('');
    // Create top line with spaces between characters
    const topLine = text.split('').join(' ');
    // Create bottom line with spaces between characters
    const bottomLine = flipped.split('').join(' ');
    return `${topLine}\n${bottomLine}`;
  }

  // Speak text using voice integration
  speakText(text, options = {}) {
    if (!this.voiceIntegration || !this.voiceIntegration.isVoiceSupported()) {
      console.warn('⚠️ Voice integration not available');
      return false;
    }
    
    // Set voice options based on user type or emoji context
    const voiceSettings = {
      rate: options.rate || 1.0,
      pitch: options.pitch || 1.0,
      volume: options.volume || 1.0
    };
    
    // Apply different voice settings based on context
    if (options.userType) {
      switch (options.userType) {
        case 'gamer':
          voiceSettings.rate = 1.2;
          voiceSettings.pitch = 1.3;
          break;
        case 'coder':
          voiceSettings.rate = 1.1;
          voiceSettings.pitch = 0.8;
          break;
        case 'crypto':
          voiceSettings.rate = 1.0;
          voiceSettings.pitch = 1.2;
          break;
        default:
          voiceSettings.rate = 1.0;
          voiceSettings.pitch = 1.0;
      }
    }
    
    // Adjust for emojis
    if (options.emojis) {
      // Make voice more expressive for emojis
      voiceSettings.rate = 0.9;
      voiceSettings.pitch = 1.1;
    }
    
    this.voiceIntegration.setSettings(voiceSettings);
    return this.voiceIntegration.speakText(text);
  }

  // Generate and speak UltraSpeak response
  generateAndSpeakUltraSpeak(nickname = null, options = {}) {
    const response = this.generateUltraSpeak(nickname);
    this.speakText(response, options);
    return response;
  }

  // Generate and speak viral message
  generateAndSpeakViralMessage(nickname = null, options = {}) {
    const message = this.generateViralMessage(nickname);
    this.speakText(message, options);
    return message;
  }

  // Generate and speak mirrored text
  generateAndSpeakMirrorStack(text, options = {}) {
    const mirrored = this.mirrorStack(text);
    // Speak only the original text, not the mirrored version
    this.speakText(text, options);
    return mirrored;
  }

  // Generate multiple ID variants
  generateVariants(base, count = 10) {
    return generateVariants(base, count)
  }

  // Generate unique ephemeral ID (prevents reuse)
  generateUniqueEphemeralID(base, maxAttempts = 50) {
    let attempts = 0
    let uniqueID = null
    
    while (attempts < maxAttempts) {
      const candidate = this.generateEphemeralID(base, {
        reverse: Math.random() > 0.5,
        upsideDown: Math.random() > 0.5,
        randomize: Math.random() > 0.5
      })
      
      if (!this.usedIDs.has(candidate)) {
        this.usedIDs.add(candidate)
        uniqueID = candidate
        
        // Store in history with timestamp
        this.idHistory.set(candidate, {
          originalBase: base,
          generated: new Date(),
          reused: false
        })
        
        break
      }
      attempts++
    }
    
    if (!uniqueID) {
      // Fallback: add random suffix
      const fallback = `${base}_${Math.random().toString(36).substr(2, 5)}`
      uniqueID = this.generateEphemeralID(fallback)
      this.usedIDs.add(uniqueID)
    }
    
    return uniqueID
  }

  // Transform text with identity effects
  transformTextIdentity(text, transformType) {
    switch (transformType) {
      case this.identityTransforms.REVERSE:
        return reverseString(text)
      case this.identityTransforms.UPSIDE_DOWN:
        return upsideDown(text)
      case this.identityTransforms.RANDOMIZE:
        return randomizeString(text)
      case this.identityTransforms.LAYERED:
        return this.generateEphemeralID(text, {
          reverse: true,
          upsideDown: true,
          randomize: false
        })
      default:
        return text
    }
  }

  // Generate profile variations for user
  generateProfileVariations(username, options = {}) {
    const variations = {
      original: username,
      reversed: reverseString(username),
      upsideDown: upsideDown(username),
      randomized: randomizeString(username),
      ephemeral: this.generateUniqueEphemeralID(username),
      variants: this.generateVariants(username, options.variantCount || 5)
    }
    
    // Add crypto-style IDs if requested
    if (options.includeCrypto) {
      variations.btcStyle = this.generateCryptoStyleID(username, 'BTC')
      variations.dogeStyle = this.generateCryptoStyleID(username, 'DOGE')
    }
    
    return variations
  }

  // Generate crypto-style address-like IDs
  generateCryptoStyleID(base, cryptoType = 'BTC') {
    const transformed = this.generateEphemeralID(base, { randomize: true })
    
    switch (cryptoType) {
      case 'BTC':
        return `1${transformed.substring(0, 8).toUpperCase()}${Math.random().toString(36).substr(2, 5)}`
      case 'DOGE':
        return `D${transformed.substring(0, 8).toUpperCase()}${Math.random().toString(36).substr(2, 5)}`
      case 'ETH':
        return `0x${transformed.substring(0, 10).toLowerCase()}${Math.random().toString(16).substr(2, 6)}`
      default:
        return transformed
    }
  }

  // Auto-refresh ephemeral nickname
  autoRefreshNickname(baseUsername, intervalMs = 300000) { // 5 minutes default
    const refreshID = setInterval(() => {
      const newNickname = this.generateUniqueEphemeralID(baseUsername)
      
      // Dispatch event for UI to update
      window.dispatchEvent(new CustomEvent('nicknameRefresh', {
        detail: {
          oldNickname: baseUsername,
          newNickname: newNickname,
          timestamp: new Date()
        }
      }))
      
      console.log(`🔄 Nickname refreshed: ${baseUsername} → ${newNickname}`)
    }, intervalMs)
    
    return refreshID // Return ID so it can be cleared
  }

  // Clear used IDs (for testing or reset)
  clearIDHistory() {
    this.usedIDs.clear()
    this.idHistory.clear()
    console.log('🗑️ ID history cleared')
  }

  // Get ID usage statistics
  getIDStats() {
    return {
      totalGenerated: this.usedIDs.size,
      historyEntries: this.idHistory.size,
      oldestEntry: this.idHistory.size > 0 ? 
        Math.min(...Array.from(this.idHistory.values()).map(entry => entry.generated.getTime())) : null,
      newestEntry: this.idHistory.size > 0 ? 
        Math.max(...Array.from(this.idHistory.values()).map(entry => entry.generated.getTime())) : null
    }
  }

  // ===============================
  // Auto-Naming and Viral Response Methods
  // ===============================

  // Generate auto-naming suggestions
  generateAutoNameSuggestions(count = 5) {
    const suggestions = [];
    
    for (let i = 0; i < count; i++) {
      const pattern = this.getRandomElement(this.wordLibrary.namingPatterns);
      let name = pattern;
      
      // Replace placeholders
      name = name.replace('{adjective}', this.getRandomElement(this.wordLibrary.adjectives));
      name = name.replace('{noun}', this.getRandomElement(this.wordLibrary.nouns));
      name = name.replace('{verb}', this.getRandomElement(this.wordLibrary.verbs));
      name = name.replace('{adverb}', this.getRandomElement(this.wordLibrary.adverbs));
      name = name.replace('{number}', Math.floor(Math.random() * 1000));
      name = name.replace('{letter}', this.getRandomElement('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')));
      name = name.replace('{suffix}', this.getRandomElement(['X', 'Pro', 'Max', 'Ultra', 'Prime', 'Elite']));
      name = name.replace('{techPrefix}', this.getRandomElement(this.wordLibrary.techPrefixes));
      
      suggestions.push(this.capitalize(name));
    }
    
    return suggestions;
  }

  // Generate viral response
  generateViralResponse(context = {}) {
    // Select a random viral phrase
    const phrase = this.getRandomElement(this.wordLibrary.viralPhrases);
    
    // Add random emoji
    const emojiCategory = this.getRandomElement(Object.keys(this.wordLibrary.emojiCategories));
    const emoji = this.getRandomElement(this.wordLibrary.emojiCategories[emojiCategory]);
    
    // Apply random effect
    const effect = this.getRandomElement(this.wordLibrary.chatEffects);
    
    // Create the response
    let response = `${phrase} ${emoji}`;
    
    // Apply effect if requested
    if (context.applyEffect) {
      response = this.applyEffect(response, effect);
    }
    
    return response;
  }

  // Generate fun text with effects
  generateFunText(text, options = {}) {
    // Apply random effect
    if (options.randomEffect !== false) {
      const effect = this.getRandomElement(Object.values(this.effects));
      return this.applyEffect(text, effect);
    }
    
    // Apply specific effect if provided
    if (options.effect) {
      return this.applyEffect(text, options.effect);
    }
    
    // Add random emoji
    if (options.addEmoji !== false) {
      const category = this.getRandomElement(Object.keys(this.emojiCategories));
      return this.addEmoji(text, category);
    }
    
    return text;
  }

  // Get random element from array
  getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Capitalize first letter
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ===============================
  // Enhanced Chat Settings Methods
  // ===============================

  // Enable auto-naming
  enableAutoNaming(enabled = true) {
    // In a real implementation, this would update user settings
    console.log(`Auto-naming ${enabled ? 'enabled' : 'disabled'}`);
    return enabled;
  }

  // Enable viral responses
  enableViralResponses(enabled = true) {
    // In a real implementation, this would update user settings
    console.log(`Viral responses ${enabled ? 'enabled' : 'disabled'}`);
    return enabled;
  }

  // Enable fun effects
  enableFunEffects(enabled = true) {
    // In a real implementation, this would update user settings
    console.log(`Fun effects ${enabled ? 'enabled' : 'disabled'}`);
    return enabled;
  }

  // Cleanup
  destroy() {
    console.log('🛑 Destroying Ultra Text Generator...')
    
    this.styles.clear()
    this.templates.clear()
    this.customFormats.clear()
    this.usedIDs.clear()
    this.idHistory.clear()
    
    this.isInitialized = false
    console.log('✅ Ultra Text Generator destroyed')
  }

  // Generate an UltraSpeak response
  generateUltraSpeak(nickname = null) {
    if (this.ultraGenerator) {
      return this.ultraGenerator.generateUltraSpeak(nickname);
    }
    
    // Use the new viral message generator for more impressive content
    return this.generateViralMessage(nickname);
  }

  // Generate a dynamic nickname
  generateDynamicNickname() {
    if (this.ultraGenerator) {
      return this.ultraGenerator.generateDynamicNickname();
    }
    
    // Use the new rich nickname generator for more impressive content
    return this.generateRichNickname();
  }

  // Generate a dynamic, rich nickname using the word library
  generateRichNickname() {
    // Choose pattern randomly
    const patterns = [
      () => {
        // Adjective + Noun + Number
        const adj = this.getRandomElement(this.wordLibrary.adjectives);
        const noun = this.getRandomElement(this.wordLibrary.nouns);
        const number = Math.floor(Math.random() * 1000);
        return `${this.capitalize(adj)}${this.capitalize(noun)}${number}`;
      },
      () => {
        // Noun + Verb + Suffix
        const noun = this.getRandomElement(this.wordLibrary.nouns);
        const verb = this.getRandomElement(this.wordLibrary.verbs);
        const suffix = ['X', 'Pro', 'Max', 'Ultra', 'Prime'][Math.floor(Math.random() * 5)];
        return `${this.capitalize(noun)}${this.capitalize(verb)}${suffix}`;
      },
      () => {
        // Adverb + Adjective + Noun
        const adv = this.getRandomElement(this.wordLibrary.adverbs);
        const adj = this.getRandomElement(this.wordLibrary.adjectives);
        const noun = this.getRandomElement(this.wordLibrary.nouns);
        return `${this.capitalize(adv)}${this.capitalize(adj)}${this.capitalize(noun)}`;
      },
      () => {
        // Tech pattern: [A-Z]{2,4}[0-9]{2,4}
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const letterPart = Array.from({length: 2 + Math.floor(Math.random() * 3)}, () => 
          letters[Math.floor(Math.random() * letters.length)]).join('');
        const numberPart = Math.floor(Math.random() * 9000) + 1000;
        return `${letterPart}${numberPart}`;
      }
    ];
    
    const nickname = this.getRandomElement(patterns)();
    
    // Add emoji sometimes (30% chance)
    if (Math.random() < 0.3) {
      const emojiCategories = Object.values(this.wordLibrary.emojiCategories);
      const randomCategory = this.getRandomElement(emojiCategories);
      const emoji = this.getRandomElement(randomCategory);
      return `${nickname} ${emoji}`;
    }
    
    return nickname;
  }

  // Generate an ultra-viral message using the word library
  generateViralMessage(nickname = null) {
    // If no nickname provided, generate one
    if (!nickname) {
      nickname = this.generateRichNickname();
    }
    
    // Message templates using the word library
    const templates = [
      () => {
        const verb = this.getRandomElement(this.wordLibrary.verbs);
        const adj = this.getRandomElement(this.wordLibrary.adjectives);
        return `🔥 **${nickname}** just used ${verb} to become ${adj}! Ultra approved!`;
      },
      () => {
        const noun = this.getRandomElement(this.wordLibrary.nouns);
        const phrase = this.getRandomElement(this.wordLibrary.viralPhrases);
        return `⚡ Alert: **${nickname}** has acquired the ${noun} of ${phrase}`;
      },
      () => {
        const adj1 = this.getRandomElement(this.wordLibrary.adjectives);
        const adj2 = this.getRandomElement(this.wordLibrary.adjectives);
        return `🎮 **${nickname}** is now ${adj1} and ${adj2}! Level up, player!`;
      },
      () => {
        const verb = this.getRandomElement(this.wordLibrary.verbs);
        const adv = this.getRandomElement(this.wordLibrary.adverbs);
        return `🚀 **${nickname}** will ${adv} ${verb} the competition!`;
      },
      () => {
        const phrase = this.getRandomElement(this.wordLibrary.viralPhrases);
        return `🌟 ${phrase} - Welcome **${nickname}** to the elite squad!`;
      },
      () => {
        const adj = this.getRandomElement(this.wordLibrary.adjectives);
        const noun = this.getRandomElement(this.wordLibrary.nouns);
        return `💎 **${nickname}** is straight ${adj} ${noun} energy! Crypto vibes! 🚀`;
      }
    ];
    
    const message = this.getRandomElement(templates)();
    
    // Add extra emoji sometimes (40% chance)
    if (Math.random() < 0.4) {
      const emojis = Object.values(this.wordLibrary.emojiCategories).flat();
      const emoji = this.getRandomElement(emojis);
      return `${message} ${emoji}`;
    }
    
    return message;
  }

  // Generate a story snippet using the word library
  generateStorySnippet() {
    const protagonist = this.generateRichNickname();
    const antagonist = this.generateRichNickname();
    const location = this.getRandomElement(this.wordLibrary.nouns);
    const action = this.getRandomElement(this.wordLibrary.verbs);
    const weapon = this.getRandomElement(this.wordLibrary.nouns);
    const outcome = Math.random() > 0.5 ? 'victory' : 'defeat';
    
    const storyTemplates = [
      `In the digital realm of ${this.capitalize(location)}, ${protagonist} faced ${antagonist} in an epic battle. Wielding the ${weapon}, ${protagonist} prepared to ${action}...`,
      `The ${this.capitalize(location)} protocol was under attack! ${protagonist} rushed to defend against ${antagonist}, who sought to ${action} the sacred ${weapon}.`,
      `Legend tells of ${protagonist}, who once ${action} the ancient ${weapon} to defeat ${antagonist} in the realm of ${this.capitalize(location)}.`,
      `Within the ${this.capitalize(location)} matrix, ${protagonist} discovered the ${weapon} of ${antagonist}. To prevent catastrophe, ${protagonist} would have to ${action}...`
    ];
    
    return this.getRandomElement(storyTemplates);
  }

  // Generate a tech specification using the word library
  generateTechSpec() {
    const adj = this.getRandomElement(this.wordLibrary.adjectives);
    const noun = this.getRandomElement(this.wordLibrary.nouns);
    const verb = this.getRandomElement(this.wordLibrary.verbs);
    const adv = this.getRandomElement(this.wordLibrary.adverbs);
    
    const specs = [
      `${this.capitalize(adj)} ${this.capitalize(noun)} Core: ${this.capitalize(verb)} ${adv} at quantum speeds`,
      `${this.capitalize(noun)} Interface v${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
      `Encrypted with ${adj} ${noun} protocol - ${adv} ${verb} secured`,
      `${this.capitalize(noun)} ${this.capitalize(verb)} Engine: ${adj} performance, ${adv} execution`
    ];
    
    return this.getRandomElement(specs);
  }

  // Helper method to get random element from array
  getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Helper method to capitalize first letter
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export default UltraTextGenerator