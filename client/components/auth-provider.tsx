"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
  userProfile: any
  setUserProfile: (profile: any) => void
  refetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  userProfile: null,
  setUserProfile: () => {},
  refetchUser: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const router = useRouter()

  // ✅ Used both in effect and exposed via context
  const refetchUser = async () => {
    const currentUser = auth.currentUser
    if (!currentUser) {
      setUser(null)
      setUserProfile(null)
      setLoading(false)
      return
    }

    const token = await currentUser.getIdToken()
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`

    try {
      const response = await apiClient.get("/api/player")
      setUser(currentUser)
      setUserProfile(response.data)
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
    } finally {
      setLoading(false)
    }
  }

  // ✅ on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        await refetchUser()
      } else {
        setUser(null)
        setUserProfile(null)
        delete apiClient.defaults.headers.common["Authorization"]
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const logout = async () => {
    try {
      await signOut(auth)
      delete apiClient.defaults.headers.common["Authorization"]
      setUser(null)
      setUserProfile(null)
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        userProfile,
        setUserProfile,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
