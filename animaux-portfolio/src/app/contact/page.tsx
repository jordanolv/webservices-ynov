'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, Camera, Heart } from 'lucide-react'
import Loader from '@/components/Loader'
import { useLoader } from '@/hooks/useLoader'
import { api } from '@/services/api'

export default function Contact() {
  const isLoading = useLoader(500)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Demande générale',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  if (isLoading) {
    return <Loader />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await api.contact(formData)
      setIsSubmitted(true)
      setFormData({ name: '', email: '', phone: '', subject: 'Demande générale', message: '' })
    } catch (error) {
      console.error('Erreur réseau:', error)
      alert('Erreur de connexion. Veuillez vérifier votre connexion internet.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-100 to-[#efc593] pt-20">
      {/* Page Header */}
      <div className="bg-[#ffbd76]/20 backdrop-blur-md border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-amber-900 mb-4">
              Contactez-moi
            </h1>
            <p className="text-xl text-amber-800 max-w-2xl mx-auto">
              Une question, un projet, une envie de collaboration ? 
              Je serais ravi d&apos;échanger avec vous !
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#ffbd76] rounded-full flex items-center justify-center">
                  <Camera className="w-6 h-6 text-amber-900" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-amber-900">Dylan Olivier</h2>
                  <p className="text-amber-800">Photographe Animalier Passionné</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#ffbd76]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-1">Email</h3>
                    <p className="text-amber-800">dylanolivierphotographie@gmail.com</p>
                    <p className="text-sm text-amber-700">
                      Réponse sous 24h en moyenne
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#ffbd76]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-1">Téléphone</h3>
                    <p className="text-amber-800">06 19 65 19 33</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#ffbd76]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-1">Localisation</h3>
                    <p className="text-amber-800">Compiègne</p>
                    <p className="text-sm text-amber-700">
                      Déplacements possibles dans toute la France
                    </p>
                  </div>
                </div>

              </div>

              {/* CTA Section */}
              <div className="mt-8 p-6 bg-amber-50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <Heart className="w-6 h-6 text-[#ffbd76]" />
                  <h3 className="font-semibold text-amber-900">Pourquoi me choisir ?</h3>
                </div>
                <ul className="space-y-2 text-sm text-amber-800">
                  <li>• Spécialiste des portraits d&apos;animaux</li>
                  <li>• Approche douce et respectueuse</li>
                  <li>• Satisfaction garantie</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-amber-900 mb-6">
                Écrivez-moi
              </h2>

              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center gap-2 text-green-700">
                    <Send className="w-5 h-5" />
                    <span className="font-medium">Message envoyé !</span>
                  </div>
                  <p className="text-green-600 text-sm mt-1">
                    Merci pour votre message. Je vous réponds dans les plus brefs délais.
                  </p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 text-black">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-amber-900 mb-2 text-right">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffbd76] focus:border-transparent"
                      placeholder="Votre nom"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-amber-900 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffbd76] focus:border-transparent"
                      placeholder="Votre numéro"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffbd76] focus:border-transparent"
                    placeholder="votre@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffbd76] focus:border-transparent"
                  >
                    <option value="Demande générale">Demande générale</option>
                    <option value="Shooting animal">Réservation shooting</option>
                    <option value="Achat photo">Achat de photos</option>
                    <option value="Collaboration">Collaboration</option>
                    <option value="Presse">Demande presse</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    placeholder="Décrivez votre projet, vos attentes, votre animal..."
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-[#ffbd76] text-amber-900 py-4 rounded-lg font-medium hover:bg-[#e6a866] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-amber-900 border-t-transparent rounded-full animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Envoyer le message
                    </>
                  )}
                </motion.button>

                <p className="text-sm text-amber-700 text-center">
                  En soumettant ce formulaire, vous acceptez que vos données soient utilisées 
                  pour vous recontacter concernant votre demande.
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}