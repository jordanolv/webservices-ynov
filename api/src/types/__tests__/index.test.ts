import { describe, it, expect } from 'vitest'
import { AppError, NotFoundError } from '../index.js'

describe('AppError', () => {
  it('sets statusCode and message', () => {
    const err = new AppError(400, 'Bad request')
    expect(err.statusCode).toBe(400)
    expect(err.message).toBe('Bad request')
  })

  it('extends Error', () => {
    const err = new AppError(500, 'Oops')
    expect(err).toBeInstanceOf(Error)
  })
})

describe('NotFoundError', () => {
  it('sets statusCode 404 and formats message', () => {
    const err = new NotFoundError('Produit')
    expect(err.statusCode).toBe(404)
    expect(err.message).toBe('Produit introuvable')
  })

  it('extends AppError', () => {
    const err = new NotFoundError('X')
    expect(err).toBeInstanceOf(AppError)
    expect(err).toBeInstanceOf(Error)
  })
})
