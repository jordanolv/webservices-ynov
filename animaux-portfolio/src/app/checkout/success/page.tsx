'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, Package, Mail, Home, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { api, type Order } from '@/services/api'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setError('Session invalide')
      setLoading(false)
      return
    }

    // Récupérer les détails de la commande
    const fetchOrder = async () => {
      try {
        const orderData = await api.checkout.getOrder(sessionId)
        setOrder(orderData)
      } catch (err) {
        console.error('Erreur récupération commande:', err)
        setError('Impossible de récupérer les détails de votre commande')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Chargement de votre commande...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oups !</h1>
          <p className="text-gray-600 mb-6">{error || 'Commande introuvable'}</p>
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Retour à la boutique
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Animation de succès */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Paiement réussi !
          </h1>
          <p className="text-gray-600 text-lg">
            Merci pour votre commande {order.customer.name} 🎉
          </p>
        </motion.div>

        {/* Détails de la commande */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Package className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Commande #{order.orderNumber}
            </h2>
          </div>

          {/* Articles */}
          <div className="space-y-4 mb-6 border-b pb-6">
            {order.items.map((item, index: number) => (
              <div key={index} className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{item.productName}</p>
                  <p className="text-sm text-gray-600">
                    Taille: {item.size} • Quantité: {item.quantity}
                  </p>
                </div>
                <p className="font-medium text-gray-900">
                  {item.totalPrice.toFixed(2)}€
                </p>
              </div>
            ))}
          </div>

          {/* Totaux */}
          <div className="space-y-2 mb-6 border-b pb-6">
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
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2">
              <span>Total</span>
              <span>{order.totalAmount.toFixed(2)}€</span>
            </div>
          </div>

          {/* Adresse de livraison */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Adresse de livraison</h3>
            <div className="text-gray-600 text-sm">
              <p>{order.customer.name}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>
                {order.shippingAddress.postalCode} {order.shippingAddress.city}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>
        </motion.div>

        {/* Email de confirmation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-50 rounded-xl p-6 mb-6 flex items-start gap-4"
        >
          <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Email de confirmation</h3>
            <p className="text-gray-600 text-sm">
              Un email de confirmation a été envoyé à <strong>{order.customer.email}</strong>
            </p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-4"
        >
          <Link
            href="/boutique"
            className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg text-center font-medium hover:bg-emerald-700 transition-colors"
          >
            Continuer les achats
          </Link>
          <Link
            href="/"
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg text-center font-medium hover:bg-gray-50 transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
