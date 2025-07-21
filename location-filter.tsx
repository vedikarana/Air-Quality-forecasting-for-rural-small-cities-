"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Filter, Search, MapPin } from "lucide-react"

interface City {
  id: number
  name: string
  state: string
  latitude: number
  longitude: number
  category?: string
  population?: number
  district?: string
  display_category?: string
}

interface LocationFilterProps {
  cities: City[]
  selectedCity: City | null
  onCitySelect: (city: City) => void
}

export function LocationFilter({ cities, selectedCity, onCitySelect }: LocationFilterProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)

  // Get unique states
  const states = Array.from(new Set(cities.map((city) => city.state))).sort()

  // Enhanced city categorization
  const getCityType = (city: City): string => {
    if (city.category) {
      switch (city.category) {
        case "rural":
          return "Village"
        case "town":
          return "Town"
        case "small_city":
          return "Small City"
        case "major_city":
          return "Major City"
        default:
          return "City"
      }
    }

    // Fallback logic for cities without category
    const majorCities = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Nagpur"]
    const industrialTowns = [
      "Singrauli",
      "Korba",
      "Dhanbad",
      "Bokaro",
      "Jamshedpur",
      "Bhilai",
      "Rourkela",
      "Bhiwandi",
      "Ichalkaranji",
    ]
    const hillStations = ["Shimla", "Dharamshala", "Kullu", "Mandi", "Rishikesh", "Dehradun"]
    const coastalCities = [
      "Kochi",
      "Kozhikode",
      "Mangalore",
      "Visakhapatnam",
      "Chennai",
      "Mumbai",
      "Chiplun",
      "Ratnagiri",
    ]

    if (majorCities.includes(city.name)) return "Major City"
    if (industrialTowns.includes(city.name)) return "Industrial Town"
    if (hillStations.includes(city.name)) return "Hill Station"
    if (coastalCities.includes(city.name)) return "Coastal City"
    if (["Punjab", "Haryana"].includes(city.state)) return "Agricultural"
    if (city.population && city.population < 50000) return "Village"
    if (city.population && city.population < 200000) return "Town"
    return "City"
  }

  // Filter cities based on search and filters
  const filteredCities = cities.filter((city) => {
    const matchesSearch =
      city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (city.district && city.district.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesState = !selectedState || city.state === selectedState
    const matchesType = !selectedType || getCityType(city) === selectedType

    return matchesSearch && matchesState && matchesType
  })

  // Get city types for filter
  const cityTypes = Array.from(new Set(cities.map((city) => getCityType(city)))).sort()

  const getTypeColor = (type: string): string => {
    switch (type) {
      case "Major City":
        return "bg-blue-100 text-blue-800"
      case "Small City":
        return "bg-indigo-100 text-indigo-800"
      case "Industrial Town":
        return "bg-red-100 text-red-800"
      case "Town":
        return "bg-purple-100 text-purple-800"
      case "Village":
        return "bg-green-100 text-green-800"
      case "Hill Station":
        return "bg-emerald-100 text-emerald-800"
      case "Coastal City":
        return "bg-cyan-100 text-cyan-800"
      case "Agricultural":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPopulationDisplay = (population?: number): string => {
    if (!population) return ""
    if (population >= 1000000) return `${(population / 1000000).toFixed(1)}M`
    if (population >= 1000) return `${(population / 1000).toFixed(0)}K`
    return population.toString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Location Selection ({filteredCities.length} locations)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search cities, towns, villages, or districts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="space-y-3">
          {/* State Filter */}
          <div>
            <h4 className="text-sm font-medium mb-2">Filter by State</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={selectedState === null ? "default" : "outline"}
                onClick={() => setSelectedState(null)}
              >
                All States ({cities.length})
              </Button>
              {states.slice(0, 8).map((state) => {
                const count = cities.filter((c) => c.state === state).length
                return (
                  <Button
                    key={state}
                    size="sm"
                    variant={selectedState === state ? "default" : "outline"}
                    onClick={() => setSelectedState(state)}
                  >
                    {state} ({count})
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <h4 className="text-sm font-medium mb-2">Filter by Type</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={selectedType === null ? "default" : "outline"}
                onClick={() => setSelectedType(null)}
              >
                All Types
              </Button>
              {cityTypes.map((type) => {
                const count = cities.filter((c) => getCityType(c) === type).length
                return (
                  <Button
                    key={type}
                    size="sm"
                    variant={selectedType === type ? "default" : "outline"}
                    onClick={() => setSelectedType(type)}
                  >
                    {type} ({count})
                  </Button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Cities Grid */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Locations ({filteredCities.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {filteredCities.map((city) => {
              const cityType = getCityType(city)
              return (
                <Button
                  key={city.id}
                  variant={selectedCity?.id === city.id ? "default" : "outline"}
                  onClick={() => onCitySelect(city)}
                  className="justify-start h-auto p-3"
                >
                  <div className="flex flex-col items-start w-full">
                    <div className="flex items-center gap-2 w-full">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="font-medium truncate">{city.name}</span>
                      {city.population && (
                        <span className="text-xs text-gray-500 ml-auto">{getPopulationDisplay(city.population)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 w-full">
                      <span className="text-xs text-gray-500">
                        {city.district ? `${city.district}, ` : ""}
                        {city.state}
                      </span>
                      <Badge variant="secondary" className={`text-xs ${getTypeColor(cityType)}`}>
                        {city.display_category || cityType}
                      </Badge>
                    </div>
                  </div>
                </Button>
              )
            })}
          </div>
        </div>

        {filteredCities.length === 0 && (
          <div className="text-center py-4 text-gray-500">No locations found matching your criteria</div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t">
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="text-sm font-medium text-green-800">Villages</div>
            <div className="text-lg font-bold text-green-900">
              {cities.filter((c) => getCityType(c) === "Village").length}
            </div>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded">
            <div className="text-sm font-medium text-purple-800">Towns</div>
            <div className="text-lg font-bold text-purple-900">
              {cities.filter((c) => getCityType(c) === "Town").length}
            </div>
          </div>
          <div className="text-center p-2 bg-indigo-50 rounded">
            <div className="text-sm font-medium text-indigo-800">Small Cities</div>
            <div className="text-lg font-bold text-indigo-900">
              {cities.filter((c) => getCityType(c) === "Small City").length}
            </div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="text-sm font-medium text-blue-800">Major Cities</div>
            <div className="text-lg font-bold text-blue-900">
              {cities.filter((c) => getCityType(c) === "Major City").length}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
