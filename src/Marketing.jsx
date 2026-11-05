import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClerkControls, clerkEnabled } from './clerkAuth'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sparkles, Stars } from '@react-three/drei'
import { motion, animate as motionAnimate, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'

function Core() {
  const ref = useRef()
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (!ref.current) return
    ref.current.rotation.y = t * 0.22
    ref.current.rotation.x = Math.sin(t * 0.28) * 0.18
  })
  return (
    <group>
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
    <Float speed={3.4} rotationIntensity={1.4} floatIntensity={1.25}>
      <mesh position={[2.05, 0.92, 0.15]} scale={0.19}>
        <octahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#3ee0c8" emissive="#3ee0c8" emissiveIntensity={1.5} metalness={0.7} roughness={0.2} />
      </mesh>
    </Float>
    <Float speed={2.7} rotationIntensity={1.2} floatIntensity={1.1}>
      <mesh position={[-2.15, -0.82, 0.3]} scale={0.14}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#ff4d8d" emissive="#ff4d8d" emissiveIntensity={1.25} metalness={0.7} roughness={0.2} />
      </mesh>
    </Float>
    <mesh rotation={[0.55, 0.3, 0.2]} scale={2.65}>
      <torusGeometry args={[1.04, 0.008, 10, 140]} />
      <meshBasicMaterial color="#9b8bff" transparent opacity={0.72} />
    </mesh>
    </group>
  )
}

