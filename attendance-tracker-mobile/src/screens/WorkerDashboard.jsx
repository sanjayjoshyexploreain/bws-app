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
          <View style={styles.section}>
            <Text style={styles.label}>EMPLOYEE NAME</Text>
            <Text style={styles.nameText}>{state.employeeName || '—'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>EMPLOYEE ID</Text>
            <Text style={styles.valueText}>{state.employeeId || '—'}</Text>
          </View>

          {!!state.companyName && (
            <View style={styles.section}>
              <Text style={styles.label}>COMPANY</Text>
              <Text style={styles.valueText}>{state.companyName}</Text>
            </View>
          )}

          {!!state.clientCompany && (
            <View style={styles.section}>
              <Text style={styles.label}>CLIENT COMPANY</Text>
              <Text style={styles.valueText}>{state.clientCompany}</Text>
            </View>
          )}

          {!!state.profession && (
            <View style={styles.sectionLast}>
              <Text style={styles.label}>PROFESSION</Text>
              <Text style={styles.valueText}>{state.profession}</Text>
            </View>
          )}
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
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  section: { marginBottom: 20 },
  sectionLast: { marginBottom: 0 },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  nameText: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  valueText: { fontSize: 16, color: COLORS.text },
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
