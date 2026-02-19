import Stripe from 'stripe'

const secret = process.env.STRIPE_SECRET_KEY
export const stripe = secret ? new Stripe(secret, { apiVersion: '2025-02-24.acacia' }) : null

export function imageUrl(path: string): string {
  if (!path || path.startsWith('http')) return path
  const base = process.env.API_BASE_URL || 'http://localhost:4091'
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`
}
