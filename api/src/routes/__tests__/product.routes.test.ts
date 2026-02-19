import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mocks (vi.hoisted pour éviter le problème de hoisting) ──
const { mockProduct, mockUser } = vi.hoisted(() => ({
  mockProduct: {
    find: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    create: vi.fn(),
  },
  mockUser: {
    findOne: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  },
}))

vi.mock('../../db/models/product.js', () => ({ Product: mockProduct }))
vi.mock('../../db/models/user.js', () => ({ User: mockUser }))
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

import { signToken } from '../../middleware/auth.js'
import { createTestApp, jsonRequest, authRequest } from './helpers.js'
import { validateImage, saveUpload, deleteUpload, isSafeFilename } from '../../lib/upload.js'

const app = createTestApp()
let adminToken: string

beforeEach(async () => {
  vi.clearAllMocks()
  adminToken = await signToken('admin-uid')
})

// ── Helpers pour chaîner find().sort().lean() ──────────
function mockFindChain(data: unknown) {
  return { sort: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(data) }) }
}
function mockFindByIdChain(data: unknown) {
  return { lean: vi.fn().mockResolvedValue(data) }
}

// ── Tests publics ──────────────────────────────────────
describe('GET /api/products (public)', () => {
  it('200 - retourne la liste des produits actifs', async () => {
    const products = [
      { _id: '1', name: 'Produit A', isActive: true },
      { _id: '2', name: 'Produit B', isActive: true },
    ]
    mockProduct.find.mockReturnValue(mockFindChain(products))

    const res = await jsonRequest(app, 'GET', '/api/products')

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data).toHaveLength(2)
    expect(mockProduct.find).toHaveBeenCalledWith({ isActive: true })
  })

  it('200 - retourne un tableau vide si aucun produit', async () => {
    mockProduct.find.mockReturnValue(mockFindChain([]))

    const res = await jsonRequest(app, 'GET', '/api/products')

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toEqual([])
  })
})

describe('GET /api/products/:id (public)', () => {
  it('200 - retourne un produit actif', async () => {
    const product = { _id: '1', name: 'Produit', isActive: true }
    mockProduct.findById.mockReturnValue(mockFindByIdChain(product))

    const res = await jsonRequest(app, 'GET', '/api/products/1')

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.name).toBe('Produit')
  })

  it('404 - produit inexistant', async () => {
    mockProduct.findById.mockReturnValue(mockFindByIdChain(null))

    const res = await jsonRequest(app, 'GET', '/api/products/bad-id')

    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.success).toBe(false)
  })

  it('404 - produit inactif en mode public', async () => {
    const product = { _id: '1', name: 'Inactif', isActive: false }
    mockProduct.findById.mockReturnValue(mockFindByIdChain(product))

    const res = await jsonRequest(app, 'GET', '/api/products/1')

    expect(res.status).toBe(404)
  })
})

// ── Tests admin ────────────────────────────────────────
describe('GET /api/products/admin/all (admin)', () => {
  it('200 - retourne tous les produits (actifs + inactifs)', async () => {
    const products = [
      { _id: '1', isActive: true },
      { _id: '2', isActive: false },
    ]
    mockProduct.find.mockReturnValue(mockFindChain(products))

    const res = await authRequest(app, 'GET', '/api/products/admin/all', adminToken)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toHaveLength(2)
  })

  it('401 - refuse sans authentification', async () => {
    const res = await jsonRequest(app, 'GET', '/api/products/admin/all')
    expect(res.status).toBe(401)
  })
})

describe('GET /api/products/admin/:id (admin)', () => {
  it('200 - retourne un produit inactif pour un admin', async () => {
    const product = { _id: '1', name: 'Inactif', isActive: false }
    mockProduct.findById.mockReturnValue(mockFindByIdChain(product))

    const res = await authRequest(app, 'GET', '/api/products/admin/1', adminToken)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.isActive).toBe(false)
  })

  it('401 - refuse sans token', async () => {
    const res = await jsonRequest(app, 'GET', '/api/products/admin/1')
    expect(res.status).toBe(401)
  })
})

