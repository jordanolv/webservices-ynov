/**
 * Stockage du token admin (mémoire, perdu au refresh)
 * Utilisé pour Bearer auth - évite les problèmes de cookies cross-origin
 */
let token: string | null = null

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return token
}

export function setToken(t: string): void {
  token = t
}

export function clearToken(): void {
  token = null
}
