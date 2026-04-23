import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SelfieCapture } from '../components/SelfieCapture'
import { enrollDriver } from '../services/api'

export function Enroll() {
  const nav = useNavigate()
  const [capturedB64, setCapturedB64] = useState<string | null>(null)
  const [externalId,  setExternalId]  = useState('')
  const [name,        setName]        = useState('')
  const [role,        setRole]        = useState('')
  const [vehicleId,   setVehicleId]   = useState('')
  const [licences,    setLicences]    = useState('')
  const [loading,     setLoading]     = useState(false)
  const [success,     setSuccess]     = useState<{ faceId: string; enrolledAt: string } | null>(null)
  const [error,       setError]       = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!capturedB64) { setError('Please capture a photo first.'); return }
    if (!externalId.trim() || !name.trim()) { setError('Driver ID and Name are required.'); return }
    setLoading(true); setError(null)
    try {
      const lic = licences.split(',').map(s => s.trim()).filter(Boolean)
      const res = await enrollDriver({
        selfie_b64:  capturedB64,
        external_id: externalId.trim(),
        name:        name.trim(),
        role:        role.trim() || undefined,
        vehicle_id:  vehicleId.trim() || undefined,
        licences:    lic.length ? lic : undefined,
      })
      setSuccess({ faceId: res.faceId, enrolledAt: res.enrolledAt })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enroll failed')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setSuccess(null); setCapturedB64(null); setExternalId(''); setName('')
    setRole(''); setVehicleId(''); setLicences('')
  }

  if (success) return (
    <div className="page">
      <div className="logo">🚗 DRIVEGUARD</div>
      <div className="verdict-block AUTHORIZED">
        <div className="verdict-icon">✅</div>
        <div className="verdict-label AUTHORIZED">ENROLLED</div>
        <p style={{ marginTop: 10, fontSize: 14, color: 'var(--grey)' }}>
          Driver <strong style={{ color: 'var(--white)' }}>{name}</strong> added to the fleet.
        </p>
      </div>
      <div className="card" style={{ width: '100%', marginBottom: 20 }}>
        <div className="metric-row">
          <span className="metric-label">Face ID</span>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--grey)' }}>{success.faceId.slice(0, 24)}…</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Enrolled At</span>
          <span style={{ fontSize: 13 }}>{new Date(success.enrolledAt).toLocaleString()}</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, width: '100%' }}>
        <button className="btn btn-outline" onClick={reset}>Enroll Another</button>
        <button className="btn btn-primary" onClick={() => nav('/drivers')}>View Registry</button>
      </div>
    </div>
  )

  return (
    <div className="page">
      <div className="logo">🚗 DRIVEGUARD</div>
      <h1 className="step-title">Enroll Driver</h1>
      <p className="step-sub">Capture the driver's face, then fill in their details.</p>

      <div style={{ width: '100%', marginBottom: 24 }}>
        <SelfieCapture onCapture={b64 => { setCapturedB64(b64); setError(null) }} loading={loading} actionLabel="Capture Photo" />
      </div>

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div className="field">
          <label>Driver ID *</label>
          <input value={externalId} onChange={e => setExternalId(e.target.value)} placeholder="DRV-001" disabled={loading} />
        </div>
        <div className="field">
          <label>Full Name *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" disabled={loading} />
        </div>
        <div className="field">
          <label>Role</label>
          <select value={role} onChange={e => setRole(e.target.value)} disabled={loading}>
            <option value="">— Select role —</option>
            <option value="Driver">Driver</option>
            <option value="Senior Driver">Senior Driver</option>
            <option value="Chauffeur">Chauffeur</option>
            <option value="Owner Operator">Owner Operator</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Contractor">Contractor</option>
          </select>
        </div>
        <div className="field">
          <label>Assigned Vehicle / Plate</label>
          <input value={vehicleId} onChange={e => setVehicleId(e.target.value)} placeholder="GP 123 456" disabled={loading} />
        </div>
        <div className="field">
          <label>Licences (comma-separated)</label>
          <input value={licences} onChange={e => setLicences(e.target.value)} placeholder="Code 10, Code 14, PDP, DGP" disabled={loading} />
        </div>
        {error && <div style={{ color: 'var(--red)', marginBottom: 16, fontSize: 14, textAlign: 'center' }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn btn-outline" onClick={() => nav('/')} disabled={loading}>← Back</button>
          <button type="submit" className="btn btn-success" disabled={loading || !capturedB64}>
            {loading ? 'Enrolling…' : '✅ Enroll Driver'}
          </button>
        </div>
      </form>
    </div>
  )
}
