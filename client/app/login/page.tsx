// "use client"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Label } from "@/components/ui/label"
// import { useToast } from "@/hooks/use-toast"
// import { Gamepad2, Mail, Phone, ArrowLeft } from "lucide-react"
// import { ThemeToggle } from "@/components/theme-toggle"
// import { FirebaseEmailOTPForm } from "@/components/firebase-email-otp-form"
// import { RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential } from "firebase/auth"
// import { auth } from "@/lib/firebase"
// import { apiClient } from "@/lib/api-client"

// export default function LoginPage() {
//   const [step, setStep] = useState<"select" | "input" | "otp">("select")
//   const [method, setMethod] = useState<"email" | "phone" | null>(null)
//   const [contact, setContact] = useState("")
//   const [otp, setOtp] = useState("")
//   const [loading, setLoading] = useState(false)
//   const [verificationId, setVerificationId] = useState("")
//   const router = useRouter()
//   const { toast } = useToast()

//   const handleMethodSelect = (selectedMethod: "email" | "phone") => {
//     setMethod(selectedMethod)
//     setStep("input")
//   }

//   const validateEmail = (email: string): boolean => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//     return emailRegex.test(email)
//   }

//   const validatePhone = (phone: string): boolean => {
//     const phoneRegex = /^\+[1-9]\d{1,14}$/
//     return phoneRegex.test(phone)
//   }

//   const handleSendOTP = async () => {
//     if (!contact) return

//     if (method === "email" && !validateEmail(contact)) {
//       toast({
//         title: "Invalid Email",
//         description: "Please enter a valid email address",
//         variant: "destructive",
//       })
//       return
//     }

//     if (method === "phone" && !validatePhone(contact)) {
//       toast({
//         title: "Invalid Phone Number",
//         description: "Please enter a valid phone number with country code (e.g., +1234567890)",
//         variant: "destructive",
//       })
//       return
//     }

//     if (method === "email") {
//       // For email, move to Firebase email link flow
//       setStep("otp")
//       return
//     }

//     // Phone OTP flow
//     setLoading(true)
//     try {
//       // Setup reCAPTCHA for phone auth
//       if (!window.recaptchaVerifier) {
//         window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
//           size: "invisible",
//           callback: () => {
//             // reCAPTCHA solved
//           },
//         })
//       }

