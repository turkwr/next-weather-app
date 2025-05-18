import WeatherMap from "@/components/weather-map"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Weather Map - Real-time Weather Information",
  description: "View weather information, forecasts, and alerts for locations around the world",
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-7xl h-[80vh] rounded-lg overflow-hidden shadow-lg border">
        <WeatherMap />
      </div>
    </main>
  )
}
