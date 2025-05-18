"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { MapContainer, TileLayer, useMapEvents, Marker, Popup, useMap, Circle } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import WeatherInfo from "./weather-info"
import SearchBox from "./search-box"
import CountdownTimer from "./countdown-timer"
import WeatherForecast from "./weather-forecast"
import WeatherCharts from "./weather-charts"
import WeatherAlerts from "./weather-alerts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Fix Leaflet icon issues in Next.js
const defaultIcon = L.icon({
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = defaultIcon

// Auto-refresh interval in milliseconds (1 minute)
const AUTO_REFRESH_INTERVAL = 60 * 1000

interface Location {
  lat: number
  lng: number
  name?: string
}

interface WeatherData {
  main: {
    temp: number
    feels_like: number
    humidity: number
    pressure: number
  }
  weather: Array<{
    id: number
    main: string
    description: string
    icon: string
  }>
  wind: {
    speed: number
    deg: number
  }
  name: string
  sys: {
    country: string
  }
}

interface ForecastData {
  list: Array<{
    dt: number
    main: {
      temp: number
      feels_like: number
      humidity: number
      pressure: number
    }
    weather: Array<{
      id: number
      main: string
      description: string
      icon: string
    }>
    wind: {
      speed: number
      deg: number
    }
    dt_txt: string
  }>
  city: {
    name: string
    country: string
  }
}

interface Alert {
  sender_name: string
  event: string
  start: number
  end: number
  description: string
  tags: string[]
}

interface OneCallData {
  lat: number
  lon: number
  timezone: string
  timezone_offset: number
  current: {
    dt: number
    sunrise: number
    sunset: number
    temp: number
    feels_like: number
    pressure: number
    humidity: number
    dew_point: number
    uvi: number
    clouds: number
    visibility: number
    wind_speed: number
    wind_deg: number
    weather: Array<{
      id: number
      main: string
      description: string
      icon: string
    }>
  }
  alerts?: Alert[]
}

function LocationMarker({
  selectedLocation,
  onLocationSelect,
}: {
  selectedLocation: Location | null
  onLocationSelect: (location: Location) => void
}) {
  interface LocationMarkerProps {
    selectedLocation: Location | null
    onLocationSelect: (location: Location) => void
  }

  const map = useMapEvents({
    click: async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      onLocationSelect({ lat, lng })
    },
  })

  return null
}

// Component to fly to a location
function FlyToLocation({ location }: { location: Location }) {
  const map = useMap()

  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], 10)
    }
  }, [location, map])

  return null
}

