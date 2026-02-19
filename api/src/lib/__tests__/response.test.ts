import { describe, it, expect, vi } from 'vitest'
import { success, error, notFound } from '../response.js'

function mockContext() {
  return {
    json: vi.fn().mockImplementation((body, status) => ({ body, status })),
  } as unknown as Parameters<typeof success>[0]
}

describe('response helpers', () => {
  describe('success', () => {
    it('returns { success: true, data } with 200 by default', () => {
      const c = mockContext()
      success(c, { id: 1 })

      expect(c.json).toHaveBeenCalledWith({ success: true, data: { id: 1 } }, 200)
    })

    it('supports custom status code', () => {
      const c = mockContext()
      success(c, null, 201)

      expect(c.json).toHaveBeenCalledWith({ success: true, data: null }, 201)
    })
  })

  describe('error', () => {
    it('returns { success: false, message } with 400 by default', () => {
      const c = mockContext()
      error(c, 'Bad input')

      expect(c.json).toHaveBeenCalledWith({ success: false, message: 'Bad input' }, 400)
    })

    it('supports custom status code', () => {
      const c = mockContext()
      error(c, 'Unauthorized', 401)

      expect(c.json).toHaveBeenCalledWith({ success: false, message: 'Unauthorized' }, 401)
    })
  })

  describe('notFound', () => {
    it('returns 404 with resource name', () => {
      const c = mockContext()
      notFound(c, 'Produit')

      expect(c.json).toHaveBeenCalledWith({ success: false, message: 'Produit introuvable' }, 404)
    })
  })
})
