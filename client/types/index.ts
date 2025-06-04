import { z } from "zod";

export const profileSchema = z.object({
   fullName: z
    .string()
    .min(3, { message: "Full name is required" }),

  gamerTag: z
    .string()
    .min(1, { message: "GamerTag is required" }),

  phoneNumber: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .max(10, { message: "Phone number is too long" })
    .regex(/^\d+$/, { message: "Phone number must contain only digits" }),
  bgmiId: z.string().optional(),
  valorantId: z.string().optional(),
  freeFireId: z.string().optional(),
  counterStrike2Id: z.string().optional(),
});


export type Tournament = {
  id: string
  title: string
  game: string
  status: "open" | "closed" | "upcoming" | string
  description: string
  date: string
  maxPlayers: number
  prizePool: string
  trustScoreThreshold: number
  organizer: string
  registrationDeadline: string
  currentRegistrations?: number
  location?: string
  rules?: string[]
  schedule?: { stage: string; date: string; teams: string }[]
}

export type Team = {
  id: string
  name: string
  game: string
  isEligible: boolean
  averageTrustScore: number
  memberCount: number
}

