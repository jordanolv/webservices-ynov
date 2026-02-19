import type { Context } from 'hono'
import { AppError } from '../types/index.js'

export async function errorHandler(err: Error, c: Context) {
  if (err instanceof AppError) {
    return c.json({ success: false, message: err.message }, err.statusCode as 400)
  }

  console.error('[API Error]', err)
  return c.json({ success: false, message: 'Erreur interne du serveur' }, 500)
}
