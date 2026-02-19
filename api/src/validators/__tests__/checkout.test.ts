import { describe, it, expect } from 'vitest'
import { checkoutItemSchema, createSessionSchema } from '../checkout.js'

describe('checkoutItemSchema', () => {
  const valid = {
    productId: 'abc123',
    productName: 'Tirage Lion',
    size: '30x40',
    quantity: 2,
    unitPrice: 45,
  }

  it('accepts a valid item', () => {
    expect(checkoutItemSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts item with optional imageUrl', () => {
    expect(checkoutItemSchema.safeParse({ ...valid, imageUrl: '/img.jpg' }).success).toBe(true)
  })

  it('rejects quantity < 1', () => {
    expect(checkoutItemSchema.safeParse({ ...valid, quantity: 0 }).success).toBe(false)
  })

  it('rejects negative unitPrice', () => {
    expect(checkoutItemSchema.safeParse({ ...valid, unitPrice: -5 }).success).toBe(false)
  })

  it('rejects missing productName', () => {
    const { productName, ...rest } = valid
    expect(checkoutItemSchema.safeParse(rest).success).toBe(false)
  })
})

describe('createSessionSchema', () => {
  const validItem = {
    productId: 'abc123',
    productName: 'Tirage Lion',
    size: '30x40',
    quantity: 1,
    unitPrice: 45,
  }

  it('accepts a valid session', () => {
    expect(createSessionSchema.safeParse({ items: [validItem] }).success).toBe(true)
  })

  it('accepts optional customerEmail', () => {
    const result = createSessionSchema.safeParse({ items: [validItem], customerEmail: 'a@b.com' })
    expect(result.success).toBe(true)
  })

  it('rejects empty items array', () => {
    expect(createSessionSchema.safeParse({ items: [] }).success).toBe(false)
  })

  it('rejects invalid customerEmail', () => {
    expect(createSessionSchema.safeParse({ items: [validItem], customerEmail: 'bad' }).success).toBe(false)
  })
})
