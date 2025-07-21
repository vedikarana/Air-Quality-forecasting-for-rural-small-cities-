"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Locate } from "lucide-react"
import type { google } from "google-maps"

// NOTE: “google-maps” has no named export – we load the Maps script manually
// and access the global `window.google` object after it’s available.

interface GoogleMapsProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void
  selectedLocation?: { lat: number; lng: number }
  aqiData?: Array<{
    id: number
    name: string
    latitude: number
    longitude: number
    aqi_value: number
    quality_category: string
  }>
}

export function GoogleMaps({ onLocationSelect, selectedLocation, aqiData }: GoogleMapsProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Load Google Maps API
  useEffect(() => {
    if (typeof window === "undefined") return

    // Already loaded?
    if (window.google?.maps) {
      setIsLoaded(true)
      return
    }

    // Prevent injecting the script twice
    if (document.querySelector("#google-maps-js")) return

    const apiKey = "AIzaSyAIJHUcGJTg75EEsE0-j9wR8EV-UUaCpVk"
    console.log("Loading Google Maps with API key:", apiKey.slice(0, 10) + "...")

    const script = document.createElement("script")
    script.id = "google-maps-js"
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true

    script.onload = () => {
      console.log("Google Maps API loaded successfully")
      setIsLoaded(true)
    }
    script.onerror = () => {
      console.error("Failed to load Google Maps API")
      setLoadError("Failed to load Google Maps. Please check your internet connection and try again.")
    }

    document.head.appendChild(script)

    // Catch runtime authentication errors
    ;(window as any).gm_authFailure = () => {
      console.error("Google Maps authentication failed")
      setLoadError("Google Maps authentication failed. The API key may have restrictions or billing issues.")
    }
  }, [])

  // Initialize map (grab `window.google` only on the client)
  useEffect(() => {
    if (isLoaded && mapRef.current && !map && typeof window !== "undefined") {
      const g = (window as any).google as typeof google
      if (!g) return

      const initialCenter = selectedLocation || { lat: 28.6139, lng: 77.209 } // Delhi default

      const newMap = new g.maps.Map(mapRef.current, {
        center: initialCenter,
        zoom: 6,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      })

      // Add click listener
      newMap.addListener("click", (event: any) => {
        if (event.latLng) {
          const lat = event.latLng.lat()
          const lng = event.latLng.lng()

          // Reverse geocoding to get address
          const geocoder = new g.maps.Geocoder()
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results?.[0]) {
              onLocationSelect(lat, lng, results[0].formatted_address)
            } else {
              onLocationSelect(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`)
            }
          })
        }
      })

      setMap(newMap)
    }
  }, [isLoaded, map, selectedLocation, onLocationSelect])

  // Add AQI markers
  useEffect(() => {
    const g = (window as any).google as typeof google | undefined
    if (map && aqiData && g) {
      // Clear existing markers
      // In a real app, you'd track markers to clear them

      aqiData.forEach((city) => {
        const color = getAQIColor(city.aqi_value)

        const marker = new g.maps.Marker({
          position: { lat: city.latitude, lng: city.longitude },
          map: map,
          title: `${city.name}: AQI ${city.aqi_value}`,
          icon: {
            path: g.maps.SymbolPath.CIRCLE,
            scale: 15,
            fillColor: color,
            fillOpacity: 0.8,
            strokeColor: "#fff",
            strokeWeight: 2,
          },
        })

        const infoWindow = new g.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-bold">${city.name}</h3>
              <p>AQI: <span style="color: ${color}; font-weight: bold;">${city.aqi_value}</span></p>
              <p>Status: ${city.quality_category}</p>
            </div>
          `,
        })

        marker.addListener("click", () => {
          infoWindow.open(map, marker)
        })
      })
    }
  }, [map, aqiData])

  const getAQIColor = (aqi: number): string => {
    if (aqi <= 50) return "#00E400" // Green
    if (aqi <= 100) return "#FFFF00" // Yellow
    if (aqi <= 200) return "#FF7E00" // Orange
    if (aqi <= 300) return "#FF0000" // Red
    if (aqi <= 400) return "#8F3F97" // Purple
    return "#7E0023" // Maroon
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setUserLocation({ lat, lng })

          if (map) {
            map.setCenter({ lat, lng })
            map.setZoom(12)
          }

          // Reverse geocoding
          const g = (window as any).google as typeof google
          if (!g) return
          const geocoder = new g.maps.Geocoder()
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results?.[0]) {
              onLocationSelect(lat, lng, results[0].formatted_address)
            }
          })
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          AQI Map
        </CardTitle>
        <Button onClick={getCurrentLocation} size="sm" variant="outline">
          <Locate className="h-4 w-4 mr-2" />
          My Location
        </Button>
      </CardHeader>
      <CardContent>
        {loadError ? (
          <div className="w-full h-96 bg-red-50 rounded-lg flex flex-col items-center justify-center text-center px-4">
            <p className="text-red-700 font-semibold mb-2">Google Maps failed to load</p>
            <p className="text-sm text-red-600 max-w-md">{loadError}</p>
            <a
              className="mt-4 inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
              href="https://developers.google.com/maps/documentation/javascript/get-api-key"
              target="_blank"
              rel="noreferrer"
            >
              Fix in Google Cloud Console ↗
            </a>
          </div>
        ) : (
          <>
            <div ref={mapRef} className="w-full h-96 rounded-lg" />
            {!isLoaded && !loadError && (
              <div className="w-full h-96 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-gray-500">Loading Google Maps...</p>
                <p className="text-xs text-gray-400 mt-1">
                  API Key: {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.slice(0, 10)}...
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
