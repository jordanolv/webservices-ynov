'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Plus, Trash2, Grip } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getAuthHeaders } from '@/services/api'

const BASE = process.env.NEXT_PUBLIC_API_URL || ''

function fullUrl(p: string) {
  if (!p || p.startsWith('http')) return p
  return `${BASE}${p}`
}

interface GalleryImage {
  _id: string
  imageUrl: string
  order: number
  createdAt?: string
}

function SortableImage({ image, onDelete }: { image: GalleryImage; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image._id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white rounded-lg overflow-hidden transition-all duration-200 touch-none border-0 ${
        isDragging ? 'opacity-50 z-50 scale-105' : ''
      }`}
    >
      {/* Bouton déplacer : intégré dans le coin, glassmorphism discret */}
      <div className="absolute top-0 right-0 z-10">
        <button
          {...attributes}
          {...listeners}
          type="button"
          className="p-2 bg-white/10 backdrop-blur-md rounded-bl-lg hover:bg-white/15 active:bg-white/20 transition-colors touch-manipulation"
          aria-label="Déplacer l'image"
        >
          <Grip className="h-3.5 w-3.5 text-white/90" />
        </button>
      </div>

      {/* Bouton supprimer : en bas à droite, glassmorphism discret */}
      <div className="absolute bottom-2 right-2 z-10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(image._id)
          }}
          className="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/15 active:bg-white/20 transition-colors touch-manipulation"
          aria-label="Supprimer l'image"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </button>
      </div>

      {/* Image (zone non draggable pour éviter conflit avec le scroll sur mobile) */}
      <div className="aspect-square relative bg-gray-100 pointer-events-none select-none">
        <Image
          src={fullUrl(image.imageUrl)}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          draggable={false}
        />
      </div>
    </div>
  )
}

export default function AdminGallery() {
  const [list, setList] = useState<GalleryImage[]>([])
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const load = () => {
    fetch(`${BASE}/api/gallery`, { credentials: 'include', headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((j) => setList(j.data || []))
  }

  useEffect(() => {
    load()
  }, [])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = list.findIndex((img) => img._id === active.id)
    const newIndex = list.findIndex((img) => img._id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const newList = arrayMove(list, oldIndex, newIndex)
    setList(newList)
    setSaving(true)
    try {
      const res = await fetch(`${BASE}/api/gallery/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
        body: JSON.stringify({ ids: newList.map((img) => img._id) }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
    } catch (err) {
      setList(list)
      alert(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 Mo

  const handleAddImages = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFiles || selectedFiles.length === 0) return
    const tooBig = Array.from(selectedFiles).find((f) => f.size > MAX_FILE_SIZE)
    if (tooBig) {
      alert(`Fichier trop volumineux : ${tooBig.name}. Max 20 Mo par image.`)
      return
    }
    setUploading(true)
    try {
      await Promise.all(
        Array.from(selectedFiles).map(async (file) => {
          const fd = new FormData()
          fd.append('file', file)
          const res = await fetch(`${BASE}/api/gallery`, {
            method: 'POST',
            credentials: 'include',
            headers: getAuthHeaders(),
            body: fd,
          })
          const json = await res.json()
          if (!json.success) throw new Error(json.message)
        })
      )
      setSelectedFiles(null)
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      if (input) input.value = ''
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette image ?')) return
    const res = await fetch(`${BASE}/api/gallery/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: getAuthHeaders(),
    })
    const json = await res.json()
    if (!json.success) throw new Error(json.message)
    load()
  }

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg p-6 mb-8 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ajouter des images</h2>
          <p className="text-sm text-gray-500 mb-4">Max 20 Mo par image.</p>
        <form onSubmit={handleAddImages} className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setSelectedFiles(e.target.files)}
              className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={uploading || !selectedFiles?.length}
              className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              {uploading ? 'Upload...' : 'Ajouter'}
            </button>
          </div>
          {selectedFiles && selectedFiles.length > 0 && (
            <p className="text-sm text-gray-600">{selectedFiles.length} fichier(s) sélectionné(s)</p>
          )}
        </form>
      </div>

      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Images ({list.length})</h2>
          {saving && <span className="text-orange-600 text-sm">Sauvegarde en cours...</span>}
        </div>
        <p className="text-amber-800 mb-4 text-sm">Glissez-déposez les images pour les réorganiser</p>
        {list.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune image dans la galerie</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={list.map((img) => img._id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {list.map((img) => (
                  <SortableImage key={img._id} image={img} onDelete={handleDelete} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
