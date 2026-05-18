import { z } from 'zod'

export const registerBodySchema = z
  .object({
    email: z.string().trim().min(1),
    name: z.string().trim().min(1),
    password: z.string().min(1),
  })
  .strict()

export const loginBodySchema = z
  .object({
    email: z.string().trim().min(1),
    password: z.string().min(1),
  })
  .strict()

export type RegisterRequestBody = z.infer<typeof registerBodySchema>
export type LoginRequestBody = z.infer<typeof loginBodySchema>
