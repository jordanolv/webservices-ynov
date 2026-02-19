import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { contactSchema } from '../validators/contact.js'
import * as ctrl from '../controllers/contact.controller.js'

const router = new Hono()

router.post('/', zValidator('json', contactSchema), ctrl.send)

export default router
