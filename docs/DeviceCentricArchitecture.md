# UltraChat Device-Centric Architecture

## Overview

UltraChat's new device-centric architecture eliminates external bot dependencies and places the user's device as the authoritative source of identity and communication. This approach ensures maximum privacy, security, and autonomy for users.

## Key Principles

### 1. Device-Centric Identity

* Every user has a **local identity keypair** stored on their device
* This identity is the single source of truth — no credentials are stored on other platforms
* Logging in on UltraChat automatically authenticates all connected functions without needing separate logins

### 2. Unified Message Handling

* Messages are handled **directly within UltraChat**:
  * Text, voice, events, etc., all managed locally
  * Cross-platform visibility is optional but **driven from UltraChat**, not bots
* If a user posts "Hello World," it exists **universally wherever they have UltraChat**, without needing separate relays

### 3. Account Types & Permissions

* Map root identity to account types: **Basic, Public, Legacy, Pro, Ultra, Ultra Elite, Anon Pro, Anon, Stealth, Lockdown**
* Permissions control which features (chat, voice, events) are available
* Lockdown/Stealth mode can restrict visibility while still keeping the device fully functional

### 4. No External Bot Dependencies

* UltraChat handles everything internally — no Discord bot or third-party bridge required
* This prevents your identity from being banned on another platform since **UltraChat's core is the authoritative source**
* External platforms can be optional "views," not gateways

### 5. Default App Approach

* UltraChat acts as the **primary app**:
  * All messages, events, and history are **stored locally and encrypted**
  * Cross-platform access happens only when the user opts in
  * Single login — one keypair per device — governs all actions

## Architecture Components

### Device Identity Manager

The Device Identity Manager handles all cryptographic identity operations:

```
Device Identity Manager
├── RSA Key Pair Generation
├── Identity Storage (Encrypted)
├── Data Signing/Verification
├── Identity Loading/Creation
```

### Unified Messaging Service

The Unified Messaging Service handles all communication without external dependencies:

```
Unified Messaging Service
├── Message Encryption/Decryption
├── Local Message Storage
├── Account Type Permissions
├── Message Creation/Retrieval
```

### Unified Server

The Unified Server provides the backend API without external bot bridges:

```
Unified Server
├── Device Identity Endpoints
├── QR Login Endpoints
├── Messaging Endpoints
├── Permission Management
```

## Security Features

### Cryptographic Identity

* Each device generates a unique RSA-2048 keypair
* Private keys are stored locally (encrypted in production)
* All messages are encrypted with AES-256-GCM
* Message keys are encrypted with RSA-OAEP

### Local Data Storage

* All user data is stored locally on the device
* No external data transmission
* End-to-end encryption for all communications
* Secure key management

### Permission System

* Role-based feature access
* Account type verification
* Secure authentication
* Fine-grained permission controls

## Benefits

### Privacy

* Zero data collection
* Privacy-first design
* Local-only storage
* No analytics or tracking

### Security

* Device-based authentication
* Cryptographic identity verification
* End-to-end encryption
* No external attack vectors

### Autonomy

* Cannot be banned from your own app
* Full control over your identity
* No dependency on external platforms
* Self-sovereign identity

## Implementation Roadmap

### Phase 1: Core Architecture
- [x] Device Identity Manager
- [x] Unified Messaging Service
- [x] Unified Server
- [x] Authentication Flow

### Phase 2: Feature Implementation
- [x] Message Encryption
- [x] Local Storage
- [x] Account Type Permissions
- [x] QR Login

### Phase 3: UI Integration
- [x] Auth Screen Updates
- [ ] Main App Integration
- [ ] Settings Panel
- [ ] Device Management

### Phase 4: Advanced Features
- [ ] Voice Chat
- [ ] Event Calendar
- [ ] Trust System
- [ ] Crypto Tipping

## API Endpoints

### Device Identity
```
GET /device/identity - Get device identity
```

### Messaging
```
POST /messages - Create a new message
GET /messages - Get all messages (with filters)
GET /messages/:id - Get specific message
PUT /messages/:id/status - Update message status
```

### Permissions
```
POST /users/:id/permissions - Set user permissions
GET /users/:id/permissions - Get user permissions
GET /users/:id/permissions/:feature - Check feature permission
```

### QR Login
```
GET /qr-login - Generate QR login data
GET /qr-login/image - Generate QR login image
```

## Running the Unified Server

To start the new device-centric server:

```bash
cd backend
npm run unified
```

For development with auto-reload:

```bash
cd backend
npm run unified-dev
```

## Migration from Bot Bridge

The new architecture is designed to be backward compatible with existing data while providing a cleaner, more secure approach:

1. Existing user data can be migrated to the new system
2. QR codes remain compatible
3. Account types and permissions are preserved
4. All encryption methods are enhanced

## Testing

### Unit Tests
- Device identity generation and management
- Message encryption and decryption
- Permission system validation
- Account type feature mapping

### Integration Tests
- End-to-end message flow
- Authentication processes
- Data persistence
- Security measures

### User Acceptance Tests
- Device-based login
- Message sending/receiving
- Feature availability per account type
- Privacy mode functionality