import { useRef } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// All buildings use the same off-white palette — exactly like the reference
const MAT = {
  main:   { color: '#E9E4D6', roughness: 0.72, metalness: 0.04 },
  shadow: { color: '#D8D2C2', roughness: 0.80, metalness: 0.03 },
  dark:   { color: '#C8C1AF', roughness: 0.85, metalness: 0.02 },
}

function MainMat({ highlight, isStart, isDestination }) {
  // Priority: Start (Blue) > Destination (Emerald) > Highlight (Teal)
  const emissiveColor = isStart ? '#0088ff' : isDestination ? '#10b981' : highlight ? '#2dd4bf' : '#000000'
  const emissiveIntensity = (isStart || isDestination || highlight) ? 0.6 : 0
  return (
    <meshStandardMaterial
      color={MAT.main.color}
      roughness={MAT.main.roughness}
      metalness={MAT.main.metalness}
      emissive={emissiveColor}
      emissiveIntensity={emissiveIntensity}
    />
  )
}
function ShadowMat() {
  return <meshStandardMaterial color={MAT.shadow.color} roughness={MAT.shadow.roughness} metalness={MAT.shadow.metalness} />
}
function DarkMat() {
  return <meshStandardMaterial color={MAT.dark.color} roughness={MAT.dark.roughness} metalness={MAT.dark.metalness} />
}

// ─── Building type renderers ────────────────────────────────────────────────

// A. Simple block (small classroom / utility)
function BlockBuilding({ w = 2, h = 0.8, d = 2, highlight, isStart, isDestination }) {
  return (
    <group>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <MainMat highlight={highlight} isStart={isStart} isDestination={isDestination} />
      </mesh>
      {/* Roof ledge */}
      <mesh position={[0, h + 0.06, 0]}>
        <boxGeometry args={[w + 0.1, 0.1, d + 0.1]} />
        <ShadowMat />
      </mesh>
    </group>
  )
}

// B. Tower (tall vertical high-rise)
function TowerBuilding({ w = 1.4, h = 4, d = 1.4, highlight, isStart, isDestination }) {
  return (
    <group>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <MainMat highlight={highlight} isStart={isStart} isDestination={isDestination} />
      </mesh>
      {/* Cap */}
      <mesh position={[0, h + 0.12, 0]}>
        <boxGeometry args={[w + 0.12, 0.22, d + 0.12]} />
        <ShadowMat />
      </mesh>
    </group>
  )
}

// C. Layered building (base + set-back upper floor)
function LayeredBuilding({ w = 3, h1 = 1, h2 = 1.2, d = 2.5, highlight, isStart, isDestination }) {
  return (
    <group>
      {/* Base */}
      <mesh position={[0, h1 / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h1, d]} />
        <MainMat highlight={highlight} isStart={isStart} isDestination={isDestination} />
      </mesh>
      {/* Roof ledge on base */}
      <mesh position={[0, h1 + 0.06, 0]}>
        <boxGeometry args={[w + 0.1, 0.1, d + 0.1]} />
        <ShadowMat />
      </mesh>
      {/* Upper block — slightly smaller, offset */}
      <mesh position={[-0.2, h1 + h2 / 2 + 0.1, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.65, h2, d * 0.6]} />
        <MainMat highlight={highlight} isStart={isStart} isDestination={isDestination} />
      </mesh>
      {/* Upper cap */}
      <mesh position={[-0.2, h1 + h2 + 0.1 + 0.07, 0.1]}>
        <boxGeometry args={[w * 0.65 + 0.1, 0.12, d * 0.6 + 0.1]} />
        <ShadowMat />
      </mesh>
    </group>
  )
}

// D. Industrial (box + thin chimney cylinders)
function IndustrialBuilding({ w = 2.5, h = 1.2, d = 2, highlight, isStart, isDestination }) {
  return (
    <group>
      {/* Main body */}
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <MainMat highlight={highlight} isStart={isStart} isDestination={isDestination} />
      </mesh>
      {/* Roof ledge */}
      <mesh position={[0, h + 0.06, 0]}>
        <boxGeometry args={[w + 0.1, 0.1, d + 0.1]} />
        <ShadowMat />
      </mesh>
      {/* Chimney 1 */}
      <mesh position={[-0.5, h + 0.65, -0.3]} castShadow>
        <cylinderGeometry args={[0.1, 0.13, 1.3, 8]} />
        <ShadowMat />
      </mesh>
      {/* Chimney 2 */}
      <mesh position={[0.3, h + 0.5, 0.2]} castShadow>
        <cylinderGeometry args={[0.08, 0.11, 1.0, 8]} />
        <DarkMat />
      </mesh>
    </group>
  )
}

