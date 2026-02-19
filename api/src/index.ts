import './env.js'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import path from 'node:path'
import { createReadStream, existsSync } from 'node:fs'
import { connectDb } from './db/index.js'
import { registerRoutes } from './routes/index.js'
import { errorHandler } from './middleware/error-handler.js'

await connectDb()

const app = new Hono()

app.use(logger())
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:4090,https://animaux.dylanolivier.fr').split(',').map((s) => s.trim())
app.use(cors({ origin: corsOrigins, credentials: true }))

app.onError(errorHandler)
registerRoutes(app)

app.get('/uploads/*', async (c) => {
  const p = c.req.path.replace(/^\/uploads/, '')
  const base = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')
  const filepath = path.resolve(base, p.replace(/^\//, ''))
  const baseResolved = path.resolve(base)
  if (!filepath.startsWith(baseResolved) || path.relative(baseResolved, filepath).startsWith('..')) {
    return c.json({ message: 'Forbidden' }, 403)
  }
  if (!existsSync(filepath)) return c.notFound()
  const ext = path.extname(filepath).toLowerCase()
  const types: Record<string, string> = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' }
  const stream = createReadStream(filepath)
  return new Response(stream as unknown as ReadableStream, {
    headers: { 'Content-Type': types[ext] || 'application/octet-stream' },
  })
})

const port = parseInt(process.env.PORT || '4091', 10)
serve({ fetch: app.fetch, port })
console.log(`API running on http://localhost:${port}`)
