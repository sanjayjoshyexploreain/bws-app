import React, { useState, useEffect } from 'react';
import { Api } from '../api/api';
import LoadingSpinner from './LoadingSpinner';

export default function PhotoDisplay({ entryId }) {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [fullscreenPhoto, setFullscreenPhoto] = useState(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await Api.getPhotos(Number(entryId));
        setPhotos(res.photos || []);
      } catch (err) {
        setError('Could not load photos');
      } finally {
        setIsLoading(false);
      }
    };
    if (entryId) {
      fetchPhotos();
    } else {
      setIsLoading(false);
    }
  }, [entryId]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: 'var(--color-danger)', textAlign: 'center', padding: '20px' }}>
        {error}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--color-text-muted)', fontSize: '14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-subtle)' }}>
        No photos uploaded
      </div>
    );
  }

  return (
    <div>
      <div style={{
        fontSize: '13px',
        fontWeight: '700',
        color: 'var(--color-text-muted)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        marginBottom: '12px',
      }}>Proof Photos ({photos.length})</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {photos.map(photo => (
          <img 
            key={photo.fileId || Math.random().toString()}
            src={`data:image/*;base64,${photo.fileBase64}`}
            alt={photo.fileName}
            onClick={() => setFullscreenPhoto(photo)}
            style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: '1px solid var(--border-subtle)' }}
          />
        ))}
      </div>

      {fullscreenPhoto && (
        <div 
          onClick={() => setFullscreenPhoto(null)}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}
        >
          <button 
            onClick={() => setFullscreenPhoto(null)}
            style={{ position: 'absolute', top: '20px', right: '20px', color: '#fff', fontSize: '28px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ×
          </button>
          <img 
            src={`data:image/*;base64,${fullscreenPhoto.fileBase64}`}
            alt={fullscreenPhoto.fileName}
            style={{ maxWidth: '100%', maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
