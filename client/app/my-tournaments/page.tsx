"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Users, Trophy, MapPin, Clock, CheckCircle, XCircle } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { KYCGuard } from "@/components/kyc-guard"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/components/auth-provider"

export default function MyTournamentsPage() {
  const router = useRouter()
  const [myTournamentsData, setMyTournamentsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
   const { userProfile,  loading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading || !userProfile) return
    const fetchMyTournaments = async () => {
      try {
        const response = await apiClient.get("/api/player/my-tournaments")
        setMyTournamentsData(response.data)
        console.log("My tournaments data:", response.data)
      } catch (error) {
        console.error("Failed to fetch tournaments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMyTournaments()
  }, [userProfile,authLoading])

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-500 hover:bg-green-600 text-white"
      case "applied":
        return "bg-blue-500 hover:bg-blue-600 text-white"
      case "rejected":
        return "bg-red-500 hover:bg-red-600 text-white"
      case "flagged":
        return "bg-yellow-500 hover:bg-yellow-600 text-white"
      default:
        return "bg-gray-500 hover:bg-gray-600 text-white"
    }
  }

  const getApplicationStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getTournamentStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "ongoing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatGame = (game: string) => {
    const gameNames: { [key: string]: string } = {
      'bgmi': 'BGMI',
      'valorant': 'Valorant',
      'freeFire': 'Free Fire',
      'counterStrike2': 'Counter Strike 2'
    }
    return gameNames[game] || game
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <KYCGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto p-4 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.back()} className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold">My Tournaments</h1>
                <p className="text-muted-foreground">Track your tournament applications and registrations</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Summary Stats */}
          {myTournamentsData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Tournaments</p>
                      <p className="text-2xl font-bold">{myTournamentsData.totalCount || 0}</p>
                    </div>
                    <Trophy className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Tournaments</p>
                      <p className="text-2xl font-bold">
                        {myTournamentsData.tournaments?.filter((t: any) => t.tournament.status === 'open' || t.tournament.status === 'ongoing').length || 0}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold">
                        {myTournamentsData.tournaments?.filter((t: any) => t.tournament.status === 'completed').length || 0}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tournament Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Tournament Registrations</CardTitle>
              <CardDescription>Your tournament applications and their current status</CardDescription>
            </CardHeader>
            <CardContent>
              {myTournamentsData?.tournaments && myTournamentsData.tournaments.length > 0 ? (
                <div className="space-y-4">
                  {myTournamentsData.tournaments.map((item: any, index: number) => {
                    const tournament = item.tournament;
                    const team = item.team;
                    const application = item.application;
                    
                    return (
                      <div key={tournament._id || index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-lg">{tournament.title}</h4>
                              <Badge className={getTournamentStatusColor(tournament.status)}>
                                {tournament.status}
                              </Badge>
                              {application && (
                                <Badge className={getApplicationStatusColor(application.status)}>
                                  <div className="flex items-center gap-1">
                                    {getApplicationStatusIcon(application.status)}
                                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                  </div>
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{tournament.description}</p>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(tournament.date)}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {tournament.location}
                              </div>
                              <div className="font-medium text-green-600">
                                ₹{tournament.prizePool.toLocaleString()}
                              </div>
                            </div>

                            {/* Team Information */}
                            {team && (
                              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-2 mt-2">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                    Registered with: {team.teamName}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {formatGame(team.game)}
                                  </Badge>
                                </div>
                                {application?.trustScoreAtApplication && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <Trophy className="h-4 w-4 text-yellow-600" />
                                    <span className="text-sm text-muted-foreground">
                                      Trust Score at Application: {application.trustScoreAtApplication}
                                    </span>
                                  </div>
                                )}
                                {application?.appliedAt && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <Clock className="h-4 w-4 text-gray-600" />
                                    <span className="text-sm text-muted-foreground">
                                      Applied: {formatDateShort(application.appliedAt)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            {tournament.currentRegistrations || 0}/{tournament.maxPlayers} teams registered
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/tournament/${tournament._id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Tournament Applications</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't applied to any tournaments yet. Browse available tournaments to get started!
                  </p>
                  <Button onClick={() => router.push("/tournaments")}>Browse Tournaments</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </KYCGuard>
  )
}
