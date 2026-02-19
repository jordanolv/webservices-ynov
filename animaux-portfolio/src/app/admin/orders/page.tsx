'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { getAuthHeaders } from '@/services/api'

const BASE = process.env.NEXT_PUBLIC_API_URL || ''

interface Order {
  _id: string
  orderNumber: string
  status: string
  customer: { name: string; email: string }
  totalAmount: number
  createdAt: string
}

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700',
    paid: 'bg-green-50 text-green-700',
    processing: 'bg-blue-50 text-blue-700',
    shipped: 'bg-purple-50 text-purple-700',
    delivered: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-50 text-red-700',
    refunded: 'bg-gray-50 text-gray-600',
  }
  const label = status.charAt(0).toUpperCase() + status.slice(1)
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {label}
    </span>
  )
}

export default function AdminOrders() {
  const [list, setList] = useState<Order[]>([])

  useEffect(() => {
    fetch(`${BASE}/api/orders`, { credentials: 'include', headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((j) => setList(j.data || []))
  }, [])

  return (
    <div className="mt-6">
      {list.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
          <p className="text-gray-500">Aucune commande pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((o) => (
            <div
              key={o._id}
              className="bg-white rounded-lg border border-gray-100 p-4 hover:border-gray-200 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">{o.orderNumber}</span>
                    {statusBadge(o.status)}
                    <span className="text-sm text-gray-500">
                      {new Date(o.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{o.customer.name}</p>
                  <p className="text-xs text-gray-500">{o.customer.email}</p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <span className="font-semibold text-gray-900">{o.totalAmount.toFixed(2)}€</span>
                  <Link
                    href={`/admin/orders/${o._id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
                  >
                    Voir
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
