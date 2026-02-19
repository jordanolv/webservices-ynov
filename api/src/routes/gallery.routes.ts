import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { authMiddleware } from '../middleware/auth.js'
import { reorderSchema } from '../validators/gallery.js'
import * as ctrl from '../controllers/gallery.controller.js'

const router = new Hono()

router.get('/', ctrl.list)
router.post('/', authMiddleware, ctrl.create)
router.put('/reorder', authMiddleware, zValidator('json', reorderSchema), ctrl.reorder)
router.delete('/:id', authMiddleware, ctrl.remove)

export default router
