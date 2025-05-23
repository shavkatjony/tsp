import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Map from './components/Map'
import Sidebar from './components/Sidebar'
import { LocationProvider } from './context/LocationContext'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <LocationProvider>
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
          <Sidebar />
          <main className="flex-1 relative">
            <Map />
          </main>
          <Toaster position="top-right" />
        </div>
      </LocationProvider>
    </ThemeProvider>
  )
}

export default App 