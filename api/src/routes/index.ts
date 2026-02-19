import type { Hono } from 'hono'
import products from './product.routes.js'
import gallery from './gallery.routes.js'
import auth from './auth.routes.js'
import checkout from './checkout.routes.js'
import contact from './contact.routes.js'
import orders from './order.routes.js'

export function registerRoutes(app: Hono) {
  app.route('/api/products', products)
  app.route('/api/gallery', gallery)
  app.route('/api/auth', auth)
  app.route('/api/checkout', checkout)
  app.route('/api/contact', contact)
  app.route('/api/orders', orders)
}
