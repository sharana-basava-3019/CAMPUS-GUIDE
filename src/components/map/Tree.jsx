// Minimal isometric tree — matches reference image style
// White sphere canopy on cylinder trunk, no color variation
export default function Tree({ position, scale = 1 }) {
  const s = scale
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 0.28 * s, 0]} castShadow>
        <cylinderGeometry args={[0.07 * s, 0.1 * s, 0.55 * s, 8]} />
        <meshStandardMaterial color="#D8D2C2" roughness={0.9} metalness={0} />
      </mesh>

      {/* Single sphere canopy — matches reference clean lollipop style */}
      <mesh position={[0, 0.75 * s, 0]} castShadow>
        <sphereGeometry args={[0.38 * s, 14, 12]} />
        <meshStandardMaterial color="#E9E4D6" roughness={0.65} metalness={0.03} />
      </mesh>
    </group>
  )
}
