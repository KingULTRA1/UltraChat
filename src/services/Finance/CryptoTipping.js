/*
 * Crypto Tipping Service - UltraChat v1.2.3.4 Final
 * 
 * Enhanced crypto tipping with full currency support:
 * - BTC, ETH, DOGE, LTC, SOL, PYTH, LINK
 * - Transaction logging and audit trails
 * - Wallet integration and QR code generation
 * - Exchange rate tracking and notifications
 */

import LocalStorage from '../../utils/LocalStorage'
import * as Constants from '../../utils/Constants';

class CryptoTipping {
  constructor(auditManager) {
    this.storage = new LocalStorage()
    this.auditManager = auditManager
    this.exchangeRates = new Map()
    this.walletAddresses = new Map()
    this.pendingTransactions = new Map()
    this.initialized = false
  }

  async initialize() {
    try {
      // Load wallet addresses
      const wallets = await this.storage.retrieve('crypto_wallets', {})
      this.walletAddresses = new Map(Object.entries(wallets))
      
      // Load pending transactions
      const pending = await this.storage.retrieve('pending_transactions', [])
      this.pendingTransactions = new Map(pending.map(tx => [tx.id, tx]))
      
      // Initialize exchange rates
      await this.updateExchangeRates()
      
      this.initialized = true
      console.log('CryptoTipping initialized successfully')
    } catch (error) {
      console.error('Failed to initialize CryptoTipping:', error)
      throw error
    }
  }

  // Set wallet address for a currency
  async setWalletAddress(currency, address, user) {
    try {
      if (!Constants.CRYPTO_CURRENCIES[currency.toUpperCase()]) {
        throw new Error('Unsupported cryptocurrency')
      }

      // Validate address format (basic validation)
      if (!this.validateWalletAddress(currency, address)) {
        throw new Error('Invalid wallet address format')
      }

      const walletData = {
        currency: currency.toUpperCase(),
        address: address,
        userId: user.id,
        addedAt: new Date().toISOString(),
        verified: false
      }

      this.walletAddresses.set(`${user.id}_${currency}`, walletData)
      await this.saveWalletAddresses()

      return {
        success: true,
        message: `${currency.toUpperCase()} wallet address added successfully`
      }
    } catch (error) {
      console.error('Failed to set wallet address:', error)
      throw error
    }
  }

  // Create tip transaction
  async createTip(tipData, sender) {
    try {
      const { recipientId, currency, amount, messageId, message } = tipData

      // Validate inputs
      if (!Constants.CRYPTO_CURRENCIES[currency.toUpperCase()]) {
        throw new Error('Unsupported cryptocurrency')
      }

      if (amount <= 0) {
        throw new Error('Tip amount must be greater than 0')
      }

      // Get recipient wallet address
      const recipientWallet = this.walletAddresses.get(`${recipientId}_${currency}`)
      if (!recipientWallet) {
        throw new Error(`Recipient doesn't have a ${currency.toUpperCase()} wallet address`)
      }

      // Generate transaction
      const transactionId = this.generateTransactionId()
      const exchangeRate = this.exchangeRates.get(currency.toUpperCase()) || 0
      
      const transaction = {
        id: transactionId,
        senderId: sender.id,
        senderName: sender.name,
        recipientId: recipientId,
        currency: currency.toUpperCase(),
        amount: parseFloat(amount),
        usdValue: parseFloat(amount) * exchangeRate,
        walletAddress: recipientWallet.address,
        messageId: messageId,
        message: message || '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        exchangeRate: exchangeRate,
        networkFee: this.calculateNetworkFee(currency, amount),
        qrCode: null
      }

      // Generate QR code for payment
      transaction.qrCode = await this.generatePaymentQR(transaction)

      this.pendingTransactions.set(transactionId, transaction)
      await this.savePendingTransactions()

      // Log transaction creation
      await this.auditManager.logCryptoTransaction(transaction, sender, {
        action: 'tip_created',
        walletAddress: recipientWallet.address
      })

      return {
        success: true,
        transactionId: transactionId,
        transaction: transaction,
        message: 'Tip created successfully. Please complete payment using the QR code.'
      }
    } catch (error) {
      console.error('Failed to create tip:', error)
      throw error
    }
  }

