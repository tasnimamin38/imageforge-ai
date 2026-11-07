import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

const OAUTH_STATE_TTL_MS = 5 * 60 * 1000
const MIN_SECRET_LENGTH = 32

function safeEqual(leftValue, rightValue) {
  const left = Buffer.from(String(leftValue ?? ''), 'utf8')
  const right = Buffer.from(String(rightValue ?? ''), 'utf8')
  return left.length === right.length && timingSafeEqual(left, right)
}

export function resolveJwtSecret({
  secret = process.env.JWT_SECRET,
  nodeEnv = process.env.NODE_ENV,
} = {}) {
  const configured = typeof secret === 'string' ? secret.trim() : ''
  if (configured.length >= MIN_SECRET_LENGTH) return configured
  if (nodeEnv === 'production') {
    throw new Error('JWT_SECRET must be configured with at least 32 characters in production.')
  }
  return randomBytes(32).toString('hex')
}

export function buildAllowedOrigins({
  appUrl = process.env.APP_URL,
  extraOrigins = process.env.CORS_ORIGINS,
  nodeEnv = process.env.NODE_ENV,
} = {}) {
  const origins = new Set()
  const addOrigin = (value) => {
    const candidate = String(value || '').trim()
    if (!candidate) return
    let parsed
    try {
      parsed = new URL(candidate)
    } catch {
      throw new Error(`Invalid CORS origin: ${candidate}`)
    }
    const localHttp = nodeEnv !== 'production' && parsed.protocol === 'http:'
    if (parsed.protocol !== 'https:' && !localHttp) {
      throw new Error('CORS origins must use HTTPS in production.')
    }
    origins.add(parsed.origin)
  }

  addOrigin(appUrl)
  String(extraOrigins || '').split(',').forEach(addOrigin)

  if (nodeEnv !== 'production') {
    ;[
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:8787',
      'http://127.0.0.1:8787',
    ].forEach(addOrigin)
  }

  return origins
}

export function isOriginAllowed(origin, allowedOrigins) {
  return !origin || allowedOrigins.has(origin)
}

export function isAdminBootstrapAuthorized({ email, token, adminEmail, bootstrapToken }) {
  const configuredEmail = String(adminEmail || '').trim().toLowerCase()
  const suppliedEmail = String(email || '').trim().toLowerCase()
  const expectedToken = String(bootstrapToken || '')
  if (!configuredEmail || configuredEmail !== suppliedEmail || expectedToken.length < MIN_SECRET_LENGTH) {
    return false
  }
  return safeEqual(token, expectedToken)
}

export function createOAuthState(secret, nowMs = Date.now()) {
  const state = randomBytes(32).toString('hex')
  const expiresAt = nowMs + OAUTH_STATE_TTL_MS
  const payload = `${state}.${expiresAt}`
  const signature = createHmac('sha256', secret).update(payload).digest('hex')
  return { state, cookieValue: `${payload}.${signature}` }
}

export function verifyOAuthState({ state, cookieValue, secret, nowMs = Date.now() }) {
  const parts = String(cookieValue || '').split('.')
  if (parts.length !== 3) return false
  const [nonce, expiryText, signature] = parts
  const expiresAt = Number(expiryText)
  if (!nonce || !Number.isSafeInteger(expiresAt) || expiresAt < nowMs) return false
  const payload = `${nonce}.${expiryText}`
  const expected = createHmac('sha256', secret).update(payload).digest('hex')
  return safeEqual(signature, expected) && safeEqual(state, nonce)
}
