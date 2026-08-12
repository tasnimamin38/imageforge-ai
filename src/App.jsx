import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, OrbitControls, Sparkles, Stars } from '@react-three/drei'
import { motion } from 'framer-motion'

function Core() {
  const ref = useRef()
  useFrame((state) => {
    const t = state.clock.elapsedTime
    ref.current.rotation.y = t * 0.25
    ref.current.rotation.x = Math.sin(t * 0.3) * 0.2
  })
  return (
    <Float speed={2} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh ref={ref} scale={1.6}>
        <icosahedronGeometry args={[1.15, 8]} />
        <MeshDistortMaterial
          color="#6d5efc"
          emissive="#3ee0c8"
          emissiveIntensity={0.35}
          roughness={0.18}
          metalness={0.7}
          distort={0.42}
          speed={2.2}
        />
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
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6} />
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

export default function App() {
  const [stats, setStats] = useState({ visitors: 12840, projects: 86, uptime: 99.98 })
  const [services, setServices] = useState([])
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [note, setNote] = useState('')

  useEffect(() => {
    fetch('/api/stats').then((r) => r.json()).then(setStats).catch(() => {})
    fetch('/api/services').then((r) => r.json()).then(setServices).catch(() => {
      setServices([
        { id: 'web', title: 'ইমার্সিভ ওয়েব', en: 'Immersive Web', desc: 'থ্রিডি, মোশন ও পারফরম্যান্স-ফার্স্ট প্রোডাক্ট সাইট।' },
        { id: 'ai', title: 'এআই সিস্টেম', en: 'AI Systems', desc: 'কাস্টম মডেল, অটোমেশন ও ইন্টেলিজেন্ট ওয়ার্কফ্লো।' },
        { id: 'cloud', title: 'ক্লাউড প্ল্যাটফর্ম', en: 'Cloud Platforms', desc: 'স্কেলেবল API, ড্যাশবোর্ড ও ইনফ্রাস্ট্রাকচার।' },
        { id: 'brand', title: 'ডিজিটাল ব্র্যান্ড', en: 'Digital Brand', desc: 'আইডেন্টিটি, মোশন সিস্টেম ও লাইভ ক্যাম্পেইন।' },
      ])
    })
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
      setNote('এখন পাঠানো যায়নি। একটু পরে চেষ্টা করুন।')
    }
  }

  return (
    <>
      <nav className="nav">
        <div className="brand"><div className="logo" /> মাইক্রোসাস</div>
        <div className="nav-links">
          <a href="#services">সার্ভিস</a>
          <a href="#about">আমরা</a>
          <a href="#contact">যোগাযোগ</a>
        </div>
        <a className="nav-cta" href="#contact">প্রজেক্ট শুরু</a>
      </nav>

      <header className="hero">
        <div className="canvas-wrap">
          <Canvas camera={{ position: [0, 0, 5.4], fov: 48 }}>
            <Scene />
          </Canvas>
        </div>
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
        >
          <p className="kicker">Live · 3D · Full Stack</p>
          <h1>মাইক্রোসাস<span>ভবিষ্যৎ ইন্টারফেস</span></h1>
          <p className="lede">
            আমরা লাইভ থ্রিডি, এআই ও ক্লাউড দিয়ে এমন ডিজিটাল অভিজ্ঞতা তৈরি করি যা স্পন্দিত, দ্রুত এবং অবিস্মরণীয়।
          </p>
          <div className="hero-actions">
            <a className="btn primary" href="#services">কাজ দেখুন</a>
            <a className="btn ghost" href="#contact">ব্রিফ পাঠান</a>
          </div>
        </motion.div>
      </header>

      <div className="stats">
        <div className="stat"><b>{formatted.visitors}</b><span>লাইভ সিগনাল / ভিজিটর</span></div>
        <div className="stat"><b>{formatted.projects}</b><span>শিপ করা প্রোডাক্ট</span></div>
        <div className="stat"><b>{formatted.uptime}</b><span>প্ল্যাটফর্ম আপটাইম</span></div>
      </div>

      <section id="services">
        <h2 className="section-title">যা আমরা ফোর্জ করি</h2>
        <p className="section-sub">ওয়েব, ইন্টেলিজেন্স ও ইনফ্রা — একই স্টুডিওতে, একই স্পন্দনে।</p>
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

      <section id="about" className="about">
        <div>
          <h2 className="section-title">একটি স্টুডিও, অসীম স্তর</h2>
          <p className="section-sub">
            মাইক্রোসাস ডিজাইন সিস্টেম, রিয়েলটাইম রেন্ডার ও ব্যাকএন্ড ইঞ্জিন একসাথে বেঁধে দেয়।
            প্রতিটি প্রোডাক্টই লাইভ — অ্যানিমেশন শুধু সাজ নয়, সিস্টেমের শ্বাস।
          </p>
        </div>
        <div className="orb"><MiniOrb /></div>
      </section>

      <section id="contact">
        <h2 className="section-title">চলুন কিছু বানাই</h2>
        <p className="section-sub">নাম, ইমেইল আর আইডিয়া লিখুন — API সরাসরি স্টুডিওতে পৌঁছে দেবে।</p>
        <form onSubmit={submit}>
          <input placeholder="আপনার নাম" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input type="email" placeholder="ইমেইল" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <textarea placeholder="প্রজেক্টের সংক্ষিপ্ত বর্ণনা" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <button className="btn primary" type="submit">বার্তা পাঠান</button>
          <p className="form-note">{note}</p>
        </form>
      </section>

      <footer>
        <span>© {new Date().getFullYear()} মাইক্রোসাস / Microsys</span>
        <span>Dhaka · The Cloud</span>
      </footer>
    </>
  )
}
