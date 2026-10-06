import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, Platform, StatusBar, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import PoweredBy from '../components/PoweredBy';

const COLORS = {
  bg: '#030b14',
  surface: 'rgba(10, 25, 47, 0.65)',
  border: 'rgba(255,255,255,0.08)',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  dangerBg: 'rgba(239,68,68,0.1)',
  dangerBorder: 'rgba(239,68,68,0.3)',
  danger: '#ef4444',
  primary: '#0ea5e9',
};

// PulsingDot component for the background grid
const PulsingDot = ({ left, top, color, delay }) => {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 1500, delay: delay, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, [anim, delay]);

  return (
    <Animated.View style={{
      position: 'absolute', left, top, width: 5, height: 5,
      backgroundColor: color, borderRadius: 2.5,
      opacity: anim,
      transform: [{ translateX: -2.5 }, { translateY: -2.5 }, { scale: anim }],
      shadowColor: color, shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1, shadowRadius: 12, elevation: 6,
    }} />
  );
};

// Extremely lightweight grid background
const TechnicalGrid = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    {[...Array(8)].map((_, i) => (
      <View key={`v-${i}`} style={{
        position: 'absolute', left: `${(i + 1) * 12.5}%`, top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(59,130,246,0.03)'
      }} />
    ))}
    {[...Array(12)].map((_, i) => (
      <View key={`h-${i}`} style={{
        position: 'absolute', top: `${(i + 1) * 8.33}%`, left: 0, right: 0, height: 1, backgroundColor: 'rgba(59,130,246,0.03)'
      }} />
    ))}
    
    <PulsingDot left="25%" top="16.66%" color="rgba(255,255,255,1)" delay={0} />
    <PulsingDot left="62.5%" top="25%" color="#60a5fa" delay={800} />
    <PulsingDot left="37.5%" top="50%" color="rgba(255,255,255,1)" delay={400} />
    <PulsingDot left="75%" top="66.64%" color="#60a5fa" delay={1200} />
    <PulsingDot left="12.5%" top="75%" color="#60a5fa" delay={600} />
  </View>
);

export default function SettingsScreen({ navigation }) {
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();

  const handleAccountDeletion = () => {
    Alert.alert(
      "Account Deletion",
      "Are you sure you want to request account deletion?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes, Request Deletion", 
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Request Sent", 
              "Your account deletion request has been sent to HR. They will process it by checking the status.",
              [{ text: "OK", onPress: () => logout() }]
            );
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <TechnicalGrid />
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : insets.top + 16 }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1} adjustsFontSizeToFit>Settings</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Settings</Text>
          <View style={styles.divider} />
          
          <TouchableOpacity 
            onPress={handleAccountDeletion}
            style={styles.dangerButton}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonIcon}>🗑️</Text>
              <Text style={styles.dangerButtonText}>Account Deletion Request</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            onPress={logout}
            style={styles.logoutButton}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonIcon}>🚪</Text>
              <Text style={styles.dangerButtonText}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <PoweredBy />
      </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'rgba(3, 11, 20, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    zIndex: 10,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerTitleContainer: {
    flex: 4,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
  },
  backButton: { 
    paddingVertical: 4,
  },
  backButtonText: { color: COLORS.primary, fontSize: 16, fontWeight: '600' },
  headerTitle: { 
    fontSize: 21, 
    fontWeight: 'bold', 
    color: COLORS.text, 
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  content: { padding: 20, flex: 1 },
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 16 },
  dangerButton: {
    backgroundColor: COLORS.dangerBg,
    borderColor: COLORS.dangerBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  buttonContent: { flexDirection: 'row', alignItems: 'center' },
  buttonIcon: { fontSize: 18, marginRight: 12 },
  dangerButtonText: { color: COLORS.danger, fontSize: 16, fontWeight: '600' },
  footer: { alignItems: 'center', paddingBottom: 20 },
});
