// src/extensions/BrowserEnhancer.js
class BrowserEnhancer {
  constructor(chatApp) {
    this.chatApp = chatApp; // Reference to UltraChat core
    this.active = false;
  }

  // Initialize the extension
  init() {
    this.active = true;
    console.log("BrowserEnhancer initialized");
    this.addUIElements();
  }

  // Optional: inject UI elements into the chat interface
  addUIElements() {
    const chatContainer = document.querySelector("#chat-container");
    if (!chatContainer) return;

    const btn = document.createElement("button");
    btn.textContent = "Enhance";
    btn.style.cssText = "position: absolute; top: 10px; right: 10px; z-index: 9999;";
    btn.addEventListener("click", () => this.onEnhanceClick());
    chatContainer.appendChild(btn);
  }

  // Feature logic when button is clicked
  onEnhanceClick() {
    if (!this.active) return;
    console.log("BrowserEnhancer feature triggered");
    // Example enhancement: highlight messages containing URLs
    const messages = document.querySelectorAll(".chat-message");
    messages.forEach(msg => {
      if (msg.textContent.match(/https?:\/\/\S+/)) {
        msg.style.backgroundColor = "#f0f8ff";
      }
    });
  }

  // Clean up if needed
  destroy() {
    this.active = false;
    console.log("BrowserEnhancer destroyed");
    // Remove any added elements
    const btn = document.querySelector("#chat-container button");
    if (btn) btn.remove();
  }
}

// Export for use in UltraChat
export default BrowserEnhancer;