  // Confirm transaction (simulate blockchain confirmation)
  async confirmTransaction(transactionId, txHash, confirmingUser) {
    try {
      const transaction = this.pendingTransactions.get(transactionId)
      if (!transaction) {
        throw new Error('Transaction not found')
      }

      // Update transaction status
      transaction.status = 'confirmed'
      transaction.confirmedAt = new Date().toISOString()
      transaction.hash = txHash
      transaction.confirmedBy = confirmingUser.id

      // Move to completed transactions
      const completedTransactions = await this.storage.retrieve('completed_transactions', [])
      completedTransactions.push(transaction)
      await this.storage.store('completed_transactions', completedTransactions)

      // Remove from pending
      this.pendingTransactions.delete(transactionId)
      await this.savePendingTransactions()

      // Log confirmation
      await this.auditManager.logCryptoTransaction(transaction, confirmingUser, {
        action: 'tip_confirmed',
        transactionHash: txHash
      })

      // Send notifications
      await this.sendTipNotifications(transaction)

      return {
        success: true,
        transaction: transaction,
        message: 'Transaction confirmed successfully!'
      }
    } catch (error) {
      console.error('Failed to confirm transaction:', error)
      throw error
    }
  }

  // Cancel pending transaction
  async cancelTransaction(transactionId, cancelingUser, reason = '') {
    try {
      const transaction = this.pendingTransactions.get(transactionId)
      if (!transaction) {
        throw new Error('Transaction not found')
      }

      // Only sender can cancel
      if (transaction.senderId !== cancelingUser.id) {
        throw new Error('Only the sender can cancel this transaction')
      }

      transaction.status = 'cancelled'
      transaction.cancelledAt = new Date().toISOString()
      transaction.cancelReason = reason

      this.pendingTransactions.delete(transactionId)
      await this.savePendingTransactions()

      // Log cancellation
      await this.auditManager.logCryptoTransaction(transaction, cancelingUser, {
        action: 'tip_cancelled',
        reason: reason
      })

      return {
        success: true,
        message: 'Transaction cancelled successfully'
      }
    } catch (error) {
      console.error('Failed to cancel transaction:', error)
      throw error
    }
  }

  // Get user's transaction history
  async getTransactionHistory(userId, filters = {}) {
    try {
      const completedTransactions = await this.storage.retrieve('completed_transactions', [])
      
      let userTransactions = completedTransactions.filter(tx => 
        tx.senderId === userId || tx.recipientId === userId
      )

      // Apply filters
      if (filters.currency) {
        userTransactions = userTransactions.filter(tx => tx.currency === filters.currency.toUpperCase())
      }

      if (filters.startDate) {
        userTransactions = userTransactions.filter(tx => 
          new Date(tx.createdAt) >= new Date(filters.startDate)
        )
      }

      if (filters.endDate) {
        userTransactions = userTransactions.filter(tx => 
          new Date(tx.createdAt) <= new Date(filters.endDate)
        )
      }

      // Add transaction type (sent/received)
      userTransactions = userTransactions.map(tx => ({
        ...tx,
        type: tx.senderId === userId ? 'sent' : 'received'
      }))

      return userTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } catch (error) {
      console.error('Failed to get transaction history:', error)
      return []
    }
  }

  // Get user's wallet addresses
  async getUserWallets(userId) {
    const userWallets = {}
    
    for (const [key, wallet] of this.walletAddresses) {
      if (wallet.userId === userId) {
        userWallets[wallet.currency] = {
          address: wallet.address,
          verified: wallet.verified,
          addedAt: wallet.addedAt
        }
      }
    }
    
    return userWallets
  }

  // Get supported currencies with current rates
  async getSupportedCurrencies() {
    const currencies = []
    
    for (const [symbol, name] of Object.entries(Constants.CRYPTO_CURRENCIES)) {
      const rate = this.exchangeRates.get(symbol) || 0
      currencies.push({
        symbol: symbol,
        name: name,
        exchangeRate: rate,
        icon: this.getCurrencyIcon(symbol)
      })
    }
    
    return currencies
  }

  // Generate payment QR code
  async generatePaymentQR(transaction) {
    // Generate cryptocurrency payment URI
    const uri = this.generatePaymentURI(transaction)
    
    // In a real implementation, this would generate an actual QR code image
    // For now, we'll return the payment URI
    return {
      uri: uri,
      data: `Pay ${transaction.amount} ${transaction.currency} to ${transaction.walletAddress}`,
      instructions: `Scan this QR code with your ${transaction.currency} wallet to send the tip.`
    }
  }

