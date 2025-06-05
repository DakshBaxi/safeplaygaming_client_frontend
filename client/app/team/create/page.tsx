"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Users, Plus, X, ArrowLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/components/auth-provider"

export default function CreateTeamPage() {
  const { userProfile, loading: authLoading ,refetchUser} = useAuth()

  const [teamData, setTeamData] = useState({
    name: "",
    game: "bgmi",
  })

  const [players, setPlayers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Initialize players array with creator's gamerTag
  useEffect(() => {
    console.log('userProfile:', userProfile)
    console.log('userProfile.gamerTag:', userProfile?.gamerTag)
    console.log('current players:', players)
    
    if (userProfile?.gamerTag) {
      setPlayers([userProfile.gamerTag])
    }
    setIsLoading(false)
  }, [userProfile?.gamerTag])

  const getMaxPlayers = () => {
    const game = teamData.game.toLowerCase()
    if (game === "bgmi" || game === "freeFire") return 4
    if (game === "valorant" || game === "counterStrike2") return 5
    return 5
  }

  const addPlayer = () => {
    const maxPlayers = getMaxPlayers()
    if (players.length < maxPlayers) {
      setPlayers([...players, ""])
    }
  }

  const removePlayer = (index: number) => {
    if (index === 0) return // Prevent removing the team creator
    setPlayers(players.filter((_, i) => i !== index))
  }

  const updatePlayer = (index: number, value: string) => {
    if (index === 0) return // Prevent updating the team creator
    const newPlayers = [...players]
    newPlayers[index] = value
    setPlayers(newPlayers)
  }

  const handleSubmit = async () => {
    // Get all filled players including the creator
    const filledPlayers = players.filter((p) => p && p.trim())
    const maxPlayers = getMaxPlayers()

    if (!teamData.name) {
      toast({
        title: "Team Name Required",
        description: "Please enter a team name.",
        variant: "destructive",
      })
      return
    }

    if (filledPlayers.length > maxPlayers) {
      toast({
        title: "Too Many Players",
        description: `Maximum allowed players for ${teamData.game} is ${maxPlayers}.`,
        variant: "destructive",
      })
      return
    }

    if (filledPlayers.length === 0 || !userProfile?.gamerTag) {
      toast({
        title: "No Players",
        description: "At least the team creator must be included.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await apiClient.post("/api/player/createTeam", {
        teamName: teamData.name,
        game: teamData.game,
        players: filledPlayers,
      })
      
      // Auto-copy to clipboard
      try {
        await navigator.clipboard.writeText(response.data.inviteCode)
        toast({
          title: "Team Created!",
          description: `Your invite code: ${response.data.inviteCode} (copied to clipboard)`,
        })
      } catch (clipboardError) {
        // Fallback if clipboard fails
        toast({
          title: "Team Created!",
          description: `Your invite code: ${response.data.inviteCode}`,
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => copyToClipboard(response.data.inviteCode)}
            >
              Copy Code
            </Button>
          ),
        })
      }
       await refetchUser();
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Team creation error:", error)
        toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Helper function for manual copy
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: "Invite code copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please copy the code manually",
        variant: "destructive",
      })
    }
  }

  // Show loading state while auth is loading
  if (authLoading || isLoading || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-4 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <ThemeToggle />
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Create Your Team</CardTitle>
            <CardDescription>Build your squad and dominate the competition</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name *</Label>
                <Input
                  id="teamName"
                  type="text"
                  placeholder="Enter team name"
                  value={teamData.name}
                  onChange={(e) => setTeamData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="game">Game *</Label>
                <Select
                  value={teamData.game}
                  onValueChange={(value) => setTeamData((prev) => ({ ...prev, game: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a game" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bgmi">BGMI</SelectItem>
                    <SelectItem value="freeFire">Free Fire</SelectItem>
                    <SelectItem value="valorant">Valorant</SelectItem>
                    <SelectItem value="counterStrike2">CS2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>
                  Players ({players.filter((p) => p && p.trim()).length} / {getMaxPlayers()})
                </Label>
                {players.length < getMaxPlayers() && (
                  <Button type="button" variant="outline" size="sm" onClick={addPlayer}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Player
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {/* Team Creator (Player 1) - Always shown */}
                <div className="flex flex-col">
                  <Label className="text-sm text-muted-foreground mb-1">Team Creator (Player 1)</Label>
                  <Input
                    value={userProfile?.gamerTag || ""}
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                </div>

                {/* Additional Players */}
                {players.slice(1).map((player, index) => (
                  <div key={index + 1} className="flex items-center space-x-2">
                    <div className="flex-1">
                      <Label className="text-sm text-muted-foreground">Player {index + 2}</Label>
                      <Input
                        placeholder={`Enter Player ${index + 2} GamerTag`}
                        value={player}
                        onChange={(e) => updatePlayer(index + 1, e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removePlayer(index + 1)}
                      className="mt-5"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Team Notes:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Only team name is required</li>
                <li>• You (Player 1) are automatically the team creator</li>
                <li>• Additional players are optional (max {getMaxPlayers()} total)</li>
                <li>• You will get an invite code after creation</li>
                <li>• As captain, you can invite others using that code</li>
              </ul>
            </div>

            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={
                !teamData.name ||
                players.filter((p) => p && p.trim()).length > getMaxPlayers() ||
                loading
              }
            >
              {loading ? "Creating Team..." : "Create Team"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}