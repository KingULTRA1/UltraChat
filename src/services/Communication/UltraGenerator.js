// Ultra Generator - Dynamic Nickname and Message Generator
// 🚀 UltraChat v1.2.3.4 Final - PRIVACY FIRST

class UltraGenerator {
  constructor() {
    // Predefined cool handles with emojis
    this.predefinedHandles = [
      'Sniper007 🔥',
      'Blaze247 ⚡',
      'ShadowHex 🕶',
      'QuantumVoid',
      'NeonViper ⚡',
      'GhostReaper',
      'PixelPhantom 💀',
      'TurboLynx 🚀',
      'VoltFury ⚡',
      'ByteBandit 💻',
      'CyberNox 🌌',
      'PlasmaNova 🔮',
      'ApexRogue 🗡',
      'OmegaPulse ⚡',
      'MatrixBreaker',
      'NinjaGhost 🥷',
      'CryptoPhantom ₿',
      'StealthNinja 🥷',
      'DigitalViper 💻',
      'NeonWarrior 🌈'
    ];

    // User type emojis
    this.userTypeEmojis = {
      gamer: ['🎮', '🕹️', '🎯', '🏆', '👾', '⚔️', '🛡️'],
      coder: ['💻', '⌨️', '🖥️', '🖱️', '💾', '🔧', '⚙️'],
      casual: ['😎', ' chill', '🤙', '👋', '👍', '👌', '✌️'],
      crypto: ['₿', '💎', '🚀', '💰', '💳', '📈', '🏦'],
      artist: ['🎨', '🖌️', '🖼️', '🎭', '🎬', '📷', '✨'],
      musician: ['🎵', '🎶', '🎸', '🎹', '🥁', '🎧', '🎤']
    };

    // Viral / UltraSpeak responses
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

    // Word pools for dynamic generation
    this.wordPools = {
      adjectives: [
        'epic', 'savage', 'cosmic', 'stealth', 'blazing', 'rogue', 'turbo', 'quantum', 
        'glitch', 'hyper', 'neon', 'apex', 'cyber', 'digital', 'virtual', 'ultra',
        'phantom', 'shadow', 'crystal', 'toxic', 'radiant', 'void', 'nova', 'plasma'
      ],
      nouns: [
        'ninja', 'ghost', 'pixel', 'coder', 'viper', 'phantom', 'lynx', 'cipher', 
        'nova', 'specter', 'mech', 'pulse', 'reaper', 'bandit', 'vortex', 'matrix',
        'blade', 'storm', 'fusion', 'nebula', 'comet', 'phoenix', 'dragon', 'wolf'
      ],
      verbs: [
        'zap', 'smite', 'hack', 'dodge', 'boost', 'flex', 'ignite', 'deploy', 
        'pop', 'surge', 'obliterate', 'warp', 'glitch', 'encrypt', 'transmit', 'evolve',
        'dominate', 'conquer', 'ascend', 'unleash', 'activate', 'initiate', 'execute'
      ],
      suffixes: [
        '007', 'X', '99', 'Pro', 'Elite', 'Max', 'Ultra', 'Prime', 'Alpha', 'Omega',
        '42', '247', '777', 'Zero', 'One', 'Ace', 'King', 'Lord', 'Master', 'Legend'
      ]
    };

    // Emoji enhancements
    this.emojiEnhancements = {
      greetings: ['👋', '🤙', '🙋', '🙌', '👏', '🤝'],
      exclamations: ['🔥', '⚡', '💥', '✨', '🌟', '💫', '🚨', '⚠️'],
      emotions: ['😎', '😏', '😈', '🤯', '🥶', '🤠', '🥸', '🕶️'],
      actions: ['🎮', '💻', '🚀', '💰', '🍕', '🎯', '🏆', '👑']
    };
  }

  // Generate a random predefined handle
  generatePredefinedHandle() {
    return this.predefinedHandles[Math.floor(Math.random() * this.predefinedHandles.length)];
  }

