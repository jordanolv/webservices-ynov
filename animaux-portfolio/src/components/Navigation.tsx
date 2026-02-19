'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Menu, X, ShoppingCart, Instagram, Home, Images, ShoppingBag, Video, Mail } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { useScrolled } from '@/hooks/useScrolled'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Empêcher le scroll de la page sur mobile quand le menu est ouvert
  useEffect(() => {
    if (!mounted) return
    if (isMenuOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [mounted, isMenuOpen])

  const { totalItems, setIsOpen } = useCart()
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  const isSafariPage = pathname === '/boutique'
  const scrolled = useScrolled(600)

  const navLinks = [
    { href: '/', label: 'Accueil', subtitle: 'Retour à l\'accueil', icon: Home },
    { href: '/galerie', label: 'Galerie', subtitle: 'Découvrir les photos', icon: Images },
    { href: '/boutique', label: 'Boutique', subtitle: 'Tirages et produits', icon: ShoppingBag },
    { href: '/shooting', label: 'Shooting', subtitle: 'Réserver une séance', icon: Video },
    { href: '/contact', label: 'Contact', subtitle: 'Me contacter', icon: Mail }
  ]

  const socialLinks = [
    { href: 'https://instagram.com', label: 'Instagram', icon: Instagram }
  ]

  return (
    <header
      className={`backdrop-blur-xl border-b fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isSafariPage
          ? 'bg-black/40 border-gray-700/50 shadow-2xl before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/5 before:to-transparent before:pointer-events-none'
          : isHomePage && scrolled
          ? 'border-amber-200/20 shadow-lg'
          : isHomePage
          ? 'bg-white/10 border-white/20 shadow-none'
          : 'border-amber-200/20 shadow-lg'
      }`}
      style={{
        ...(!isSafariPage && (!isHomePage || scrolled) ? { backgroundColor: 'lab(43 21.81 27.47)' } : {})
      }}
    >
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-14 h-14 bg-[#ffbd76] rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:bg-[#e6a866] transition-all duration-300 rotate-3 group-hover:rotate-0">
              <Camera className="w-7 h-7 text-amber-50" />
            </div>
            <div>
              <h1 className={`text-xl font-bold tracking-wide transition-colors duration-300 ${
                isSafariPage ? 'text-white' : (isHomePage && scrolled) || !isHomePage ? 'text-white' : 'text-white'
              }`}>Dylan Olivier</h1>
              <p className={`text-sm italic transition-colors duration-300 ${
                isSafariPage ? 'text-gray-300' : (isHomePage && scrolled) || !isHomePage ? 'text-amber-50/90' : 'text-white/90'
              }`}>Photographe Animalier</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors font-medium px-4 py-2 rounded-lg ${
                  isSafariPage 
                    ? 'text-gray-300 hover:text-white hover:bg-white/10' 
                    : 'text-amber-50/90 hover:text-amber-200'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Cart Button */}
            <button
              onClick={() => setIsOpen(true)}
              className={`relative p-3 transition-all duration-300 ml-4 rounded-lg backdrop-blur-sm ${
                isSafariPage
                  ? 'text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 shadow-lg hover:shadow-xl'
                  : 'text-amber-50/90 hover:text-amber-200 bg-white/10 hover:bg-white/20'
              }`}
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ffbd76] text-amber-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Cart Button */}
            <button
              onClick={() => setIsOpen(true)}
              className={`relative p-2 transition-all duration-300 rounded-lg backdrop-blur-sm ${
                isSafariPage
                  ? 'text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 shadow-lg'
                  : 'text-amber-50/90 hover:text-amber-200 bg-white/10'
              }`}
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-[#ffbd76] text-amber-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                {totalItems}
              </span>
            </button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 transition-all duration-300 rounded-lg backdrop-blur-sm ${
                isSafariPage
                  ? 'text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 shadow-lg'
                  : 'text-amber-50/90 hover:text-amber-200 bg-white/10'
              }`}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu: rendu en portal pour que fixed = viewport, popup en bas */}
        {mounted &&
          typeof document !== 'undefined' &&
          createPortal(
            <AnimatePresence>
              {isMenuOpen && (
                <div className="md:hidden fixed inset-0 z-[100] flex items-end justify-center pb-6 px-4 pointer-events-none [&>*]:pointer-events-auto">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="absolute inset-0 bg-black/30 backdrop-blur-sm z-0"
                    aria-hidden
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 24 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="relative z-10 w-full max-h-[70vh] flex flex-col rounded-2xl menu-panel-safari border border-white/10 shadow-xl"
                  >
                <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="p-4 pb-2 flex items-center justify-between border-b border-white/10">
                  <span className="text-white font-semibold text-sm">Menu</span>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 -mr-2 rounded-xl text-white hover:bg-white/10 transition-colors"
                    aria-label="Fermer"
                  >
                    <X className="w-5 h-5" strokeWidth={2} />
                  </button>
                </div>
                <nav className="p-3 pb-3">
                  <ul className="flex flex-col gap-0.5">
                    {navLinks.map((link, i) => {
                      const Icon = link.icon
                      const isActive = pathname === link.href
                      return (
                        <motion.li
                          key={link.href}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: 0.03 * i, duration: 0.2 }}
                        >
                          <Link
                            href={link.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                              isActive ? 'bg-white/10' : 'hover:bg-white/5'
                            }`}
                          >
                            <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center">
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="block font-semibold truncate text-white">
                                {link.label}
                              </span>
                              <span className="block text-xs text-white/70 truncate mt-0.5">
                                {link.subtitle}
                              </span>
                            </div>
                          </Link>
                        </motion.li>
                      )
                    })}
                  </ul>
                  <div className="mt-1.5 pt-2">
                    <div className="w-1/2 h-px bg-white/10 mb-2" aria-hidden />
                    {socialLinks.map((s) => (
                      <a
                        key={s.href}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-white/5 transition-colors text-white text-sm font-medium"
                      >
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
                          <s.icon className="w-5 h-5 text-white" />
                        </div>
                        <span>{s.label}</span>
                      </a>
                    ))}
                  </div>
                </nav>
                </div>
                <img
                  src="/images/menu-puppy.png"
                  alt=""
                  className="absolute bottom-4 right-4 w-42 h-42 object-contain pointer-events-none opacity-90"
                  aria-hidden
                />
              </motion.div>
                </div>
              )}
        </AnimatePresence>,
            document.body
          )}
      </nav>
    </header>
  )
}