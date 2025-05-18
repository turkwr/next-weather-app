"use client"

import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Dynamically import the chart component with no SSR
const ChartComponent = dynamic(() => import("./chart-component"), { ssr: false })

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

export default function WeatherCharts({ forecastData }: { forecastData: ForecastData }) {
  // Format data for charts
  const formatChartData = () => {
    return forecastData.list.map((item) => {
      const date = new Date(item.dt * 1000)
      return {
        time: date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
        }),
        temperature: Math.round(item.main.temp),
        feelsLike: Math.round(item.main.feels_like),
        humidity: item.main.humidity,
        pressure: item.main.pressure,
        windSpeed: Math.round(item.wind.speed * 3.6), // Convert to km/h
      }
    })
  }

  const chartData = formatChartData()

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Weather Charts for {forecastData.city.name}</h2>

      <Tabs defaultValue="temperature" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="temperature">Temperature</TabsTrigger>
          <TabsTrigger value="humidity">Humidity</TabsTrigger>
          <TabsTrigger value="wind">Wind</TabsTrigger>
        </TabsList>

        <TabsContent value="temperature" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Temperature Forecast (°C)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ChartComponent
                  data={chartData}
                  type="temperature"
                  lines={[
                    { key: "temperature", name: "Temperature", color: "#f97316" },
                    { key: "feelsLike", name: "Feels Like", color: "#3b82f6" },
                  ]}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="humidity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Humidity Forecast (%)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ChartComponent
                  data={chartData}
                  type="humidity"
                  lines={[{ key: "humidity", name: "Humidity", color: "#0ea5e9" }]}
                  yDomain={[0, 100]}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wind" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Wind Speed Forecast (km/h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ChartComponent
                  data={chartData}
                  type="wind"
                  lines={[{ key: "windSpeed", name: "Wind Speed", color: "#10b981" }]}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
