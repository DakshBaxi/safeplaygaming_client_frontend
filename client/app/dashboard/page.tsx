"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Trophy, Plus, Search, Clock, CheckCircle, XCircle, LogOut, Calendar, MapPin } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/components/auth-provider"
import { KYCGuard } from "@/components/kyc-guard"
import { apiClient } from "@/lib/api-client"

export default function DashboardPage() {
  const router = useRouter()
  const { userProfile, logout, loading: authLoading } = useAuth()
  const [myTournamentsData, setMyTournamentsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending")
  const [loadingStatus, setLoadingStatus] = useState(true)

  useEffect(() => {
    if (authLoading || !userProfile) return
    const fetchMyTournamentsData = async () => {
      try {
        const response = await apiClient.get("/api/player/my-tournaments")
        setMyTournamentsData(response.data)
        console.log("My tournaments data:", response.data)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    const fetchKycStatus = async () => {
      try {
        const response = await apiClient.get("/api/player/kycStatus")
        setStatus(response.data.status)
      } catch (error) {
        console.error("Failed to fetch KYC status:", error)
      } finally {
        setLoadingStatus(false)
      }
    }
    
    fetchKycStatus()
    fetchMyTournamentsData()
  }, [authLoading, userProfile])

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      default:
        return "bg-yellow-500"
    }
  }

  const getKycStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
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

  const formatGame = (game: string) => {
    const gameNames: { [key: string]: string } = {
      'bgmi': 'BGMI',
      'valorant': 'Valorant',
      'freeFire': 'Free Fire',
      'counterStrike2': 'Counter Strike 2'
    }
    return gameNames[game] || game
  }

  if (loading || loadingStatus || authLoading) {
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {userProfile?.fullName}!</h1>
              <p className="text-muted-foreground">@{userProfile?.gamerTag}</p>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4" />
                <p>LogOut</p>
              </Button>
            </div>
          </div>

          {/* User Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  KYC Status
                  {getKycStatusIcon(status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={`${getKycStatusColor(status)} text-white`}>
                  {status?.charAt(0).toUpperCase() + status?.slice(1)}
                </Badge>
                {status === "pending" && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Review in progress. You'll be notified once complete.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Trust Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold text-green-600">{userProfile?.trustScore || 0}</div>
                  <div className="text-sm text-muted-foreground">/100</div>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${userProfile?.trustScore || 0}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your teams and tournaments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={() => router.push("/team/create")}
                >
                  <Plus className="h-6 w-6" />
                  <span className="text-sm">Create Team</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => router.push("/team/join")}>
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Join Team</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={() => router.push("/tournaments")}
                >
                  <Search className="h-6 w-6" />
                  <span className="text-sm">Browse Tournaments</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={() => router.push("/my-tournaments")}
                >
                  <Trophy className="h-6 w-6" />
                  <span className="text-sm">My Tournaments</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Team */}
          {userProfile?.teams?.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Active Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userProfile.teams.map((team: any) => (
                    <div
                      key={team._id}
                      className="flex items-center justify-between border-b pb-2 last:border-none last:pb-0"
                    >
                      <div>
                        <h3 className="font-semibold">{team.teamName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {(team.players?.length || 0)} members • {formatGame(team.game)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/team/${team._id}`)}
                      >
                        View Team
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Tournament Applications */}
          <Card>
            <CardHeader>
              <CardTitle>My Tournament Registrations</CardTitle>
              <CardDescription>Track your tournament registration status</CardDescription>
            </CardHeader>
            <CardContent>
              {myTournamentsData?.tournaments && myTournamentsData.tournaments.length > 0 ? (
                <div className="space-y-4">
                  {myTournamentsData.tournaments.slice(0, 5).map((item: any, index: number) => {
                    const tournament = item.tournament;
                    const team = item.team;
                    
                    return (
                      <div key={tournament._id || index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-lg">{tournament.title}</h4>
                              <Badge className={getTournamentStatusColor(tournament.status)}>
                                {tournament.status}
                              </Badge>
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
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            {tournament.currentRegistrations}/{tournament.maxPlayers} teams registered
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
                  
                  {myTournamentsData.tournaments.length > 5 && (
                    <div className="text-center pt-4">
                      <Button
                        variant="outline"
                        onClick={() => router.push("/my-tournaments")}
                      >
                        View All Tournaments ({myTournamentsData.totalCount})
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No tournament applications yet</p>
                  <Button variant="outline" className="mt-4" onClick={() => router.push("/tournaments")}>
                    Browse Tournaments
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </KYCGuard>
  )
}