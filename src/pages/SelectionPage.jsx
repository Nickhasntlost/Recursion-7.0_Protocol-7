import { Link, useLocation, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Stage, Layer, Circle, Ellipse, Rect, Text, Group, Line } from 'react-konva'

const seatClassByStatus = {
  avail: 'bg-surface-container-highest hover:bg-secondary-container cursor-pointer',
  selected: 'bg-primary ring-2 ring-primary ring-offset-2 ring-offset-surface',
  booked: 'bg-outline-variant cursor-not-allowed opacity-80',
  held: 'bg-secondary-container cursor-not-allowed opacity-70',
}

const venueConfigs = {
  stadium: {
    name: 'Stadium',
    icon: 'stadium',
    stageLabel: 'Pitch',
    sectionLabel: 'East Stand',
    seatPrice: 420,
    serviceFeePerSeat: 28,
    occupancy: { booked: 0.22, held: 0.08 },
    type: 'rows',
    sections: [
      { title: 'North Stand', rowPrefix: 'N', seatCounts: [16, 18, 20, 22], aisleAfter: [6, 12] },
      { title: 'South Stand', rowPrefix: 'S', seatCounts: [16, 18, 20, 22], aisleAfter: [6, 12] },
      { title: 'West Stand', rowPrefix: 'W', seatCounts: [14, 16, 18, 20], aisleAfter: [5, 10] },
      { title: 'East Stand', rowPrefix: 'E', seatCounts: [14, 16, 18, 20], aisleAfter: [5, 10] },
      { title: 'VIP Boxes', rowPrefix: 'V', seatCounts: [8, 8], aisleAfter: [4] },
    ],
  },
  concertHall: {
    name: 'Concert Hall',
    icon: 'piano',
    stageLabel: 'Main Stage',
    sectionLabel: 'Orchestra',
    seatPrice: 330,
    serviceFeePerSeat: 24,
    occupancy: { booked: 0.2, held: 0.1 },
    type: 'rows',
    sections: [
      { title: 'Left Wing', rowPrefix: 'L', seatCounts: [8, 10, 12], aisleAfter: [4] },
      { title: 'Orchestra', rowPrefix: 'O', seatCounts: [14, 16, 18, 20], aisleAfter: [6, 12] },
      { title: 'Right Wing', rowPrefix: 'R', seatCounts: [8, 10, 12], aisleAfter: [4] },
      { title: 'Balcony', rowPrefix: 'B', seatCounts: [12, 14, 16], aisleAfter: [5, 10] },
    ],
  },
  restaurant: {
    name: 'Restaurant Floor',
    icon: 'restaurant',
    stageLabel: 'Chef Counter',
    sectionLabel: 'Dining Hall',
    seatPrice: 260,
    serviceFeePerSeat: 18,
    occupancy: { booked: 0.16, held: 0.08 },
    type: 'tables',
    tables: [
      { id: 'T1', seats: 4 },
      { id: 'T2', seats: 6 },
      { id: 'T3', seats: 4 },
      { id: 'T4', seats: 6 },
      { id: 'T5', seats: 4 },
      { id: 'T6', seats: 4 },
    ],
  },
  hackLab: {
    name: 'Hackathon Arena',
    icon: 'developer_board',
    stageLabel: 'Main Challenge Desk',
    sectionLabel: 'Team Pods',
    seatPrice: 190,
    serviceFeePerSeat: 14,
    occupancy: { booked: 0.18, held: 0.12 },
    type: 'rows',
    sections: [
      { title: 'Pod A', rowPrefix: 'A', seatCounts: [8, 8, 8, 8], aisleAfter: [4] },
      { title: 'Pod B', rowPrefix: 'B', seatCounts: [8, 8, 8, 8], aisleAfter: [4] },
      { title: 'Pod C', rowPrefix: 'C', seatCounts: [8, 8, 8, 8], aisleAfter: [4] },
      { title: 'Pod D', rowPrefix: 'D', seatCounts: [8, 8, 8, 8], aisleAfter: [4] },
    ],
  },
  cinema: {
    name: 'Cinema Hall',
    icon: 'movie',
    stageLabel: 'Screen',
    sectionLabel: 'Premium',
    seatPrice: 300,
    serviceFeePerSeat: 20,
    occupancy: { booked: 0.21, held: 0.09 },
    type: 'rows',
    sections: [
      { title: 'Lower Left', rowPrefix: 'A', seatCounts: [8, 10, 12], aisleAfter: [4] },
      { title: 'Lower Center', rowPrefix: 'B', seatCounts: [12, 14, 16, 16], aisleAfter: [5, 10] },
      { title: 'Lower Right', rowPrefix: 'C', seatCounts: [8, 10, 12], aisleAfter: [4] },
      { title: 'Upper Deck', rowPrefix: 'U', seatCounts: [10, 12, 14], aisleAfter: [4, 8] },
    ],
  },
}

