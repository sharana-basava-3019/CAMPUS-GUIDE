import { Suspense, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import CampusScene from './CampusScene'
import useMapStore from '../../store/useMapStore'

// Isometric-style default camera position
const CAM_POSITION = [16, 14, 16]

export default function ThreeCanvas() {
  const { isFullscreen, setIsFullscreen } = useMapStore()
  const containerRef = useRef(null)

  // ── Browser Fullscreen API ────────────────────────────────
  const requestFullscreen = () => {
    const el = containerRef.current
    if (!el) return
    if (el.requestFullscreen)            el.requestFullscreen()
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
    else if (el.mozRequestFullScreen)    el.mozRequestFullScreen()
    else if (el.msRequestFullscreen)     el.msRequestFullscreen()
  }

  const exitFullscreen = () => {
    if (document.exitFullscreen)            document.exitFullscreen()
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen()
    else if (document.mozCancelFullScreen)  document.mozCancelFullScreen()
    else if (document.msExitFullscreen)     document.msExitFullscreen()
  }

  // Sync Zustand state with actual browser fullscreen state (handles ESC key too)
  useEffect(() => {
    const onFsChange = () => {
      const fsEl =
        document.fullscreenElement       ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement    ||
        document.msFullscreenElement
      setIsFullscreen(!!fsEl)
    }
    document.addEventListener('fullscreenchange',       onFsChange)
    document.addEventListener('webkitfullscreenchange', onFsChange)
    document.addEventListener('mozfullscreenchange',    onFsChange)
    document.addEventListener('MSFullscreenChange',     onFsChange)
    return () => {
      document.removeEventListener('fullscreenchange',       onFsChange)
      document.removeEventListener('webkitfullscreenchange', onFsChange)
      document.removeEventListener('mozfullscreenchange',    onFsChange)
      document.removeEventListener('MSFullscreenChange',     onFsChange)
    }
  }, [setIsFullscreen])

  // Drive fullscreen when Zustand flag changes (from FullscreenButton in MapUI)
  useEffect(() => {
    const fsActive = !!(
      document.fullscreenElement       ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement    ||
      document.msFullscreenElement
    )
    if (isFullscreen && !fsActive) {
      requestFullscreen()
    } else if (!isFullscreen && fsActive) {
      exitFullscreen()
    }
  }, [isFullscreen])

  return (
    <div
      ref={containerRef}
      style={{ height: isFullscreen ? '100vh' : '520px' }}
      className="relative w-full bg-[#0d2638] border border-white/10 rounded-xl overflow-hidden transition-all duration-300"
    >
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: CAM_POSITION, fov: 45, near: 0.1, far: 200 }}
        gl={{ antialias: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <CampusScene />
        </Suspense>
      </Canvas>
    </div>
  )
}
