"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { User, Tag, Gamepad2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/components/auth-provider"
import { apiClient } from "@/lib/api-client"
import { profileSchema } from "@/types"

export default function SetupProfilePage() {
  const [formData, setFormData] = useState({
    fullName: "",
    gamerTag: "",
    bgmiId: "",
    valorantId: "",
    freeFireId:"",
    counterStrike2Id:"",
    phoneNumber:"",

  })
  // const [gamerTagValid, setGamerTagValid] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingTag, setCheckingTag] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const { toast } = useToast()
  const { setUserProfile,userProfile } = useAuth()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: "" }))
    // if (field === "gamerTag") {
    //   setGamerTagValid(null)
    // }
  }

  // useEffect(()=>{
  //   if(userProfile){
  //     router.push('/dashboard')
  //   }
  // },[userProfile])

  // const checkGamerTagAvailability = async () => {
  //   if (!formData.gamerTag) return

  //   setCheckingTag(true)
  //   try {
  //     const response = await apiClient.post("/api/user/check-gamertag", {
  //       gamerTag: formData.gamerTag,
  //     })
  //     setGamerTagValid(response.data.available)

  //     if (!response.data.available) {
  //       toast({
  //         title: "GamerTag Unavailable",
  //         description: "This GamerTag is already taken. Please try another.",
  //         variant: "destructive",
  //       })
  //     }
  //   } catch (error) {
  //     console.error("GamerTag check error:", error)
  //     toast({
  //       title: "Error",
  //       description: "Failed to check GamerTag availability",
  //       variant: "destructive",
  //     })
  //   } finally {
  //     setCheckingTag(false)
  //   }
  // }

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.gamerTag ) return
        const parsed =  profileSchema.safeParse(formData)
        console.log(parsed);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      parsed.error.errors.forEach((err) => {
        const field = err.path[0]
        fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      toast({
        title: "Validation Error",
        description: "Please fix the highlighted fields",
        variant: "destructive",
      })
      return
    }
    setLoading(true)
    try {
         
      const response = await apiClient.post("/api/player", {
        fullName: formData.fullName,
        gamerTag: formData.gamerTag,
        phone:formData.phoneNumber,
        gameIds: {
          bgmi: formData.bgmiId,
          valorant: formData.valorantId,
          freeFire:formData.freeFireId,
          counterStrike2:formData.counterStrike2Id
        },
      })

      setUserProfile(response.data)
      router.push("/kyc")
      toast({
        title: "Profile Created!",
        description: "Let's verify your identity to continue",
      })
    } catch (error: any) {
      console.error("Profile creation error:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <User className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Setup Your Profile</CardTitle>
          <CardDescription>Tell us about yourself and your gaming preferences</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
            />
            {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            />
            {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gamerTag">GamerTag *</Label>
            <div className="relative">
              <Input
                id="gamerTag"
                type="text"
                placeholder="Choose a unique GamerTag"
                value={formData.gamerTag}
                onChange={(e) => handleInputChange("gamerTag", e.target.value)}
              />
              <Tag className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
            {errors.gamerTag && <p className="text-sm text-red-500">{errors.gamerTag}</p>}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Gamepad2 className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Game IDs</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bgmiId">BGMI ID</Label>
              <Input
                id="bgmiId"
                type="text"
                placeholder="Enter your BGMI ID"
                value={formData.bgmiId}
                onChange={(e) => handleInputChange("bgmiId", e.target.value)}
              />
              {errors.bgmiId && <p className="text-sm text-red-500">{errors.bgmiId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorantId">Valorant ID</Label>
              <Input
                id="valorantId"
                type="text"
                placeholder="Enter your Valorant ID"
                value={formData.valorantId}
                onChange={(e) => handleInputChange("valorantId", e.target.value)}
              />
               {errors.valorantId && <p className="text-sm text-red-500">{errors.valorantId}</p>}
            </div>
              <div className="space-y-2">
              <Label htmlFor="freeFireId">Free Fire ID</Label>
              <Input
                id="freeFireId"
                type="text"
                placeholder="Enter your Free Fire ID"
                value={formData.freeFireId}
                onChange={(e) => handleInputChange("freeFireId", e.target.value)}
              />
               {errors.freeFireId && <p className="text-sm text-red-500">{errors.freeFireId}</p>}
            </div>
              <div className="space-y-2">
              <Label htmlFor="counterStrike2Id">Counter Strike 2 ID</Label>
              <Input
                id="counterStrike2Id"
                type="text"
                placeholder="Enter your Counter Strike 2 ID"
                value={formData.counterStrike2Id}
                onChange={(e) => handleInputChange("counterStrike2Id", e.target.value)}
              />
               {errors.counterStrike2Id && <p className="text-sm text-red-500">{errors.counterStrike2Id}</p>}
            </div>
           
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={!formData.fullName || !formData.gamerTag  || loading}
          >
            {loading ? "Creating Profile..." : "Save & Continue"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
