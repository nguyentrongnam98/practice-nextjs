'use server'

import { writeFile, readdir, stat } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { revalidatePath } from 'next/cache'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'lab')
const MAX_BYTES = 2 * 1024 * 1024 // 2 MB
const ALLOWED = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp'])

export type UploadState =
  | { idle: true }
  | { ok: true; filename: string; size: number }
  | { ok: false; error: string }

export async function uploadImage(
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'No file selected.' }
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: `File too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Max 2 MB.` }
  }
  const ext = extname(file.name).toLowerCase()
  if (!ALLOWED.has(ext)) {
    return { ok: false, error: `Unsupported file type: ${ext || '(none)'}.` }
  }

  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const target = join(UPLOAD_DIR, safeName)
  const bytes = Buffer.from(await file.arrayBuffer())
  await writeFile(target, bytes)

  revalidatePath('/lab/forms/05-file-upload')
  return { ok: true, filename: safeName, size: file.size }
}

export type UploadedFile = { name: string; size: number; mtimeMs: number }

export async function listUploads(): Promise<UploadedFile[]> {
  try {
    const entries = await readdir(UPLOAD_DIR)
    const files = await Promise.all(
      entries
        .filter((f) => f !== '.gitkeep')
        .map(async (name) => {
          const s = await stat(join(UPLOAD_DIR, name))
          return { name, size: s.size, mtimeMs: s.mtimeMs }
        }),
    )
    return files.sort((a, b) => b.mtimeMs - a.mtimeMs)
  } catch {
    return []
  }
}
