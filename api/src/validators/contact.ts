import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
})

export type ContactInput = z.infer<typeof contactSchema>
