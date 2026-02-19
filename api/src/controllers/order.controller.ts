import type { Context } from 'hono'
import * as orderService from '../services/order.service.js'
import { success } from '../lib/response.js'

export async function list(c: Context) {
  const data = await orderService.listAll()
  return success(c, data)
}

export async function getById(c: Context) {
  const data = await orderService.findById(c.req.param('id'))
  return success(c, data)
}