// E. Dome structure (cylinder base + sphere top)
function DomeBuilding({ r = 1, h = 0.8, highlight, isStart, isDestination }) {
  return (
    <group>
      {/* Cylinder base */}
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r, r, h, 20]} />
        <MainMat highlight={highlight} isStart={isStart} isDestination={isDestination} />
      </mesh>
      {/* Dome */}
      <mesh position={[0, h + r * 0.55, 0]} castShadow>
        <sphereGeometry args={[r * 0.75, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <MainMat highlight={highlight} isStart={isStart} isDestination={isDestination} />
      </mesh>
    </group>
  )
}

// F. Playground (flat cricket ground)
function PlaygroundBuilding({
  w = 2.8,
  h = 0.06,
  d = 2.2,
  pitchW = 0.35,
  pitchD = 1.2,
  highlight,
  isStart,
  isDestination,
}) {
  const fieldColor = isStart
    ? '#65B8F7'
    : isDestination
      ? '#6FC8A0'
      : highlight
        ? '#79D9C8'
        : '#75C596'

  const fieldEmissive = isStart
    ? '#0088ff'
    : isDestination
      ? '#10b981'
      : highlight
        ? '#2dd4bf'
        : '#000000'

  const fieldEmissiveIntensity = (isStart || isDestination || highlight) ? 0.45 : 0

  return (
    <group>
      {/* Main turf slab */}
      <mesh position={[0, h / 2, 0]} receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={fieldColor}
          roughness={0.9}
          metalness={0.02}
          emissive={fieldEmissive}
          emissiveIntensity={fieldEmissiveIntensity}
        />
      </mesh>

      {/* Light boundary strip */}
      <mesh position={[0, h + 0.005, 0]}>
        <boxGeometry args={[w - 0.08, 0.012, d - 0.08]} />
        <meshStandardMaterial color="#9DD9B7" roughness={0.88} metalness={0} />
      </mesh>

      {/* Central cricket pitch */}
      <mesh position={[0, h + 0.012, 0]}>
        <boxGeometry args={[pitchW, 0.02, pitchD]} />
        <meshStandardMaterial color="#B6C39E" roughness={0.86} metalness={0} />
      </mesh>
    </group>
  )
}

// ─── Main Building Component ────────────────────────────────────────────────

export default function Building({
  position,
  buildingType = 'block',
  buildingProps = {},
  label,
  isHighlighted,
  isStart,
  isDestination,
  onClick,
}) {
  const groupRef = useRef()

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const target = (isHighlighted || isStart || isDestination) ? 1.08 : 1
    groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, target, delta * 7)
  })

  const typeMap = {
    block:      <BlockBuilding      highlight={isHighlighted} isStart={isStart} isDestination={isDestination} {...buildingProps} />,
    tower:      <TowerBuilding      highlight={isHighlighted} isStart={isStart} isDestination={isDestination} {...buildingProps} />,
    layered:    <LayeredBuilding    highlight={isHighlighted} isStart={isStart} isDestination={isDestination} {...buildingProps} />,
    industrial: <IndustrialBuilding highlight={isHighlighted} isStart={isStart} isDestination={isDestination} {...buildingProps} />,
    dome:       <DomeBuilding       highlight={isHighlighted} isStart={isStart} isDestination={isDestination} {...buildingProps} />,
    playground: <PlaygroundBuilding highlight={isHighlighted} isStart={isStart} isDestination={isDestination} {...buildingProps} />,
  }

  return (
    <group
      ref={groupRef}
      position={[position[0], 0, position[2]]}
      onClick={(e) => { e.stopPropagation(); onClick && onClick() }}
      onPointerEnter={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
      onPointerLeave={() => { document.body.style.cursor = 'auto' }}
    >
      {typeMap[buildingType] || typeMap.block}

      {/* Label */}
      {label && (
        <Html
          position={[0, (buildingProps.h || buildingProps.h1 || 1) + (buildingProps.h2 || 0) + 1.2, 0]}
          center
          distanceFactor={11}
          zIndexRange={[1, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div style={{
            background: isStart
              ? 'rgba(0,100,255,0.9)'
              : isDestination ? 'rgba(16,185,129,0.9)' : isHighlighted ? 'rgba(45,212,191,0.9)' : 'rgba(8,27,44,0.80)',
            border: `1px solid ${
              isStart ? '#0088ff'
              : isDestination ? '#10b981' : isHighlighted ? '#2dd4bf'
              : 'rgba(255,255,255,0.18)'}`,
            color: (isStart || isDestination || isHighlighted) ? '#fff' : '#E9E4D6',
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            letterSpacing: '0.03em',
            backdropFilter: 'blur(4px)',
            transition: 'all 0.25s',
          }}>
            {label}
          </div>
        </Html>
      )}
    </group>
  )
}
