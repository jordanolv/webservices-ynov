import type { Context } from 'hono'
import * as productService from '../services/product.service.js'
import { success, error } from '../lib/response.js'

export async function list(c: Context) {
  const data = await productService.listActive()
  return success(c, data)
}

export async function listAdmin(c: Context) {
  const data = await productService.listAll()
  return success(c, data)
}

export async function getAdmin(c: Context) {
  const data = await productService.findById(c.req.param('id'), true)
  return success(c, data)
}

export async function getPublic(c: Context) {
  const data = await productService.findById(c.req.param('id'))
  return success(c, data)
}

export async function create(c: Context) {
  const body = c.req.valid('json' as never)
  const data = await productService.create(body)
  return success(c, data, 201)
}

export async function update(c: Context) {
  const body = c.req.valid('json' as never)
  const data = await productService.update(c.req.param('id'), body)
  return success(c, data)
}

export async function remove(c: Context) {
  await productService.remove(c.req.param('id'))
  return success(c, null)
}

export async function uploadImage(c: Context) {
  const formData = await c.req.formData()
  const file = formData.get('file') as File | null
  if (!file) return error(c, 'Aucun fichier', 400)

  const url = await productService.addImage(c.req.param('id'), file)
  return success(c, { url })
}

export async function deleteImage(c: Context) {
  await productService.removeImage(c.req.param('id'), c.req.param('filename'))
  return success(c, null)
}
