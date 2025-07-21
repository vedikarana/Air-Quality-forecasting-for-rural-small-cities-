"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Heart,
  AlertTriangle,
  CheckCircle,
  VenetianMaskIcon as Mask,
  Wind,
  Activity,
  Users,
  Home,
  Car,
} from "lucide-react"

interface HealthDashboardProps {
  aqiValue: number
  cityName: string
}

interface HealthAdvisory {
  category: string
  general_advice: string
  specific_recommendations: {
    indoor: string[]
    outdoor: string[]
    health: string[]
    equipment: string[]
  }
  color_code: string
  risk_level: string
  mask_recommendation: boolean
  air_purifier_recommendation: boolean
}

export function HealthDashboard({ aqiValue, cityName }: HealthDashboardProps) {
  const [advisory, setAdvisory] = useState<HealthAdvisory | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (aqiValue > 0) {
      fetchHealthAdvisory()
    }
  }, [aqiValue])

  const fetchHealthAdvisory = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/health/advisory?aqi=${aqiValue}`)
      const data = await response.json()

      if (data.success) {
        setAdvisory(data.data)
      }
    } catch (error) {
      console.error("Error fetching health advisory:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "Low":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "Moderate":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-red-500" />
    }
  }

  const getAlertVariant = (riskLevel: string): "default" | "destructive" => {
    return riskLevel === "Low" ? "default" : "destructive"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Health Advisory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-500">Loading health advisory...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!advisory) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Health Advisory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No health advisory available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Health Advisory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getRiskIcon(advisory.risk_level)}
            Health Advisory - {cityName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Risk Level */}
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                style={{
                  backgroundColor: advisory.color_code + "20",
                  borderColor: advisory.color_code,
                  color: advisory.color_code,
                }}
              >
                {advisory.risk_level} Risk
              </Badge>
              <Badge variant="secondary">{advisory.category}</Badge>
            </div>

            {/* General Advice */}
            <Alert variant={getAlertVariant(advisory.risk_level)}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{advisory.general_advice}</AlertDescription>
            </Alert>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              {advisory.mask_recommendation && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Mask className="h-3 w-3" />
                  Wear Mask
                </Badge>
              )}
              {advisory.air_purifier_recommendation && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Wind className="h-3 w-3" />
                  Use Air Purifier
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Indoor Recommendations */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Home className="h-4 w-4" />
              Indoor Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {advisory.specific_recommendations.indoor.map((rec, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Outdoor Recommendations */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Car className="h-4 w-4" />
              Outdoor Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {advisory.specific_recommendations.outdoor.map((rec, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Health Recommendations */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4" />
              Health Precautions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {advisory.specific_recommendations.health.map((rec, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <Heart className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Equipment Recommendations */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Wind className="h-4 w-4" />
              Recommended Equipment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {advisory.specific_recommendations.equipment.map((rec, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <Wind className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Sensitive Groups Warning */}
      {advisory.risk_level !== "Low" && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm text-orange-800">
              <Users className="h-4 w-4" />
              Special Advisory for Sensitive Groups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-700">
              Children, elderly, pregnant women, and people with respiratory or heart conditions should take extra
              precautions. Consider staying indoors and consulting healthcare providers if experiencing symptoms.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
