import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import useMapStore, { BUILDINGS } from '../../store/useMapStore'
import { useToast } from '../ui/ToastSystem'
import { API_BASE_URL as API_BASE } from '../../config/api'

// Map building TYPE → DB location string (single source of truth)
const TYPE_TO_LOCATION = {
  library:    'Library',
  lab:        'Lab',
  classroom:  'Classroom',
  cafeteria:  null,
  admin:      null,
  auditorium: null,
  playground: null,
}

// Fallback resources shown when backend has no data for a building
const FALLBACK_RESOURCES = {
  library:    [{ _id: 'f1', title: 'General Reference Guide',    subject: 'All Subjects',   fileUrl: '#' }],
  lab:        [{ _id: 'f2', title: 'Lab Safety Manual',          subject: 'Science',        fileUrl: '#' }],
  classroom:  [{ _id: 'f3', title: 'Course Syllabus Pack',       subject: 'General',        fileUrl: '#' }],
  cafeteria:  [{ _id: 'f6', title: 'Campus Facilities Guide',    subject: 'Campus Life',    fileUrl: '#' }],
  admin:      [{ _id: 'f4', title: 'Campus Map & Directory',     subject: 'Administration', fileUrl: '#' }],
  auditorium: [{ _id: 'f5', title: 'Event Schedule & Programs',  subject: 'Campus Life',    fileUrl: '#' }],
  playground: [{ _id: 'f7', title: 'Playground Usage Guidelines', subject: 'Campus Life',   fileUrl: '#' }],
}


const TYPE_BADGE = {
  library:   'bg-accentCyan/20 text-accentCyan',
  lab:       'bg-success/20 text-success',
  classroom: 'bg-accent/20 text-accent',
  admin:     'bg-surface/60 text-textPrimary',
  playground:'bg-emerald-400/20 text-emerald-300',
}

