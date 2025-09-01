// 🚀 UltraChat v1.2.3.4 Final - Ultra Browser Component
// PRIVACY FIRST - Integrated browser with save/share functionality

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Save, Share, RotateCcw, ArrowLeft, ArrowRight, RefreshCw, Download, ExternalLink, Rocket, Cat, Dog, Car, Bike, User, Crown, Keyboard, Alien, X } from 'lucide-react';
import UltraBrowserConfig from '../../config/UltraBrowserConfig';
import './UltraBrowser.css';

const UltraBrowser = ({ onShareToChat, themeManager, currentUser, privateMode = false }) => {
  const [currentURL, setCurrentURL] = useState(UltraBrowserConfig.homePage);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [tabs, setTabs] = useState([{ id: Date.now(), url: UltraBrowserConfig.homePage, title: "Ultra Homepage" }]);
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuData, setContextMenuData] = useState(null);
  const [showScreensaver, setShowScreensaver] = useState(false);
  const [screensaverImage, setScreensaverImage] = useState('');
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [userRole, setUserRole] = useState('user');
  const iframeRef = useRef(null);
  const inputRef = useRef(null);
  const screensaverTimeoutRef = useRef(null);
  const tabRefs = useRef([]);

  // Initialize with a default tab
  useEffect(() => {
    const initialTab = tabs.find(tab => tab.id === activeTab) || tabs[0];
    if (initialTab) {
      setCurrentURL(initialTab.url);
    }
    
    // Set up screensaver
    setupScreensaver();
    
    // Set user role
    if (currentUser) {
      setUserRole(currentUser.role || 'user');
    }
    
    return () => {
      if (screensaverTimeoutRef.current) {
        clearTimeout(screensaverTimeoutRef.current);
      }
    };
  }, []);

  // Handle clicks outside context menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showContextMenu && event.target.closest('.context-menu') === null) {
        closeContextMenu();
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showContextMenu]);

  // Set up screensaver
  const setupScreensaver = useCallback(() => {
    if (screensaverTimeoutRef.current) {
      clearTimeout(screensaverTimeoutRef.current);
    }
    
    screensaverTimeoutRef.current = setTimeout(() => {
      showRandomScreensaver();
    }, 30000); // 30 seconds
  }, []);

  // Show random screensaver
  const showRandomScreensaver = useCallback(() => {
    const images = UltraBrowserConfig.ui.screensaverImages;
    const randomImage = images[Math.floor(Math.random() * images.length)];
    setScreensaverImage(randomImage);
    setShowScreensaver(true);
    
    // Hide screensaver after 5 seconds
    setTimeout(() => {
      setShowScreensaver(false);
      setupScreensaver();
    }, 5000);
  }, [setupScreensaver]);

  // Handle user activity to reset screensaver
  const handleUserActivity = useCallback(() => {
    if (showScreensaver) {
      setShowScreensaver(false);
    }
    setupScreensaver();
  }, [showScreensaver, setupScreensaver]);

  const navigate = useCallback((url) => {
    handleUserActivity();
    
    // Handle search terms
    let finalURL = url;
    if (!url.startsWith("http")) {
      if (url.includes(".") && !url.includes(" ")) {
        finalURL = `https://${url}`;
      } else {
        // Treat as search query
        finalURL = `https://duckduckgo.com/?q=${encodeURIComponent(url)}`;
      }
    }

    // Fun restriction: block Google
    if (finalURL.includes("google.com")) {
      // Instead of alert, show a friendly message in the UI
      console.log("🚫 No Google allowed! 👀");
      return;
    }

    setIsLoading(true);
    
    // Update active tab
    const updatedTabs = tabs.map(tab => 
      tab.id === activeTab 
        ? { ...tab, url: finalURL, title: finalURL.replace(/^https?:\/\//, '').split('/')[0] || "New Tab" }
        : tab
    );
    
    setTabs(updatedTabs);
    setCurrentURL(finalURL);
    
    // Update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(finalURL);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [tabs, activeTab, history, historyIndex, handleUserActivity]);

  const goBack = useCallback(() => {
    handleUserActivity();
    
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const prevURL = history[newIndex];
      setCurrentURL(prevURL);
      
      // Update active tab
      const updatedTabs = tabs.map(tab => 
        tab.id === activeTab 
          ? { ...tab, url: prevURL, title: prevURL.replace(/^https?:\/\//, '').split('/')[0] || "New Tab" }
          : tab
      );
      setTabs(updatedTabs);
    }
  }, [historyIndex, history, tabs, activeTab, handleUserActivity]);

  const goForward = useCallback(() => {
    handleUserActivity();
    
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextURL = history[newIndex];
      setCurrentURL(nextURL);
      
      // Update active tab
      const updatedTabs = tabs.map(tab => 
        tab.id === activeTab 
          ? { ...tab, url: nextURL, title: nextURL.replace(/^https?:\/\//, '').split('/')[0] || "New Tab" }
          : tab
      );
      setTabs(updatedTabs);
    }
  }, [historyIndex, history, tabs, activeTab, handleUserActivity]);

  const reload = useCallback(() => {
    handleUserActivity();
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  }, [handleUserActivity]);

  const createNewTab = useCallback(() => {
    handleUserActivity();
    const newTabId = Date.now();
    const newTab = { id: newTabId, url: UltraBrowserConfig.homePage, title: "New Tab" };
    setTabs([...tabs, newTab]);
    setActiveTab(newTabId);
    setCurrentURL(newTab.url);
    
    // Fun rocket animation
    console.log("🚀 New tab created!");
  }, [tabs, handleUserActivity]);

  const closeTab = useCallback((tabId, e) => {
    handleUserActivity();
    if (e) e.stopPropagation();
    if (tabs.length <= 1) return; // Don't close the last tab
    
    const updatedTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(updatedTabs);
    
    // If we closed the active tab, switch to the first available tab
    if (tabId === activeTab) {
      const newActiveTab = updatedTabs[0];
      setActiveTab(newActiveTab.id);
      setCurrentURL(newActiveTab.url);
    }
  }, [tabs, activeTab, handleUserActivity]);

  const switchTab = useCallback((tabId) => {
    handleUserActivity();
    setActiveTab(tabId);
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setCurrentURL(tab.url);
    }
  }, [tabs, handleUserActivity]);

  const handleKeyDown = useCallback((e) => {
    handleUserActivity();
    if (e.key === 'Enter') {
      navigate(e.target.value);
    }
  }, [navigate, handleUserActivity]);

  const handleTouchStart = useCallback((e) => {
    handleUserActivity();
    setTouchStart(e.targetTouches[0].clientX);
  }, [handleUserActivity]);

  const handleTouchMove = useCallback((e) => {
    handleUserActivity();
    setTouchEnd(e.targetTouches[0].clientX);
  }, [handleUserActivity]);

  const handleTouchEnd = useCallback(() => {
    handleUserActivity();
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      goBack();
    } else if (isRightSwipe) {
      goForward();
    }
  }, [touchStart, touchEnd, goBack, goForward, handleUserActivity]);

  const openContextMenu = useCallback((e, data) => {
    e.preventDefault();
    handleUserActivity();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuData(data);
    setShowContextMenu(true);
  }, [handleUserActivity]);

  const closeContextMenu = useCallback(() => {
    setShowContextMenu(false);
    setContextMenuData(null);
  }, []);

  const saveImage = useCallback((imageUrl) => {
    handleUserActivity();
    // In a real implementation, this would save the image locally
    console.log("Saving image:", imageUrl);
    closeContextMenu();
  }, [handleUserActivity, closeContextMenu]);

  const shareToChat = useCallback((url) => {
    handleUserActivity();
    if (onShareToChat) {
      onShareToChat(url);
    }
    closeContextMenu();
  }, [onShareToChat, handleUserActivity, closeContextMenu]);

  const clearSessionData = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
    const newTab = { id: Date.now(), url: UltraBrowserConfig.homePage, title: "Ultra Homepage" };
    setTabs([newTab]);
    setActiveTab(newTab.id);
    setCurrentURL(newTab.url);
    if (iframeRef.current) {
      iframeRef.current.src = UltraBrowserConfig.homePage;
    }
  }, []);

  // Handle private mode
  useEffect(() => {
    if (privateMode) {
      clearSessionData();
    }
  }, [privateMode, clearSessionData]);

  // Handle iframe load
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Get user emoji based on role
  const getUserEmoji = () => {
    const emojis = UltraBrowserConfig.ui.userEmojis;
    switch (userRole) {
      case 'developer':
        return <Alien data-testid="emoji-space-alien" />;
      case 'admin':
        return <Crown data-testid="emoji-crown" />;
      case 'coder':
        return <Keyboard data-testid="emoji-keyboard" />;
      default:
        return <User data-testid="emoji-user" />;
    }
  };

  // Get screensaver image component
  const getScreensaverImage = () => {
    switch (screensaverImage) {
      case 'cosmic':
        return <div className="screensaver-cosmic" data-testid="screensaver-cosmic"></div>;
      case 'cat':
        return <Cat size={100} data-testid="screensaver-cat" />;
      case 'dog':
        return <Dog size={100} data-testid="screensaver-dog" />;
      case 'cars':
        return <Car size={100} data-testid="screensaver-car" />;
      case 'bikes':
        return <Bike size={100} data-testid="screensaver-bike" />;
      default:
        return <div className="screensaver-default" data-testid="screensaver-default"></div>;
    }
  };

  return (
    <div 
      className="ultra-browser" 
      data-testid="ultra-browser"
      onMouseMove={handleUserActivity}
      onKeyDown={handleUserActivity}
      tabIndex={0}
    >
      {/* Browser Header */}
      <div className="browser-header" data-testid="browser-header">
        <div className="nav-controls">
          <button 
            onClick={goBack} 
            disabled={historyIndex <= 0}
            className="nav-button"
            data-testid="back-button"
          >
            <ArrowLeft size={16} />
          </button>
          <button 
            onClick={goForward} 
            disabled={historyIndex >= history.length - 1}
            className="nav-button"
            data-testid="forward-button"
          >
            <ArrowRight size={16} />
          </button>
          <button 
            onClick={reload} 
            className="nav-button"
            data-testid="reload-button"
          >
            <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
          </button>
        </div>
        
        <div className="url-bar-container">
          <input
            ref={inputRef}
            type="text"
            value={currentURL}
            onChange={(e) => setCurrentURL(e.target.value)}
            onKeyDown={handleKeyDown}
            className="url-bar"
            data-testid="url-input"
            placeholder="Enter URL or search..."
          />
          <button 
            onClick={() => navigate(currentURL)} 
            className="go-button"
            data-testid="go-button"
          >
            Go
          </button>
        </div>
        
        <div className="user-controls">
          {getUserEmoji()}
          <button 
            onClick={createNewTab} 
            className="new-tab-button"
            data-testid="new-tab-button"
          >
            +
          </button>
        </div>
      </div>
      
      {/* Tab List */}
      <div 
        className="tab-list" 
        data-testid="tab-list"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') {
            const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
            const nextIndex = (currentIndex + 1) % tabs.length;
            switchTab(tabs[nextIndex].id);
          } else if (e.key === 'ArrowLeft') {
            const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
            const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            switchTab(tabs[prevIndex].id);
          }
        }}
        tabIndex={0}
      >
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            ref={el => tabRefs.current[index] = el}
            className={`tab ${tab.id === activeTab ? 'active' : ''}`}
            onClick={() => switchTab(tab.id)}
            onContextMenu={(e) => openContextMenu(e, { type: 'tab', tab })}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            data-testid={`browser-tab-${index}`}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', tab.id);
            }}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              const draggedTabId = e.dataTransfer.getData('text/plain');
              // Simple reorder implementation
              if (draggedTabId !== tab.id) {
                const draggedIndex = tabs.findIndex(t => t.id === draggedTabId);
                const targetIndex = index;
                if (draggedIndex !== -1 && targetIndex !== -1) {
                  const newTabs = [...tabs];
                  const [removed] = newTabs.splice(draggedIndex, 1);
                  newTabs.splice(targetIndex, 0, removed);
                  setTabs(newTabs);
                }
              }
            }}
          >
            <span className="tab-title" data-testid={`tab-title-${index}`}>{tab.title}</span>
            <button 
              onClick={(e) => closeTab(tab.id, e)} 
              className="close-tab"
              data-testid={`close-tab-button-${index}`}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
      
      {/* Browser Content */}
      <div 
        className="browser-content"
        data-testid="browser-content"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isLoading && (
          <div className="loading-overlay" data-testid="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}
        
        {currentURL.includes("google.com") ? (
          <div className="blocked-page" data-testid="blocked-page">
            <div className="blocked-content">
              <h2>Site Blocked for Privacy 🔒</h2>
              <p>Google services are restricted in UltraBrowser to protect your privacy.</p>
              <button onClick={() => navigate(UltraBrowserConfig.homePage)}>Return Home</button>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={currentURL}
            onLoad={handleIframeLoad}
            onError={() => setIsLoading(false)}
            onContextMenu={(e) => openContextMenu(e, { type: 'page', url: currentURL })}
            title={`tab-${activeTab}`}
            data-testid="browser-iframe"
          />
        )}
      </div>
      
      {/* Context Menu */}
      {showContextMenu && (
        <div 
          className="context-menu"
          style={{ top: contextMenuPosition.y, left: contextMenuPosition.x }}
          data-testid="context-menu"
        >
          {contextMenuData?.type === 'page' && (
            <>
              <button onClick={() => saveImage(contextMenuData.url)}>
                <Download size={16} /> Save Image
              </button>
              <button onClick={() => shareToChat(contextMenuData.url)}>
                <Share size={16} /> Share to Chat
              </button>
            </>
          )}
          {contextMenuData?.type === 'tab' && (
            <button onClick={() => closeTab(contextMenuData.tab.id)}>
              <X size={16} /> Close Tab
            </button>
          )}
        </div>
      )}
      
      {/* Screensaver */}
      {showScreensaver && (
        <div className="screensaver" data-testid="screensaver">
          <div className="screensaver-content">
            {getScreensaverImage()}
            <p>UltraBrowser Screensaver</p>
          </div>
        </div>
      )}
      
      {/* Rocket Animation */}
      <div className="rocket-animation" data-testid="rocket-animation">
        <Rocket size={32} />
      </div>
    </div>
  );
};

export default UltraBrowser;