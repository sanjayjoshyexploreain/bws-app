import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, RefreshControl, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';
import { Api } from '../api/api';
import { formatWarsawDate, warsawDateKey } from '../utils/time';
import StatusPill from '../components/StatusPill';
import LoadingSpinner from '../components/LoadingSpinner';
import PoweredBy from '../components/PoweredBy';

const COLORS = {
  bg: '#051424',
  surface: 'rgba(255,255,255,0.07)',
  border: 'rgba(255,255,255,0.10)',
  borderActive: 'rgba(255,255,255,0.3)',
  text: '#f1f5f9',
  textMuted: '#64748b',
  textSecondary: '#94a3b8',
  primary: '#2563eb',
  danger: '#ef4444',
  cardBg: 'rgba(255,255,255,0.07)',
};

export default function AdminDashboard({ navigation }) {
  const { logout } = useAuth();
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [dateFilter, setDateFilter] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fetchEntries = async (statusOverride, dateOverride) => {
    const status = statusOverride !== undefined ? statusOverride : statusFilter;
    const date = dateOverride !== undefined ? dateOverride : dateFilter;
    setIsLoading(true);
    setError('');
    try {
      const res = await Api.adminGetEntries(status === 'All' ? '' : status, date);
      const rawEntries = res.entries;
      const entriesList = typeof rawEntries === 'string'
        ? JSON.parse(rawEntries)
        : Array.isArray(rawEntries) ? rawEntries : [];
      setEntries(entriesList);
    } catch (err) {
      setError('Failed to fetch entries.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleApplyFilters = () => {
    fetchEntries();
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateFilter(warsawDateKey(selectedDate));
    }
  };

  const renderHeader = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {['All', 'Pending', 'Approved', 'Rejected'].map(s => (
          <TouchableOpacity
            key={s}
            onPress={() => {
              setStatusFilter(s);
              fetchEntries(s, dateFilter);
            }}
            style={[styles.filterChip, statusFilter === s ? styles.filterChipActive : styles.filterChipInactive]}
          >
            <Text style={[styles.filterChipText, statusFilter === s ? styles.filterChipTextActive : styles.filterChipTextInactive]}>
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.dateFilterRow}>
        <TouchableOpacity 
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={{ color: dateFilter ? COLORS.text : COLORS.textMuted }}>
            {dateFilter || 'Select Date'}
          </Text>
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={dateFilter ? new Date(dateFilter) : new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
        
        <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
        
        {!!dateFilter && (
          <TouchableOpacity 
            style={styles.clearDateButton} 
            onPress={() => {
              setDateFilter('');
              fetchEntries(statusFilter, '');
            }}
          >
            <Text style={styles.clearDateText}>×</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {!!error && <Text style={styles.errorText}>{error}</Text>}
      {entries.length === 0 && !isLoading && !error && (
        <Text style={styles.noEntriesText}>No entries found</Text>
      )}
    </View>
  );

  const renderItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.employeeName}>{item.EmployeeName || item.EmployeeID || `ID: ${item.ID}`}</Text>
            <Text style={styles.dateText}>{formatWarsawDate(item.WorkDate)}</Text>
          </View>
          <StatusPill status={item.Status?.Value || item.Status} />
        </View>
        
        <View style={styles.hoursRow}>
          <Text style={styles.hoursNumber}>{item.HoursWorked}</Text>
          <Text style={styles.hoursText}>hours logged</Text>
        </View>

        <TouchableOpacity
          style={styles.reviewButton}
          onPress={() => navigation.navigate('AdminEntryDetail', { entry: item })}
        >
          <Text style={styles.reviewButtonText}>Review Details</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.reportButton}
            onPress={() => navigation.navigate('AdminReport')}
          >
            <Text style={styles.reportButtonText}>Monthly Report</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item, index) => item.ID ? item.ID.toString() : index.toString()}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => fetchEntries()}
            tintColor={COLORS.primary}
          />
        }
        ListFooterComponent={<PoweredBy />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(5, 20, 36, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, letterSpacing: 0.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  reportButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  reportButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  logoutText: { color: COLORS.textMuted, fontSize: 13 },
  filterContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
    marginBottom: 12,
  },
  filterScroll: { flexDirection: 'row', marginBottom: 16 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipInactive: { backgroundColor: 'transparent', borderColor: COLORS.borderActive },
  filterChipText: { fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: 'white' },
  filterChipTextInactive: { color: COLORS.textSecondary },
  dateFilterRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
  },
  applyButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    justifyContent: 'center',
  },
  applyButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  clearDateButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearDateText: { color: COLORS.textSecondary, fontSize: 18, lineHeight: 18 },
  errorText: { color: COLORS.danger, textAlign: 'center', marginTop: 10 },
  noEntriesText: { textAlign: 'center', paddingVertical: 48, color: COLORS.textMuted, fontSize: 15 },
  listContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  employeeName: { fontWeight: '700', fontSize: 15, color: COLORS.text },
  dateText: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  hoursRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  hoursNumber: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginRight: 6 },
  hoursText: { fontSize: 13, color: COLORS.textMuted },
  reviewButton: {
    width: '100%',
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  reviewButtonText: { color: COLORS.text, fontWeight: '600', fontSize: 14 },
});