const venueOptions = [
  { key: 'stadium', label: 'Sports' },
  { key: 'concertHall', label: 'Open Mic / Concerts' },
  { key: 'restaurant', label: 'Dining' },
  { key: 'hackLab', label: 'Hackathons' },
  { key: 'cinema', label: 'Cinema / Comedy' },
]

function seededRatio(seedText) {
  let hash = 0
  for (let idx = 0; idx < seedText.length; idx += 1) {
    hash = (hash << 5) - hash + seedText.charCodeAt(idx)
    hash |= 0
  }
  return Math.abs(hash % 1000) / 1000
}

function detectVenueFromEvent(eventId, providedVenue) {
  if (providedVenue && venueConfigs[providedVenue]) {
    return providedVenue
  }

  const id = String(eventId || '').toLowerCase()
  if (id.includes('sport') || id.includes('match') || id.includes('league') || id.includes('cup')) return 'stadium'
  if (id.includes('open-mic') || id.includes('concert') || id.includes('music') || id.includes('sunburn')) return 'concertHall'
  if (id.includes('dining') || id.includes('food') || id.includes('zomaland') || id.includes('chef')) return 'restaurant'
  if (id.includes('hack') || id.includes('code') || id.includes('competition') || id.includes('comic-con')) return 'hackLab'
  if (id.includes('cinema') || id.includes('movie') || id.includes('comedy')) return 'cinema'
  return 'concertHall'
}

function buildRowsLayout(config) {
  const seatsById = {}
  const sections = config.sections.map((section) => {
    const rows = section.seatCounts.map((seatCount, rowIdx) => {
      const rowLabel = `${section.rowPrefix}${rowIdx + 1}`
      const seats = Array.from({ length: seatCount }).map((_, seatIdx) => {
        const seatNumber = String(seatIdx + 1).padStart(2, '0')
        const code = `${rowLabel}-${seatNumber}`
        const ratio = seededRatio(`${config.name}-${code}`)
        let status = 'avail'
        if (ratio < config.occupancy.booked) status = 'booked'
        else if (ratio < config.occupancy.booked + config.occupancy.held) status = 'held'

        const seat = { id: code, label: code, status, rowLabel, section: section.title }
        seatsById[seat.id] = seat
        return seat
      })

      return {
        rowLabel,
        seats,
        aisleAfter: section.aisleAfter || [],
      }
    })

    return { title: section.title, rows }
  })

  return { sections, seatsById }
}

function buildTablesLayout(config) {
  const seatsById = {}
  const tables = config.tables.map((table) => {
    const seats = Array.from({ length: table.seats }).map((_, seatIdx) => {
      const code = `${table.id}-S${seatIdx + 1}`
      const ratio = seededRatio(`${config.name}-${code}`)
      let status = 'avail'
      if (ratio < config.occupancy.booked) status = 'booked'
      else if (ratio < config.occupancy.booked + config.occupancy.held) status = 'held'

      const seat = { id: code, label: code, status, rowLabel: table.id }
      seatsById[seat.id] = seat
      return seat
    })

    return {
      ...table,
      seats,
    }
  })

  return { tables, seatsById }
}

function seatStats(seatsById) {
  const allSeats = Object.values(seatsById)
  const availableSeats = allSeats.filter((seat) => seat.status === 'avail').length
  return {
    total: allSeats.length,
    available: availableSeats,
    occupied: allSeats.length - availableSeats,
  }
}

function findSection(layout, title) {
  return layout.sections.find((section) => section.title === title)
}

