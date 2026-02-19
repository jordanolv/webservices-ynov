'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Clock, MapPin, Check, ArrowRight, Gift, Phone, Mail, Home, Users, TreePine, Sparkles, Award, Zap, ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react'
import Image from 'next/image'
import Loader from '@/components/Loader'
import { useLoader } from '@/hooks/useLoader'

interface Package {
  id: string
  name: string
  price: number
  duration: string
  photos: number
  description: string
  features: string[]
  tier: 'essentiel' | 'premium'
  popular?: boolean
  premium?: boolean
  category: 'exterieur' | 'domicile' | 'famille'
  icon: LucideIcon
  gradient: string
}

const shootingPackages: Package[] = [
  // SHOOTINGS EXTÉRIEUR
  {
    id: 'nature-essentiel',
    name: 'Nature Essentiel',
    price: 120,
    duration: '1h30',
    photos: 10,
    description: 'Shooting en extérieur pour capturer votre animal dans son élément naturel',
    features: [
      '1h30 de shooting en extérieur',
      '10 photos retouchées',
      'Galerie en ligne privée',
      'Photos en haute définition',
      'Conseils pour le comportement en extérieur',
      'Retouches artistiques'
    ],
    tier: 'essentiel',
    category: 'exterieur',
    icon: TreePine,
    gradient: 'from-amber-600 to-amber-500'
  },
  {
    id: 'nature-premium',
    name: 'Nature Premium',
    price: 210,
    duration: '2h30',
    photos: 20,
    description: 'Expérience complète en extérieur avec plusieurs décors naturels',
    features: [
      '2h30 de shooting en extérieur',
      '20 photos retouchées',
      '3 décors naturels différents',
      'Galerie en ligne privée',
      'Retouches artistiques',
      'Poster photo 50x70cm offert'
    ],
    tier: 'premium',
    popular: true,
    category: 'exterieur',
    icon: TreePine,
    gradient: 'from-amber-600 to-amber-500'
  },

  // SHOOTINGS À DOMICILE
  {
    id: 'domicile-essentiel',
    name: 'Domicile Essentiel',
    price: 150,
    duration: '1h30',
    photos: 10,
    description: 'Shooting à domicile pour le confort de votre animal',
    features: [
      '1h30 de shooting à domicile',
      '10 photos retouchées',
      'Déplacement inclus (Compiègne et ses alentours)',
      'Galerie en ligne privée',
      'Photos en haute définition',
      'Retouches artistiques'
    ],
    tier: 'essentiel',
    category: 'domicile',
    icon: Home,
    gradient: 'from-amber-700 to-amber-600'
  },
  {
    id: 'domicile-premium',
    name: 'Domicile Premium',
    price: 240,
    duration: '2h30',
    photos: 20,
    description: 'Shooting à domicile avec éclairage professionnel',
    features: [
      '2h30 de shooting à domicile',
      '20 photos retouchées',
      'Éclairage professionnel inclus',
      'Déplacement inclus (Compiègne et ses alentours)',
      'Retouches artistiques',
      'Photos de famille à domicile',
      'Poster photo 50x70cm offert'
    ],
    tier: 'premium',
    popular: true,
    category: 'domicile',
    icon: Home,
    gradient: 'from-amber-700 to-amber-600'
  },

  // SHOOTINGS FAMILLE
  {
    id: 'famille-essentiel',
    name: 'Famille Essentiel',
    price: 170,
    duration: '1h30',
    photos: 15,
    description: 'Shooting famille avec votre animal de compagnie',
    features: [
      '1h30 de shooting famille',
      '15 photos retouchées',
      'Jusqu\'à 4 personnes',
      'Galerie en ligne privée',
      'Photos en haute définition',
      'Conseils pour les poses familiales'
    ],
    tier: 'essentiel',
    category: 'famille',
    icon: Users,
    gradient: 'from-amber-800 to-amber-700'
  },
  {
    id: 'famille-premium',
    name: 'Famille Premium',
    price: 270,
    duration: '2h30',
    photos: 25,
    description: 'Shooting famille complet avec plusieurs décors',
    features: [
      '2h30 de shooting famille',
      '25 photos retouchées',
      'Jusqu\'à 6 personnes',
      '2 décors différents',
      'Retouches artistiques premium',
      'Photos individuelles incluses',
      'Poster photo 50x70cm offert'
    ],
    tier: 'premium',
    popular: true,
    category: 'famille',
    icon: Users,
    gradient: 'from-amber-800 to-amber-700'
  },
]

