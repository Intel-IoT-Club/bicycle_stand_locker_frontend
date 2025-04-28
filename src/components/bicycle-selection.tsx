"use client"

import type { Bicycle } from "../App"
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Bike, Wallet } from "lucide-react"

interface BicycleSelectionProps {
  bicycles: Bicycle[]
  selectBicycle: (bicycle: Bicycle) => void
  selectedBicycle: Bicycle | null
  walletBalance: number
  startRide: () => void
}

export function BicycleSelection({
  bicycles,
  selectBicycle,
  selectedBicycle,
  walletBalance,
  startRide,
}: BicycleSelectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Available Bicycles</h2>
        <div className="space-y-4">
          {bicycles.map((bicycle) => (
            <Card
              key={bicycle.id}
              className={`cursor-pointer transition-all ${
                selectedBicycle?.id === bicycle.id ? "border-primary" : "border-border hover:border-primary/50"
              }`}
              onClick={() => selectBicycle(bicycle)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Bike className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{bicycle.model}</h3>
                    <p className="text-sm text-muted-foreground">ID: {bicycle.id}</p>
                  </div>
                </div>
                <Badge variant="outline">{bicycle.distance}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedBicycle && (
        <Card className="border-none shadow-lg bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Bicycle Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID</span>
              <span className="font-medium">{selectedBicycle.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Model</span>
              <span className="font-medium">{selectedBicycle.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Distance</span>
              <span className="font-medium">{selectedBicycle.distance}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center">
                <Wallet className="h-4 w-4 mr-2 text-primary" />
                <span className="text-muted-foreground">Wallet Balance</span>
              </div>
              <span className="font-medium">₹{walletBalance}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={startRide} className="w-full">
              Confirm Route & Pay
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
