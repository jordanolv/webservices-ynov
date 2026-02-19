'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const BASE = process.env.NEXT_PUBLIC_API_URL || ''

interface Order {
  orderNumber: string
  status: string
  customer: { name: string; email: string; phone?: string }
  shippingAddress: { line1: string; line2?: string; city: string; postalCode: string; country: string }
  items: Array<{ productName: string; size: string; quantity: number; unitPrice: number; totalPrice: number }>
  subtotal: number
  shippingCost: number
  totalAmount: number
}

export default function OrderDetail() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetch(`${BASE}/api/orders/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => setOrder(j.data))
  }, [params.id])

  if (!order) return <div className="text-gray-500">Chargement...</div>

  return (
    <div>
      <Link href="/admin/orders" className="text-amber-600 hover:underline mb-4 inline-block">
        ← Retour
      </Link>
      <h1 className="text-2xl font-semibold mb-6">Commande {order.orderNumber}</h1>
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl space-y-6">
        <div>
          <h2 className="font-medium mb-2">Client</h2>
          <p>{order.customer.name}</p>
          <p>{order.customer.email}</p>
          {order.customer.phone && <p>{order.customer.phone}</p>}
        </div>
        <div>
          <h2 className="font-medium mb-2">Adresse de livraison</h2>
          <p>{order.shippingAddress.line1}</p>
          {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
          <p>
            {order.shippingAddress.postalCode} {order.shippingAddress.city}
          </p>
          <p>{order.shippingAddress.country}</p>
        </div>
        <div>
          <h2 className="font-medium mb-2">Articles</h2>
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500">
                <th className="pb-2">Produit</th>
                <th className="pb-2">Taille</th>
                <th className="pb-2">Qté</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2">{it.productName}</td>
                  <td className="py-2">{it.size}</td>
                  <td className="py-2">{it.quantity}</td>
                  <td className="py-2 text-right">{it.totalPrice.toFixed(2)}€</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between text-gray-600">
            <span>Sous-total</span>
            <span>{order.subtotal.toFixed(2)}€</span>
          </div>
          {order.shippingCost > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Frais de port</span>
              <span>{order.shippingCost.toFixed(2)}€</span>
            </div>
          )}
          <div className="flex justify-between font-semibold mt-2">
            <span>Total</span>
            <span>{order.totalAmount.toFixed(2)}€</span>
          </div>
        </div>
      </div>
    </div>
  )
}
