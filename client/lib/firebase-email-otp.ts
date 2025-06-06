// import { auth } from "@/lib/firebase"
// import {
//   sendSignInLinkToEmail,
//   isSignInWithEmailLink,
//   signInWithEmailLink,
//   type ActionCodeSettings,
// } from "firebase/auth"

// export interface FirebaseEmailOTPService {
//   sendEmailLink: (email: string) => Promise<{ success: boolean; message: string }>
//   verifyEmailLink: (email: string, emailLink: string) => Promise<{ success: boolean; message: string }>
//   isValidEmailLink: (emailLink: string) => boolean
// }

// class FirebaseEmailOTPServiceImpl implements FirebaseEmailOTPService {
//   private getActionCodeSettings(email: string): ActionCodeSettings {
//     const baseUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin

//     return {
//       // URL you want to redirect back to. The domain for this
//       // URL must be in the authorized domains list in the Firebase Console.
//       url: `${baseUrl}/verify-email?email=${encodeURIComponent(email)}`,
//       // This must be true for email link authentication
//       handleCodeInApp: true,
//       iOS: {
//         bundleId: "com.gamehub.app",
//       },
//       android: {
//         packageName: "com.gamehub.app",
//         installApp: true,
//         minimumVersion: "12",
//       },
//       // Only include dynamic link domain if configured
//       ...(process.env.NEXT_PUBLIC_FIREBASE_DYNAMIC_LINK_DOMAIN && {
//         dynamicLinkDomain: process.env.NEXT_PUBLIC_FIREBASE_DYNAMIC_LINK_DOMAIN,
//       }),
//     }
//   }

//   async sendEmailLink(email: string): Promise<{ success: boolean; message: string }> {
//     try {
//       const actionCodeSettings = this.getActionCodeSettings(email)

//       await sendSignInLinkToEmail(auth, email, actionCodeSettings)

//       // Save the email locally so you don't need to ask the user for it again
//       // if they open the link on the same device.
//       window.localStorage.setItem("emailForSignIn", email)

//       return {
//         success: true,
//         message: "Verification email sent successfully",
//       }
//     } catch (error: any) {
//       console.error("Send email link error:", error)

//       let message = "Failed to send verification email"

//       switch (error.code) {
//         case "auth/invalid-email":
//           message = "Invalid email address"
//           break
//         case "auth/user-disabled":
//           message = "This account has been disabled"
//           break
//         case "auth/too-many-requests":
//           message = "Too many requests. Please try again later"
//           break
//         case "auth/network-request-failed":
//           message = "Network error. Please check your connection"
//           break
//         default:
//           message = error.message || "Failed to send verification email"
//       }

//       return {
//         success: false,
//         message,
//       }
//     }
//   }

//   isValidEmailLink(emailLink: string): boolean {
//     return isSignInWithEmailLink(auth, emailLink)
//   }

//   async verifyEmailLink(email: string, emailLink: string): Promise<{ success: boolean; message: string }> {
//     try {
//       if (!this.isValidEmailLink(emailLink)) {
//         return {
//           success: false,
//           message: "Invalid verification link",
//         }
//       }

//       const result = await signInWithEmailLink(auth, email, emailLink)

//       // Clear the email from storage
//       window.localStorage.removeItem("emailForSignIn")

//       return {
//         success: true,
//         message: "Email verified successfully",
//       }
//     } catch (error: any) {
//       console.error("Verify email link error:", error)

//       let message = "Failed to verify email"

//       switch (error.code) {
//         case "auth/expired-action-code":
//           message = "Verification link has expired. Please request a new one"
//           break
//         case "auth/invalid-action-code":
//           message = "Invalid verification link"
//           break
//         case "auth/user-disabled":
//           message = "This account has been disabled"
//           break
//         case "auth/invalid-email":
//           message = "Invalid email address"
//           break
//         default:
//           message = error.message || "Failed to verify email"
//       }

//       return {
//         success: false,
//         message,
//       }
//     }
//   }
// }

// export const firebaseEmailOTPService = new FirebaseEmailOTPServiceImpl()
