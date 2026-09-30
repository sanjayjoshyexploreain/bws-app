import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Api } from '../api/api';

const COLORS = {
  bg: '#030b14',
  surface: 'rgba(10, 25, 47, 0.65)',
  border: 'rgba(255,255,255,0.08)',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  primary: '#0ea5e9',
  primaryDark: '#0369a1',
  primaryDim: 'rgba(14,165,233,0.15)',
  success: '#10b981',
  danger: '#ef4444',
  dangerBg: 'rgba(239,68,68,0.15)',
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
        <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
          <Text style={styles.actionButtonText}>+ Add Photo from Camera</Text>
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
        <Pressable
          style={({ pressed }) => [
            styles.uploadButton,
            isUploading && styles.disabled,
            pressed && !isUploading && styles.uploadButtonPressed
          ]}
          onPress={() => handleUpload()}
          disabled={isUploading}
        >
          <Text style={styles.uploadButtonText}>
            {isUploading ? 'Uploading...' : `Upload ${pendingCount} Photo(s)`}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20 },
  buttonRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  actionButton: { 
    flex: 1, 
    padding: 14, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: COLORS.primaryDark, 
    backgroundColor: COLORS.primaryDim, 
    alignItems: 'center',
    borderStyle: 'dashed'
  },
  actionButtonText: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: '3%', marginTop: 12 },
  photoContainer: { width: '31.33%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, position: 'relative' },
  image: { width: '100%', height: '100%' },
  removeButton: { position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(3,11,20,0.8)', alignItems: 'center', justifyContent: 'center', zIndex: 10, borderWidth: 1, borderColor: COLORS.border },
  removeText: { color: 'white', fontSize: 16, lineHeight: 18, fontWeight: 'bold' },
  statusBadge: { position: 'absolute', bottom: 4, right: 4, backgroundColor: 'rgba(3,11,20,0.8)', borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  statusIcon: { fontSize: 11, color: 'white' },
  errorOverlay: { backgroundColor: 'rgba(3,11,20,0.85)', alignItems: 'center', justifyContent: 'center' },
  errorText: { color: COLORS.danger, fontSize: 11, fontWeight: '700' },
  retryButton: { marginTop: 6, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: COLORS.danger, borderRadius: 8 },
  retryText: { color: 'white', fontSize: 11, fontWeight: '700' },
  uploadButton: { 
    marginTop: 16, 
    padding: 16, 
    backgroundColor: COLORS.primary, 
    borderRadius: 14, 
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.4)',
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primaryDark,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.2)',
    borderRightWidth: 1,
    borderRightColor: COLORS.primaryDark,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 6,
  },
  uploadButtonPressed: {
    backgroundColor: '#0284c7',
    transform: [{ scale: 0.98 }, { translateY: 2 }],
    shadowOpacity: 0.2,
    elevation: 2,
    borderBottomWidth: 1,
  },
  uploadButtonText: { color: 'white', fontSize: 16, fontWeight: '800' },
  disabled: { 
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    shadowOpacity: 0,
    elevation: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  }
});
