import type { Context } from 'hono'
import * as authService from '../services/auth.service.js'
import { getToken, COOKIE } from '../middleware/auth.js'
import { success, error } from '../lib/response.js'

export async function signup(c: Context) {
  const body = c.req.valid('json' as never)
  await authService.signup(body)
  return success(c, { message: 'Compte créé. Tu peux te connecter.' })
}

export async function login(c: Context) {
  const body = c.req.valid('json' as never)
  const data = await authService.login(body)
  c.header('Set-Cookie', `${COOKIE}=${data.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`)
  return success(c, data)
}

export async function logout(c: Context) {
  c.header('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; Max-Age=0`)
  return success(c, null)
}

export async function me(c: Context) {
  const token = getToken(c)
  if (!token) return error(c, 'Non connecté', 401)
  const data = await authService.getMe(token)
  return success(c, data)
}
