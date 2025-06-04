"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Users, Trophy } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { KYCGuard } from "@/components/kyc-guard"
import { apiClient } from "@/lib/api-client"

export default function MyTournamentsPage() {
  const router = useRouter()
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMyTournaments = async () => {
      try {
        const response = await apiClient.get("/api/tournaments/my-applications")
        setTournaments(response.data)
      } catch (error) {
        console.error("Failed to fetch tournaments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMyTournaments()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-500 hover:bg-green-600"
      case "applied":
        return "bg-blue-500 hover:bg-blue-600"
      case "rejected":
        return "bg-red-500 hover:bg-red-600"
      case "flagged":
        return "bg-yellow-500 hover:bg-yellow-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
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
                <p className="text-muted-foreground">Track your tournament applications and status</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <div className="space-y-4">
            {tournaments.map((tournament: any) => (
              <Card key={tournament.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{tournament.name}</h3>
                        <Badge className={`${getStatusColor(tournament.status)} text-white`}>
                          {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>Team: {tournament.teamName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Trophy className="h-4 w-4" />
                          <span>Trust Score: {tournament.trustScoreAtApplication}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Applied: {formatDate(tournament.appliedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end space-y-2">
                      <Badge variant="outline">{tournament.game}</Badge>
                      <p className="text-sm text-muted-foreground">
                        Tournament: {formatDate(tournament.tournamentDate)}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/tournament/${tournament.tournamentId}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {tournaments.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Tournament Applications</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't applied to any tournaments yet. Browse available tournaments to get started!
                  </p>
                  <Button onClick={() => router.push("/tournaments")}>Browse Tournaments</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </KYCGuard>
  )
}
