import type { Context } from 'hono'
import * as galleryService from '../services/gallery.service.js'
import { success, error } from '../lib/response.js'

export async function list(c: Context) {
  const data = await galleryService.listAll()
  return success(c, data)
}

export async function create(c: Context) {
  const formData = await c.req.formData()
  const file = formData.get('file') as File | null
  const order = parseInt(formData.get('order') as string || '0', 10)

  if (!file) return error(c, 'Aucun fichier', 400)
  const data = await galleryService.create(file, order)
  return success(c, data, 201)
}

export async function reorder(c: Context) {
  const { ids } = c.req.valid('json' as never) as { ids: string[] }
  await galleryService.reorder(ids)
  return success(c, null)
}

export async function remove(c: Context) {
  await galleryService.remove(c.req.param('id'))
  return success(c, null)
}
