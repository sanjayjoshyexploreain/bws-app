import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Api } from '../api/api';
import LoadingSpinner from './LoadingSpinner';

const COLORS = {
  textMuted: '#64748b',
  danger: '#ef4444',
  border: 'rgba(255,255,255,0.10)',
  bgSurface: 'rgba(255,255,255,0.07)',
};

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
      <View style={styles.centerBox}>
        <LoadingSpinner />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (photos.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>No photos uploaded</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PROOF PHOTOS ({photos.length})</Text>
      <View style={styles.grid}>
        {photos.map(photo => (
          <TouchableOpacity 
            key={photo.fileId || Math.random().toString()}
            style={styles.photoContainer}
            onPress={() => setFullscreenPhoto(photo)}
          >
            <Image 
              source={{ uri: `data:image/*;base64,${photo.fileBase64}` }} 
              style={styles.image} 
            />
          </TouchableOpacity>
        ))}
      </View>

      <Modal
        visible={!!fullscreenPhoto}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullscreenPhoto(null)}
      >
        <View style={styles.fullscreenContainer}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setFullscreenPhoto(null)}
          >
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
          {fullscreenPhoto && (
            <Image 
              source={{ uri: `data:image/*;base64,${fullscreenPhoto.fileBase64}` }} 
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 10 },
  centerBox: { padding: 20, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: COLORS.danger, textAlign: 'center' },
  emptyBox: { 
    alignItems: 'center', 
    padding: 32, 
    backgroundColor: COLORS.bgSurface, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderStyle: 'dashed', 
    borderColor: COLORS.border 
  },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
  title: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 1, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoContainer: { width: '31%', aspectRatio: 1, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  fullscreenContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center' },
  closeButton: { position: 'absolute', top: 40, right: 20, zIndex: 10, padding: 10 },
  closeText: { color: '#fff', fontSize: 40, lineHeight: 40 },
  fullscreenImage: { width: '100%', height: '90%' },
});
