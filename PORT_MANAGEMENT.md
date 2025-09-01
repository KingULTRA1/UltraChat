# UltraChat Port Management Guide

## Common Port Issues

UltraChat uses the following ports:
- **3000**: Frontend development server (Vite)
- **3001**: Backend server (Express bot bridge)
- **3002**: Alternative ports if conflicts occur

## Common Problems

### EADDRINUSE Error
This error occurs when you try to start a new instance while another is already running:
```
Error: listen EADDRINUSE: address already in use :::3001
```

### Silent Port Shifts
Some development tools automatically shift to the next available port (3002, 3003, etc.) when a conflict is detected, which can cause confusion.

## Solutions

### 1. Check Which Ports Are in Use
```bash
# From the project root
npm run check-ports

# From the backend directory
npm run check-ports
```

### 2. Kill Processes Using UltraChat Ports
```bash
# From the project root
npm run kill-ports

# From the backend directory
npm run kill-ports
```

### 3. Clean Installation
If you're having persistent issues:
```bash
npm run clean-install
```

## Manual Port Management

### Windows
```cmd
# Check which process is using a port
netstat -ano | findstr :3001

# Kill a process by PID
taskkill /PID <process_id> /F
```

### macOS/Linux
```bash
# Check which process is using a port
lsof -i :3001

# Kill a process by PID
kill -9 <process_id>
```

## Best Practices

1. **Run Only One Instance**: Keep one backend instance running in a dedicated terminal
2. **Stop Before Restarting**: Use `Ctrl+C` to stop the old instance before starting a new one
3. **Check Ports First**: Run `npm run check-ports` before starting UltraChat
4. **Use Port Killers**: Run `npm run kill-ports` if you're having port conflicts
5. **Lock Ports**: The backend is now locked to port 3001 and will fail fast if the port is in use

## Development Workflow

1. Open a terminal for the backend:
   ```bash
   cd backend
   npm start
   ```

2. Open another terminal for the frontend:
   ```bash
   npm run dev
   ```

3. Keep both terminals running during development

4. When done, stop both with `Ctrl+C`

## Troubleshooting

If you're still having issues:

1. Run `npm run check-ports` to see what's using the ports
2. Run `npm run kill-ports` to free up the ports
3. Run `npm run clean-install` if you're having dependency issues
4. Restart both frontend and backend

## Environment Configuration

The backend is now locked to port 3001 and will not silently shift to another port. If port 3001 is in use, the server will display an error message with instructions on how to resolve the conflict.

### Frontend Port Configuration
The frontend is locked to port 3000. To change this, modify the `vite.config.js` file:

```javascript
export default defineConfig({
  server: {
    port: 3000, // Change this to your preferred port
  },
  // ... other configuration
})
```

## CI/CD Integration

Our GitHub Actions workflow automatically runs port management checks:
- Security audits on every pull request
- Automated testing to ensure no port conflicts in CI environment
- Build verification to ensure proper port configuration

## Contributing

When contributing to UltraChat, always:
1. Run `npm run check-ports` before starting development
2. Use `npm run kill-ports` if you encounter port conflicts
3. Run `npm run clean-install` if you're having dependency issues
4. Follow the development workflow outlined above