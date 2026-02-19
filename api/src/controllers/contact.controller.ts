import type { Context } from 'hono'
import * as contactService from '../services/contact.service.js'
import { success } from '../lib/response.js'

export async function send(c: Context) {
  const body = c.req.valid('json' as never)
  await contactService.send(body)
  return success(c, null)
}
