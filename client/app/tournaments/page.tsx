"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Calendar, Users, Trophy, Star } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { KYCGuard } from "@/components/kyc-guard"
import { apiClient } from "@/lib/api-client"
import { Tournament } from "@/types"

export default function TournamentsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)

  // useEffect(() => {
  //   const fetchTournaments = async () => {
  //     try {
  //       const response = await apiClient.get("/api/tournaments")
  //       setTournaments(response.data)
  //     } catch (error) {
  //       console.error("Failed to fetch tournaments:", error)
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  //   fetchTournaments()
  
  // }, [])

  useEffect(() => {
  const dummyTournaments = [
    {
      id: "1",
      title: "Valorant Summer Clash",
      game: "Valorant",
      status: "open",
      description: "Join the ultimate Valorant tournament this summer!",
      date: "2025-07-15",
      maxPlayers: 64,
      prizePool: "$2,000",
      trustScoreThreshold: 80,
      organizer: "GameHub",
      registrationDeadline: "2025-07-10",
    },
    {
      id: "2",
      title: "League of Legends Masters",
      game: "League of Legends",
      status: "closed",
      description: "Top teams clash for the LoL title.",
      date: "2025-06-01",
      maxPlayers: 32,
      prizePool: "$5,000",
      trustScoreThreshold: 90,
      organizer: "ProGaming",
      registrationDeadline: "2025-05-28",
    },
    {
      id: "3",
      title: "CS2 Pro Shootout",
      game: "Counter-Strike 2",
      status: "upcoming",
      description: "A thrilling CS2 tournament for elite players.",
      date: "2025-08-10",
      maxPlayers: 128,
      prizePool: "$10,000",
      trustScoreThreshold: 75,
      organizer: "eBattleZone",
      registrationDeadline: "2025-08-05",
    },
  ]

  setTournaments(dummyTournaments)
  setLoading(false)
}, [])


  const filteredTournaments = tournaments.filter(
    (tournament: any) =>
      tournament.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tournament.game.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-500 hover:bg-green-600"
      case "closed":
        return "bg-red-500 hover:bg-red-600"
      case "upcoming":
        return "bg-blue-500 hover:bg-blue-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto p-4 max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.back()} className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Browse Tournaments</h1>
                <p className="text-muted-foreground">Discover and join competitive gaming tournaments</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tournaments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((tournament: any) => (
              <Card
                key={tournament.id}
                className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => router.push(`/tournament/${tournament.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                        {tournament.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">{tournament.game}</Badge>
                        <Badge className={`${getStatusColor(tournament.status)} text-white`}>
                          {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">{tournament.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(tournament.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Max: {tournament.maxPlayers}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      <span>{tournament.prizePool}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <span>Trust: {tournament.trustScoreThreshold}+</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Organized by: {tournament.organizer}</p>
                    <p className="text-xs text-muted-foreground">
                      Registration deadline: {formatDate(tournament.registrationDeadline)}
                    </p>
                  </div>

                  <Button
                    className="w-full"
                    disabled={tournament.status === "closed"}
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/tournament/${tournament.id}`)
                    }}
                  >
                    {tournament.status === "closed" ? "Registration Closed" : "View Details"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTournaments.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Tournaments Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "Try adjusting your search terms" : "No tournaments available at the moment"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </KYCGuard>
  )
}
