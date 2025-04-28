"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Timer, Wallet } from "lucide-react"

interface RideCompletionProps {
  rideDuration: number
  rideFare: number
  walletBalance: number
  navigateHome: () => void
}

export function RideCompletion({ rideDuration, rideFare, walletBalance, navigateHome }: RideCompletionProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-6">
        <div className="bg-green-500/20 p-4 rounded-full mb-4">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold">Ride Completed</h2>
        <p className="text-muted-foreground">Thank you for riding with us!</p>
      </div>

      <Card className="border-none shadow-lg bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg">Ride Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Timer className="h-4 w-4 mr-2 text-primary" />
              <span className="text-muted-foreground">Duration</span>
            </div>
            <span className="font-medium">{rideDuration} minutes</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Fare</span>
            <span className="font-medium">₹{rideFare}</span>
          </div>

          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Wallet className="h-4 w-4 mr-2 text-primary" />
                <span className="text-muted-foreground">Wallet Balance</span>
              </div>
              <span className="font-medium">₹{walletBalance}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={navigateHome} className="w-full">
            Back to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
