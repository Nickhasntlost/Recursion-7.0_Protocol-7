import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const API_BASE = 'http://localhost:8000/api/v1'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.15 } }
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const mockEventsList = [
  { id: 4, title: 'Gourmet Dinner Night', date: 'May 4, 2024', capacity: 200, status: 'SYSTEMS NOMINAL' }
]

function BoxShell({ title, subtitle, icon, badge, badgeColor = 'bg-secondary-container text-on-secondary-fixed', children }) {
  return (
    <motion.div variants={itemVariants} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-on-surface-variant">{icon}</span>
          <div>
            <p className="text-sm font-bold text-on-surface leading-none">{title}</p>
            <p className="text-[10px] text-on-surface-variant mt-0.5">{subtitle}</p>
          </div>
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${badgeColor}`}>{badge}</span>
      </div>
      <div className="relative w-full rounded-3xl overflow-hidden border border-outline-variant/20 bg-surface-container" style={{ aspectRatio: '16/9' }}>
        {children}
        {/* HUD */}
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between bg-gradient-to-b from-black/30 via-transparent to-black/20">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 w-fit">
                <motion.span className="w-2 h-2 rounded-full bg-secondary-container"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }} />
                <span className="text-[10px] font-bold tracking-widest text-white uppercase">LIVE • {title}</span>
              </div>
              <div className="bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-lg w-fit"><LiveClock /></div>
            </div>
            <div className="bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/10">
              <span className="material-symbols-outlined text-white text-sm">{icon}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function ChairGrid({ chairs, occupied, free, total }) {
  if (!chairs || chairs.length === 0) {
    // Show placeholder cells using aggregate count if YOLO hasn't detected chairs
    return (
      <div className="p-4 bg-surface-container-high rounded-2xl border border-outline-variant/10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Seat Map</span>
          <div className="flex gap-3 text-[9px] font-bold uppercase tracking-widest">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-error inline-block" />OCC
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-secondary-container inline-block" />FREE
            </span>
          </div>
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {Array.from({ length: Math.max(total, 6) }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center">
              <span className="text-[9px] text-on-surface-variant font-bold">{i + 1}</span>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-on-surface-variant mt-2 text-center">Seat map updates when backend is running</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-surface-container-high rounded-2xl border border-outline-variant/10">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
          Seat Map — {occupied} Occ / {free} Free
        </span>
        <div className="flex gap-3 text-[9px] font-bold uppercase tracking-widest">
          <span className="flex items-center gap-1 text-error">
            <span className="w-2 h-2 rounded-sm bg-error inline-block" />OCC
          </span>
          <span className="flex items-center gap-1 text-secondary-container">
            <span className="w-2 h-2 rounded-sm bg-secondary-container inline-block" />FREE
          </span>
        </div>
      </div>
      <div className="grid grid-cols-6 gap-1.5">
        {chairs.map((chair) => (
          <motion.div
            key={chair.id}
            className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 border-2 transition-all ${
              chair.status === 'OCC'
                ? 'bg-error/15 border-error text-error'
                : 'bg-secondary-container/15 border-secondary-container text-secondary-container'
            }`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-[8px] font-black leading-none">{chair.id}</span>
            <span className="text-[7px] font-bold leading-none">{chair.status}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function VideoBox({ videoStats }) {
  const [imgError, setImgError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const keyRef = useRef(0)
  const retry = () => { keyRef.current += 1; setImgError(false); setLoaded(false) }

  return (
    <div className="flex flex-col gap-3">
      <BoxShell title="AI Seat Analysis" subtitle="YOLO-annotated seat-occupancy detection" icon="smart_toy"
        badge="AI Live" badgeColor="bg-secondary-container text-on-secondary-fixed">
        {!loaded && !imgError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <motion.div className="w-10 h-10 rounded-full border-4 border-secondary-container/20 border-t-secondary-container"
              animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
            <span className="text-[10px] text-on-surface-variant font-mono tracking-widest uppercase">Processing video…</span>
          </div>
        )}
        {imgError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-error">smart_toy</span>
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface uppercase tracking-widest">Analysis Unavailable</p>
              <p className="text-xs text-on-surface-variant mt-1">Restart backend to load YOLO</p>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={retry}
              className="px-5 py-2 rounded-full bg-surface-container-high text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-all border border-outline-variant/20">
              Retry
            </motion.button>
          </div>
        )}
        {!imgError && (
          <img key={keyRef.current} src={`${API_BASE}/live/video-annotated-stream`} alt="AI Analysis"
            className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setLoaded(true)} onError={() => setImgError(true)} />
        )}
      </BoxShell>

      {/* Aggregate stat pills */}
      <div className="grid grid-cols-3 gap-2">
        <StatPill label="Occupied" value={videoStats.occupied}       icon="chair"            color="text-error" />
        <StatPill label="Free"     value={videoStats.free}           icon="event_seat"       color="text-secondary-container" />
        <StatPill label="Chairs"   value={videoStats.total_chairs}   icon="table_bar" />
        <StatPill label="Persons"  value={videoStats.persons}        icon="group" />
        <StatPill label="Tables"   value={videoStats.tables}         icon="table_restaurant" />
        <StatPill label="FPS"      value={videoStats.fps.toFixed(1)} icon="speed"            color="text-secondary" />
      </div>

      {/* Per-chair seat map */}
      <ChairGrid
        chairs={videoStats.chairs || []}
        occupied={videoStats.occupied}
        free={videoStats.free}
        total={videoStats.total_chairs}
      />
    </div>
  )
}

