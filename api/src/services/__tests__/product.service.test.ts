import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NotFoundError } from '../../types/index.js'

const { mockProduct } = vi.hoisted(() => ({
  mockProduct: {
    find: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
    create: vi.fn(),
  },
}))

vi.mock('../../db/models/product.js', () => ({ Product: mockProduct }))
vi.mock('../../lib/upload.js', () => ({
  validateImage: vi.fn(),
  saveUpload: vi.fn(),
  deleteUpload: vi.fn(),
  isSafeFilename: vi.fn(),
}))

import * as service from '../product.service.js'
import { validateImage, saveUpload, deleteUpload, isSafeFilename } from '../../lib/upload.js'

beforeEach(() => vi.clearAllMocks())

describe('product.service', () => {
  describe('listActive', () => {
    it('queries active products sorted by createdAt desc', async () => {
      const sorted = { lean: vi.fn().mockResolvedValue([{ name: 'A' }]) }
      const found = { sort: vi.fn().mockReturnValue(sorted) }
      mockProduct.find.mockReturnValue(found)

      const result = await service.listActive()

      expect(mockProduct.find).toHaveBeenCalledWith({ isActive: true })
      expect(found.sort).toHaveBeenCalledWith({ createdAt: -1 })
      expect(result).toEqual([{ name: 'A' }])
    })
  })

  describe('listAll', () => {
    it('queries all products', async () => {
      const sorted = { lean: vi.fn().mockResolvedValue([]) }
      mockProduct.find.mockReturnValue({ sort: vi.fn().mockReturnValue(sorted) })

      await service.listAll()
      expect(mockProduct.find).toHaveBeenCalledWith()
    })
  })

  describe('findById', () => {
    it('returns an active product', async () => {
      const product = { _id: '1', name: 'Test', isActive: true }
      mockProduct.findById.mockReturnValue({ lean: vi.fn().mockResolvedValue(product) })

      const result = await service.findById('1')
      expect(result).toEqual(product)
    })

    it('throws NotFoundError if product does not exist', async () => {
      mockProduct.findById.mockReturnValue({ lean: vi.fn().mockResolvedValue(null) })

      await expect(service.findById('bad')).rejects.toThrow(NotFoundError)
    })

    it('throws NotFoundError for inactive product in public mode', async () => {
      const product = { _id: '1', isActive: false }
      mockProduct.findById.mockReturnValue({ lean: vi.fn().mockResolvedValue(product) })

      await expect(service.findById('1')).rejects.toThrow(NotFoundError)
    })

    it('returns inactive product in admin mode', async () => {
      const product = { _id: '1', isActive: false }
      mockProduct.findById.mockReturnValue({ lean: vi.fn().mockResolvedValue(product) })

      const result = await service.findById('1', true)
      expect(result).toEqual(product)
    })
  })

  describe('create', () => {
    it('creates a product', async () => {
      const data = { name: 'New', description: 'Desc', images: [], sizePrices: [{ size: 'A', price: 10 }] }
      mockProduct.create.mockResolvedValue({ ...data, _id: '1' })

      const result = await service.create(data)
      expect(mockProduct.create).toHaveBeenCalledWith(data)
      expect(result._id).toBe('1')
    })
  })

  describe('update', () => {
    it('updates and returns product', async () => {
      mockProduct.findByIdAndUpdate.mockResolvedValue({ _id: '1', name: 'Updated' })

      const result = await service.update('1', { name: 'Updated' })
      expect(result.name).toBe('Updated')
    })

    it('throws NotFoundError if product not found', async () => {
      mockProduct.findByIdAndUpdate.mockResolvedValue(null)

      await expect(service.update('bad', { name: 'X' })).rejects.toThrow(NotFoundError)
    })
  })

  describe('remove', () => {
    it('deletes a product', async () => {
      mockProduct.findByIdAndDelete.mockResolvedValue({ _id: '1' })

      await service.remove('1')
      expect(mockProduct.findByIdAndDelete).toHaveBeenCalledWith('1')
    })

    it('throws NotFoundError if product not found', async () => {
      mockProduct.findByIdAndDelete.mockResolvedValue(null)

      await expect(service.remove('bad')).rejects.toThrow(NotFoundError)
    })
  })

  describe('addImage', () => {
    it('validates, saves and pushes image', async () => {
      const product = { _id: '1', images: [], save: vi.fn() }
      mockProduct.findById.mockResolvedValue(product)
      vi.mocked(validateImage).mockReturnValue({ ok: true, ext: '.jpg' })
      vi.mocked(saveUpload).mockResolvedValue({ filename: 'a.jpg', relativePath: '/uploads/products/a.jpg' })

      const file = new File([new Uint8Array([0xff, 0xd8, 0xff])], 'test.jpg')
      const url = await service.addImage('1', file)

      expect(url).toBe('/uploads/products/a.jpg')
      expect(product.images).toContain('/uploads/products/a.jpg')
      expect(product.save).toHaveBeenCalled()
    })

    it('throws if validation fails', async () => {
      mockProduct.findById.mockResolvedValue({ _id: '1' })
      vi.mocked(validateImage).mockReturnValue({ ok: false, error: 'Format invalide' })

      const file = new File([new Uint8Array([0x00])], 'bad.bin')
      await expect(service.addImage('1', file)).rejects.toThrow('Format invalide')
    })
  })

  describe('removeImage', () => {
    it('deletes image from disk and removes from array', async () => {
      const product = { _id: '1', images: ['/uploads/products/a.jpg'], save: vi.fn() }
      mockProduct.findById.mockResolvedValue(product)
      vi.mocked(isSafeFilename).mockReturnValue(true)
      vi.mocked(deleteUpload).mockResolvedValue()

      await service.removeImage('1', 'a.jpg')

      expect(deleteUpload).toHaveBeenCalledWith('products', 'a.jpg')
      expect(product.images).toHaveLength(0)
      expect(product.save).toHaveBeenCalled()
    })

    it('throws if filename is unsafe', async () => {
      vi.mocked(isSafeFilename).mockReturnValue(false)

      await expect(service.removeImage('1', '../etc/passwd')).rejects.toThrow('Nom invalide')
    })

    it('throws NotFoundError if image not in product', async () => {
      const product = { _id: '1', images: ['/uploads/products/b.jpg'], save: vi.fn() }
      mockProduct.findById.mockResolvedValue(product)
      vi.mocked(isSafeFilename).mockReturnValue(true)

      await expect(service.removeImage('1', 'a.jpg')).rejects.toThrow(NotFoundError)
    })
  })
})
