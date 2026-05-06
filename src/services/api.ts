const API     = import.meta.env.VITE_API_URL || 'https://hybrid-vector-api-m5xt.onrender.com'
const TENANT  = import.meta.env.VITE_TENANT_ID
const API_KEY = import.meta.env.VITE_HV_API_KEY

const headers = () => {
  if (!API_KEY) throw new Error('Missing VITE_HV_API_KEY')
  if (!TENANT)  throw new Error('Missing VITE_TENANT_ID')
  return {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  }
}

export type Verdict = 'AUTHORIZED' | 'UNAUTHORIZED' | 'BLACKLISTED'

export interface ScanResult {
  scanId:         string
  verdict:        Verdict
  access:         boolean
  authorizedSim:  number | null
  blacklistSim:   number | null
  faceConfidence: number
  timestamp:      string
  driverId:       string | null
  vehicleId:      string | null
}

export async function scanDriver(payload: {
  selfie_b64: string
  driver_id?:  string
  vehicle_id?: string
}): Promise<{ success: boolean; result: ScanResult }> {
  const res = await fetch(`${API}/driveguard/scan`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ ...payload, tenant_id: TENANT }),
  })
  if (!res.ok) throw new Error(`Scan failed: ${res.status}`)
  return res.json()
}

export async function enrollDriver(payload: {
  selfie_b64:  string
  external_id: string
  name:        string
  role?:       string
  vehicle_id?: string
  licences?:   string[]
}): Promise<{ success: boolean; faceId: string; enrolledAt: string }> {
  const res = await fetch(`${API}/driveguard/enroll`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ ...payload, tenant_id: TENANT }),
  })
  if (!res.ok) throw new Error(`Enroll failed: ${res.status}`)
  return res.json()
}

export async function unenrollDriver(faceId: string): Promise<{ success: boolean; faceId: string }> {
  const res = await fetch(`${API}/driveguard/enroll/${faceId}`, {
    method: 'DELETE',
    headers: headers(),
  })
  if (!res.ok) throw new Error(`Unenroll failed: ${res.status}`)
  return res.json()
}

export async function blacklistDriver(payload: {
  selfie_b64:  string
  external_id: string
  reason:      string
  operator:    string
}): Promise<{ success: boolean; faceId: string; bannedAt: string }> {
  const res = await fetch(`${API}/driveguard/blacklist`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ ...payload, tenant_id: TENANT }),
  })
  if (!res.ok) throw new Error(`Blacklist failed: ${res.status}`)
  return res.json()
}

export async function removeBlacklist(faceId: string): Promise<{ success: boolean; faceId: string }> {
  const res = await fetch(`${API}/driveguard/blacklist/${faceId}`, {
    method: 'DELETE',
    headers: headers(),
  })
  if (!res.ok) throw new Error(`Remove failed: ${res.status}`)
  return res.json()
}

export async function getDrivers(vehicleId?: string, limit = 100): Promise<{ success: boolean; drivers: any[] }> {
  const url = new URL(`${API}/driveguard/drivers`)
  if (vehicleId) url.searchParams.set('vehicle_id', vehicleId)
  url.searchParams.set('limit', limit.toString())
  const res = await fetch(url.toString(), { headers: headers() })
  if (!res.ok) throw new Error(`Drivers failed: ${res.status}`)
  return res.json()
}

export async function getBlacklist(limit = 100): Promise<{ success: boolean; blacklist: any[] }> {
  const url = new URL(`${API}/driveguard/blacklist`)
  url.searchParams.set('limit', limit.toString())
  const res = await fetch(url.toString(), { headers: headers() })
  if (!res.ok) throw new Error(`Blacklist failed: ${res.status}`)
  return res.json()
}

export async function getEvents(verdict?: string, vehicleId?: string, limit = 50): Promise<{ success: boolean; events: any[] }> {
  const url = new URL(`${API}/driveguard/events`)
  if (verdict)   url.searchParams.set('verdict',    verdict)
  if (vehicleId) url.searchParams.set('vehicle_id', vehicleId)
  url.searchParams.set('limit', limit.toString())
  const res = await fetch(url.toString(), { headers: headers() })
  if (!res.ok) throw new Error(`Events failed: ${res.status}`)
  return res.json()
}
