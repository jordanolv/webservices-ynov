const BASE = process.env.NEXT_PUBLIC_API_URL || ''

export interface GalleryImage {
  _id: string
  imageUrl: string
  createdAt: string
  alt?: string
  title?: string
}

function fullUrl(path: string): string {
  if (!path || path.startsWith('http')) return path
  return `${BASE}${path.startsWith('/') ? '' : '/'}${path}`
}

export async function getGalleryImages(): Promise<GalleryImage[]> {
  const res = await fetch(`${BASE}/api/gallery`)
  if (!res.ok) throw new Error('Erreur chargement galerie')
  const json = await res.json()
  const list = (json.data || []).filter((x: { imageUrl?: string }) => x.imageUrl)
  return list.map((x: { _id: string; imageUrl: string; createdAt?: string; alt?: string; title?: string }) => ({
    _id: x._id,
    imageUrl: fullUrl(x.imageUrl),
    createdAt: x.createdAt || new Date().toISOString(),
    alt: x.alt,
    title: x.title,
  }))
}
