import type { Context } from 'hono'
import * as checkoutService from '../services/checkout.service.js'
import * as orderService from '../services/order.service.js'
import { success, error } from '../lib/response.js'

export async function createSession(c: Context) {
  const body = c.req.valid('json' as never)
  const data = await checkoutService.createSession(body)
  return success(c, data)
}

export async function getOrder(c: Context) {
  const data = await orderService.findBySessionId(c.req.param('sessionId'))
  return success(c, data)
}

export async function webhook(c: Context) {
  const sig = c.req.header('stripe-signature')
  if (!sig) return error(c, 'Signature manquante', 400)
  const raw = await c.req.text()
  await checkoutService.handleWebhook(raw, sig)
  return c.json({ received: true })
}
