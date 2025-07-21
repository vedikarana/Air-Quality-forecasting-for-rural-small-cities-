"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Database, CheckCircle, AlertTriangle, Copy, ExternalLink } from "lucide-react"

export function DatabaseSetupNotice() {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const sqlSchema = `-- Create tables for Air Quality data storage

-- Cities/Locations table
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    cpcb_station_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AQI readings table
CREATE TABLE IF NOT EXISTS aqi_readings (
    id SERIAL PRIMARY KEY,
    city_id INTEGER REFERENCES cities(id),
    station_name VARCHAR(100),
    aqi_value INTEGER NOT NULL,
    pm25 DECIMAL(8, 2),
    pm10 DECIMAL(8, 2),
    no2 DECIMAL(8, 2),
    so2 DECIMAL(8, 2),
    co DECIMAL(8, 2),
    o3 DECIMAL(8, 2),
    nh3 DECIMAL(8, 2),
    quality_category VARCHAR(20) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health advisories
CREATE TABLE IF NOT EXISTS health_advisories (
    id SERIAL PRIMARY KEY,
    aqi_min INTEGER NOT NULL,
    aqi_max INTEGER NOT NULL,
    category VARCHAR(20) NOT NULL,
    general_advice TEXT NOT NULL,
    sensitive_groups_advice TEXT,
    outdoor_activities TEXT,
    mask_recommendation BOOLEAN DEFAULT FALSE,
    air_purifier_recommendation BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_aqi_readings_city_recorded ON aqi_readings(city_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_cities_location ON cities(latitude, longitude);`

  const sqlSeedData = `-- Insert sample cities
INSERT INTO cities (name, state, latitude, longitude, cpcb_station_id) VALUES
('Delhi', 'Delhi', 28.6139, 77.2090, 'DL001'),
('Mumbai', 'Maharashtra', 19.0760, 72.8777, 'MH001'),
('Bangalore', 'Karnataka', 12.9716, 77.5946, 'KA001'),
('Chennai', 'Tamil Nadu', 13.0827, 80.2707, 'TN001'),
('Kolkata', 'West Bengal', 22.5726, 88.3639, 'WB001'),
('Hyderabad', 'Telangana', 17.3850, 78.4867, 'TS001'),
('Pune', 'Maharashtra', 18.5204, 73.8567, 'MH002'),
('Ahmedabad', 'Gujarat', 23.0225, 72.5714, 'GJ001'),
('Jaipur', 'Rajasthan', 26.9124, 75.7873, 'RJ001'),
('Lucknow', 'Uttar Pradesh', 26.8467, 80.9462, 'UP001');

-- Insert health advisories
INSERT INTO health_advisories (aqi_min, aqi_max, category, general_advice, sensitive_groups_advice, outdoor_activities, mask_recommendation, air_purifier_recommendation) VALUES
(0, 50, 'Good', 'Air quality is satisfactory. Enjoy outdoor activities.', 'No restrictions for sensitive groups.', 'All outdoor activities are safe.', FALSE, FALSE),
(51, 100, 'Satisfactory', 'Air quality is acceptable for most people.', 'Sensitive individuals may experience minor breathing discomfort.', 'Normal outdoor activities are fine.', FALSE, FALSE),
(101, 200, 'Moderate', 'May cause breathing discomfort to sensitive people.', 'Children, elderly, and people with respiratory issues should limit prolonged outdoor exposure.', 'Reduce prolonged or heavy outdoor activities.', TRUE, FALSE),
(201, 300, 'Poor', 'May cause breathing discomfort to most people on prolonged exposure.', 'Avoid outdoor activities. Use air purifiers indoors.', 'Avoid outdoor activities, especially for children and elderly.', TRUE, TRUE),
(301, 400, 'Very Poor', 'May cause respiratory illness on prolonged exposure.', 'Avoid all outdoor activities. Stay indoors with air purification.', 'Avoid all outdoor activities.', TRUE, TRUE),
(401, 500, 'Severe', 'May cause serious respiratory effects even on healthy people.', 'Emergency conditions. Everyone should avoid outdoor exposure.', 'All outdoor activities prohibited.', TRUE, TRUE);`

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Database className="h-5 w-5" />
          Database Setup Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            The database tables haven't been created yet. The app is currently using mock data for demonstration.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              Current Status
            </Badge>
            <span className="text-sm">Using mock data</span>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">To enable real data:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Go to your Supabase dashboard</li>
              <li>Navigate to the SQL Editor</li>
              <li>Run the schema creation script below</li>
              <li>Run the seed data script</li>
              <li>Refresh this page</li>
            </ol>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-sm">1. Schema Creation Script</h5>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(sqlSchema, "schema")}
                  className="h-7 px-2"
                >
                  {copied === "schema" ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
              <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto max-h-32">{sqlSchema}</pre>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-sm">2. Seed Data Script</h5>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(sqlSeedData, "seed")}
                  className="h-7 px-2"
                >
                  {copied === "seed" ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
              <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto max-h-32">
                {sqlSeedData}
              </pre>
            </div>
          </div>

          <Button asChild size="sm" className="w-full">
            <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Supabase Dashboard
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
