"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Bell, BellRing, Settings, AlertTriangle } from "lucide-react"

interface NotificationCenterProps {
  cityId: number
  currentAQI: number
}

interface NotificationSettings {
  enabled: boolean
  thresholds: {
    moderate: boolean
    poor: boolean
    very_poor: boolean
    severe: boolean
  }
  daily_forecast: boolean
  health_alerts: boolean
}

interface NotificationLog {
  id: number
  notification_type: string
  message: string
  aqi_value: number
  sent_at: string
}

export function NotificationCenter({ cityId, currentAQI }: NotificationCenterProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    thresholds: {
      moderate: true,
      poor: true,
      very_poor: true,
      severe: true,
    },
    daily_forecast: true,
    health_alerts: true,
  })
  const [notifications, setNotifications] = useState<NotificationLog[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [cityId])

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?city_id=${cityId}&limit=10`)
      const data = await response.json()

      if (data.success) {
        setNotifications(data.data)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const sendTestNotification = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city_id: cityId,
          notification_type: "test_alert",
          message: `Test notification: Current AQI is ${currentAQI}`,
          aqi_value: currentAQI,
          recipients_count: 1,
        }),
      })

      const data = await response.json()
      if (data.success) {
        fetchNotifications() // Refresh the list
      }
    } catch (error) {
      console.error("Error sending test notification:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = (key: keyof NotificationSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const updateThreshold = (threshold: keyof NotificationSettings["thresholds"], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      thresholds: { ...prev.thresholds, [threshold]: value },
    }))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "spike_alert":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "daily_forecast":
        return <Bell className="h-4 w-4 text-blue-500" />
      case "health_warning":
        return <BellRing className="h-4 w-4 text-orange-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getAQIBadgeColor = (aqi: number) => {
    if (aqi <= 100) return "bg-green-100 text-green-800"
    if (aqi <= 200) return "bg-yellow-100 text-yellow-800"
    if (aqi <= 300) return "bg-orange-100 text-orange-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Master Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Enable Notifications</h4>
              <p className="text-sm text-gray-500">Receive air quality alerts and updates</p>
            </div>
            <Switch checked={settings.enabled} onCheckedChange={(checked) => updateSettings("enabled", checked)} />
          </div>

          {settings.enabled && (
            <>
              {/* AQI Thresholds */}
              <div className="space-y-3">
                <h4 className="font-medium">Alert Thresholds</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Moderate (101-200)</span>
                    <Switch
                      checked={settings.thresholds.moderate}
                      onCheckedChange={(checked) => updateThreshold("moderate", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Poor (201-300)</span>
                    <Switch
                      checked={settings.thresholds.poor}
                      onCheckedChange={(checked) => updateThreshold("poor", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Very Poor (301-400)</span>
                    <Switch
                      checked={settings.thresholds.very_poor}
                      onCheckedChange={(checked) => updateThreshold("very_poor", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Severe (400+)</span>
                    <Switch
                      checked={settings.thresholds.severe}
                      onCheckedChange={(checked) => updateThreshold("severe", checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Other Settings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Daily Forecast</span>
                    <p className="text-xs text-gray-500">Morning AQI forecast</p>
                  </div>
                  <Switch
                    checked={settings.daily_forecast}
                    onCheckedChange={(checked) => updateSettings("daily_forecast", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Health Alerts</span>
                    <p className="text-xs text-gray-500">Personalized health recommendations</p>
                  </div>
                  <Switch
                    checked={settings.health_alerts}
                    onCheckedChange={(checked) => updateSettings("health_alerts", checked)}
                  />
                </div>
              </div>

              {/* Test Notification */}
              <Button
                onClick={sendTestNotification}
                disabled={loading}
                size="sm"
                variant="outline"
                className="w-full bg-transparent"
              >
                {loading ? "Sending..." : "Send Test Notification"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No notifications yet</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
                  {getNotificationIcon(notification.notification_type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{notification.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{new Date(notification.sent_at).toLocaleString()}</span>
                      {notification.aqi_value && (
                        <Badge variant="secondary" className={`text-xs ${getAQIBadgeColor(notification.aqi_value)}`}>
                          AQI {notification.aqi_value}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
