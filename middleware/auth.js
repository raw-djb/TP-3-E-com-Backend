import jwt from 'jsonwebtoken'

// Accepts our own JWT (from /api/auth/login)
// OR an OAuth2 access token from Google (checked with Google's userinfo endpoint).
export default async function auth(req, res, next) {
  const header = req.headers.authorization || ''
  const [type, token] = header.split(' ')

  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Missing token. Use: Authorization: Bearer <token>' })
  }

  // 1. Try our own JWT
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: payload.id, email: payload.email, provider: 'jwt' }
    return next()
  } catch {
    // not a valid JWT, try OAuth2 below
  }

  // 2. Try OAuth2 access token (Google)
  try {
    const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (r.ok) {
      const info = await r.json()
      req.user = { email: info.email, provider: 'google' }
      return next()
    }
  } catch {
    // network error: fall through to 401
  }

  return res.status(401).json({ message: 'Invalid or expired token' })
}
