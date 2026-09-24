import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { warsawDateKey, formatWarsawDate } from '../utils/time';
import PhotoUpload from '../components/PhotoUpload';
import PoweredBy from '../components/PoweredBy';

export default function StandalonePhotoUpload() {
  const navigate = useNavigate();
  const { state } = useAuth();
  const today = warsawDateKey(new Date());

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #0d1c2d, #051424)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <header style={{
        background: 'rgba(5, 20, 36, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <button onClick={() => navigate(-1)} style={{
          color: 'var(--color-primary)',
          fontSize: '15px',
          fontWeight: '600',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginRight: '15px'
        }}>← Back</button>
        <div style={{ fontSize: '17px', fontWeight: '700', color: 'var(--color-text)', letterSpacing: '0.01em' }}>Upload Photos</div>
      </header>

      <main style={{ flex: 1, paddingBottom: '40px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          margin: '16px',
          padding: '14px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--color-text)'
          }}>Today's Photos</div>
          <div style={{
            fontSize: '13px',
            color: 'var(--color-text-muted)'
          }}>{formatWarsawDate(today)}</div>
        </div>

        <div style={{
          margin: '0 16px 16px',
          fontSize: '12px',
          color: 'var(--color-text-muted)'
        }}>
          Photos will be saved for today. You can upload multiple photos.
        </div>

        <div style={{ margin: '0 16px' }}>
          <PhotoUpload
            entryId={0}
            employeeId={state.employeeId}
            employeeName={state.employeeName}
            dateKey={today}
            onUploadDone={() => {
              setTimeout(() => navigate('/'), 1500)
            }}
          />
        </div>

        <div style={{
          marginTop: '8px',
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--color-text-muted)'
        }}>
          Photos are linked to today's date
        </div>

        <button
          onClick={() => navigate('/')}
          style={{
            display: 'block',
            textAlign: 'center',
            marginTop: '16px',
            padding: '12px',
            color: 'var(--color-text-muted)',
            textDecoration: 'underline',
            fontSize: '14px',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            width: '100%'
          }}
        >
          Back to dashboard
        </button>
      </main>

      <div style={{ marginTop: 'auto' }}>
        <PoweredBy />
      </div>
    </div>
  );
}
