import mongoose, { Schema } from 'mongoose'

const sizePriceSchema = new Schema(
  { size: { type: String, required: true }, price: { type: Number, required: true } },
  { _id: false }
)

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    images: [String],
    sizePrices: [sizePriceSchema],
    isActive: { type: Boolean, default: true },
    isBestSeller: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export const Product = mongoose.model('Product', productSchema)
