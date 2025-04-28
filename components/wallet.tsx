"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, CreditCard, WalletIcon } from "lucide-react"

interface WalletProps {
  balance: number
  rechargeWallet: () => void
}

export function Wallet({ balance, rechargeWallet }: WalletProps) {
  const isLowBalance = balance < 50

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg bg-card/50">
        <CardHeader>
          <CardTitle className="text-xl">Wallet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-primary/10 p-6 rounded-lg flex flex-col items-center justify-center">
            <WalletIcon className="h-8 w-8 text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Current Balance</p>
            <p className="text-3xl font-bold">₹{balance}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Quick Recharge</h3>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={rechargeWallet}>
                ₹100
              </Button>
              <Button variant="outline" onClick={rechargeWallet}>
                ₹200
              </Button>
              <Button variant="outline" onClick={rechargeWallet}>
                ₹500
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={rechargeWallet}>
            <CreditCard className="h-4 w-4 mr-2" />
            Recharge Wallet
          </Button>
        </CardFooter>
      </Card>

      {isLowBalance && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Low Balance</AlertTitle>
          <AlertDescription>
            Your wallet balance is below ₹50. Please recharge to continue enjoying our services.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <p>No recent transactions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