function StreamBox({ stats }) {
  const [imgError, setImgError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const keyRef = useRef(0)

  const retry = () => { keyRef.current += 1; setImgError(false); setLoaded(false) }

  return (
    <div className="flex flex-col gap-3">
      <BoxShell title="ESP32-CAM Feed" subtitle="Live raw stream from ESP32" icon="videocam"
        badge="Raw" badgeColor="bg-surface-container-high text-on-surface-variant">
        {!loaded && !imgError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <motion.div className="w-10 h-10 rounded-full border-4 border-secondary-container/20 border-t-secondary-container"
              animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
            <span className="text-[10px] text-on-surface-variant font-mono tracking-widest uppercase">Connecting…</span>
          </div>
        )}
        {imgError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-error">videocam_off</span>
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface uppercase tracking-widest">Feed Unavailable</p>
              <p className="text-xs text-on-surface-variant mt-1">Check ESP32 connection</p>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={retry}
              className="px-5 py-2 rounded-full bg-surface-container-high text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-all border border-outline-variant/20">
              Retry
            </motion.button>
          </div>
        )}
        {!imgError && (
          <img key={keyRef.current} src={`${API_BASE}/live/annotated-stream`} alt="ESP32 Annotated Feed"
            className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setLoaded(true)} onError={() => setImgError(true)} />
        )}
      </BoxShell>

      {/* Aggregate stat pills */}
      <div className="grid grid-cols-3 gap-2">
        <StatPill label="Occupied" value={stats.occupied}       icon="chair"            color="text-error" />
        <StatPill label="Free"     value={stats.free}           icon="event_seat"       color="text-secondary-container" />
        <StatPill label="Chairs"   value={stats.total_chairs}   icon="table_bar" />
        <StatPill label="Persons"  value={stats.persons}        icon="group" />
        <StatPill label="Tables"   value={stats.tables}         icon="table_restaurant" />
        <StatPill label="FPS"      value={stats.fps?.toFixed(1) || '0.0'} icon="speed"            color="text-secondary" />
      </div>

      {/* Per-chair seat map */}
      <ChairGrid
        chairs={stats.chairs || []}
        occupied={stats.occupied}
        free={stats.free}
        total={stats.total_chairs}
      />
    </div>
  )
}

function LiveClock() {
  const [time, setTime] = useState(new Date().toLocaleTimeString().toUpperCase())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString().toUpperCase()), 1000)
    return () => clearInterval(t)
  }, [])
  return <span className="text-[9px] text-white/60 font-mono tracking-tighter">{time}</span>
}

function StatPill({ label, value, icon, color = 'text-on-surface' }) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-3 bg-surface-container-high rounded-2xl border border-outline-variant/10 flex-1">
      <span className="material-symbols-outlined text-sm text-on-surface-variant">{icon}</span>
      <span className={`text-xl font-black leading-none ${color}`}>{value}</span>
      <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest">{label}</span>
    </div>
  )
}

export default function LiveFeed() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [eventData, setEventData] = useState(null)
  const [stats, setStats] = useState({ occupied: 0, free: 0, total_chairs: 0, persons: 0, tables: 0, fps: 0.0, connected: false })
  const [videoStats, setVideoStats] = useState({ occupied: 0, free: 0, total_chairs: 0, persons: 0, tables: 0, fps: 0.0, chairs: [], connected: false })

  useEffect(() => {
    const event = mockEventsList.find(e => e.id === parseInt(eventId))
    if (event) setEventData(event)
    else navigate('/dashboard/events')
  }, [eventId, navigate])

  // Poll stats every second
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE}/live/stats`)
        if (res.ok) setStats(await res.json())
      } catch (_) {}
    }
    poll()
    const t = setInterval(poll, 1000)
    return () => clearInterval(t)
  }, [])

  // Poll video-stats every second
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE}/live/video-stats`)
        if (res.ok) setVideoStats(await res.json())
      } catch (_) {}
    }
    poll()
    const t = setInterval(poll, 1000)
    return () => clearInterval(t)
  }, [])

  if (!eventData) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div className="w-12 h-12 rounded-full border-4 border-secondary-container/30 border-t-secondary-container"
          animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">

      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black font-[family-name:var(--font-family-headline)] tracking-tight mb-1">
            Live Operations
          </h1>
          <p className="text-on-surface-variant text-lg">{eventData.title}</p>
        </div>
        <motion.div
          className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest ${
            stats.connected
              ? 'bg-secondary-container/10 border-secondary-container/30 text-secondary-container'
              : 'bg-error/10 border-error/30 text-error'
          }`}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.span
            className={`w-2 h-2 rounded-full ${stats.connected ? 'bg-secondary-container' : 'bg-error'}`}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          {stats.connected ? 'ESP32 Connected' : 'Awaiting Feed'}
        </motion.div>
      </motion.div>

      {/* Two feed boxes side by side */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <StreamBox stats={stats} />
        <VideoBox videoStats={videoStats} />
      </motion.div>

      {/* Back */}
      <motion.button
        variants={itemVariants}
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/dashboard/events')}
        className="flex items-center gap-2 px-8 py-4 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold transition-all"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Back to Events
      </motion.button>
    </motion.div>
  )
}
