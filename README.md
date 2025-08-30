# UltraChat - Privacy-First Messaging Application

UltraChat is a modern, privacy-focused messaging application built with React and featuring end-to-end encryption, multiple profile modes, and cross-service messaging capabilities.

## 🛡️ Privacy-First Design

- **No Tracking**: Zero analytics, no data collection, no behavior monitoring
- **End-to-End Encryption**: All messages encrypted locally using AES-256-GCM
- **Local Storage Only**: All data stored locally on your device
- **Web of Trust**: Decentralized trust system with user endorsements
- **Anonymous Mode**: Complete anonymity with session-based identity

## ✨ Features

### 🔒 Multiple Profile Modes
- **Basic**: Simple messaging with minimal profile information
- **Public**: Public profile with social handles and enhanced visibility
- **Anonymous**: Complete anonymity with temporary session identity
- **Ultra**: Full features with Web of Trust, endorsements, and verification

### 💬 Messaging Engine
- End-to-end encrypted messaging with forward secrecy
- Cross-service messaging (Twitter/X, phone numbers, optional Facebook)
- Local message storage with automatic cleanup
- Read receipts and typing indicators
- Simulated delivery alerts for external services

### 🎨 User Interface
- **Obsidian Black Theme**: Dark theme with deep blacks for eye comfort
- **Silver & Teal Accents**: Modern color palette with high contrast
- **Blue Light Filter**: Customizable blue light reduction
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Accessibility**: High contrast mode and reduced motion support

### 🔐 Security & Privacy
- AES-256-GCM encryption for all messages
- RSA-2048 for key exchange and digital signatures
- PBKDF2 key derivation with 100,000 iterations
- Secure random number generation
- Forward secrecy with key rotation
- Memory-safe key handling

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm (for development)
- Modern web browser with Web Crypto API support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ultrachat.git
   cd ultrachat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 📁 Project Structure

```
UltraChat/
├── src/
│   ├── components/           # React components
│   │   └── UI/              # User interface components
│   │       ├── Layout.jsx   # Main application layout
│   │       ├── ChatList.jsx # Conversation sidebar
│   │       ├── MessageWindow.jsx # Message display and input
│   │       ├── SettingsPanel.jsx # Settings and preferences
│   │       └── ProfileModal.jsx  # Profile management
│   ├── services/            # Core business logic
│   │   ├── Messaging/       # Message handling
│   │   │   ├── MessageEngine.js     # Message coordination
│   │   │   ├── MessageEncryption.js # E2E encryption
│   │   │   └── CrossServiceMessaging.js # External service integration
│   │   ├── Profiles/        # Profile management
│   │   │   ├── ProfileManager.js    # Profile state management
│   │   │   ├── ProfileModes.js      # Mode definitions and validation
│   │   │   └── SocialHandles.js     # Social platform integration
│   │   ├── Trust/           # Web of Trust system
│   │   │   ├── TrustManager.js      # Trust score calculation
│   │   │   ├── EndorsementSystem.js # User endorsements
│   │   │   └── TrustScoring.js      # Trust algorithms
│   │   ├── Settings/        # Application settings
│   │   │   ├── SettingsManager.js   # Settings persistence
│   │   │   ├── PrivacyControls.js   # Privacy preferences
│   │   │   └── ThemeManager.js      # UI theme management
│   │   └── Notifications/   # Notification system
│   │       ├── NotificationManager.js # Notification handling
│   │       └── AlertSounds.js       # Audio notifications
│   ├── utils/               # Utility functions
│   │   ├── CryptoUtils.js   # Cryptographic operations
│   │   ├── LocalStorage.js  # Secure local storage
│   │   └── Constants.js     # Application constants
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Application entry point
│   ├── index.css            # Global styles and theme
│   └── App.css              # Application-specific styles
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
├── vite.config.js          # Vite configuration
└── README.md               # This file
```

## 🔧 Development

### Code Style
- ESLint configuration for code quality
- Consistent naming conventions
- Modular architecture with clear separation of concerns

### Testing
```bash
npm run test
```

### Linting
```bash
npm run lint
```

## 🔐 Security Architecture

### Encryption
- **Message Encryption**: AES-256-GCM with unique keys per conversation
- **Key Derivation**: PBKDF2 with SHA-256, 100,000 iterations
- **Forward Secrecy**: Automatic key rotation for long-term conversations
- **Digital Signatures**: RSA-PSS for message authenticity

### Privacy Protection
- **Zero Analytics**: No usage tracking or data collection
- **Local Storage**: All data stays on your device
- **Metadata Minimization**: Minimal metadata collection
- **Session Isolation**: Anonymous mode with temporary identities

### Web of Trust
- **Decentralized Trust**: No central authority for trust scores
- **Cryptographic Endorsements**: Digitally signed endorsements
- **Trust Propagation**: Transitive trust through endorsement chains
- **Verification**: Multi-method identity verification

## 🌐 Cross-Service Messaging

UltraChat supports secure messaging to external platforms:

- **Twitter/X**: Send encrypted messages via DMs
- **Phone Numbers**: SMS integration with encryption markers
- **Facebook**: Optional integration with privacy controls
- **Email**: Encrypted email bridge (planned)

All external messages include encryption indicators and are never stored on external servers in readable form.

## 🎨 Theming

### Built-in Themes
- **Obsidian Black**: Deep black background for OLED displays
- **Dark Gray**: Standard dark theme
- **Light**: High contrast light theme

### Customization
- Blue light filter with adjustable intensity
- High contrast mode for accessibility
- Custom accent colors (planned)

## 📱 Profile Modes

### Basic Mode
- Minimal profile information
- Local messaging only
- No social handles
- Privacy-focused

### Public Mode
- Public profile with social handles
- Cross-service messaging
- Public directory listing
- Enhanced discoverability

### Anonymous Mode
- Complete anonymity
- Temporary session identity
- No data persistence
- Maximum privacy

### Ultra Mode
- All Public mode features
- Web of Trust integration
- Endorsement system
- Identity verification
- Advanced encryption features

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines and code of conduct.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Issue Reporting
Please use GitHub issues to report bugs or request features.

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

## 🔒 Privacy Policy

UltraChat is designed with privacy at its core:

- **No Data Collection**: We don't collect any personal data
- **No Analytics**: No usage tracking or behavior monitoring
- **No Third-Party Services**: No external analytics or tracking services
- **Local Processing**: All data processing happens on your device
- **No Cloud Storage**: All data stays on your device

## 🆘 Support

- **Documentation**: Check our wiki for detailed guides
- **Issues**: Report bugs on GitHub
- **Discussions**: Join community discussions
- **Security**: Report security issues privately

## 🔮 Roadmap

- [ ] Mobile applications (React Native)
- [ ] Desktop applications (Electron)
- [ ] Voice and video calling
- [ ] File sharing with encryption
- [ ] Group messaging
- [ ] Federated server support
- [ ] Additional external service integrations

## ⚠️ Security Notice

UltraChat is designed for privacy and security, but users should understand:

- This is demonstration software and should be audited before production use
- Always verify the integrity of the application
- Keep your devices secure and updated
- Use strong, unique passwords
- Regular backup your data

## 🙏 Acknowledgments

- Web Crypto API for browser-native cryptography
- React and Vite for the development framework
- The privacy and security community for inspiration and guidance

---

**UltraChat** - Privacy First, Security Always 🛡️⚡