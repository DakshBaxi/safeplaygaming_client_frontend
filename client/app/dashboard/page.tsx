"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Trophy, Plus, Search, Clock, CheckCircle, XCircle, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/components/auth-provider"
import { KYCGuard } from "@/components/kyc-guard"
import { apiClient } from "@/lib/api-client"

export default function DashboardPage() {
  const router = useRouter()
  const { userProfile, logout,loading:authLoading } = useAuth()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending")
  const [loadingStatus, setLoadingStatus] = useState(true)

  useEffect(() => {
     if (authLoading || !userProfile) return
    const fetchDashboardData = async () => {
      try {
        const response = await apiClient.get("/api/dashboard")
        setDashboardData(response.data)
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
    fetchDashboardData()
  }, [authLoading,userProfile])

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

  if (loading||loadingStatus||authLoading) {
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
              <Button variant="outline"  onClick={logout}>
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
                {(team.players?.length || 0) } members • {team.game}
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
              <CardTitle>Recent Tournament Applications</CardTitle>
              <CardDescription>Track your tournament registration status</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.recentTournaments?.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.recentTournaments.map((tournament: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{tournament.name}</h4>
                        <p className="text-sm text-muted-foreground">{tournament.date}</p>
                      </div>
                      <Badge variant={tournament.status === "approved" ? "default" : "secondary"}>
                        {tournament.status}
                      </Badge>
                    </div>
                  ))}
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
