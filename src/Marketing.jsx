import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClerkControls, clerkEnabled } from './clerkAuth'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sparkles, Stars } from '@react-three/drei'
import { motion } from 'framer-motion'

function Core() {
  const ref = useRef()
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (!ref.current) return
    ref.current.rotation.y = t * 0.22
    ref.current.rotation.x = Math.sin(t * 0.28) * 0.18
  })
  return (
    <Float speed={2} rotationIntensity={0.55} floatIntensity={1.1}>
      <mesh ref={ref} scale={1.55}>
        <icosahedronGeometry args={[1.15, 8]} />
        <MeshDistortMaterial color="#7c5cff" emissive="#3ee0c8" emissiveIntensity={0.38} roughness={0.16} metalness={0.72} distort={0.4} speed={2.1} />
      </mesh>
      <mesh scale={2.15}>
        <torusGeometry args={[1.15, 0.015, 16, 120]} />
        <meshBasicMaterial color="#3ee0c8" />
      </mesh>
      <mesh rotation={[Math.PI / 2.4, 0.4, 0]} scale={2.4}>
        <torusGeometry args={[1.05, 0.01, 12, 100]} />
        <meshBasicMaterial color="#ff4d8d" />
      </mesh>
    </Float>
  )
}

function Scene() {
  return (
    <>
      <color attach="background" args={['#05060c']} />
      <ambientLight intensity={0.45} />
      <pointLight position={[4, 4, 4]} intensity={18} color="#8a7dff" />
      <pointLight position={[-5, -2, -3]} intensity={12} color="#3ee0c8" />
      <Stars radius={80} depth={40} count={2200} factor={3} fade speed={0.8} />
      <Sparkles count={80} scale={10} size={3} speed={0.4} color="#c9c4ff" />
      <Core />
    </>
  )
}

function MiniOrb() {
  return (
    <Canvas camera={{ position: [0, 0, 4.2], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 3]} intensity={10} color="#ff4d8d" />
      <Float speed={3} floatIntensity={1.6}>
        <mesh>
          <torusKnotGeometry args={[0.85, 0.26, 180, 18]} />
          <MeshDistortMaterial color="#3ee0c8" distort={0.25} speed={3} metalness={0.8} roughness={0.15} />
        </mesh>
      </Float>
    </Canvas>
  )
}

