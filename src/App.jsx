import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AuthScreen from './components/UI/AuthScreen';
import './App.css';

// Import all services from the correct locations
import TrustManager from './services/Trust/TrustManager';
import { default as LocalStorage } from './utils/LocalStorage';
import { APP_CONFIG } from './utils/Constants';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [initializationStep, setInitializationStep] = useState('Starting...');
  const [initializationError, setInitializationError] = useState(null);
  const navigate = useNavigate();

  // Enhanced initialization with detailed logging
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log(`${APP_CONFIG.name} ${APP_CONFIG.version} - App Initialization Started`);
        setInitializationStep('Initializing services...');
        
        // Initialize LocalStorage first
        console.log('Step 1: Initializing LocalStorage');
        // LocalStorage is a utility, not a service with initialize method
        console.log('LocalStorage initialized successfully');
        setInitializationStep('LocalStorage initialized');
        
        // Initialize TrustManager with better error handling
        console.log('Step 2: Initializing TrustManager');
        try {
          await TrustManager.initialize();
          console.log('TrustManager initialized successfully');
          setInitializationStep('TrustManager initialized');
        } catch (trustError) {
          console.warn('TrustManager initialization warning (continuing anyway):', trustError);
          setInitializationStep('TrustManager initialized with warnings');
        }
        
        // Check if user is already logged in
        console.log('Step 3: Checking authentication status');
        try {
          const savedUser = LocalStorage.getItem('currentUser');
          if (savedUser) {
            console.log('User found in storage:', savedUser);
            setUser(savedUser);
            setIsLoggedIn(true);
            setInitializationStep('Authentication restored');
          } else {
            console.log('No user found in storage');
            setInitializationStep('Awaiting authentication');
          }
        } catch (authError) {
          console.warn('Authentication check warning:', authError);
          setInitializationStep('Awaiting authentication');
        }
        
        console.log('App initialization completed successfully');
        setInitializationStep('App ready');
      } catch (error) {
        console.error('App initialization error:', error);
        console.error('Error stack:', error.stack);
        setInitializationError(error.message);
        setInitializationStep(`Error: ${error.message}`);
      }
    };

    initializeApp();
  }, []);

  const handleLogin = (loginData) => {
    try {
      console.log('Login attempt:', loginData);
      const userData = {
        ...loginData.userData,
        id: loginData.userData.userId || Date.now().toString(),
        lastLogin: new Date().toISOString()
      };
      
      LocalStorage.setItem('currentUser', userData);
      setUser(userData);
      setIsLoggedIn(true);
      
      // Redirect based on account type
      const eliteAccountTypes = ['Ultra Elite', 'Legacy'];
      const standardAccountTypes = ['Ultra', 'Pro', 'Public'];
      
      if (eliteAccountTypes.includes(userData.accountType)) {
        navigate('/ultra');
      } else if (standardAccountTypes.includes(userData.accountType)) {
        navigate('/chat');
      } else {
        // Default route for other account types
        navigate('/chat');
      }
      
      console.log('Login successful:', userData);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = () => {
    try {
      console.log('Logout initiated');
      LocalStorage.removeItem('currentUser');
      setUser(null);
      setIsLoggedIn(false);
      navigate('/');
      console.log('Logout completed');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show loading state while initializing
  if (initializationStep !== 'App ready' && !initializationError) {
    return (
      <div className="app" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#0d1117',
        color: '#f0f6fc'
      }}>
        <h2>{APP_CONFIG.name} {APP_CONFIG.version}</h2>
        <div style={{ 
          fontSize: '1.2rem', 
          marginTop: '1rem',
          textAlign: 'center'
        }}>
          Initializing...<br />
          <span style={{ color: '#00d4aa' }}>{initializationStep}</span>
        </div>
        <div style={{ 
          marginTop: '2rem',
          fontSize: '0.9rem',
          color: '#8b949e'
        }}>
          If this takes more than 10 seconds, check the browser console for errors
        </div>
      </div>
    );
  }

  // Show error if initialization failed
  if (initializationError) {
    return (
      <div className="app" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#0d1117',
        color: '#f0f6fc',
        padding: '2rem'
      }}>
        <h2 style={{ color: '#f85149' }}>❌ Initialization Error</h2>
        <div style={{ 
          fontSize: '1.1rem', 
          marginTop: '1rem',
          textAlign: 'center',
          maxWidth: '600px'
        }}>
          <p>An error occurred during app initialization:</p>
          <p style={{ 
            backgroundColor: '#21262d', 
            padding: '1rem', 
            borderRadius: '6px',
            marginTop: '0.5rem',
            fontFamily: 'monospace',
            color: '#f85149'
          }}>
            {initializationError}
          </p>
          <p style={{ 
            marginTop: '1.5rem',
            fontSize: '0.9rem',
            color: '#8b949e'
          }}>
            Please check the browser console for more details and restart the application.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app" data-theme="obsidian" data-blue-filter="true">
      <Routes>
        <Route path="/" element={
          isLoggedIn ? (
            <div style={{ padding: '2rem' }}>
              <h1>Welcome to UltraChat!</h1>
              <p>You are logged in as: {user?.name || user?.handle}</p>
              <button onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <div className="auth-wrapper">
              <AuthScreen onLogin={handleLogin} />
            </div>
          )
        } />
        <Route path="/chat" element={
          <div style={{ padding: '2rem' }}>
            <h1>Chat Interface</h1>
            <p>This is where the chat interface would be.</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        } />
        <Route path="/ultra" element={
          <div style={{ padding: '2rem' }}>
            <h1>Ultra Mode</h1>
            <p>Welcome to Ultra Mode! This is where advanced features would be available.</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;