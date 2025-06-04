"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Users, ArrowLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/components/auth-provider"

export default function JoinTeamPage() {
  const [inviteCode, setInviteCode] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const {refetchUser} = useAuth();

  const handleSubmit = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: "Invite Code Required",
        description: "Please enter a valid invite code.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await apiClient.post("/api/player/joinTeam", {
        inviteCode: inviteCode.trim()
      })
      await refetchUser();
      // Success response
      toast({
        title: "Team Joined Successfully!",
        description: `You've successfully joined ${response.data.team.teamName}`,
      })
      
      router.push("/dashboard")
      
    } catch (error: any) {
      console.error("Join team error:", error)
      
      // Handle different error cases
      const errorMessage = error.response?.data?.error || "Failed to join team"
      
      toast({
        title: "Join Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute top-4 left-4">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
      </div>

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Users className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Join a Team</CardTitle>
          <CardDescription>Enter the invite code shared by your team captain</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="inviteCode">Team Invite Code *</Label>
            <Input
              id="inviteCode"
              type="text"
              placeholder="Enter invite code (e.g., TB2024XYZ)"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              className="text-center font-mono"
              disabled={loading}
            />
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">How to Join:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Get the invite code from your team captain</li>
              <li>• Your KYC must be approved to join</li>
              <li>• Make sure you're not already in a team for this game</li>
              <li>• Team must have available slots</li>
            </ul>
          </div>

          <Button 
            className="w-full" 
            onClick={handleSubmit} 
            disabled={!inviteCode.trim() || loading}
          >
            {loading ? "Joining Team..." : "Join Team"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}