import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildAllowedOrigins,
  createOAuthState,
  isAdminBootstrapAuthorized,
  isOriginAllowed,
  resolveJwtSecret,
  verifyOAuthState,
} from '../server/security.js'

test('production refuses a missing or weak JWT secret', () => {
  assert.throws(() => resolveJwtSecret({ secret: '', nodeEnv: 'production' }), /JWT_SECRET/)
  assert.throws(() => resolveJwtSecret({ secret: 'too-short', nodeEnv: 'production' }), /JWT_SECRET/)
})

test('production uses a configured high-entropy JWT secret', () => {
  const secret = 'a'.repeat(48)
  assert.equal(resolveJwtSecret({ secret, nodeEnv: 'production' }), secret)
})

test('development generates a non-default random JWT secret', () => {
  const first = resolveJwtSecret({ secret: '', nodeEnv: 'development' })
  const second = resolveJwtSecret({ secret: '', nodeEnv: 'development' })
  assert.match(first, /^[a-f0-9]{64}$/)
  assert.notEqual(first, second)
})

test('CORS allows only configured origins in production', () => {
  const allowed = buildAllowedOrigins({
    appUrl: 'https://imageforge.example/',
    extraOrigins: 'https://preview.example, https://admin.example',
    nodeEnv: 'production',
  })
  assert.equal(isOriginAllowed('https://imageforge.example', allowed), true)
  assert.equal(isOriginAllowed('https://preview.example', allowed), true)
  assert.equal(isOriginAllowed('https://attacker.example', allowed), false)
  assert.equal(isOriginAllowed(undefined, allowed), true)
  assert.throws(() => buildAllowedOrigins({ appUrl: 'http://insecure.example', nodeEnv: 'production' }), /HTTPS/)
})

test('development CORS includes local Vite and API origins', () => {
  const allowed = buildAllowedOrigins({ appUrl: '', extraOrigins: '', nodeEnv: 'development' })
  assert.equal(isOriginAllowed('http://localhost:5173', allowed), true)
  assert.equal(isOriginAllowed('http://localhost:8787', allowed), true)
  assert.equal(isOriginAllowed('https://attacker.example', allowed), false)
})

test('admin bootstrap requires the configured email and a long secret token', () => {
  const config = { adminEmail: 'owner@example.com', bootstrapToken: 'B'.repeat(48) }
  assert.equal(isAdminBootstrapAuthorized({ ...config, email: 'owner@example.com', token: 'B'.repeat(48) }), true)
  assert.equal(isAdminBootstrapAuthorized({ ...config, email: 'attacker@example.com', token: 'B'.repeat(48) }), false)
  assert.equal(isAdminBootstrapAuthorized({ ...config, email: 'owner@example.com', token: 'wrong' }), false)
  assert.equal(isAdminBootstrapAuthorized({ adminEmail: '', bootstrapToken: '', email: 'owner@example.com', token: '' }), false)
})

test('OAuth state is signed, time-limited, and rejects tampering', () => {
  const created = createOAuthState('S'.repeat(48), 1_000)
  assert.equal(verifyOAuthState({
    state: created.state, cookieValue: created.cookieValue,
    secret: 'S'.repeat(48), nowMs: 2_000,
  }), true)
  assert.equal(verifyOAuthState({
    state: 'wrong-state', cookieValue: created.cookieValue,
    secret: 'S'.repeat(48), nowMs: 2_000,
  }), false)
  assert.equal(verifyOAuthState({
    state: created.state, cookieValue: created.cookieValue,
    secret: 'S'.repeat(48), nowMs: 400_000,
  }), false)
  assert.equal(verifyOAuthState({
    state: created.state, cookieValue: created.cookieValue + 'tampered',
    secret: 'S'.repeat(48), nowMs: 2_000,
  }), false)
})
