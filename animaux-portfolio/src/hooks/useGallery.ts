'use client'

import { useState, useEffect } from 'react'
import { getGalleryImages, type GalleryImage } from '@/services/gallery'

export const useGallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchImages = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await getGalleryImages()

      setImages(data)
    } catch (err) {
      console.error('❌ Erreur lors du chargement des images:', err)

      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError('Impossible de charger la galerie. Vérifiez votre connexion.')
      } else {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      }

      setImages([])
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    fetchImages()
  }

  useEffect(() => {
    fetchImages()
  }, [])

  return {
    images,
    loading,
    error,
    refetch,
  }
}
