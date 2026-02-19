import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NotFoundError } from '../../types/index.js'

const { mockGallery } = vi.hoisted(() => ({
  mockGallery: {
    find: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
}))

vi.mock('../../db/models/gallery.js', () => ({ Gallery: mockGallery }))
vi.mock('../../lib/upload.js', () => ({
  validateImage: vi.fn(),
  saveUpload: vi.fn(),
}))

import * as service from '../gallery.service.js'
import { validateImage, saveUpload } from '../../lib/upload.js'

beforeEach(() => vi.clearAllMocks())

describe('gallery.service', () => {
  describe('listAll', () => {
    it('returns images sorted by order then createdAt', async () => {
      const images = [{ imageUrl: '/img.jpg' }]
      mockGallery.find.mockReturnValue({
        sort: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(images) }),
      })

      const result = await service.listAll()
      expect(result).toEqual(images)
    })
  })

  describe('create', () => {
    it('validates, saves file and creates document', async () => {
      vi.mocked(validateImage).mockReturnValue({ ok: true, ext: '.jpg' })
      vi.mocked(saveUpload).mockResolvedValue({ filename: 'a.jpg', relativePath: '/uploads/gallery/a.jpg' })
      mockGallery.create.mockResolvedValue({ imageUrl: '/uploads/gallery/a.jpg', order: 0 })

      const file = new File([new Uint8Array([0xff, 0xd8, 0xff])], 'test.jpg')
      const result = await service.create(file, 0)

      expect(result.imageUrl).toBe('/uploads/gallery/a.jpg')
    })

    it('throws if validation fails', async () => {
      vi.mocked(validateImage).mockReturnValue({ ok: false, error: 'Format invalide' })

      const file = new File([new Uint8Array([0x00])], 'bad.bin')
      await expect(service.create(file, 0)).rejects.toThrow('Format invalide')
    })
  })

  describe('reorder', () => {
    it('updates order for each id', async () => {
      mockGallery.findByIdAndUpdate.mockResolvedValue({})

      await service.reorder(['a', 'b', 'c'])

      expect(mockGallery.findByIdAndUpdate).toHaveBeenCalledTimes(3)
      expect(mockGallery.findByIdAndUpdate).toHaveBeenCalledWith('a', { order: 0 })
      expect(mockGallery.findByIdAndUpdate).toHaveBeenCalledWith('b', { order: 1 })
      expect(mockGallery.findByIdAndUpdate).toHaveBeenCalledWith('c', { order: 2 })
    })
  })

  describe('remove', () => {
    it('deletes gallery image', async () => {
      mockGallery.findByIdAndDelete.mockResolvedValue({ _id: '1' })

      await service.remove('1')
      expect(mockGallery.findByIdAndDelete).toHaveBeenCalledWith('1')
    })

    it('throws NotFoundError if not found', async () => {
      mockGallery.findByIdAndDelete.mockResolvedValue(null)

      await expect(service.remove('bad')).rejects.toThrow(NotFoundError)
    })
  })
})