export default function Marketing() {
  const [stats, setStats] = useState({ members: 0, campaigns: 0, generations: 0, liveProviders: 0 })
  const [services, setServices] = useState([])
  const [plans, setPlans] = useState([])
  const [packs, setPacks] = useState([])
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [note, setNote] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetch('/api/stats').then((r) => r.json()).then(setStats).catch(() => {})
    fetch('/api/services').then((r) => r.json()).then(setServices).catch(() => {})
    fetch('/api/plans').then((r) => r.json()).then(setPlans).catch(() => {})
    fetch('/api/catalog').then((r) => r.json()).then((all) => setPacks(all.filter((p) => p.kind === 'pack'))).catch(() => {})
  }, [])

  async function submit(e) {
    e.preventDefault()
    setNote('পাঠানো হচ্ছে…')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error)
      setNote('ধন্যবাদ — আমরা ইমেইলে উত্তর দেব।')
      setForm({ name: '', email: '', message: '' })
    } catch {
      setNote('এখন পাঠানো যায়নি। পরে চেষ্টা করুন।')
    }
  }

  return (
    <>
      <nav className="nav">
        <Link className="brand" to="/"><div className="logo" /> ImageForge AI</Link>
        <div className="nav-links">
          <a href="#products">টুলস</a>
          <a href="#packs">ডিজিটাল প্যাক</a>
          <a href="#pricing">প্রাইসিং</a>
          <Link to="/login">লগইন</Link>
        </div>
        {clerkEnabled ? <ClerkControls compact /> : <Link className="nav-cta" to="/signup">ফ্রি শুরু</Link>}
        <button type="button" className="menu-btn" onClick={() => setOpen((v) => !v)} aria-label="মেনু">☰</button>
      </nav>
      <div className={`drawer ${open ? 'open' : ''}`}>
        <a href="#products" onClick={() => setOpen(false)}>টুলস</a>
        <a href="#packs" onClick={() => setOpen(false)}>ডিজিটাল প্যাক</a>
        <a href="#pricing" onClick={() => setOpen(false)}>প্রাইসিং</a>
        <Link to="/login" onClick={() => setOpen(false)}>লগইন</Link>
        <Link to="/signup" onClick={() => setOpen(false)}>সাইন আপ</Link>
      </div>

      <header className="hero">
        <div className="canvas-wrap">
          <Canvas camera={{ position: [0, 0, 5.4], fov: 48 }}>
            <Scene />
          </Canvas>
        </div>
        <motion.div className="hero-copy" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <p className="kicker live-dot"><i /> Neuro-marketing · ১০০% ডিজিটাল</p>
          <h1>মস্তিষ্ক পড়ে<span>কপি ফোর্জ করে</span></h1>
          <p className="lede">
            ImageForge AI — অনলাইন নিউরো-মার্কেটিং স্টুডিও। অ্যাড, হেডলাইন, ফানেল, ট্রিগার ম্যাপ ও ক্রিয়েটিভ প্রম্পট। কোনো ফিজিক্যাল প্রোডাক্ট নেই, কোনো ডেমো অ্যাকাউন্ট নেই।
          </p>
          <div className="hero-actions">
            <Link className="btn primary" to="/signup">অ্যাকাউন্ট খুলুন</Link>
            <a className="btn ghost" href="#pricing">প্ল্যান দেখুন</a>
          </div>
        </motion.div>
      </header>

      <div className="stats">
        <div className="stat"><b>{stats.liveProviders}</b><span>লাইভ AI প্রোভাইডার</span></div>
        <div className="stat"><b>{stats.generations}</b><span>জেনারেটেড অ্যাসেট</span></div>
        <div className="stat"><b>{stats.campaigns}</b><span>ডিজিটাল ক্যাম্পেইন</span></div>
        <div className="stat"><b>{stats.members}</b><span>রেজিস্টার্ড মেম্বার</span></div>
      </div>

      <section id="products">
        <h2 className="section-title">ডিজিটাল নিউরো টুলস</h2>
        <p className="section-sub">প্রতিটি আউটপুট অনলাইনে ডেলিভার হয় — ক্রেডিট খরচ করে স্টুডিওতে জেনারেট করুন।</p>
        <div className="grid">
          {services.map((s) => (
            <article className="card" key={s.id}>
              <small>{s.en}</small>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="packs" className="about">
        <div>
          <h2 className="section-title">ওয়ান-টাইম ডিজিটাল প্যাক</h2>
          <p className="section-sub">লাইফটাইম আনলক + বোনাস ক্রেডিট। শিপিং নেই, ওয়্যারহাউস নেই — পেমেন্ট কনফার্মের সাথেই লাইব্রেরিতে চলে আসে।</p>
          <div className="grid">
            {packs.map((p) => (
              <article className="card" key={p.id}>
                <small>৳{p.price} · +{p.bonusCredits} ক্রেডিট</small>
                <h3>{p.bn}</h3>
                <p>{p.blurb}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="orb"><MiniOrb /></div>
      </section>

      <section id="pricing">
        <h2 className="section-title">ক্রেডিট প্ল্যান</h2>
        <p className="section-sub">Spark ফ্রি। Pulse ও Synapse bKash/Nagad — আপনার নিজের অ্যাকাউন্ট দিয়ে কিনুন।</p>
        <div className="grid price-grid">
          {plans.map((p) => (
            <article className={`card price ${p.bdt > 0 && p.id === 'pulse' ? 'hot' : ''}`} key={p.id}>
              <small>{p.tag}</small>
              <h3>{p.name}</h3>
              <p className="amount">{p.bdt === 0 ? '৳০' : `৳${p.bdt.toLocaleString()}`}</p>
              <ul>
                {(p.features || []).map((f) => <li key={f}>{f}</li>)}
              </ul>
              <Link className="btn primary" to="/signup">{p.bdt === 0 ? 'ফ্রি সাইন আপ' : 'কিনতে সাইন আপ'}</Link>
            </article>
          ))}
        </div>
      </section>

      <section id="contact">
        <h2 className="section-title">এজেন্সি / পার্টনারশিপ</h2>
        <form onSubmit={submit}>
          <input placeholder="নাম / ব্র্যান্ড" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input type="email" placeholder="ইমেইল" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <textarea placeholder="কী ডিজিটাল ক্যাম্পেইন চালাবেন?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          <button className="btn primary" type="submit">মেসেজ পাঠান</button>
          <p className="form-note">{note}</p>
        </form>
      </section>
      <footer>
        <span>© {new Date().getFullYear()} ImageForge AI · Digital neuro-marketing</span>
        <span>Dhaka · No physical SKUs</span>
      </footer>
    </>
  )
}
