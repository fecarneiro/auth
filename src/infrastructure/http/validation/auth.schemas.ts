import { z } from 'zod'

export const registerBodySchema = z.object({
  email: z.string().trim().min(1),
  name: z.string().trim().min(1),
  password: z.string().min(1),
})

export const loginBodySchema = z.object({
  email: z.string().trim().min(1),
  password: z.string().min(1),
})
