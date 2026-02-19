const BASE = process.env.NEXT_PUBLIC_API_URL || ''

export interface SizePrice {
  size: string
  price: number
}

export interface Product {
  _id: string
  name: string
  description: string
  images: string[]
  sizePrices: SizePrice[]
  isActive: boolean
  isBestSeller: boolean
  createdAt?: string
  updatedAt?: string
}

function fullUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${BASE}${path.startsWith('/') ? '' : '/'}${path}`
}

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE}/api/products`)
  if (!res.ok) throw new Error('Erreur chargement produits')
  const json = await res.json()
  const list: Product[] = json.data || []
  return list.map((p: Product) => ({
    ...p,
    images: (p.images || []).map(fullUrl),
  }))
}
