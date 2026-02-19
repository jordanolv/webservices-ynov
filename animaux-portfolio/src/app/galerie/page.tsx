'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import { useGallery } from '@/hooks/useGallery'
import { type GalleryImage } from '@/services/gallery'

export default function Galerie() {
  const { images, loading, error, refetch } = useGallery()
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Chargement de la galerie...</p>
        </div>
      </div>
    )
  }

  if (error) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={refetch}
            className="px-6 py-3 bg-orange-700 text-white rounded-lg hover:bg-orange-800 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  const openModal = (image: GalleryImage, index: number) => {
    setSelectedImage(image)
    setCurrentImageIndex(index)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedImage(null)
  }

  const nextImage = () => {
    const newIndex = currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1
    setCurrentImageIndex(newIndex)
    setSelectedImage(images[newIndex])
  }

  const prevImage = () => {
    const newIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1
    setCurrentImageIndex(newIndex)
    setSelectedImage(images[newIndex])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-100 pt-38 px-16 pb-22">
        {/* Images Masonry Grid */}
        <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1200: 4 }}>
          <Masonry gutter="16px">
            {images.map((image, index) => (
              <motion.div
                key={image._id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative cursor-pointer group overflow-hidden rounded-lg"
                onClick={() => openModal(image, index)}
              >
                <Image
                  src={image.imageUrl}
                  alt={image.alt || 'Photo d\'animal'}
                  width={400}
                  height={400}
                  className="w-full h-auto transition-all duration-500 group-hover:brightness-75"
                  style={{ objectFit: 'cover' }}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                  priority={index < 6}
                  loading={index < 6 ? 'eager' : 'lazy'}
                />
              </motion.div>
            ))}
          </Masonry>
        </ResponsiveMasonry>

        {images.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aucune image disponible pour le moment.</p>
          </div>
        )}

      {/* Modal en plein écran */}
      <AnimatePresence>
        {isModalOpen && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
          <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-7xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 bg-black/50 text-white rounded-full p-3 hover:bg-black/70 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white rounded-full p-3 hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white rounded-full p-3 hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Image */}
              <div className="relative w-full h-[80vh] rounded-lg overflow-hidden">
                <Image
                  src={selectedImage.imageUrl}
                  alt="Photo d'animal"
                  fill
                  className="object-contain"
                />
                        </div>

              {/* Image Info */}
              <div className="mt-6 text-center text-white">
                <div className="flex items-center justify-center space-x-6">
                  <span className="text-gray-300 text-sm">
                    {currentImageIndex + 1} / {images.length}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {new Date(selectedImage.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
                  </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}