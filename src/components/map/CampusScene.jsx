import { memo } from 'react'
import Ground from './Ground'
import Building from './Building'
import Tree from './Tree'
import PathLine from './PathLine'
import Controls from './Controls'
import useMapStore from '../../store/useMapStore'

// Hand-placed trees — spread naturally around campus like the reference
const TREE_POSITIONS = [
  // Outer corners — well beyond secondary roads at ±9
  { pos: [-12, 0, -12], scale: 1.0 },
  { pos: [ 12, 0, -12], scale: 0.9 },
  { pos: [-12, 0,  12], scale: 1.0 },
  { pos: [ 12, 0,  12], scale: 0.85 },
  // Mid-edge — outside the campus interior grid
  { pos: [-12, 0,  -4], scale: 0.9 },
  { pos: [-12, 0,   4], scale: 1.0 },
  { pos: [ 12, 0,  -4], scale: 0.85 },
  { pos: [ 12, 0,   4], scale: 0.9 },
  { pos: [ -4, 0, -12], scale: 0.9 },
  { pos: [  4, 0, -12], scale: 1.0 },
  { pos: [ -4, 0,  12], scale: 0.9 },
  { pos: [  4, 0,  12], scale: 0.85 },
  // Road-corridor accent trees — on main road strips, away from plots
  { pos: [ -8, 0,   0], scale: 1.1 },  // west corridor (between eng. block & outer road)
  { pos: [  8, 0,   0], scale: 1.1 },  // east corridor (between lab B & outer road)
  { pos: [  0, 0,  -7], scale: 0.8 },  // north corridor (above top-row plots)
  { pos: [  0, 0,   7], scale: 0.75 }, // south corridor (below bottom-row plots)
  { pos: [  7, 0,  -8], scale: 0.9 },  // NE corner zone
  { pos: [ -7, 0,   8], scale: 0.9 },  // SW corner zone
]

const CampusScene = () => {
  const {
    buildingCatalog,
    highlightedBuilding,
    selectedBuilding,
    setSelectedBuilding,
    startPoint,
    destination,
    showPath,
  } = useMapStore()

  const buildingList = Object.entries(buildingCatalog || {})

  return (
    <>
      {/* ── Lighting exactly matching reference ── */}
      {/* Soft overall fill */}
      <ambientLight intensity={0.65} color="#ffffff" />

      {/* Main sun — upper right front, creates clean isometric shadows */}
      <directionalLight
        position={[8, 14, 8]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={60}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        color="#ffffff"
      />

      {/* Subtle hemisphere — sky tint from above, ground bounce */}
      <hemisphereLight args={['#e0f4ff', '#c8f0d8', 0.3]} />

      {/* Soft fill from opposite side — prevents completely dark faces */}
      <directionalLight position={[-5, 6, -5]} intensity={0.2} color="#d4eeff" />

      {/* Scene background fog — matching reference dark blue surroundings */}
      <fog attach="fog" args={['#0d2040', 30, 60]} />

      {/* Ground */}
      <Ground />

      {/* Trees */}
      {TREE_POSITIONS.map(({ pos, scale }, i) => (
        <Tree key={i} position={pos} scale={scale} />
      ))}

      {/* Buildings — all off-white, different geometry types */}
      {buildingList.map(([key, b]) => {
        const isStart = startPoint === key
        const isDest = destination === key
        return (
          <Building
            key={`${b.id}-${isStart ? 'start' : 'no'}-${isDest ? 'dest' : 'no'}`}
            position={b.position}
            buildingType={b.buildingType}
            buildingProps={b.buildingProps}
            label={b.label}
            isStart={isStart}
            isDestination={isDest}
            isHighlighted={highlightedBuilding === key || selectedBuilding === key}
            onClick={() => setSelectedBuilding(selectedBuilding === key ? null : key)}
          />
        )
      })}

      {/* Route path */}
      {showPath && startPoint && destination && (
        <PathLine fromId={startPoint} toId={destination} />
      )}

      {/* Camera controls */}
      <Controls />
    </>
  )
}

export default memo(CampusScene)
