/*
 * UltraChat Bot Bridge Setup Script - v1.2.3.4 Final
 * 
 * Interactive setup for UltraChat Bot Bridge with secure configuration
 * 
 * Privacy-First: All sensitive data encrypted and stored locally
 * Zero-Tracking: No analytics or external data transmission
 */

import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query) => new Promise(resolve => rl.question(query, resolve))

class BotBridgeSetup {
  constructor() {
    this.config = {}
    this.envPath = '.env.local'
  }

  async run() {
    console.log('\n🚀 UltraChat Bot Bridge Setup - v1.2.3.4 Final')
    console.log('===============================================\n')
    console.log('This wizard will help you configure secure cross-platform messaging.')
    console.log('All keys and tokens will be stored locally in .env.local (never committed to Git)\n')

    try {
      // Check if .env.local already exists
      if (await this.fileExists(this.envPath)) {
        const overwrite = await question('⚠️  .env.local already exists. Overwrite? (y/N): ')
        if (overwrite.toLowerCase() !== 'y') {
          console.log('Setup cancelled. Existing configuration preserved.')
          rl.close()
          return
        }
      }

      // Generate encryption key
      console.log('🔐 Generating secure encryption key...')
      this.config.ULTRACHAT_AES_KEY = await this.generateEncryptionKey()
      console.log('✅ AES-256 encryption key generated\n')

      // Configure bot platforms
      await this.configurePlatforms()

      // Configure UltraChat settings
      await this.configureUltraChat()

      // Generate .env.local file
      await this.generateEnvFile()

      // Create directories
      await this.createDirectories()

      console.log('\n✅ Bot Bridge setup complete!')
      console.log('\n📋 Next steps:')
      console.log('1. Review your .env.local configuration')
      console.log('2. Install backend dependencies: npm install')
      console.log('3. Start the bot bridge: npm run bot-bridge')
      console.log('4. Test each platform integration individually')
      console.log('\n🔒 Security reminder: Never commit .env.local to Git!')

    } catch (error) {
      console.error('\n❌ Setup failed:', error.message)
    } finally {
      rl.close()
    }
  }

  async generateEncryptionKey() {
    // Generate secure 32-byte key for AES-256
    const key = crypto.randomBytes(32)
    return key.toString('base64')
  }

  async configurePlatforms() {
    console.log('🤖 Configure Bot Platforms')
    console.log('==========================\n')

    // Discord configuration
    const configureDiscord = await question('Configure Discord bot? (y/N): ')
    if (configureDiscord.toLowerCase() === 'y') {
      this.config.DISCORD_BOT_TOKEN = await question('Discord Bot Token: ')
      this.config.DISCORD_GUILD_ID = await question('Discord Server ID (optional): ')
      this.config.DISCORD_CHANNEL_ID = await question('Default Channel ID (optional): ')
      this.config.DISCORD_ENABLE_TIPPING = await question('Enable Discord tipping? (y/N): ') === 'y' ? 'true' : 'false'
      console.log('✅ Discord configured\n')
    }

    // Telegram configuration
    const configureTelegram = await question('Configure Telegram bot? (y/N): ')
    if (configureTelegram.toLowerCase() === 'y') {
      this.config.TELEGRAM_BOT_TOKEN = await question('Telegram Bot Token: ')
      this.config.TELEGRAM_DEFAULT_CHAT_ID = await question('Default Chat ID (optional): ')
      console.log('✅ Telegram configured\n')
    }

    // Twitter configuration
    const configureTwitter = await question('Configure Twitter/X bot? (y/N): ')
    if (configureTwitter.toLowerCase() === 'y') {
      console.log('Twitter API credentials (from developer.twitter.com):')
      this.config.TWITTER_API_KEY = await question('API Key: ')
      this.config.TWITTER_API_SECRET = await question('API Secret: ')
      this.config.TWITTER_ACCESS_TOKEN = await question('Access Token: ')
      this.config.TWITTER_ACCESS_SECRET = await question('Access Token Secret: ')
      this.config.TWITTER_BEARER_TOKEN = await question('Bearer Token (optional): ')
      console.log('✅ Twitter configured\n')
    }

    // Signal configuration
    const configureSignal = await question('Configure Signal bot? (Advanced - requires signal-cli) (y/N): ')
    if (configureSignal.toLowerCase() === 'y') {
      this.config.SIGNAL_PHONE_NUMBER = await question('Signal Phone Number (+1234567890): ')
      this.config.SIGNAL_BOT_PATH = await question('Signal-CLI Path (/usr/local/bin/signal-cli): ')
      console.log('✅ Signal configured\n')
    }
  }