  // Generate payment URI for different cryptocurrencies
  generatePaymentURI(transaction) {
    const { currency, amount, walletAddress, message } = transaction
    
    switch (currency) {
      case 'BTC':
        return `bitcoin:${walletAddress}?amount=${amount}&message=${encodeURIComponent(message)}`
      case 'ETH':
        return `ethereum:${walletAddress}?value=${amount}e18&message=${encodeURIComponent(message)}`
      case 'DOGE':
        return `dogecoin:${walletAddress}?amount=${amount}&message=${encodeURIComponent(message)}`
      case 'LTC':
        return `litecoin:${walletAddress}?amount=${amount}&message=${encodeURIComponent(message)}`
      default:
        return `${currency.toLowerCase()}:${walletAddress}?amount=${amount}&message=${encodeURIComponent(message)}`
    }
  }

  // Update exchange rates (mock implementation)
  async updateExchangeRates() {
    try {
      // In a real implementation, this would fetch from a crypto API
      const mockRates = {
        BTC: 45000.00,
        ETH: 2500.00,
        DOGE: 0.08,
        LTC: 75.00,
        SOL: 95.00,
        PYTH: 0.45,
        LINK: 15.50
      }

      this.exchangeRates.clear()
      for (const [currency, rate] of Object.entries(mockRates)) {
        this.exchangeRates.set(currency, rate)
      }

      // Cache rates
      await this.storage.store('exchange_rates', Object.fromEntries(this.exchangeRates))
      await this.storage.store('rates_updated', new Date().toISOString())

      console.log('Exchange rates updated successfully')
    } catch (error) {
      console.error('Failed to update exchange rates:', error)
    }
  }

  // Validate wallet address format
  validateWalletAddress(currency, address) {
    const patterns = {
      BTC: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/,
      ETH: /^0x[a-fA-F0-9]{40}$/,
      DOGE: /^D{1}[5-9A-HJ-NP-U]{1}[1-9A-HJ-NP-Za-km-z]{32}$/,
      LTC: /^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/,
      SOL: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
      PYTH: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
      LINK: /^0x[a-fA-F0-9]{40}$/ // ERC-20 token
    }

    const pattern = patterns[currency.toUpperCase()]
    return pattern ? pattern.test(address) : false
  }

  // Calculate network fee (estimated)
  calculateNetworkFee(currency, amount) {
    const feeRates = {
      BTC: 0.0001,
      ETH: 0.002,
      DOGE: 0.01,
      LTC: 0.001,
      SOL: 0.00025,
      PYTH: 0.00025,
      LINK: 0.002
    }

    const rate = feeRates[currency.toUpperCase()] || 0.001
    return parseFloat((parseFloat(amount) * rate).toFixed(8))
  }

  // Get currency icon
  getCurrencyIcon(symbol) {
    const icons = {
      BTC: '₿',
      ETH: 'Ξ',
      DOGE: 'Ð',
      LTC: 'Ł',
      SOL: '◎',
      PYTH: '🔮',
      LINK: '🔗'
    }
    return icons[symbol] || '💰'
  }

  // Send notifications for tip
  async sendTipNotifications(transaction) {
    // This would integrate with the notification system
    console.log(`Tip notification: ${transaction.senderName} sent ${transaction.amount} ${transaction.currency} tip`)
  }

  // Generate unique transaction ID
  generateTransactionId() {
    return 'tip_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15)
  }

  // Save wallet addresses
  async saveWalletAddresses() {
    const walletsObj = Object.fromEntries(this.walletAddresses)
    await this.storage.store('crypto_wallets', walletsObj)
  }

  // Save pending transactions
  async savePendingTransactions() {
    const transactionsArray = Array.from(this.pendingTransactions.values())
    await this.storage.store('pending_transactions', transactionsArray)
  }

  // Get tipping statistics
  async getTippingStats(userId) {
    const completedTransactions = await this.storage.retrieve('completed_transactions', [])
    const userTransactions = completedTransactions.filter(tx => 
      tx.senderId === userId || tx.recipientId === userId
    )

    const sent = userTransactions.filter(tx => tx.senderId === userId)
    const received = userTransactions.filter(tx => tx.recipientId === userId)

    return {
      totalSent: sent.length,
      totalReceived: received.length,
      totalSentValue: sent.reduce((sum, tx) => sum + (tx.usdValue || 0), 0),
      totalReceivedValue: received.reduce((sum, tx) => sum + (tx.usdValue || 0), 0),
      currencies: [...new Set(userTransactions.map(tx => tx.currency))],
      recentActivity: userTransactions.slice(0, 10)
    }
  }

  destroy() {
    this.exchangeRates.clear()
    this.walletAddresses.clear()
    this.pendingTransactions.clear()
    this.initialized = false
  }
}

export default CryptoTipping