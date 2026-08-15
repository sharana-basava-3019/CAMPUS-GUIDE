import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Line } from '@react-three/drei'
import useMapStore from '../../store/useMapStore'

// ─── Road height ─────────────────────────────────────────────────────────────
const RY = 0.025 // just above road surface — no z-fighting

// ─── Road waypoint graph ──────────────────────────────────────────────────────
// All nodes are intersection points or mid-road points on actual road surfaces.
// Coordinates: [x, z]. Y is always RY at render time.
const NODES = {
  // Outer corners
  nw:    [-9, -9], ne:    [ 9, -9],
  sw:    [-9,  9], se:    [ 9,  9],
  // Main-road mid-points (on main Z-road, z=0)
  wm:    [-5.5, 0], // aligns with Library / Auditorium x
  wnm:   [-2.8, 0], // aligns with EngineeringBlock / MBABlock x
  enm:   [ 2.8, 0], // aligns with MCABlock / Cafeteria x
  em:    [ 5.5, 0], // aligns with LabA / LabB x
  // Main-road mid-points (on main X-road, x=0)
  nm:    [0, -5.5], // aligns with Library / LabA z
  nnm:   [0, -2.8], // aligns with EngineeringBlock / MCABlock z
  snm:   [0,  2.8], // aligns with MBABlock / Cafeteria z (used as needed)
  sm:    [0,  5.5], // aligns with Auditorium / LabB z
  // Main intersection
  ctr:   [ 0,  0],
  // Secondary road junctions (outer ring)
  north: [ 0, -9], south: [ 0,  9],
  west:  [-9,  0], east:  [ 9,  0],
}

// Edges — every road segment (bidirectional)
const EDGES = [
  // Main horizontal road (z=0)
  ['west', 'wm'], ['wm', 'wnm'], ['wnm', 'ctr'], ['ctr', 'enm'], ['enm', 'em'], ['em', 'east'],
  // Main vertical road (x=0)
  ['north', 'nm'], ['nm', 'nnm'], ['nnm', 'ctr'], ['ctr', 'snm'], ['snm', 'sm'], ['sm', 'south'],
  // Outer ring (secondary roads)
  ['nw', 'north'], ['north', 'ne'],
  ['nw', 'west'],  ['east',  'ne'],
  ['sw', 'west'],  ['east',  'se'],
  ['sw', 'south'], ['south', 'se'],
]

// Build adjacency list
const ADJ = {}
Object.keys(NODES).forEach(id => { ADJ[id] = [] })
EDGES.forEach(([a, b]) => { ADJ[a].push(b); ADJ[b].push(a) })

// ─── Building → road entry nodes ─────────────────────────────────────────────
// Each building connects to 1–2 road nodes (its "driveway" onto the road grid).
// NW quadrant buildings exit onto main Z-road (z=0) at their x, or main X-road (x=0) at their z.
const ENTRY = {
  Library:          ['wm',  'nm'],   // [-5.5,-5.5] → wm or nm
  EngineeringBlock: ['wnm', 'nnm'],  // [-2.8,-2.8] → wnm or nnm
  LabA:             ['em',  'nm'],   // [ 5.5,-5.5] → em  or nm
  MCABlock:         ['enm', 'nnm'],  // [ 2.8,-2.8] → enm or nnm
  Administration:   ['ctr'],         // [0,0] → at center
  Auditorium:       ['wm',  'sm'],   // [-5.5, 5.5] → wm  or sm
  MBABlock:         ['wnm', 'snm'],  // [-2.8, 2.8] → wnm or snm
  Playground:       ['wm',  'wnm'],  // [-7.1, 1.8] → join nearest west-side main road nodes
  LabB:             ['em',  'sm'],   // [ 5.5, 2.5] → em  or sm (z≈sm)
  Cafeteria:        ['enm', 'sm'],   // [ 2.8, 5.5] → enm or sm
}

// ─── BFS ─────────────────────────────────────────────────────────────────────
function bfs(startId, goalId) {
  if (startId === goalId) return [startId]
  const visited = new Set([startId])
  const queue = [[startId]]
  while (queue.length) {
    const path = queue.shift()
    for (const nb of (ADJ[path.at(-1)] || [])) {
      if (visited.has(nb)) continue
      const next = [...path, nb]
      if (nb === goalId) return next
      visited.add(nb)
      queue.push(next)
    }
  }
  return [startId, goalId]
}

