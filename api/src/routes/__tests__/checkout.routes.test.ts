import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mocks (vi.hoisted pour éviter le problème de hoisting) ──
const { mockOrder, mockStripe } = vi.hoisted(() => ({
  mockOrder: {
    find: vi.fn(),
    findById: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
  },
  mockStripe: {
    checkout: {
      sessions: {
        create: vi.fn(),
        retrieve: vi.fn(),
      },
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
}))

vi.mock('../../db/models/order.js', () => ({ Order: mockOrder }))
vi.mock('../../db/models/user.js', () => ({ User: { findOne: vi.fn(), findById: vi.fn(), create: vi.fn() } }))
vi.mock('../../db/models/product.js', () => ({ Product: {} }))
vi.mock('../../db/models/gallery.js', () => ({ Gallery: {} }))
vi.mock('../../lib/mail.js', () => ({
  sendContact: vi.fn(),
  sendOrderConfirmation: vi.fn(),
  sendAdminOrderNotification: vi.fn(),
}))
vi.mock('../../lib/stripe.js', () => ({
  stripe: mockStripe,
  imageUrl: vi.fn((p: string) => p),
}))
vi.mock('../../lib/upload.js', () => ({
  validateImage: vi.fn(),
  saveUpload: vi.fn(),
  deleteUpload: vi.fn(),
  isSafeFilename: vi.fn(),
}))

import { createTestApp, jsonRequest } from './helpers.js'

const app = createTestApp()

beforeEach(() => vi.clearAllMocks())

// ── Tests ──────────────────────────────────────────────
describe('POST /api/checkout/create-session', () => {
  const validPayload = {
    items: [
      {
        productId: 'prod-1',
        productName: 'T-Shirt Chat',
        size: 'M',
        quantity: 2,
        unitPrice: 29.99,
        imageUrl: '/uploads/products/img.jpg',
      },
    ],
    customerEmail: 'client@test.com',
  }

  it('200 - crée une session Stripe', async () => {
    mockStripe.checkout.sessions.create.mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/session/cs_test_123',
    })

    const res = await jsonRequest(app, 'POST', '/api/checkout/create-session', validPayload)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.sessionId).toBe('cs_test_123')
    expect(json.data.url).toContain('checkout.stripe.com')
  })

  it('200 - accepte sans email client (optionnel)', async () => {
    mockStripe.checkout.sessions.create.mockResolvedValue({
      id: 'cs_test_456',
      url: 'https://checkout.stripe.com/session/cs_test_456',
    })

    const res = await jsonRequest(app, 'POST', '/api/checkout/create-session', {
      items: validPayload.items,
    })

    expect(res.status).toBe(200)
  })

  it('400 - refuse sans items', async () => {
    const res = await jsonRequest(app, 'POST', '/api/checkout/create-session', {
      items: [],
    })

    expect(res.status).toBe(400)
  })

  it('400 - refuse si items manquant', async () => {
    const res = await jsonRequest(app, 'POST', '/api/checkout/create-session', {})
    expect(res.status).toBe(400)
  })

  it('400 - refuse un item incomplet (sans productName)', async () => {
    const res = await jsonRequest(app, 'POST', '/api/checkout/create-session', {
      items: [{ productId: 'p1', size: 'M', quantity: 1, unitPrice: 10 }],
    })

    expect(res.status).toBe(400)
  })

  it('400 - refuse une quantité à 0', async () => {
    const res = await jsonRequest(app, 'POST', '/api/checkout/create-session', {
      items: [{ ...validPayload.items[0], quantity: 0 }],
    })

    expect(res.status).toBe(400)
  })

  it('400 - refuse un prix négatif', async () => {
    const res = await jsonRequest(app, 'POST', '/api/checkout/create-session', {
      items: [{ ...validPayload.items[0], unitPrice: -5 }],
    })

    expect(res.status).toBe(400)
  })
})

describe('GET /api/checkout/order/:sessionId', () => {
  it('200 - retourne une commande par sessionId', async () => {
    const order = {
      _id: '1',
      stripeSessionId: 'cs_test_123',
      orderNumber: 'CMD-202601-0001',
      totalAmount: 59.98,
    }
    mockOrder.findOne.mockReturnValue({ lean: vi.fn().mockResolvedValue(order) })

    const res = await jsonRequest(app, 'GET', '/api/checkout/order/cs_test_123')

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.stripeSessionId).toBe('cs_test_123')
    expect(json.data.orderNumber).toBe('CMD-202601-0001')
  })

  it('404 - commande inexistante', async () => {
    mockOrder.findOne.mockReturnValue({ lean: vi.fn().mockResolvedValue(null) })

    const res = await jsonRequest(app, 'GET', '/api/checkout/order/cs_not_found')
    expect(res.status).toBe(404)
  })
})

describe('POST /api/checkout/webhook', () => {
  it('400 - refuse sans header stripe-signature', async () => {
    const res = await app.request('/api/checkout/webhook', {
      method: 'POST',
      body: 'raw-body',
      headers: { 'Content-Type': 'text/plain' },
    })

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.success).toBe(false)
  })

  it('400 - refuse une signature invalide', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
    mockStripe.webhooks.constructEvent.mockImplementation(() => {
      throw new Error('Invalid signature')
    })

    const res = await app.request('/api/checkout/webhook', {
      method: 'POST',
      body: 'raw-body',
      headers: {
        'Content-Type': 'text/plain',
        'stripe-signature': 'bad-sig',
      },
    })

    expect(res.status).toBe(400)
    delete process.env.STRIPE_WEBHOOK_SECRET
  })

  it('200 - traite un événement checkout.session.completed valide', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'

    const items = [{ productId: 'p1', productName: 'T-Shirt', size: 'M', quantity: 1, unitPrice: 29.99, totalPrice: 29.99 }]

    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_done' } },
    })

    mockOrder.findOne.mockResolvedValue(null) // pas de doublon

    mockStripe.checkout.sessions.retrieve.mockResolvedValue({
      id: 'cs_done',
      payment_status: 'paid',
      payment_intent: 'pi_123',
      amount_total: 2999,
      currency: 'eur',
      customer_details: { email: 'client@mail.com', name: 'Client' },
      metadata: { orderItems: JSON.stringify(items) },
      collected_information: {
        shipping_details: {
          name: 'Client Test',
          address: { line1: '1 rue du Test', city: 'Paris', postal_code: '75001', country: 'FR' },
        },
      },
    })

    mockOrder.create.mockResolvedValue({
      toObject: () => ({
        orderNumber: 'CMD-202601-0001',
        customer: { email: 'client@mail.com', name: 'Client Test' },
        totalAmount: 29.99,
      }),
    })

    // Mock generateOrderNumber
    ;(mockOrder as Record<string, unknown>).generateOrderNumber = vi.fn().mockResolvedValue('CMD-202601-0001')

    const res = await app.request('/api/checkout/webhook', {
      method: 'POST',
      body: 'raw-body',
      headers: {
        'Content-Type': 'text/plain',
        'stripe-signature': 'valid-sig',
      },
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.received).toBe(true)

    delete process.env.STRIPE_WEBHOOK_SECRET
  })
})
