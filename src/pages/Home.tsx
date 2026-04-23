import { useNavigate } from 'react-router-dom'
import { InstallAppCard } from '../components/InstallAppCard'

export function Home() {
  const nav = useNavigate()
  return (
    <div className="page">
      <div className="logo">🚗 DRIVEGUARD</div>
      <h1 className="step-title" style={{ fontSize: 30, marginBottom: 8 }}>Fleet Driver Verification</h1>
      <p className="step-sub">
        Biometric driver verification for SA logistics fleets.<br />
        Confirm identity before ignition. Powered by Hybrid Vector.
      </p>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => nav('/scan')}>
          <div className="badge badge-blue">Live Scan</div>
          <h2 style={{ fontSize: 18, marginBottom: 6 }}>Verify Driver</h2>
          <p style={{ fontSize: 13, color: 'var(--grey)', lineHeight: 1.6 }}>
            Instant biometric check before vehicle start.<br />
            Returns AUTHORIZED · UNAUTHORIZED · BLACKLISTED verdict.
          </p>
          <button className="btn btn-primary" style={{ marginTop: 20 }}>Start Scan →</button>
        </div>

        <div className="card" style={{ cursor: 'pointer' }} onClick={() => nav('/enroll')}>
          <div className="badge badge-green">Register</div>
          <h2 style={{ fontSize: 18, marginBottom: 6 }}>Enroll Driver</h2>
          <p style={{ fontSize: 13, color: 'var(--grey)', lineHeight: 1.6 }}>
            Register a driver into the authorized fleet collection.<br />
            Capture photo, assign vehicle and PDP / licence class.
          </p>
          <button className="btn btn-success" style={{ marginTop: 20 }}>Enroll Driver →</button>
        </div>

        <div className="card" style={{ cursor: 'pointer' }} onClick={() => nav('/drivers')}>
          <div className="badge badge-blue">Registry</div>
          <h2 style={{ fontSize: 18, marginBottom: 6 }}>Driver Registry</h2>
          <p style={{ fontSize: 13, color: 'var(--grey)', lineHeight: 1.6 }}>
            View all enrolled drivers with vehicle and licence info.<br />
            Remove drivers when employment is terminated.
          </p>
          <button className="btn btn-primary" style={{ marginTop: 20 }}>View Registry →</button>
        </div>

        <div className="card" style={{ cursor: 'pointer' }} onClick={() => nav('/blacklist')}>
          <div className="badge badge-red">Blacklist</div>
          <h2 style={{ fontSize: 18, marginBottom: 6 }}>Blacklist</h2>
          <p style={{ fontSize: 13, color: 'var(--grey)', lineHeight: 1.6 }}>
            Add and manage drivers banned from the entire fleet.<br />
            DUI, accidents, theft, impersonation.
          </p>
          <button className="btn btn-danger" style={{ marginTop: 20 }}>Manage Blacklist →</button>
        </div>

        <div className="card" style={{ cursor: 'pointer' }} onClick={() => nav('/events')}>
          <div className="badge badge-amber">Events</div>
          <h2 style={{ fontSize: 18, marginBottom: 6 }}>Event Log</h2>
          <p style={{ fontSize: 13, color: 'var(--grey)', lineHeight: 1.6 }}>
            Browse scan history and filter by verdict or vehicle.<br />
            Full audit trail for RTMS compliance.
          </p>
          <button className="btn btn-outline" style={{ marginTop: 20 }}>View Events →</button>
        </div>
      </div>

      <div style={{ marginTop: 40, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {['AWS Rekognition', 'RTMS Compliant', 'PDP Verified', 'ML-KEM FIPS 203'].map(t => (
          <span key={t} className="badge badge-blue">{t}</span>
        ))}
      </div>

      <InstallAppCard appName="DriveGuard" badgeClassName="badge badge-blue" />
    </div>
  )
}
