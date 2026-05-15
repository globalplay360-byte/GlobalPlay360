import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import './index.css'
import './i18n' // Configurem les traduccions abans no carregui React
import './services/authLanguage' // Sincronitza l'idioma de Firebase Auth amb i18next
import App from './App.tsx'

const rootEl = document.getElementById('root')
if (!rootEl) {
  document.body.innerHTML = '<p style="font-family:system-ui;padding:1rem;background:#0B1120;color:#f1f5f9">Error: falta l’element #root.</p>'
} else {
  try {
    createRoot(rootEl).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  } catch {
    rootEl.innerHTML =
      '<p style="font-family:system-ui;padding:1.5rem;max-width:28rem;margin:2rem auto;background:#111827;color:#f1f5f9;border-radius:8px;border:1px solid #334155">No s’ha pogut iniciar l’aplicació. Prova d’actualitzar la pàgina o un altre navegador.</p>'
  }
}
