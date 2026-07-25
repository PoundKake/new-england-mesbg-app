import jwt from 'jsonwebtoken'

interface CheckLoginRow {
  admin_id: string
  display_name: string
}

interface LoginRequestBody {
  username: string
  password: string
}

// Matches the cookie maxAge in app/composables/useAuth.ts.
const JWT_EXPIRES_IN = '12h'

/**
 * Verifies credentials against Postgres (via PostgREST's /rpc/check_login,
 * which does the actual bcrypt-style comparison) and, on success, signs the
 * admin JWT here using the `jsonwebtoken` npm package rather than Postgres's
 * pgjwt extension — see db/migrations/0004_functions.sql for why.
 */
export default defineEventHandler(async (event) => {
  const { username, password } = await readBody<LoginRequestBody>(event)
  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Username and password are required.' })
  }

  const config = useRuntimeConfig(event)

  let rows: CheckLoginRow[]
  try {
    rows = await $fetch<CheckLoginRow[]>('/rpc/check_login', {
      baseURL: config.apiBaseInternal,
      method: 'POST',
      body: { username, password }
    })
  } catch {
    // check_login only ever fails for one reason (bad credentials) — its
    // exact Postgres errcode isn't worth mapping through PostgREST's HTTP
    // status here; any failure means "try again."
    throw createError({ statusCode: 401, statusMessage: 'Invalid username or password.' })
  }

  const admin = rows[0]
  if (!admin) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid username or password.' })
  }

  const token = jwt.sign({ role: 'web_admin', admin_id: admin.admin_id }, config.jwtSecret, {
    expiresIn: JWT_EXPIRES_IN
  })

  return {
    token,
    admin: { id: admin.admin_id, display_name: admin.display_name }
  }
})
