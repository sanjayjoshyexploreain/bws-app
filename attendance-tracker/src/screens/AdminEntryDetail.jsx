import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Api } from '../api/api';
import { formatWarsawDate } from '../utils/time';
import PhotoDisplay from '../components/PhotoDisplay';
import PoweredBy from '../components/PoweredBy';

export default function AdminEntryDetail() {
  const { state: locationState } = useLocation();
  const { state: authState } = useAuth();
  const navigate = useNavigate();
  const entry = locationState?.entry;

  const [adminNotes, setAdminNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(null);

  if (!entry) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text)', minHeight: '100vh', background: 'radial-gradient(ellipse at top, #0d1c2d, #051424)' }}>
        Entry not found. <button onClick={() => navigate('/admin')} style={{ color: 'var(--color-primary)', background: 'none', border: 'none', textDecoration: 'underline' }}>Go back</button>
      </div>
    );
  }

  const handleReview = async (status) => {
    setIsLoading(true);
    setError('');
    try {
      await Api.reviewEntry(entry.ID, status, adminNotes, authState.employeeId);
      navigate('/');
    } catch (err) {
      setError(`Failed to ${status.toLowerCase()} entry.`);
      setIsLoading(false);
      setShowConfirm(null);
    }
  };

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
        <div style={{ fontSize: '17px', fontWeight: '700', color: 'var(--color-text)', letterSpacing: '0.01em' }}>Review Entry</div>
      </header>

      <main style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
        <div style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--color-text-secondary)',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              marginBottom: '6px'
            }}>Employee</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text)' }}>{entry.EmployeeID || entry.EmployeeName}</div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--color-text-secondary)',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              marginBottom: '6px'
            }}>Work Date</div>
            <div style={{ fontSize: '18px', color: 'var(--color-text)' }}>{formatWarsawDate(entry.WorkDate)}</div>
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
            <div style={{ fontSize: '18px', color: 'var(--color-text)' }}>{entry.HoursWorked} <span style={{fontSize: '14px', color: 'var(--color-text-muted)'}}>hrs</span></div>
          </div>
          {entry.Comments && (
            <div style={{ marginBottom: '10px' }}>
              <div style={{
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--color-text-secondary)',
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                marginBottom: '6px'
              }}>Comments from worker</div>
              <div style={{ fontSize: '16px', color: 'var(--color-text)', lineHeight: 1.5 }}>{entry.Comments}</div>
            </div>
          )}
        </div>

        <PhotoDisplay entryId={entry.ID} />

        <div style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-card)',
          marginBottom: '20px'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--color-text-secondary)',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              marginBottom: '6px',
              display: 'block'
            }}>Admin Notes (optional)</label>
            <textarea
              value={adminNotes}
              onChange={e => setAdminNotes(e.target.value)}
              disabled={isLoading || showConfirm}
              rows="3"
              style={{
                width: '100%',
                padding: '13px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text)',
                fontSize: '15px',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {error && <div style={{
            color: 'var(--color-danger)',
            fontSize: '13px',
            textAlign: 'center',
            marginBottom: '16px',
            padding: '10px',
            background: 'var(--color-danger-bg)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(239,68,68,0.2)'
          }}>{error}</div>}

          {showConfirm ? (
            <div style={{
              padding: '20px',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center'
            }}>
              <div style={{ marginBottom: '20px', fontWeight: '600', color: 'var(--color-text)', lineHeight: 1.4 }}>
                {showConfirm} <span style={{color: 'var(--color-primary)'}}>{entry.HoursWorked} hours</span> for {formatWarsawDate(entry.WorkDate)}?<br/>This cannot be undone.
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => setShowConfirm(null)}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text)',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReview(showConfirm === 'Approve' ? 'Approved' : 'Rejected')}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: showConfirm === 'Approve' ? 'var(--color-success)' : 'var(--color-danger)',
                    color: '#fff',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: showConfirm === 'Approve' ? '0 4px 15px rgba(16,185,129,0.3)' : '0 4px 15px rgba(239,68,68,0.3)'
                  }}
                >
                  {isLoading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowConfirm('Reject')}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '15px',
                  backgroundColor: 'var(--color-danger)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: '700',
                  fontSize: '16px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(239,68,68,0.3)'
                }}
              >
                Reject
              </button>
              <button
                onClick={() => setShowConfirm('Approve')}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '15px',
                  backgroundColor: 'var(--color-success)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: '700',
                  fontSize: '16px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(16,185,129,0.3)'
                }}
              >
                Approve
              </button>
            </div>
          )}
        </div>
      </main>

      <div style={{ marginTop: 'auto' }}>
        <PoweredBy />
      </div>
    </div>
  );
}
