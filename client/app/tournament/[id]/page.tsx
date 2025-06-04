"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Calendar, Users, Star, Clock, MapPin, Shield } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { KYCGuard } from "@/components/kyc-guard"
import { apiClient } from "@/lib/api-client"
import { Team, Tournament } from "@/types"

export default function TournamentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [selectedTeam, setSelectedTeam] = useState("")
  const [applying, setApplying] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [tournament, setTournament] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userTeams, setUserTeams] = useState<Team[]>([])


  useEffect(() => {
  const dummyTournament: Tournament = {
  id: "1",
  title: "Valorant Masters Invitational",
  game: "Valorant",
  status: "open",
  description: "An elite-level competition for top-tier Valorant teams.",
  date: "2025-06-15",
  maxPlayers: 16,
  prizePool: "$10,000",
  trustScoreThreshold: 75,
  organizer: "Elite Esports Org",
  registrationDeadline: "2025-06-10",
  currentRegistrations: 8,
  location: "Online",
  rules: ["No cheating", "5 players per team", "Check-in 30 minutes before match"],
  schedule: [
    { stage: "Group Stage", date: "2025-06-16", teams: "16" },
    { stage: "Semi Finals", date: "2025-06-18", teams: "4" },
    { stage: "Finals", date: "2025-06-20", teams: "2" },
  ],
}

const dummyTeams: Team[] = [
  {
    id: "team-1",
    name: "Phantom Reapers",
    game: "Valorant",
    isEligible: true,
    averageTrustScore: 80,
    memberCount: 5,
  },
  {
    id: "team-2",
    name: "Spike Squad",
    game: "Valorant",
    isEligible: false,
    averageTrustScore: 60,
    memberCount: 4,
  },
  {
    id: "team-3",
    name: "Ghost Ops",
    game: "CS:GO",
    isEligible: true,
    averageTrustScore: 90,
    memberCount: 5,
  },
]


      setTournament(dummyTournament)
      setUserTeams(dummyTeams)
      setLoading(false)
}, [])

  useEffect(() => {
    const fetchTournamentData = async () => {
      try {
        const [tournamentResponse, teamsResponse] = await Promise.all([
          apiClient.get(`/api/tournaments/${params.id}`),
          apiClient.get("/api/teams/my-teams"),
        ])

        setTournament(tournamentResponse.data)
        setUserTeams(teamsResponse.data)
      } catch (error) {
        console.error("Failed to fetch tournament data:", error)
        toast({
          title: "Error",
          description: "Failed to load tournament details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTournamentData()
  }, [params.id, toast])

  const eligibleTeams = userTeams.filter(
    (team: any) =>
      team.game === tournament?.game &&
      team.isEligible &&
      team.averageTrustScore >= (tournament?.trustScoreThreshold || 0),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleApplyToTournament = async () => {
    if (!selectedTeam) return

    setApplying(true)
    try {
      await apiClient.post(`/api/tournaments/${tournament.id}/apply`, {
        teamId: selectedTeam,
      })

      setDialogOpen(false)
      toast({
        title: "Application Submitted!",
        description:
          "Your team has been registered for the tournament. You'll receive updates on your application status.",
      })
      router.push("/my-tournaments")
    } catch (error: any) {
      console.error("Tournament application error:", error)
      toast({
        title: "Application Failed",
        description: error.response?.data?.message || "Failed to apply to tournament",
        variant: "destructive",
      })
    } finally {
      setApplying(false)
    }
  }

  const selectedTeamData = eligibleTeams.find((team: any) => team.id === selectedTeam)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium mb-2">Tournament Not Found</h3>
            <p className="text-muted-foreground mb-4">The tournament you're looking for doesn't exist.</p>
            <Button onClick={() => router.push("/tournaments")}>Back to Tournaments</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <KYCGuard>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto p-4 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.back()} className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{tournament.title}</h1>
                <p className="text-muted-foreground">Tournament Details</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl mb-2">{tournament.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-sm">
                          {tournament.game}
                        </Badge>
                        <Badge className="bg-green-500 text-white text-sm">
                          {tournament.status === "open" ? "Registration Open" : "Registration Closed"}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{tournament.prizePool}</div>
                      <div className="text-sm text-muted-foreground">Prize Pool</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{tournament.description}</p>
                </CardContent>
              </Card>

              {tournament.rules && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tournament Rules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tournament.rules.map((rule: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {tournament.schedule && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tournament Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {tournament.schedule.map((stage: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{stage.stage}</h4>
                            <p className="text-sm text-muted-foreground">{formatDate(stage.date)}</p>
                          </div>
                          <Badge variant="outline">{stage.teams}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tournament Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{formatDate(tournament.date)}</p>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {tournament.currentRegistrations || 0}/{tournament.maxPlayers}
                      </p>
                      <p className="text-sm text-muted-foreground">Teams Registered</p>
                    </div>
                  </div>

                  {tournament.location && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{tournament.location}</p>
                        <p className="text-sm text-muted-foreground">Location</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Star className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{tournament.trustScoreThreshold}+</p>
                      <p className="text-sm text-muted-foreground">Min Trust Score</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{formatDate(tournament.registrationDeadline)}</p>
                      <p className="text-sm text-muted-foreground">Registration Deadline</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {tournament.organizer && (
                <Card>
                  <CardHeader>
                    <CardTitle>Organizer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{tournament.organizer}</p>
                        <p className="text-sm text-muted-foreground">Verified Organizer</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {eligibleTeams.length > 0 && tournament.status === "open" && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      Apply to Tournament
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Apply to Tournament</DialogTitle>
                      <DialogDescription>Select your team to apply for {tournament.title}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Select Team</label>
                        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a team to apply with" />
                          </SelectTrigger>
                          <SelectContent>
                            {eligibleTeams.map((team: any) => (
                              <SelectItem key={team.id} value={team.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{team.name}</span>
                                  <Badge variant="outline" className="ml-2">
                                    {team.memberCount} players
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedTeamData && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <h4 className="font-medium mb-2">{selectedTeamData.name}</h4>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>Members: {selectedTeamData.memberCount}/5</p>
                            <p>Average Trust Score: {selectedTeamData.averageTrustScore}/100</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleApplyToTournament} disabled={!selectedTeam || applying}>
                        {applying ? "Applying..." : "Apply to Tournament"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {eligibleTeams.length === 0 && tournament.status === "open" && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <h4 className="font-medium mb-2">No Eligible Teams</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      You need a {tournament.game} team with trust score {tournament.trustScoreThreshold}+ to apply.
                    </p>
                    <Button variant="outline" onClick={() => router.push("/team/create")}>
                      Create Team
                    </Button>
                  </CardContent>
                </Card>
              )}

              {tournament.status === "closed" && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <h4 className="font-medium mb-2">Registration Closed</h4>
                    <p className="text-sm text-muted-foreground">Registration for this tournament has ended.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </KYCGuard>
  )
}
