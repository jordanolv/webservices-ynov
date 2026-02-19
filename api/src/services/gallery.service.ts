import { Gallery } from '../db/models/gallery.js'
import { NotFoundError } from '../types/index.js'
import { saveUpload, validateImage } from '../lib/upload.js'

export async function listAll() {
  return Gallery.find().sort({ order: 1, createdAt: -1 }).lean()
}

export async function create(file: File, order: number) {
  const buf = Buffer.from(await file.arrayBuffer())
  const v = validateImage(buf)
  if (!v.ok) throw new Error(v.error)

  const { relativePath } = await saveUpload(buf, 'gallery', v.ext)
  return Gallery.create({ imageUrl: relativePath, order })
}

export async function reorder(ids: string[]) {
  await Promise.all(ids.map((id, i) => Gallery.findByIdAndUpdate(id, { order: i })))
}

export async function remove(id: string) {
  const doc = await Gallery.findByIdAndDelete(id)
  if (!doc) throw new NotFoundError('Image')
}
