import { Routes, Route } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import './App.css'
import MainPage from './components/MainPage'
import FormPage from './components/FormPage'

const getServerUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  return `http://${window.location.hostname}:3001`;
};

function App() {
  const [formCount, setFormCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [serverUrl] = useState(getServerUrl())

  const fetchFormCount = useCallback(async () => {
    try {
      const response = await fetch(`${serverUrl}/api/form-count`)
      if (!response.ok) {
        throw new Error('Failed to fetch form count')
      }
      const data = await response.json()
      setFormCount(data.count || 0)
      setError(null)
    } catch (err) {
      console.error('Error fetching form count:', err)
      setError('Unable to load current count')
      setFormCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [serverUrl])

  useEffect(() => {
    let es: EventSource | null = null
    let fallbackTimer: ReturnType<typeof setInterval> | null = null

    const startPolling = () => {
      // immediate fetch, then every 30s
      fetchFormCount()
      fallbackTimer = setInterval(fetchFormCount, 30 * 1000)
    }

    const startSSE = () => {
      try {
        es = new EventSource(`${serverUrl}/api/form-count/stream`)
        es.onmessage = (evt) => {
          try {
            const data = JSON.parse(evt.data)
            if (typeof data.count === 'number') {
              setFormCount(data.count)
              setError(null)
              setIsLoading(false)
            }
          } catch (e) {
            // ignore parse errors
          }
        }
        es.onerror = () => {
          es?.close()
          es = null
          // fall back to polling
          if (!fallbackTimer) startPolling()
        }
      } catch {
        startPolling()
      }
    }

    // prefer SSE; if it fails, we'll poll
    startSSE()

    return () => {
      if (es) es.close()
      if (fallbackTimer) clearInterval(fallbackTimer)
    }
  }, [serverUrl, fetchFormCount])



  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<MainPage formCount={formCount} isLoading={isLoading} error={error} />} />
        <Route path="/harassment-form" element={<FormPage serverUrl={serverUrl} />} />
        </Routes>
      
      <footer className="footer">
        <p>&copy; 2025 Community Safety Initiative</p>
      </footer>
    </div>
  )
}

export default App
