'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const BASE = process.env.NEXT_PUBLIC_API_URL || ''

function fullUrl(p: string) {
  if (!p || p.startsWith('http')) return p
  return `${BASE}${p}`
}

export default function EditProduct() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<{
    _id: string
    name: string
    description: string
    images: string[]
    sizePrices: Array<{ size: string; price: number }>
    isActive: boolean
    isBestSeller: boolean
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(() => {
    fetch(`${BASE}/api/products/admin/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => setProduct(j.data))
      .catch(() => setProduct(null))
  }, [params.id])

  useEffect(() => {
    load()
  }, [load])

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [sizePrices, setSizePrices] = useState<Array<{ size: string; price: string }>>([])
  const [isActive, setIsActive] = useState(true)
  const [isBestSeller, setIsBestSeller] = useState(false)

  useEffect(() => {
    if (product) {
      setName(product.name)
      setDescription(product.description)
      setSizePrices(product.sizePrices?.length ? product.sizePrices.map((s) => ({ size: s.size, price: String(s.price) })) : [{ size: '', price: '' }])
      setIsActive(product.isActive)
      setIsBestSeller(product.isBestSeller)
    }
  }, [product])

  const addSize = () => setSizePrices((s) => [...s, { size: '', price: '' }])
  const updateSize = (i: number, f: 'size' | 'price', v: string) => {
    setSizePrices((s) => s.map((x, j) => (j === i ? { ...x, [f]: v } : x)))
  }
  const removeSize = (i: number) => setSizePrices((s) => s.filter((_, j) => j !== i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const sp = sizePrices
      .filter((x) => x.size.trim() && x.price.trim())
      .map((x) => ({ size: x.size.trim(), price: parseFloat(x.price) }))
    if (sp.length === 0) {
      alert('Ajoutez au moins une taille/prix')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/api/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          sizePrices: sp,
          isActive,
          isBestSeller,
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      router.push('/admin/products')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 Mo

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_FILE_SIZE) {
      alert('Fichier trop volumineux. Max 20 Mo par image.')
      e.target.value = ''
      return
    }
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`${BASE}/api/products/${params.id}/images`, {
      method: 'POST',
      credentials: 'include',
      body: fd,
    })
    const json = await res.json()
    if (!json.success) throw new Error(json.message)
    load()
    e.target.value = ''
  }

  if (!product) return <div className="text-gray-500">Chargement...</div>

  return (
    <div className="mt-6">
      <Link href="/admin/products" className="text-amber-600 hover:underline mb-6 inline-block">
        ← Retour
      </Link>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-100 max-w-xl mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            rows={3}
          />
        </div>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Tailles / Prix</label>
            <button type="button" onClick={addSize} className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              + Ajouter
            </button>
          </div>
          {sizePrices.map((s, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                placeholder="Taille"
                value={s.size}
                onChange={(e) => updateSize(i, 'size', e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <input
                placeholder="Prix"
                type="number"
                step="0.01"
                value={s.price}
                onChange={(e) => updateSize(i, 'price', e.target.value)}
                className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => removeSize(i)}
                className="text-red-600 hover:text-red-700 px-2 flex items-center justify-center"
                aria-label="Supprimer"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
            />
            <span className="text-sm text-gray-700">Actif</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isBestSeller}
              onChange={(e) => setIsBestSeller(e.target.checked)}
              className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
            />
            <span className="text-sm text-gray-700">Best-seller</span>
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
        >
          Enregistrer
        </button>
      </form>
      <div className="bg-white p-6 rounded-lg border border-gray-100 max-w-xl">
        <h2 className="font-medium mb-2">Images</h2>
        <p className="text-sm text-gray-500 mb-4">Max 20 Mo par image.</p>
        <div className="flex flex-wrap gap-4 mb-4">
          {product.images?.map((url) => {
            const filename = url.split('/').pop() || ''
            return (
              <div key={url} className="relative group">
                <Image src={fullUrl(url)} alt="" width={80} height={80} className="rounded object-cover" />
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm('Supprimer cette image ?')) return
                    const res = await fetch(`${BASE}/api/products/${params.id}/images/${filename}`, {
                      method: 'DELETE',
                      credentials: 'include',
                    })
                    const json = await res.json()
                    if (!json.success) alert(json.message)
                    else load()
                  }}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded opacity-0 group-hover:opacity-100"
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>
        <label className="inline-block px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 text-gray-700 font-medium transition-colors">
          Ajouter une image
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>
      </div>
    </div>
  )
}
