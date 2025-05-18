"use client"

import { useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CountdownTimerProps {
  onRefresh: () => void
  interval: number // in milliseconds
  lastUpdated: number | null
}

export default function CountdownTimer({ onRefresh, interval, lastUpdated }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(interval)
  const [isActive, setIsActive] = useState<boolean>(!!lastUpdated)

  useEffect(() => {
    if (lastUpdated) {
      const elapsed = Date.now() - lastUpdated
      const remaining = Math.max(0, interval - elapsed)
      setTimeLeft(remaining)
      setIsActive(true)
    } else {
      setIsActive(false)
    }
  }, [lastUpdated, interval])

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1000
          if (newTime <= 0) {
            onRefresh()
            return interval
          }
          return newTime
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isActive, timeLeft, onRefresh, interval])

  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60)
    const minutes = Math.floor((ms / 1000 / 60) % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const progress = ((interval - timeLeft) / interval) * 100

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 mt-4">
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span>Auto-refresh</span>
          {isActive && <span>{formatTime(timeLeft)}</span>}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onRefresh} className="flex items-center gap-1">
        <RefreshCw className="h-3 w-3" />
        <span className="sr-only md:not-sr-only">Refresh</span>
      </Button>
    </div>
  )
}
