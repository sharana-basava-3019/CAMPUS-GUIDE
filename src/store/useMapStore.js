import { create } from 'zustand'

// ─── Campus Buildings ─────────────────────────────────────────────────────
// Road layout (Ground.jsx): main roads at x=0 (±0.6) and z=0 (±0.6)
//                           secondary roads at x=±9  (±0.35) z=±9 (±0.35)
//
// 4 quadrant zones (all-green safe plots):
//   NW: x∈(-8.65..-0.6)  z∈(-8.65..-0.6)  → Library + Engineering Block
//   NE: x∈( 0.6.. 8.65)  z∈(-8.65..-0.6)  → Lab A   + MCA Block
//   SW: x∈(-8.65..-0.6)  z∈( 0.6.. 8.65)  → Auditorium + MBA Block + Playground
//   SE: x∈( 0.6.. 8.65)  z∈( 0.6.. 8.65)  → Lab B    + Cafeteria
//   CENTER: Administration tower at road intersection (landmark)
//
// All footprints manually verified: NO building touches any road surface.
//
export const BUILDINGS = {
  // ── NW Quadrant ───────────────────────────────────────────
  Library: {
    id: 'Library',
    label: 'Library',
    position: [-5.5, 0, -5.5],  // footprint x:-7.1..-3.9  z:-6.9..-4.1  ✓
    type: 'library',
    buildingType: 'layered',
    buildingProps: { w: 3.2, h1: 1.1, h2: 1.4, d: 2.8 },
  },
  EngineeringBlock: {
    id: 'Engineering Block',
    label: 'Engineering Block',
    position: [-2.8, 0, -2.8],  // footprint x:-4.3..-1.3  z:-3.9..-1.7  ✓
    type: 'classroom',
    buildingType: 'block',
    buildingProps: { w: 3.0, h: 0.85, d: 2.2 },
  },

  // ── NE Quadrant ───────────────────────────────────────────
  LabA: {
    id: 'Lab A',
    label: 'Lab A',
    position: [5.5, 0, -5.5],   // footprint x:4.2..6.8  z:-6.6..-4.4   ✓
    type: 'lab',
    buildingType: 'industrial',
    buildingProps: { w: 2.6, h: 1.2, d: 2.2 },
  },
  MCABlock: {
    id: 'MCA Block',
    label: 'MCA Block',
    position: [2.8, 0, -2.8],   // footprint x:1.4..4.2  z:-3.8..-1.8   ✓
    type: 'classroom',
    buildingType: 'block',
    buildingProps: { w: 2.8, h: 0.85, d: 2.0 },
  },

  // ── Center landmark ───────────────────────────────────────
  Administration: {
    id: 'Administration',
    label: 'Administration',
    position: [0, 0, 0],         // tower at road intersection — visual landmark
    type: 'admin',
    buildingType: 'tower',
    buildingProps: { w: 1.5, h: 4.5, d: 1.5 },
  },

  // ── SW Quadrant ───────────────────────────────────────────
  Auditorium: {
    id: 'Auditorium',
    label: 'Auditorium',
    position: [-5.5, 0, 5.5],   // footprint x:-6.6..-4.4  z:4.4..6.6    ✓
    type: 'auditorium',
    buildingType: 'dome',
    buildingProps: { r: 1.1, h: 0.9 },
  },
  MBABlock: {
    id: 'MBA Block',
    label: 'MBA Block',
    position: [-2.8, 0, 2.8],   // footprint x:-4.2..-1.4  z:1.6..4.0    ✓
    type: 'classroom',
    buildingType: 'layered',
    buildingProps: { w: 2.8, h1: 0.9, h2: 1.0, d: 2.4 },
  },
  Playground: {
    id: 'PLAYGROUND',
    label: 'Playground',
    position: [-7.1, 0, 1.8],   // footprint x:-8.5..-5.7  z:0.7..2.9    ✓
    type: 'playground',
    buildingType: 'playground',
    buildingProps: { w: 2.8, h: 0.06, d: 2.2, pitchW: 0.35, pitchD: 1.2 },
  },

  // ── SE Quadrant ───────────────────────────────────────────
  LabB: {
    id: 'Lab B',
    label: 'Lab B',
    position: [5.5, 0, 2.5],    // footprint x:4.3..6.7  z:1.5..3.5     ✓
    type: 'lab',
    buildingType: 'block',
    buildingProps: { w: 2.4, h: 1.0, d: 2.0 },
  },
  Cafeteria: {
    id: 'Cafeteria',
    label: 'Cafeteria',
    position: [2.8, 0, 5.5],    // footprint x:1.5..4.1  z:4.3..6.7     ✓
    type: 'cafeteria',
    buildingType: 'block',
    buildingProps: { w: 2.6, h: 0.75, d: 2.4 },
  },
}


export const BUILDING_IDS = Object.keys(BUILDINGS)

const useMapStore = create((set) => ({
  buildingCatalog: BUILDINGS,
  setBuildingCatalog: (buildingCatalog) => set({ buildingCatalog }),

  // auth
  user: null,
  setUser: (user) => set({ user }),

  // search
  startPoint: '',
  destination: '',
  setStartPoint: (startPoint) => set({ startPoint }),
  setDestination: (destination) => set({ destination }),

  // search results
  resources: [],
  setResources: (resources) => set({ resources }),
  isSearching: false,
  setIsSearching: (v) => set({ isSearching: v }),

  // 3D interaction
  highlightedBuilding: null,
  setHighlightedBuilding: (id) => set({ highlightedBuilding: id }),

  selectedBuilding: null,
  setSelectedBuilding: (id) => set({ selectedBuilding: id }),

  // fullscreen
  isFullscreen: false,
  toggleFullscreen: () => set((s) => ({ isFullscreen: !s.isFullscreen })),
  setIsFullscreen: (v) => set({ isFullscreen: v }),

  // path
  showPath: false,
  setShowPath: (v) => set({ showPath: v }),

  // reset
  resetSearch: () => set({
    startPoint: '',
    destination: '',
    resources: [],
    highlightedBuilding: null,
    showPath: false,
  }),
}))

export default useMapStore
