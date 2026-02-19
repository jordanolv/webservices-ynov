/**
 * Upload sécurisé - validation magic bytes, path traversal, noms sécurisés
 * Principes: jamais faire confiance à l'entrée utilisateur
 */
import { randomUUID } from 'node:crypto'
import { mkdir, writeFile, unlink } from 'node:fs/promises'
import path from 'node:path'

const MAX_SIZE = 20 * 1024 * 1024 // 20MB
const ALLOWED: Record<string, { magic: number[]; ext: string }> = {
  jpeg: { magic: [0xff, 0xd8, 0xff], ext: '.jpg' },
  png: { magic: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], ext: '.png' },
  gif: { magic: [0x47, 0x49, 0x46, 0x38], ext: '.gif' },
  webp: { magic: [0x52, 0x49, 0x46, 0x46], ext: '.webp' },
}

/** Binaires et scripts explicitement interdits (vérifiés en premier) */
const BLOCKED: { magic: number[]; name: string }[] = [
  { magic: [0x7f, 0x45, 0x4c, 0x46], name: 'ELF (Linux)' },
  { magic: [0x4d, 0x5a], name: 'PE/EXE (Windows)' },
  { magic: [0xcf, 0xfa, 0xed, 0xfe], name: 'Mach-O (macOS)' },
  { magic: [0x3c, 0x3f, 0x70, 0x68, 0x70], name: 'PHP' },
  { magic: [0x3c, 0x3f, 0x78, 0x6d, 0x6c], name: 'XML' },
  { magic: [0x3c, 0x21, 0x44, 0x4f, 0x43], name: 'HTML' },
  { magic: [0x3c, 0x73, 0x76, 0x67], name: 'SVG' },
  { magic: [0x25, 0x50, 0x44, 0x46], name: 'PDF' },
  { magic: [0xca, 0xfe, 0xba, 0xbe], name: 'Java class' },
  { magic: [0x50, 0x4b, 0x03, 0x04], name: 'ZIP/JAR' },
  { magic: [0x50, 0x4b, 0x05, 0x06], name: 'ZIP (empty)' },
  { magic: [0x1f, 0x8b], name: 'GZIP' },
  { magic: [0x23, 0x21], name: 'Shebang (shell)' },
]

function matches(buf: Buffer, sig: number[], offset = 0): boolean {
  if (buf.length < offset + sig.length) return false
  return sig.every((b, i) => buf[offset + i] === b)
}

function isWebP(buf: Buffer): boolean {
  return buf.length >= 12 && matches(buf, [0x52, 0x49, 0x46, 0x46]) && matches(buf, [0x57, 0x45, 0x42, 0x50], 8)
}

export function validateImage(buffer: Buffer): { ok: true; ext: string } | { ok: false; error: string } {
  if (buffer.length > MAX_SIZE) return { ok: false, error: 'Fichier trop volumineux (max 20 Mo)' }
  if (buffer.length < 12) return { ok: false, error: 'Fichier invalide' }

  for (const { magic, name } of BLOCKED) {
    if (matches(buffer, magic)) return { ok: false, error: `Type interdit: ${name}` }
  }

  if (isWebP(buffer)) return { ok: true, ext: '.webp' }
  for (const [key, { magic, ext }] of Object.entries(ALLOWED)) {
    if (key === 'webp') continue
    if (matches(buffer, magic)) return { ok: true, ext }
  }

  return { ok: false, error: 'Format image non reconnu (JPEG, PNG, GIF, WebP)' }
}

export function safeFilename(): string {
  return `${randomUUID()}`
}

/** Nom de fichier autorisé: uuid.ext uniquement */
const SAFE_PATTERN = /^[a-f0-9-]{36}\.(jpg|jpeg|png|gif|webp)$/i
export function isSafeFilename(name: string): boolean {
  return SAFE_PATTERN.test(name)
}

export async function saveUpload(
  buffer: Buffer,
  subdir: string,
  ext: string
): Promise<{ filename: string; relativePath: string }> {
  const baseDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')
  const dir = path.resolve(baseDir, subdir)
  await mkdir(dir, { recursive: true })

  const filename = `${safeFilename()}${ext}`
  const filepath = path.join(dir, filename)
  const resolved = path.resolve(filepath)
  if (!resolved.startsWith(path.resolve(dir))) throw new Error('Path traversal')
  await writeFile(resolved, buffer, { mode: 0o644 })
  return { filename, relativePath: `/uploads/${subdir}/${filename}` }
}

export async function deleteUpload(subdir: string, filename: string): Promise<void> {
  if (!isSafeFilename(filename)) throw new Error('Nom de fichier invalide')
  const baseDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')
  const filepath = path.resolve(baseDir, subdir, filename)
  const dirResolved = path.resolve(baseDir, subdir)
  if (!filepath.startsWith(dirResolved)) throw new Error('Path traversal')
  await unlink(filepath)
}
