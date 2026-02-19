'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const BASE = process.env.NEXT_PUBLIC_API_URL || ''

export default function NewProduct() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [sizePrices, setSizePrices] = useState<Array<{ size: string; price: string }>>([{ size: '', price: '' }])
  const [isActive, setIsActive] = useState(true)
  const [isBestSeller, setIsBestSeller] = useState(false)
  const [loading, setLoading] = useState(false)

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
      const res = await fetch(`${BASE}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          images: [],
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

  return (
    <div className="mt-6">
      <Link href="/admin/products" className="text-amber-600 hover:underline mb-6 inline-block">
        ← Retour
      </Link>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-100 max-w-xl">
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
          Créer
        </button>
      </form>
    </div>
  )
}
