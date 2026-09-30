import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Platform, StatusBar, Image, Pressable, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PoweredBy from '../components/PoweredBy';

const COLORS = {
  bg: '#030b14', // Deep Navy
  surface: 'rgba(10, 25, 47, 0.65)',
  border: 'rgba(255,255,255,0.08)',
  text: '#f8fafc',
  textMuted: '#64748b',
  textSecondary: '#94a3b8',
  primary: '#0ea5e9',
  primaryDim: 'rgba(14,165,233,0.15)',
  primaryDark: '#0369a1',
  danger: '#ef4444',
  dangerBg: 'rgba(239,68,68,0.1)',
  dangerBorder: 'rgba(239,68,68,0.3)',
  iconBg: 'rgba(14, 165, 233, 0.1)',
};

// PulsingDot component for the background grid
const PulsingDot = ({ left, top, color, delay }) => {
  const anim = useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
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
    <PulsingDot left="50%" top="83.33%" color="rgba(255,255,255,1)" delay={1000} />
    <PulsingDot left="87.5%" top="41.65%" color="#60a5fa" delay={1500} />
    <PulsingDot left="12.5%" top="8.33%" color="#60a5fa" delay={300} />
    <PulsingDot left="87.5%" top="8.33%" color="#60a5fa" delay={1100} />
    <PulsingDot left="50%" top="33.32%" color="#60a5fa" delay={700} />
    <PulsingDot left="25%" top="58.31%" color="#60a5fa" delay={1300} />
    <PulsingDot left="87.5%" top="91.63%" color="rgba(255,255,255,1)" delay={900} />
    <PulsingDot left="12.5%" top="41.65%" color="#60a5fa" delay={500} />
    <PulsingDot left="62.5%" top="75%" color="#60a5fa" delay={1400} />
    <PulsingDot left="37.5%" top="16.66%" color="#60a5fa" delay={200} />
  </View>
);

// Reusable profile property row
const InfoRow = ({ icon, label, value }) => {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconContainer}>
        <Text style={styles.infoIcon}>{icon}</Text>
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
};