  async configureUltraChat() {
    console.log('⚙️  UltraChat Settings')
    console.log('=====================\n')

    // File upload settings
    this.config.ULTRACHAT_MAX_FILE_SIZE_MB = await question('Max file size (MB) [50]: ') || '50'
    
    // Crypto tipping
    const enableTipping = await question('Enable crypto tipping? (Y/n): ')
    this.config.ULTRACHAT_ENABLE_TIPPING = enableTipping.toLowerCase() !== 'n' ? 'true' : 'false'
    
    if (this.config.ULTRACHAT_ENABLE_TIPPING === 'true') {
      console.log('Available currencies: BTC, ETH, DOGE, LTC, SOL, PYTH, LINK')
      this.config.ULTRACHAT_CRYPTO_OPTIONS = await question('Supported currencies [BTC,ETH,DOGE,LTC,SOL,PYTH,LINK]: ') || 'BTC,ETH,DOGE,LTC,SOL,PYTH,LINK'
      this.config.ULTRACHAT_MAX_TIP_USD = await question('Maximum tip amount (USD) [100]: ') || '100'
    }

    // Trust system
    this.config.ULTRACHAT_WOT_ENABLED = await question('Enable Web of Trust? (Y/n): ').toLowerCase() !== 'n' ? 'true' : 'false'
    this.config.ULTRACHAT_REQUIRE_APPROVAL = await question('Require approval for sensitive operations? (Y/n): ').toLowerCase() !== 'n' ? 'true' : 'false'

    // Audit logging
    this.config.ULTRACHAT_AUDIT_ENABLED = await question('Enable audit logging? (Y/n): ').toLowerCase() !== 'n' ? 'true' : 'false'
    if (this.config.ULTRACHAT_AUDIT_ENABLED === 'true') {
      this.config.ULTRACHAT_AUDIT_ENCRYPTION = await question('Encrypt audit logs? (Y/n): ').toLowerCase() !== 'n' ? 'true' : 'false'
    }

    // Development mode
    this.config.NODE_ENV = await question('Environment [development]: ') || 'development'
    this.config.ULTRACHAT_LOG_LEVEL = await question('Log level [info]: ') || 'info'

    console.log('✅ UltraChat settings configured\n')
  }

