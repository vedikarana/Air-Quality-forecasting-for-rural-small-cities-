"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Thermometer,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Bell,
  Map,
  BarChart3,
  Heart,
} from "lucide-react"

// Import our new components
import { GoogleMaps } from "@/components/google-maps"
import { AQIChart } from "@/components/aqi-chart"
import { ForecastDisplay } from "@/components/forecast-display"
import { HealthDashboard } from "@/components/health-dashboard"
import { NotificationCenter } from "@/components/notification-center"
import { DatabaseSetupNotice } from "@/components/database-setup-notice"
import { LocationFilter } from "@/components/location-filter"
import { MapsStatusChecker } from "@/components/maps-status-checker"

interface City {
  id: number
  name: string
  state: string
  latitude: number
  longitude: number
}

interface AQIData {
  aqi_value: number
  pm25: number
  pm10: number
  no2: number
  quality_category: string
  recorded_at: string
}

interface HealthAdvisory {
  category: string
  general_advice: string
  mask_recommendation: boolean
  air_purifier_recommendation: boolean
  color_code: string
  risk_level: string
}

export default function AirQualityDashboard() {
  const [cities, setCities] = useState<City[]>([])
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [currentAQI, setCurrentAQI] = useState<AQIData | null>(null)
  const [healthAdvisory, setHealthAdvisory] = useState<HealthAdvisory | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [showDatabaseNotice, setShowDatabaseNotice] = useState(false)

  // Fetch cities on component mount
  useEffect(() => {
    fetchCities()
  }, [])

  const fetchCities = async () => {
    setError(null)
    try {
      const res = await fetch("/api/cities")

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(`Request failed: ${res.status} – ${msg.slice(0, 80)}`)
      }

      const isJson = (res.headers.get("content-type") || "").includes("application/json")
      if (!isJson) throw new Error("Response is not JSON")

      const data = await res.json()
      if (!data.success) throw new Error(data.error || "Unknown API error")

      // Check if we're getting mock data
      if (data.message?.includes("mock data")) {
        setShowDatabaseNotice(true)
      }

      setCities(data.data)
      if (data.data.length > 0) {
        setSelectedCity(data.data[0])
        setSelectedLocation({ lat: data.data[0].latitude, lng: data.data[0].longitude })
      }
    } catch (err) {
      console.error("Error fetching cities:", err)
      setError((err as Error).message || "Failed to load cities")
    }
  }

  const fetchCurrentAQI = async (cityId: number) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/aqi/current/${cityId}`)
      const data = await response.json()

      if (data.success) {
        setCurrentAQI(data.data.aqi)
        setHealthAdvisory(data.data.health_advisory)
      } else {
        setError(data.error)
      }
    } catch (error) {
      console.error("Error fetching AQI:", error)
      setError("Failed to load AQI data")
    } finally {
      setLoading(false)
    }
  }

  const refreshAQIData = async (cityId: number) => {
    setLoading(true)

    try {
      const response = await fetch(`/api/aqi/current/${cityId}`, {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        setCurrentAQI(data.data.aqi)
        setHealthAdvisory(data.data.health_advisory)
      } else {
        setError(data.error)
      }
    } catch (error) {
      console.error("Error refreshing AQI:", error)
      setError("Failed to refresh AQI data")
    } finally {
      setLoading(false)
    }
  }

  // Fetch AQI when city changes
  useEffect(() => {
    if (selectedCity) {
      fetchCurrentAQI(selectedCity.id)
    }
  }, [selectedCity])

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setSelectedLocation({ lat, lng })
    // In a real app, you might want to find the nearest city or create a custom location
    console.log("Selected location:", { lat, lng, address })
  }

  const handleCitySelect = (city: City) => {
    setSelectedCity(city)
    setSelectedLocation({ lat: city.latitude, lng: city.longitude })
  }

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return "bg-green-500"
    if (aqi <= 100) return "bg-yellow-500"
    if (aqi <= 200) return "bg-orange-500"
    if (aqi <= 300) return "bg-red-500"
    if (aqi <= 400) return "bg-purple-500"
    return "bg-red-900"
  }

  const getAQITextColor = (aqi: number) => {
    if (aqi <= 50) return "text-green-700"
    if (aqi <= 100) return "text-yellow-700"
    if (aqi <= 200) return "text-orange-700"
    if (aqi <= 300) return "text-red-700"
    if (aqi <= 400) return "text-purple-700"
    return "text-red-900"
  }

  // Prepare AQI data for map markers
  const mapAQIData = cities.map((city) => ({
    id: city.id,
    name: city.name,
    latitude: city.latitude,
    longitude: city.longitude,
    aqi_value: city.id === selectedCity?.id ? currentAQI?.aqi_value || 0 : Math.floor(Math.random() * 200) + 50,
    quality_category: city.id === selectedCity?.id ? currentAQI?.quality_category || "Moderate" : "Moderate",
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Air Quality Monitoring System</h1>
          <p className="text-lg text-gray-600">
            Real-time AQI data, forecasting, and health advisories for Indian cities
          </p>
        </div>

        {showDatabaseNotice && <DatabaseSetupNotice />}

        {/* Add Maps Status Checker */}
        <MapsStatusChecker />

        {/* City Selection */}
        <LocationFilter cities={cities} selectedCity={selectedCity} onCitySelect={handleCitySelect} />

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {selectedCity && (
          <div className="space-y-6">
            {/* Current AQI Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Thermometer className="h-5 w-5" />
                      Current Air Quality - {selectedCity.name}
                    </CardTitle>
                    <CardDescription>
                      {currentAQI?.recorded_at && `Last updated: ${new Date(currentAQI.recorded_at).toLocaleString()}`}
                    </CardDescription>
                  </div>
                  <Button onClick={() => refreshAQIData(selectedCity.id)} disabled={loading} size="sm">
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  </Button>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <RefreshCw className="h-8 w-8 animate-spin" />
                    </div>
                  ) : currentAQI ? (
                    <div className="space-y-4">
                      {/* Main AQI Display */}
                      <div className="text-center space-y-2">
                        <div
                          className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getAQIColor(currentAQI.aqi_value)} text-white text-2xl font-bold`}
                        >
                          {currentAQI.aqi_value}
                        </div>
                        <div>
                          <Badge variant="secondary" className={getAQITextColor(currentAQI.aqi_value)}>
                            {currentAQI.quality_category}
                          </Badge>
                        </div>
                      </div>

                      {/* Pollutant Details */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-600">PM2.5</div>
                          <div className="text-lg font-semibold">{currentAQI.pm25?.toFixed(1)} μg/m³</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-600">PM10</div>
                          <div className="text-lg font-semibold">{currentAQI.pm10?.toFixed(1)} μg/m³</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-600">NO₂</div>
                          <div className="text-lg font-semibold">{currentAQI.no2?.toFixed(1)} μg/m³</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">No AQI data available</div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Health Advisory */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {healthAdvisory?.risk_level === "Low" ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                    )}
                    Quick Advisory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {healthAdvisory ? (
                    <div className="space-y-4">
                      <div>
                        <Badge
                          variant="outline"
                          style={{
                            backgroundColor: healthAdvisory.color_code + "20",
                            borderColor: healthAdvisory.color_code,
                          }}
                        >
                          {healthAdvisory.risk_level}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-gray-700">{healthAdvisory.general_advice}</p>

                        <div className="flex flex-wrap gap-2">
                          {healthAdvisory.mask_recommendation && <Badge variant="secondary">😷 Wear Mask</Badge>}
                          {healthAdvisory.air_purifier_recommendation && (
                            <Badge variant="secondary">🌪️ Use Air Purifier</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">No advisory available</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Dashboard Tabs */}
            <Tabs defaultValue="map" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="map" className="flex items-center gap-2">
                  <Map className="h-4 w-4" />
                  Map
                </TabsTrigger>
                <TabsTrigger value="trends" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Trends
                </TabsTrigger>
                <TabsTrigger value="forecast" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Forecast
                </TabsTrigger>
                <TabsTrigger value="health" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Health
                </TabsTrigger>
                <TabsTrigger value="alerts" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Alerts
                </TabsTrigger>
              </TabsList>

              <TabsContent value="map" className="space-y-6">
                <GoogleMaps
                  onLocationSelect={handleLocationSelect}
                  selectedLocation={selectedLocation}
                  aqiData={mapAQIData}
                />
              </TabsContent>

              <TabsContent value="trends" className="space-y-6">
                <AQIChart cityId={selectedCity.id} cityName={selectedCity.name} />
              </TabsContent>

              <TabsContent value="forecast" className="space-y-6">
                <ForecastDisplay cityId={selectedCity.id} cityName={selectedCity.name} />
              </TabsContent>

              <TabsContent value="health" className="space-y-6">
                {currentAQI && <HealthDashboard aqiValue={currentAQI.aqi_value} cityName={selectedCity.name} />}
              </TabsContent>

              <TabsContent value="alerts" className="space-y-6">
                {currentAQI && <NotificationCenter cityId={selectedCity.id} currentAQI={currentAQI.aqi_value} />}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* API Documentation Link */}
        <Card>
          <CardHeader>
            <CardTitle>API Documentation</CardTitle>
            <CardDescription>Complete REST API documentation for developers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Access comprehensive API documentation with examples, data models, and integration guides.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">REST API</Badge>
                  <Badge variant="outline">Real-time Data</Badge>
                  <Badge variant="outline">Supabase Backend</Badge>
                  <Badge variant="outline">Google Maps</Badge>
                  <Badge variant="outline">Health Advisories</Badge>
                </div>
              </div>
              <Button asChild>
                <a href="/api/docs" target="_blank" rel="noreferrer">
                  View Documentation
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
