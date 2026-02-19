import { describe, it, expect } from 'vitest'
import { validateImage, isSafeFilename } from '../upload.js'

describe('validateImage', () => {
  it('accepts valid JPEG (magic bytes ff d8 ff)', () => {
    const buf = Buffer.alloc(100)
    buf[0] = 0xff
    buf[1] = 0xd8
    buf[2] = 0xff
    const result = validateImage(buf)
    expect(result).toEqual({ ok: true, ext: '.jpg' })
  })

  it('accepts valid PNG', () => {
    const magic = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
    const buf = Buffer.alloc(100)
    magic.forEach((b, i) => (buf[i] = b))
    const result = validateImage(buf)
    expect(result).toEqual({ ok: true, ext: '.png' })
  })

  it('accepts valid WebP (RIFF + WEBP)', () => {
    const buf = Buffer.alloc(100)
    const riff = [0x52, 0x49, 0x46, 0x46]
    const webp = [0x57, 0x45, 0x42, 0x50]
    riff.forEach((b, i) => (buf[i] = b))
    webp.forEach((b, i) => (buf[8 + i] = b))
    const result = validateImage(buf)
    expect(result).toEqual({ ok: true, ext: '.webp' })
  })

  it('accepts valid GIF', () => {
    const magic = [0x47, 0x49, 0x46, 0x38]
    const buf = Buffer.alloc(100)
    magic.forEach((b, i) => (buf[i] = b))
    const result = validateImage(buf)
    expect(result).toEqual({ ok: true, ext: '.gif' })
  })

  it('rejects file too small (<12 bytes)', () => {
    const buf = Buffer.alloc(5)
    const result = validateImage(buf)
    expect(result).toEqual({ ok: false, error: 'Fichier invalide' })
  })

  it('rejects file too large (>20MB)', () => {
    const buf = Buffer.alloc(21 * 1024 * 1024)
    const result = validateImage(buf)
    expect(result).toEqual({ ok: false, error: 'Fichier trop volumineux (max 20 Mo)' })
  })

  it('rejects unknown format', () => {
    const buf = Buffer.alloc(100, 0x00)
    const result = validateImage(buf)
    expect(result).toEqual({ ok: false, error: 'Format image non reconnu (JPEG, PNG, GIF, WebP)' })
  })

  it('rejects ELF binary', () => {
    const buf = Buffer.alloc(100)
    const elf = [0x7f, 0x45, 0x4c, 0x46]
    elf.forEach((b, i) => (buf[i] = b))
    const result = validateImage(buf)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('ELF')
  })

  it('rejects PHP file', () => {
    const buf = Buffer.alloc(100)
    const php = [0x3c, 0x3f, 0x70, 0x68, 0x70]
    php.forEach((b, i) => (buf[i] = b))
    const result = validateImage(buf)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('PHP')
  })
})

describe('isSafeFilename', () => {
  it('accepts uuid.jpg', () => {
    expect(isSafeFilename('a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg')).toBe(true)
  })

  it('accepts uuid.png', () => {
    expect(isSafeFilename('a1b2c3d4-e5f6-7890-abcd-ef1234567890.png')).toBe(true)
  })

  it('rejects path traversal', () => {
    expect(isSafeFilename('../etc/passwd')).toBe(false)
  })

  it('rejects arbitrary names', () => {
    expect(isSafeFilename('malicious.php')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isSafeFilename('')).toBe(false)
  })
})
