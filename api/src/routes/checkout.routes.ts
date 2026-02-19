import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createSessionSchema } from '../validators/checkout.js'
import * as ctrl from '../controllers/checkout.controller.js'

const router = new Hono()

router.post('/create-session', zValidator('json', createSessionSchema), ctrl.createSession)
router.get('/order/:sessionId', ctrl.getOrder)
router.post('/webhook', ctrl.webhook)

export default router
