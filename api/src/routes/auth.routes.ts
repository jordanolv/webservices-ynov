import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { loginSchema, signupSchema } from '../validators/auth.js'
import * as ctrl from '../controllers/auth.controller.js'

const router = new Hono()

router.post('/signup', zValidator('json', signupSchema), ctrl.signup)
router.post('/login', zValidator('json', loginSchema), ctrl.login)
router.post('/logout', ctrl.logout)
router.get('/me', ctrl.me)

export default router
