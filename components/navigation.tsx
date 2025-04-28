"use client"

import type { AppScreen } from "@/app/page"
import { Home, Bike, Wallet, Shield, Bell, Award } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavigationProps {
  currentScreen: AppScreen
  navigateTo: (screen: AppScreen) => void
  walletBalance: number
}

export function Navigation({ currentScreen, navigateTo, walletBalance }: NavigationProps) {
  const isActive = (screen: AppScreen) => currentScreen === screen

  return (
    <header className="border-b border-border">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Bicycle Rental</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">₹{walletBalance}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateTo("wallet")}
            className={isActive("wallet") ? "bg-accent" : ""}
          >
            <Wallet className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <nav className="container mx-auto px-4 pb-2 overflow-x-auto flex gap-1 md:justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateTo("home")}
          className={isActive("home") ? "bg-accent" : ""}
        >
          <Home className="h-4 w-4 mr-2" />
          Home
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateTo("activeRide")}
          className={isActive("activeRide") ? "bg-accent" : ""}
          disabled={!["activeRide", "bicycleSelection"].includes(currentScreen)}
        >
          <Bike className="h-4 w-4 mr-2" />
          Ride
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateTo("ownerControls")}
          className={isActive("ownerControls") ? "bg-accent" : ""}
        >
          <Shield className="h-4 w-4 mr-2" />
          Owner
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateTo("smartAlerts")}
          className={isActive("smartAlerts") ? "bg-accent" : ""}
        >
          <Bell className="h-4 w-4 mr-2" />
          Alerts
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateTo("rewards")}
          className={isActive("rewards") ? "bg-accent" : ""}
        >
          <Award className="h-4 w-4 mr-2" />
          Rewards
        </Button>
      </nav>
    </header>
  )
}
