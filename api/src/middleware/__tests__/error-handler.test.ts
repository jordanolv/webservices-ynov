import { describe, it, expect, vi } from 'vitest'
import { errorHandler } from '../error-handler.js'
import { AppError, NotFoundError } from '../../types/index.js'

function mockContext() {
  const c = {
    json: vi.fn().mockReturnValue('response'),
  }
  return c as unknown as Parameters<typeof errorHandler>[1]
}

describe('errorHandler', () => {
  it('handles AppError with correct status and message', async () => {
    const c = mockContext()
    const result = await errorHandler(new AppError(400, 'Champ invalide'), c)

    expect(c.json).toHaveBeenCalledWith({ success: false, message: 'Champ invalide' }, 400)
    expect(result).toBe('response')
  })

  it('handles NotFoundError as 404', async () => {
    const c = mockContext()
    await errorHandler(new NotFoundError('Produit'), c)

    expect(c.json).toHaveBeenCalledWith({ success: false, message: 'Produit introuvable' }, 404)
  })

  it('handles generic Error as 500', async () => {
    const c = mockContext()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await errorHandler(new Error('boom'), c)

    expect(c.json).toHaveBeenCalledWith({ success: false, message: 'Erreur interne du serveur' }, 500)
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })
})
