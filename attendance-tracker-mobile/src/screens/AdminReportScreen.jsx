import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, ScrollView, Platform, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Api } from '../api/api';
import { getCurrentWarsawMonthKey, formatWarsawDate } from '../utils/time';
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
  success: '#10b981',
  danger: '#ef4444',
  cardBg: 'rgba(255,255,255,0.07)',
  dangerBg: 'rgba(239,68,68,0.2)',
};

export default function AdminReportScreen({ navigation }) {
  const [currentMonthKey, setCurrentMonthKey] = useState(getCurrentWarsawMonthKey());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [employees, setEmployees] = useState([]);
  
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await Api.listEmployees();
        setEmployees(res || []);
      } catch (err) {
        console.error("Failed to load employees", err);
      }
    };
    fetchEmployees();
  }, []);

  const fetchReport = async (monthKey, employeeId) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await Api.monthlyReport(monthKey, employeeId);
      
      let rows = res.rows || res.entries || res.items || res.data || [];
      if (typeof rows === 'string') rows = JSON.parse(rows);
      if (!Array.isArray(rows)) rows = [];

      const grandTotalHours = res.grandTotalHours ?? res.totalHours ?? res.total ?? 0;

      setReportData({ ...res, rows, grandTotalHours });
    } catch (err) {
      setError(err.message || 'Failed to fetch report.');
      setReportData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(currentMonthKey, selectedEmployeeId);
  }, []);

  const handleApply = () => {
    fetchReport(currentMonthKey, selectedEmployeeId);
  };

  const handlePrevMonth = () => {
    const [year, month] = currentMonthKey.split('-');
    let newDate = new Date(year, parseInt(month) - 1 - 1, 1);
    let newYear = newDate.getFullYear();
    let newMonth = (newDate.getMonth() + 1).toString().padStart(2, '0');
    setCurrentMonthKey(`${newYear}-${newMonth}`);
  };

  const handleNextMonth = () => {
    const [year, month] = currentMonthKey.split('-');
    let newDate = new Date(year, parseInt(month) - 1 + 1, 1);
    let newYear = newDate.getFullYear();
    let newMonth = (newDate.getMonth() + 1).toString().padStart(2, '0');
    setCurrentMonthKey(`${newYear}-${newMonth}`);
  };

  const formatMonthDisplay = (key) => {
    const [year, month] = key.split('-');
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const normalizeRow = (rawRow) => {
    const eId = rawRow.employeeId || rawRow.EmployeeID || rawRow.EmployeeId || '';
    const mappedEmp = employees.find(e => e.EmployeeID === eId || e.ID === eId || String(e.ID) === String(eId));
    
    let backendName = rawRow.employeeName || rawRow.EmployeeName || '';
    if (backendName === eId) backendName = '';
    
    const eName = (mappedEmp ? (mappedEmp['Employee Full Name'] || mappedEmp.FullName || mappedEmp.EmployeeName) : '') || backendName || eId;
    
    return {
      employeeId:   eId,
      employeeName: eName,
      workDate:     rawRow.workDate     || rawRow.WorkDate     || '',
      hoursWorked:  rawRow.hoursWorked  || rawRow.HoursWorked  || 0,
      comments:     rawRow.comments     || rawRow.Comments     || '',
      adminNotes:   rawRow.adminNotes   || rawRow.AdminNotes   || '',
      entryId:      rawRow.entryId      || rawRow.ID           || rawRow.id           || '',
    };
  };

  const exportCSV = async () => {
    if (!reportData || !reportData.rows || reportData.rows.length === 0) return;

    const esc = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    
    const normalizedRows = reportData.rows.map(normalizeRow);
    const sortedRows = normalizedRows.sort((a, b) => {
      if (a.employeeId === b.employeeId) {
        return a.workDate.localeCompare(b.workDate);
      }
      return a.employeeId.localeCompare(b.employeeId);
    });

    const headers = ['Employee ID', 'Employee Name', 'Date', 'Hours Worked', 'Comments', 'Admin Notes'];
    const csvRows = [];
    csvRows.push(headers.map(esc).join(','));

    sortedRows.forEach(row => {
      csvRows.push([
        row.employeeId,
        row.employeeName,
        formatWarsawDate(row.workDate),
        row.hoursWorked,
        row.comments,
        row.adminNotes
      ].map(esc).join(','));
    });

    csvRows.push('');
    csvRows.push('');
    csvRows.push([
      '', '', '', '', 'Total Hours:', reportData.grandTotalHours
    ].map(esc).join(','));

    const csvString = csvRows.join('\r\n');
    
    try {
      const fileName = `attendance_report_${reportData.monthKey}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, csvString, { encoding: FileSystem.EncodingType.UTF8 });
      
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not export CSV');
    }
  };

  const groupedData = [];
  if (reportData && reportData.rows && reportData.rows.length > 0) {
    const groupMap = {};

    reportData.rows.forEach(rawRow => {
      const row = normalizeRow(rawRow);
      if (!groupMap[row.employeeId]) {
        groupMap[row.employeeId] = {
          employeeId: row.employeeId,
          employeeName: row.employeeName,
          entries: [],
          subtotalHours: 0
        };
        groupedData.push(groupMap[row.employeeId]);
      }
      groupMap[row.employeeId].entries.push(row);
      groupMap[row.employeeId].subtotalHours += Number(row.hoursWorked) || 0;
    });
    
    groupedData.sort((a, b) => (a.employeeName || '').localeCompare(b.employeeName || ''));
    
    groupedData.forEach(group => {
      group.entries.sort((a, b) => (a.workDate || '').localeCompare(b.workDate || ''));
    });
  }

  const truncate = (str, len) => {
    if (!str) return "—";
    if (str.length > len) return str.substring(0, len) + "...";
    return str;
  };

  const renderHeader = () => (
    <View>
      <View style={styles.card}>
        <Text style={styles.label}>MONTH</Text>
        <View style={styles.monthControls}>
          <TouchableOpacity style={styles.monthButton} onPress={handlePrevMonth}>
            <Text style={styles.monthButtonText}>{'<'}</Text>
          </TouchableOpacity>
          <View style={styles.monthDisplayContainer}>
            <Text style={styles.monthDisplay}>{formatMonthDisplay(currentMonthKey)}</Text>
          </View>
          <TouchableOpacity style={styles.monthButton} onPress={handleNextMonth}>
            <Text style={styles.monthButtonText}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>EMPLOYEE</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedEmployeeId}
            onValueChange={(val) => setSelectedEmployeeId(val)}
            style={{ color: COLORS.text }}
            dropdownIconColor={COLORS.text}
          >
            <Picker.Item label="All Employees" value="" />
            {employees.map((emp, idx) => (
              <Picker.Item 
                key={emp.EmployeeID || `emp-${idx}`} 
                label={emp['Employee Full Name'] || emp.FullName || emp.EmployeeName || 'Unknown'} 
                value={emp.EmployeeID || ''} 
              />
            ))}
          </Picker>
        </View>

        <TouchableOpacity 
          style={[styles.applyButton, isLoading && styles.disabled]} 
          onPress={handleApply}
          disabled={isLoading}
        >
          <Text style={styles.applyButtonText}>{isLoading ? 'Loading...' : 'Apply'}</Text>
        </TouchableOpacity>
      </View>

      {!!error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.centerBox}>
          <LoadingSpinner />
        </View>
      ) : reportData && (
        <>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>TOTAL HOURS</Text>
              <Text style={styles.statValue}>{Number(reportData.grandTotalHours).toFixed(1)}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>EMPLOYEES</Text>
              <Text style={styles.statValue}>{groupedData.length}</Text>
            </View>
          </View>

          {groupedData.length === 0 && (
            <Text style={styles.noDataText}>No approved entries found for this period</Text>
          )}
        </>
      )}
    </View>
  );

  const renderGroup = ({ item: group }) => (
    <View style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupHeaderText}>{group.employeeName} — {group.subtotalHours.toFixed(1)}h</Text>
      </View>
      {group.entries.map(entry => (
        <View key={entry.entryId} style={styles.row}>
          <View style={styles.rowCol1}>
            <Text style={styles.rowDate}>{formatWarsawDate(entry.workDate)}</Text>
          </View>
          <View style={styles.rowCol2}>
            <Text style={styles.rowHours}>{Number(entry.hoursWorked).toFixed(1)}h</Text>
          </View>
          <View style={styles.rowCol3}>
            <Text style={styles.rowComments}>{truncate(entry.comments, 30)}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Monthly Report</Text>
      </View>

      <FlatList
        data={!isLoading && reportData ? groupedData : []}
        keyExtractor={item => item.employeeId}
        renderItem={renderGroup}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          <>
            {!isLoading && reportData && groupedData.length > 0 && (
              <View style={styles.grandTotalBox}>
                <Text style={styles.grandTotalLabel}>Grand Total:</Text>
                <Text style={styles.grandTotalValue}>{Number(reportData.grandTotalHours).toFixed(1)}h</Text>
              </View>
            )}
            <View style={{ height: 100 }}><PoweredBy /></View>
          </>
        }
      />

      {reportData && reportData.rows && reportData.rows.length > 0 && (
        <TouchableOpacity style={styles.exportButton} onPress={exportCSV}>
          <Text style={styles.exportButtonText}>Export CSV</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  centerBox: { padding: 40, alignItems: 'center' },
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
  listContent: { padding: 16, paddingBottom: 60 },
  card: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, letterSpacing: 1, marginBottom: 6 },
  monthControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
  },
  monthButton: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.05)' },
  monthButtonText: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
  monthDisplayContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10 },
  monthDisplay: { fontSize: 15, color: COLORS.text },
  pickerContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    justifyContent: 'center',
    height: 50,
  },
  applyButton: { padding: 15, backgroundColor: COLORS.primary, borderRadius: 8, alignItems: 'center' },
  applyButtonText: { color: 'white', fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.7 },
  errorContainer: { padding: 12, backgroundColor: COLORS.dangerBg, borderColor: 'rgba(239,68,68,0.2)', borderWidth: 1, borderRadius: 8, marginBottom: 20 },
  errorText: { color: COLORS.danger, textAlign: 'center', fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 15, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: COLORS.cardBg, borderColor: COLORS.border, borderWidth: 1, borderRadius: 16, padding: 20, alignItems: 'center' },
  statLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, letterSpacing: 1, marginBottom: 6 },
  statValue: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  noDataText: { textAlign: 'center', padding: 40, color: COLORS.textMuted, fontSize: 15 },
  groupCard: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  groupHeader: {
    backgroundColor: 'rgba(37,99,235,0.1)',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  groupHeaderText: { fontWeight: '700', color: COLORS.text, fontSize: 15 },
  row: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowCol1: { flex: 2 },
  rowDate: { color: COLORS.textSecondary, fontSize: 13 },
  rowCol2: { flex: 1, alignItems: 'center' },
  rowHours: { color: COLORS.text, fontWeight: '600', fontSize: 13 },
  rowCol3: { flex: 3 },
  rowComments: { color: COLORS.textSecondary, fontSize: 13 },
  grandTotalBox: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderTopWidth: 2, borderTopColor: COLORS.borderActive, marginTop: 10, borderRadius: 8 },
  grandTotalLabel: { fontWeight: '700', color: COLORS.text, fontSize: 15, marginRight: 10 },
  grandTotalValue: { fontWeight: '700', color: COLORS.primary, fontSize: 15 },
  exportButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: COLORS.success,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    elevation: 5,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  exportButtonText: { color: 'white', fontWeight: '700', fontSize: 15 },
});