//       const appVerifier = window.recaptchaVerifier
//       const confirmationResult = await signInWithPhoneNumber(auth, contact, appVerifier)
//       setVerificationId(confirmationResult.verificationId)
//       setStep("otp")
//       toast({
//         title: "OTP Sent",
//         description: "Verification code sent to your phone",
//       })
//     } catch (error: any) {
//       console.error("Phone OTP send error:", error)
//       toast({
//         title: "Error",
//         description: error.message || "Failed to send OTP",
//         variant: "destructive",
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleVerifyPhoneOTP = async () => {
//     if (!otp) return

//     setLoading(true)
//     try {
//       const credential = PhoneAuthProvider.credential(verificationId, otp)
//       const userCredential = await signInWithCredential(auth, credential)

//       if (userCredential) {
//         const token = await userCredential.user.getIdToken()
//         await handleSuccessfulAuth(token)
//       }
//     } catch (error: any) {
//       console.error("Phone OTP verification error:", error)
//       toast({
//         title: "Verification Failed",
//         description: error.message || "Invalid OTP",
//         variant: "destructive",
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleSuccessfulAuth = async (token: string) => {
//     try {
//       // Check if user profile exists
//       const response = await apiClient.get("/api/user/profile", {
//         headers: { Authorization: `Bearer ${token}` },
//       })

//       if (response.data.kycStatus === "approved") {
//         router.push("/dashboard")
//       } else {
//         router.push("/dashboard") // KYC Guard will handle blocking
//       }
//     } catch (error: any) {
//       if (error.response?.status === 404) {
//         // New user, redirect to profile setup
//         router.push("/setup-profile")
//       } else {
//         console.error("Profile fetch error:", error)
//         toast({
//           title: "Error",
//           description: "Failed to load user profile",
//           variant: "destructive",
//         })
//       }
//     }

//     toast({
//       title: "Welcome!",
//       description: "Successfully logged in",
//     })
//   }

//   const handleBack = () => {
//     if (step === "otp") {
//       setStep("input")
//     } else if (step === "input") {
//       setStep("select")
//       setMethod(null)
//       setContact("")
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
//       <div className="absolute top-4 right-4">
//         <ThemeToggle />
//       </div>

//       <Card className="w-full max-w-md">
//         <CardHeader className="text-center">
//           <div className="flex justify-center mb-4">
//             <div className="p-3 bg-primary/10 rounded-full">
//               <Gamepad2 className="h-8 w-8 text-primary" />
//             </div>
//           </div>
//           <CardTitle className="text-2xl font-bold">Welcome to GameHub</CardTitle>
//           <CardDescription>
//             {step === "select" && "Choose your login method"}
//             {step === "input" && `Enter your ${method}`}
//             {step === "otp" && method === "phone" && "Enter verification code"}
//           </CardDescription>
//         </CardHeader>

//         <CardContent className="space-y-4">
//           {step !== "select" && method === "phone" && (
//             <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Back
//             </Button>
//           )}

//           {step === "select" && (
//             <div className="space-y-3">
//               <Button
//                 variant="outline"
//                 className="w-full h-12 justify-start"
//                 onClick={() => handleMethodSelect("email")}
//               >
//                 <Mail className="h-5 w-5 mr-3" />
//                 Login with Email
//               </Button>
//               <Button
//                 variant="outline"
//                 className="w-full h-12 justify-start"
//                 onClick={() => handleMethodSelect("phone")}
//               >
//                 <Phone className="h-5 w-5 mr-3" />
//                 Login with Phone
//               </Button>
//             </div>
//           )}

//           {step === "input" && (
//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="contact">{method === "email" ? "Email Address" : "Phone Number"}</Label>
//                 <Input
//                   id="contact"
//                   type={method === "email" ? "email" : "tel"}
//                   placeholder={method === "email" ? "Enter your email" : "+1234567890"}
//                   value={contact}
//                   onChange={(e) => setContact(e.target.value)}
//                 />
//                 {method === "phone" && (
//                   <p className="text-xs text-muted-foreground">Include country code (e.g., +1 for US, +91 for India)</p>
//                 )}
//               </div>
//               <Button className="w-full" onClick={handleSendOTP} disabled={!contact || loading}>
//                 {loading ? "Sending..." : method === "email" ? "Send Verification Email" : "Send OTP"}
//               </Button>
//               <div id="recaptcha-container"></div>
//             </div>
//           )}

//           {step === "otp" && method === "email" && <FirebaseEmailOTPForm email={contact} onBack={handleBack} />}

//           {step === "otp" && method === "phone" && (
//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="otp">Verification Code</Label>
//                 <Input
//                   id="otp"
//                   type="text"
//                   placeholder="Enter 6-digit code"
//                   value={otp}
//                   onChange={(e) => setOtp(e.target.value)}
//                   maxLength={6}
//                   className="text-center text-lg font-mono tracking-widest"
//                 />
//               </div>
//               <Button className="w-full" onClick={handleVerifyPhoneOTP} disabled={otp.length !== 6 || loading}>
//                 {loading ? "Verifying..." : "Verify OTP"}
//               </Button>
//               <Button variant="ghost" className="w-full" onClick={handleSendOTP} disabled={loading}>
//                 Resend Code
//               </Button>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

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

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

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

      if (response.data.kycStatus === "approved") {
        router.push("/dashboard")
      } else {
        router.push("/dashboard") // KYC guard will handle access
      }

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
