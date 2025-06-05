"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Gamepad2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/hooks/use-toast"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/components/auth-provider"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const {userProfile,user} = useAuth()

    useEffect(()=>{
    if(userProfile){
      router.push('/dashboard')
    }
    if(user&&!userProfile){
      router.push('/setup-profile')
    }
  },[userProfile])

  const handleGoogleLogin = async () => {
    setLoading(true)
    const provider = new GoogleAuthProvider()

    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      const token = await user.getIdToken()

      await handleSuccessfulAuth(token)
    } catch (error: any) {
      console.error("Google sign-in error:", error)
      toast({
        title: "Login Failed",
        description: error.message || "Something went wrong during Google login.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSuccessfulAuth = async (token: string) => {
    try {
      const response = await apiClient.get("/api/player", {
        headers: { Authorization: `Bearer ${token}` },
      })

   
        router.push("/dashboard") // KYC guard will handle access
      

      toast({
        title: "Welcome!",
        description: "Successfully logged in",
      })
    } catch (error: any) {
      if (error.response?.status === 404) {
        // New user
        router.push("/setup-profile")
      } else {
        console.error("Profile fetch error:", error)
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Gamepad2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to GameHub</CardTitle>
          <CardDescription>Login with your Google account to continue</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full h-12 justify-center"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Continue with Google"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
