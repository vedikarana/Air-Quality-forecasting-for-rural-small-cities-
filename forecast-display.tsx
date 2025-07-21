"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CloudSun, TrendingUp, RefreshCw } from "lucide-react"

interface ForecastProps {
  cityId: number
  cityName: string
}

interface ForecastData {
  date: string
  predicted_aqi: number
  predicted_pm25: number
  confidence: number
  category: string
  weather_factors: {
    temperature: number
    humidity: number
    wind_speed: number
  }
}

export function ForecastDisplay({ cityId, cityName }: ForecastProps) {
  const [forecasts, setForecasts] = useState<ForecastData[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchForecast()
  }, [cityId])

  const fetchForecast = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/aqi/forecast/${cityId}?days=7`)
      const data = await response.json()

      if (data.success) {
        setForecasts(data.data.forecasts)
      }
    } catch (error) {
      console.error("Error fetching forecast:", error)
    } finally {
      setLoading(false)
    }
  }

  const regenerateForecast = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/aqi/forecast/${cityId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: 7, force_refresh: true }),
      })
      const data = await response.json()

      if (data.success) {
        setForecasts(data.data.forecasts)
      }
    } catch (error) {
      console.error("Error regenerating forecast:", error)
    } finally {
      setLoading(false)
    }
  }

  const getAQIColor = (aqi: number): string => {
    if (aqi <= 50) return "#00E400"
    if (aqi <= 100) return "#FFFF00"
    if (aqi <= 200) return "#FF7E00"
    if (aqi <= 300) return "#FF0000"
    if (aqi <= 400) return "#8F3F97"
    return "#7E0023"
  }

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return "text-green-600"
    if (confidence >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          7-Day AQI Forecast - {cityName}
        </CardTitle>
        <Button onClick={regenerateForecast} disabled={loading} size="sm" variant="outline">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Forecast Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {forecasts.map((forecast, index) => (
                <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium">
                      {new Date(forecast.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <Badge variant="outline" className={getConfidenceColor(forecast.confidence)}>
                      {forecast.confidence}% confidence
                    </Badge>
                  </div>

                  <div className="text-center mb-3">
                    <div
                      className="inline-flex items-center justify-center w-16 h-16 rounded-full text-white text-lg font-bold mb-2"
                      style={{ backgroundColor: getAQIColor(forecast.predicted_aqi) }}
                    >
                      {forecast.predicted_aqi}
                    </div>
                    <div className="text-sm text-gray-600">{forecast.category}</div>
                  </div>

                  {/* Weather Factors */}
                  <div className="space-y-1 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <CloudSun className="h-3 w-3" />
                      {forecast.weather_factors.temperature.toFixed(1)}°C
                    </div>
                    <div>Humidity: {forecast.weather_factors.humidity.toFixed(1)}%</div>
                    <div>Wind: {forecast.weather_factors.wind_speed.toFixed(1)} km/h</div>
                    <div>PM2.5: {forecast.predicted_pm25?.toFixed(1)} μg/m³</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Forecast Chart */}
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">AQI Trend Forecast</h4>
              <div className="h-32 flex items-end justify-between gap-2 bg-gray-50 p-4 rounded-lg">
                {forecasts.map((forecast, index) => {
                  const maxAQI = Math.max(...forecasts.map((f) => f.predicted_aqi))
                  const height = (forecast.predicted_aqi / maxAQI) * 100

                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div
                        className="w-full rounded-t transition-all duration-200"
                        style={{
                          height: `${height}px`,
                          backgroundColor: getAQIColor(forecast.predicted_aqi),
                          minHeight: "8px",
                        }}
                      />
                      <div className="text-xs text-gray-500 mt-1">{new Date(forecast.date).getDate()}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded-lg">
              <strong>Disclaimer:</strong> Forecasts are predictions based on historical data and weather patterns.
              Actual conditions may vary. Use for general planning purposes only.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
