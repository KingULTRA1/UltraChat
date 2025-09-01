import React, { useState, useEffect } from 'react';
import './UltraProfileGenerator.css';

const UltraProfileGenerator = ({ currentUser, onProfileUpdate }) => {
  const [baseUsername, setBaseUsername] = useState(currentUser?.name || '');
  const [selectedVariation, setSelectedVariation] = useState('');
  const [profileVariations, setProfileVariations] = useState(null);
  const [transformOptions, setTransformOptions] = useState({
    includeCrypto: false
  });
  const [refreshInterval, setRefreshInterval] = useState(300000); // 5 minutes
  const [autoRefreshId, setAutoRefreshId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Generate profile variations
  const generateVariations = (username) => {
    if (!username) return;
    
    setIsLoading(true);
    
    // Simulate processing delay
    setTimeout(() => {
      const variations = {
        original: username,
        reversed: username.split('').reverse().join(''),
        upsideDown: username.split('').reverse().join('').toUpperCase(),
        randomized: shuffleString(username),
        ephemeral: `${username}_${Math.floor(Math.random() * 10000)}`,
        btcStyle: `₿${username.slice(0, 8)}${Math.random().toString(36).substring(2, 6)}`,
        dogeStyle: `Ð${username.slice(0, 6)}${Math.random().toString(36).substring(2, 4)}`
      };
      
      // Generate 10 random variants
      variations.variants = Array.from({ length: 10 }, (_, i) => 
        `${shuffleString(username)}_${i}${Math.floor(Math.random() * 100)}`
      );
      
      setProfileVariations(variations);
      setSelectedVariation(variations.original);
      setIsLoading(false);
    }, 500);
  };

  // Shuffle string function
  const shuffleString = (str) => {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  };

  // Handle transform change
  const handleTransformChange = (type) => {
    if (!profileVariations) return;
    
    switch (type) {
      case 'reverse':
        setSelectedVariation(profileVariations.reversed);
        break;
      case 'upsideDown':
        setSelectedVariation(profileVariations.upsideDown);
        break;
      case 'randomize':
        setSelectedVariation(profileVariations.randomized);
        break;
      case 'layered':
        setSelectedVariation(`${profileVariations.original}_${profileVariations.reversed}`);
        break;
      default:
        break;
    }
  };

  // Handle ephemeral generation
  const handleEphemeralGeneration = () => {
    if (!profileVariations) return;
    setSelectedVariation(profileVariations.ephemeral);
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    addNotification('✅ Copied to clipboard!', 'success');
  };

  // Add notification
  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // Handle auto-refresh toggle
  const handleAutoRefreshToggle = () => {
    if (autoRefreshId) {
      clearInterval(autoRefreshId);
      setAutoRefreshId(null);
      addNotification('⏹️ Auto-refresh stopped', 'info');
    } else {
      const intervalId = setInterval(() => {
        if (baseUsername) {
          generateVariations(baseUsername);
        }
      }, refreshInterval);
      setAutoRefreshId(intervalId);
      addNotification('▶️ Auto-refresh started', 'success');
    }
  };

  // Handle profile update
  const handleProfileUpdate = () => {
    if (selectedVariation && onProfileUpdate) {
      onProfileUpdate(selectedVariation);
      addNotification('✅ Profile updated successfully!', 'success');
    }
  };

  // Initialize with current user
  useEffect(() => {
    if (currentUser?.name) {
      setBaseUsername(currentUser.name);
      generateVariations(currentUser.name);
    }
  }, [currentUser]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoRefreshId) {
        clearInterval(autoRefreshId);
      }
    };
  }, [autoRefreshId]);

  if (isLoading) {
    return (
      <div className="ultra-profile-generator loading">
        <div className="loading-spinner">🔄</div>
        <p>Loading Ultra Profile Generator...</p>
      </div>
    );
  }

  return (
    <div className="ultra-profile-generator">
      <div className="generator-header">
        <h2>🎭 Ultra Profile Generator</h2>
        <p>Transform your identity with real-time text effects</p>
      </div>

      {/* Base Username Input */}
      <div className="input-section">
        <label>Base Username:</label>
        <input
          type="text"
          value={baseUsername}
          onChange={(e) => {
            setBaseUsername(e.target.value);
            generateVariations(e.target.value);
          }}
          placeholder="Enter your username..."
        />
      </div>

      {/* Transform Options */}
      <div className="transform-options">
        <h3>Identity Transformations</h3>
        <div className="option-buttons">
          <button 
            className="transform-btn"
            onClick={() => handleTransformChange('reverse')}
          >
            🔄 Reverse
          </button>
          <button 
            className="transform-btn"
            onClick={() => handleTransformChange('upsideDown')}
          >
            🙃 Upside Down
          </button>
          <button 
            className="transform-btn"
            onClick={() => handleTransformChange('randomize')}
          >
            🎲 Randomize
          </button>
          <button 
            className="transform-btn"
            onClick={() => handleTransformChange('layered')}
          >
            🔀 Layered
          </button>
          <button 
            className="transform-btn ephemeral"
            onClick={handleEphemeralGeneration}
          >
            ✨ Ephemeral ID
          </button>
        </div>
      </div>

      {/* Current Selection */}
      <div className="current-selection">
        <h3>Current Identity</h3>
        <div className="identity-display">
          <span className="identity-text">{selectedVariation || 'No selection'}</span>
          <button 
            className="copy-btn"
            onClick={() => copyToClipboard(selectedVariation)}
            disabled={!selectedVariation}
          >
            📋 Copy
          </button>
        </div>
      </div>

      {/* Profile Variations */}
      {profileVariations && (
        <div className="variations-section">
          <h3>Profile Variations</h3>
          <div className="variations-grid">
            <div className="variation-item" onClick={() => setSelectedVariation(profileVariations.original)}>
              <span className="variation-label">Original:</span>
              <span className="variation-text">{profileVariations.original}</span>
            </div>
            <div className="variation-item" onClick={() => setSelectedVariation(profileVariations.reversed)}>
              <span className="variation-label">Reversed:</span>
              <span className="variation-text">{profileVariations.reversed}</span>
            </div>
            <div className="variation-item" onClick={() => setSelectedVariation(profileVariations.upsideDown)}>
              <span className="variation-label">Upside Down:</span>
              <span className="variation-text">{profileVariations.upsideDown}</span>
            </div>
            <div className="variation-item" onClick={() => setSelectedVariation(profileVariations.randomized)}>
              <span className="variation-label">Randomized:</span>
              <span className="variation-text">{profileVariations.randomized}</span>
            </div>
            <div className="variation-item ephemeral" onClick={() => setSelectedVariation(profileVariations.ephemeral)}>
              <span className="variation-label">Ephemeral:</span>
              <span className="variation-text">{profileVariations.ephemeral}</span>
            </div>
            
            {/* Crypto Style IDs */}
            {transformOptions.includeCrypto && (
              <>
                <div className="variation-item crypto" onClick={() => setSelectedVariation(profileVariations.btcStyle)}>
                  <span className="variation-label">BTC Style:</span>
                  <span className="variation-text">{profileVariations.btcStyle}</span>
                </div>
                <div className="variation-item crypto" onClick={() => setSelectedVariation(profileVariations.dogeStyle)}>
                  <span className="variation-label">DOGE Style:</span>
                  <span className="variation-text">{profileVariations.dogeStyle}</span>
                </div>
              </>
            )}
          </div>
          
          {/* Random Variants */}
          <div className="random-variants">
            <h4>Random Variants (10 variations):</h4>
            <div className="variants-list">
              {profileVariations.variants.map((variant, index) => (
                <div 
                  key={index} 
                  className="variant-item"
                  onClick={() => setSelectedVariation(variant)}
                >
                  {variant}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Auto-Refresh Settings */}
      <div className="auto-refresh-section">
        <h3>Auto-Refresh Ephemeral Nicknames</h3>
        <div className="refresh-controls">
          <label>
            Interval (minutes):
            <select 
              value={refreshInterval / 60000} 
              onChange={(e) => setRefreshInterval(e.target.value * 60000)}
            >
              <option value={1}>1 minute</option>
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
            </select>
          </label>
          <button 
            className={`refresh-toggle ${autoRefreshId ? 'active' : ''}`}
            onClick={handleAutoRefreshToggle}
          >
            {autoRefreshId ? '⏹️ Stop Auto-Refresh' : '▶️ Start Auto-Refresh'}
          </button>
        </div>
      </div>

      {/* Options */}
      <div className="options-section">
        <h3>Options</h3>
        <label>
          <input
            type="checkbox"
            checked={transformOptions.includeCrypto}
            onChange={(e) => {
              const newOptions = { ...transformOptions, includeCrypto: e.target.checked };
              setTransformOptions(newOptions);
              if (baseUsername) {
                generateVariations(baseUsername);
              }
            }}
          />
          Include Crypto-Style IDs (BTC/DOGE addresses)
        </label>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          className="generate-btn"
          onClick={() => generateVariations(baseUsername)}
          disabled={!baseUsername}
        >
          🎲 Generate New Variations
        </button>
        <button 
          className="apply-btn"
          onClick={handleProfileUpdate}
          disabled={!selectedVariation || selectedVariation === currentUser?.name}
        >
          ✅ Apply Selected Identity
        </button>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="notifications">
          {notifications.map((notification, index) => (
            <div key={index} className={`notification ${notification.type}`}>
              {notification.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UltraProfileGenerator;