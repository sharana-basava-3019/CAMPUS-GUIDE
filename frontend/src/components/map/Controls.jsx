import { OrbitControls } from '@react-three/drei'

export default function Controls() {
  return (
    <OrbitControls
      makeDefault
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      // Restrict vertical tilt: keep isometric feel, don't go underground
      minPolarAngle={Math.PI / 6}   // ~30°
      maxPolarAngle={Math.PI / 2.4} // ~75°
      // Zoom limits
      minDistance={6}
      maxDistance={28}
      // Smooth damping for cinematic feel
      enableDamping={true}
      dampingFactor={0.08}
      rotateSpeed={0.55}
      zoomSpeed={0.7}
      panSpeed={0.5}
    />
  )
}
