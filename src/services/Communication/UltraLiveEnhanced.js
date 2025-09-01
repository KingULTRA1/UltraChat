// UltraLive Enhanced Module
// 🚀 UltraChat v1.2.3.4 Final - PRIVACY FIRST
// ============================

// --- UltraLive TTS & Overlay Integration ---

class UltraLiveVoiceQueue {
  constructor() {
    this.queue = [];
    this.isSpeaking = false;
  }

  enqueue(user, message) {
    this.queue.push({ user, message });
    this.processQueue();
  }

  async processQueue() {
    if (this.isSpeaking || this.queue.length === 0) return;

    this.isSpeaking = true;
    const { user, message } = this.queue.shift();

    // Apply UltraText transformations
    const transformedMessage = transformText(message, user.textPrefs);

    // Fetch voice settings based on account type
    const { pitch, rate, voice } = getVoiceSettings(user.accountType);

    const utter = new SpeechSynthesisUtterance(transformedMessage);
    utter.pitch = pitch;
    utter.rate = rate;
    if (voice) utter.voice = voice;

    // Animate live orb while speaking
    const orb = document.querySelector(`#liveOrb-${user.id}`);
    orb?.classList.add("speaking");
    utter.onend = () => {
      orb?.classList.remove("speaking");
      this.isSpeaking = false;
      this.processQueue();
    };

    speechSynthesis.speak(utter);
    console.log(`🔊 UltraSpeak: ${user.handle} - ${transformedMessage}`);
  }
}

// --- Voice Settings by Account Type ---
function getVoiceSettings(accountType) {
  // Different profiles have different pitch, rate, or style
  const voices = {
    Legacy: { pitch: 1, rate: 1 },
    OG: { pitch: 1.1, rate: 1.05 },
    Pro: { pitch: 1.2, rate: 1.1 },
    Ultra: { pitch: 1.3, rate: 1.2 },
    "Ultra Elite": { pitch: 1.35, rate: 1.25 },
    Super: { pitch: 1.4, rate: 1.3 },
    Royal: { pitch: 1.25, rate: 1.15 },
    Scholar: { pitch: 1.15, rate: 1 },
    Anon: { pitch: 0.95, rate: 0.9 }
  };
  return voices[accountType] || { pitch: 1, rate: 1 };
}

// --- Text Transformations ---
function transformText(text, prefs = {}) {
  let result = text;
  if (prefs.uppercase) result = result.toUpperCase();
  if (prefs.mirror) result = mirrorText(result);
  if (prefs.upsideDown) result = flipText(result);
  return result;
}

// --- Mirror Text Example ---
function mirrorText(text) {
  const mirrorMap = {
    a: "ɒ", b: "q", c: "ɔ", d: "p", e: "ǝ", f: "ɟ", g: "ƃ",
    h: "ɥ", i: "ᴉ", j: "ɾ", k: "ʞ", l: "ʃ", m: "ɯ", n: "u",
    o: "o", p: "d", q: "b", r: "ɹ", s: "s", t: "ʇ", u: "n",
    v: "ʌ", w: "ʍ", x: "x", y: "ʎ", z: "z", " ": " "
  };
  return text.split("").map(c => mirrorMap[c.toLowerCase()] || c).reverse().join("");
}

// --- Upside Down Text ---
function flipText(text) {
  const flipMap = {
    a:"ɐ", b:"q", c:"ɔ", d:"p", e:"ǝ", f:"ɟ", g:"ƃ",
    h:"ɥ", i:"ᴉ", j:"ɾ", k:"ʞ", l:"ʃ", m:"ɯ", n:"u",
    o:"o", p:"d", q:"b", r:"ɹ", s:"s", t:"ʇ", u:"n",
    v:"ʌ", w:"ʍ", x:"x", y:"ʎ", z:"z", " ":" "
  };
  return text.split("").map(c => flipMap[c.toLowerCase()] || c).join("");
}

// --- Render Live Overlay ---
function renderLiveOverlay(user, container) {
  // Check if overlay already exists
  let overlay = document.getElementById(`overlay-${user.id}`);
  
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = `overlay-${user.id}`;
    overlay.className = "liveOverlay";

    // Live Orb
    const orb = document.createElement("div");
    orb.id = `liveOrb-${user.id}`;
    orb.className = "liveOrb";
    overlay.appendChild(orb);

    // Screen Name & Handle
    const name = document.createElement("div");
    name.className = "screenName";
    // Use privacy handle if available, otherwise use regular handle
    const displayName = user.privacyHandle || user.screenName;
    const displayHandle = user.privacyHandle || `@${user.handle}`;
    name.textContent = `${displayName} (${displayHandle})`;
    overlay.appendChild(name);

    // Account Type Badge
    const accountBadge = document.createElement("div");
    accountBadge.className = "accountBadge";
    accountBadge.textContent = user.accountType;
    overlay.appendChild(accountBadge);

    // Message Chat Box
    const chatBox = document.createElement("div");
    chatBox.id = `chatBox-${user.id}`;
    chatBox.className = "chatOverlay";
    overlay.appendChild(chatBox);

    container.appendChild(overlay);
  }
  
  return overlay;
}

