import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Award, Gift, Star } from "lucide-react"
import type { Reward } from "@/app/page"

interface RewardsProps {
  earnedPoints: number
  rewards: Reward[]
}

export function Rewards({ earnedPoints, rewards }: RewardsProps) {
  const nextTier = 100
  const progress = (earnedPoints / nextTier) * 100

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center py-4">
        <div className="bg-primary/10 p-3 rounded-full mr-3">
          <Award className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold">Rewards</h2>
      </div>

      <Card className="border-none shadow-lg bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg">Your Points</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative">
              <div className="bg-primary/10 p-6 rounded-full mb-2">
                <Star className="h-10 w-10 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {earnedPoints}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Regular Rider</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Silver Tier</span>
              <span>
                {earnedPoints}/{nextTier} points
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Earned Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rewards.map((reward, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Gift className="h-4 w-4 text-primary" />
                  </div>
                  <span>{reward.name}</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-3 w-3 text-primary mr-1" />
                  <span className="font-medium">{reward.points}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
