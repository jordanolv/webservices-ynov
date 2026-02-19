import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mocks ──────────────────────────────────────────────
vi.mock('../../db/models/user.js', () => ({
  User: {
    findOne: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  },
}))
vi.mock('../../db/models/product.js', () => ({
  Product: {
    find: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
}))
vi.mock('../../db/models/gallery.js', () => ({ Gallery: {} }))
vi.mock('../../db/models/order.js', () => ({ Order: {} }))
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

import { createTestApp, jsonRequest, authRequest } from './helpers.js'
import { signToken } from '../../middleware/auth.js'
import { Product } from '../../db/models/product.js'

const app = createTestApp()

beforeEach(() => vi.clearAllMocks())

describe('Error handler integration', () => {
  it('retourne 404 JSON pour une route inexistante', async () => {
    const res = await jsonRequest(app, 'GET', '/api/this-does-not-exist')
    expect(res.status).toBe(404)
  })

  it('retourne 404 avec message pour un produit inexistant (NotFoundError)', async () => {
    vi.mocked(Product.findById).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as never)

    const res = await jsonRequest(app, 'GET', '/api/products/nonexistent')

    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.success).toBe(false)
    expect(json.message).toContain('introuvable')
  })

  it('retourne 500 pour une erreur interne inattendue', async () => {
    vi.mocked(Product.findById).mockReturnValue({
      lean: vi.fn().mockRejectedValue(new Error('Database crash')),
    } as never)

    // On supprime le console.error pour ce test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const res = await jsonRequest(app, 'GET', '/api/products/some-id')

    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.success).toBe(false)
    expect(json.message).toBe('Erreur interne du serveur')

    spy.mockRestore()
  })

  it('retourne 401 pour un accès admin sans token', async () => {
    const res = await jsonRequest(app, 'GET', '/api/orders')

    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.success).toBe(false)
    expect(json.message).toContain('authentifié')
  })

  it('retourne 401 pour un token expiré/invalide', async () => {
    const res = await authRequest(app, 'GET', '/api/orders', 'completely-bogus-token')

    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.success).toBe(false)
  })

  it('les réponses de succès ont le bon format { success: true, data: ... }', async () => {
    vi.mocked(Product.find).mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([{ _id: '1', name: 'Test' }]),
      }),
    } as never)

    const res = await jsonRequest(app, 'GET', '/api/products')

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveProperty('success', true)
    expect(json).toHaveProperty('data')
    expect(Array.isArray(json.data)).toBe(true)
  })

  it('les réponses de création retournent 201', async () => {
    const token = await signToken('admin-uid')
    vi.mocked(Product.create).mockResolvedValue({
      _id: '1',
      name: 'New',
      description: 'Desc',
      images: [],
      sizePrices: [{ size: 'M', price: 10 }],
    } as never)

    const res = await authRequest(app, 'POST', '/api/products', token, {
      name: 'New',
      description: 'Desc',
      images: [],
      sizePrices: [{ size: 'M', price: 10 }],
    })

    expect(res.status).toBe(201)
  })
})