function SearchPanel() {
  const {
    startPoint, setStartPoint,
    destination, setDestination,
    buildingCatalog,
    setBuildingCatalog,
    setHighlightedBuilding, setShowPath,
    setResources, setIsSearching, isSearching,
  } = useMapStore()
  const { pushToast } = useToast()

  const buildingIds = Object.keys(buildingCatalog || {})
  const buildingLabels = Object.fromEntries(
    Object.entries(buildingCatalog || {}).map(([id, b]) => [id, b.label]),
  )

  const loadBuildings = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/resources/buildings`)
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.reduce((acc, item) => {
          acc[item.key] = {
            id: item.id,
            label: item.label,
            position: item.position,
            type: item.type,
            buildingType: item.buildingType,
            buildingProps: item.buildingProps,
          }
          return acc
        }, {})
        setBuildingCatalog({ ...BUILDINGS, ...mapped })
      }
    } catch {
      setBuildingCatalog(BUILDINGS)
    }
  }, [setBuildingCatalog])

  useEffect(() => {
    loadBuildings()
  }, [loadBuildings])

  const handleSearch = useCallback(async () => {
    if (!startPoint || !destination) {
      pushToast({ type: 'error', title: 'Both fields required', message: 'Select a starting point and destination.' })
      return
    }
    if (startPoint === destination) {
      pushToast({ type: 'error', title: 'Same location', message: 'Start and destination must be different.' })
      return
    }
    setIsSearching(true)

    // Map building TYPE to DB location string — e.g. 'LabA' (type=lab) → 'Lab'
    const destBuilding = buildingCatalog[destination]
    const dbLocation  = TYPE_TO_LOCATION[destBuilding?.type]
    const fallback    = FALLBACK_RESOURCES[destBuilding?.type] || []

    try {
      let resources = []
      if (dbLocation) {
        const { data } = await axios.get(`${API_BASE}/resources?search=${dbLocation}`)
        resources = data
      }
      // Always ensure something is displayed — merge fallback if empty
      const combined = resources.length > 0 ? resources : fallback
      setResources(combined)
      setHighlightedBuilding(destination)
      setShowPath(true)
      pushToast({
        type: 'success',
        title: '✓ Route found!',
        message: `${buildingLabels[startPoint]} → ${buildingLabels[destination]}`,
      })
    } catch {
      // Even if backend is offline, still show route with fallback data
      setResources(fallback)
      setHighlightedBuilding(destination)
      setShowPath(true)
      pushToast({
        type: 'success',
        title: '✓ Route found!',
        message: `${buildingLabels[startPoint]} → ${buildingLabels[destination]} (offline mode)`,
      })
    } finally {
      setIsSearching(false)
    }
  }, [startPoint, destination, buildingCatalog, buildingLabels])

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute left-3 right-3 top-14 z-10 w-auto rounded-2xl border border-accentCyan/20 bg-bgPrimary/90 p-4 shadow-soft backdrop-blur-md sm:left-3 sm:right-auto sm:top-3 sm:w-64"
    >
      <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-accentCyan">Campus Navigator</p>

      {/* Start point */}
      <div className="mb-3">
        <label className="block text-[10px] text-textAccent mb-1 uppercase tracking-wider">From</label>
        <select
          value={startPoint}
          onChange={(e) => {
            const val = e.target.value
            setStartPoint(val)
            if (val) setHighlightedBuilding(val)
          }}
          className="w-full cursor-pointer appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-textPrimary focus:border-accentCyan/70 focus:outline-none"
        >
          <option value="" className="bg-bgPrimary">Select starting point...</option>
          {buildingIds.map((id) => (
            <option key={id} value={id} className="bg-bgPrimary">
              {buildingLabels[id]}
            </option>
          ))}
        </select>
      </div>

      {/* Destination */}
      <div className="mb-4">
        <label className="block text-[10px] text-textAccent mb-1 uppercase tracking-wider">To</label>
        <select
          value={destination}
          onChange={(e) => {
            const val = e.target.value
            setDestination(val)
            if (val) setHighlightedBuilding(val)
          }}
          className="w-full cursor-pointer appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-textPrimary focus:border-accentCyan/70 focus:outline-none"
        >
          <option value="" className="bg-bgPrimary">Select destination...</option>
          {buildingIds.filter((id) => id !== startPoint).map((id) => (
            <option key={id} value={id} className="bg-bgPrimary">
              {buildingLabels[id]}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleSearch}
        disabled={isSearching}
        className="w-full rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] py-2.5 text-sm font-semibold text-slate-950 transition-all duration-300 hover:from-[#fbbf24] hover:to-[#f59e0b] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSearching ? 'Navigating...' : '→ Find Route'}
      </button>
    </motion.div>
  )
}

function BuildingInfoPanel() {
  const { selectedBuilding, setSelectedBuilding, resources } = useMapStore()

  const buildingCatalog = useMapStore((s) => s.buildingCatalog)

  if (!selectedBuilding || !buildingCatalog[selectedBuilding]) return null

  const building = buildingCatalog[selectedBuilding]
  // Match resources by type → DB location OR use fallback if none loaded
  const dbLocation = TYPE_TO_LOCATION[building.type]
  const matched = dbLocation
    ? resources.filter((r) => r.location === dbLocation)
    : []
  const buildingResources = matched.length > 0 ? matched : (FALLBACK_RESOURCES[building.type] || [])

  return (
    <motion.div
      key={selectedBuilding}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute bottom-3 left-3 right-3 z-10 w-auto rounded-2xl border border-accentCyan/20 bg-bgPrimary/95 p-4 shadow-soft backdrop-blur-md sm:bottom-auto sm:left-auto sm:right-3 sm:top-3 sm:w-60 sm:p-5"
    >
      <button
        onClick={() => setSelectedBuilding(null)}
        className="absolute top-3 right-3 text-textAccent hover:text-white transition-colors text-lg leading-none"
      >×</button>

      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${TYPE_BADGE[building.type] || 'bg-white/10 text-white'}`}>
        {building.type}
      </span>
      <h3 className="font-display text-lg text-textPrimary mt-2 mb-3">{building.label}</h3>

      {buildingResources.length > 0 ? (
        <ul className="space-y-2">
          {buildingResources.slice(0, 4).map((r) => (
            <li key={r._id} className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-textPrimary font-medium truncate">{r.title}</p>
                <p className="text-[10px] text-textAccent">{r.subject}</p>
              </div>
              <a
                href={r.fileUrl || '#'}
                className="shrink-0 text-[10px] text-accentCyan underline underline-offset-2 transition-colors duration-300 hover:text-[#67e8f9]"
              >
                Download
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-textAccent italic">No resources loaded yet. Try searching first.</p>
      )}
    </motion.div>
  )
}

function Legend() {
  const items = [
    { label: 'Library',   color: '#4a7fa5' },
    { label: 'Lab',       color: '#4a8f6f' },
    { label: 'Academic',  color: '#9f7a4a' },
    { label: 'Admin',     color: '#7a4a9f' },
    { label: 'Cafeteria', color: '#a04a4a' },
  ]
  return (
    <div className="absolute bottom-3 left-3 z-10 hidden flex-col gap-1.5 rounded-xl border border-white/10 bg-bgPrimary/85 px-3 py-2.5 backdrop-blur-sm md:flex">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
          <span className="text-[10px] text-textAccent">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

function FullscreenButton() {
  const { isFullscreen, toggleFullscreen } = useMapStore()
  return (
    <>
      {/* Corner icon button — always visible */}
      <button
        onClick={toggleFullscreen}
        title={isFullscreen ? 'Exit Fullscreen (ESC)' : 'Fullscreen'}
        className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-accentCyan/20 bg-bgPrimary/85 text-textAccent transition-all duration-300 hover:bg-accentCyan/10 hover:text-accentCyan"
      >
        {isFullscreen ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        )}
      </button>

      {/* Prominent exit pill — only visible when truly fullscreen */}
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-accent/30 bg-bgPrimary/95 px-4 py-2 text-xs font-semibold text-accent transition-all duration-300 hover:border-accent/55 hover:bg-accent/10 shadow-lg"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
          </svg>
          Exit Fullscreen
          <kbd className="ml-1 text-[9px] opacity-50 border border-white/20 rounded px-1">ESC</kbd>
        </button>
      )}
    </>
  )
}

function HintBar() {
  return (
    <div className="absolute bottom-3 right-3 z-10 hidden rounded-xl border border-white/10 bg-bgPrimary/85 px-3 py-2 backdrop-blur-sm md:block">
      <p className="text-[10px] text-textAccent">🖱 Drag to rotate • Scroll to zoom • Click building</p>
    </div>
  )
}

export default function MapUI() {
  return (
    <>
      <SearchPanel />
      <AnimatePresence>
        <BuildingInfoPanel />
      </AnimatePresence>
      <FullscreenButton />
      <Legend />
      <HintBar />
    </>
  )
}
