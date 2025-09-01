// ultraNickGenerator.js
// Ultra Viral Nick Generator v2.0
// Generates dynamic, privacy-safe, viral nicknames for all users

const baseNames = [
  "Blaze","Sniper","MatrixBreaker","Neon","Turbo","Shadow","Ghost","Nova",
  "Pixel","Vortex","Cyber","Phantom","Volt","Quantum","Apex","Drift","Hyper",
  "Pulse","Rocket","Ember","Venom","Titan","Luna","Inferno","Aurora","Echo","Storm",
  "Reaper","Omega","Knight","Falcon","Rogue","Crimson","Saber","Wolf","Zero","Alpha",
  "NovaX","Blade","Arcane","Cipher","Glitch","Specter","Onyx","Phaser","Nitro","Frost",
  "Solar","Lynx","Venus","Draco","Titanium","Shadowfax","Havoc","Vector","PulseX","Ignite"
];

const suffixes = ["007","187","247","420","999","1337","X","Max","Ultra","Hyper","Prime"];
const emojis = ["⚡","🔥","💀","🌌","🎯","🛡️","🪐","✨","⚔️","🎮"];

const reservedHandles = ["allday420","2ambootycall","UltraAdmin","root","system"];

/**
 * Generates a random nickname
 * Combines baseName + optional suffix + optional emoji
 */
function generateNick() {
  let base = baseNames[Math.floor(Math.random() * baseNames.length)];
  let suffix = Math.random() < 0.6 ? suffixes[Math.floor(Math.random() * suffixes.length)] : "";
  let emoji = Math.random() < 0.4 ? emojis[Math.floor(Math.random() * emojis.length)] : "";
  
  let nick = `${base}${suffix}${emoji}`;
  
  // Ensure reserved handles are not returned
  while(reservedHandles.includes(nick)) {
    base = baseNames[Math.floor(Math.random() * baseNames.length)];
    suffix = Math.random() < 0.6 ? suffixes[Math.floor(Math.random() * suffixes.length)] : "";
    emoji = Math.random() < 0.4 ? emojis[Math.floor(Math.random() * emojis.length)] : "";
    nick = `${base}${suffix}${emoji}`;
  }

  return nick;
}

/**
 * UltraSpeak message trigger
 * Outputs fun viral message whenever a nick is assigned
 */
function ultraSpeak(nick) {
  const messages = [
    `Yo Ultra spotted **${nick}** in the wild 🔥`,
    `**${nick}** just joined—brace for chaos ⚡`,
    `Incoming: **${nick}** has entered the chat 🌌`,
    `Heads up! **${nick}** is on deck 🎯`,
    `UltraAlert: **${nick}** is ready to roll 🛡️`
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Generate multiple nicks
 * @param {number} count - number of nicks to generate
 */
function generateMultipleNicks(count = 10) {
  const generated = [];
  while(generated.length < count) {
    const nick = generateNick();
    if(!generated.includes(nick)) {
      generated.push(nick);
    }
  }
  return generated;
}

// Example Usage
console.log("Single Nick:", generateNick());
const nickList = generateMultipleNicks(5);
nickList.forEach(nick => console.log(ultraSpeak(nick)));

// Export for external use
export {
  generateNick,
  generateMultipleNicks,
  ultraSpeak
};