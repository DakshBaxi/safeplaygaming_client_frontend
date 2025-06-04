"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Mail, ExternalLink, RefreshCw, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { firebaseEmailOTPService } from "@/lib/firebase-email-otp"
import { firebaseEmailStorage } from "@/lib/firebase-email-storage"

interface FirebaseEmailOTPFormProps {
  email: string
  onBack: () => void
}

export function FirebaseEmailOTPForm({ email, onBack }: FirebaseEmailOTPFormProps) {
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    // Send initial email when component mounts
    handleSendEmailLink()
  }, [])

  useEffect(() => {
    // Cooldown timer
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleSendEmailLink = async () => {
    setLoading(true)
    setError("")

    try {
      const result = await firebaseEmailOTPService.sendEmailLink(email)

      if (result.success) {
        firebaseEmailStorage.saveEmail(email)
        setEmailSent(true)
        setResendCooldown(60) // 1 minute cooldown
        toast({
          title: "Verification Email Sent! 📧",
          description: "Check your email and click the verification link to continue.",
        })
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("Failed to send verification email. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return
    await handleSendEmailLink()
  }

  const openEmailApp = () => {
    // Try to open the default email app
    const emailDomain = email.split("@")[1]
    let emailUrl = "mailto:"

    // Popular email providers
    const emailProviders: Record<string, string> = {
      "gmail.com": "https://mail.google.com",
      "outlook.com": "https://outlook.live.com",
      "hotmail.com": "https://outlook.live.com",
      "yahoo.com": "https://mail.yahoo.com",
      "icloud.com": "https://www.icloud.com/mail",
    }

    if (emailProviders[emailDomain]) {
      emailUrl = emailProviders[emailDomain]
    }

    window.open(emailUrl, "_blank")
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full">
            <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h3 className="text-xl font-semibold">Check your email</h3>
        <p className="text-muted-foreground">
          We've sent a verification link to
          <br />
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      {emailSent && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Verification email sent successfully! Click the link in your email to continue.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <Button variant="outline" className="w-full" onClick={openEmailApp} disabled={!emailSent}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Email App
        </Button>

        <Button variant="ghost" className="w-full" onClick={handleResendEmail} disabled={loading || resendCooldown > 0}>
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : resendCooldown > 0 ? (
            <>
              <Clock className="h-4 w-4 mr-2" />
              Resend in {resendCooldown}s
            </>
          ) : (
            "Resend verification email"
          )}
        </Button>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg space-y-3">
        <h4 className="font-medium flex items-center">
          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
          What to do next:
        </h4>
        <ol className="text-sm text-muted-foreground space-y-2 ml-6">
          <li className="list-decimal">Check your email inbox for a message from Firebase</li>
          <li className="list-decimal">Click the "Verify Email" button in the email</li>
          <li className="list-decimal">You'll be automatically signed in and redirected</li>
        </ol>

        <div className="pt-2 border-t border-muted">
          <p className="text-xs text-muted-foreground">
            <strong>Can't find the email?</strong> Check your spam folder or try a different email address.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button variant="outline" className="w-full" onClick={onBack}>
          Use a different email
        </Button>
      </div>
    </div>
  )
}
