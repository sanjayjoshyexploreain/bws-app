import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
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
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => navigation.navigate('SubmitEntry')}
        >
          <Text style={styles.submitButtonText}>+ Submit Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('WorkwearRequest')}
        >
          <Text style={styles.secondaryButtonText}>🦺 Request Workwear</Text>
        </TouchableOpacity>
      </View>

      <PoweredBy />
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
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, letterSpacing: 0.5 },
  logoutText: { color: COLORS.textMuted, fontSize: 13 },
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
    gap: 10,
  },
  submitButton: {
    padding: 17,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
});
