import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Api } from '../api/api';

const COLORS = {
  primary: '#2563eb',
  success: '#10b981',
  danger: '#ef4444',
  bgSurface: 'rgba(255,255,255,0.07)',
  border: 'rgba(255,255,255,0.12)',
  textSecondary: '#94a3b8',
};

export default function PhotoUpload({ entryId, employeeId, dateKey, onUploadDone }) {
  const [photos, setPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const addImage = (result) => {
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newPhotos = result.assets.map(asset => ({
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        uri: asset.uri,
        base64: asset.base64,
        fileName: asset.fileName || `photo_${Date.now()}.jpg`,
        status: 'pending',
        error: null
      }));
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission required", "Camera permission is required to take photos.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      base64: true,
      quality: 0.7,
    });
    addImage(result);
  };

  const removePhoto = (id) => {
    setPhotos(prev => prev.filter(x => x.id !== id));
  };

  const handleUpload = async (specificPhotoId = null) => {
    setIsUploading(true);
    
    const photosToUpload = photos.filter(p => 
      (specificPhotoId ? p.id === specificPhotoId : p.status === 'pending' || p.status === 'error')
    );
    
    let allDone = true;

    for (const photo of photosToUpload) {
      setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, status: 'uploading', error: null } : p));
      
      try {
        await Api.uploadPhoto({
          entryId: Number(entryId),
          employeeId,
          dateKey,
          fileName: photo.fileName.replace(/[#%*:<>?\/|"]/g, '_'),
          fileBase64: photo.base64
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
        setTimeout(() => onUploadDone(), 500);
      }
      return prev;
    });
  };

  const pendingCount = photos.filter(p => p.status === 'pending' || p.status === 'error').length;

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.actionButton, { borderColor: COLORS.primary, backgroundColor: 'rgba(37, 99, 235, 0.1)', paddingVertical: 12 }]} onPress={takePhoto}>
          <Text style={[styles.actionButtonText, { color: COLORS.primary, fontWeight: '600', fontSize: 14 }]}>+ Add Photo from Camera</Text>
        </TouchableOpacity>
      </View>

      {photos.length > 0 && (
        <View style={styles.grid}>
          {photos.map(photo => (
            <View key={photo.id} style={styles.photoContainer}>
              <Image source={{ uri: photo.uri }} style={styles.image} />
              
              {photo.status === 'pending' && (
                <TouchableOpacity style={styles.removeButton} onPress={() => removePhoto(photo.id)}>
                  <Text style={styles.removeText}>×</Text>
                </TouchableOpacity>
              )}
              
              <View style={styles.statusBadge}>
                {photo.status === 'pending' && <Text style={styles.statusIcon}>⏳</Text>}
                {photo.status === 'uploading' && <ActivityIndicator size="small" color="#fff" />}
                {photo.status === 'done' && <Text style={[styles.statusIcon, { color: COLORS.success }]}>✓</Text>}
                {photo.status === 'error' && <Text style={[styles.statusIcon, { color: COLORS.danger }]}>✗</Text>}
              </View>
              
              {photo.status === 'error' && (
                <View style={[StyleSheet.absoluteFill, styles.errorOverlay]}>
                  <Text style={styles.errorText}>{photo.error}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={() => handleUpload(photo.id)}>
                    <Text style={styles.retryText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {pendingCount > 0 && (
        <TouchableOpacity
          style={[styles.uploadButton, isUploading && styles.disabled]}
          onPress={() => handleUpload()}
          disabled={isUploading}
        >
          <Text style={styles.uploadButtonText}>
            {isUploading ? 'Uploading...' : `Upload ${pendingCount} Photo(s)`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20 },
  buttonRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  actionButton: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bgSurface, alignItems: 'center' },
  actionButtonText: { fontSize: 13, color: COLORS.textSecondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  photoContainer: { width: '31%', aspectRatio: 1, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, position: 'relative' },
  image: { width: '100%', height: '100%' },
  removeButton: { position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  removeText: { color: 'white', fontSize: 16, lineHeight: 18, fontWeight: 'bold' },
  statusBadge: { position: 'absolute', bottom: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2, alignItems: 'center', justifyContent: 'center' },
  statusIcon: { fontSize: 11, color: 'white' },
  errorOverlay: { backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  errorText: { color: COLORS.danger, fontSize: 10 },
  retryButton: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: COLORS.primary, borderRadius: 4 },
  retryText: { color: 'white', fontSize: 10 },
  uploadButton: { marginTop: 12, padding: 15, backgroundColor: COLORS.primary, borderRadius: 8, alignItems: 'center' },
  uploadButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.6 }
});
