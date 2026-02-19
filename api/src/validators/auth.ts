import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Le mot de passe doit faire au moins 6 caractères'),
  fullName: z.string().min(1, 'Le nom est requis'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
