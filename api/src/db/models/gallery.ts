import mongoose, { Schema } from 'mongoose'

const gallerySchema = new Schema(
  {
    imageUrl: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export const Gallery = mongoose.model('Gallery', gallerySchema)
