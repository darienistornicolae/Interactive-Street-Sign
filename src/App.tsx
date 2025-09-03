import { Routes, Route, Link } from 'react-router-dom'
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
    fetchFormCount()
    const interval = setInterval(fetchFormCount, 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchFormCount])



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
