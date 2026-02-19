import { describe, it, expect } from 'vitest'
import { loginSchema, signupSchema } from '../auth.js'

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({ email: 'test@mail.com', password: 'secret' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret' })
    expect(result.success).toBe(false)
  })

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ email: 'test@mail.com', password: '' })
    expect(result.success).toBe(false)
  })

  it('rejects missing fields', () => {
    expect(loginSchema.safeParse({}).success).toBe(false)
    expect(loginSchema.safeParse({ email: 'test@mail.com' }).success).toBe(false)
  })
})

describe('signupSchema', () => {
  const valid = { email: 'test@mail.com', password: 'secret123', fullName: 'Jordan' }

  it('accepts valid signup data', () => {
    expect(signupSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects password shorter than 6 chars', () => {
    const result = signupSchema.safeParse({ ...valid, password: '12345' })
    expect(result.success).toBe(false)
  })

  it('rejects empty fullName', () => {
    const result = signupSchema.safeParse({ ...valid, fullName: '' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = signupSchema.safeParse({ ...valid, email: 'bad' })
    expect(result.success).toBe(false)
  })
})
