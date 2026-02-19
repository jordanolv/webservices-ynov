import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mocks ──────────────────────────────────────────────
vi.mock('../../db/models/user.js', () => ({ User: { findOne: vi.fn(), findById: vi.fn(), create: vi.fn() } }))
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

import { createTestApp, jsonRequest } from './helpers.js'
import { sendContact } from '../../lib/mail.js'

const app = createTestApp()

beforeEach(() => vi.clearAllMocks())

// ── Tests ──────────────────────────────────────────────
describe('POST /api/contact', () => {
  const validContact = {
    name: 'Jordan',
    email: 'jordan@test.com',
    subject: 'Question sur un produit',
    message: 'Bonjour, je voudrais savoir...',
  }

  it('200 - envoie un message de contact', async () => {
    vi.mocked(sendContact).mockResolvedValue()

    const res = await jsonRequest(app, 'POST', '/api/contact', validContact)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(sendContact).toHaveBeenCalledWith(validContact)
  })

  it('200 - accepte un numéro de téléphone optionnel', async () => {
    vi.mocked(sendContact).mockResolvedValue()

    const res = await jsonRequest(app, 'POST', '/api/contact', {
      ...validContact,
      phone: '0612345678',
    })

    expect(res.status).toBe(200)
    expect(sendContact).toHaveBeenCalledWith({
      ...validContact,
      phone: '0612345678',
    })
  })

  it('400 - refuse si name manquant', async () => {
    const res = await jsonRequest(app, 'POST', '/api/contact', {
      email: 'test@mail.com',
      subject: 'Test',
      message: 'Hello',
    })

    expect(res.status).toBe(400)
  })

  it('400 - refuse si email invalide', async () => {
    const res = await jsonRequest(app, 'POST', '/api/contact', {
      name: 'Jordan',
      email: 'not-an-email',
      subject: 'Test',
      message: 'Hello',
    })

    expect(res.status).toBe(400)
  })

  it('400 - refuse si subject manquant', async () => {
    const res = await jsonRequest(app, 'POST', '/api/contact', {
      name: 'Jordan',
      email: 'test@mail.com',
      message: 'Hello',
    })

    expect(res.status).toBe(400)
  })

  it('400 - refuse si message manquant', async () => {
    const res = await jsonRequest(app, 'POST', '/api/contact', {
      name: 'Jordan',
      email: 'test@mail.com',
      subject: 'Test',
    })

    expect(res.status).toBe(400)
  })

  it('400 - refuse si body vide', async () => {
    const res = await jsonRequest(app, 'POST', '/api/contact', {})
    expect(res.status).toBe(400)
  })

  it('400 - refuse un message trop long (>5000 chars)', async () => {
    const res = await jsonRequest(app, 'POST', '/api/contact', {
      ...validContact,
      message: 'a'.repeat(5001),
    })

    expect(res.status).toBe(400)
  })

  it('400 - refuse un subject trop long (>200 chars)', async () => {
    const res = await jsonRequest(app, 'POST', '/api/contact', {
      ...validContact,
      subject: 'a'.repeat(201),
    })

    expect(res.status).toBe(400)
  })

  it('400 - refuse un name trop long (>200 chars)', async () => {
    const res = await jsonRequest(app, 'POST', '/api/contact', {
      ...validContact,
      name: 'a'.repeat(201),
    })

    expect(res.status).toBe(400)
  })

  it('500 - gère l\'erreur si l\'envoi de mail échoue', async () => {
    vi.mocked(sendContact).mockRejectedValue(new Error('CONTACT_EMAIL or ADMIN_EMAIL required'))

    const res = await jsonRequest(app, 'POST', '/api/contact', validContact)

    expect(res.status).toBe(500)
  })
})
