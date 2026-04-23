import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SelfieCapture } from '../components/SelfieCapture'
import { getBlacklist, blacklistDriver, removeBlacklist } from '../services/api'

interface BlacklistEntry {
  face_id:     string
  external_id: string
  reason:      string
  operator:    string
  banned_at:   string
}

type View = 'list' | 'add'

export function Blacklist() {
  const nav = useNavigate()
  const [view,     setView]     = useState<View>('list')
  const [entries,  setEntries]  = useState<BlacklistEntry[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)

  const [capturedB64, setCapturedB64] = useState<string | null>(null)
  const [extId,       setExtId]       = useState('')
  const [reason,      setReason]      = useState('')
  const [operator,    setOperator]    = useState('')
  const [adding,      setAdding]      = useState(false)
  const [addError,    setAddError]    = useState<string | null>(null)

  async function load() {
    setLoading(true); setError(null)
    try {
      const { blacklist } = await getBlacklist()
      setEntries(blacklist)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!capturedB64) { setAddError('Capture a photo first.'); return }
    if (!extId.trim() || !reason.trim() || !operator.trim()) { setAddError('All fields required.'); return }
    setAdding(true); setAddError(null)
    try {
      await blacklistDriver({ selfie_b64: capturedB64, external_id: extId.trim(), reason: reason.trim(), operator: operator.trim() })
      await load()
      setView('list')
      setCapturedB64(null); setExtId(''); setReason(''); setOperator('')
    } catch (e) {
      setAddError(e instanceof Error ? e.message : 'Failed to blacklist')
    } finally {
      setAdding(false)
    }
  }

  async function handleRemove(faceId: string) {
    if (!confirm('Remove from blacklist?')) return
    setRemoving(faceId)
    try {
      await removeBlacklist(faceId)
      setEntries(prev => prev.filter(b => b.face_id !== faceId))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Remove failed')
    } finally {
      setRemoving(null)
    }
  }

  if (view === 'add') return (
    <div className="page">
      <div className="logo">🚗 DRIVEGUARD</div>
      <h1 className="step-title">Add to Blacklist</h1>
      <p className="step-sub">Capture the driver's face and fill in the ban details.</p>
      <div style={{ width: '100%', marginBottom: 24 }}>
        <SelfieCapture onCapture={b64 => { setCapturedB64(b64); setAddError(null) }} loading={adding} actionLabel="Capture Photo" />
      </div>
      <form onSubmit={handleAdd} style={{ width: '100%' }}>
        <div className="field">
          <label>Driver ID *</label>
          <input value={extId} onChange={e => setExtId(e.target.value)} placeholder="DRV-001" disabled={adding} />
        </div>
        <div className="field">
          <label>Reason *</label>
          <select value={reason} onChange={e => setReason(e.target.value)} disabled={adding}>
            <option value="">— Select reason —</option>
            <option value="DUI">DUI</option>
            <option value="Accident — at fault">Accident — at fault</option>
            <option value="Theft">Theft</option>
            <option value="Impersonation">Impersonation</option>
            <option value="Licence expired">Licence expired</option>
            <option value="Terminated — misconduct">Terminated — misconduct</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="field">
          <label>Operator *</label>
          <input value={operator} onChange={e => setOperator(e.target.value)} placeholder="Fleet Manager name" disabled={adding} />
        </div>
        {addError && <div style={{ color: 'var(--red)', marginBottom: 16, fontSize: 14, textAlign: 'center' }}>{addError}</div>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn btn-outline" onClick={() => setView('list')} disabled={adding}>← Cancel</button>
          <button type="submit" className="btn btn-danger" disabled={adding || !capturedB64}>
            {adding ? 'Processing…' : '🚫 Add to Blacklist'}
          </button>
        </div>
      </form>
    </div>
  )

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <div className="logo">🚗 DRIVEGUARD</div>
      <h1 className="step-title">Blacklist</h1>
      <p className="step-sub">Drivers banned from all fleet vehicles.</p>
      {loading && <p style={{ color: 'var(--grey)', marginBottom: 24 }}>Loading…</p>}
      {error   && <p style={{ color: 'var(--red)',  marginBottom: 24 }}>{error}</p>}
      {!loading && !error && (
        <div className="card" style={{ width: '100%', marginBottom: 20, overflow: 'auto' }}>
          {entries.length === 0 ? (
            <p style={{ color: 'var(--grey)', textAlign: 'center', padding: '20px 0' }}>No blacklisted drivers.</p>
          ) : (
            <table>
              <thead>
                <tr><th>ID</th><th>Reason</th><th>Operator</th><th>Date</th><th></th></tr>
              </thead>
              <tbody>
                {entries.map(b => (
                  <tr key={b.face_id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{b.external_id}</td>
                    <td style={{ color: 'var(--red)', fontSize: 13 }}>{b.reason}</td>
                    <td style={{ color: 'var(--grey)', fontSize: 13 }}>{b.operator}</td>
                    <td style={{ fontSize: 12 }}>{new Date(b.banned_at).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 12, width: 'auto' }}
                        disabled={removing === b.face_id} onClick={() => handleRemove(b.face_id)}>
                        {removing === b.face_id ? '…' : 'Remove'}
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
        <button className="btn btn-danger" onClick={() => setView('add')}>+ Add to Blacklist</button>
      </div>
    </div>
  )
}