describe('POST /api/products (admin)', () => {
  const validProduct = {
    name: 'Nouveau Produit',
    description: 'Description du produit',
    images: [],
    sizePrices: [{ size: 'M', price: 29.99 }],
  }

  it('201 - crée un produit', async () => {
    mockProduct.create.mockResolvedValue({ _id: 'new-id', ...validProduct })

    const res = await authRequest(app, 'POST', '/api/products', adminToken, validProduct)

    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.name).toBe('Nouveau Produit')
  })

  it('401 - refuse sans authentification', async () => {
    const res = await jsonRequest(app, 'POST', '/api/products', validProduct)
    expect(res.status).toBe(401)
  })

  it('400 - refuse si nom manquant', async () => {
    const res = await authRequest(app, 'POST', '/api/products', adminToken, {
      description: 'Desc',
      images: [],
      sizePrices: [{ size: 'M', price: 10 }],
    })
    expect(res.status).toBe(400)
  })

  it('400 - refuse si sizePrices vide', async () => {
    const res = await authRequest(app, 'POST', '/api/products', adminToken, {
      name: 'Test',
      description: 'Desc',
      images: [],
      sizePrices: [],
    })
    expect(res.status).toBe(400)
  })

  it('400 - refuse si prix négatif', async () => {
    const res = await authRequest(app, 'POST', '/api/products', adminToken, {
      name: 'Test',
      description: 'Desc',
      images: [],
      sizePrices: [{ size: 'M', price: -5 }],
    })
    expect(res.status).toBe(400)
  })
})

describe('PUT /api/products/:id (admin)', () => {
  it('200 - met à jour un produit', async () => {
    mockProduct.findByIdAndUpdate.mockResolvedValue({ _id: '1', name: 'Updated' })

    const res = await authRequest(app, 'PUT', '/api/products/1', adminToken, { name: 'Updated' })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.name).toBe('Updated')
  })

  it('404 - produit inexistant', async () => {
    mockProduct.findByIdAndUpdate.mockResolvedValue(null)

    const res = await authRequest(app, 'PUT', '/api/products/bad', adminToken, { name: 'X' })
    expect(res.status).toBe(404)
  })

  it('401 - refuse sans token', async () => {
    const res = await jsonRequest(app, 'PUT', '/api/products/1', { name: 'X' })
    expect(res.status).toBe(401)
  })
})

describe('DELETE /api/products/:id (admin)', () => {
  it('200 - supprime un produit', async () => {
    mockProduct.findByIdAndDelete.mockResolvedValue({ _id: '1' })

    const res = await authRequest(app, 'DELETE', '/api/products/1', adminToken)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  it('404 - produit inexistant', async () => {
    mockProduct.findByIdAndDelete.mockResolvedValue(null)

    const res = await authRequest(app, 'DELETE', '/api/products/bad', adminToken)
    expect(res.status).toBe(404)
  })

  it('401 - refuse sans token', async () => {
    const res = await jsonRequest(app, 'DELETE', '/api/products/1')
    expect(res.status).toBe(401)
  })
})

describe('POST /api/products/:id/images (admin)', () => {
  it('200 - upload une image', async () => {
    const product = { _id: '1', images: [], save: vi.fn() }
    mockProduct.findById.mockResolvedValue(product)
    vi.mocked(validateImage).mockReturnValue({ ok: true, ext: '.jpg' })
    vi.mocked(saveUpload).mockResolvedValue({ filename: 'a.jpg', relativePath: '/uploads/products/a.jpg' })

    const formData = new FormData()
    formData.append('file', new File([new Uint8Array([0xff, 0xd8, 0xff])], 'test.jpg'))

    const res = await app.request('/api/products/1/images', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formData,
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.url).toBe('/uploads/products/a.jpg')
  })

  it('400 - refuse sans fichier', async () => {
    const formData = new FormData()

    const res = await app.request('/api/products/1/images', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formData,
    })

    expect(res.status).toBe(400)
  })

  it('401 - refuse sans token', async () => {
    const formData = new FormData()
    formData.append('file', new File([new Uint8Array([0xff])], 'test.jpg'))

    const res = await app.request('/api/products/1/images', {
      method: 'POST',
      body: formData,
    })

    expect(res.status).toBe(401)
  })
})

describe('DELETE /api/products/:id/images/:filename (admin)', () => {
  it('200 - supprime une image', async () => {
    const product = { _id: '1', images: ['/uploads/products/a.jpg'], save: vi.fn() }
    mockProduct.findById.mockResolvedValue(product)
    vi.mocked(isSafeFilename).mockReturnValue(true)
    vi.mocked(deleteUpload).mockResolvedValue()

    const res = await authRequest(app, 'DELETE', '/api/products/1/images/a.jpg', adminToken)

    expect(res.status).toBe(200)
  })

  it('401 - refuse sans token', async () => {
    const res = await jsonRequest(app, 'DELETE', '/api/products/1/images/a.jpg')
    expect(res.status).toBe(401)
  })
})
