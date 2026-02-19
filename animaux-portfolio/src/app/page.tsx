'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState, useEffect, useMemo } from 'react'
import { Camera, Aperture, Heart, Star, ArrowDown, Play, ChevronDown } from 'lucide-react'
export default function Home() {
  const heroImages = useMemo(() => [
    {
      src: "/images/chien.JPG",
      alt: "Portrait de chien"
    }
  ], [])

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [openItem, setOpenItem] = useState<number | null>(0)

  // Plus besoin de préchargement, on utilise onLoad

  useEffect(() => {
    if (!imagesLoaded) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000) // Change d'image toutes les 5 secondes

    return () => clearInterval(interval)
  }, [heroImages.length, imagesLoaded])

  // Plus besoin de loader complexe

  return (
    <div className="min-h-screen">
      {/* Hero Section - Artistic Photographer Style */}
      <section className="relative h-screen overflow-hidden">        
        {/* Background Image Slider with Overlay */}
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <motion.div
              key={index}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: index === currentImageIndex && imagesLoaded ? 1 : 0 
              }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="100vw"
                className="object-cover"
                priority={index === 0}
                quality={80}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                onLoad={() => {
                  if (index === 0) setImagesLoaded(true)
                }}
              />
            </motion.div>
          ))}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-amber-900/70 via-amber-800/50 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: imagesLoaded ? 0.6 : 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
          
          {/* Artistic Overlay Effects */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-transparent via-amber-900/10 to-amber-800/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: imagesLoaded ? 1 : 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>


        {/* Content */}
        <div className="relative z-10 flex items-center h-full">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.5 }}
                className="text-center"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="text-center mb-8"
                >
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="mb-6"
                >
                  <h1 className="text-5xl md:text-7xl font-bold text-white mb-3 leading-[0.9] tracking-tight font-playfair">
                    Dylan Olivier
                  </h1>
                  <p className="text-xl md:text-2xl text-[#ffbd76] font-light tracking-wide font-inter">
                    Capturer l&apos;âme de vos compagnons
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1 }}
                  className="flex justify-center mt-8"
                >
                  <motion.a
                    href="/shooting"
                    className="group relative border-2 border-white text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-white hover:text-amber-900 transition-all duration-150 shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2 overflow-hidden backdrop-blur-sm font-inter"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150"></div>
                    <Play className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Réserver une Séance</span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded-full"></div>
                  </motion.a>
                </motion.div>
              </motion.div>
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
          >
            <motion.button
              onClick={() => {
                const nextSection = document.querySelector('section:nth-child(2)')
                nextSection?.scrollIntoView({ behavior: 'smooth' })
              }}
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors duration-300 cursor-pointer bg-transparent border-none"
            >
              <span className="text-sm font-medium tracking-wider uppercase">Découvrir</span>
              <ArrowDown className="w-6 h-6" />
            </motion.button>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <motion.div 
          className="absolute bottom-0 right-0 w-64 h-64 opacity-20"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-[#ffbd76] to-amber-600 rounded-full blur-3xl"></div>
        </motion.div>

        <motion.div 
          className="absolute top-1/4 left-10 w-32 h-32 opacity-15"
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-amber-400 to-[#ffbd76] rounded-full blur-2xl"></div>
        </motion.div>
      </section>


      {/* À propos Section */}
      <section className="py-12 bg-gradient-to-b from-amber-50 to-stone-100">
        <div className="max-w-5xl mx-auto px-6">
          {/* Titre centré */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="flex items-center gap-3 justify-center mb-2">
              <div className="w-8 h-[2px] rounded-full" style={{ backgroundColor: 'var(--brown-accent)', opacity: 0.4 }}></div>
              <Camera className="w-4 h-4" style={{ color: 'var(--brown-accent)', opacity: 0.8 }} />
              <div className="w-8 h-[2px] rounded-full" style={{ backgroundColor: 'var(--brown-accent)', opacity: 0.4 }}></div>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold font-playfair leading-tight mb-4" style={{ color: 'var(--brown)' }}>
              Photographe animalier <span className="italic" style={{ color: 'var(--brown-accent)' }}>passionné</span>
            </h2>
            <p className="text-lg leading-relaxed max-w-3xl mx-auto" style={{ color: 'var(--brown)' }}>
              Je capture la personnalité unique de chaque animal avec <span className="font-semibold">authenticité</span> et <span className="font-semibold">émotion</span>.
              Chaque cliché raconte une histoire, révèle une âme, immortalise un moment précieux.
            </p>
          </motion.div>

          {/* Layout photo + arguments */}
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Arguments */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl p-6 md:p-8"
              style={{ backgroundColor: 'lab(43 21.81 27.47)' }}
            >
              <h3 className="text-2xl font-bold text-white font-playfair text-center md:text-left mb-2">
                Pourquoi me <span className="italic text-[#ffbd76]">choisir</span> ?
              </h3>
              <div className="w-10 h-[2px] rounded-full mb-5 mx-auto md:mx-0" style={{ backgroundColor: 'color-mix(in srgb, #ffbd76, transparent 60%)' }}></div>
              <div className="space-y-1">
                {[
                  { icon: Heart, title: "Une maîtrise confirmée", desc: "Des années d\u2019expérience en photographie animalière pour capturer chaque instant avec précision." },
                  { icon: Camera, title: "Approche douce", desc: "Une méthode respectueuse et patiente, adaptée au rythme de chaque animal." },
                  { icon: Star, title: "Résultats uniques", desc: "Des clichés qui révèlent la vraie personnalité de votre compagnon." },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <button
                      onClick={() => setOpenItem(openItem === i ? null : i)}
                      className="w-full flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-white shrink-0" />
                        <span className="font-semibold text-white text-sm text-left">{item.title}</span>
                      </div>
                      <motion.div
                        animate={{ rotate: openItem === i ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-4 h-4 text-[#ffbd76]/60" />
                      </motion.div>
                    </button>
                    <motion.div
                      initial={false}
                      animate={{
                        height: openItem === i ? "auto" : 0,
                        opacity: openItem === i ? 1 : 0,
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="text-white/75 text-sm pl-11 pr-3 pb-3">{item.desc}</p>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Photo */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/1.jpeg"
                  alt="Portrait d'animal"
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 w-28 h-28 bg-amber-600/15 rounded-full blur-2xl"></div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Categories Section - Artistic Style */}
      <section 
        className="py-20" 
        style={{ 
          background: 'linear-gradient(to bottom, rgb(239 209 172), lab(85 15.28 40.39), rgb(255 251 235))' 
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 max-w-5xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
              <div className="w-8 h-[2px] rounded-full" style={{ backgroundColor: 'var(--brown-accent)', opacity: 0.4 }}></div>
              <Aperture className="w-4 h-4" style={{ color: 'var(--brown-accent)', opacity: 0.8 }} />
              <div className="w-8 h-[2px] rounded-full" style={{ backgroundColor: 'var(--brown-accent)', opacity: 0.4 }}></div>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-2 font-playfair leading-tight text-center md:text-left" style={{ color: 'var(--brown)' }}>
              Mes <span className="italic" style={{ color: 'var(--brown-accent)' }}>Univers</span>
            </h2>
            <p className="text-lg md:text-xl max-w-2xl leading-relaxed text-center md:text-left" style={{ color: 'var(--brown)', opacity: 0.8 }}>
              Trois approches, une même passion : révéler l&apos;essence de chaque moment
              partagé avec nos compagnons à quatre pattes.
            </p>
          </motion.div>

          {/* Bento grid layout */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6 max-w-5xl mx-auto">
            {/* Nature - Grande carte à gauche */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group cursor-pointer col-span-2 md:col-span-1 md:row-span-2"
            >
              <div className="relative h-72 md:h-full min-h-0 rounded-2xl overflow-hidden shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                <Image
                  src="/images/2.jpeg"
                  alt="Action Nature"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-900/90 via-amber-800/30 to-transparent"></div>

                <div className="absolute bottom-6 left-6 text-white">
                  <motion.div
                    className="bg-white/15 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-sm font-bold mb-2 transition-all duration-300 group-hover:bg-white/25 group-hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="flex items-center gap-2">
                      <Aperture className="w-4 h-4 text-[#ffbd76]" />
                      NATURE
                    </div>
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-0.5 group-hover:text-[#ffbd76] transition-colors">Nature & Liberté</h3>
                  <p className="text-amber-100 group-hover:text-white transition-colors">L&apos;énergie sauvage et pure</p>
                </div>
              </div>
            </motion.div>

            {/* À Domicile - Petite carte en haut à droite */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group cursor-pointer col-span-1"
            >
              <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                <Image
                  src="/images/5.jpeg"
                  alt="Portrait Studio"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-900/90 via-amber-800/30 to-transparent"></div>

                <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 text-white">
                  <motion.div
                    className="bg-white/15 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-sm font-bold mb-2 transition-all duration-300 group-hover:bg-white/25 group-hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="flex items-center gap-1.5 text-xs md:text-sm">
                      <Camera className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      À DOMICILE
                    </div>
                  </motion.div>
                  <h3 className="text-lg md:text-2xl font-bold mb-0.5 group-hover:text-[#ffbd76] transition-colors">Portraits Intimistes</h3>
                  <p className="text-amber-100 text-xs md:text-base group-hover:text-white transition-colors hidden md:block">L&apos;âme pure de votre compagnon</p>
                </div>
              </div>
            </motion.div>

            {/* Famille - Petite carte en bas à droite */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="group cursor-pointer col-span-1"
            >
              <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                <Image
                  src="/images/3.jpeg"
                  alt="Famille Lifestyle"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-900/90 via-amber-800/30 to-transparent"></div>

                <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 text-white">
                  <motion.div
                    className="bg-white/15 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-sm font-bold mb-2 transition-all duration-300 group-hover:bg-white/25 group-hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="flex items-center gap-1.5 text-xs md:text-sm">
                      <Heart className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      FAMILLE
                    </div>
                  </motion.div>
                  <h3 className="text-lg md:text-2xl font-bold mb-0.5 group-hover:text-[#ffbd76] transition-colors">Moments Précieux</h3>
                  <p className="text-amber-100 text-xs md:text-base group-hover:text-white transition-colors hidden md:block">L&apos;amour partagé en famille</p>
                </div>
              </div>
            </motion.div>

            {/* Boutique - Bandeau */}
            <motion.a
              href="/boutique"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="group col-span-2 block"
            >
              <div className="flex items-center justify-between px-5 py-4 md:px-8 md:py-5 rounded-2xl border transition-all duration-300" style={{ backgroundColor: 'color-mix(in lab, var(--brown), transparent 90%)', borderColor: 'color-mix(in lab, var(--brown), transparent 85%)' }}>
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'color-mix(in lab, var(--brown), transparent 85%)' }}>
                    <Camera className="w-5 h-5 md:w-6 md:h-6" style={{ color: 'var(--brown)' }} />
                  </div>
                  <div>
                    <p className="font-bold text-sm md:text-base tracking-wide" style={{ color: 'var(--brown)' }}>Boutique Safari</p>
                    <p className="text-xs md:text-sm" style={{ color: 'var(--brown-accent)', opacity: 0.7 }}>Offrez-vous un bout de nature</p>
                  </div>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-all duration-300" style={{ backgroundColor: 'color-mix(in lab, var(--brown), transparent 90%)' }}>
                  <svg className="w-4 h-4 md:w-5 md:h-5" style={{ color: 'var(--brown)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.a>
          </div>
        </div>
      </section>

    </div>
  )
}