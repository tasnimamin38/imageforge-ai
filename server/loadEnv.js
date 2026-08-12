import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

export function loadEnv() {
  const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env')
  if (!fs.existsSync(file)) return
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i < 1) continue
    const k = t.slice(0, i).trim()
    const v = t.slice(i + 1).trim()
    if (!process.env[k]) process.env[k] = v
  }
}