export default function WeatherMap() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [searchedLocation, setSearchedLocation] = useState<Location | null>(null)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [forecastData, setForecastData] = useState<ForecastData | null>(null)
  const [alertsData, setAlertsData] = useState<Alert[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("current")

  const mapRef = useRef<L.Map | null>(null)
  const currentLocationRef = useRef<Location | null>(null)
  const dataFetchedRef = useRef<boolean>(false)
  const locationKeyRef = useRef<string | null>(null)

  // Default center on world view
  const defaultCenter: [number, number] = [20.0, 0.0]
  const defaultZoom = 2

  // Keep track of current location in ref to avoid stale closures
  useEffect(() => {
    currentLocationRef.current = selectedLocation
  }, [selectedLocation])

  // Fetch weather data when location changes
  useEffect(() => {
    if (selectedLocation) {
      // Generate a unique key for this location
      const locationKey = `${selectedLocation.lat.toFixed(4)},${selectedLocation.lng.toFixed(4)}`

      // Only fetch if this is a new location
      if (locationKey !== locationKeyRef.current) {
        locationKeyRef.current = locationKey
        dataFetchedRef.current = false
      }

      // Fetch data only if not already fetched for this location
      if (!dataFetchedRef.current) {
        fetchWeatherData(selectedLocation)
        dataFetchedRef.current = true
      }
    }
  }, [selectedLocation])

  const fetchWeatherData = async (location: Location) => {
    // Don't fetch if already loading
    if (loading) return

    setLoading(true)
    setError(null)

    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

      // Fetch current weather
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lng}&appid=${apiKey}&units=metric&lang=en`,
      )

      if (!currentResponse.ok) {
        throw new Error("Failed to fetch weather data")
      }

      const currentData = await currentResponse.json()
      setWeatherData(currentData)

      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lng}&appid=${apiKey}&units=metric&lang=en`,
      )

      if (!forecastResponse.ok) {
        throw new Error("Failed to fetch forecast data")
      }

      const forecastData = await forecastResponse.json()
      setForecastData(forecastData)

      // Fetch alerts using OneCall API
      const oneCallResponse = await fetch(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${location.lat}&lon=${location.lng}&exclude=minutely,hourly,daily&appid=${apiKey}&units=metric&lang=en`,
      )

      if (oneCallResponse.ok) {
        const oneCallData: OneCallData = await oneCallResponse.json()
        setAlertsData(oneCallData.alerts || null)
      } else {
        console.warn("Could not fetch alerts data")
        setAlertsData(null)
      }

      setLastUpdated(Date.now())

      // Update location name from API response
      setSelectedLocation((prevLocation) => {
        if (prevLocation && prevLocation.lat === location.lat && prevLocation.lng === location.lng) {
          return {
            ...prevLocation,
            name: currentData.name,
          }
        }
        return prevLocation
      })
    } catch (err) {
      console.error("Error fetching weather data:", err)
      setError("Failed to fetch weather data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleLocationSelect = useCallback((location: Location) => {
    setSelectedLocation(location)
  }, [])

  const handleSearch = async (query: string) => {
    setIsSearching(true)
    setSearchError(null)

    try {
      // Using OpenStreetMap Nominatim for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
      )

      if (!response.ok) {
        throw new Error("Failed to get search results")
      }

      const data = await response.json()

      if (data.length === 0) {
        setSearchError("Location not found. Please try another search.")
        return
      }

      const result = data[0]
      const newLocation = {
        lat: Number.parseFloat(result.lat),
        lng: Number.parseFloat(result.lon),
        name: result.display_name.split(",")[0],
      }

      setSearchedLocation(newLocation)
      setSelectedLocation(newLocation)
    } catch (err) {
      console.error("Error searching location:", err)
      setSearchError("Location search failed. Please try again later.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleRefresh = useCallback(() => {
    if (currentLocationRef.current) {
      dataFetchedRef.current = false // Reset the flag to allow a new fetch
      fetchWeatherData(currentLocationRef.current)
    }
  }, [])

  // Determine if there are active alerts
  const hasAlerts = alertsData && alertsData.length > 0

  return (
    <div className="h-full w-full flex flex-col bg-white">
      <div className="p-4 bg-white border-b">
        <SearchBox onSearch={handleSearch} isSearching={isSearching} />
        {searchError && <div className="text-red-500 mb-4">{searchError}</div>}
      </div>

      <div className="flex-grow flex flex-col md:flex-row">
        <div className="h-[50vh] md:h-full md:w-1/2 relative">
          <MapContainer
            center={defaultCenter}
            zoom={defaultZoom}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker selectedLocation={selectedLocation} onLocationSelect={handleLocationSelect} />
            {selectedLocation && (
              <>
                <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
                  <Popup>
                    {selectedLocation.name || "Selected Location"}
                    <br />
                    Coordinates: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                    {hasAlerts && (
                      <div className="mt-2 text-red-500 font-bold">⚠️ Weather alerts active in this area</div>
                    )}
                  </Popup>
                </Marker>
                {hasAlerts && (
                  <Circle
                    center={[selectedLocation.lat, selectedLocation.lng]}
                    radius={50000}
                    pathOptions={{ color: "red", fillColor: "red", fillOpacity: 0.1 }}
                  />
                )}
              </>
            )}
            {searchedLocation && <FlyToLocation location={searchedLocation} />}
          </MapContainer>
        </div>

        <div className="md:w-1/2 p-4 bg-white overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 p-4">{error}</div>
          ) : weatherData && forecastData ? (
            <>
              {hasAlerts && (
                <div className="mb-4">
                  <WeatherAlerts alerts={alertsData} />
                </div>
              )}

              <Tabs defaultValue="current" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="current">Current</TabsTrigger>
                  <TabsTrigger value="forecast">5-Day Forecast</TabsTrigger>
                  <TabsTrigger value="charts">Charts</TabsTrigger>
                  <TabsTrigger value="alerts" disabled={!hasAlerts}>
                    Alerts {hasAlerts && <span className="ml-1 text-red-500">•</span>}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="current" className="mt-4">
                  <WeatherInfo weatherData={weatherData} />
                </TabsContent>
                <TabsContent value="forecast" className="mt-4">
                  <WeatherForecast forecastData={forecastData} />
                </TabsContent>
                <TabsContent value="charts" className="mt-4">
                  <WeatherCharts forecastData={forecastData} />
                </TabsContent>
                <TabsContent value="alerts" className="mt-4">
                  {hasAlerts ? (
                    <WeatherAlerts alerts={alertsData} detailed />
                  ) : (
                    <div className="text-center p-4 text-gray-500">No weather alerts for this location.</div>
                  )}
                </TabsContent>
              </Tabs>
              <CountdownTimer onRefresh={handleRefresh} interval={AUTO_REFRESH_INTERVAL} lastUpdated={lastUpdated} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p className="text-center mb-4">
                Select a location on the map or search for a place to view weather information.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
