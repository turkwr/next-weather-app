"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets, Thermometer, Wind, Gauge } from "lucide-react"

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

export default function WeatherInfo({ weatherData }: { weatherData: WeatherData }) {
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

  const formatDate = () => {
    const now = new Date()
    return now.toLocaleString("en-US", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex justify-between items-center">
            <span>
              {weatherData.name}, {weatherData.sys.country}
            </span>
            {weatherData.weather[0].icon && (
              <img
                src={getWeatherIconUrl(weatherData.weather[0].icon) || "/placeholder.svg"}
                alt={weatherData.weather[0].description}
                width={50}
                height={50}
                className="inline-block"
              />
            )}
          </CardTitle>
          <div className="text-xs text-gray-500">{formatDate()}</div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2">{Math.round(weatherData.main.temp)}°C</div>
          <div className="text-gray-500 mb-4">{capitalizeFirstLetter(weatherData.weather[0].description)}</div>
          <div className="text-sm text-gray-500">Feels like: {Math.round(weatherData.main.feels_like)}°C</div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Humidity</span>
            </div>
            <div className="mt-2 text-2xl font-semibold">{weatherData.main.humidity}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Wind</span>
            </div>
            <div className="mt-2 text-2xl font-semibold">{Math.round(weatherData.wind.speed * 3.6)} km/h</div>
            <div className="text-xs text-gray-500">Direction: {getWindDirection(weatherData.wind.deg)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Feels Like</span>
            </div>
            <div className="mt-2 text-2xl font-semibold">{Math.round(weatherData.main.feels_like)}°C</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Pressure</span>
            </div>
            <div className="mt-2 text-2xl font-semibold">{weatherData.main.pressure} hPa</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
