'use client'

import { useState, useEffect } from 'react'
import { Paintbrush, Copy, X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ColorVariables {
  primary: string
  primaryHover: string
  amber50: string
  amber100: string
  amber600: string
  amber700: string
  amber800: string
  amber900: string
  overlayOpacity: number
}

const defaultColors: ColorVariables = {
  primary: '#ffbd76',
  primaryHover: '#e6a866',
  amber50: '#fffbeb',
  amber100: '#fef3c7',
  amber600: '#d97706',
  amber700: '#b45309',
  amber800: '#92400e',
  amber900: '#78350f',
  overlayOpacity: 0.7,
}

export default function ColorCustomizer() {
  const [isOpen, setIsOpen] = useState(false)
  const [colors, setColors] = useState<ColorVariables>(defaultColors)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Appliquer les couleurs en temps réel
    const root = document.documentElement
    root.style.setProperty('--color-primary', colors.primary)
    root.style.setProperty('--color-primary-hover', colors.primaryHover)
    root.style.setProperty('--overlay-opacity', colors.overlayOpacity.toString())

    // Créer des variables CSS pour chaque couleur amber
    root.style.setProperty('--amber-50', colors.amber50)
    root.style.setProperty('--amber-100', colors.amber100)
    root.style.setProperty('--amber-600', colors.amber600)
    root.style.setProperty('--amber-700', colors.amber700)
    root.style.setProperty('--amber-800', colors.amber800)
    root.style.setProperty('--amber-900', colors.amber900)
  }, [colors])

  const generateCode = () => {
    return `/* ========================================
   CODE GÉNÉRÉ PAR LE CUSTOMIZER
   À copier dans globals.css
   ======================================== */

/* 1. Variables principales dans @theme inline */
@theme inline {
  --color-primary: ${colors.primary};
  --color-primary-hover: ${colors.primaryHover};
}

/* 2. Variables globales pour les dégradés */
:root {
  --overlay-opacity: ${colors.overlayOpacity};
  --amber-50: ${colors.amber50};
  --amber-100: ${colors.amber100};
  --amber-600: ${colors.amber600};
  --amber-700: ${colors.amber700};
  --amber-800: ${colors.amber800};
  --amber-900: ${colors.amber900};
}

/* 3. Note : Les classes CSS pour appliquer ces couleurs
   sont déjà présentes dans globals.css */`
  }

  const copyCode = () => {
    navigator.clipboard.writeText(generateCode())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetColors = () => {
    setColors(defaultColors)
  }

  return (
    <>
      {/* Bouton flottant */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Personnaliser les couleurs"
      >
        <Paintbrush className="w-6 h-6" />
      </motion.button>

      {/* Panel de personnalisation */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop transparent - pas de flou pour voir les changements en direct */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-transparent z-50"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Personnalisation des couleurs</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Couleur principale */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Couleur principale (boutons, accents)
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={colors.primary}
                      onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                      className="w-16 h-16 rounded-lg cursor-pointer border-2 border-gray-300"
                    />
                    <input
                      type="text"
                      value={colors.primary}
                      onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Couleur hover */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Couleur hover (survol boutons)
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={colors.primaryHover}
                      onChange={(e) => setColors({ ...colors, primaryHover: e.target.value })}
                      className="w-16 h-16 rounded-lg cursor-pointer border-2 border-gray-300"
                    />
                    <input
                      type="text"
                      value={colors.primaryHover}
                      onChange={(e) => setColors({ ...colors, primaryHover: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                    />
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Couleurs amber */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Palette Amber (tons chauds)</h3>

                  <div className="space-y-4">
                    {Object.entries(colors)
                      .filter(([key]) => key.startsWith('amber'))
                      .map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-sm font-semibold text-gray-700 mb-2 capitalize">
                            {key.replace('amber', 'Amber ')}
                          </label>
                          <div className="flex gap-3 items-center">
                            <input
                              type="color"
                              value={value}
                              onChange={(e) => setColors({ ...colors, [key]: e.target.value })}
                              className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                            />
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => setColors({ ...colors, [key]: e.target.value })}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Opacité du dégradé */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Opacité du dégradé (header) : {(colors.overlayOpacity * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={colors.overlayOpacity}
                    onChange={(e) => setColors({ ...colors, overlayOpacity: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <hr className="border-gray-200" />

                {/* Code généré */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-800">Code CSS généré</h3>
                    <button
                      onClick={copyCode}
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copié !
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copier
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono">
                    {generateCode()}
                  </pre>
                </div>

                {/* Bouton reset */}
                <button
                  onClick={resetColors}
                  className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Réinitialiser les couleurs par défaut
                </button>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">📝 Instructions</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Ajuste les couleurs en temps réel</li>
                    <li>Clique sur &quot;Copier&quot; pour copier le code</li>
                    <li>Envoie le code à Jordan pour application définitive</li>
                  </ol>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
