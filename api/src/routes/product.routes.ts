import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { authMiddleware } from '../middleware/auth.js'
import { productSchema, productUpdateSchema } from '../validators/product.js'
import * as ctrl from '../controllers/product.controller.js'

const router = new Hono()

// Public
router.get('/', ctrl.list)
router.get('/:id', ctrl.getPublic)

// Admin
router.get('/admin/all', authMiddleware, ctrl.listAdmin)
router.get('/admin/:id', authMiddleware, ctrl.getAdmin)
router.post('/', authMiddleware, zValidator('json', productSchema), ctrl.create)
router.put('/:id', authMiddleware, zValidator('json', productUpdateSchema), ctrl.update)
router.delete('/:id', authMiddleware, ctrl.remove)
router.post('/:id/images', authMiddleware, ctrl.uploadImage)
router.delete('/:id/images/:filename', authMiddleware, ctrl.deleteImage)

export default router
