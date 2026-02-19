import { z } from 'zod'

export const reorderSchema = z.object({
  ids: z.array(z.string()),
})

export type ReorderInput = z.infer<typeof reorderSchema>