const additionalServices = [
  {
    name: 'Photos supplémentaires',
    description: 'Photos retouchées en plus du forfait',
    price: 8,
    unit: 'par photo',
    icon: Camera
  },
  {
    name: 'Déplacement étendu',
    description: 'Déplacement offert dans un rayon de 20km depuis Compiègne puis 0,60€/km',
    price: 0,
    unit: 'au-delà de 20km',
    icon: MapPin
  },
  {
    name: 'Album photo premium',
    description: 'Album rigide 30x30cm, 40 pages',
    price: 85,
    unit: 'par album',
    icon: Gift
  },
  {
    name: 'Impression grand format',
    description: 'Tirage professionnel 40x60cm ou 50x70cm',
    price: 45,
    unit: 'par photo',
    icon: Award
  },
  {
    name: 'Retouches express',
    description: 'Livraison des photos en 48h',
    price: 30,
    unit: 'forfait',
    icon: Zap
  },
  {
    name: 'Séance supplémentaire',
    description: 'Séance de rattrapage si nécessaire',
    price: 80,
    unit: 'forfait',
    icon: Sparkles
  }
]

export default function Shooting() {
  const isLoading = useLoader(500)
  const [selectedPackage, setSelectedPackage] = useState<string>('')
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [activeCategory, setActiveCategory] = useState<'exterieur' | 'domicile' | 'famille'>('exterieur')
  const [activeTier, setActiveTier] = useState<'essentiel' | 'premium'>('essentiel')

  const handleBooking = (packageId: string) => {
    setSelectedPackage(packageId)
    setShowBookingForm(true)
  }

  const getPackagesByCategoryAndTier = (category: string, tier: 'essentiel' | 'premium') => {
    return shootingPackages.filter(pkg => pkg.category === category && pkg.tier === tier)
  }

  const categories = [
    { id: 'exterieur', name: 'Extérieur', icon: TreePine, color: 'from-amber-600 to-amber-500' },
    { id: 'domicile', name: 'À domicile', icon: Home, color: 'from-amber-700 to-amber-600' },
    { id: 'famille', name: 'Famille', icon: Users, color: 'from-amber-800 to-amber-700' }
  ]

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-amber-50 via-stone-100 to-[#efc593] pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Image de fond + overlays comme la homepage */}
        <div className="absolute inset-0">
          <Image
            src="/images/2.jpeg"
            alt="Shooting photo d'animaux en arrière-plan"
            fill
            priority={false}
            sizes="100vw"
            className="object-cover"
          />
          {/* Overlay principal (plus léger que la homepage pour garder l'image visible) */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-amber-900/40 via-amber-800/25 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            transition={{ duration: 0.8 }}
          />
          {/* Overlay artistique subtil */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-transparent via-amber-900/5 to-amber-800/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-10 md:pt-24 md:pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block rounded-3xl bg-black/18 backdrop-blur-sm px-5 py-6 md:px-10 md:py-8">
              <p className="mb-3 text-xs sm:text-sm font-medium tracking-[0.25em] uppercase text-[#ffbd76]">
                Séances photo
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold leading-tight mb-4 text-white">
                Offrez à votre compagnon
                <br className="hidden sm:block" />
                <span className="block italic text-[#ffbd76]">
                  une expérience sur‑mesure
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-6 md:mb-8 text-white/85">
                Immortalisez la personnalité unique de votre animal avec des portraits d&apos;exception,
                pensés pour s&apos;adapter à son tempérament et à votre mode de vie.
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('packages-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 rounded-full border-2 border-[#ffbd76] bg-[#ffbd76] px-6 py-2.5 md:px-8 md:py-3 text-sm md:text-base font-semibold text-amber-900 shadow-sm hover:bg-[#e6a866] hover:border-[#e6a866] transition-colors"
              >
                Découvrir les forfaits
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Packages Section */}
      <section
        id="packages-section"
        className="py-16 md:py-20"
        style={{
          background:
            'linear-gradient(to bottom, #fdf4e3 0%, #f7e3c7 40%, #f5e6d4 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-3" style={{ color: 'var(--brown)' }}>
              Nos forfaits <span className="italic" style={{ color: 'var(--brown-accent)' }}>Shooting</span>
            </h2>
            <p className="text-base md:text-lg max-w-3xl mx-auto" style={{ color: 'var(--brown)', opacity: 0.85 }}>
              Choisissez l&apos;expérience qui correspond le mieux à vos attentes et à votre budget.
            </p>
          </motion.div>

          {/* Toggle Essentiel / Premium */}
          <div className="flex justify-center mb-6">
            <div
              className="inline-flex items-center rounded-full px-1 py-1"
              style={{ backgroundColor: 'rgba(87, 53, 28, 0.06)' }} // léger marron très doux
            >
              <button
                type="button"
                onClick={() => setActiveTier('essentiel')}
                className={`px-4 py-2 text-xs sm:text-sm rounded-full transition-all ${
                  activeTier === 'essentiel'
                    ? 'font-semibold text-amber-900 bg-[#ffecd2]'
                    : 'text-[rgba(0,0,0,0.5)]'
                }`}
              >
                Essentiel
              </button>
              <button
                type="button"
                onClick={() => setActiveTier('premium')}
                className={`px-4 py-2 text-xs sm:text-sm rounded-full transition-all flex items-center gap-1 ${
                  activeTier === 'premium'
                    ? 'font-semibold text-amber-900 bg-[#f5c08a]'
                    : 'text-[rgba(0,0,0,0.5)]'
                }`}
              >
                Premium
              </button>
            </div>
          </div>

          {/* Packages list by category : une carte par domaine pour le palier sélectionné */}
          <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-8">
            {categories.map((category) => {
              const CategoryIcon = category.icon
              const packages = getPackagesByCategoryAndTier(category.id, activeTier)
              return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-4 h-full"
                  >
                  {/* En-tête de catégorie */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ffbd76]/15">
                      <CategoryIcon className="w-4 h-4" style={{ color: 'var(--brown-accent)' }} />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em]" style={{ color: 'var(--brown-accent)' }}>
                        Catégorie
                      </p>
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--brown)' }}>
                        {category.name}
                      </h3>
                    </div>
                  </div>

                  {/* 1 carte par catégorie pour le palier sélectionné */}
                  {packages[0] && (() => {
                    const pkg = packages[0]
                    const Icon = pkg.icon
                    const isPremium = pkg.tier === 'premium'
                    const baseName = pkg.name.replace(/ (Essentiel|Premium)$/i, '')
                    return (
                      <div
                        key={pkg.id}
                        className={`relative overflow-hidden rounded-3xl border px-5 py-6 md:px-7 md:py-8 shadow-[0_10px_25px_rgba(87,53,28,0.1)] ${
                          isPremium ? 'bg-[#fdf0e0] border-[#f2c9a0]' : 'bg-[#fff7ec] border-amber-200'
                        }`}
                      >
                        {/* Header de carte */}
                        <div className="mb-5 flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-600 to-amber-500 shadow-md">
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                              <h4
                                className="text-base md:text-lg font-semibold tracking-tight"
                                style={{ color: 'var(--brown)' }}
                              >
                                {isPremium ? baseName : pkg.name}
                              </h4>
                                {isPremium && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-[#ffbd76] px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                                    <span>⭐</span>
                                    <span>Premium</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: 'var(--brown-accent)' }}>
                                {pkg.category === 'exterieur'
                                  ? 'Extérieur'
                                  : pkg.category === 'domicile'
                                  ? 'À domicile'
                                  : 'Famille'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[11px] uppercase tracking-[0.25em]" style={{ color: 'var(--brown-accent)' }}>
                              À partir de
                            </div>
                            <div className="text-2xl md:text-3xl font-bold leading-none" style={{ color: '#ffbd76' }}>
                              {pkg.price}€
                            </div>
                            <div className="mt-1 text-[11px]" style={{ color: 'var(--brown-accent)' }}>
                              TTC
                            </div>
                          </div>
                        </div>

                        <p
                          className="mb-4 text-sm leading-relaxed"
                          style={{ color: 'var(--brown)', opacity: 0.9 }}
                        >
                          {pkg.description}
                        </p>

                        <div
                          className="mb-4 flex items-center gap-4 rounded-xl bg-black/5 px-3 py-2 text-[11px] md:text-xs"
                          style={{ color: 'var(--brown)', opacity: 0.85 }}
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{pkg.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            <span>{pkg.photos} photos retouchées</span>
                          </div>
                        </div>

                        <ul className="mb-5 space-y-1.5">
                          {pkg.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#ffbd76]" />
                              <span className="text-xs md:text-sm" style={{ color: 'var(--brown)', opacity: 0.85 }}>
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>

                        <button
                          onClick={() => handleBooking(pkg.id)}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#ffbd76] bg-white px-4 py-2.5 text-xs md:text-sm font-semibold text-amber-900 transition-colors hover:bg-[#fff7ec] hover:border-[#e6a866] shadow-[0_8px_25px_rgba(120,66,18,0.12)]"
                        >
                          Réserver ce forfait
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    )
                  })()}
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="pt-16 pb-10 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2
              className="text-3xl md:text-4xl font-playfair font-bold mb-3"
              style={{ color: 'var(--brown)' }}
            >
              Services <span className="italic" style={{ color: 'var(--brown-accent)' }}><br></br>complémentaires</span>
            </h2>
            <p
              className="text-base md:text-lg max-w-3xl mx-auto"
              style={{ color: 'var(--brown)', opacity: 0.85 }}
            >
              Ajoutez de petites attentions pour rendre votre séance encore plus unique.
            </p>
          </motion.div>

          <div className="max-w-7xl mx-auto">
            <div className="md:hidden -mx-6 px-6">
              <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory no-scrollbar">
                {additionalServices.map((service, index) => {
                  const Icon = service.icon
                  return (
                    <motion.div
                      key={service.name}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="min-w-[230px] max-w-[260px] snap-center rounded-3xl border border-amber-200 bg-white px-5 py-5"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ffecd2] flex-shrink-0">
                          <Icon className="w-5 h-5" style={{ color: 'var(--brown-accent)' }} />
                        </div>
                        <div>
                          <h3
                            className="text-sm font-semibold"
                            style={{ color: 'var(--brown)' }}
                          >
                            {service.name}
                          </h3>
                          <p
                            className="mt-1 text-xs leading-relaxed"
                            style={{ color: 'var(--brown)', opacity: 0.85 }}
                          >
                            {service.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-end justify-between">
                        <div>
                          <div className="text-xs font-semibold" style={{ color: '#ffbd76' }}>
                            +{service.price}€
                          </div>
                        </div>
                        <div
                          className="rounded-full px-3 py-1 text-[11px]"
                          style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', color: 'var(--brown-accent)' }}
                        >
                          {service.unit}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              <div className="mt-2 flex justify-center gap-6">
                <ChevronLeft className="h-5 w-5" style={{ color: 'var(--brown-accent)' }} />
                <ChevronRight className="h-5 w-5" style={{ color: 'var(--brown-accent)' }} />
              </div>
            </div>

            <div className="hidden md:grid md:grid-cols-3 gap-6">
              {additionalServices.map((service, index) => {
                const Icon = service.icon
                return (
                  <motion.div
                    key={service.name}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-3xl border border-amber-200 bg-white px-5 py-5 shadow-[0_18px_40px_rgba(87,53,28,0.12)]"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ffecd2] flex-shrink-0">
                        <Icon className="w-5 h-5" style={{ color: 'var(--brown-accent)' }} />
                      </div>
                      <div>
                        <h3
                          className="text-sm md:text-base font-semibold"
                          style={{ color: 'var(--brown)' }}
                        >
                          {service.name}
                        </h3>
                        <p
                          className="mt-1 text-xs md:text-sm leading-relaxed"
                          style={{ color: 'var(--brown)', opacity: 0.85 }}
                        >
                          {service.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div
                          className="text-[11px] uppercase tracking-[0.22em] mb-1"
                          style={{ color: 'var(--brown-accent)' }}
                        >
                          Supplément
                        </div>
                        <div className="text-lg font-bold leading-none" style={{ color: '#ffbd76' }}>
                          +{service.price}€
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className="text-[11px] uppercase tracking-[0.22em] mb-1"
                          style={{ color: 'var(--brown-accent)' }}
                        >
                          Unité
                        </div>
                        <div className="text-[11px] md:text-xs" style={{ color: 'var(--brown-accent)' }}>
                          {service.unit}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-amber-50 to-stone-100">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-4xl md:text-5xl font-serif text-amber-900 mb-4">
              Questions Fréquentes
            </h2>
          </motion.div>

          <div className="space-y-3">
            <motion.details
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group rounded-2xl border border-amber-100 bg-white/90 px-4 py-3 md:px-5 md:py-4"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 list-none">
                <span className="text-sm md:text-base font-semibold text-amber-900">
                  Mon animal est très timide, est-ce un problème ?
                </span>
                <span className="text-amber-700 text-sm group-open:rotate-180 transition-transform">
                  ▾
                </span>
              </summary>
              <p className="mt-3 text-sm text-amber-800 leading-relaxed">
                Pas du tout ! Je suis habitué aux animaux de tous tempéraments. Nous prendrons le temps nécessaire
                pour que votre compagnon se sente à l&apos;aise.
              </p>
            </motion.details>

            <motion.details
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="group rounded-2xl border border-amber-100 bg-white/90 px-4 py-3 md:px-5 md:py-4"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 list-none">
                <span className="text-sm md:text-base font-semibold text-amber-900">
                  Puis-je assister à la séance ?
                </span>
                <span className="text-amber-700 text-sm group-open:rotate-180 transition-transform">
                  ▾
                </span>
              </summary>
              <p className="mt-3 text-sm text-amber-800 leading-relaxed">
                Bien sûr ! Votre présence peut même aider votre animal à se détendre. Nous pourrons aussi prendre
                quelques photos de vous ensemble.
              </p>
            </motion.details>

            <motion.details
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group rounded-2xl border border-amber-100 bg-white/90 px-4 py-3 md:px-5 md:py-4"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 list-none">
                <span className="text-sm md:text-base font-semibold text-amber-900">
                  Quand recevrai-je mes photos ?
                </span>
                <span className="text-amber-700 text-sm group-open:rotate-180 transition-transform">
                  ▾
                </span>
              </summary>
              <p className="mt-3 text-sm text-amber-800 leading-relaxed">
                Les photos retouchées sont disponibles dans votre galerie privée sous 7 à 10 jours ouvrés après la
                séance.
              </p>
            </motion.details>

            <motion.details
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="group rounded-2xl border border-amber-100 bg-white/90 px-4 py-3 md:px-5 md:py-4"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 list-none">
                <span className="text-sm md:text-base font-semibold text-amber-900">
                  Que se passe-t-il en cas de mauvais temps ?
                </span>
                <span className="text-amber-700 text-sm group-open:rotate-180 transition-transform">
                  ▾
                </span>
              </summary>
              <p className="mt-3 text-sm text-amber-800 leading-relaxed">
                Nous reportons la séance sans frais ou optons pour un shooting en intérieur si les conditions le
                permettent.
              </p>
            </motion.details>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border border-amber-200 rounded-xl max-w-md w-full p-6 shadow-xl"
          >
            <h3 className="text-xl font-bold text-amber-900 mb-4">
              Réserver une séance
            </h3>
            
            <p className="text-amber-800 mb-6">
              Parfait ! Pour finaliser votre réservation du forfait{' '}
              <strong className="text-amber-900">
                {shootingPackages.find(p => p.id === selectedPackage)?.name}
              </strong>,
              contactez-moi directement :
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                <Phone className="w-5 h-5 text-[#ffbd76]" />
                <span className="text-amber-900">06 19 65 19 33</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                <Mail className="w-5 h-5 text-[#ffbd76]" />
                <span className="text-amber-900">dylanolivierphotographie@gmail.com</span>
              </div>
            </div>

            <p className="text-sm text-amber-700 mb-6">
              Nous planifierons ensemble la date, le lieu et discuterons de vos attentes 
              pour cette séance photo inoubliable !
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBookingForm(false)}
                className="flex-1 border border-amber-300 text-amber-900 py-3 rounded-lg font-medium hover:bg-amber-50 transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => window.location.href = '/contact'}
                className="flex-1 bg-[#ffbd76] text-amber-900 py-3 rounded-lg font-medium hover:bg-[#e6a866] transition-colors"
              >
                Aller au contact
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {isLoading && <Loader />}
    </div>
  )
}