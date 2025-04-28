import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { AlertTriangle, Battery, Bell, Clock } from "lucide-react"

interface SmartAlertsProps {
  alerts: string[]
}

export function SmartAlerts({ alerts }: SmartAlertsProps) {
  const getAlertIcon = (alert: string) => {
    if (alert.includes("Battery")) return <Battery className="h-4 w-4" />
    if (alert.includes("Maintenance")) return <AlertTriangle className="h-4 w-4" />
    if (alert.includes("Overextended")) return <Clock className="h-4 w-4" />
    return <Bell className="h-4 w-4" />
  }

  const getAlertVariant = (alert: string) => {
    if (alert.includes("Battery")) return "warning"
    if (alert.includes("Maintenance")) return "destructive"
    return "default"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center py-4">
        <div className="bg-primary/10 p-3 rounded-full mr-3">
          <Bell className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold">Smart Alerts</h2>
      </div>

      <Card className="border-none shadow-lg bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg">Active Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {alerts.length > 0 ? (
            alerts.map((alert, index) => (
              <Alert key={index} variant={getAlertVariant(alert) as any}>
                {getAlertIcon(alert)}
                <AlertTitle>{alert.split(":")[0]}</AlertTitle>
                <AlertDescription>{alert.includes(":") ? alert.split(":")[1] : alert}</AlertDescription>
              </Alert>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>No active alerts</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
