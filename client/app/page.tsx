"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

export default function Home() {
  const { user, loading, userProfile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else if (!userProfile) {
        router.push("/setup-profile")
      } else if (userProfile.kycStatus === "approved") {
        router.push("/dashboard")
      } else {
        // KYC Guard will handle this case
        router.push("/dashboard")
      }
    }
  }, [user, loading, userProfile, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
    </div>
  )
}
