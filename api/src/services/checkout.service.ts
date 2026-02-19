import { Order } from '../db/models/order.js'
import { stripe, imageUrl } from '../lib/stripe.js'
import { sendOrderConfirmation, sendAdminOrderNotification } from '../lib/mail.js'
import { AppError } from '../types/index.js'
import type { CreateSessionInput } from '../validators/checkout.js'

export async function createSession(data: CreateSessionInput) {
  if (!stripe) throw new AppError(503, 'Stripe non configuré')

  const lineItems = data.items.map((it) => ({
    price_data: {
      currency: 'eur',
      product_data: {
        name: `${it.productName} - ${it.size}`,
        images: it.imageUrl ? [imageUrl(it.imageUrl)] : [],
      },
      unit_amount: Math.round(it.unitPrice * 100),
    },
    quantity: it.quantity,
  }))

  const orderItems = data.items.map((it) => ({
    productId: it.productId,
    productName: it.productName,
    size: it.size,
    quantity: it.quantity,
    unitPrice: it.unitPrice,
    totalPrice: it.unitPrice * it.quantity,
    imageUrl: it.imageUrl || null,
  }))

  const successUrl = process.env.STRIPE_SUCCESS_URL || 'http://localhost:4090/checkout/success'
  const cancelUrl = process.env.STRIPE_CANCEL_URL || 'http://localhost:4090/boutique'

  const session = await stripe.checkout.sessions.create({
    line_items: lineItems,
    mode: 'payment',
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    customer_email: data.customerEmail,
    shipping_address_collection: { allowed_countries: ['FR', 'BE', 'CH', 'LU', 'MC'] },
    metadata: { orderItems: JSON.stringify(orderItems) },
    payment_method_types: ['card'],
  })

  return { sessionId: session.id, url: session.url }
}

export async function handleWebhook(raw: string, signature: string) {
  if (!stripe) throw new AppError(503, 'Stripe non configuré')
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) throw new AppError(500, 'Webhook non configuré')

  let event: { type: string; data: { object: { id: string } } }
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret) as typeof event
  } catch {
    throw new AppError(400, 'Signature invalide')
  }

  if (event.type === 'checkout.session.completed') {
    const sessionId = (event.data.object as { id: string }).id
    const existing = await Order.findOne({ stripeSessionId: sessionId })
    if (existing) return

    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['line_items'] })
    if (session.payment_status !== 'paid') return

    const orderItems = JSON.parse((session.metadata?.orderItems as string) || '[]')
    const subtotal = orderItems.reduce((s: number, i: { totalPrice: number }) => s + i.totalPrice, 0)
    const shippingCost = (session as { shipping_cost?: { amount_total?: number } }).shipping_cost?.amount_total
      ? (session as { shipping_cost: { amount_total: number } }).shipping_cost.amount_total / 100
      : 0
    const totalAmount = session.amount_total ? session.amount_total / 100 : subtotal + shippingCost

    const sessionAny = session as unknown as Record<string, unknown>
    const collected = sessionAny.collected_information as Record<string, unknown> | null
    const shipping = (collected?.shipping_details || sessionAny.shipping_details || sessionAny.shipping) as Record<string, unknown> | null
    const addr = (shipping?.address || {}) as Record<string, string>

    const orderNumber = await (Order as unknown as { generateOrderNumber: () => Promise<string> }).generateOrderNumber()
    const order = await Order.create({
      stripeSessionId: sessionId,
      stripePaymentIntentId: session.payment_intent as string,
      orderNumber,
      status: 'pending',
      paymentStatus: 'paid',
      customer: {
        email: (session.customer_details?.email as string) || '',
        name: (shipping?.name as string) || (session.customer_details?.name as string) || 'Client',
        phone: (session.customer_details?.phone as string) || null,
      },
      shippingAddress: {
        line1: addr.line1 || 'N/A',
        line2: addr.line2 || null,
        city: addr.city || 'N/A',
        postalCode: addr.postal_code || 'N/A',
        country: addr.country || 'FR',
      },
      items: orderItems,
      subtotal,
      shippingCost,
      totalAmount,
      currency: session.currency || 'eur',
      paidAt: new Date(),
    })

    const orderPlain = order.toObject()
    await sendOrderConfirmation({
      orderNumber: orderPlain.orderNumber,
      customer: { email: orderPlain.customer?.email || '' },
      totalAmount: orderPlain.totalAmount,
    })
    await sendAdminOrderNotification({
      orderNumber: orderPlain.orderNumber,
      customer: { name: orderPlain.customer?.name || 'Client', email: orderPlain.customer?.email || '' },
      totalAmount: orderPlain.totalAmount,
    })
  }
}
