import { describe, it, expect } from 'vitest'
import { reorderSchema } from '../gallery.js'

describe('reorderSchema', () => {
  it('accepts an array of IDs', () => {
    const result = reorderSchema.safeParse({ ids: ['a', 'b', 'c'] })
    expect(result.success).toBe(true)
  })

  it('accepts empty array', () => {
    const result = reorderSchema.safeParse({ ids: [] })
    expect(result.success).toBe(true)
  })

  it('rejects missing ids', () => {
    expect(reorderSchema.safeParse({}).success).toBe(false)
  })

  it('rejects non-string array', () => {
    expect(reorderSchema.safeParse({ ids: [1, 2, 3] }).success).toBe(false)
  })
})
