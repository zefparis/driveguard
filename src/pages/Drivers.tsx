import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDrivers, unenrollDriver } from '../services/api'

interface Driver {
  face_id:     string
  external_id: string
  name:        string
  role:        string
  vehicle_id:  string
  licences:    string[]
  enrolled_at: string
}

export function Drivers() {
  const nav = useNavigate()
  const [drivers,  setDrivers]  = useState<Driver[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)

  async function load() {
    setLoading(true); setError(null)
    try {
      const { drivers: d } = await getDrivers()
      setDrivers(d)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  async function handleRemove(faceId: string, name: string) {
    if (!confirm(`Remove ${name} from the fleet?`)) return
    setRemoving(faceId)
    try {
      await unenrollDriver(faceId)
      setDrivers(prev => prev.filter(d => d.face_id !== faceId))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Remove failed')
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <div className="logo">🚗 DRIVEGUARD</div>
      <h1 className="step-title">Driver Registry</h1>
      <p className="step-sub">All enrolled drivers in the fleet.</p>

      {loading && <p style={{ color: 'var(--grey)', marginBottom: 24 }}>Loading…</p>}
      {error   && <p style={{ color: 'var(--red)',  marginBottom: 24 }}>{error}</p>}

      {!loading && !error && (
        <div className="card" style={{ width: '100%', marginBottom: 20, overflow: 'auto' }}>
          {drivers.length === 0 ? (
            <p style={{ color: 'var(--grey)', textAlign: 'center', padding: '20px 0' }}>No drivers enrolled yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>ID</th><th>Role</th><th>Vehicle</th><th>Licences</th><th></th>
                </tr>
              </thead>
              <tbody>
                {drivers.map(d => (
                  <tr key={d.face_id}>
                    <td style={{ fontWeight: 600 }}>{d.name}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{d.external_id}</td>
                    <td style={{ color: 'var(--grey)', fontSize: 13 }}>{d.role || '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{d.vehicle_id || '—'}</td>
                    <td style={{ fontSize: 12 }}>{Array.isArray(d.licences) ? d.licences.join(', ') || '—' : '—'}</td>
                    <td>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '6px 12px', fontSize: 12, width: 'auto' }}
                        disabled={removing === d.face_id}
                        onClick={() => handleRemove(d.face_id, d.name)}
                      >
                        {removing === d.face_id ? '…' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, width: '100%' }}>
        <button className="btn btn-outline" onClick={() => nav('/')}>← Back</button>
        <button className="btn btn-primary" onClick={() => nav('/enroll')}>+ Enroll Driver</button>
      </div>
    </div>
  )
}
