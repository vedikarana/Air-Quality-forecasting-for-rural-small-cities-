import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * `true` when both URL & service-role key exist.
 * In Vercel preview this will likely be false, so we need fall-backs.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)

export const supabaseAdmin = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : (null as unknown as ReturnType<typeof createClient>)

// Public (anon) client -- fine if keys are missing on the client
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// ---------- types ----------
export interface City {
  id: number
  name: string
  state: string
  latitude: number
  longitude: number
  cpcb_station_id?: string
  created_at: string
  updated_at: string
}

export interface AQIReading {
  id: number
  city_id: number
  station_name?: string
  aqi_value: number
  pm25?: number
  pm10?: number
  no2?: number
  so2?: number
  co?: number
  o3?: number
  nh3?: number
  quality_category: string
  recorded_at: string
  created_at: string
}

export interface HealthAdvisory {
  id: number
  aqi_min: number
  aqi_max: number
  category: string
  general_advice: string
  sensitive_groups_advice?: string
  outdoor_activities?: string
  mask_recommendation?: boolean
  air_purifier_recommendation?: boolean
  created_at: string
}

export interface AQIForecast {
  id: number
  city_id: number
  forecast_date: string
  predicted_aqi: number
  predicted_pm25?: number
  confidence_score?: number
  weather_factor?: any
  model_version?: string
  created_at: string
}