  // Generate a dynamic nickname
  generateDynamicNickname() {
    const adj = this.getRandomElement(this.wordPools.adjectives);
    const noun = this.getRandomElement(this.wordPools.nouns);
    const suffix = this.getRandomElement(this.wordPools.suffixes);
    
    // Capitalize first letters
    const capitalizedAdj = adj.charAt(0).toUpperCase() + adj.slice(1);
    const capitalizedNoun = noun.charAt(0).toUpperCase() + noun.slice(1);
    
    let nickname = `${capitalizedAdj}${capitalizedNoun}`;
    
    // Add suffix sometimes
    if (Math.random() > 0.5) {
      nickname += suffix;
    }
    
    // Add emoji sometimes
    if (Math.random() > 0.7) {
      const emojis = Object.values(this.userTypeEmojis).flat();
      nickname += ' ' + this.getRandomElement(emojis);
    }
    
    return nickname;
  }

  // Generate an UltraSpeak response
  generateUltraSpeak(nickname = null) {
    let response = this.getRandomElement(this.ultraSpeakResponses);
    
    // Personalize with nickname if provided
    if (nickname) {
      response = response.replace('[nick]', nickname);
    }
    
    // Add random emoji enhancement
    if (Math.random() > 0.6) {
      const emojiCategories = Object.values(this.emojiEnhancements);
      const randomCategory = this.getRandomElement(emojiCategories);
      const randomEmoji = this.getRandomElement(randomCategory);
      response += ' ' + randomEmoji;
    }
    
    return response;
  }

  // Generate a viral one-liner
  generateViralOneLiner(nickname = null) {
    const adj = this.getRandomElement(this.wordPools.adjectives);
    const noun = this.getRandomElement(this.wordPools.nouns);
    const verb = this.getRandomElement(this.wordPools.verbs);
    
    const templates = [
      `Ultra ignites the night—${nickname || this.generateDynamicNickname()} reporting!`,
      `${adj.charAt(0).toUpperCase() + adj.slice(1)} ${noun} ${verb}s the scene! ⚡`,
      `Yo ${nickname || '[user]'}, Ultra says ${verb} the scene! ⚡`,
      `${verb.charAt(0).toUpperCase() + verb.slice(1)} mode: ${adj} ${noun} activated! 🔥`,
      `Warning: ${adj} ${noun} energy detected ⚡`,
      `${nickname || '[user]'} just went ${adj}! Ultra approved ✅`,
      `Ultra alert: ${adj} ${noun} incoming 🚨`
    ];
    
    let oneLiner = this.getRandomElement(templates);
    
    // Add random emoji
    if (Math.random() > 0.5) {
      const emojis = Object.values(this.emojiEnhancements).flat();
      oneLiner += ' ' + this.getRandomElement(emojis);
    }
    
    return oneLiner;
  }

  // Generate emoji-enhanced text based on user type
  generateEmojiText(text, userType = 'casual') {
    // Add user type emoji
    let enhancedText = text;
    
    if (this.userTypeEmojis[userType]) {
      const userEmoji = this.getRandomElement(this.userTypeEmojis[userType]);
      enhancedText += ' ' + userEmoji;
    }
    
    // Add random enhancement emoji
    if (Math.random() > 0.7) {
      const emojiCategories = Object.values(this.emojiEnhancements);
      const randomCategory = this.getRandomElement(emojiCategories);
      const randomEmoji = this.getRandomElement(randomCategory);
      enhancedText += ' ' + randomEmoji;
    }
    
    return enhancedText;
  }

  // Generate a complete profile
  generateUltraProfile(userType = 'casual') {
    const nickname = this.generateDynamicNickname();
    const ultraSpeak = this.generateUltraSpeak(nickname);
    const oneLiner = this.generateViralOneLiner(nickname);
    
    return {
      nickname,
      ultraSpeak,
      oneLiner,
      userType,
      enhancedNickname: this.generateEmojiText(nickname, userType)
    };
  }

  // Get random element from array
  getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Generate multiple nicknames
  generateNicknames(count = 5) {
    const nicknames = [];
    for (let i = 0; i < count; i++) {
      nicknames.push(this.generateDynamicNickname());
    }
    return nicknames;
  }

  // Generate multiple UltraSpeak responses
  generateUltraSpeaks(count = 5, nickname = null) {
    const responses = [];
    for (let i = 0; i < count; i++) {
      responses.push(this.generateUltraSpeak(nickname));
    }
    return responses;
  }

  // Generate a nickname suggestion for AuthScreen
  generateAuthNickname() {
    // 70% chance of generating a dynamic nickname, 30% chance of predefined
    if (Math.random() > 0.3) {
      return this.generateDynamicNickname();
    } else {
      return this.generatePredefinedHandle();
    }
  }
}

// Export as singleton
const ultraGenerator = new UltraGenerator();
export default ultraGenerator;