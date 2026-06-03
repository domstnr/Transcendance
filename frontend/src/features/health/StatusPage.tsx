import { useEffect, useState } from 'react'
import type {
	ServiceStatus,
	HealthResponse,
} from './types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function StatusPage() {
	const [health, setHealth] = useState<HealthResponse | null>(null)
	const [loading, setLoading] = useState(true)
	const [lastChecked, setLastChecked] = useState<Date | null>(null)

	async function fetchHealth() {
		setLoading(true)
		try {
			const res = await fetch(`${API_URL}/health`)
			const data = await res.json() as HealthResponse
			setHealth(data)
		} catch {
			setHealth({ status: 'error', info: {}, error: {} })
		} finally {
			setLoading(false)
			setLastChecked(new Date())
		}
	}

	useEffect(() => {
		void fetchHealth()
	}, [])

	const isUp = health?.status === 'ok'
	const services = { ...health?.info, ...health?.error }

	return (
    <section style={{ maxWidth: 600, margin: '0 auto', padding: '2rem' }}>
      <h1>System Status</h1>

      {loading ? <p>Checking services...</p> : (
        <>
          <div style={{ padding: '1rem', borderRadius: 8, background: isUp ? '#d4edda' : '#f8d7da', marginBottom: '1.5rem' }}>
            <strong style={{ color: isUp ? '#155724' : '#721c24', fontSize: 18 }}>
              {isUp ? '✓ All systems operational' : '✗ Service disruption detected'}
            </strong>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>Service</th>
                <th style={{ textAlign: 'right', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(services).map(([name, info]) => (
                <tr key={name}>
                  <td style={{ padding: '0.5rem', textTransform: 'capitalize' }}>{name.replace('_', ' ')}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', color: info.status === 'up' ? 'green' : 'red' }}>
                    {info.status === 'up' ? '● Up' : '● Down'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {lastChecked && (
            <p style={{ marginTop: '1rem', color: '#666', fontSize: 13 }}>
              Last checked: {lastChecked.toLocaleTimeString()}
              {' · '}
              <button type="button" onClick={() => void fetchHealth()} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', padding: 0 }}>
                Refresh
              </button>
            </p>
          )}
        </>
      )}
    </section>
  )
}

export default StatusPage
