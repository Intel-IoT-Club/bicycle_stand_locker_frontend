"use client"

import { useEffect, useState } from "react"
import type { Bicycle } from "../App"
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { MapPin, Timer, AlertTriangle } from "lucide-react"

interface ActiveRideProps {
  bicycle: Bicycle | null
  boardingPoint: string
  droppingPoint: string
  rideStartTime: Date | null
  endRide: () => void
  isReclaimInitiated: boolean
}

export function ActiveRide({
  bicycle,
  boardingPoint,
  droppingPoint,
  rideStartTime,
  endRide,
  isReclaimInitiated,
}: ActiveRideProps) {
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    if (!rideStartTime) return

    const interval = setInterval(() => {
      const now = new Date()
      const elapsed = Math.floor((now.getTime() - rideStartTime.getTime()) / 1000)
      setElapsedTime(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [rideStartTime])

  if (!bicycle || !rideStartTime) {
    return (
      <div className="text-center py-12">
        <p>No active ride. Please select a bicycle first.</p>
      </div>
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg bg-card/50">
        <CardHeader>
          <CardTitle className="text-xl">Active Ride</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-primary/10 p-4 rounded-lg flex items-center justify-center space-x-3">
            <Timer className="h-6 w-6 text-primary" />
            <span className="text-2xl font-mono font-bold">{formatTime(elapsedTime)}</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">From</p>
                <p className="font-medium">{boardingPoint}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">To</p>
                <p className="font-medium">{droppingPoint}</p>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bicycle ID</span>
              <span className="font-medium">{bicycle.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Model</span>
              <span className="font-medium">{bicycle.model}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={endRide} variant="destructive" className="w-full">
            End Ride
          </Button>
        </CardFooter>
      </Card>

      {isReclaimInitiated && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Owner Reclaim Initiated</AlertTitle>
          <AlertDescription>
            The owner has requested to reclaim this bicycle. Please end your ride at the earliest convenience.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
