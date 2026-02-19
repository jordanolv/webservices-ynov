import { promises as fs } from 'fs';
import path from 'path';
import { spawn } from 'child_process';

/** Format des noms générés par generateSecureFilename : timestamp-random.ext */
const SAFE_FILENAME_REGEX = /^\d+-[a-z0-9]+\.(jpg|jpeg|png|gif|webp)$/;

export function isSafeUploadFilename(filename: string): boolean {
  return typeof filename === 'string' && SAFE_FILENAME_REGEX.test(filename);
}

// Chemin HORS de l'application pour stocker les uploads
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/var/uploads/animaux-portfolio';

/**
 * S'assure que le dossier d'upload existe et a les bonnes permissions
 */
export async function ensureUploadDirectory(): Promise<void> {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    // Le dossier n'existe pas, on le crée
    await fs.mkdir(UPLOAD_DIR, { recursive: true, mode: 0o755 });
  }
}

/**
 * Sauvegarde le fichier de manière sécurisée
 */
export async function saveFileSecurely(
  buffer: Buffer,
  filename: string
): Promise<{ path: string; url: string }> {
  await ensureUploadDirectory();

  const filePath = path.join(UPLOAD_DIR, filename);

  // Écrire le fichier avec des permissions restrictives (lecture seule)
  await fs.writeFile(filePath, buffer, { mode: 0o644 });

  // CRITICAL: Supprimer TOUTES les permissions d'exécution
  await fs.chmod(filePath, 0o644); // rw-r--r--

  // chmod/chattr via spawn (pas de shell, filename généré par nous)
  try {
    await new Promise<void>((resolve, reject) => {
      const p = spawn('chmod', ['644', filePath], { shell: false });
      p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`chmod ${code}`))));
    });
    await new Promise<void>((resolve) => {
      const p = spawn('chattr', ['+i', filePath], { shell: false });
      p.on('close', () => resolve());
      p.on('error', () => resolve());
    });
  } catch (error) {
    console.warn('Could not set immutable flag:', error);
  }

  // Retourner l'URL publique (à adapter selon votre config nginx)
  const publicUrl = `/uploads/${filename}`;

  return {
    path: filePath,
    url: publicUrl,
  };
}

/**
 * Supprime un fichier de manière sécurisée.
 * CRITICAL: filename doit être validé avec isSafeUploadFilename() avant appel
 * (sinon risque d'injection de commande si passé à exec).
 */
export async function deleteFileSecurely(filename: string): Promise<void> {
  if (!isSafeUploadFilename(filename)) {
    throw new Error('Invalid filename format');
  }

  const filePath = path.join(UPLOAD_DIR, filename);
  const normalizedPath = path.resolve(filePath);
  const baseResolved = path.resolve(UPLOAD_DIR);

  if (!normalizedPath.startsWith(baseResolved)) {
    throw new Error('Invalid file path');
  }

  try {
    // chattr via spawn (pas de shell = pas d'injection)
    await new Promise<void>((resolve, reject) => {
      const p = spawn('chattr', ['-i', filePath], { shell: false });
      p.on('close', (code) => {
        if (code === 0 || code === 1) resolve(); // 1 = attribute not set
        else reject(new Error(`chattr exited ${code}`));
      });
      p.on('error', () => resolve()); // chattr absent = ignorer
    });
  } catch {
    // chattr peut manquer ou échouer, on continue
  }
  await fs.unlink(filePath);
}

/**
 * Scan antivirus basique (optionnel)
 * Nécessite ClamAV installé sur le serveur: apt-get install clamav
 */
export async function scanFileWithClamAV(filePath: string): Promise<boolean> {
  if (!process.env.ENABLE_ANTIVIRUS_SCAN) {
    return true; // Skip si non activé
  }

  try {
    const stdout = await new Promise<string>((resolve, reject) => {
      const p = spawn('clamscan', ['--no-summary', filePath], { shell: false });
      let out = '';
      p.stdout?.on('data', (d) => { out += d; });
      p.stderr?.on('data', (d) => { out += d; });
      p.on('close', (code) => (code === 0 ? resolve(out) : resolve(out)));
      p.on('error', () => reject(new Error('clamscan not found')));
    });
    return !stdout.includes('FOUND');
  } catch (error) {
    console.error('ClamAV scan failed:', error);
    // En cas d'erreur, on refuse le fichier par sécurité
    return false;
  }
}
