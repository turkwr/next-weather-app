"use client"

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Clock, Calendar } from "lucide-react"

interface AlertData {
  sender_name: string
  event: string
  start: number
  end: number
  description: string
  tags: string[]
}

interface WeatherAlertsProps {
  alerts: AlertData[] | null
  detailed?: boolean
}

export default function WeatherAlerts({ alerts, detailed = false }: WeatherAlertsProps) {
  if (!alerts || alerts.length === 0) {
    return null
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getAlertSeverity = (event: string): "default" | "destructive" => {
    const severeEvents = [
      "tornado",
      "hurricane",
      "flood",
      "tsunami",
      "earthquake",
      "severe",
      "extreme",
      "emergency",
      "warning",
    ]

    const eventLower = event.toLowerCase()
    return severeEvents.some((term) => eventLower.includes(term)) ? "destructive" : "default"
  }

  // For the summary view (non-detailed)
  if (!detailed) {
    return (
      <Alert variant="destructive" className="animate-pulse">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="font-bold">Weather Alert{alerts.length > 1 ? "s" : ""}</AlertTitle>
        <AlertDescription>
          {alerts.length === 1 ? alerts[0].event : `${alerts.length} active weather alerts for this location`}
        </AlertDescription>
      </Alert>
    )
  }

  // For the detailed view
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        Weather Alerts ({alerts.length})
      </h2>

      {alerts.map((alert, index) => (
        <Card key={index} className={getAlertSeverity(alert.event) === "destructive" ? "border-red-500" : ""}>
          <CardHeader className={getAlertSeverity(alert.event) === "destructive" ? "bg-red-50 dark:bg-red-900/20" : ""}>
            <CardTitle className="flex justify-between items-start">
              <span className={getAlertSeverity(alert.event) === "destructive" ? "text-red-600 dark:text-red-400" : ""}>
                {alert.event}
              </span>
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{alert.sender_name}</span>
            </CardTitle>
            <CardDescription className="flex flex-col gap-1 mt-2">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Valid from {formatDate(alert.start)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Until {formatDate(alert.end)}</span>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="whitespace-pre-line text-sm">{alert.description}</p>

            {alert.tags && alert.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {alert.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
