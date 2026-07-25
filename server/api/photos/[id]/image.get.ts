interface PhotoImageRow {
  mime_type: string
  thumb_image_data?: string
  full_image_data?: string
}

/**
 * Serves one photo's image bytes. Deliberately not relying on PostgREST's
 * raw-media-type response negotiation directly from an <img src> — this
 * decodes a normal JSON response instead, which is simpler to reason about.
 * See db/migrations/0001_extensions_and_tables.sql for why images live in
 * Postgres as bytea at all.
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing photo id.' })
  }

  const size = getQuery(event).size === 'full' ? 'full' : 'thumb'
  const column = size === 'full' ? 'full_image_data' : 'thumb_image_data'

  const config = useRuntimeConfig(event)

  const rows = await $fetch<PhotoImageRow[]>('/photos', {
    baseURL: config.apiBaseInternal,
    query: { id: `eq.${id}`, select: `mime_type,${column}` }
  })

  const row = rows[0]
  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Photo not found.' })
  }

  // PostgREST's JSON interface represents bytea as a "\x"-prefixed hex
  // string, not raw bytes or base64.
  const hex = row[column]
  if (!hex?.startsWith('\\x')) {
    throw createError({ statusCode: 500, statusMessage: 'Unexpected image encoding from database.' })
  }

  setResponseHeader(event, 'Content-Type', row.mime_type)
  // Photo bytes never change after upload (re-uploading creates a new row),
  // so this is safe to cache hard.
  setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
  return Buffer.from(hex.slice(2), 'hex')
})
