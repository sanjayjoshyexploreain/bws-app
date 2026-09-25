import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import PoweredBy from '../components/PoweredBy';

const COLORS = {
  bg: '#051424',
  surface: 'rgba(255,255,255,0.07)',
  border: 'rgba(255,255,255,0.10)',
  text: '#f1f5f9',
  textMuted: '#64748b',
  textSecondary: '#94a3b8',
  primary: '#2563eb',
  cardBg: 'rgba(255,255,255,0.07)',
};

export default function WorkerDashboard({ navigation }) {
  const { state, logout } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Worker Dashboard</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerInfo}>
              <Text style={styles.nameText}>{state.employeeName || 'Unknown Worker'}</Text>
              <Text style={styles.idBadge}>ID: {state.employeeId || '—'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsList}>
            {!!state.companyName && (
              <View style={styles.listItem}>
                <Text style={styles.label}>Company</Text>
                <Text style={styles.valueText}>{state.companyName}</Text>
              </View>
            )}

            {!!state.clientCompany && (
              <View style={styles.listItem}>
                <Text style={styles.label}>Client Company</Text>
                <Text style={styles.valueText}>{state.clientCompany}</Text>
              </View>
            )}

            {!!state.profession && (
              <View style={styles.listItem}>
                <Text style={styles.label}>Profession</Text>
                <Text style={styles.valueText}>{state.profession}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom action buttons */}
      <View style={[styles.bottomContainer, { bottom: Platform.OS === 'android' ? 80 : insets.bottom + 60 }]}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => navigation.navigate('SubmitEntry')}
        >
          <Text style={styles.submitButtonText} numberOfLines={1} adjustsFontSizeToFit>+ Submit Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('WorkwearRequest')}
        >
          <Text style={styles.secondaryButtonText} numberOfLines={1} adjustsFontSizeToFit>🦺 Request Workwear</Text>
        </TouchableOpacity>
      </View>

      <View style={{ position: 'absolute', bottom: Platform.OS === 'android' ? 40 : Math.max(insets.bottom, 20), left: 0, right: 0 }}>
        <PoweredBy />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(5, 20, 36, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 21, fontWeight: 'bold', color: COLORS.text, letterSpacing: 0.5 },
  logoutText: { color: '#ef4444', fontSize: 14, fontWeight: '600' },
  scrollContent: { padding: 16, paddingBottom: 160 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerInfo: { flex: 1 },
  nameText: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  idBadge: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden', // Ensures background color wraps corners properly on Android
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 20,
  },
  detailsList: {
    gap: 20,
  },
  listItem: {
    width: '100%',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  valueText: { fontSize: 15, color: COLORS.text, fontWeight: '500' },
  bottomContainer: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    gap: 12,
  },
  submitButton: {
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  secondaryButtonText: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
});
