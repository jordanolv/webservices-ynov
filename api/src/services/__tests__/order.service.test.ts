import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NotFoundError } from '../../types/index.js'

const { mockOrder } = vi.hoisted(() => ({
  mockOrder: {
    find: vi.fn(),
    findById: vi.fn(),
    findOne: vi.fn(),
  },
}))

vi.mock('../../db/models/order.js', () => ({ Order: mockOrder }))

import * as service from '../order.service.js'

beforeEach(() => vi.clearAllMocks())

describe('order.service', () => {
  describe('listAll', () => {
    it('returns all orders sorted by createdAt desc', async () => {
      const orders = [{ orderNumber: 'CMD-001' }]
      mockOrder.find.mockReturnValue({ sort: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(orders) }) })

      const result = await service.listAll()
      expect(result).toEqual(orders)
    })
  })

  describe('findById', () => {
    it('returns order by id', async () => {
      const order = { _id: '1', orderNumber: 'CMD-001' }
      mockOrder.findById.mockReturnValue({ lean: vi.fn().mockResolvedValue(order) })

      const result = await service.findById('1')
      expect(result.orderNumber).toBe('CMD-001')
    })

    it('throws NotFoundError if order not found', async () => {
      mockOrder.findById.mockReturnValue({ lean: vi.fn().mockResolvedValue(null) })

      await expect(service.findById('bad')).rejects.toThrow(NotFoundError)
    })
  })

  describe('findBySessionId', () => {
    it('returns order by Stripe session id', async () => {
      const order = { stripeSessionId: 'cs_123' }
      mockOrder.findOne.mockReturnValue({ lean: vi.fn().mockResolvedValue(order) })

      const result = await service.findBySessionId('cs_123')
      expect(result.stripeSessionId).toBe('cs_123')
    })

    it('throws NotFoundError if not found', async () => {
      mockOrder.findOne.mockReturnValue({ lean: vi.fn().mockResolvedValue(null) })

      await expect(service.findBySessionId('bad')).rejects.toThrow(NotFoundError)
    })
  })
})
