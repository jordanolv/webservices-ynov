import { Product } from '../db/models/product.js'
import { NotFoundError } from '../types/index.js'
import { deleteUpload, isSafeFilename, saveUpload, validateImage } from '../lib/upload.js'
import type { CreateProductInput, UpdateProductInput } from '../validators/product.js'

export async function listActive() {
  return Product.find({ isActive: true }).sort({ createdAt: -1 }).lean()
}

export async function listAll() {
  return Product.find().sort({ createdAt: -1 }).lean()
}

export async function findById(id: string, adminAccess = false) {
  const product = await Product.findById(id).lean()
  if (!product) throw new NotFoundError('Produit')
  if (!adminAccess && !product.isActive) throw new NotFoundError('Produit')
  return product
}

export async function create(data: CreateProductInput) {
  return Product.create(data)
}

export async function update(id: string, data: UpdateProductInput) {
  const product = await Product.findByIdAndUpdate(id, data, { new: true })
  if (!product) throw new NotFoundError('Produit')
  return product
}

export async function remove(id: string) {
  const product = await Product.findByIdAndDelete(id)
  if (!product) throw new NotFoundError('Produit')
}

export async function addImage(id: string, file: File) {
  const product = await Product.findById(id)
  if (!product) throw new NotFoundError('Produit')

  const buf = Buffer.from(await file.arrayBuffer())
  const v = validateImage(buf)
  if (!v.ok) throw new Error(v.error)

  const { relativePath } = await saveUpload(buf, 'products', v.ext)
  product.images = product.images || []
  product.images.push(relativePath)
  await product.save()
  return relativePath
}

export async function removeImage(id: string, filename: string) {
  if (!isSafeFilename(filename)) throw new Error('Nom invalide')
  const product = await Product.findById(id)
  if (!product) throw new NotFoundError('Produit')

  const idx = (product.images || []).indexOf(`/uploads/products/${filename}`)
  if (idx === -1) throw new NotFoundError('Image')

  await deleteUpload('products', filename)
  product.images?.splice(idx, 1)
  await product.save()
}
