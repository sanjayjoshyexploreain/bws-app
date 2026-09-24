import React, { useState, useEffect, useRef } from 'react';
import { Api } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function PhotoUpload({ entryId, employeeId, dateKey, onUploadDone }) {
  const { state } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    return () => {
      photos.forEach(p => URL.revokeObjectURL(p.previewUrl));
    };
  }, [photos]);

  const handleFilesSelected = (files) => {
    if (!files || files.length === 0) return;
    
    const newPhotos = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      
      if (file.size > 5 * 1024 * 1024) {
        alert("Photo exceeds 5MB limit: " + file.name);
        continue;
      }
      
      newPhotos.push({
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'pending',
        error: null
      });
    }
    
    if (newPhotos.length > 0) {
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (id) => {
    setPhotos(prev => {
      const p = prev.find(x => x.id === id);
      if (p) URL.revokeObjectURL(p.previewUrl);
      return prev.filter(x => x.id !== id);
    });
  };

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleUpload = async (specificPhotoId = null) => {
    setIsUploading(true);
    
    const photosToUpload = photos.filter(p => 
      (specificPhotoId ? p.id === specificPhotoId : p.status === 'pending' || p.status === 'error')
    );
    
    let allDone = true;

    for (const photo of photosToUpload) {
      setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, status: 'uploading', error: null } : p));
      
      try {
        const base64string = await toBase64(photo.file);
        await Api.uploadPhoto({
          entryId: Number(entryId),
          employeeId: state.employeeId,
          employeeName: state.employeeName || '',
          dateKey: dateKey,
          fileName: photo.file.name,
          fileBase64: base64string,
          companyName: state.companyName || '',
          clientCompany: state.clientCompany || '',
          profession: state.profession || ''
        });
        
        setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, status: 'done' } : p));
      } catch (err) {
        setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, status: 'error', error: 'Failed' } : p));
        allDone = false;
      }
    }

    setIsUploading(false);
    
    setPhotos(prev => {
      const remainingPending = prev.some(p => p.status !== 'done');
      if (!remainingPending && prev.length > 0) {
        setTimeout(() => onUploadDone(), 0);
      }
      return prev;
    });
  };

  const pendingCount = photos.filter(p => p.status === 'pending' || p.status === 'error').length;

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          multiple
          style={{ display: 'none' }} 
          ref={cameraInputRef} 
          onChange={(e) => handleFilesSelected(e.target.files)} 
        />
        <button 
          type="button" 
          onClick={() => cameraInputRef.current.click()} 
          style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-primary)', backgroundColor: 'rgba(37, 99, 235, 0.1)', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: 'var(--color-primary)' }}
        >
          + Add Photo from Camera
        </button>
      </div>

      {photos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '12px' }}>
          {photos.map(photo => (
            <div key={photo.id} style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
              <img 
                src={photo.previewUrl} 
                alt="Preview" 
                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} 
              />
              
              {photo.status === 'pending' && (
                <button 
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px', padding: 0 }}
                >
                  ×
                </button>
              )}
              
              <div style={{ position: 'absolute', bottom: '4px', right: '4px', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '99px', padding: '2px 6px', fontSize: '11px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {photo.status === 'pending' && '⏳'}
                {photo.status === 'uploading' && '⏱'}
                {photo.status === 'done' && <span style={{ color: 'var(--color-success)' }}>✓</span>}
                {photo.status === 'error' && <span style={{ color: 'var(--color-danger)' }}>✗</span>}
              </div>
              
              {photo.status === 'error' && (
                <div style={{ textAlign: 'center', marginTop: '4px', position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ color: 'var(--color-danger)', fontSize: '10px' }}>{photo.error}</div>
                  <button type="button" onClick={() => handleUpload(photo.id)} style={{ fontSize: '10px', padding: '4px 8px', marginTop: '4px', cursor: 'pointer', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px' }}>Retry</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {pendingCount > 0 && (
        <button
          type="button"
          onClick={() => handleUpload()}
          disabled={isUploading}
          style={{ width: '100%', padding: '15px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '16px', fontWeight: '700', cursor: isUploading ? 'not-allowed' : 'pointer', boxShadow: 'var(--shadow-button)', transition: 'opacity 0.2s, transform 0.1s', marginTop: '12px', opacity: isUploading ? 0.6 : 1 }}
        >
          {isUploading ? 'Uploading...' : `Upload ${pendingCount} Photo(s)`}
        </button>
      )}
    </div>
  );
}
