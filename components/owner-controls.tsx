import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Shield } from "lucide-react"

interface OwnerControlsProps {
  isReclaimInitiated: boolean
  toggleReclaim: () => void
}

export function OwnerControls({ isReclaimInitiated, toggleReclaim }: OwnerControlsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center py-4">
        <div className="bg-primary/10 p-3 rounded-full mr-3">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold">Owner Controls</h2>
      </div>

      <Card className="border-none shadow-lg bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg">Bicycle Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reclaim-bicycle">Reclaim Bicycle</Label>
              <p className="text-sm text-muted-foreground">Request the current renter to end their ride</p>
            </div>
            <Switch id="reclaim-bicycle" checked={isReclaimInitiated} onCheckedChange={toggleReclaim} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">Mark bicycle as unavailable for maintenance</p>
            </div>
            <Switch id="maintenance-mode" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="location-tracking">Location Tracking</Label>
              <p className="text-sm text-muted-foreground">Enable real-time location tracking</p>
            </div>
            <Switch id="location-tracking" defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bicycle Fleet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 border rounded-lg flex justify-between items-center">
              <div>
                <p className="font-medium">Bicycle #123</p>
                <p className="text-sm text-muted-foreground">Hero Electric Bicycle</p>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-500">
                Available
              </Badge>
            </div>

            <div className="p-3 border rounded-lg flex justify-between items-center">
              <div>
                <p className="font-medium">Bicycle #456</p>
                <p className="text-sm text-muted-foreground">Yulu Miracle Bicycle</p>
              </div>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
                In Use
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
