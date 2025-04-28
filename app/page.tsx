"use client"

import { useState } from "react"
import { Home } from "@/components/home"
import { BicycleSelection } from "@/components/bicycle-selection"
import { ActiveRide } from "@/components/active-ride"
import { RideCompletion } from "@/components/ride-completion"
import { Wallet } from "@/components/wallet"
import { OwnerControls } from "@/components/owner-controls"
import { SmartAlerts } from "@/components/smart-alerts"
import { Rewards } from "@/components/rewards"
import { Navigation } from "@/components/navigation"
import { mockBicycles, mockAlerts, mockRewards } from "@/lib/mock-data"

export type Bicycle = {
  id: string
  model: string
  distance: string
}

export type Alert = string

export type Reward = {
  name: string
  points: number
}

export type AppScreen =
  | "home"
  | "bicycleSelection"
  | "activeRide"
  | "rideCompletion"
  | "wallet"
  | "ownerControls"
  | "smartAlerts"
  | "rewards"

export default function App() {
  // App state
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("home")
  const [walletBalance, setWalletBalance] = useState(120)
  const [selectedBicycle, setSelectedBicycle] = useState<Bicycle | null>(null)
  const [rideStartTime, setRideStartTime] = useState<Date | null>(null)
  const [rideDuration, setRideDuration] = useState(0)
  const [rideFare, setRideFare] = useState(0)
  const [boardingPoint, setBoardingPoint] = useState("")
  const [droppingPoint, setDroppingPoint] = useState("")
  const [isReclaimInitiated, setIsReclaimInitiated] = useState(false)
  const [earnedPoints, setEarnedPoints] = useState(45)
  const [availableBicycles, setAvailableBicycles] = useState<Bicycle[]>([])

  // Search bicycles
  const searchBicycles = () => {
    if (boardingPoint && droppingPoint) {
      setAvailableBicycles(mockBicycles)
      setCurrentScreen("bicycleSelection")
    }
  }

  // Select bicycle
  const selectBicycle = (bicycle: Bicycle) => {
    setSelectedBicycle(bicycle)
  }

  // Start ride
  const startRide = () => {
    setRideStartTime(new Date())
    setCurrentScreen("activeRide")
  }

  // End ride
  const endRide = () => {
    if (rideStartTime) {
      const endTime = new Date()
      const durationInMinutes = Math.floor((endTime.getTime() - rideStartTime.getTime()) / 60000)
      setRideDuration(durationInMinutes)

      // Calculate fare (₹10 per minute for this example)
      const fare = durationInMinutes * 10
      setRideFare(fare)

      // Deduct from wallet
      setWalletBalance((prev) => Math.max(0, prev - fare))

      // Add points (1 point per minute)
      setEarnedPoints((prev) => prev + durationInMinutes)

      setCurrentScreen("rideCompletion")
    }
  }

  // Recharge wallet (mock)
  const rechargeWallet = () => {
    setWalletBalance((prev) => prev + 100)
  }

  // Toggle reclaim
  const toggleReclaim = () => {
    setIsReclaimInitiated((prev) => !prev)
  }

  // Navigate to screen
  const navigateTo = (screen: AppScreen) => {
    setCurrentScreen(screen)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navigation currentScreen={currentScreen} navigateTo={navigateTo} walletBalance={walletBalance} />

      <main className="flex-1 container mx-auto p-4 max-w-md">
        {currentScreen === "home" && (
          <Home
            boardingPoint={boardingPoint}
            setBoardingPoint={setBoardingPoint}
            droppingPoint={droppingPoint}
            setDroppingPoint={setDroppingPoint}
            searchBicycles={searchBicycles}
          />
        )}

        {currentScreen === "bicycleSelection" && (
          <BicycleSelection
            bicycles={availableBicycles}
            selectBicycle={selectBicycle}
            selectedBicycle={selectedBicycle}
            walletBalance={walletBalance}
            startRide={startRide}
          />
        )}

        {currentScreen === "activeRide" && (
          <ActiveRide
            bicycle={selectedBicycle}
            boardingPoint={boardingPoint}
            droppingPoint={droppingPoint}
            rideStartTime={rideStartTime}
            endRide={endRide}
            isReclaimInitiated={isReclaimInitiated}
          />
        )}

        {currentScreen === "rideCompletion" && (
          <RideCompletion
            rideDuration={rideDuration}
            rideFare={rideFare}
            walletBalance={walletBalance}
            navigateHome={() => navigateTo("home")}
          />
        )}

        {currentScreen === "wallet" && <Wallet balance={walletBalance} rechargeWallet={rechargeWallet} />}

        {currentScreen === "ownerControls" && (
          <OwnerControls isReclaimInitiated={isReclaimInitiated} toggleReclaim={toggleReclaim} />
        )}

        {currentScreen === "smartAlerts" && <SmartAlerts alerts={mockAlerts} />}

        {currentScreen === "rewards" && <Rewards earnedPoints={earnedPoints} rewards={mockRewards} />}
      </main>
    </div>
  )
}
