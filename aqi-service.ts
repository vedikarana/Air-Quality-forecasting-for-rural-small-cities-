import { supabaseAdmin, isSupabaseConfigured } from "./supabase"
import type { AQIReading, HealthAdvisory, AQIForecast } from "./supabase"

export class AQIService {
  // Fetch real-time AQI data (mock implementation)
  static async fetchRealTimeAQI(cityId: number): Promise<AQIReading | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from("aqi_readings")
        .select("*")
        .eq("city_id", cityId)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error fetching real-time AQI:", error)
      return null
    }
  }

  // Fetch historical AQI data (falls back to mock data if Supabase/tables are missing)
  static async fetchHistoricalAQI(cityId: number, days = 30): Promise<AQIReading[]> {
    // ---------- helper: mock data ----------
    const genMock = (): AQIReading[] => {
      const today = new Date()
      return Array.from({ length: days }).map((_, idx) => {
        const d = new Date(today)
        d.setDate(today.getDate() - (days - 1 - idx))
        const base = this.getBaseAQIForCityId(cityId)
        const aqi = Math.max(10, Math.round(base + (Math.random() - 0.5) * 60))
        return {
          id: idx + 1,
          city_id: cityId,
          station_name: `Mock Station ${cityId}`,
          aqi_value: aqi,
          pm25: aqi * 0.6,
          pm10: aqi * 0.8,
          no2: aqi * 0.4,
          so2: aqi * 0.2,
          co: aqi * 0.1,
          o3: aqi * 0.3,
          nh3: aqi * 0.15,
          quality_category: this.getQualityCategory(aqi),
          recorded_at: d.toISOString(),
          created_at: d.toISOString(),
        }
      })
    }
    // ---------- early-exit if no DB ----------
    if (!isSupabaseConfigured) return genMock()

    try {
      const { data, error } = await supabaseAdmin
        .from("aqi_readings")
        .select("*")
        .eq("city_id", cityId)
        .gte("recorded_at", new Date(Date.now() - days * 86_400_000).toISOString())
        .order("recorded_at", { ascending: true })

      // Missing table? fall back to mock
      if (error?.message?.includes("does not exist")) return genMock()

      if (error) throw error
      if (!data || data.length === 0) return genMock()

      return data
    } catch (err: any) {
      console.error("Error fetching historical AQI (mock used):", err?.message)
      return genMock()
    }
  }

  // Get health advisory based on AQI value
  static async getHealthAdvisory(aqiValue: number): Promise<HealthAdvisory | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from("health_advisories")
        .select("*")
        .lte("aqi_min", aqiValue)
        .gte("aqi_max", aqiValue)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error fetching health advisory:", error)
      return null
    }
  }

  // Generate AQI forecast (mock ML prediction if DB unavailable)
  static async generateForecast(cityId: number, days = 3): Promise<AQIForecast[]> {
    // If Supabase is missing, or we can't fetch history, rely on mock
    const historicalData = (await this.fetchHistoricalAQI(cityId, 7)) ?? []

    if (historicalData.length === 0) {
      return this.generateMockForecast(cityId, days)
    }

    // -------- existing trend-based logic continues below --------
    // Simple trend-based prediction (in real app, use ML model)
    const recentAQI = historicalData.slice(-3).map((d) => d.aqi_value)
    const avgAQI = recentAQI.reduce((sum, val) => sum + val, 0) / recentAQI.length
    const trend = recentAQI.length > 1 ? (recentAQI[recentAQI.length - 1] - recentAQI[0]) / recentAQI.length : 0

    const forecasts: AQIForecast[] = []

    for (let i = 1; i <= days; i++) {
      const forecastDate = new Date()
      forecastDate.setDate(forecastDate.getDate() + i)

      // Add some randomness and seasonal factors
      const seasonalFactor = Math.sin(((forecastDate.getMonth() + 1) * Math.PI) / 6) * 20 // Winter pollution spike
      const randomFactor = (Math.random() - 0.5) * 30
      const predictedAQI = Math.max(10, Math.round(avgAQI + trend * i + seasonalFactor + randomFactor))

      const forecast: AQIForecast = {
        id: 0, // Will be set by database
        city_id: cityId,
        forecast_date: forecastDate.toISOString().split("T")[0],
        predicted_aqi: predictedAQI,
        predicted_pm25: predictedAQI * 0.6,
        confidence_score: Math.max(0.6, 1 - i * 0.1), // Confidence decreases with time
        weather_factor: {
          temperature: 25 + Math.random() * 10,
          humidity: 60 + Math.random() * 30,
          wind_speed: 5 + Math.random() * 10,
        },
        model_version: "v1.0",
        created_at: new Date().toISOString(),
      }

      // Store forecast in database
      const { data, error } = await supabaseAdmin
        .from("aqi_forecasts")
        .upsert(forecast, {
          onConflict: "city_id,forecast_date",
          ignoreDuplicates: false,
        })
        .select()
        .single()

      if (!error && data) {
        forecasts.push(data)
      }
    }

    return forecasts
  }

  // Simulate CPCB data fetch (in real app, this would call external API)
  static async simulateCPCBDataFetch(cityId: number): Promise<AQIReading | null> {
    try {
      const { data: city } = await supabaseAdmin.from("cities").select("*").eq("id", cityId).single()

      if (!city) return null

      // Simulate realistic AQI data based on city characteristics
      const baseAQI = this.getBaseAQIForCity(city.name, city.state)
      const variation = (Math.random() - 0.5) * 40 // ±20 variation
      const currentAQI = Math.max(10, Math.round(baseAQI + variation))

      const newReading: Omit<AQIReading, "id" | "created_at"> = {
        city_id: cityId,
        station_name: `${city.name} Central`,
        aqi_value: currentAQI,
        pm25: currentAQI * 0.6,
        pm10: currentAQI * 0.8,
        no2: currentAQI * 0.4,
        so2: currentAQI * 0.2,
        co: currentAQI * 0.1,
        o3: currentAQI * 0.3,
        nh3: currentAQI * 0.15,
        quality_category: this.getQualityCategory(currentAQI),
        recorded_at: new Date().toISOString(),
      }

      const { data, error } = await supabaseAdmin.from("aqi_readings").insert(newReading).select().single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error simulating CPCB data fetch:", error)
      return null
    }
  }

  private static getBaseAQIForCity(cityName: string, state?: string): number {
    // Enhanced mapping for rural areas and small towns
    const cityAQIMap: Record<string, number> = {
      // Major cities (original)
      Delhi: 180,
      Mumbai: 120,
      Kolkata: 130,
      Chennai: 110,
      Bangalore: 100,
      Hyderabad: 120,
      Pune: 110,
      Ahmedabad: 140,
      Jaipur: 160,
      Lucknow: 170,

      // Punjab (high due to stubble burning)
      Bathinda: 165,
      Moga: 160,
      Fazilka: 155,
      Barnala: 158,
      Kapurthala: 150,

      // Haryana (NCR pollution)
      Panipat: 165,
      Karnal: 160,
      Rohtak: 155,
      Hisar: 150,
      Sirsa: 145,

      // UP towns (industrial pollution)
      Moradabad: 160,
      Firozabad: 165,
      Bareilly: 155,
      Aligarh: 158,
      Mathura: 162,
      Meerut: 168,
      Saharanpur: 155,

      // Bihar (agricultural burning)
      Muzaffarpur: 135,
      Darbhanga: 130,
      Begusarai: 140,
      Katihar: 125,
      Purnia: 128,

      // MP towns
      Gwalior: 130,
      Ujjain: 125,
      Dewas: 128,
      Ratlam: 122,
      Singrauli: 175, // Coal mining area

      // Rajasthan (dust storms)
      Jodhpur: 145,
      Bikaner: 150,
      Ajmer: 140,
      Bharatpur: 148,
      Alwar: 145,

      // Odisha (industrial)
      Rourkela: 150, // Steel city
      Sambalpur: 135,
      Balasore: 130,
      Berhampur: 125,

      // Chhattisgarh (mining)
      Raipur: 145,
      Bhilai: 155, // Steel plant
      Korba: 165, // Coal mining
      Durg: 150,

      // Jharkhand (mining/industrial)
      Jamshedpur: 160, // Steel city
      Dhanbad: 170, // Coal mining
      Bokaro: 155, // Steel
      Ranchi: 140,

      // Assam (cleaner air)
      Guwahati: 95,
      Dibrugarh: 85,
      Silchar: 90,
      Jorhat: 88,

      // Himachal Pradesh (hill stations)
      Shimla: 75,
      Dharamshala: 70,
      Kullu: 65,
      Mandi: 80,

      // Uttarakhand (mountains)
      Dehradun: 85,
      Haridwar: 95,
      Rishikesh: 75,
      Roorkee: 90,

      // Kerala (coastal)
      Kochi: 90,
      Kozhikode: 85,
      Thrissur: 88,
      Kollam: 92,

      // Andhra Pradesh
      Visakhapatnam: 105,
      Vijayawada: 115,
      Guntur: 110,
      Nellore: 100,

      // Karnataka
      Mysore: 95,
      Hubli: 105,
      Mangalore: 85, // Coastal
      Belgaum: 100,

      // Tamil Nadu
      Coimbatore: 105,
      Madurai: 110,
      Salem: 108,
      Tirupur: 115, // Textile industry
      Vellore: 112,
    }

    // If specific city found, return its AQI
    if (cityAQIMap[cityName]) {
      return cityAQIMap[cityName]
    }

    // Fallback based on state characteristics
    const stateAQIMap: Record<string, number> = {
      Punjab: 160,
      Haryana: 155,
      "Uttar Pradesh": 150,
      Bihar: 130,
      "Madhya Pradesh": 125,
      Rajasthan: 145,
      Odisha: 135,
      Chhattisgarh: 150,
      Jharkhand: 155,
      Assam: 90,
      "Himachal Pradesh": 75,
      Uttarakhand: 85,
      Kerala: 90,
      "Andhra Pradesh": 105,
      Karnataka: 100,
      "Tamil Nadu": 110,
    }

    return stateAQIMap[state || ""] || 120
  }

  private static getBaseAQIForCityId(cityId: number): number {
    // Enhanced mapping for city IDs including rural areas
    const cityIdAQIMap: Record<number, number> = {
      // Original major cities
      1: 180, // Delhi
      2: 120, // Mumbai
      3: 100, // Bangalore
      4: 110, // Chennai
      5: 130, // Kolkata
      6: 120, // Hyderabad
      7: 110, // Pune
      8: 140, // Ahmedabad
      9: 160, // Jaipur
      10: 170, // Lucknow

      // Rural and small towns (estimated based on region)
      // Punjab region (high pollution)
      11: 165,
      12: 160,
      13: 155,
      14: 158,
      15: 150,
      // Haryana region
      16: 165,
      17: 160,
      18: 155,
      19: 150,
      20: 145,
      // UP towns
      21: 160,
      22: 165,
      23: 155,
      24: 158,
      25: 162,
      26: 168,
      27: 155,
      // Bihar
      28: 135,
      29: 130,
      30: 140,
      31: 125,
      32: 128,
      // MP
      33: 130,
      34: 125,
      35: 128,
      36: 122,
      37: 175,
      // Rajasthan
      38: 145,
      39: 150,
      40: 140,
      41: 148,
      42: 145,
      // Odisha
      43: 150,
      44: 135,
      45: 130,
      46: 125,
      // Chhattisgarh
      47: 145,
      48: 155,
      49: 165,
      50: 150,
      // Jharkhand
      51: 160,
      52: 170,
      53: 155,
      54: 140,
      // Assam
      55: 95,
      56: 85,
      57: 90,
      58: 88,
      // Himachal Pradesh
      59: 75,
      60: 70,
      61: 65,
      62: 80,
      // Uttarakhand
      63: 85,
      64: 95,
      65: 75,
      66: 90,
      // Kerala
      67: 90,
      68: 85,
      69: 88,
      70: 92,
      // Andhra Pradesh
      71: 105,
      72: 115,
      73: 110,
      74: 100,
      // Karnataka
      75: 95,
      76: 105,
      77: 85,
      78: 100,
      // Tamil Nadu
      79: 105,
      80: 110,
      81: 108,
      82: 115,
      83: 112,
    }

    return cityIdAQIMap[cityId] || 120
  }

  private static getQualityCategory(aqi: number): string {
    if (aqi <= 50) return "Good"
    if (aqi <= 100) return "Satisfactory"
    if (aqi <= 200) return "Moderate"
    if (aqi <= 300) return "Poor"
    if (aqi <= 400) return "Very Poor"
    return "Severe"
  }

  private static generateMockForecast(cityId: number, days: number): AQIForecast[] {
    const base = this.getBaseAQIForCityId(cityId)
    const forecasts: AQIForecast[] = []

    for (let i = 1; i <= days; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      const aqi = Math.max(10, Math.round(base + (Math.random() - 0.5) * 60))

      forecasts.push({
        id: i,
        city_id: cityId,
        forecast_date: date.toISOString().split("T")[0],
        predicted_aqi: aqi,
        predicted_pm25: aqi * 0.6,
        confidence_score: 0.7,
        weather_factor: { humidity: 60 + Math.random() * 20 },
        model_version: "mock",
        created_at: new Date().toISOString(),
      })
    }
    return forecasts
  }
}
