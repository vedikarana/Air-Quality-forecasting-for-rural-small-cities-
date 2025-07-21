"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, BarChart3 } from "lucide-react"

interface AQIChartProps {
  cityId: number
  cityName: string
}

interface HistoricalData {
  date: string
  aqi: number
  pm25: number
  pm10: number
  no2: number
  category: string
}

export function AQIChart({ cityId, cityName }: AQIChartProps) {
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState(30)
  const [selectedPollutant, setSelectedPollutant] = useState<keyof HistoricalData>("aqi")

  useEffect(() => {
    fetchHistoricalData()
  }, [cityId, selectedPeriod])

  const fetchHistoricalData = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/aqi/historical/${cityId}?days=${selectedPeriod}&pollutant=${selectedPollutant}`,
      )
      const data = await response.json()

      if (data.success) {
        setHistoricalData(data.data.readings)
      }
    } catch (error) {
      console.error("Error fetching historical data:", error)
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

  const maxValue = Math.max(...historicalData.map((d) => d[selectedPollutant] as number))
  const minValue = Math.min(...historicalData.map((d) => d[selectedPollutant] as number))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Historical Trends - {cityName}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={selectedPeriod === 7 ? "default" : "outline"}
              onClick={() => setSelectedPeriod(7)}
            >
              7D
            </Button>
            <Button
              size="sm"
              variant={selectedPeriod === 30 ? "default" : "outline"}
              onClick={() => setSelectedPeriod(30)}
            >
              30D
            </Button>
            <Button
              size="sm"
              variant={selectedPeriod === 90 ? "default" : "outline"}
              onClick={() => setSelectedPeriod(90)}
            >
              90D
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Pollutant Selection */}
        <div className="flex gap-2 mb-4">
          {(["aqi", "pm25", "pm10", "no2"] as const).map((pollutant) => (
            <Button
              key={pollutant}
              size="sm"
              variant={selectedPollutant === pollutant ? "default" : "outline"}
              onClick={() => setSelectedPollutant(pollutant)}
            >
              {pollutant.toUpperCase()}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">Loading chart data...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Simple Bar Chart */}
            <div className="h-64 flex items-end justify-between gap-1 bg-gray-50 p-4 rounded-lg">
              {historicalData.slice(-20).map((data, index) => {
                const value = data[selectedPollutant] as number
                const height = ((value - minValue) / (maxValue - minValue)) * 200
                const color = selectedPollutant === "aqi" ? getAQIColor(value) : "#3B82F6"

                return (
                  <div key={index} className="flex flex-col items-center group relative" style={{ minWidth: "20px" }}>
                    <div
                      className="w-full rounded-t transition-all duration-200 hover:opacity-80"
                      style={{
                        height: `${height}px`,
                        backgroundColor: color,
                        minHeight: "4px",
                      }}
                    />
                    <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-left">
                      {new Date(data.date).getDate()}
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                      <div>{data.date}</div>
                      <div>
                        {selectedPollutant.toUpperCase()}: {value}
                      </div>
                      <div>Category: {data.category}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Average</div>
                <div className="text-lg font-semibold">
                  {(
                    historicalData.reduce((sum, d) => sum + (d[selectedPollutant] as number), 0) / historicalData.length
                  ).toFixed(1)}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Maximum</div>
                <div className="text-lg font-semibold">{maxValue.toFixed(1)}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Minimum</div>
                <div className="text-lg font-semibold">{minValue.toFixed(1)}</div>
              </div>
            </div>

            {/* Recent Trend */}
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm text-gray-600">
                Trend:{" "}
                {historicalData.length > 1 &&
                (historicalData[historicalData.length - 1][selectedPollutant] as number) >
                  (historicalData[0][selectedPollutant] as number)
                  ? "Increasing"
                  : "Decreasing"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
