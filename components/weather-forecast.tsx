"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Droplets, Thermometer, Wind } from "lucide-react"

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

export default function WeatherForecast({ forecastData }: { forecastData: ForecastData }) {
  const getWeatherIconUrl = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
  }

  const getWindDirection = (deg: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    return directions[Math.round(deg / 45) % 8]
  }

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Group forecast by day
  const groupedForecast = forecastData.list.reduce(
    (acc, item) => {
      const date = new Date(item.dt * 1000).toLocaleDateString("en-US")
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(item)
      return acc
    },
    {} as Record<string, typeof forecastData.list>,
  )

  // Get daily forecasts (noon time or closest to it)
  const dailyForecasts = Object.entries(groupedForecast)
    .map(([date, items]) => {
      // Try to get forecast for noon (12:00)
      const noonForecast = items.find((item) => {
        const forecastHour = new Date(item.dt * 1000).getHours()
        return forecastHour >= 11 && forecastHour <= 13
      })

      // If no noon forecast, get the middle item
      return noonForecast || items[Math.floor(items.length / 2)]
    })
    .slice(0, 5) // Limit to 5 days

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">5-Day Forecast for {forecastData.city.name}</h2>

      <div className="grid grid-cols-1 gap-4">
        {dailyForecasts.map((forecast) => (
          <Card key={forecast.dt} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center p-4">
                <div className="flex-1">
                  <div className="font-bold">{formatDate(forecast.dt)}</div>
                  <div className="text-sm text-gray-500">{formatTime(forecast.dt)}</div>
                </div>

                <div className="flex items-center">
                  <img
                    src={getWeatherIconUrl(forecast.weather[0].icon) || "/placeholder.svg"}
                    alt={forecast.weather[0].description}
                    width={50}
                    height={50}
                  />
                  <div className="text-2xl font-bold ml-2">{Math.round(forecast.main.temp)}°C</div>
                </div>
              </div>

              <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                <div className="text-sm">{capitalizeFirstLetter(forecast.weather[0].description)}</div>

                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="flex items-center text-sm">
                    <Thermometer className="h-3 w-3 mr-1 text-blue-500" />
                    <span>Feels: {Math.round(forecast.main.feels_like)}°C</span>
                  </div>

                  <div className="flex items-center text-sm">
                    <Wind className="h-3 w-3 mr-1 text-blue-500" />
                    <span>
                      {Math.round(forecast.wind.speed * 3.6)} km/h {getWindDirection(forecast.wind.deg)}
                    </span>
                  </div>

                  <div className="flex items-center text-sm">
                    <Droplets className="h-3 w-3 mr-1 text-blue-500" />
                    <span>{forecast.main.humidity}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
