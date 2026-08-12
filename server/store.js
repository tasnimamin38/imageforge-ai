import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA = process.env.VERCEL ? '/tmp/mbp-data.json' : path.join(__dirname, 'data.json')

const now = () => new Date().toISOString()
const id = (p) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

function seed() {
  const hash = bcrypt.hashSync('Microsys@2026', 10)
  return {
    users: [
      { id: 'u_admin', name: 'Amina Rahman', email: 'admin@microsys.local', password: hash, role: 'admin', dept: 'Executive', title: 'CEO', plan: 'scale', credits: 12000, provider: 'password' },
      { id: 'u_fin', name: 'Rafi Chowdhury', email: 'finance@microsys.local', password: hash, role: 'finance', dept: 'Finance', title: 'CFO', plan: 'growth', credits: 2000, provider: 'password' },
      { id: 'u_ops', name: 'Nadia Islam', email: 'ops@microsys.local', password: hash, role: 'ops', dept: 'Operations', title: 'COO', plan: 'starter', credits: 150, provider: 'password' },
    ],
    customers: [
      { id: 'c1', name: 'Bengal Logistics', industry: 'Supply Chain', city: 'Chattogram', arr: 4200000, status: 'active', owner: 'Nadia Islam' },
      { id: 'c2', name: 'Dhaka Health Grid', industry: 'Healthcare', city: 'Dhaka', arr: 6100000, status: 'active', owner: 'Amina Rahman' },
      { id: 'c3', name: 'Sundarban Foods', industry: 'FMCG', city: 'Khulna', arr: 1850000, status: 'negotiation', owner: 'Rafi Chowdhury' },
      { id: 'c4', name: 'Padma Bank Digital', industry: 'Fintech', city: 'Dhaka', arr: 9800000, status: 'active', owner: 'Amina Rahman' },
    ],
    leads: [
      { id: 'l1', company: 'Metro Rail Ops', value: 2400000, stage: 'proposal', score: 82 },
      { id: 'l2', company: 'Cox Eco Resorts', value: 760000, stage: 'qualified', score: 64 },
      { id: 'l3', company: 'Jamuna Apparel', value: 3100000, stage: 'discovery', score: 51 },
    ],
    products: [
      { id: 'p1', sku: 'MBP-CORE', name: 'MBP Core License', stock: 240, reorder: 40, price: 89000, warehouse: 'DHK-01' },
      { id: 'p2', sku: 'MBP-AI', name: 'Copilot Seat', stock: 18, reorder: 25, price: 12000, warehouse: 'DHK-01' },
      { id: 'p3', sku: 'HW-SCAN', name: 'Warehouse Scanner', stock: 64, reorder: 20, price: 18500, warehouse: 'CTG-02' },
      { id: 'p4', sku: 'NET-EDGE', name: 'Edge Gateway', stock: 11, reorder: 15, price: 54000, warehouse: 'CTG-02' },
    ],
    invoices: [
      { id: 'inv-1042', customer: 'Padma Bank Digital', amount: 2450000, status: 'paid', due: '2026-07-12' },
      { id: 'inv-1043', customer: 'Dhaka Health Grid', amount: 890000, status: 'open', due: '2026-08-20' },
      { id: 'inv-1044', customer: 'Bengal Logistics', amount: 412000, status: 'overdue', due: '2026-08-01' },
      { id: 'inv-1045', customer: 'Sundarban Foods', amount: 156000, status: 'draft', due: '2026-08-28' },
    ],
    employees: [
      { id: 'e1', name: 'Amina Rahman', dept: 'Executive', role: 'CEO', salary: 420000, status: 'active' },
      { id: 'e2', name: 'Rafi Chowdhury', dept: 'Finance', role: 'CFO', salary: 280000, status: 'active' },
      { id: 'e3', name: 'Nadia Islam', dept: 'Operations', role: 'COO', salary: 265000, status: 'active' },
      { id: 'e4', name: 'Tanvir Hasan', dept: 'Engineering', role: 'Staff Engineer', salary: 195000, status: 'active' },
      { id: 'e5', name: 'Lamia Kabir', dept: 'People', role: 'HR Lead', salary: 140000, status: 'leave' },
    ],
    projects: [
      { id: 'pr1', name: 'Health Grid ERP Cutover', client: 'Dhaka Health Grid', progress: 72, status: 'on-track', budget: 6100000 },
      { id: 'pr2', name: 'Port Twin Digital', client: 'Bengal Logistics', progress: 41, status: 'at-risk', budget: 4200000 },
      { id: 'pr3', name: 'Core Banking Overlay', client: 'Padma Bank Digital', progress: 88, status: 'on-track', budget: 9800000 },
    ],
    audit: [{ at: now(), actor: 'system', action: 'seed', detail: 'MBP tenant initialized' }],
    messages: [],
    orders: [],
    chats: [],
  }
}

export function load() {
  if (!fs.existsSync(DATA)) {
    const s = seed()
    fs.writeFileSync(DATA, JSON.stringify(s, null, 2))
    return s
  }
  return JSON.parse(fs.readFileSync(DATA, 'utf8'))
}

export function save(db) {
  fs.writeFileSync(DATA, JSON.stringify(db, null, 2))
}

export function audit(db, actor, action, detail) {
  db.audit.unshift({ at: now(), actor, action, detail })
  db.audit = db.audit.slice(0, 200)
}

export { id, now }
