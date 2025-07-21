"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, ExternalLink } from "lucide-react"
import { CheckCircle } from "lucide-react"

export function MapsStatusChecker() {
  const [status, setStatus] = useState<{
    apiKey: string
    isLoaded: boolean
    hasError: boolean
    errorMessage?: string
  }>({
    apiKey: "AIzaSyAIJHUcGJTg75EEsE0-j9wR8EV-UUaCpVk",
    isLoaded: false,
    hasError: false,
  })

  const checkMapsStatus = () => {
    // JS library already injected by <GoogleMaps>.
    const isLoaded = typeof window !== "undefined" && (window as any).google?.maps
    setStatus((prev) => ({
      ...prev,
      isLoaded,
      hasError: !isLoaded,
      errorMessage: isLoaded ? undefined : "Google Maps JavaScript library not yet loaded – check API key / network.",
    }))
  }

  useEffect(() => {
    checkMapsStatus()
  }, [])

  const getStatusBadge = () => {
    if (status.isLoaded) return <Badge className="bg-green-100 text-green-800">Loaded</Badge>
    return <Badge className="bg-red-100 text-red-800">Not Loaded</Badge>
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <CheckCircle className="h-5 w-5" />
          Google Maps API Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm mb-2">API Configuration</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Key:</span>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">{status.apiKey.slice(0, 10)}...</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Status:</span>
                {getStatusBadge()}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={checkMapsStatus} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
          <Button asChild size="sm" variant="outline">
            <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Google Cloud Console
            </a>
          </Button>
        </div>

        {/* Quick Setup Guide */}
        <div className="bg-white p-3 rounded border">
          <h5 className="font-medium text-sm mb-2">Quick Setup Checklist:</h5>
          <ul className="text-xs space-y-1">
            <li>✅ API Key: AIzaSyAIJHUcGJTg75EEsE0-j9wR8EV-UUaCpVk</li>
            <li>✅ Maps JavaScript API enabled</li>
            <li>✅ Places API enabled</li>
            <li>✅ Geocoding API enabled</li>
            <li>⚠️ Check billing account is active</li>
            <li>⚠️ Verify API restrictions (if any)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
