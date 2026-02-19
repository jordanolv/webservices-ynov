'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import { useCart } from '@/hooks/useCart'
import { useProducts } from '@/hooks/useProducts'
import CartDrawer from '@/components/CartDrawer'
import Loader from '@/components/Loader'
import { type Product } from '@/services/products'

export default function BoutiqueSafari() {
  const { products, loading, error, refetch } = useProducts()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedSizePrice, setSelectedSizePrice] = useState<{ size: string; price: number } | null>(null)
  const [selectedBorder, setSelectedBorder] = useState('sans')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const { items, isOpen, setIsOpen, addItem, removeItem, updateQuantity, totalPrice } = useCart()

  if (loading) {
    return <Loader />
  }

  // Composant d'erreur avec possibilité de retry
  if (error && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-700 text-white rounded-lg hover:bg-orange-800 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  // Best-sellers sélectionnés depuis le backoffice et tous les produits
  const bestSellers = products.filter(product => product.isBestSeller).slice(0, 3)
  const allProducts = products

  // Debug: afficher le nombre de produits
  console.log('Total products:', products.length)
  console.log('Best sellers:', bestSellers.length)
  console.log('All products:', allProducts.length)

  const getProductImages = (product: Product): string[] => product.images || []
  const getProductMainImage = (product: Product): string =>
    product.images?.length ? product.images[0] : '/images/placeholder.jpg'

  const handleAddToCart = (product: Product, size: string) => {
    // Trouver le prix pour la taille sélectionnée
    const selectedSizeInfo = product.sizePrices.find(sp => sp.size === size)
    const price = selectedSizeInfo ? selectedSizeInfo.price : 0
    
    // Créer un objet compatible avec useCart qui attend une image et un id numérique
    const productForCart = {
      id: parseInt(product._id.slice(-6), 16), // Id numérique pour le panier
      _id: product._id, // ObjectId MongoDB pour Stripe checkout
      name: product.name,
      price: price,
      image: getProductMainImage(product)
    }
    addItem(productForCart, size)
    setSelectedProduct(null)
    setCurrentImageIndex(0)
  }


  return (
    <div className="min-h-screen bg-black pt-20">

      {/* Main Safari Poster Container */}
      <div className="relative max-w-6xl mx-auto px-6 py-8">
        {/* Best Sellers Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-serif text-white mb-12 text-center tracking-wide"
          >
            Les Best-Sellers
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {bestSellers.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              {/* Dark Professional Card */}
              <div 
                className="bg-transparent group cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden mb-4">
                  <Image
                    src={getProductMainImage(product)}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    onLoad={() => setLoadedImages(prev => new Set([...prev, getProductMainImage(product)]))}
                  />
                  
                  {/* Skeleton loader pendant le chargement */}
                  {!loadedImages.has(getProductMainImage(product)) && (
                    <div className="absolute inset-0 bg-gray-800">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_ease-in-out_infinite] transform -skew-x-12 translate-x-[-100%]" style={{ animation: 'shimmer 2s ease-in-out infinite' }} />
                    </div>
                  )}

                  {/* Dark Overlay on hover */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Product Info */}
                <div className="text-center">
                  <h3 className="text-white text-lg font-medium mb-1 uppercase tracking-wide">
                    {product.name}
                  </h3>
                  
                  <p className="text-white text-sm font-medium">
                    {product.sizePrices.length > 0 
                      ? `À partir de ${Math.min(...product.sizePrices.map(sp => sp.price))}€`
                      : 'Prix sur demande'
                    }
                  </p>
                </div>
              </div>
            </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Explore Collections Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          <div>
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">
              Découvrez<br />
              d&apos;autres<br />
              collections...
            </h2>
            <button 
              onClick={() => document.getElementById('boutique-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-gray-200 text-black px-8 py-4 rounded-lg font-medium hover:bg-white transition-colors"
            >
              Explorer la boutique
            </button>
          </div>
          
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
            <Image
              src="https://cdn.discordapp.com/attachments/685655650923053122/1416352106838888569/image.png?ex=68c68830&is=68c536b0&hm=928a2f36b2db39976e6d9abfed6b5f2030173d01b15af46d056fa01f190a1a10&"
              alt="Photographie d'éléphant - Dylan Olivier"
              fill
              className="object-cover"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
          </div>
        </motion.div>

        {/* All Products Section */}
        <motion.div
          id="boutique-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-serif text-white mb-12 text-center tracking-wide"
          >
            Toute la Collection
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {allProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                {/* Dark Professional Card */}
                <div 
                  className="bg-transparent group cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden mb-4">
                    <Image
                      src={getProductMainImage(product)}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                      onLoad={() => setLoadedImages(prev => new Set([...prev, getProductMainImage(product)]))}
                    />
                    
                    {/* Skeleton loader pendant le chargement */}
                    {!loadedImages.has(getProductMainImage(product)) && (
                      <div className="absolute inset-0 bg-gray-800">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_ease-in-out_infinite] transform -skew-x-12 translate-x-[-100%]" style={{ animation: 'shimmer 2s ease-in-out infinite' }} />
                      </div>
                    )}

                    {/* Dark Overlay on hover */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Product Info */}
                  <div className="text-center">
                    <h3 className="text-white text-lg font-medium mb-1 uppercase tracking-wide">
                      {product.name}
                    </h3>
                    
                    <p className="text-gray-400 text-sm mb-2">
                      Dylan Olivier
                    </p>
                    
                    <p className="text-white text-sm font-medium">
                      {product.sizePrices.length > 0 
                        ? `À partir de ${Math.min(...product.sizePrices.map(sp => sp.price))}€`
                        : 'Prix sur demande'
                      }
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {allProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-6 text-gray-600">🦁</div>
            <div className="bg-gray-900/50 rounded-lg p-8 max-w-md mx-auto border border-gray-800">
              <h3 className="text-xl font-medium text-white mb-3">
                Collection en cours
              </h3>
              <p className="text-gray-400 leading-relaxed">
                De nouvelles photographies safari seront bientôt disponibles
              </p>
            </div>
          </motion.div>
        )}

      </div>

      {/* Dark Professional Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-black border border-gray-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-auto shadow-2xl relative"
          >
            
            <div className="flex flex-col lg:flex-row">
              {/* Image Section */}
              <div className="flex-1 lg:order-2">
                <div className="relative aspect-[4/5] lg:aspect-square overflow-hidden">
                  <Image
                    src={getProductImages(selectedProduct)[currentImageIndex] || getProductMainImage(selectedProduct)}
                    alt={selectedProduct.name}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Navigation between images if multiple images */}
                  {getProductImages(selectedProduct).length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setCurrentImageIndex(prev => 
                            prev === 0 ? getProductImages(selectedProduct).length - 1 : prev - 1
                          )
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white text-gray-900 rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setCurrentImageIndex(prev => 
                            prev === getProductImages(selectedProduct).length - 1 ? 0 : prev + 1
                          )
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white text-gray-900 rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      
                      {/* Image indicators */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {getProductImages(selectedProduct).map((_, index) => (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation()
                              setCurrentImageIndex(index)
                            }}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                              currentImageIndex === index 
                                ? 'bg-white scale-125' 
                                : 'bg-white/60 hover:bg-white/80'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Product Info Section */}
              <div className="flex-1 lg:order-1 p-8">
                <div className="h-full flex flex-col">
                  <div className="flex-1">
                    <h2 className="text-3xl font-serif text-white mb-4">
                      {selectedProduct.name}
                    </h2>
                    
                    <p className="text-gray-400 mb-8 leading-relaxed">
                      {selectedProduct.description}
                    </p>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Taille
                        </label>
                        <select
                          value={selectedSizePrice ? `${selectedSizePrice.size}-${selectedSizePrice.price}` : ''}
                          onChange={(e) => {
                            if (e.target.value) {
                              const [size, price] = e.target.value.split('-')
                              setSelectedSizePrice({ size, price: parseFloat(price) })
                            } else {
                              setSelectedSizePrice(null)
                            }
                          }}
                          className="w-full px-4 py-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-white bg-gray-900"
                        >
                          <option value="">Sélectionner une taille</option>
                          {selectedProduct.sizePrices.map((sizePrice) => (
                            <option key={`${sizePrice.size}-${sizePrice.price}`} value={`${sizePrice.size}-${sizePrice.price}`}>
                              {sizePrice.size} - {sizePrice.price}€
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Options
                        </label>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedBorder('sans')}
                            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                              selectedBorder === 'sans'
                                ? 'bg-white text-black'
                                : 'bg-gray-800 text-white border border-gray-700 hover:bg-gray-700'
                            }`}
                          >
                            Sans bordure
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedBorder('avec')}
                            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                              selectedBorder === 'avec'
                                ? 'bg-white text-black'
                                : 'bg-gray-800 text-white border border-gray-700 hover:bg-gray-700'
                            }`}
                          >
                            Avec bordure
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-800">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-sm text-gray-400">Prix</span>
                      <span className="text-3xl font-light text-white">
                        {selectedSizePrice ? `${selectedSizePrice.price}€` : 'Choisir une taille'}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedProduct(null)}
                        className="flex-1 border border-gray-700 text-gray-300 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                      >
                        Fermer
                      </button>
                      <button
                        onClick={() => handleAddToCart(selectedProduct, selectedSizePrice?.size || '')}
                        disabled={!selectedSizePrice}
                        className="flex-1 bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Ajouter au panier
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}


      <CartDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={items}
        totalPrice={totalPrice}
        updateQuantity={updateQuantity}
        removeItem={removeItem}
      />
    </div>
  )
}