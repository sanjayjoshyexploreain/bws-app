import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatWarsawDate } from '../utils/time';
import StatusPill from '../components/StatusPill';
import PhotoDisplay from '../components/PhotoDisplay';
import PoweredBy from '../components/PoweredBy';

export default function EntryDetailScreen() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const entry = state?.entry;

  if (!entry) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text)', minHeight: '100vh', background: 'radial-gradient(ellipse at top, #0d1c2d, #051424)' }}>
        Entry not found. <button onClick={() => navigate('/')} style={{ color: 'var(--color-primary)', background: 'none', border: 'none', textDecoration: 'underline' }}>Go back</button>
      </div>
    );
  }

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
        <div style={{ fontSize: '17px', fontWeight: '700', color: 'var(--color-text)', letterSpacing: '0.01em' }}>Entry Details</div>
      </header>

      <main style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
        <div style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
            <div style={{ fontWeight: '800', fontSize: '20px', color: 'var(--color-text)' }}>{formatWarsawDate(entry.WorkDate)}</div>
            <StatusPill status={entry.Status} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--color-text-secondary)',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              marginBottom: '6px'
            }}>Hours Worked</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-text)' }}>{entry.HoursWorked} <span style={{fontSize: '14px', fontWeight: 'normal', color: 'var(--color-text-muted)'}}>hrs</span></div>
          </div>

          {entry.Comments && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--color-text-secondary)',
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                marginBottom: '6px'
              }}>Comments</div>
              <div style={{ fontSize: '16px', color: 'var(--color-text)', lineHeight: 1.5 }}>{entry.Comments}</div>
            </div>
          )}

          {entry.AdminNotes && (
            <div style={{
              marginTop: '10px',
              background: 'var(--color-warning-bg)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px'
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--color-warning)',
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                marginBottom: '6px'
              }}>Manager feedback</div>
              <div style={{ fontSize: '15px', color: 'var(--color-text)', lineHeight: 1.4 }}>{entry.AdminNotes}</div>
            </div>
          )}
        </div>

        <PhotoDisplay entryId={entry.ID} />
      </main>

      <div style={{ marginTop: 'auto' }}>
        <PoweredBy />
      </div>
    </div>
  );
}
