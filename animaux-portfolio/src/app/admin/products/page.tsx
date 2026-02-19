'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil, Trash2, ImageOff } from 'lucide-react'
import { getAuthHeaders } from '@/services/api'

const BASE = process.env.NEXT_PUBLIC_API_URL || ''

async function fetchApi<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${endpoint}`, { ...init, credentials: 'include', headers: { ...getAuthHeaders(), ...(init?.headers as object) } })
  if (!res.ok) throw new Error('Erreur')
  const json = await res.json()
  return json.data
}

interface Product {
  _id: string
  name: string
  images: string[]
  isActive: boolean
  isBestSeller: boolean
  sizePrices: Array<{ size: string; price: number }>
}

function fullUrl(p: string) {
  if (!p || p.startsWith('http')) return p
  return `${BASE}${p}`
}

export default function AdminProducts() {
  const [list, setList] = useState<Product[]>([])

  useEffect(() => {
    fetchApi<Product[]>('/api/products/admin/all').then(setList)
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return
    await fetchApi(`/api/products/${id}`, { method: 'DELETE' })
    setList((l) => l.filter((p) => p._id !== id))
  }

  return (
    <div>
      <div className="flex justify-end mb-6 mt-6">
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouveau
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <p className="text-gray-500 mb-4">Aucun produit pour le moment.</p>
          <Link href="/admin/products/new" className="text-amber-600 hover:underline font-medium">
            Créer un produit
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((p) => (
            <div key={p._id} className="bg-white rounded-lg border border-gray-100 p-4 hover:border-gray-200 transition-colors">
              <div className="flex gap-4">
                {/* Image */}
                <div className="flex-shrink-0">
                  {p.images?.[0] ? (
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                      <Image src={fullUrl(p.images[0])} alt="" width={80} height={80} className="object-cover w-full h-full" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                      <ImageOff className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">{p.name}</h3>
                    <div className="flex flex-wrap gap-1 flex-shrink-0">
                      {!p.isActive && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700">
                          Inactif
                        </span>
                      )}
                      {p.isBestSeller && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700">
                          Best-seller
                        </span>
                      )}
                      {p.isActive && !p.isBestSeller && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">
                          Actif
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tailles / Prix */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Tailles / Prix</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {p.sizePrices?.length
                        ? p.sizePrices.map((s) => (
                            <span key={s.size} className="text-gray-700">
                              <span className="text-gray-500 text-sm">T.{s.size}</span> {s.price}€
                            </span>
                          ))
                        : <span className="text-gray-400">—</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                    <Link
                      href={`/admin/products/${p._id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700"
                    >
                      <Pencil className="h-4 w-4" />
                      Modifier
                    </Link>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