function SectionRows({ section, toggleSeat, seatButtonClass, dense = false }) {
  if (!section) return null

  return (
    <div className="space-y-2">
      {section.rows.map((row) => (
        <div key={row.rowLabel} className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-on-surface-variant w-8 shrink-0">{row.rowLabel}</span>
          <div className="flex items-center gap-1">
            {row.seats.map((seat, seatIdx) => (
              <div key={seat.id} className="flex items-center gap-1">
                <motion.button
                  onClick={() => toggleSeat(seat)}
                  className={`${dense ? 'w-5 h-5' : 'w-6 h-6'} rounded-md transition-colors ${seatButtonClass(seat)}`}
                  whileHover={seat.status === 'avail' ? { scale: 1.08 } : {}}
                  whileTap={seat.status === 'avail' ? { scale: 0.95 } : {}}
                  title={seat.label}
                />
                {row.aisleAfter.includes(seatIdx + 1) && <div className={dense ? 'w-2' : 'w-3'} />}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function createArcBandPoints(cx, cy, innerRx, innerRy, outerRx, outerRy, startDeg, endDeg, steps = 36) {
  const points = []

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps
    const angle = ((startDeg + (endDeg - startDeg) * t) * Math.PI) / 180
    points.push(cx + outerRx * Math.cos(angle), cy + outerRy * Math.sin(angle))
  }

  for (let i = steps; i >= 0; i -= 1) {
    const t = i / steps
    const angle = ((startDeg + (endDeg - startDeg) * t) * Math.PI) / 180
    points.push(cx + innerRx * Math.cos(angle), cy + innerRy * Math.sin(angle))
  }

  return points
}

function Stadium2DMap({
  layout,
  toggleSeat,
  selectedSeatIds,
  selectedCompartment,
  setSelectedCompartment,
  compartmentStats,
}) {
  const stageWidth = 980
  const stageHeight = 620
  const centerX = stageWidth / 2
  const centerY = stageHeight / 2 + 2

  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [hoveredSeat, setHoveredSeat] = useState(null)

  const sectionArcConfig = {
    'North Stand': {
      startDeg: 203,
      endDeg: 337,
      bandInnerRx: 206,
      bandInnerRy: 132,
      bandOuterRx: 300,
      bandOuterRy: 194,
      label: { x: centerX - 56, y: 66 },
    },
    'South Stand': {
      startDeg: 23,
      endDeg: 157,
      bandInnerRx: 206,
      bandInnerRy: 132,
      bandOuterRx: 300,
      bandOuterRy: 194,
      label: { x: centerX - 57, y: 552 },
    },
    'West Stand': {
      startDeg: 118,
      endDeg: 242,
      bandInnerRx: 300,
      bandInnerRy: 194,
      bandOuterRx: 364,
      bandOuterRy: 238,
      label: { x: 84, y: centerY - 10 },
    },
    'East Stand': {
      startDeg: -62,
      endDeg: 62,
      bandInnerRx: 300,
      bandInnerRy: 194,
      bandOuterRx: 364,
      bandOuterRy: 238,
      label: { x: 886, y: centerY - 10 },
    },
    'VIP Boxes': {
      startDeg: 236,
      endDeg: 304,
      bandInnerRx: 164,
      bandInnerRy: 103,
      bandOuterRx: 204,
      bandOuterRy: 127,
      label: { x: centerX - 39, y: 126 },
    },
  }

  const sectionNames = ['North Stand', 'South Stand', 'West Stand', 'East Stand', 'VIP Boxes']

  const seats = useMemo(() => {
    return layout.sections.flatMap((section) => {
      const geometry = sectionArcConfig[section.title]
      if (!geometry) return []

      return section.rows.flatMap((row, rowIdx) => {
        const rowCount = section.rows.length
        const rowProgress = rowCount === 1 ? 0.5 : rowIdx / (rowCount - 1)

        const innerPad = section.title === 'VIP Boxes' ? 5 : 10
        const outerPad = section.title === 'VIP Boxes' ? 5 : 10
        const minRx = geometry.bandInnerRx + innerPad
        const minRy = geometry.bandInnerRy + innerPad * 0.72
        const maxRx = geometry.bandOuterRx - outerPad
        const maxRy = geometry.bandOuterRy - outerPad * 0.72

        const rx = minRx + (maxRx - minRx) * rowProgress
        const ry = minRy + (maxRy - minRy) * rowProgress

        return row.seats.map((seat, seatIdx) => {
          const seatProgress = row.seats.length === 1 ? 0.5 : seatIdx / (row.seats.length - 1)
          const angleTrim = section.title === 'VIP Boxes' ? 0.12 : 0.07
          const normalizedSeatProgress = angleTrim + seatProgress * (1 - angleTrim * 2)
          const angleDeg = geometry.startDeg + (geometry.endDeg - geometry.startDeg) * normalizedSeatProgress
          const angleRad = (angleDeg * Math.PI) / 180

          return {
            ...seat,
            section: section.title,
            x: centerX + rx * Math.cos(angleRad),
            y: centerY + ry * Math.sin(angleRad),
          }
        })
      })
    })
  }, [layout, centerX, centerY])

  const seatLookup = useMemo(() => {
    return seats.reduce((acc, seat) => {
      acc[seat.id] = seat
      return acc
    }, {})
  }, [seats])

  const getSeatFill = (seat) => {
    if (selectedSeatIds.includes(seat.id)) return '#F59E0B'
    if (seat.status === 'booked') return '#DC2626'
    if (seat.status === 'held') return '#2563EB'
    return '#16A34A'
  }

  const canInteractSeat = (seat) => {
    return selectedCompartment && seat.section === selectedCompartment
  }

  const onWheelZoom = (event) => {
    event.evt.preventDefault()

    const pointer = event.target.getStage().getPointerPosition()
    if (!pointer) return

    const oldScale = scale
    const scaleBy = 1.08
    const direction = event.evt.deltaY > 0 ? -1 : 1
    const nextScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy
    const clampedScale = Math.min(2.4, Math.max(0.65, nextScale))

    const pointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    }

    const nextPos = {
      x: pointer.x - pointTo.x * clampedScale,
      y: pointer.y - pointTo.y * clampedScale,
    }

    setScale(clampedScale)
    setPosition(nextPos)
  }

  const selectedCompartmentAvailable = selectedCompartment ? (compartmentStats[selectedCompartment]?.available ?? 0) : 0
  const selectedCompartmentTotal = selectedCompartment ? (compartmentStats[selectedCompartment]?.total ?? 0) : 0

  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 md:p-6 shadow-[0_18px_36px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">2D Stadium Blueprint</p>
        <p className="text-[10px] text-on-surface-variant">Step 1: Compartment • Step 2: Seats</p>
      </div>

      <div className="mb-3 grid grid-cols-2 md:grid-cols-5 gap-2">
        {sectionNames.map((section) => {
          const isActive = selectedCompartment === section
          const stats = compartmentStats[section]
          return (
            <button
              key={section}
              onClick={() => setSelectedCompartment(section)}
              className={`rounded-lg border px-2.5 py-2 text-left transition-colors ${isActive ? 'border-primary bg-primary/10 shadow-sm' : 'border-outline-variant/20 bg-surface hover:bg-surface-container-low'}`}
            >
              <div className="text-[10px] font-black uppercase tracking-[0.12em] text-on-surface-variant">{section.replace(' Stand', '')}</div>
              <div className="text-xs font-semibold text-on-surface mt-0.5">{stats?.available ?? 0} / {stats?.total ?? 0}</div>
            </button>
          )
        })}
      </div>

      <div className="mb-3 flex items-center justify-between rounded-lg border border-outline-variant/20 bg-surface px-3 py-2 text-xs text-on-surface-variant">
        <span>{selectedCompartment ? `${selectedCompartment} selected` : 'Select a compartment'}</span>
        <span>{selectedCompartment ? `${selectedCompartmentAvailable} vacant of ${selectedCompartmentTotal}` : ''}</span>
        <button
          onClick={() => {
            setScale(1)
            setPosition({ x: 0, y: 0 })
          }}
          className="rounded-md border border-outline-variant/30 px-2 py-1 text-[10px] font-semibold hover:bg-surface-container-low"
        >
          Reset View
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-outline-variant/20 bg-linear-to-b from-slate-50 to-slate-100">
        <Stage
          width={stageWidth}
          height={stageHeight}
          draggable
          x={position.x}
          y={position.y}
          scaleX={scale}
          scaleY={scale}
          onWheel={onWheelZoom}
          onDragEnd={(event) => {
            setPosition({ x: event.target.x(), y: event.target.y() })
          }}
        >
          <Layer>
            <Ellipse x={centerX} y={centerY} radiusX={376} radiusY={246} fill="#F8FAFC" stroke="#CBD5E1" strokeWidth={2} />
            <Ellipse x={centerX} y={centerY} radiusX={334} radiusY={220} fill="#F1F5F9" stroke="#C5CFDD" strokeWidth={1} />

            {Object.entries(sectionArcConfig).map(([section, geometry]) => {
              const isActive = selectedCompartment === section
              return (
                <Line
                  key={`band-${section}`}
                  points={createArcBandPoints(
                    centerX,
                    centerY,
                    geometry.bandInnerRx,
                    geometry.bandInnerRy,
                    geometry.bandOuterRx,
                    geometry.bandOuterRy,
                    geometry.startDeg,
                    geometry.endDeg,
                  )}
                  closed
                  fill={isActive ? '#DBEAFE' : '#E2E8F0'}
                  opacity={isActive ? 0.88 : 0.62}
                  stroke={isActive ? '#1D4ED8' : '#94A3B8'}
                  strokeWidth={isActive ? 2 : 1}
                  onClick={() => setSelectedCompartment(section)}
                  onTap={() => setSelectedCompartment(section)}
                  onMouseEnter={() => {
                    document.body.style.cursor = 'pointer'
                  }}
                  onMouseLeave={() => {
                    document.body.style.cursor = 'default'
                  }}
                />
              )
            })}

            <Ellipse x={centerX} y={centerY} radiusX={234} radiusY={156} fill="#E2F6E8" stroke="#86EFAC" strokeWidth={3} />
            <Rect x={centerX - 112} y={centerY - 58} width={224} height={116} cornerRadius={12} fill="#CCECD6" stroke="#16A34A" strokeWidth={2} />
            <Line points={[centerX, centerY - 58, centerX, centerY + 58]} stroke="#15803D" strokeWidth={2} opacity={0.88} />

            <Text x={centerX - 30} y={centerY - 9} text="PITCH" fontSize={16} fontStyle="bold" fill="#14532D" />

            {Object.entries(sectionArcConfig).map(([section, geometry]) => {
              const isActive = selectedCompartment === section
              return (
                <Text
                  key={`label-${section}`}
                  x={geometry.label.x}
                  y={geometry.label.y}
                  text={section.toUpperCase()}
                  fontSize={section === 'VIP Boxes' ? 11 : 12}
                  fontStyle="bold"
                  fill={isActive ? '#1D4ED8' : '#64748B'}
                  opacity={isActive ? 1 : 0.82}
                />
              )
            })}

            {seats.map((seat) => {
              const isAvailable = seat.status === 'avail'
              const isSelectedCompartment = selectedCompartment === seat.section
              return (
                <Circle
                  key={seat.id}
                  x={seat.x}
                  y={seat.y}
                  radius={5.2}
                  fill={getSeatFill(seat)}
                  opacity={isSelectedCompartment ? 1 : 0.22}
                  stroke={selectedSeatIds.includes(seat.id) ? '#EAB308' : '#0F172A'}
                  strokeWidth={selectedSeatIds.includes(seat.id) ? 2 : 1}
                  shadowColor={isAvailable ? '#166534' : '#334155'}
                  shadowBlur={selectedSeatIds.includes(seat.id) ? 7 : 2.5}
                  shadowOpacity={0.2}
                  onClick={() => {
                    if (!canInteractSeat(seat)) return
                    toggleSeat(seat)
                  }}
                  onMouseEnter={(event) => {
                    if (isAvailable && canInteractSeat(seat)) {
                      document.body.style.cursor = 'pointer'
                    }
                    event.target.to({ scaleX: canInteractSeat(seat) ? 1.2 : 1.06, scaleY: canInteractSeat(seat) ? 1.2 : 1.06, duration: 0.08 })
                    setHoveredSeat(seat)
                  }}
                  onMouseLeave={(event) => {
                    document.body.style.cursor = 'default'
                    event.target.to({ scaleX: 1, scaleY: 1, duration: 0.08 })
                    setHoveredSeat(null)
                  }}
                />
              )
            })}

            {hoveredSeat && (
              <Group x={hoveredSeat.x + 10} y={hoveredSeat.y - 42}>
                <Rect width={154} height={38} cornerRadius={8} fill="#0F172A" opacity={0.94} />
                <Text x={8} y={6} text={`${hoveredSeat.section}`} fontSize={10} fill="#E2E8F0" />
                <Text x={8} y={20} text={`${hoveredSeat.label} • ${hoveredSeat.status}`} fontSize={10} fill="#F8FAFC" />
              </Group>
            )}
          </Layer>
        </Stage>
      </div>

      <div className="mt-3 text-[11px] text-on-surface-variant">
        {selectedCompartment
          ? `Selected compartment: ${selectedCompartment}. Only seats inside this section are enabled for booking.`
          : 'Select a compartment to activate seat selection.'}
      </div>
    </div>
  )
}

function ConcertHall2DMap({ layout, toggleSeat, seatButtonClass }) {
  const leftWing = findSection(layout, 'Left Wing')
  const orchestra = findSection(layout, 'Orchestra')
  const rightWing = findSection(layout, 'Right Wing')
  const balcony = findSection(layout, 'Balcony')

  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 md:p-6">
      <div className="h-16 rounded-b-[4rem] bg-secondary-container/35 border border-secondary-container/50 flex items-center justify-center mb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">Main Stage</span>
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-3 rounded-xl border border-outline-variant/20 bg-surface p-3">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant mb-2">Left Wing</div>
          <SectionRows section={leftWing} toggleSeat={toggleSeat} seatButtonClass={seatButtonClass} dense />
        </div>
        <div className="col-span-6 rounded-xl border border-outline-variant/20 bg-surface p-3">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant mb-2">Orchestra</div>
          <SectionRows section={orchestra} toggleSeat={toggleSeat} seatButtonClass={seatButtonClass} />
        </div>
        <div className="col-span-3 rounded-xl border border-outline-variant/20 bg-surface p-3">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant mb-2">Right Wing</div>
          <SectionRows section={rightWing} toggleSeat={toggleSeat} seatButtonClass={seatButtonClass} dense />
        </div>
        <div className="col-span-12 rounded-xl border border-outline-variant/20 bg-surface p-3">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant mb-2">Balcony</div>
          <SectionRows section={balcony} toggleSeat={toggleSeat} seatButtonClass={seatButtonClass} dense />
        </div>
      </div>
    </div>
  )
}

function Cinema2DMap({ layout, toggleSeat, seatButtonClass }) {
  const lowerLeft = findSection(layout, 'Lower Left')
  const lowerCenter = findSection(layout, 'Lower Center')
  const lowerRight = findSection(layout, 'Lower Right')
  const upperDeck = findSection(layout, 'Upper Deck')

  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 md:p-6">
      <div className="h-12 rounded-md bg-surface-container-high border border-outline-variant/20 flex items-center justify-center mb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">Screen</span>
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-3 rounded-xl border border-outline-variant/20 bg-surface p-3">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant mb-2">Lower Left</div>
          <SectionRows section={lowerLeft} toggleSeat={toggleSeat} seatButtonClass={seatButtonClass} dense />
        </div>
        <div className="col-span-6 rounded-xl border border-outline-variant/20 bg-surface p-3">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant mb-2">Lower Center</div>
          <SectionRows section={lowerCenter} toggleSeat={toggleSeat} seatButtonClass={seatButtonClass} />
        </div>
        <div className="col-span-3 rounded-xl border border-outline-variant/20 bg-surface p-3">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant mb-2">Lower Right</div>
          <SectionRows section={lowerRight} toggleSeat={toggleSeat} seatButtonClass={seatButtonClass} dense />
        </div>
        <div className="col-span-12 rounded-xl border border-outline-variant/20 bg-surface p-3">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant mb-2">Upper Deck</div>
          <SectionRows section={upperDeck} toggleSeat={toggleSeat} seatButtonClass={seatButtonClass} dense />
        </div>
      </div>
    </div>
  )
}

function HackLab2DMap({ layout, toggleSeat, seatButtonClass }) {
  const podA = findSection(layout, 'Pod A')
  const podB = findSection(layout, 'Pod B')
  const podC = findSection(layout, 'Pod C')
  const podD = findSection(layout, 'Pod D')

  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 md:p-6">
      <div className="h-12 rounded-xl bg-secondary-container/30 border border-secondary-container/50 flex items-center justify-center mb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">Main Challenge Desk</span>
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-5 rounded-xl border border-outline-variant/20 bg-surface p-3">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant mb-2">Pod A</div>
          <SectionRows section={podA} toggleSeat={toggleSeat} seatButtonClass={seatButtonClass} dense />
        </div>
        <div className="col-span-2 flex items-center justify-center rounded-xl border border-dashed border-outline-variant/30 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em]">
          Aisle
        </div>
        <div className="col-span-5 rounded-xl border border-outline-variant/20 bg-surface p-3">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant mb-2">Pod B</div>
          <SectionRows section={podB} toggleSeat={toggleSeat} seatButtonClass={seatButtonClass} dense />
        </div>
        <div className="col-span-5 rounded-xl border border-outline-variant/20 bg-surface p-3">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant mb-2">Pod C</div>
          <SectionRows section={podC} toggleSeat={toggleSeat} seatButtonClass={seatButtonClass} dense />
        </div>
        <div className="col-span-2 flex items-center justify-center rounded-xl border border-dashed border-outline-variant/30 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em]">
          Aisle
        </div>
        <div className="col-span-5 rounded-xl border border-outline-variant/20 bg-surface p-3">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant mb-2">Pod D</div>
          <SectionRows section={podD} toggleSeat={toggleSeat} seatButtonClass={seatButtonClass} dense />
        </div>
      </div>
    </div>
  )
}

export default function SelectionPage() {
  const { id } = useParams()
  const location = useLocation()
  const search = new URLSearchParams(location.search)

  const initialVenue = detectVenueFromEvent(id, search.get('venue'))
  const [activeVenue, setActiveVenue] = useState(initialVenue)
  const [ticketCount, setTicketCount] = useState(2)
  const [selectedSeatIds, setSelectedSeatIds] = useState([])
  const [selectedCompartment, setSelectedCompartment] = useState(initialVenue === 'stadium' ? 'North Stand' : null)

  const venue = venueConfigs[activeVenue]

  const layout = useMemo(() => {
    return venue.type === 'tables' ? buildTablesLayout(venue) : buildRowsLayout(venue)
  }, [venue])

  const stats = useMemo(() => seatStats(layout.seatsById), [layout.seatsById])

  const selectedSeats = selectedSeatIds.map((seatId) => layout.seatsById[seatId]).filter(Boolean)

  const subtotal = selectedSeats.length * venue.seatPrice
  const serviceFee = selectedSeats.length * venue.serviceFeePerSeat
  const total = subtotal + serviceFee
  const canContinue = selectedSeats.length > 0

  const onVenueChange = (nextVenue) => {
    setActiveVenue(nextVenue)
    setSelectedSeatIds([])
    setSelectedCompartment(nextVenue === 'stadium' ? 'North Stand' : null)
  }

  const onTicketCountChange = (nextCount) => {
    const bounded = Math.max(1, Math.min(8, nextCount))
    setTicketCount(bounded)
    setSelectedSeatIds((prev) => prev.slice(0, bounded))
  }

  const toggleSeat = (seat) => {
    if (seat.status !== 'avail') return
    if (activeVenue === 'stadium' && (!selectedCompartment || seat.section !== selectedCompartment)) return

    setSelectedSeatIds((prev) => {
      if (prev.includes(seat.id)) {
        return prev.filter((item) => item !== seat.id)
      }

      if (prev.length >= ticketCount) {
        return prev
      }

      return [...prev, seat.id]
    })
  }

  const seatButtonClass = (seat) => {
    const isSelected = selectedSeatIds.includes(seat.id)
    if (isSelected) return seatClassByStatus.selected
    return seatClassByStatus[seat.status]
  }

  const compartmentStats = useMemo(() => {
    if (activeVenue !== 'stadium') return {}

    return layout.sections.reduce((acc, section) => {
      const seats = section.rows.flatMap((row) => row.seats)
      const available = seats.filter((seat) => seat.status === 'avail').length
      acc[section.title] = { total: seats.length, available }
      return acc
    }, {})
  }, [activeVenue, layout])

  const legendItems = activeVenue === 'stadium'
    ? [
      { color: 'bg-green-500', label: 'Available' },
      { color: 'bg-yellow-400', label: 'Selected' },
      { color: 'bg-red-500', label: 'Booked' },
      { color: 'bg-blue-500', label: 'Locked' },
    ]
    : [
      { color: 'bg-surface-container-highest', label: 'Available' },
      { color: 'bg-primary', label: 'Selected' },
      { color: 'bg-outline-variant', label: 'Booked' },
      { color: 'bg-secondary-container', label: 'Held' },
    ]

  return (
    <div className="max-w-screen-2xl mx-auto px-6 md:px-10 pt-8 pb-20">
      <motion.header
        className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="flex flex-col gap-4">
          <nav className="flex items-center text-sm font-medium text-on-surface-variant tracking-wide">
            <span>Events</span>
            <span className="material-symbols-outlined text-sm mx-2">chevron_right</span>
            <span>Seat Selection</span>
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-surface-container-lowest px-5 py-2.5 rounded-full flex items-center gap-3 border border-outline-variant/20">
              <span className="material-symbols-outlined text-primary">{venue.icon}</span>
              <span className="font-bold tracking-tight">{venue.name}</span>
            </div>
            <div className="bg-surface-container-low px-4 py-2 rounded-full text-sm text-on-surface-variant">
              Event: {id || 'featured-event'}
            </div>
            <div className="bg-surface-container-low px-4 py-2 rounded-full text-sm text-on-surface-variant">
              {stats.available} vacant seats
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="bg-error-container text-on-error-container px-5 py-3 rounded-full flex items-center gap-2 font-bold">
            <span className="material-symbols-outlined text-xl">timer</span>
            <span>Seats held for 09:54</span>
          </div>
          <div className="bg-surface-container-low px-4 py-2 rounded-full flex items-center gap-3">
            <span className="text-sm text-on-surface-variant">Tickets</span>
            <button onClick={() => onTicketCountChange(ticketCount - 1)} className="w-7 h-7 rounded-full bg-surface-container-high hover:bg-surface-container-highest">-</button>
            <span className="font-bold w-5 text-center">{ticketCount}</span>
            <button onClick={() => onTicketCountChange(ticketCount + 1)} className="w-7 h-7 rounded-full bg-surface-container-high hover:bg-surface-container-highest">+</button>
          </div>
        </div>
      </motion.header>

      <div className="mb-8 overflow-x-auto no-scrollbar">
        <div className="inline-flex min-w-max gap-2 p-2 rounded-full bg-surface-container-low border border-outline-variant/20">
          {venueOptions.map((option) => {
            const isActive = option.key === activeVenue
            return (
              <button
                key={option.key}
                onClick={() => onVenueChange(option.key)}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide transition-colors ${isActive ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <motion.section
          className="lg:w-[68%]"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          <div className="bg-surface-container-low rounded-xl p-6 md:p-10">
            <div className="w-full text-center mb-10">
              <div className="h-1.5 w-full bg-outline-variant/40 rounded-full mb-3 overflow-hidden">
                <div className="h-full w-2/3 bg-primary/30 mx-auto rounded-full" />
              </div>
              <span className="text-[11px] font-black tracking-[0.2em] text-on-surface-variant uppercase">{venue.stageLabel}</span>
            </div>

            {venue.type === 'rows' ? (
              <>
                {activeVenue === 'stadium' && (
                  <Stadium2DMap
                    layout={layout}
                    toggleSeat={toggleSeat}
                    selectedSeatIds={selectedSeatIds}
                    selectedCompartment={selectedCompartment}
                    setSelectedCompartment={setSelectedCompartment}
                    compartmentStats={compartmentStats}
                  />
                )}
                {activeVenue === 'concertHall' && (
                  <ConcertHall2DMap layout={layout} toggleSeat={toggleSeat} seatButtonClass={seatButtonClass} />
                )}
                {activeVenue === 'cinema' && (
                  <Cinema2DMap layout={layout} toggleSeat={toggleSeat} seatButtonClass={seatButtonClass} />
                )}
                {activeVenue === 'hackLab' && (
                  <HackLab2DMap layout={layout} toggleSeat={toggleSeat} seatButtonClass={seatButtonClass} />
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div className="rounded-xl border border-dashed border-outline-variant/30 bg-surface p-4 text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant text-center">Entrance</div>
                  <div className="rounded-xl border border-secondary-container/50 bg-secondary-container/25 p-4 text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant text-center">Chef Counter</div>
                  <div className="rounded-xl border border-dashed border-outline-variant/30 bg-surface p-4 text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant text-center">Lounge</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {layout.tables.map((table) => (
                  <div key={table.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-5">
                    <div className="text-xs font-black uppercase tracking-[0.15em] text-on-surface-variant mb-4">Table {table.id.replace('T', '')}</div>
                    <div className="relative h-36">
                      <div className="absolute inset-0 m-auto w-20 h-20 rounded-full border-2 border-outline-variant/30 bg-surface-container-low flex items-center justify-center text-xs font-bold text-on-surface-variant">
                        {table.id}
                      </div>

                      {table.seats.map((seat, seatIdx) => {
                        const offsets = [
                          'left-1/2 top-0 -translate-x-1/2',
                          'right-0 top-1/2 -translate-y-1/2',
                          'left-1/2 bottom-0 -translate-x-1/2',
                          'left-0 top-1/2 -translate-y-1/2',
                          'left-1/4 top-1 -translate-x-1/2',
                          'right-1 top-1/4 -translate-y-1/2',
                        ]

                        return (
                          <button
                            key={seat.id}
                            onClick={() => toggleSeat(seat)}
                            className={`absolute w-8 h-8 rounded-full transition-colors ${offsets[seatIdx]} ${seatButtonClass(seat)}`}
                            title={seat.label}
                          />
                        )
                      })}
                    </div>
                  </div>
                ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-6 py-6 mt-10 px-6 bg-surface-container-lowest rounded-full border border-outline-variant/10">
              {legendItems.map((legend) => (
                <div key={legend.label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-sm ${legend.color}`} />
                  <span className="text-xs font-semibold uppercase text-on-surface-variant">{legend.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.aside
          className="lg:w-[32%]"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <div className="sticky top-24 bg-surface-container-lowest p-7 rounded-xl shadow-[0_24px_50px_rgba(26,28,28,0.08)] flex flex-col gap-6">
            <div className="border-b border-surface-container-high pb-5">
              <h2 className="font-family-headline font-extrabold text-2xl tracking-tighter">Order Summary</h2>
              <p className="text-on-surface-variant text-sm">{venue.sectionLabel} / {venue.name}</p>
              <p className="text-xs text-on-surface-variant mt-1">Select {ticketCount} seats. You picked {selectedSeats.length}.</p>
            </div>

            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
              {selectedSeats.length === 0 ? (
                <p className="text-sm text-on-surface-variant">Choose seats from the vacant seats on the venue map.</p>
              ) : (
                selectedSeats.map((seat) => (
                  <div key={seat.id} className="flex justify-between items-center rounded-lg px-3 py-2 bg-surface-container-low">
                    <div className="flex flex-col">
                      <span className="font-bold">Seat {seat.label}</span>
                      <span className="text-xs text-on-surface-variant">Standard Admission</span>
                    </div>
                    <button onClick={() => toggleSeat(seat)} className="text-on-surface-variant hover:text-error transition-colors">
                      <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="bg-surface-container-low rounded-lg p-5 flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Subtotal ({selectedSeats.length} tickets)</span>
                <span className="font-medium">Rs {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Service Fees</span>
                <span className="font-medium">Rs {serviceFee.toFixed(2)}</span>
              </div>
              <div className="h-px bg-outline-variant/20 my-1" />
              <div className="flex justify-between items-end">
                <span className="font-bold text-lg tracking-tight">Total</span>
                <span className="font-family-headline font-black text-3xl tracking-tighter">Rs {total.toFixed(2)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              state={{
                eventId: id,
                venue: venue.name,
                section: venue.sectionLabel,
                seats: selectedSeats.map((seat) => seat.label),
                ticketCount,
                subtotal,
                serviceFee,
                total,
              }}
            >
              <motion.button
                disabled={!canContinue}
                className={`w-full py-5 rounded-full font-bold text-lg flex items-center justify-center gap-3 transition-opacity ${canContinue ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'}`}
                whileHover={canContinue ? { scale: 1.02 } : {}}
                whileTap={canContinue ? { scale: 0.98 } : {}}
              >
                Continue to Checkout
                <span className="material-symbols-outlined">arrow_forward</span>
              </motion.button>
            </Link>

            {!canContinue && (
              <p className="text-xs text-center text-error font-semibold">Select at least one vacant seat to continue.</p>
            )}

            <p className="text-[10px] text-center uppercase tracking-[0.2em] text-on-surface-variant font-bold px-3 leading-relaxed">
              Live layout. Vacant seats update by venue type and event category.
            </p>
          </div>
        </motion.aside>
      </div>
    </div>
  )
}
