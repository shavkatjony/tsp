import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useLocations } from '../context/LocationContext'
import { useTheme } from '../context/ThemeContext'

// Replace with your Mapbox access token
mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN'

const NYC_CENTER = [-74.006, 40.7128]
const INITIAL_ZOOM = 12

export default function Map() {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const markers = useRef({})
  const routeLayer = useRef(null)
  const { locations, optimizedRoute, addLocation } = useLocations()
  const { isDarkMode } = useTheme()

  useEffect(() => {
    if (map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: isDarkMode ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11',
      center: NYC_CENTER,
      zoom: INITIAL_ZOOM,
      pitch: 45,
      bearing: -17.6,
      antialias: true
    })

    map.current.on('load', () => {
      // Add 3D building layer
      map.current.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 12,
        'paint': {
          'fill-extrusion-color': isDarkMode ? '#2a2a2a' : '#aaa',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.6
        }
      })
    })

    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat
      addLocation({
        lat,
        lng,
        name: `Location ${locations.length + 1}`
      })
    })

    return () => map.current?.remove()
  }, [])

  // Update map style when theme changes
  useEffect(() => {
    if (!map.current) return
    map.current.setStyle(isDarkMode ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11')
  }, [isDarkMode])

  // Update markers when locations change
  useEffect(() => {
    // Remove old markers
    Object.values(markers.current).forEach(marker => marker.remove())
    markers.current = {}

    // Add new markers
    locations.forEach(location => {
      const el = document.createElement('div')
      el.className = 'marker'
      el.style.width = '24px'
      el.style.height = '24px'
      el.style.backgroundImage = 'url(/marker.png)'
      el.style.backgroundSize = 'cover'
      el.style.cursor = 'pointer'

      const marker = new mapboxgl.Marker(el)
        .setLngLat([location.lng, location.lat])
        .addTo(map.current)

      markers.current[location.id] = marker
    })
  }, [locations])

  // Update route when optimized route changes
  useEffect(() => {
    if (!map.current || !optimizedRoute) return

    // Remove existing route layer
    if (routeLayer.current) {
      map.current.removeLayer('route')
      map.current.removeSource('route')
    }

    // Add new route layer
    map.current.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: optimizedRoute.route.map(index => [
            locations[index].lng,
            locations[index].lat
          ])
        }
      }
    })

    map.current.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#0ea5e9',
        'line-width': 4,
        'line-dasharray': [0, 4, 3]
      }
    })

    routeLayer.current = 'route'

    // Animate the route
    const animate = () => {
      const dashArray = map.current.getPaintProperty('route', 'line-dasharray')
      map.current.setPaintProperty('route', 'line-dasharray', [
        (dashArray[0] + 1) % 7,
        dashArray[1],
        dashArray[2]
      ])
      requestAnimationFrame(animate)
    }
    animate()
  }, [optimizedRoute, locations])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      {optimizedRoute && (
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Total Distance: {optimizedRoute.distance.toFixed(2)} km
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Estimated Time: {Math.round(optimizedRoute.distance * 2)} min
          </p>
        </div>
      )}
    </div>
  )
} 