function Scene() {
  return (
    <>
      <color attach="background" args={['#05060c']} />
      <ambientLight intensity={0.45} />
      <pointLight position={[4, 4, 4]} intensity={18} color="#8a7dff" />
      <pointLight position={[-5, -2, -3]} intensity={15} color="#3ee0c8" />
      <pointLight position={[0, 2, -4]} intensity={10} color="#ff4d8d" />
      <Stars radius={82} depth={48} count={2400} factor={3} fade speed={0.7} />
      <Sparkles count={110} scale={11} size={3.2} speed={0.42} color="#d8d4ff" />
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

function AnimatedNumber({ value }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString('en-US'))
  useEffect(() => {
    const controls = motionAnimate(count, Number(value) || 0, { duration: 1.2, ease: 'easeOut' })
    return () => controls.stop()
  }, [count, value])
  return <motion.b>{rounded}</motion.b>
}

const MotionLink = motion(Link)
const springTap = { type: 'spring', stiffness: 420, damping: 16 }

export default function Marketing() {
  const [stats, setStats] = useState({ members: 0, campaigns: 0, generations: 0, liveProviders: 0 })
  const [services, setServices] = useState([])
  const [plans, setPlans] = useState([])
  const [packs, setPacks] = useState([])
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [note, setNote] = useState('')
  const [open, setOpen] = useState(false)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const scrollProgress = useSpring(scrollYProgress, { stiffness: 115, damping: 28, restDelta: 0.001 })

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
      <motion.div className="scroll-progress" style={{ scaleX: scrollProgress }} />
      <nav className="nav">
        <Link className="brand" to="/"><div className="logo" /> ImageForge AI</Link>
        <div className="nav-links">
          <a href="#products">টুলসমূহ</a>
          <a href="#packs">ডিজিটাল প্যাকেজ</a>
          <a href="#pricing">মূল্যতালিকা</a>
          <Link to="/login">প্রবেশ করুন</Link>
        </div>
        {clerkEnabled ? <ClerkControls compact /> : <MotionLink className="nav-cta" to="/signup" whileHover={reduceMotion ? undefined : { scale: 1.045, y: -2 }} whileTap={{ scale: 0.96 }} transition={springTap}>বিনামূল্যে শুরু করুন</MotionLink>}
        <button type="button" className="menu-btn" onClick={() => setOpen((v) => !v)} aria-label="মেনু">☰</button>
      </nav>
      <div className={`drawer ${open ? 'open' : ''}`}>
        <a href="#products" onClick={() => setOpen(false)}>টুলসমূহ</a>
        <a href="#packs" onClick={() => setOpen(false)}>ডিজিটাল প্যাকেজ</a>
        <a href="#pricing" onClick={() => setOpen(false)}>মূল্যতালিকা</a>
        <Link to="/login" onClick={() => setOpen(false)}>প্রবেশ করুন</Link>
        <Link to="/signup" onClick={() => setOpen(false)}>সাইন আপ</Link>
      </div>

      <header className="hero">
        <div className="canvas-wrap">
          <Canvas camera={{ position: [0, 0, 5.4], fov: 48 }}>
            <Scene />
          </Canvas>
        </div>
        <motion.div className="hero-copy" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <p className="kicker live-dot"><i /> নিউরো-মার্কেটিং · সম্পূর্ণ ডিজিটাল</p>
          <h1>মস্তিষ্ক পড়ে<span>কপি ফোর্জ করে</span></h1>
          <p className="lede">
            ImageForge AI — অনলাইন নিউরো-মার্কেটিং স্টুডিও। অ্যাড, হেডলাইন, ফানেল, ট্রিগার ম্যাপ ও ক্রিয়েটিভ প্রম্পট। এখানে সবকিছুই ডিজিটাল — কোনো ভৌত পণ্য বা ভুয়া ডেমো অ্যাকাউন্ট নেই।
          </p>
          <div className="hero-actions">
            <MotionLink className="btn primary" to="/signup" whileHover={reduceMotion ? undefined : { scale: 1.055, y: -4 }} whileTap={{ scale: 0.95 }} transition={springTap}>অ্যাকাউন্ট তৈরি করুন</MotionLink>
            <motion.a className="btn ghost" href="#pricing" whileHover={reduceMotion ? undefined : { scale: 1.035, y: -3 }} whileTap={{ scale: 0.96 }} transition={springTap}>প্যাকেজ দেখুন</motion.a>
          </div>
        </motion.div>
      </header>

      <div className="stats">
        <div className="stat"><AnimatedNumber value={stats.liveProviders} /><span>সক্রিয় AI সেবা</span></div>
        <div className="stat"><AnimatedNumber value={stats.generations} /><span>তৈরি কনটেন্ট</span></div>
        <div className="stat"><AnimatedNumber value={stats.campaigns} /><span>ডিজিটাল ক্যাম্পেইন</span></div>
        <div className="stat"><AnimatedNumber value={stats.members} /><span>নিবন্ধিত সদস্য</span></div>
      </div>

      <section id="products">
        <h2 className="section-title">ডিজিটাল নিউরো টুলসমূহ</h2>
        <p className="section-sub">প্রতিটি ফলাফল অনলাইনেই পাবেন — ক্রেডিট ব্যবহার করে স্টুডিওতে কনটেন্ট তৈরি করুন।</p>
        <div className="grid">
          {services.map((s, i) => (
            <motion.article className="card bounce-card" key={s.id} initial={{ opacity: 0, y: 26, scale: 0.98 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} whileHover={reduceMotion ? undefined : { y: -10, scale: 1.025, rotateX: 1.6 }} whileTap={{ scale: 0.985 }} viewport={{ once: true, amount: 0.16 }} transition={{ duration: 0.62, delay: Math.min(i * 0.06, 0.24), ease: 'easeOut' }} style={{ transformPerspective: 900 }}>
              <small>{s.en}</small>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="packs" className="about">
        <div>
          <h2 className="section-title">এককালীন ডিজিটাল প্যাকেজেজ</h2>
          <p className="section-sub">একবার কিনলেই স্থায়ী অ্যাক্সেস ও বোনাস ক্রেডিট। পেমেন্ট নিশ্চিত হলেই আপনার সংগ্রহশালায় যুক্ত হবে।</p>
          <div className="grid">
            {packs.map((p, i) => (
              <motion.article className="card bounce-card" key={p.id} initial={{ opacity: 0, y: 26, scale: 0.98 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} whileHover={reduceMotion ? undefined : { y: -10, scale: 1.025, rotateX: 1.6 }} whileTap={{ scale: 0.985 }} viewport={{ once: true, amount: 0.16 }} transition={{ duration: 0.62, delay: Math.min(i * 0.06, 0.24), ease: 'easeOut' }} style={{ transformPerspective: 900 }}>
                <small>৳{p.price} · +{p.bonusCredits} ক্রেডিট</small>
                <h3>{p.bn}</h3>
                <p>{p.blurb}</p>
              </motion.article>
            ))}
          </div>
        </div>
        <div className="orb"><MiniOrb /></div>
      </section>

      <section id="pricing">
        <h2 className="section-title">ক্রেডিট প্ল্যান</h2>
        <p className="section-sub">Spark বিনামূল্যে। Pulse ও Synapse প্যাকেজ বিকাশ বা নগদের মাধ্যমে কিনুন।</p>
        <div className="grid price-grid">
          {plans.map((p) => (
            <article className={`card price ${p.bdt > 0 && p.id === 'pulse' ? 'hot' : ''}`} key={p.id}>
              <small>{p.tag}</small>
              <h3>{p.name}</h3>
              <p className="amount">{p.bdt === 0 ? '৳০' : `৳${p.bdt.toLocaleString()}`}</p>
              <ul>
                {(p.features || []).map((f) => <li key={f}>{f}</li>)}
              </ul>
              <MotionLink className="btn primary" to="/signup" whileHover={reduceMotion ? undefined : { scale: 1.04, y: -3 }} whileTap={{ scale: 0.96 }} transition={springTap}>{p.bdt === 0 ? 'ফ্রি সাইন আপ' : 'কিনতে সাইন আপ'}</MotionLink>
            </article>
          ))}
        </div>
      </section>

      <section id="contact">
        <h2 className="section-title">এজেন্সি ও অংশীদারত্ব</h2>
        <form onSubmit={submit}>
          <input placeholder="নাম / ব্র্যান্ড" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input type="email" placeholder="ইমেইল" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <textarea placeholder="কী ধরনের ডিজিটাল প্রচারাভিযান চালাতে চান?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          <motion.button className="btn primary" type="submit" whileHover={reduceMotion ? undefined : { scale: 1.025, y: -2 }} whileTap={{ scale: 0.97 }} transition={springTap}>বার্তা পাঠান</motion.button>
          <p className="form-note">{note}</p>
        </form>
      </section>
      <footer>
        <span>© {new Date().getFullYear()} ImageForge AI · ডিজিটাল নিউরো-মার্কেটিং</span>
        <span>ঢাকা · সম্পূর্ণ ডিজিটাল সেবা</span>
      </footer>
    </>
  )
}
