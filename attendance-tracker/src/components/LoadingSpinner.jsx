import React from 'react';

export default function LoadingSpinner() {
  return (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100%', 
      minHeight: '200px' 
    }}>
      <div style={{
        position: 'relative',
        width: '40px',
        height: '40px'
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          borderRadius: '50%',
          border: '4px solid var(--color-primary-glow)',
          borderTopColor: 'var(--color-primary)',
          animation: 'spin 1s linear infinite'
        }} />
        <div style={{
          position: 'absolute',
          top: '-10px', left: '-10px', right: '-10px', bottom: '-10px',
          borderRadius: '50%',
          background: 'var(--color-primary-glow)',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          zIndex: -1
        }} />
      </div>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .5; transform: scale(1.2); } }
      `}</style>
    </div>
  );
}
