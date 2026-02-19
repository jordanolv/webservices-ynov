import mongoose, { Schema } from 'mongoose'

const itemSchema = new Schema(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    imageUrl: String,
  },
  { _id: false }
)

const orderSchema = new Schema(
  {
    stripeSessionId: { type: String, required: true, unique: true },
    stripePaymentIntentId: String,
    orderNumber: { type: String, required: true, unique: true },
    status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'], default: 'pending' },
    paymentStatus: { type: String, enum: ['unpaid', 'paid', 'failed', 'refunded'], default: 'unpaid' },
    customer: {
      email: { type: String, required: true },
      name: { type: String, required: true },
      phone: String,
    },
    shippingAddress: {
      line1: { type: String, required: true },
      line2: String,
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    items: [itemSchema],
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'eur' },
    paidAt: Date,
  },
  { timestamps: true }
)

orderSchema.index({ 'customer.email': 1 })
orderSchema.index({ status: 1 })
orderSchema.index({ createdAt: -1 })

orderSchema.statics.generateOrderNumber = async function (): Promise<string> {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  const count = await this.countDocuments({ createdAt: { $gte: start, $lte: end } })
  return `CMD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(count + 1).padStart(4, '0')}`
}

export const Order = mongoose.model('Order', orderSchema)
