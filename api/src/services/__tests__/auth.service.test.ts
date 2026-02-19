import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AppError } from '../../types/index.js'

const { mockUser } = vi.hoisted(() => ({
  mockUser: {
    findOne: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  },
}))

vi.mock('../../db/models/user.js', () => ({ User: mockUser }))
vi.mock('../../middleware/auth.js', () => ({
  signToken: vi.fn().mockResolvedValue('mock-token'),
  verifyToken: vi.fn(),
  COOKIE: 'admin_session',
  getToken: vi.fn(),
  authMiddleware: vi.fn(),
}))

import * as service from '../auth.service.js'
import { verifyToken } from '../../middleware/auth.js'

beforeEach(() => vi.clearAllMocks())

describe('auth.service', () => {
  describe('signup', () => {
    it('creates a new user with normalized email', async () => {
      mockUser.findOne.mockResolvedValue(null)
      mockUser.create.mockResolvedValue({})

      await service.signup({ email: 'Test@Mail.COM', password: 'secret123', fullName: 'Jordan' })

      expect(mockUser.findOne).toHaveBeenCalledWith({ email: 'test@mail.com' })
      expect(mockUser.create).toHaveBeenCalledWith({
        email: 'test@mail.com',
        password: 'secret123',
        fullName: 'Jordan',
      })
    })

    it('throws AppError if email already exists', async () => {
      mockUser.findOne.mockResolvedValue({ email: 'test@mail.com' })

      await expect(
        service.signup({ email: 'test@mail.com', password: 'secret123', fullName: 'Jordan' })
      ).rejects.toThrow(AppError)
    })
  })

  describe('login', () => {
    it('returns token on valid credentials', async () => {
      const user = { _id: { toString: () => 'uid' }, email: 'test@mail.com', checkPassword: vi.fn().mockResolvedValue(true) }
      mockUser.findOne.mockResolvedValue(user)

      const result = await service.login({ email: 'test@mail.com', password: 'secret123' })

      expect(result.token).toBe('mock-token')
      expect(result.email).toBe('test@mail.com')
    })

    it('throws AppError on wrong password', async () => {
      const user = { checkPassword: vi.fn().mockResolvedValue(false) }
      mockUser.findOne.mockResolvedValue(user)

      await expect(service.login({ email: 'test@mail.com', password: 'bad' })).rejects.toThrow(AppError)
    })

    it('throws AppError if user not found', async () => {
      mockUser.findOne.mockResolvedValue(null)

      await expect(service.login({ email: 'no@user.com', password: 'x' })).rejects.toThrow(AppError)
    })
  })

  describe('getMe', () => {
    it('returns user data for valid token', async () => {
      vi.mocked(verifyToken).mockResolvedValue({ userId: 'uid' })
      const user = { _id: 'uid', email: 'test@mail.com', fullName: 'Jordan' }
      mockUser.findById.mockReturnValue({ select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(user) }) })

      const result = await service.getMe('valid-token')
      expect(result.email).toBe('test@mail.com')
    })

    it('throws AppError for expired token', async () => {
      vi.mocked(verifyToken).mockResolvedValue(null)

      await expect(service.getMe('expired')).rejects.toThrow(AppError)
    })

    it('throws AppError if user not found', async () => {
      vi.mocked(verifyToken).mockResolvedValue({ userId: 'uid' })
      mockUser.findById.mockReturnValue({ select: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(null) }) })

      await expect(service.getMe('token')).rejects.toThrow(AppError)
    })
  })
})
