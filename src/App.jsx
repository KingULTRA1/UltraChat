import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/UI/Layout'
import { SettingsManager } from './services/Settings'
import './App.css'

function App() {
  const [currentTheme, setCurrentTheme] = useState('obsidian')
  const [blueFilterEnabled, setBlueFilterEnabled] = useState(true)

  useEffect(() => {
    // Load user preferences from local storage
    const savedTheme = localStorage.getItem('ultrachat-theme') || 'obsidian'
    const savedBlueFilter = localStorage.getItem('ultrachat-blue-filter') !== 'false'
    
    setCurrentTheme(savedTheme)
    setBlueFilterEnabled(savedBlueFilter)
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', savedTheme)
    document.documentElement.setAttribute('data-blue-filter', savedBlueFilter)
  }, [])

  const updateTheme = (theme) => {
    setCurrentTheme(theme)
    localStorage.setItem('ultrachat-theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }

  const toggleBlueFilter = () => {
    const newValue = !blueFilterEnabled
    setBlueFilterEnabled(newValue)
    localStorage.setItem('ultrachat-blue-filter', newValue)
    document.documentElement.setAttribute('data-blue-filter', newValue)
  }

  return (
    <div className="app" data-theme={currentTheme}>
      <Routes>
        <Route 
          path="/*" 
          element={
            <Layout 
              onThemeChange={updateTheme}
              onBlueFilterToggle={toggleBlueFilter}
              blueFilterEnabled={blueFilterEnabled}
              currentTheme={currentTheme}
            />
          } 
        />
      </Routes>
    </div>
  )
}

export default App