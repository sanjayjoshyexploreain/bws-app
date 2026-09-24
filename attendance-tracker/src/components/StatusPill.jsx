import React from 'react';

const config = {
  Pending:  { bg: 'var(--color-warning-bg)', 
              color: 'var(--color-warning)', 
              border: 'rgba(245,158,11,0.3)' },
  Approved: { bg: 'var(--color-success-bg)', 
              color: 'var(--color-success)', 
              border: 'rgba(16,185,129,0.3)' },
  Rejected: { bg: 'var(--color-danger-bg)',  
              color: 'var(--color-danger)',  
              border: 'rgba(239,68,68,0.3)' },
}

export default function StatusPill({ status }) {
  const style = config[status] || { bg: 'transparent', color: 'var(--color-text-muted)', border: 'var(--border-subtle)' };
  return (
    <span style={{ 
      backgroundColor: style.bg,
      color: style.color,
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 10px',
      borderRadius: '99px',
      fontSize: '12px',
      fontWeight: '600',
      border: `1px solid ${style.border}`,
      letterSpacing: '0.03em'
    }}>
      {status || 'Unknown'}
    </span>
  );
}
