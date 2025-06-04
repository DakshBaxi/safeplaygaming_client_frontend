"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Users, Shield, Copy, Crown, User } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { KYCGuard } from "@/components/kyc-guard"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/components/auth-provider"

export default function TeamDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [team, setTeam] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const {userProfile,loading:authLoading,refetchUser} =useAuth()
  const [teamDeleted, setTeamDeleted] = useState(false)
  
  useEffect(() => {
     if (authLoading || !userProfile||teamDeleted) return
    const fetchTeam = async () => {
      try {
        const response = await apiClient.get(`/api/player/team/${params.teamId}`)
        setTeam(response.data)
      } catch (error) {
        console.error("Failed to fetch team:", error)
        toast({
          title: "Error",
          description: "Failed to load team details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchTeam()
  }, [params.teamId, toast,authLoading,userProfile])

  const handleRemovePlayer = async (playerId: string) => {
  if (!window.confirm("Are you sure you want to remove this player?")) return;

  try {
    await apiClient.delete(`/api/player/team/${params.teamId}/remove/${playerId}`)
    toast({
      title: "Player Removed",
      description: "The player has been successfully removed from the team.",
    })
    // Refresh team data
    setTeam((prev: any) => ({
      ...prev,
      players: prev.players.filter((p: any) => p._id !== playerId),
    }))
  } catch (error) {
    console.error("Failed to remove player:", error)
    toast({
      title: "Error",
      description: "Failed to remove player. Please try again.",
      variant: "destructive",
    })
  }
}

  const handleDeleteTeam = async () => {
    if (!window.confirm("Are you absolutely sure you want to delete this team? This cannot be undone.")) return
    try {
      await apiClient.delete(`/api/player/team/${params.teamId}`)
      await refetchUser();  
      setTeamDeleted(true) // ✅ prevent refetch
      toast({
        title: "Team Deleted",
        description: "Your team has been deleted.",
      })
      
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not delete team. Please try again.",
        variant: "destructive",
      })
    }
  }


  const copyInviteCode = async () => {
    if (!team?.inviteCode) return

    try {
      await navigator.clipboard.writeText(team.inviteCode)
      setCopied(true)
      toast({
        title: "Invite Code Copied!",
        description: "Share this code with players to invite them to your team.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the invite code manually.",
        variant: "destructive",
      })
    }
  }

  if (loading||authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium mb-2">Team Not Found</h3>
            <p className="text-muted-foreground mb-4">The team you're looking for doesn't exist.</p>
            <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <KYCGuard>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto p-4 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.back()} className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{team.teamName}</h1>
                <p className="text-muted-foreground">Team Management</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Team Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm text-muted-foreground">Game</Label>
                  <p className="font-medium">{team.game}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Players</Label>
                  <p className="font-medium">{team.players?.length || 0}/{ 
          team.game === "bgmi" || team.game === "freeFire" ? 4 : 5}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Average Trust Score</Label>
                  <p className="font-medium text-green-600">{team.averageTrustScore || 0}/100</p>
                </div>
              </CardContent>
            </Card>

            {team.isAdmin && team.inviteCode && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Invite Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex space-x-2">
                    <Input value={team.inviteCode} readOnly className="font-mono" />
                    <Button variant="outline" size="icon" onClick={copyInviteCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">Share this code to invite players</p>
                </CardContent>
              </Card>
            )}

         <Card>
  <CardHeader className="pb-3">
    <CardTitle className="text-lg">Team Status</CardTitle>
  </CardHeader>
  <CardContent className="space-y-3">
    <div className="flex items-center justify-between">
      
      {(() => {
        const playerCount = team.players?.length || 0;
        const requiredPlayers =
          team.game === "bgmi" || team.game === "freeFire" ? 4 : 5;

        return playerCount >= requiredPlayers ? (
          <Badge variant="default" className="text-xs bg-green-600">
            Ready
          </Badge>
        ) : (
        <div className="flex flex-col gap-2">
            <Badge variant="outline" className="text-sm text-red-500 p-0 border-none">   
            Not Ready
          </Badge>
          <p className="text-sm text-muted-foreground"> {` Atleast ${requiredPlayers} players required for ${team.game} `} </p>
        </div>
        );
      })()}
    </div>
  </CardContent>
</Card>

          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Team Members</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
           {team.players?.map((player: any) => (
  <div
    key={player._id}
    className="flex items-center justify-between p-4 border rounded-lg"
  >
    <div className="flex items-center space-x-4">
      <div className="p-2 bg-primary/10 rounded-full">
        {player.role === "captain" ? (
          <Crown className="h-5 w-5 text-primary" />
        ) : (
          <User className="h-5 w-5 text-primary" />
        )}
      </div>
      <div>
        <div className="flex items-center space-x-2">
          <h4 className="font-medium">{player.gamerTag}</h4>
          {player.isCurrentUser && (
            <Badge variant="outline" className="text-xs">
              You
            </Badge>
          )}
          {player.role === "captain" && (
            <Badge variant="default" className="text-xs">
              Captain
            </Badge>
          )}
        </div>
      </div>
    </div>

    <div className="flex items-center space-x-3">
      <div className="text-right">
        <div className="text-sm font-medium text-green-600">
          {player.trustScore}
        </div>
        <div className="text-xs text-muted-foreground">Trust Score</div>
      </div>

      {/* Show remove button only for captain and not for self */}
      {team.isAdmin && !player.isCurrentUser && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleRemovePlayer(player._id)}
        >
          Remove
        </Button>
      )}
    </div>
  </div>
))}

              </div>

              {((team.game === "bgmi" || team.game === "freeFire") && (4 - (team.players?.length || 0)) > 0) || 
 ((team.game === "valorant" || team.game === "counterStrike2") && (5 - (team.players?.length || 0)) > 0) ? (
  <div className="mt-6 p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
    <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
    <p className="text-sm text-muted-foreground mb-2">
      {team.game === "bgmi" || team.game === "freeFire"
        ? 4 - (team.players?.length || 0)
        : 5 - (team.players?.length || 0)}{" "}
      more player
      {(team.game === "bgmi" || team.game === "freeFire"
        ? 4 - (team.players?.length || 0)
        : 5 - (team.players?.length || 0)) !== 1
        ? "s"
        : ""}{" "}
      needed
    </p>
    {team.isAdmin && team.inviteCode && (
      <p className="text-xs text-muted-foreground">
        Share your invite code: <span className="font-mono bg-muted px-1 rounded">{team.inviteCode}</span>
      </p>
    )}
  </div>
) : null}


            </CardContent>
          </Card>
            {/* Danger Zone - Delete Team */}
          {team.isAdmin && (
            <Card className="mt-6 border-red-500 border-2">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">Deleting this team is permanent. All players will be removed.</p>
                <Button variant="destructive" onClick={handleDeleteTeam}>
                  Delete Team
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </KYCGuard>
  )
}
