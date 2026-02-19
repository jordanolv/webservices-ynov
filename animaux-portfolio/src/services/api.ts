import { getToken, setToken, clearToken } from '@/lib/auth-store'

const BASE = process.env.NEXT_PUBLIC_API_URL || ''

export interface CheckoutItem {
  productId: string
  productName: string
  size: string
  quantity: number
  unitPrice: number
  imageUrl?: string
}

export interface Order {
  orderNumber: string
  customer: { name: string; email: string }
  items: Array<{ productName: string; size: string; quantity: number; totalPrice: number }>
  subtotal: number
  shippingCost: number
  totalAmount: number
  shippingAddress: { line1: string; line2?: string; postalCode: string; city: string; country: string }
}

type ApiInit = { method?: string; body?: unknown; headers?: HeadersInit; skipAuth?: boolean }

export function getAuthHeaders(): Record<string, string> {
  const t = getToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

async function fetchApi<T>(endpoint: string, init?: ApiInit): Promise<T> {
  const { body, method = 'GET', headers, skipAuth } = init || {}
  const res = await fetch(`${BASE}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(skipAuth ? {} : getAuthHeaders()),
      ...(headers as object),
    },
    body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
  const json = await res.json()
  if (!json.success) throw new Error(json.message || 'Erreur')
  return json.data
}

export const api = {
  checkout: {
    createSession: (items: CheckoutItem[], customerEmail?: string) =>
      fetchApi<{ sessionId: string; url: string }>('/api/checkout/create-session', {
        method: 'POST',
        body: { items, customerEmail },
      }),
    getOrder: (sessionId: string) => fetchApi<Order>(`/api/checkout/order/${sessionId}`),
  },
  contact: (data: { name: string; email: string; phone?: string; subject: string; message: string }) =>
    fetchApi<unknown>('/api/contact', { method: 'POST', body: data }),
  auth: {
    signup: async (email: string, password: string, fullName: string) => {
      return fetchApi<{ success: boolean; message: string }>('/api/auth/signup', {
        method: 'POST',
        body: { email, password, fullName },
        skipAuth: true,
      })
    },
    login: async (email: string, password: string) => {
      const data = await fetchApi<{ id: string; email: string; token: string }>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
        skipAuth: true,
      })
      if (data.token) setToken(data.token)
      return data
    },
    logout: async () => {
      try {
        await fetchApi<unknown>('/api/auth/logout', { method: 'POST' })
      } finally {
        clearToken()
      }
    },
    me: () => fetchApi<{ _id: string; email: string }>('/api/auth/me'),
  },
}
