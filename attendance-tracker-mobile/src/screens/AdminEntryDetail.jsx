import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Api } from '../api/api';
import { formatWarsawDate } from '../utils/time';
import PhotoDisplay from '../components/PhotoDisplay';
import PoweredBy from '../components/PoweredBy';

const COLORS = {
  bg: '#051424',
  surface: 'rgba(255,255,255,0.07)',
  border: 'rgba(255,255,255,0.10)',
  text: '#f1f5f9',
  textMuted: '#64748b',
  textSecondary: '#94a3b8',
  primary: '#2563eb',
  success: '#10b981',
  danger: '#ef4444',
  cardBg: 'rgba(255,255,255,0.07)',
};

export default function AdminEntryDetail({ route, navigation }) {
  const { state: authState } = useAuth();
  const { entry } = route.params || {};

  const [adminNotes, setAdminNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(null);

  if (!entry) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <Text style={styles.text}>Entry not found.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AdminDashboard')}>
            <Text style={styles.link}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleReview = async (status) => {
    setIsLoading(true);
    setError('');
    try {
      await Api.reviewEntry(entry.ID, status, adminNotes, authState.employeeId);
      navigation.navigate('AdminDashboard');
    } catch (err) {
      setError(`Failed to ${status.toLowerCase()} entry.`);
      setIsLoading(false);
      setShowConfirm(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Entry</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.section}>
            <Text style={styles.label}>EMPLOYEE</Text>
            <Text style={styles.valueText}>{entry.EmployeeID || entry.EmployeeName}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>WORK DATE</Text>
            <Text style={styles.valueText}>{formatWarsawDate(entry.WorkDate)}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>HOURS WORKED</Text>
            <Text style={styles.valueText}>{entry.HoursWorked} <Text style={styles.hoursSuffix}>hrs</Text></Text>
          </View>
          {!!entry.Comments && (
            <View style={[styles.section, { marginBottom: 0 }]}>
              <Text style={styles.label}>COMMENTS FROM WORKER</Text>
              <Text style={styles.bodyText}>{entry.Comments}</Text>
            </View>
          )}
        </View>

        <PhotoDisplay entryId={entry.ID} />

        <View style={[styles.card, { marginTop: 20 }]}>
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.label}>ADMIN NOTES (OPTIONAL)</Text>
            <TextInput
              style={styles.textArea}
              value={adminNotes}
              onChangeText={setAdminNotes}
              editable={!isLoading && !showConfirm}
              multiline
              numberOfLines={3}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          {!!error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {showConfirm ? (
            <View style={styles.confirmBox}>
              <Text style={styles.confirmText}>
                {showConfirm} <Text style={{ color: COLORS.primary }}>{entry.HoursWorked} hours</Text> for {formatWarsawDate(entry.WorkDate)}?{"\n"}This cannot be undone.
              </Text>
              <View style={styles.confirmButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowConfirm(null)}
                  disabled={isLoading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmActionButton, { backgroundColor: showConfirm === 'Approve' ? COLORS.success : COLORS.danger }]}
                  onPress={() => handleReview(showConfirm === 'Approve' ? 'Approved' : 'Rejected')}
                  disabled={isLoading}
                >
                  <Text style={styles.confirmActionText}>
                    {isLoading ? 'Processing...' : 'Confirm'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: COLORS.danger }]}
                onPress={() => setShowConfirm('Reject')}
                disabled={isLoading}
              >
                <Text style={styles.actionButtonText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: COLORS.success }]}
                onPress={() => setShowConfirm('Approve')}
                disabled={isLoading}
              >
                <Text style={styles.actionButtonText}>Approve</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      <PoweredBy />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { color: COLORS.text, fontSize: 16 },
  link: { color: COLORS.primary, textDecorationLine: 'underline', marginTop: 10, fontSize: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(5, 20, 36, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { marginRight: 15, paddingVertical: 4 },
  backButtonText: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  scrollContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  section: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  valueText: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  hoursSuffix: { fontSize: 14, fontWeight: 'normal', color: COLORS.textMuted },
  bodyText: { fontSize: 16, color: COLORS.text, lineHeight: 24 },
  textArea: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    color: COLORS.text,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  errorContainer: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderRadius: 8,
    borderColor: 'rgba(239,68,68,0.2)',
    borderWidth: 1,
  },
  errorText: { color: COLORS.danger, fontSize: 13, textAlign: 'center' },
  actionButtons: { flexDirection: 'row', gap: 12 },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  confirmBox: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmText: { marginBottom: 20, fontWeight: '600', color: COLORS.text, lineHeight: 22, textAlign: 'center' },
  confirmButtons: { flexDirection: 'row', gap: 12 },
  cancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: { color: COLORS.text, fontWeight: '600' },
  confirmActionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmActionText: { color: '#fff', fontWeight: '700' },
});
