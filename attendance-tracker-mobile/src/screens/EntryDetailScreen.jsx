import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { formatWarsawDate } from '../utils/time';
import StatusPill from '../components/StatusPill';
import PhotoDisplay from '../components/PhotoDisplay';
import PoweredBy from '../components/PoweredBy';

const COLORS = {
  bg: '#051424',
  text: '#f1f5f9',
  textMuted: '#64748b',
  textSecondary: '#94a3b8',
  primary: '#2563eb',
  warning: '#f59e0b',
  warningBg: 'rgba(245,158,11,0.1)',
  border: 'rgba(255,255,255,0.10)',
  cardBg: 'rgba(255,255,255,0.07)',
};

export default function EntryDetailScreen({ route, navigation }) {
  const { entry } = route.params || {};

  if (!entry) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <Text style={styles.text}>Entry not found.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.link}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Entry Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.dateText}>{formatWarsawDate(entry.WorkDate)}</Text>
            <StatusPill status={entry.Status} />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>HOURS WORKED</Text>
            <Text style={styles.hoursText}>
              {entry.HoursWorked} <Text style={styles.hoursSuffix}>hrs</Text>
            </Text>
          </View>

          {!!entry.Comments && (
            <View style={styles.section}>
              <Text style={styles.label}>COMMENTS</Text>
              <Text style={styles.bodyText}>{entry.Comments}</Text>
            </View>
          )}

          {!!entry.AdminNotes && (
            <View style={styles.warningBox}>
              <Text style={styles.warningLabel}>MANAGER FEEDBACK</Text>
              <Text style={styles.warningText}>{entry.AdminNotes}</Text>
            </View>
          )}
        </View>

        <PhotoDisplay entryId={entry.ID} />
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  dateText: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  section: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  hoursText: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  hoursSuffix: { fontSize: 14, fontWeight: 'normal', color: COLORS.textMuted },
  bodyText: { fontSize: 16, color: COLORS.text, lineHeight: 24 },
  warningBox: {
    marginTop: 10,
    backgroundColor: COLORS.warningBg,
    borderColor: 'rgba(245,158,11,0.3)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  warningLabel: { fontSize: 13, fontWeight: '600', color: COLORS.warning, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  warningText: { fontSize: 15, color: COLORS.text, lineHeight: 21 },
});