// --- Update Chat Box with New Message ---
function updateChatBox(userId, message, textPrefs = {}, user = null) {
  const chatBox = document.getElementById(`chatBox-${userId}`);
  if (chatBox) {
    const messageElement = document.createElement("div");
    messageElement.className = "message";
    
    // Apply text transformations for display
    const transformedMessage = transformText(message, textPrefs);
    messageElement.textContent = transformedMessage;
    
    // Add visual effects based on preferences
    if (textPrefs.uppercase) messageElement.classList.add("uppercase");
    if (textPrefs.mirror) messageElement.classList.add("mirrored");
    if (textPrefs.upsideDown) messageElement.classList.add("upside-down");
    
    // Add user identifier if available
    if (user && user.privacyHandle) {
      const userElement = document.createElement("span");
      userElement.className = "message-user";
      userElement.textContent = `${user.privacyHandle}: `;
      messageElement.insertBefore(userElement, messageElement.firstChild);
    }
    
    chatBox.appendChild(messageElement);
    
    // Scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

// --- Initialize UltraLive Session ---
function initUltraLiveSession(users, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with ID ${containerId} not found`);
    return;
  }
  
  // Clear existing content
  container.innerHTML = '';
  
  // Create voice queue
  const voiceQueue = new UltraLiveVoiceQueue();
  
  // Render overlays for all users
  users.forEach(user => {
    renderLiveOverlay(user, container);
  });
  
  console.log(`✅ UltraLive session initialized with ${users.length} users`);
  
  return {
    voiceQueue,
    updateChatBox,
    addMessage: (userId, message) => {
      const user = users.find(u => u.id === userId);
      if (user) {
        updateChatBox(userId, message, user.textPrefs, user);
        voiceQueue.enqueue(user, message);
      }
    }
  };
}

// --- CSS Styles for UltraLive (to be added to document) ---
function injectUltraLiveStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .liveOverlay {
      background: #1e1e1e;
      border: 2px solid #0088cc;
      border-radius: 10px;
      padding: 15px;
      margin-bottom: 20px;
      box-shadow: 0 0 15px rgba(0, 136, 204, 0.3);
      position: relative;
    }
    
    .liveOrb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #00ff88;
      display: inline-block;
      margin-right: 10px;
      vertical-align: middle;
      transition: all 0.3s ease;
    }
    
    .liveOrb.speaking {
      background: #ff0000;
      box-shadow: 0 0 15px #ff0000;
      animation: pulse 0.5s infinite alternate;
    }
    
    @keyframes pulse {
      from { transform: scale(1); }
      to { transform: scale(1.2); }
    }
    
    .screenName {
      display: inline-block;
      font-weight: bold;
      font-size: 1.2em;
      color: #00ff88;
      margin-right: 10px;
    }
    
    .accountBadge {
      display: inline-block;
      background: #0088cc;
      color: white;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 0.8em;
      vertical-align: middle;
    }
    
    .chatOverlay {
      margin-top: 10px;
      padding: 10px;
      background: #2d2d2d;
      border-radius: 5px;
      max-height: 200px;
      overflow-y: auto;
    }
    
    .message {
      margin: 5px 0;
      padding: 5px;
      background: #3d3d3d;
      border-radius: 3px;
      font-family: monospace;
    }
    
    .message.uppercase {
      text-transform: uppercase;
    }
    
    .message.mirrored {
      transform: scaleX(-1);
      unicode-bidi: bidi-override;
    }
    
    .message.upside-down {
      transform: rotate(180deg);
      display: inline-block;
    }
    
    .message-user {
      font-weight: bold;
      color: #00ff88;
      margin-right: 5px;
    }
  `;
  
  document.head.appendChild(style);
}

// Export all functions
export {
  UltraLiveVoiceQueue,
  getVoiceSettings,
  transformText,
  mirrorText,
  flipText,
  renderLiveOverlay,
  updateChatBox,
  initUltraLiveSession,
  injectUltraLiveStyles
};

export default {
  UltraLiveVoiceQueue,
  getVoiceSettings,
  transformText,
  mirrorText,
  flipText,
  renderLiveOverlay,
  updateChatBox,
  initUltraLiveSession,
  injectUltraLiveStyles
};