import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mocks (vi.hoisted pour éviter le problème de hoisting) ──
const { mockGallery } = vi.hoisted(() => ({
  mockGallery: {
    find: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
}))

vi.mock('../../db/models/gallery.js', () => ({ Gallery: mockGallery }))
vi.mock('../../db/models/user.js', () => ({ User: { findOne: vi.fn(), findById: vi.fn(), create: vi.fn() } }))
vi.mock('../../db/models/product.js', () => ({ Product: {} }))
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
import { validateImage, saveUpload } from '../../lib/upload.js'

const app = createTestApp()
let adminToken: string

beforeEach(async () => {
  vi.clearAllMocks()
  adminToken = await signToken('admin-uid')
})

// ── Tests ──────────────────────────────────────────────
describe('GET /api/gallery (public)', () => {
  it('200 - retourne la liste des images triées par order', async () => {
    const images = [
      { _id: '1', imageUrl: '/img1.jpg', order: 0 },
      { _id: '2', imageUrl: '/img2.jpg', order: 1 },
    ]
    mockGallery.find.mockReturnValue({
      sort: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(images) }),
    })

    const res = await jsonRequest(app, 'GET', '/api/gallery')

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data).toHaveLength(2)
  })

  it('200 - retourne un tableau vide si aucune image', async () => {
    mockGallery.find.mockReturnValue({
      sort: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue([]) }),
    })

    const res = await jsonRequest(app, 'GET', '/api/gallery')

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toEqual([])
  })
})

describe('POST /api/gallery (admin)', () => {
  it('201 - crée une image de galerie', async () => {
    vi.mocked(validateImage).mockReturnValue({ ok: true, ext: '.jpg' })
    vi.mocked(saveUpload).mockResolvedValue({ filename: 'a.jpg', relativePath: '/uploads/gallery/a.jpg' })
    mockGallery.create.mockResolvedValue({ _id: 'new', imageUrl: '/uploads/gallery/a.jpg', order: 0 })

    const formData = new FormData()
    formData.append('file', new File([new Uint8Array([0xff, 0xd8, 0xff])], 'test.jpg'))
    formData.append('order', '0')

    const res = await app.request('/api/gallery', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formData,
    })

    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.imageUrl).toBe('/uploads/gallery/a.jpg')
  })

  it('400 - refuse sans fichier', async () => {
    const formData = new FormData()

    const res = await app.request('/api/gallery', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formData,
    })

    expect(res.status).toBe(400)
  })

  it('401 - refuse sans authentification', async () => {
    const formData = new FormData()
    formData.append('file', new File([new Uint8Array([0xff])], 'test.jpg'))

    const res = await app.request('/api/gallery', {
      method: 'POST',
      body: formData,
    })

    expect(res.status).toBe(401)
  })

  it('500 - refuse un format d\'image invalide', async () => {
    vi.mocked(validateImage).mockReturnValue({ ok: false, error: 'Format invalide' })

    const formData = new FormData()
    formData.append('file', new File([new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])], 'bad.bin'))

    const res = await app.request('/api/gallery', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: formData,
    })

    expect(res.status).toBe(500)
  })
})

describe('PUT /api/gallery/reorder (admin)', () => {
  it('200 - réordonne les images', async () => {
    mockGallery.findByIdAndUpdate.mockResolvedValue({})

    const res = await authRequest(app, 'PUT', '/api/gallery/reorder', adminToken, {
      ids: ['id-1', 'id-2', 'id-3'],
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(mockGallery.findByIdAndUpdate).toHaveBeenCalledTimes(3)
  })

  it('401 - refuse sans authentification', async () => {
    const res = await jsonRequest(app, 'PUT', '/api/gallery/reorder', { ids: ['a'] })
    expect(res.status).toBe(401)
  })
})

describe('DELETE /api/gallery/:id (admin)', () => {
  it('200 - supprime une image de la galerie', async () => {
    mockGallery.findByIdAndDelete.mockResolvedValue({ _id: '1' })

    const res = await authRequest(app, 'DELETE', '/api/gallery/1', adminToken)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  it('404 - image inexistante', async () => {
    mockGallery.findByIdAndDelete.mockResolvedValue(null)

    const res = await authRequest(app, 'DELETE', '/api/gallery/bad', adminToken)
    expect(res.status).toBe(404)
  })

  it('401 - refuse sans token', async () => {
    const res = await jsonRequest(app, 'DELETE', '/api/gallery/1')
    expect(res.status).toBe(401)
  })
})
