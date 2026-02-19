'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Package, Images, ShoppingBag, Home, LogOut, Menu, X } from 'lucide-react'
import { api } from '@/services/api'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Produits', icon: Package },
  { href: '/admin/gallery', label: 'Galerie', icon: Images },
  { href: '/admin/orders', label: 'Commandes', icon: ShoppingBag },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (pathname === '/admin/login') {
      setReady(true)
      return
    }
    api.auth
      .me()
      .then(() => setReady(true))
      .catch(() => router.replace('/admin/login'))
  }, [pathname, router])

  // Fermer le menu mobile quand on change de page
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-stone-100 to-amber-100">
        <div className="animate-spin h-8 w-8 border-2 border-amber-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (pathname === '/admin/login') return <>{children}</>

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  // Fonction pour obtenir le titre de la section actuelle
  const getSectionTitle = () => {
    if (pathname === '/admin') return 'Dashboard'
    if (pathname.startsWith('/admin/products')) {
      if (pathname === '/admin/products/new') return 'Nouveau Produit'
      if (pathname.match(/^\/admin\/products\/\d+$/)) return 'Modifier Produit'
      return 'Produits'
    }
    if (pathname.startsWith('/admin/gallery')) return 'Galerie'
    if (pathname.startsWith('/admin/orders')) {
      if (pathname.match(/^\/admin\/orders\/\d+$/)) return 'Détail Commande'
      return 'Commandes'
    }
    return ''
  }

  const sectionTitle = getSectionTitle()

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-100 to-amber-100">
      {/* Menu fixe collé juste sous le header principal */}
      <nav className="fixed top-[88px] left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Titre */}
            <div className="flex items-center justify-center h-16 gap-2">
              <span className="text-xl font-bold text-amber-900 tracking-wide leading-none">Admin</span>
              {sectionTitle && (
                <>
                  <span className="text-xl font-normal text-amber-700 leading-none">-</span>
                  <span className="text-xl font-bold text-amber-900 tracking-wide leading-none">{sectionTitle}</span>
                </>
              )}
            </div>

            {/* Navigation Desktop */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      active
                        ? 'text-amber-900 bg-amber-100 shadow-sm'
                        : 'text-gray-600 hover:text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {active && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-amber-100 rounded-lg -z-10"
                        initial={false}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Actions Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-800 hover:text-amber-900 border border-amber-300 rounded-lg bg-white hover:bg-amber-50 transition-all duration-200 shadow-sm hover:shadow"
              >
                <Home className="w-4 h-4" />
                <span>Accueil</span>
              </Link>
              <button
                onClick={async () => {
                  await api.auth.logout()
                  router.replace('/admin/login')
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>

            {/* Bouton Menu Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-amber-200/50 bg-white/98 backdrop-blur-md overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        active
                          ? 'text-amber-900 bg-amber-100 shadow-sm'
                          : 'text-gray-600 hover:text-amber-700 hover:bg-amber-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
                <div className="pt-2 mt-2 border-t border-amber-200/50 space-y-1">
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-amber-800 hover:text-amber-900 hover:bg-amber-50 transition-all duration-200"
                  >
                    <Home className="w-5 h-5" />
                    <span>Accueil</span>
                  </Link>
                  <button
                    onClick={async () => {
                      setIsMobileMenuOpen(false)
                      await api.auth.logout()
                      router.replace('/admin/login')
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Contenu avec padding-top pour compenser le header principal + menu admin */}
      <main className="pt-[152px] max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}
