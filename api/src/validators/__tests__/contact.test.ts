import { describe, it, expect } from 'vitest'
import { contactSchema } from '../contact.js'

describe('contactSchema', () => {
  const valid = {
    name: 'Jordan',
    email: 'jordan@test.com',
    subject: 'Question',
    message: 'Bonjour, je voudrais un renseignement.',
  }

  it('accepts valid contact data', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts optional phone', () => {
    expect(contactSchema.safeParse({ ...valid, phone: '0612345678' }).success).toBe(true)
  })

  it('rejects empty name', () => {
    expect(contactSchema.safeParse({ ...valid, name: '' }).success).toBe(false)
  })

  it('rejects invalid email', () => {
    expect(contactSchema.safeParse({ ...valid, email: 'nope' }).success).toBe(false)
  })

  it('rejects empty message', () => {
    expect(contactSchema.safeParse({ ...valid, message: '' }).success).toBe(false)
  })

  it('rejects name too long (>200)', () => {
    expect(contactSchema.safeParse({ ...valid, name: 'a'.repeat(201) }).success).toBe(false)
  })

  it('rejects message too long (>5000)', () => {
    expect(contactSchema.safeParse({ ...valid, message: 'a'.repeat(5001) }).success).toBe(false)
  })

  it('rejects phone too long (>20)', () => {
    expect(contactSchema.safeParse({ ...valid, phone: '1'.repeat(21) }).success).toBe(false)
  })
})
