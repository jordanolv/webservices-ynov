import { z } from 'zod'

export const checkoutItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  size: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  imageUrl: z.string().optional(),
})

export const createSessionSchema = z.object({
  items: z.array(checkoutItemSchema).min(1),
  customerEmail: z.string().email().optional(),
})

export type CheckoutItem = z.infer<typeof checkoutItemSchema>
export type CreateSessionInput = z.infer<typeof createSessionSchema>
