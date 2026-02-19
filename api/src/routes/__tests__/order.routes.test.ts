import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mocks (vi.hoisted pour éviter le problème de hoisting) ──
const { mockOrder } = vi.hoisted(() => ({
  mockOrder: {
    find: vi.fn(),
    findById: vi.fn(),
    findOne: vi.fn(),
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
  stripe: null,
  imageUrl: vi.fn((p: string) => p),
}))
vi.mock('../../lib/upload.js', () => ({
  validateImage: vi.fn(),
  saveUpload: vi.fn(),
  deleteUpload: vi.fn(),
  isSafeFilename: vi.fn(),
}))

import { signToken } from '../../middleware/auth.js'
import { createTestApp, jsonRequest, authRequest } from './helpers.js'

const app = createTestApp()
let adminToken: string

beforeEach(async () => {
  vi.clearAllMocks()
  adminToken = await signToken('admin-uid')
})

// ── Tests ──────────────────────────────────────────────
describe('GET /api/orders (admin)', () => {
  it('200 - retourne la liste des commandes', async () => {
    const orders = [
      { _id: '1', orderNumber: 'CMD-202601-0001', totalAmount: 49.99 },
      { _id: '2', orderNumber: 'CMD-202601-0002', totalAmount: 89.99 },
    ]
    mockOrder.find.mockReturnValue({
      sort: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(orders) }),
    })

    const res = await authRequest(app, 'GET', '/api/orders', adminToken)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data).toHaveLength(2)
    expect(json.data[0].orderNumber).toBe('CMD-202601-0001')
  })

  it('200 - retourne un tableau vide si aucune commande', async () => {
    mockOrder.find.mockReturnValue({
      sort: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue([]) }),
    })

    const res = await authRequest(app, 'GET', '/api/orders', adminToken)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toEqual([])
  })

  it('401 - refuse sans authentification', async () => {
    const res = await jsonRequest(app, 'GET', '/api/orders')
    expect(res.status).toBe(401)
  })

  it('401 - refuse avec un token invalide', async () => {
    const res = await authRequest(app, 'GET', '/api/orders', 'invalid-token')
    expect(res.status).toBe(401)
  })
})

describe('GET /api/orders/:id (admin)', () => {
  it('200 - retourne une commande par ID', async () => {
    const order = {
      _id: '1',
      orderNumber: 'CMD-202601-0001',
      status: 'pending',
      paymentStatus: 'paid',
      customer: { email: 'client@test.com', name: 'Client Test' },
      totalAmount: 49.99,
    }
    mockOrder.findById.mockReturnValue({ lean: vi.fn().mockResolvedValue(order) })

    const res = await authRequest(app, 'GET', '/api/orders/1', adminToken)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.orderNumber).toBe('CMD-202601-0001')
    expect(json.data.customer.email).toBe('client@test.com')
  })

  it('404 - commande inexistante', async () => {
    mockOrder.findById.mockReturnValue({ lean: vi.fn().mockResolvedValue(null) })

    const res = await authRequest(app, 'GET', '/api/orders/bad-id', adminToken)
    expect(res.status).toBe(404)
  })

  it('401 - refuse sans token', async () => {
    const res = await jsonRequest(app, 'GET', '/api/orders/1')
    expect(res.status).toBe(401)
  })
})
