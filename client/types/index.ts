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
 bgmiId: z
    .string()
    .optional()
    .refine((id) => !id || /^[0-9]{5,15}$/.test(id), {
      message: "BGMI ID must be 5–15 digits",
    }),

  valorantId: z
    .string()
    .optional()
    .refine((id) => !id || /^[a-zA-Z0-9]{3,16}#[a-zA-Z0-9]{3,5}$/.test(id), {
      message: "Valorant ID must be like 'Player#1234'",
    }),

  freeFireId: z
    .string()
    .optional()
    .refine((id) => !id || /^[0-9]{5,15}$/.test(id), {
      message: "Free Fire ID must be 5–15 digits",
    }),

  counterStrike2Id: z
    .string()
    .optional()
    .refine((id) => !id || /^STEAM_[0-5]:[01]:\d+$/.test(id), {
      message: "CS2 ID must be like 'STEAM_0:1:12345678'",
    }),
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

