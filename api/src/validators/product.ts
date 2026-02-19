import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  images: z.array(z.string()),
  sizePrices: z.array(z.object({ size: z.string(), price: z.number().min(0) })).min(1),
  isActive: z.boolean().default(true),
  isBestSeller: z.boolean().default(false),
})

export const productUpdateSchema = productSchema.partial()

export type CreateProductInput = z.infer<typeof productSchema>
export type UpdateProductInput = z.infer<typeof productUpdateSchema>
