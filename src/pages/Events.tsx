import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEvents } from '../services/api'

interface Event {
  id:             string
  verdict:        string
  face_confidence: number
  authorized_sim: number | null
  blacklist_sim:  number | null
  driver_id:      string | null
  vehicle_id:     string | null
  scanned_at:     string
}

export function Events() {
  const nav = useNavigate()
  const [events,   setEvents]   = useState<Event[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [verdict,  setVerdict]  = useState('')
  const [vehicle,  setVehicle]  = useState('')

  async function load() {
    setLoading(true); setError(null)
    try {
      const { events: e } = await getEvents(verdict || undefined, vehicle || undefined)
      setEvents(e)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const verdictColor = { AUTHORIZED: 'var(--green)', UNAUTHORIZED: 'var(--amber)', BLACKLISTED: 'var(--red)' } as Record<string, string>
  const verdictIcon  = { AUTHORIZED: '✅', UNAUTHORIZED: '⚠️', BLACKLISTED: '🚫' } as Record<string, string>

  return (
    <div className="page" style={{ maxWidth: 680 }}>
      <div className="logo">🚗 DRIVEGUARD</div>
      <h1 className="step-title">Event Log</h1>
      <p className="step-sub">Full scan audit trail — RTMS compliant.</p>

      <div style={{ width: '100%', display: 'flex', gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <label>Filter by Verdict</label>
          <select value={verdict} onChange={e => setVerdict(e.target.value)}>
            <option value="">All</option>
            <option value="AUTHORIZED">Authorized</option>
            <option value="UNAUTHORIZED">Unauthorized</option>
            <option value="BLACKLISTED">Blacklisted</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label>Filter by Vehicle</label>
          <input value={vehicle} onChange={e => setVehicle(e.target.value)} placeholder="GP 123 456" />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button className="btn btn-primary" style={{ width: 'auto', padding: '12px 20px' }} onClick={() => void load()}>
            Search
          </button>
        </div>
      </div>

      {loading && <p style={{ color: 'var(--grey)', marginBottom: 24 }}>Loading…</p>}
      {error   && <p style={{ color: 'var(--red)',  marginBottom: 24 }}>{error}</p>}

      {!loading && !error && (
        <div className="card" style={{ width: '100%', marginBottom: 20, overflow: 'auto' }}>
          {events.length === 0 ? (
            <p style={{ color: 'var(--grey)', textAlign: 'center', padding: '20px 0' }}>No events found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Verdict</th>
                  <th>Driver ID</th>
                  <th>Vehicle</th>
                  <th>Confidence</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {events.map(ev => (
                  <tr key={ev.id}>
                    <td>
                      <span style={{ color: verdictColor[ev.verdict] || 'var(--grey)', fontWeight: 600, fontSize: 13 }}>
                        {verdictIcon[ev.verdict] || ''} {ev.verdict}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{ev.driver_id || '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{ev.vehicle_id || '—'}</td>
                    <td style={{ fontSize: 13 }}>{ev.face_confidence.toFixed(1)}%</td>
                    <td style={{ fontSize: 12, color: 'var(--grey)' }}>
                      {new Date(ev.scanned_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <button className="btn btn-outline" onClick={() => nav('/')}>← Back</button>
    </div>
  )
}
