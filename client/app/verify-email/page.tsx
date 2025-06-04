// "use client"

// import { useEffect, useState } from "react"
// import { useRouter, useSearchParams } from "next/navigation"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { useToast } from "@/hooks/use-toast"
// import { Gamepad2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
// import { ThemeToggle } from "@/components/theme-toggle"
// import { firebaseEmailOTPService } from "@/lib/firebase-email-otp"
// import { firebaseEmailStorage } from "@/lib/firebase-email-storage"
// import { apiClient } from "@/lib/api-client"

// export default function VerifyEmailPage() {
//   const [email, setEmail] = useState("")
//   const [loading, setLoading] = useState(true)
//   const [verifying, setVerifying] = useState(false)
//   const [verified, setVerified] = useState(false)
//   const [error, setError] = useState("")
//   const [needsEmailInput, setNeedsEmailInput] = useState(false)

//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const { toast } = useToast()

//   useEffect(() => {
//     const handleEmailVerification = async () => {
//       try {
//         // Get the current URL
//         const currentUrl = window.location.href

//         // Check if this is a valid email link
//         if (!firebaseEmailOTPService.isValidEmailLink(currentUrl)) {
//           setError("Invalid verification link")
//           setLoading(false)
//           return
//         }

//         // Try to get email from URL params first
//         let emailToVerify = searchParams.get("email")

//         // If not in URL, try to get from localStorage
//         if (!emailToVerify) {
//           emailToVerify = firebaseEmailStorage.getEmail()
//         }

//         if (!emailToVerify) {
//           // Need to ask user for email
//           setNeedsEmailInput(true)
//           setLoading(false)
//           return
//         }

//         setEmail(emailToVerify)
//         await verifyEmailLink(emailToVerify, currentUrl)
//       } catch (error) {
//         console.error("Email verification error:", error)
//         setError("Failed to verify email. Please try again.")
//         setLoading(false)
//       }
//     }

//     handleEmailVerification()
//   }, [searchParams])

//   const verifyEmailLink = async (emailToVerify: string, emailLink: string) => {
//     setVerifying(true)
//     setError("")

//     try {
//       const result = await firebaseEmailOTPService.verifyEmailLink(emailToVerify, emailLink)

//       if (result.success) {
//         setVerified(true)
//         firebaseEmailStorage.clearEmail()

//         toast({
//           title: "Email Verified! 🎉",
//           description: "You have been successfully logged in.",
//         })

//         // Check if user profile exists and redirect accordingly
//         setTimeout(async () => {
//           try {
//             const response = await apiClient.get("/api/user/profile")

//             if (response.data.kycStatus === "approved") {
//               router.push("/dashboard")
//             } else {
//               router.push("/dashboard") // KYC Guard will handle blocking
//             }
//           } catch (error: any) {
//             if (error.response?.status === 404) {
//               // New user, redirect to profile setup
//               router.push("/setup-profile")
//             } else {
//               router.push("/dashboard")
//             }
//           }
//         }, 2000)
//       } else {
//         setError(result.message)
//       }
//     } catch (error) {
//       setError("Failed to verify email. Please try again.")
//     } finally {
//       setVerifying(false)
//     }
//   }

//   const handleManualEmailSubmit = async () => {
//     if (!email) {
//       setError("Please enter your email address")
//       return
//     }

//     const currentUrl = window.location.href
//     await verifyEmailLink(email, currentUrl)
//   }

//   const handleRetryVerification = () => {
//     router.push("/login")
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
//       </div>
//     )
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
//           <CardTitle className="text-2xl font-bold">
//             {verified ? "Email Verified!" : verifying ? "Verifying Email..." : "Verify Your Email"}
//           </CardTitle>
//         </CardHeader>

//         <CardContent className="space-y-4">
//           {verified && (
//             <div className="text-center space-y-4">
//               <div className="flex justify-center">
//                 <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-full">
//                   <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
//                 </div>
//               </div>
//               <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
//                 <CheckCircle className="h-4 w-4 text-green-600" />
//                 <AlertDescription className="text-green-800 dark:text-green-200">
//                   Your email has been successfully verified! Redirecting you to the dashboard...
//                 </AlertDescription>
//               </Alert>
//             </div>
//           )}

//           {verifying && (
//             <div className="text-center space-y-4">
//               <div className="flex justify-center">
//                 <RefreshCw className="h-8 w-8 animate-spin text-primary" />
//               </div>
//               <p className="text-muted-foreground">Verifying your email address...</p>
//             </div>
//           )}

//           {needsEmailInput && !verifying && !verified && (
//             <div className="space-y-4">
//               <p className="text-center text-muted-foreground">Please enter the email address you used to sign up:</p>
//               <div className="space-y-2">
//                 <Label htmlFor="email">Email Address</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="Enter your email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                 />
//               </div>
//               <Button className="w-full" onClick={handleManualEmailSubmit}>
//                 Verify Email
//               </Button>
//             </div>
//           )}

//           {error && (
//             <Alert variant="destructive">
//               <AlertCircle className="h-4 w-4" />
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}

//           {error && !verified && (
//             <div className="space-y-2">
//               <Button variant="outline" className="w-full" onClick={handleRetryVerification}>
//                 Back to Login
//               </Button>
//             </div>
//           )}

//           {!verified && !verifying && !error && email && (
//             <div className="bg-muted/50 p-4 rounded-lg">
//               <p className="text-sm text-muted-foreground">
//                 <strong>Verifying:</strong> {email}
//               </p>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   )  
// }
