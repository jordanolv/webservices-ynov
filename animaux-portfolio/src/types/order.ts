export interface OrderItem {
  productId: string
  productName: string
  size: string
  quantity: number
  unitPrice: number
  totalPrice: number
  imageUrl?: string
}

export interface ShippingAddress {
  fullName: string
  address: string
  city: string
  postalCode: string
  country: string
  phone?: string
}

export interface Customer {
  name: string
  email: string
}

export interface Order {
  _id: string
  orderNumber: string
  customer: Customer
  shippingAddress: ShippingAddress
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  totalAmount: number
  status: string
  paymentStatus: string
  stripeSessionId: string
  stripePaymentIntentId?: string
  tracking?: {
    carrier: string
    trackingNumber: string
    trackingUrl?: string
  }
  createdAt: string
  updatedAt: string
}
