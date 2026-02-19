/**
 * Test helpers — crée une app Hono identique à la prod mais sans serveur HTTP ni DB
 */
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { registerRoutes } from '../index.js'
import { errorHandler } from '../../middleware/error-handler.js'

export function createTestApp() {
  const app = new Hono()
  app.use(cors({ origin: '*', credentials: true }))
  app.onError(errorHandler)
  registerRoutes(app)
  return app
}

/** Raccourci pour les requêtes JSON */
export function jsonRequest(app: Hono, method: string, path: string, body?: unknown, headers?: Record<string, string>) {
  const init: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
  }
  if (body !== undefined) init.body = JSON.stringify(body)
  return app.request(path, init)
}

/** Requête avec token Bearer */
export function authRequest(app: Hono, method: string, path: string, token: string, body?: unknown) {
  return jsonRequest(app, method, path, body, { Authorization: `Bearer ${token}` })
}
