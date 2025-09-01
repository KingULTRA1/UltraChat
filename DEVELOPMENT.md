# UltraChat Development Guide

## Prerequisites

- Node.js 18+ installed
- npm package manager
- Git for version control
- Modern code editor (VS Code recommended)

## Initial Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ultrachat.git
   cd ultrachat
   ```

2. Install dependencies:
   ```bash
   npm run clean-install
   ```

## Development Workflow

### Starting the Application

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```
   
   The backend will be available at http://localhost:3001

2. In a new terminal, start the frontend:
   ```bash
   npm run dev
   ```
   
   The frontend will be available at http://localhost:3000

### Port Management

UltraChat uses specific ports:
- **3000**: Frontend development server
- **3001**: Backend server

To avoid port conflicts:
```bash
# Check which ports are in use
npm run check-ports

# Kill processes using UltraChat ports
npm run kill-ports
```

### Clean Installation

If you're having dependency issues:
```bash
npm run clean-install
```

This will:
- Remove all node_modules directories
- Remove package-lock.json files
- Reinstall all dependencies
- Run security audit

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run tests once (for CI)
npm run test:run
```

### Linting

```bash
# Run linter
npm run lint
```

## Building for Production

```bash
# Build frontend
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
UltraChat/
├── src/                 # Frontend source code
│   ├── components/      # React components
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions
│   └── App.jsx          # Main application component
├── backend/             # Backend server
│   ├── plugins/         # Platform integration plugins
│   ├── server.js        # Main server file
│   └── bot_bridge.js    # Bot bridge implementation
├── scripts/             # Development scripts
├── tests/               # Test files
├── .github/workflows/   # CI/CD workflows
└── docs/                # Documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linter
5. Commit your changes
6. Push to your fork
7. Create a pull request

### Code Quality

- Follow existing code style
- Write tests for new features
- Run linter before committing
- Keep pull requests focused

### Pull Request Process

1. Ensure tests pass
2. Update documentation if needed
3. Add changes to CHANGELOG.md
4. Get code review
5. Merge after approval

## Troubleshooting

### Common Issues

1. **Port conflicts**:
   ```bash
   npm run kill-ports
   ```

2. **Dependency issues**:
   ```bash
   npm run clean-install
   ```

3. **Build errors**:
   - Check Node.js version (18+)
   - Run `npm run clean-install`
   - Check console for specific error messages

### Debugging

1. Check browser console for frontend errors
2. Check terminal output for backend errors
3. Use React DevTools for component debugging
4. Use Node.js debugger for backend debugging

## Security

- Never commit sensitive data
- Run `npm audit` regularly
- Keep dependencies updated
- Follow security best practices

## Performance

- Optimize React components
- Minimize bundle size
- Use lazy loading where appropriate
- Profile performance regularly