export default function WorkerDashboard({ navigation }) {
  const { state, logout } = useAuth();
  const insets = useSafeAreaInsets();
  
  const submitScale = useRef(new Animated.Value(1)).current;
  const requestScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = (anim) => {
    Animated.spring(anim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = (anim) => {
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  };

  const paddingTop = Platform.OS === 'android' ? StatusBar.currentHeight + 16 : insets.top + 16;
  const paddingBottom = Math.max(insets.bottom + 24, 40);

  return (
    <View style={styles.container}>
      <TechnicalGrid />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingTop, paddingBottom }]}
          showsVerticalScrollIndicator={false}
        >
          
          {/* HEADER */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Image 
                source={require('../../assets/splash-icon.png')} 
                style={styles.logo}
              />
            </View>
            <TouchableOpacity onPress={logout} style={styles.logoutBtn} activeOpacity={0.7}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* WELCOME SECTION */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeLabel}>Welcome back,</Text>
            <Text style={styles.employeeName}>{state.employeeName || 'Unknown Worker'}</Text>
            <View style={styles.idBadgeContainer}>
              <Text style={styles.idBadgeIcon}>👤</Text>
              <Text style={styles.idBadgeText}>{state.employeeId || '—'}</Text>
            </View>
          </View>

          {/* PROFILE CARD */}
          <View style={styles.card}>
            {/* Glowing Corner Accents */}
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />

            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>MY PROFILE</Text>
              <Text style={styles.cardSubtitle}>Your employment details</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsList}>
              <InfoRow icon="🏷️" label="EMPLOYEE ID" value={state.employeeId || '—'} />
              
              {!!state.companyName && (
                <>
                  <View style={styles.rowDivider} />
                  <InfoRow icon="🏢" label="COMPANY" value={state.companyName} />
                </>
              )}

              {!!state.clientCompany && (
                <>
                  <View style={styles.rowDivider} />
                  <InfoRow icon="🤝" label="CLIENT COMPANY" value={state.clientCompany} />
                </>
              )}

              {!!state.profession && (
                <>
                  <View style={styles.rowDivider} />
                  <InfoRow icon="🛠️" label="PROFESSION" value={state.profession} />
                </>
              )}
            </View>
          </View>

          {/* ACTIONS */}
          <View style={styles.actionsContainer}>
            
            {/* Primary Action */}
            <Animated.View style={{ transform: [{ scale: submitScale }] }}>
              <Pressable
                onPressIn={() => handlePressIn(submitScale)}
                onPressOut={() => handlePressOut(submitScale)}
                onPress={() => navigation.navigate('SubmitEntry')}
                style={styles.primaryButton}
              >
                <View style={styles.primaryHighlight} />
                <View style={styles.buttonContent}>
                  <View style={styles.buttonLeft}>
                    <Text style={styles.buttonIconPrimary}>📅</Text>
                    <View>
                      <Text style={styles.primaryButtonText}>Submit Attendance</Text>
                      <Text style={styles.primaryButtonSub}>Check in for your work today</Text>
                    </View>
                  </View>
                  <Text style={styles.arrowIcon}>›</Text>
                </View>
              </Pressable>
            </Animated.View>

            {/* Secondary Action */}
            <Animated.View style={{ transform: [{ scale: requestScale }], marginTop: 16 }}>
              <Pressable
                onPressIn={() => handlePressIn(requestScale)}
                onPressOut={() => handlePressOut(requestScale)}
                onPress={() => navigation.navigate('WorkwearRequest')}
                style={styles.secondaryButton}
              >
                <View style={styles.buttonContent}>
                  <View style={styles.buttonLeft}>
                    <Text style={styles.buttonIconSecondary}>👕</Text>
                    <Text style={styles.secondaryButtonText}>Request Workwear</Text>
                  </View>
                  <Text style={styles.arrowIconMuted}>›</Text>
                </View>
              </Pressable>
            </Animated.View>
            
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <PoweredBy />
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  
  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: -30, // Pulls the content up to overlap the logo's transparent bottom padding
    zIndex: 10,
  },
  headerLeft: {
    alignItems: 'flex-start',
  },
  logo: {
    width: 360,
    height: 180,
    resizeMode: 'contain',
    marginLeft: -24,
    marginRight: -100, // Prevents pushing the logout button out of the screen
  },
  logoutBtn: {
    backgroundColor: COLORS.dangerBg,
    borderColor: COLORS.dangerBorder,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 20, // Ensures it stays clickable above the logo's transparent padding
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '700',
  },

  // Welcome
  welcomeSection: {
    marginBottom: 16,
  },
  welcomeLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  employeeName: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
    marginBottom: 8,
  },
  idBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryDim,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.3)',
  },
  idBadgeIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  idBadgeText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Profile Card
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
    position: 'relative',
  },
  cornerTL: { position: 'absolute', top: -1, left: -1, width: 20, height: 20, borderTopWidth: 2, borderLeftWidth: 2, borderColor: '#60a5fa', borderTopLeftRadius: 26, shadowColor: '#60a5fa', shadowOpacity: 1, shadowRadius: 6, elevation: 6 },
  cornerTR: { position: 'absolute', top: -1, right: -1, width: 20, height: 20, borderTopWidth: 2, borderRightWidth: 2, borderColor: '#60a5fa', borderTopRightRadius: 26, shadowColor: '#60a5fa', shadowOpacity: 1, shadowRadius: 6, elevation: 6 },
  cornerBL: { position: 'absolute', bottom: -1, left: -1, width: 20, height: 20, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: '#60a5fa', borderBottomLeftRadius: 26, shadowColor: '#60a5fa', shadowOpacity: 1, shadowRadius: 6, elevation: 6 },
  cornerBR: { position: 'absolute', bottom: -1, right: -1, width: 20, height: 20, borderBottomWidth: 2, borderRightWidth: 2, borderColor: '#60a5fa', borderBottomRightRadius: 26, shadowColor: '#60a5fa', shadowOpacity: 1, shadowRadius: 6, elevation: 6 },
  
  cardHeader: {
    marginBottom: 12,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cardSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 12,
  },
  detailsList: {
    gap: 0,
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginVertical: 10,
  },
  
  // Info Row
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoIcon: {
    fontSize: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },

  // Actions
  actionsContainer: {
    width: '100%',
    marginBottom: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowIcon: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '300',
    opacity: 0.8,
  },
  arrowIconMuted: {
    color: COLORS.textSecondary,
    fontSize: 24,
    fontWeight: '300',
    opacity: 0.5,
  },
  
  // Primary Button
  primaryButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.primaryDark,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  primaryHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonIconPrimary: {
    fontSize: 18,
    marginRight: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  primaryButtonSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },

  // Secondary Button
  secondaryButton: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
  },
  buttonIconSecondary: {
    fontSize: 16,
    marginRight: 12,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: 8,
  },
});
