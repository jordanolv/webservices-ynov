import { createMiddleware } from 'hono/factory'
import type { Context } from 'hono'
import { getCookie } from 'hono/cookie'
import { SignJWT, jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-in-prod')
const COOKIE = 'admin_session'

export async function signToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(SECRET)
}

export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    const sub = payload.sub
    return sub ? { userId: sub } : null
  } catch {
    return null
  }
}

/** Récupère le token depuis cookie ou header Authorization */
function getToken(c: Context): string | null {
  const cookie = getCookie(c, COOKIE)
  if (cookie) return cookie
  const auth = c.req.header('Authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7)
  return null
}

export const authMiddleware = createMiddleware(async (c, next) => {
  const token = getToken(c)
  if (!token) return c.json({ success: false, message: 'Non authentifié' }, 401)
  const data = await verifyToken(token)
  if (!data) return c.json({ success: false, message: 'Session expirée' }, 401)
  c.set('userId', data.userId)
  await next()
})

export { COOKIE, getToken }
