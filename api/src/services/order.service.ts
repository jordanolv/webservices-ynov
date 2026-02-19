import { Order } from '../db/models/order.js'
import { NotFoundError } from '../types/index.js'

export async function listAll() {
  return Order.find().sort({ createdAt: -1 }).lean()
}

export async function findById(id: string) {
  const order = await Order.findById(id).lean()
  if (!order) throw new NotFoundError('Commande')
  return order
}

export async function findBySessionId(sessionId: string) {
  const order = await Order.findOne({ stripeSessionId: sessionId }).lean()
  if (!order) throw new NotFoundError('Commande')
  return order
}
