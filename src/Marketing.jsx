import { useEffect, useMemo, useRef, useState } from 'react'
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
    ref.current.rotation.y = t * 0.25
    ref.current.rotation.x = Math.sin(t * 0.3) * 0.2
  })
  return (
    <Float speed={2} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh ref={ref} scale={1.6}>
        <icosahedronGeometry args={[1.15, 8]} />
        <MeshDistortMaterial color="#6d5efc" emissive="#3ee0c8" emissiveIntensity={0.35} roughness={0.18} metalness={0.7} distort={0.42} speed={2.2} />
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
      {/* no OrbitControls — they steal mobile taps */}
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
  const [stats, setStats] = useState({ visitors: 12840, projects: 86, uptime: 99.98 })
  const [services, setServices] = useState([])
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [note, setNote] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetch('/api/stats').then((r) => r.json()).then(setStats).catch(() => {})
    fetch('/api/services').then((r) => r.json()).then(setServices).catch(() => {})
  }, [])

  const formatted = useMemo(() => ({
    visitors: stats.visitors.toLocaleString(),
    projects: stats.projects,
    uptime: `${stats.uptime}%`,
  }), [stats])

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
      setNote('ধন্যবাদ — আমরা শীঘ্রই যোগাযোগ করব।')
      setForm({ name: '', email: '', message: '' })
    } catch {
      setNote('এখন পাঠানো যায়নি।')
    }
  }

  return (
    <>
      <nav className="nav">
        <Link className="brand" to="/"><div className="logo" /> মাইক্রোসাস MBP</Link>
        <div className="nav-links">
          <a href="#pricing">প্রাইসিং</a>
          <a href="#services">প্ল্যাটফর্ম</a>
          <Link to="/login">অ্যাপ</Link>
        </div>
        {clerkEnabled ? <ClerkControls compact /> : <Link className="nav-cta" to="/login">অ্যাপ খুলুন</Link>}
        <button type="button" className="menu-btn" onClick={() => setOpen((v) => !v)} aria-label="মেনু">☰</button>
      </nav>
      <div className={`drawer ${open ? 'open' : ''}`}>
        <a href="#pricing" onClick={() => setOpen(false)}>প্রাইসিং</a>
        <a href="#services" onClick={() => setOpen(false)}>প্ল্যাটফর্ম</a>
        <Link to="/login" onClick={() => setOpen(false)}>লগইন / অ্যাপ</Link>
        <a href="/api/auth/google" onClick={() => setOpen(false)}>Google সাইন-ইন</a>
      </div>

      <header className="hero">
        <div className="canvas-wrap">
          <Canvas camera={{ position: [0, 0, 5.4], fov: 48 }}>
            <Scene />
          </Canvas>
        </div>
        <motion.div className="hero-copy" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <p className="kicker live-dot"><i /> লাইভ · MicroSaaS · AI · ERP</p>
          <h1>মাইক্রোসাস<span>ইনকাম-রেডি প্ল্যাটফর্ম</span></h1>
          <p className="lede">
            গুগল লগইন, মাল্টি-মডেল এআই স্টুডিও, ক্রেডিট বিলিং (bKash/Nagad) আর পুরো বিজনেস OS — এক প্রোডাক্টে বিক্রি করুন।
          </p>
          <div className="hero-actions">
            <a className="btn primary" href="/api/auth/google">ফ্রি ১৫০ ক্রেডিট</a>
            <a className="btn ghost" href="#pricing">প্ল্যান দেখুন</a>
          </div>
        </motion.div>
      </header>

      <div className="stats">
        <div className="stat"><b>{formatted.visitors}</b><span>সিগনাল</span></div>
        <div className="stat"><b>{formatted.projects}</b><span>লাইভ প্রোগ্রাম</span></div>
        <div className="stat"><b>{formatted.uptime}</b><span>আপটাইম SLO</span></div>
      </div>

      <section id="services">
        <h2 className="section-title">MBP মডিউল</h2>
        <p className="section-sub">এক টেনান্ট, সম্পূর্ণ অপারেটিং সিস্টেম।</p>
        <div className="grid">
          {services.map((s) => (
            <article className="card" key={s.id} onClick={() => { window.location.href = '/login' }} style={{ cursor: 'pointer' }}>
              <small>{s.en}</small>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="about">
        <div>
          <h2 className="section-title">প্রোডাকশন গ্রেড কন্ট্রোল</h2>
          <p className="section-sub">
            ডেমো অ্যাকাউন্ট: admin@microsys.local · Microsys@2026 — অ্যাডমিন, ফাইন্যান্স ও অপস রোল আলাদা।
          </p>
        </div>
        <div className="orb"><MiniOrb /></div>
      </section>

      <section id="contact">
        <h2 className="section-title">এন্টারপ্রাইজ অনবোর্ড</h2>
        <form onSubmit={submit}>
          <input placeholder="কোম্পানি / নাম" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input type="email" placeholder="ওয়ার্ক ইমেইল" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <textarea placeholder="স্কোপ" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <button className="btn primary" type="submit">পাঠান</button>
          <p className="form-note">{note}</p>
        </form>
      </section>
      <footer>
        <span>© {new Date().getFullYear()} মাইক্রোসাস MBP</span>
        <span>SOC-ready posture · Dhaka</span>
      </footer>
    </>
  )
}
