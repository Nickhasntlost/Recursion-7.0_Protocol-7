import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
  }
}

// Mock event data
const mockEventsList = [
  {
    id: 4,
    title: 'Gourmet Dinner Night',
    date: 'May 4, 2024',
    occupancy: 142,
    capacity: 200,
    status: 'SYSTEMS NOMINAL'
  }
]

export default function LiveFeed() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [eventData, setEventData] = useState(null)
  const [activeCamera, setActiveCamera] = useState('dining')
  const [occupancyAnimation, setOccupancyAnimation] = useState(0)

  useEffect(() => {
    const event = mockEventsList.find(e => e.id === parseInt(eventId))
    if (event) {
      setEventData(event)
      // Animate occupancy from 0 to actual value
      let start = 0
      const end = event.occupancy
      const timer = setInterval(() => {
        start += 1
        if (start >= end) {
          setOccupancyAnimation(end)
          clearInterval(timer)
        } else {
          setOccupancyAnimation(start)
        }
      }, 20)
    } else {
      navigate('/dashboard/events')
    }
  }, [eventId, navigate])

  if (!eventData) {
    return (
      <div className="text-center py-20">
        <div className="inline-block">
          <div className="w-16 h-16 rounded-full bg-secondary-container/20 flex items-center justify-center animate-spin">
            <span className="material-symbols-outlined text-2xl text-secondary">hourglass_empty</span>
          </div>
          <p className="mt-4 text-on-surface-variant">Loading live feed...</p>
        </div>
      </div>
    )
  }

  const occupancyPercent = (occupancyAnimation / eventData.capacity) * 100
  const tables = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    status: i < 10 ? 'occupied' : i < 12 ? 'reserved' : 'available'
  }))

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-5xl font-black font-[family-name:var(--font-family-headline)] tracking-tight mb-2">
              Live Operations
            </h1>
            <p className="text-on-surface-variant text-lg">
              {eventData.title}
            </p>
          </div>
          <motion.div
            className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-full border border-outline-variant/20"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.span
              className="w-2 h-2 rounded-full bg-secondary"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              {eventData.status}
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: LIVE FEED */}
        <motion.section variants={itemVariants} className="lg:col-span-2 space-y-6">
          {/* Main Video Feed */}
          <motion.div
            className="relative w-full aspect-video rounded-3xl overflow-hidden border border-outline-variant/20 group"
            whileHover={{ borderColor: 'var(--secondary-container, #dfeb72)' }}
            transition={{ duration: 0.3 }}
          >
            {/* Video Background */}
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCulGnZZzcCpL0n-wqhr0qFHDHDlVfEnp32de8pEDCPfkKGpSmiqUlsmITrn7l8xAU3-EY7CVl9E3j776OvWDU0zSOKvOY73XFL_BLR-vbKMKAglr4HARUPdgjTlU0o4_SxH_8RkN4vCD9AqXNjPe-JW8Kj1VY1P-g1hwJidyyLKbDOlsHZxaTvpBR8yxutbJNw3K15hS4sVzY5Vdj69_Y0uSoB906Ww273tiH0UZjV3bCP2TQwXjacTUqQX5HIlNNBEy38hwb0mIg"
              alt="dining feed"
              className="w-full h-full object-cover"
            />

            {/* Overlay UI */}
            <div className="absolute inset-0 p-8 flex flex-col justify-between bg-gradient-to-b from-black/40 via-transparent to-black/40">
              <div className="flex justify-between items-start">
                <motion.div
                  className="flex flex-col gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div
                    className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-on-surface/10 w-fit"
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.span
                      className="w-2 h-2 rounded-full bg-secondary"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className="text-xs font-bold tracking-widest text-on-surface uppercase">
                      Live Feed • Camera 04 - Dining
                    </span>
                  </motion.div>
                  <motion.div
                    className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-xl w-fit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <span className="text-[10px] text-on-surface-variant font-mono tracking-tighter">
                      {new Date().toLocaleDateString().toUpperCase()} — {new Date().toLocaleTimeString().toUpperCase()}
                    </span>
                  </motion.div>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-on-surface/10 hover:bg-on-surface/20 backdrop-blur-lg border border-on-surface/20 p-3 rounded-full text-on-surface transition-all"
                >
                  <span className="material-symbols-outlined">fullscreen</span>
                </motion.button>
              </div>

              {/* Bottom Info */}
              <div className="flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <motion.div
                  className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-on-surface/10 flex items-center gap-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                      Signal
                    </span>
                    <motion.div className="flex gap-1 mt-2">
                      {[0, 1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className="h-3 w-1 rounded-full"
                          animate={{ opacity: i < 3 ? 1 : 0.3 }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          style={{
                            backgroundColor: i < 3 ? 'var(--secondary-container, #dfeb72)' : '#525252'
                          }}
                        />
                      ))}
                    </motion.div>
                  </div>

                  <div className="w-px h-8 bg-on-surface/10" />

                  <div className="flex flex-col">
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                      Bitrate
                    </span>
                    <span className="text-xs text-on-surface font-mono font-bold mt-1">12.4 Mbps</span>
                  </div>
                </motion.div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-on-surface/10 flex items-center justify-center text-on-surface hover:bg-on-surface/20 transition-all"
                  >
                    <span className="material-symbols-outlined">mic</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-on-surface/10 flex items-center justify-center text-on-surface hover:bg-on-surface/20 transition-all"
                  >
                    <span className="material-symbols-outlined">videocam_off</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Camera Thumbnails */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { id: 'bar', label: 'Bar Area', icon: 'local_bar' },
              { id: 'kitchen', label: 'Kitchen', icon: 'restaurant' },
              { id: 'dining', label: 'Dining Room', icon: 'table_restaurant', active: true },
              { id: 'entry', label: 'Entry', icon: 'door_front' }
            ].map((cam, idx) => (
              <motion.button
                key={cam.id}
                onClick={() => setActiveCamera(cam.id)}
                className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                  cam.active
                    ? 'border-secondary-container'
                    : 'border-outline-variant/20 hover:border-secondary-container/50'
                }`}
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <img
                  src={
                    cam.id === 'bar'
                      ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxcw4Oetia7qVeFJz7OAm4j1okdOCOq6mJRFLVKo88Ck6RehHRPGINKvuNEpLKdpg2OpSRWo4KQK9U-jkPIh86nM_AGxVadgfywJlTjLlpym-xknbiEcz9tTxQ4tjNky7LMqz-QpWAnqftJaP55RFkIYN5p8wf_X-1QLezxgkdtMzNDpnsqsn4ClzjbWlYZrHNJiP_DMPTLVxpCsb8N8O0rbqcs5wXPufGGvUpWNw02vlmppOL2BfvfVv_SDkZhBY1pTE5MQTbb9s'
                      : cam.id === 'kitchen'
                      ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKL8NUqVM65dXmvqP0fRwQO_0oNDcDntY8xcj61pBvoTtnlEujhiFTwvc5VDGbJVPt8Xduzn2GxjLXGlEOiHaoOhdh4jOzg6WPLWsew9S0ZDrLf2siZXkxhtOWHMVq99H6odIQ8UlsqKmVr3dMi10mECTQWLx1rFrLmIiXZCjjgjjwAuejVhAAq-oqUNq98OPkC0cJfsH-7UWx05023b4eIqDNinAn4VFM6YbQrhutyPwg6UjXniN49cVl2LrofSGuslT4pTf03tU'
                      : 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsjP7XrcklXEALYEQf21rd9BC2pbcTCXWmKCpfuM2H0_SgoPmSXDUaDSvAExe1KNWYQxDdctP4a3AHo_U1UWycbDPupzu1Y96XUuUxNlPDGSXEdqc60eK5YE8ShpK073g7xdx6sCv3ffRK-KjjzJqi9tHKiAd6fSEv3kKFtF5KmFpgmj5bVbPaRil0I5ol1nsTZYSogAYsaO9zTS4xGxSIY74fFRFMP5wu7xgDPaEgJVL2_OiUCRe-2qWcA4G6LJf4JkxX_gsWmkQ'
                  }
                  alt={cam.label}
                  className="w-full h-full object-cover"
                />
                <motion.div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded-lg">
                  <span className="text-[8px] font-bold text-on-surface tracking-widest uppercase flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">{cam.icon}</span>
                    {cam.label}
                  </span>
                </motion.div>
                {cam.active && (
                  <motion.div
                    className="absolute inset-0 border-2 border-secondary-container rounded-2xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* RIGHT COLUMN: OPERATIONAL INSIGHTS */}
        <motion.aside variants={itemVariants} className="space-y-6">
          {/* Occupancy Gauge */}
          <motion.div
            className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/20"
            whileHover={{ borderColor: 'var(--secondary-container, #dfeb72)' }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-sm font-bold mb-6 uppercase tracking-[0.2em] text-on-surface-variant">
              Occupancy Level
            </h3>
            <div className="flex flex-col items-center justify-center">
              <motion.div
                className="relative w-40 h-40 flex items-center justify-center mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                  <motion.circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-surface-container-high"
                  />
                  <motion.circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray="565.2"
                    strokeDashoffset={565.2 - (occupancyPercent / 100) * 565.2}
                    className="text-secondary-container"
                    animate={{ strokeDashoffset: 565.2 - (occupancyPercent / 100) * 565.2 }}
                    transition={{ duration: 0.5 }}
                    style={{ color: 'var(--secondary-container, #dfeb72)' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    className="text-4xl font-black font-[family-name:var(--font-family-headline)]"
                    key={Math.floor(occupancyAnimation)}
                  >
                    {Math.floor(occupancyAnimation)}
                  </motion.span>
                  <span className="text-xs font-bold text-on-surface-variant">
                    / {eventData.capacity} Guests
                  </span>
                </div>
              </motion.div>

              <div className="grid grid-cols-3 gap-4 w-full">
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="block text-2xl font-black">{occupancyPercent.toFixed(0)}%</span>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter">
                    Capacity
                  </span>
                </motion.div>
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="block text-2xl font-black text-secondary">+12</span>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter">
                    Last 30m
                  </span>
                </motion.div>
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <span className="block text-2xl font-black text-secondary-container">Optimal</span>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter">
                    Status
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Table Status */}
          <motion.div
            className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/20"
            whileHover={{ borderColor: 'var(--secondary-container, #dfeb72)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                Table Status
              </h3>
              <span className="text-xs font-bold text-secondary-container">10 ACTIVE</span>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-6">
              {tables.map((table, idx) => (
                <motion.div
                  key={table.id}
                  className={`aspect-square rounded-xl flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    table.status === 'occupied'
                      ? 'bg-secondary-container text-on-secondary-fixed border-secondary-container'
                      : table.status === 'reserved'
                      ? 'bg-secondary-container/30 border-secondary-container text-secondary-container'
                      : 'border-outline-variant/20 text-on-surface-variant hover:border-secondary-container'
                  }`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {table.id}
                </motion.div>
              ))}
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded border-2 border-outline-variant/20" />
                <span className="text-[9px] text-on-surface-variant font-bold uppercase">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-secondary-container border-2 border-secondary-container" />
                <span className="text-[9px] text-on-surface-variant font-bold uppercase">Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-secondary-container/30 border-2 border-secondary-container" />
                <span className="text-[9px] text-on-surface-variant font-bold uppercase">Reserved</span>
              </div>
            </div>
          </motion.div>

          {/* VIP Alerts */}
          <motion.div
            className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/20 max-h-96 overflow-y-auto"
            whileHover={{ borderColor: 'var(--secondary-container, #dfeb72)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h3 className="text-sm font-bold mb-4 uppercase tracking-[0.2em] text-on-surface-variant sticky top-0 bg-surface-container-lowest">
              VIP Alerts
            </h3>
            <div className="space-y-3">
              {[
                { type: 'Urgent Service', msg: 'VIP Table 12: Champagne Service', time: '2m', icon: 'priority_high' },
                { type: 'Payment', msg: 'Table 08: Bill Requested via Terminal', time: '5m', icon: 'payment' },
                { type: 'Arrival', msg: "Member 'Anderson' checked in", time: '12m', icon: 'person_add' }
              ].map((alert, idx) => (
                <motion.div
                  key={idx}
                  className="p-4 bg-surface-container-high rounded-2xl border-l-4 border-secondary-container hover:bg-surface-container-highest transition-all"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-secondary mt-1">{alert.icon}</span>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-on-surface uppercase tracking-widest">
                        {alert.type}
                      </p>
                      <p className="text-sm text-on-surface-variant mt-1">{alert.msg}</p>
                    </div>
                    <span className="text-[9px] text-on-surface-variant font-mono">{alert.time} ago</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.aside>
      </div>

      {/* Back Button */}
      <motion.button
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/dashboard/events')}
        className="flex items-center gap-2 px-8 py-4 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold transition-all"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Back to Events
      </motion.button>
    </motion.div>
  )
}
