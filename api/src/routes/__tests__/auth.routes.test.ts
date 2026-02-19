import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mocks (vi.hoisted pour éviter le problème de hoisting) ──
const { mockUser } = vi.hoisted(() => ({
  mockUser: {
    findOne: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  },
}))

vi.mock('../../db/models/user.js', () => ({ User: mockUser }))
vi.mock('../../db/models/product.js', () => ({ Product: {} }))
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

const app = createTestApp()

beforeEach(() => vi.clearAllMocks())

// ── Tests ──────────────────────────────────────────────
describe('POST /api/auth/signup', () => {
  it('201 - crée un compte avec des données valides', async () => {
    mockUser.findOne.mockResolvedValue(null)
    mockUser.create.mockResolvedValue({ _id: 'new-id', email: 'test@mail.com' })

    const res = await jsonRequest(app, 'POST', '/api/auth/signup', {
      email: 'Test@Mail.COM',
      password: 'secret123',
      fullName: 'Jordan',
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(mockUser.create).toHaveBeenCalledWith({
      email: 'test@mail.com',
      password: 'secret123',
      fullName: 'Jordan',
    })
  })

  it('400 - refuse si email déjà existant', async () => {
    mockUser.findOne.mockResolvedValue({ email: 'test@mail.com' })

    const res = await jsonRequest(app, 'POST', '/api/auth/signup', {
      email: 'test@mail.com',
      password: 'secret123',
      fullName: 'Jordan',
    })

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.success).toBe(false)
  })

  it('400 - refuse si email invalide (validation Zod)', async () => {
    const res = await jsonRequest(app, 'POST', '/api/auth/signup', {
      email: 'not-an-email',
      password: 'secret123',
      fullName: 'Jordan',
    })

    expect(res.status).toBe(400)
  })

  it('400 - refuse si mot de passe trop court', async () => {
    const res = await jsonRequest(app, 'POST', '/api/auth/signup', {
      email: 'test@mail.com',
      password: '123',
      fullName: 'Jordan',
    })

    expect(res.status).toBe(400)
  })

  it('400 - refuse si fullName manquant', async () => {
    const res = await jsonRequest(app, 'POST', '/api/auth/signup', {
      email: 'test@mail.com',
      password: 'secret123',
    })

    expect(res.status).toBe(400)
  })

  it('400 - refuse si body vide', async () => {
    const res = await jsonRequest(app, 'POST', '/api/auth/signup', {})
    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  it('200 - retourne un token avec des identifiants valides', async () => {
    const user = {
      _id: { toString: () => 'uid-123' },
      email: 'test@mail.com',
      checkPassword: vi.fn().mockResolvedValue(true),
    }
    mockUser.findOne.mockResolvedValue(user)

    const res = await jsonRequest(app, 'POST', '/api/auth/login', {
      email: 'test@mail.com',
      password: 'secret123',
    })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.token).toBeDefined()
    expect(json.data.email).toBe('test@mail.com')
    // Vérifie que le cookie est set
    const cookie = res.headers.get('set-cookie')
    expect(cookie).toContain('admin_session=')
  })

  it('401 - refuse avec un mauvais mot de passe', async () => {
    const user = {
      _id: { toString: () => 'uid-123' },
      email: 'test@mail.com',
      checkPassword: vi.fn().mockResolvedValue(false),
    }
    mockUser.findOne.mockResolvedValue(user)

    const res = await jsonRequest(app, 'POST', '/api/auth/login', {
      email: 'test@mail.com',
      password: 'wrong',
    })

    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.success).toBe(false)
  })

  it('401 - refuse avec un email inexistant', async () => {
    mockUser.findOne.mockResolvedValue(null)

    const res = await jsonRequest(app, 'POST', '/api/auth/login', {
      email: 'no@user.com',
      password: 'secret123',
    })

    expect(res.status).toBe(401)
  })

  it('400 - refuse si email invalide', async () => {
    const res = await jsonRequest(app, 'POST', '/api/auth/login', {
      email: 'invalid',
      password: 'secret123',
    })

    expect(res.status).toBe(400)
  })

  it('400 - refuse si password manquant', async () => {
    const res = await jsonRequest(app, 'POST', '/api/auth/login', {
      email: 'test@mail.com',
    })

    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/logout', () => {
  it('200 - supprime le cookie de session', async () => {
    const res = await jsonRequest(app, 'POST', '/api/auth/logout')

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    const cookie = res.headers.get('set-cookie')
    expect(cookie).toContain('Max-Age=0')
  })
})

describe('GET /api/auth/me', () => {
  it('200 - retourne le profil avec un token valide', async () => {
    const token = await signToken('uid-123')
    const user = { _id: 'uid-123', email: 'test@mail.com', fullName: 'Jordan' }
    mockUser.findById.mockReturnValue({
      select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(user) }),
    })

    const res = await authRequest(app, 'GET', '/api/auth/me', token)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.email).toBe('test@mail.com')
  })

  it('401 - refuse sans token', async () => {
    const res = await jsonRequest(app, 'GET', '/api/auth/me')

    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.success).toBe(false)
  })

  it('401 - refuse avec un token invalide', async () => {
    const res = await authRequest(app, 'GET', '/api/auth/me', 'bad-token')

    expect(res.status).toBe(401)
  })

  it('401 - refuse si utilisateur supprimé', async () => {
    const token = await signToken('deleted-uid')
    mockUser.findById.mockReturnValue({
      select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(null) }),
    })

    const res = await authRequest(app, 'GET', '/api/auth/me', token)
    expect(res.status).toBe(401)
  })
})
