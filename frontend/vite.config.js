import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  build: {
    rollupOptions: {
      output: {
        // Split heavy vendor libraries into separate cache-friendly chunks.
        // Each chunk is only loaded when the code that needs it is first used.
        manualChunks(id) {
          // three.js ecosystem — only loaded when user opens the 3D Map tab
          if (id.includes('node_modules/three') ||
              id.includes('node_modules/@react-three')) {
            return 'vendor-three'
          }
          // framer-motion — deferred with lazy sections
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-framer'
          }
          // React + router — small, load immediately
          if (id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router') ||
              id.includes('node_modules/react-router-dom')) {
            return 'vendor-react'
          }
          // Everything else in node_modules goes into a shared vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor-misc'
          }
        },
      },
    },
  },
})
