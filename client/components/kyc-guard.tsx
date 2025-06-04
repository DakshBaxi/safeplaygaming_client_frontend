"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Clock, Ban } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { apiClient } from "@/lib/api-client"

interface KYCGuardProps {
  children: React.ReactNode
}

export function KYCGuard({ children }: KYCGuardProps) {
  const { userProfile,loading:authLoading } = useAuth()
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending")
  const [loadingStatus, setLoadingStatus] = useState(true)

  useEffect(() => {
     if (authLoading || !userProfile) return
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
  }, [])

  if (authLoading||loadingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (status === "rejected") return <KYCRejectedCard />
  if (status !== "approved") return <KYCPendingCard status={status} />

  return <>{children}</>
}

function KYCPendingCard({ status }: { status: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
              <Shield className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-4">KYC Verification Required</h1>
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-yellow-600 dark:text-yellow-400">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Status: {status || "Pending"}</span>
            </div>
            <p className="text-muted-foreground">
              Your KYC verification is currently under review. Please wait for admin approval to access all platform
              features.
            </p>
            <div className="bg-muted/50 p-4 rounded-lg text-sm">
              <p className="font-medium mb-2">What happens next?</p>
              <ul className="text-left space-y-1 text-muted-foreground">
                <li>• Our team is reviewing your documents</li>
                <li>• You'll be notified via email once approved</li>
                <li>• Verification typically takes 24-48 hours</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function KYCRejectedCard() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
              <Ban className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-red-700 dark:text-red-300">KYC Rejected</h1>
          <p className="text-muted-foreground mb-4">
            Unfortunately, your KYC submission was rejected. Please ensure your documents are valid and clearly visible.
          </p>
          <div className="bg-muted/50 p-4 rounded-lg text-sm text-left text-muted-foreground">
            <p className="font-medium mb-2">Common reasons for rejection:</p>
            <ul className="space-y-1">
              <li>• Blurry or unreadable documents</li>
              <li>• Mismatch between selfie and ID</li>
              <li>• Expired identification documents</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
