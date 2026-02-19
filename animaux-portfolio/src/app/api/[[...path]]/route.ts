/**
 * Proxy vers l'API Hono avec forward complet des headers (incl. cookies)
 */
const API_URL = process.env.API_URL || 'http://localhost:4091'

export async function GET(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, ctx)
}

export async function POST(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, ctx)
}

export async function PUT(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, ctx)
}

export async function PATCH(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, ctx)
}

export async function DELETE(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, ctx)
}

async function proxy(req: Request, ctx: { params?: Promise<{ path?: string[] }> }) {
  const url = new URL(req.url)
  let pathStr = ''
  try {
    const resolved = await ctx?.params
    const segments = resolved?.path ?? []
    pathStr = segments.length ? segments.join('/') : ''
  } catch {
    const match = url.pathname.match(/^\/api\/(.*)$/)
    pathStr = match?.[1] ?? ''
  }
  const target = `${API_URL}/api/${pathStr}${url.search}`
  const headers = new Headers(req.headers)
  headers.delete('host')
  const res = await fetch(target, {
    method: req.method,
    headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
  })
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  })
}