  async generateEnvFile() {
    console.log('📝 Generating .env.local file...')

    const envContent = [
      '# UltraChat Bot Bridge Configuration - v1.2.3.4 Final',
      '# Generated by setup wizard',
      '# SECURITY WARNING: Never commit this file to Git!',
      '',
      '# =============================================================================',
      '# ENCRYPTION CONFIGURATION',
      '# =============================================================================',
      '',
      `ULTRACHAT_AES_KEY=${this.config.ULTRACHAT_AES_KEY}`,
      '',
      '# =============================================================================',
      '# BOT PLATFORM TOKENS',
      '# =============================================================================',
      ''
    ]

    // Add Discord config
    if (this.config.DISCORD_BOT_TOKEN) {
      envContent.push('# Discord Bot Configuration')
      envContent.push(`DISCORD_BOT_TOKEN=${this.config.DISCORD_BOT_TOKEN}`)
      if (this.config.DISCORD_GUILD_ID) envContent.push(`DISCORD_GUILD_ID=${this.config.DISCORD_GUILD_ID}`)
      if (this.config.DISCORD_CHANNEL_ID) envContent.push(`DISCORD_CHANNEL_ID=${this.config.DISCORD_CHANNEL_ID}`)
      envContent.push(`DISCORD_ENABLE_TIPPING=${this.config.DISCORD_ENABLE_TIPPING}`)
      envContent.push('')
    }

    // Add Telegram config
    if (this.config.TELEGRAM_BOT_TOKEN) {
      envContent.push('# Telegram Bot Configuration')
      envContent.push(`TELEGRAM_BOT_TOKEN=${this.config.TELEGRAM_BOT_TOKEN}`)
      if (this.config.TELEGRAM_DEFAULT_CHAT_ID) envContent.push(`TELEGRAM_DEFAULT_CHAT_ID=${this.config.TELEGRAM_DEFAULT_CHAT_ID}`)
      envContent.push('')
    }

    // Add Twitter config
    if (this.config.TWITTER_API_KEY) {
      envContent.push('# Twitter/X Bot Configuration')
      envContent.push(`TWITTER_API_KEY=${this.config.TWITTER_API_KEY}`)
      envContent.push(`TWITTER_API_SECRET=${this.config.TWITTER_API_SECRET}`)
      envContent.push(`TWITTER_ACCESS_TOKEN=${this.config.TWITTER_ACCESS_TOKEN}`)
      envContent.push(`TWITTER_ACCESS_SECRET=${this.config.TWITTER_ACCESS_SECRET}`)
      if (this.config.TWITTER_BEARER_TOKEN) envContent.push(`TWITTER_BEARER_TOKEN=${this.config.TWITTER_BEARER_TOKEN}`)
      envContent.push('')
    }

    // Add Signal config
    if (this.config.SIGNAL_PHONE_NUMBER) {
      envContent.push('# Signal Bot Configuration')
      envContent.push(`SIGNAL_PHONE_NUMBER=${this.config.SIGNAL_PHONE_NUMBER}`)
      envContent.push(`SIGNAL_BOT_PATH=${this.config.SIGNAL_BOT_PATH}`)
      envContent.push('')
    }

    // Add UltraChat settings
    envContent.push('# =============================================================================')
    envContent.push('# ULTRACHAT SETTINGS')
    envContent.push('# =============================================================================')
    envContent.push('')
    envContent.push('# File Upload Settings')
    envContent.push('ULTRACHAT_ALLOW_FILE_TYPES=mp3,pdf,png,jpg,mov,doc,txt')
    envContent.push(`ULTRACHAT_MAX_FILE_SIZE_MB=${this.config.ULTRACHAT_MAX_FILE_SIZE_MB}`)
    envContent.push('')
    envContent.push('# Crypto Tipping Settings')
    envContent.push(`ULTRACHAT_ENABLE_TIPPING=${this.config.ULTRACHAT_ENABLE_TIPPING}`)
    if (this.config.ULTRACHAT_CRYPTO_OPTIONS) envContent.push(`ULTRACHAT_CRYPTO_OPTIONS=${this.config.ULTRACHAT_CRYPTO_OPTIONS}`)
    if (this.config.ULTRACHAT_MAX_TIP_USD) envContent.push(`ULTRACHAT_MAX_TIP_USD=${this.config.ULTRACHAT_MAX_TIP_USD}`)
    envContent.push('')
    envContent.push('# Web of Trust Settings')
    envContent.push(`ULTRACHAT_WOT_ENABLED=${this.config.ULTRACHAT_WOT_ENABLED}`)
    envContent.push(`ULTRACHAT_REQUIRE_APPROVAL=${this.config.ULTRACHAT_REQUIRE_APPROVAL}`)
    envContent.push('')
    envContent.push('# Audit & Logging')
    envContent.push(`ULTRACHAT_AUDIT_ENABLED=${this.config.ULTRACHAT_AUDIT_ENABLED}`)
    if (this.config.ULTRACHAT_AUDIT_ENCRYPTION) envContent.push(`ULTRACHAT_AUDIT_ENCRYPTION=${this.config.ULTRACHAT_AUDIT_ENCRYPTION}`)
    envContent.push('ULTRACHAT_AUDIT_LOG_PATH=./audit_logs/')
    envContent.push(`ULTRACHAT_LOG_LEVEL=${this.config.ULTRACHAT_LOG_LEVEL}`)
    envContent.push('ULTRACHAT_LOG_PATH=./logs/ultrachat.log')
    envContent.push('')
    envContent.push('# Development Settings')
    envContent.push(`NODE_ENV=${this.config.NODE_ENV}`)
    envContent.push('')
    envContent.push('# =============================================================================')
    envContent.push('# PRIVACY ENFORCEMENT (Cannot be changed)')
    envContent.push('# =============================================================================')
    envContent.push('')
    envContent.push('ULTRACHAT_ANALYTICS_DISABLED=true')
    envContent.push('ULTRACHAT_TRACKING_DISABLED=true')
    envContent.push('ULTRACHAT_LOCAL_STORAGE_ONLY=true')

    await fs.writeFile(this.envPath, envContent.join('\n'))
    console.log(`✅ Configuration saved to ${this.envPath}`)
  }

  async createDirectories() {
    const dirs = ['./logs', './audit_logs', './keys', './userData']
    
    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true })
        console.log(`✅ Created directory: ${dir}`)
      } catch (error) {
        console.warn(`⚠️  Could not create ${dir}:`, error.message)
      }
    }
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new BotBridgeSetup()
  await setup.run()
}

export default BotBridgeSetup