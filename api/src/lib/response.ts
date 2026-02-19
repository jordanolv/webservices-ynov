import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

export function success<T>(c: Context, data: T, status: ContentfulStatusCode = 200) {
  return c.json({ success: true, data }, status)
}

export function error(c: Context, message: string, status: ContentfulStatusCode = 400) {
  return c.json({ success: false, message }, status)
}

export function notFound(c: Context, resource: string) {
  return error(c, `${resource} introuvable`, 404)
}
