import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

// ── Service Worker Registration ──
import { registerSW } from 'virtual:pwa-register'

registerSW({
  onRegisteredSW(swScriptUrl) {
    console.log('[PWA] Service worker registered:', swScriptUrl)
  },
  onOfflineReady() {
    console.log('[PWA] App is ready for offline use')
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* AuthProvider wraps the entire app so every component can access
        auth state via useAuth() — no more scattered localStorage reads */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