// ─── Build road-following waypoints ──────────────────────────────────────────
function buildWaypoints(fromKey, toKey, buildings) {
  const fromB = buildings[fromKey]
  const toB   = buildings[toKey]
  if (!fromB || !toB) return []

  const fromEntries = ENTRY[fromKey] || ['ctr']
  const toEntries   = ENTRY[toKey]   || ['ctr']

  // Find the pair (fromEntry, toEntry) that yields the shortest BFS path
  let best = null
  let bestLen = Infinity
  for (const fe of fromEntries) {
    for (const te of toEntries) {
      const p = bfs(fe, te)
      if (p.length < bestLen) { bestLen = p.length; best = { fe, te, p } }
    }
  }
  if (!best) return []

  const v3 = (xz) => new THREE.Vector3(xz[0], RY, xz[1])

  const start  = new THREE.Vector3(fromB.position[0], RY, fromB.position[2])
  const end    = new THREE.Vector3(toB.position[0],   RY, toB.position[2])
  const fEntry = v3(NODES[best.fe])
  const tEntry = v3(NODES[best.te])

  const roadPts = best.p.map(id => v3(NODES[id]))

  // Deduplicate identical consecutive points
  const raw = [start, fEntry, ...roadPts, tEntry, end]
  const pts = [raw[0]]
  for (let i = 1; i < raw.length; i++) {
    if (raw[i].distanceTo(pts.at(-1)) > 0.05) pts.push(raw[i])
  }
  return pts
}

// ─── PathLine component ───────────────────────────────────────────────────────
export default function PathLine({ fromId, toId }) {
  const lineRef = useRef()
  const { buildingCatalog } = useMapStore()

  const { curvePts, arrowData } = useMemo(() => {
    const waypoints = buildWaypoints(fromId, toId, buildingCatalog || {})
    if (waypoints.length < 2) return { curvePts: [], arrowData: [] }

    const curve = new THREE.CatmullRomCurve3(waypoints, false, 'catmullrom', 0.5)
    const n     = Math.max(60, waypoints.length * 14)
    const cp    = curve.getPoints(n)

    // Place arrow cones at equal intervals along the curve
    const arrowCount = Math.max(3, Math.floor(n / 18))
    const step       = Math.floor(n / (arrowCount + 1))
    const arrows = []
    for (let i = step; i < cp.length - step; i += step) {
      const pos = cp[i]
      const dir = new THREE.Vector3().subVectors(cp[i + 1] || cp[i], cp[i - 1] || cp[i]).normalize()
      const angle = Math.atan2(dir.x, dir.z)
      arrows.push({ pos: [pos.x, RY + 0.06, pos.z], angle })
    }

    return { curvePts: cp, arrowData: arrows }
  }, [fromId, toId, buildingCatalog])

  // Animated dash offset — creates "flowing" motion effect
  useFrame(({ clock }) => {
    if (lineRef.current?.material) {
      lineRef.current.material.dashOffset = -clock.getElapsedTime() * 0.55
    }
  })

  if (!curvePts.length) return null

  const startPt = curvePts[0]
  const endPt   = curvePts.at(-1)

  return (
    <group>
      {/* ── Glowing road-following path ── */}
      <Line
        ref={lineRef}
        points={curvePts}
        color="#00d4ff"
        lineWidth={2.8}
        dashed
        dashSize={0.38}
        gapSize={0.18}
      />

      {/* ── Start dot (blue) ── */}
      <mesh position={[startPt.x, RY + 0.12, startPt.z]}>
        <sphereGeometry args={[0.22, 10, 10]} />
        <meshStandardMaterial color="#0088ff" emissive="#0088ff" emissiveIntensity={2.2} />
      </mesh>

      {/* ── End dot (green) ── */}
      <mesh position={[endPt.x, RY + 0.12, endPt.z]}>
        <sphereGeometry args={[0.22, 10, 10]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={2.2} />
      </mesh>

      {/* ── Directional arrow cones ── */}
      {arrowData.map((a, i) => (
        <mesh
          key={i}
          position={a.pos}
          rotation={[Math.PI / 2, 0, -a.angle]}
        >
          <coneGeometry args={[0.11, 0.26, 5]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={1.6} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  )
}
