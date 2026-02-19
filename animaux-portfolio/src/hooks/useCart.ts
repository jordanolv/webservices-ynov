'use client'

import { useState, useEffect } from 'react'

export interface CartItem {
  id: number // ID numérique pour compatibilité
  _id: string // ObjectId MongoDB (requis pour Stripe checkout)
  name: string
  price: number
  image: string
  size: string
  quantity: number
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Charger le panier depuis localStorage au démarrage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setItems(JSON.parse(savedCart))
    }
  }, [])

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addItem = (product: { id: number; _id: string; name: string; price: number; image: string }, size: string, quantity: number = 1) => {
    const existingItem = items.find(item => item.id === product.id && item.size === size)

    if (existingItem) {
      setItems(items.map(item =>
        item.id === product.id && item.size === size
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ))
    } else {
      const newItem: CartItem = {
        id: product.id,
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        size,
        quantity
      }
      setItems([...items, newItem])
    }
    setIsOpen(true)
  }

  const removeItem = (id: number, size: string) => {
    setItems(items.filter(item => !(item.id === id && item.size === size)))
  }

  const updateQuantity = (id: number, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id, size)
      return
    }
    
    setItems(items.map(item =>
      item.id === id && item.size === size
        ? { ...item, quantity }
        : item
    ))
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return {
    items,
    isOpen,
    setIsOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice
  }
}