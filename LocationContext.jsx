import { createContext, useContext, useState, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const LocationContext = createContext()

export function LocationProvider({ children }) {
  const [locations, setLocations] = useState([])
  const [optimizedRoute, setOptimizedRoute] = useState(null)
  const [isOptimizing, setIsOptimizing] = useState(false)

  const addLocation = useCallback((location) => {
    setLocations(prev => [...prev, { ...location, id: Date.now() }])
  }, [])

  const removeLocation = useCallback((id) => {
    setLocations(prev => prev.filter(loc => loc.id !== id))
    setOptimizedRoute(null)
  }, [])

  const updateLocation = useCallback((id, updates) => {
    setLocations(prev => prev.map(loc => 
      loc.id === id ? { ...loc, ...updates } : loc
    ))
    setOptimizedRoute(null)
  }, [])

  const optimizeRoute = useCallback(async () => {
    if (locations.length < 2) {
      toast.error('Add at least 2 locations to optimize route')
      return
    }

    setIsOptimizing(true)
    try {
      const response = await axios.post('/api/optimize', {
        locations: locations.map(loc => ({
          lat: loc.lat,
          lng: loc.lng
        }))
      })
      setOptimizedRoute(response.data)
      toast.success('Route optimized successfully!')
    } catch (error) {
      toast.error('Failed to optimize route')
      console.error('Optimization error:', error)
    } finally {
      setIsOptimizing(false)
    }
  }, [locations])

  const exportRoute = useCallback((format) => {
    if (!optimizedRoute) {
      toast.error('No optimized route to export')
      return
    }

    const data = {
      locations: locations,
      route: optimizedRoute,
      timestamp: new Date().toISOString()
    }

    let content, filename, type

    switch (format) {
      case 'json':
        content = JSON.stringify(data, null, 2)
        filename = 'route.json'
        type = 'application/json'
        break
      case 'csv':
        content = locations.map(loc => `${loc.lat},${loc.lng},${loc.name}`).join('\n')
        filename = 'route.csv'
        type = 'text/csv'
        break
      case 'gpx':
        content = generateGPX(data)
        filename = 'route.gpx'
        type = 'application/gpx+xml'
        break
      default:
        return
    }

    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [locations, optimizedRoute])

  const generateGPX = (data) => {
    // Basic GPX structure - can be enhanced based on needs
    return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="NYC TSP Visualizer">
  <trk>
    <name>Optimized Route</name>
    <trkseg>
      ${data.locations.map(loc => `
        <trkpt lat="${loc.lat}" lon="${loc.lng}">
          <name>${loc.name}</name>
        </trkpt>
      `).join('')}
    </trkseg>
  </trk>
</gpx>`
  }

  return (
    <LocationContext.Provider value={{
      locations,
      optimizedRoute,
      isOptimizing,
      addLocation,
      removeLocation,
      updateLocation,
      optimizeRoute,
      exportRoute
    }}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocations() {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error('useLocations must be used within a LocationProvider')
  }
  return context
} 