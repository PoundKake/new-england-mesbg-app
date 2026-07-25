import jwt from 'jsonwebtoken'
import sharp from 'sharp'
import type { MultiPartData } from 'h3'

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024
const THUMB_MAX_EDGE_PX = 400
const FULL_MAX_EDGE_PX = 1600
const JPEG_QUALITY = 80

const PHOTO_RETURN_COLUMNS = 'id,event_id,caption,players,armies,models,mime_type,created_at'

interface AdminJwtPayload {
  role: string
  admin_id: string
}

function toHexBytea(buffer: Buffer): string {
  return `\\x${buffer.toString('hex')}`
}

function repeatedFieldValues(parts: MultiPartData[], name: string): string[] {
  return parts
    .filter((part) => part.name === name && part.data)
    .map((part) => part.data.toString('utf-8').trim())
    .filter(Boolean)
}

function singleFieldValue(parts: MultiPartData[], name: string): string | null {
  return parts.find((part) => part.name === name)?.data?.toString('utf-8').trim() || null
}

/**
 * Admin-only photo upload. Resizes/compresses the image server-side (sharp
 * is Node-only, so this can't happen in the browser), then forwards the
 * caller's own Authorization header on to PostgREST for the actual insert —
 * authorization is enforced there (web_admin grants + RLS), not duplicated
 * here. This route only needs to decode the JWT itself to pull out
 * `admin_id` for the required `uploaded_by` column.
 */
export default defineEventHandler(async (event) => {
  const authorization = getHeader(event, 'authorization')
  if (!authorization?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Admin login required.' })
  }

  const config = useRuntimeConfig(event)
  const token = authorization.slice('Bearer '.length)

  let payload: AdminJwtPayload
  try {
    payload = jwt.verify(token, config.jwtSecret) as AdminJwtPayload
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Your session has expired — log in again.' })
  }

  const parts = await readMultipartFormData(event)
  if (!parts) {
    throw createError({ statusCode: 400, statusMessage: 'Expected multipart/form-data.' })
  }

  const filePart = parts.find((part) => part.name === 'file' && part.filename)
  if (!filePart?.data || !filePart.type?.startsWith('image/')) {
    throw createError({ statusCode: 400, statusMessage: 'A valid image file is required.' })
  }
  if (filePart.data.length > MAX_UPLOAD_BYTES) {
    throw createError({ statusCode: 400, statusMessage: 'Image is too large (8MB max).' })
  }

  const caption = singleFieldValue(parts, 'caption')
  const eventId = singleFieldValue(parts, 'event_id')
  const players = repeatedFieldValues(parts, 'players')
  const armies = repeatedFieldValues(parts, 'armies')
  const models = repeatedFieldValues(parts, 'models')

  // Re-encoded to a consistent JPEG regardless of source format — expected
  // to be photographs (tournament/miniature photos), so flattening any
  // transparency isn't a concern here.
  const [thumbBuffer, fullBuffer] = await Promise.all([
    sharp(filePart.data)
      .resize({ width: THUMB_MAX_EDGE_PX, height: THUMB_MAX_EDGE_PX, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY })
      .toBuffer(),
    sharp(filePart.data)
      .resize({ width: FULL_MAX_EDGE_PX, height: FULL_MAX_EDGE_PX, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY })
      .toBuffer()
  ])

  const rows = await $fetch<Array<Record<string, unknown>>>('/photos', {
    baseURL: config.apiBaseInternal,
    method: 'POST',
    query: { select: PHOTO_RETURN_COLUMNS },
    headers: { Authorization: authorization, Prefer: 'return=representation' },
    body: {
      event_id: eventId,
      caption,
      players: players.length ? players : null,
      armies: armies.length ? armies : null,
      models: models.length ? models : null,
      mime_type: 'image/jpeg',
      thumb_image_data: toHexBytea(thumbBuffer),
      full_image_data: toHexBytea(fullBuffer),
      uploaded_by: payload.admin_id
    }
  })

  return rows[0]
})
