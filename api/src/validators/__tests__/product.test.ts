import { describe, it, expect } from 'vitest'
import { productSchema, productUpdateSchema } from '../product.js'

describe('productSchema', () => {
  const valid = {
    name: 'Tirage Lion',
    description: 'Un beau tirage',
    images: ['/uploads/products/img.jpg'],
    sizePrices: [{ size: '30x40', price: 45 }],
  }

  it('accepts a valid product', () => {
    const result = productSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('applies defaults for isActive and isBestSeller', () => {
    const result = productSchema.parse(valid)
    expect(result.isActive).toBe(true)
    expect(result.isBestSeller).toBe(false)
  })

  it('rejects missing name', () => {
    const result = productSchema.safeParse({ ...valid, name: '' })
    expect(result.success).toBe(false)
  })

  it('rejects empty sizePrices', () => {
    const result = productSchema.safeParse({ ...valid, sizePrices: [] })
    expect(result.success).toBe(false)
  })

  it('rejects negative price', () => {
    const result = productSchema.safeParse({
      ...valid,
      sizePrices: [{ size: '30x40', price: -10 }],
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing description', () => {
    const { description, ...rest } = valid
    const result = productSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })
})

describe('productUpdateSchema', () => {
  it('accepts partial fields', () => {
    const result = productUpdateSchema.safeParse({ name: 'Nouveau nom' })
    expect(result.success).toBe(true)
  })

  it('accepts empty object', () => {
    const result = productUpdateSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})
