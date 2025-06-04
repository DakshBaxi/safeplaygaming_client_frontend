"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Shield, Upload, FileText, Camera } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/components/auth-provider"

export default function KYCPage() {
  const [files, setFiles] = useState({
    govtId: null as File | null,
    selfie: null as File | null,
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { setUserProfile } = useAuth()

  const handleFileChange = (type: "govtId" | "selfie", file: File | null) => {
    setFiles((prev) => ({ ...prev, [type]: file }))
  }

  const handleSubmit = async () => {
    if (!files.govtId || !files.selfie) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("govtId", files.govtId)
      formData.append("selfie", files.selfie)

      const response = await apiClient.post("/api/player/kyc", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setUserProfile(response.data)
      toast({
        title: "KYC Submitted for Review",
        description: "We'll review your documents and notify you within 24-48 hours",
      })

      // Redirect to dashboard where KYC Guard will show the pending message
      router.push("/dashboard")
    } catch (error: any) {
      console.error("KYC submission error:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit KYC",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Identity Verification</CardTitle>
          <CardDescription>Upload your documents to verify your identity and unlock all features</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Government ID *</span>
              </Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handleFileChange("govtId", e.target.files?.[0] || null)}
                  className="hidden"
                  id="govtId"
                />
                <label htmlFor="govtId" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {files.govtId ? files.govtId.name : "Click to upload Government ID"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG, or PDF (max 5MB)</p>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Camera className="h-4 w-4" />
                <span>Selfie *</span>
              </Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange("selfie", e.target.files?.[0] || null)}
                  className="hidden"
                  id="selfie"
                />
                <label htmlFor="selfie" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {files.selfie ? files.selfie.name : "Click to upload Selfie"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">JPG or PNG (max 5MB)</p>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Important Notes:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Ensure documents are clear and readable</li>
              <li>• Selfie should show your face clearly</li>
              <li>• Review typically takes 24-48 hours</li>
            </ul>
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={!files.govtId || !files.selfie || loading}>
            {loading ? "Submitting..." : "Submit for Review"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
