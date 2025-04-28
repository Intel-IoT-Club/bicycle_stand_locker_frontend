"use client"

import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { MapPin, Search } from "lucide-react"

interface HomeProps {
  boardingPoint: string
  setBoardingPoint: (value: string) => void
  droppingPoint: string
  setDroppingPoint: (value: string) => void
  searchBicycles: () => void
}

export function Home({ boardingPoint, setBoardingPoint, droppingPoint, setDroppingPoint, searchBicycles }: HomeProps) {
  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg bg-card/50">
        <CardHeader>
          <CardTitle className="text-xl">Find a Bicycle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Boarding Point</span>
            </div>
            <Input
              placeholder="Enter boarding location"
              value={boardingPoint}
              onChange={(e) => setBoardingPoint(e.target.value)}
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium">Dropping Point</span>
            </div>
            <Input
              placeholder="Enter destination"
              value={droppingPoint}
              onChange={(e) => setDroppingPoint(e.target.value)}
              className="bg-background/50"
            />
          </div>

          <Button onClick={searchBicycles} disabled={!boardingPoint || !droppingPoint} className="w-full">
            <Search className="h-4 w-4 mr-2" />
            Search Bicycles
          </Button>
        </CardContent>
      </Card>

      <div className="text-center space-y-2">
        <h2 className="text-lg font-medium">Welcome to Bicycle Rental</h2>
        <p className="text-sm text-muted-foreground">Rent a bicycle for your journey and enjoy a sustainable ride</p>
      </div>
    </div>
  )
}
