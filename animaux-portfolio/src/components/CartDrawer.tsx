'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, ShoppingBag, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { CartItem } from '@/hooks/useCart'
import { api, type CheckoutItem } from '@/services/api'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  totalPrice: number
  updateQuantity: (id: number, size: string, quantity: number) => void
  removeItem: (id: number, size: string) => void
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  totalPrice,
  updateQuantity,
  removeItem
}: CartDrawerProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true)

      const checkoutItems: CheckoutItem[] = items.map((item) => ({
        productId: item._id,
        productName: item.name,
        size: item.size,
        quantity: item.quantity,
        unitPrice: item.price,
        imageUrl: item.image || undefined,
      }))

      const session = await api.checkout.createSession(checkoutItems)

      if (session.url) {
        window.location.href = session.url
      } else {
        throw new Error('URL de checkout non reçue')
      }
    } catch (error) {
      console.error('Erreur checkout:', error)
      alert('Une erreur est survenue lors du passage à la commande. Veuillez réessayer.')
      setIsCheckingOut(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Panier ({items.length})
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Votre panier est vide
                  </h3>
                  <p className="text-gray-500 text-center">
                    Découvrez nos magnifiques portraits d&apos;animaux
                  </p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={`${item.id}-${item.size}`}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex gap-4 bg-gray-50 rounded-lg p-4"
                    >
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm leading-tight">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Taille: {item.size}
                        </p>
                        <p className="text-sm font-semibold text-emerald-600 mt-1">
                          {item.price}€
                        </p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                              className="w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium min-w-[2ch] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                              className="w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeItem(item.id, item.size)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                          >
                            Retirer
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t bg-gray-50 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {totalPrice.toFixed(2)}€
                  </span>
                </div>
                
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Redirection...
                    </>
                  ) : (
                    'Passer la commande'
                  )}
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Continuer les achats
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}