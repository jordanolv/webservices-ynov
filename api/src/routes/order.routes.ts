import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth.js'
import * as ctrl from '../controllers/order.controller.js'

const router = new Hono()

router.get('/', authMiddleware, ctrl.list)
router.get('/:id', authMiddleware, ctrl.getById)

export default router
