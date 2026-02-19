'use client'

import { useState, useEffect } from 'react'
import { getProducts, type Product } from '@/services/products'

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const productsData = await getProducts()
      setProducts(productsData)
    } catch (err) {
      console.error('Erreur chargement produits:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    fetchProducts()
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return {
    products,
    loading,
    error,
    refetch,
  }
}