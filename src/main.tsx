import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'

// Fuentes auto-alojadas: sólo los pesos que la web usa de verdad.
import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/playfair-display/400-italic.css'
import '@fontsource/playfair-display/500-italic.css'
import '@fontsource/playfair-display/600-italic.css'
import '@fontsource/cinzel/400.css'
import '@fontsource/cinzel/600.css'
import '@fontsource/cinzel/700.css'

import App from './App.tsx'
import './index.css'

const root = document.getElementById('root')!
const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// En producción el `index.html` llega prerenderizado (ver
// `scripts/prerender.mjs`): se hidrata sobre ese HTML en vez de repintarlo.
// En desarrollo el div está vacío y se monta como siempre.
if (root.hasChildNodes()) {
  hydrateRoot(root, app)
} else {
  createRoot(root).render(app)
}
