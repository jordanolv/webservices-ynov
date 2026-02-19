'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAuthHeaders } from '@/services/api'

const BASE = process.env.NEXT_PUBLIC_API_URL || ''

async function fetchApi<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${BASE}${endpoint}`, {
    credentials: 'include',
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error('Erreur')
  const json = await res.json()
  return json.data
}

const entities = [
  { name: 'Produits', desc: 'Gestion de la boutique', href: '/admin/products', cta: 'Gérer', icon: '🛍️', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  { name: 'Galerie', desc: 'Images de la galerie', href: '/admin/gallery', cta: 'Gérer', icon: '📸', bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
  { name: 'Commandes', desc: 'Gestion des commandes', href: '/admin/orders', cta: 'Gérer', icon: '📦', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, gallery: 0, orders: 0 })

  useEffect(() => {
    Promise.all([
      fetchApi<unknown[]>('/api/products/admin/all').then((d) => d?.length ?? 0),
      fetchApi<unknown[]>('/api/gallery').then((d) => d?.length ?? 0),
      fetchApi<unknown[]>('/api/orders').then((d) => d?.length ?? 0),
    ]).then(([products, gallery, orders]) => setStats({ products, gallery, orders }))
  }, [])

  return (
    <div className="mt-6">
      {/* Stats en grille compacte */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-100 p-4 flex justify-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🛍️</span>
            </div>
            <p className="text-xl font-semibold text-gray-900">{stats.products}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-4 flex justify-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg">📸</span>
            </div>
            <p className="text-xl font-semibold text-gray-900">{stats.gallery}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-4 flex justify-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg">📦</span>
            </div>
            <p className="text-xl font-semibold text-gray-900">{stats.orders}</p>
          </div>
        </div>
      </div>

      {/* Actions rapides — juste sous les 3 stats, sur une ligne */}
      <div className="bg-white rounded-lg border border-gray-100 p-4 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Actions Rapides</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/admin/products/new" className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-lg">➕</span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">New Product</p>
              <p className="text-xs text-gray-500 truncate">Ajouter un produit</p>
            </div>
          </Link>
          <Link href="/admin/gallery" className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-lg">📸</span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">New Image</p>
              <p className="text-xs text-gray-500 truncate">Ajouter une image</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Sections principales en grille */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {entities.map((e, i) => {
          const count = [stats.products, stats.gallery, stats.orders][i]
          return (
            <Link
              key={e.name}
              href={e.href}
              className={`group rounded-lg bg-white border-2 ${e.border} hover:border-opacity-60 transition-all duration-200`}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 ${e.bg} rounded-lg flex items-center justify-center`}>
                    <span className="text-xl">{e.icon}</span>
                  </div>
                  <span className={`text-xl font-bold ${e.text}`}>{count}</span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">{e.name}</h3>
                <p className="text-xs text-gray-600 mb-3">{e.desc}</p>
                <span className="text-xs font-medium text-gray-500 group-hover:text-gray-700 flex items-center gap-1">
                  {e.cta} <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
