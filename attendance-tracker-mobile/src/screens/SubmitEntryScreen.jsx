import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Platform, StatusBar, Alert, KeyboardAvoidingView, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';
import { Api } from '../api/api';
import { warsawDateKey } from '../utils/time';
import PhotoUpload from '../components/PhotoUpload';
import PoweredBy from '../components/PoweredBy';

const COLORS = {
  bg: '#030b14', // Deep Navy
  surface: 'rgba(10, 25, 47, 0.65)',
  border: 'rgba(255,255,255,0.08)',
  text: '#f8fafc',
  textMuted: '#64748b',
  textSecondary: '#94a3b8',
  primary: '#0ea5e9', // Metallic light blue
  primaryDark: '#0369a1',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  cardBg: 'rgba(10, 25, 47, 0.65)',
};

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
      position: 'absolute', left, top, width: 5, height: 5, backgroundColor: color, borderRadius: 2.5,
      opacity: anim, transform: [{ translateX: -2.5 }, { translateY: -2.5 }, { scale: anim }],
      shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 12, elevation: 6,
    }} />
  );
};

const TechnicalGrid = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    {[...Array(8)].map((_, i) => (
      <View key={`v-${i}`} style={{ position: 'absolute', left: `${(i + 1) * 12.5}%`, top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(59,130,246,0.03)' }} />
    ))}
    {[...Array(12)].map((_, i) => (
      <View key={`h-${i}`} style={{ position: 'absolute', top: `${(i + 1) * 8.33}%`, left: 0, right: 0, height: 1, backgroundColor: 'rgba(59,130,246,0.03)' }} />
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

const HoursPicker = ({ value, onChange }) => {
  const chips = [4, 5, 6, 7, 8, 9, 10];
  
  const handleMinus = () => onChange(Math.max(0.5, Number(value) - 0.5));
  const handlePlus = () => onChange(Math.min(24, Number(value) + 0.5));
  
  return (
    <View style={styles.hoursPickerContainer}>
      <View style={styles.hoursHeaderRow}>
        <Text style={styles.hoursLabel}>HOURS WORKED</Text>
        <Text style={styles.hoursValueText}>{value}h</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
        {chips.map(chip => {
          const isActive = value === chip;
          return (
            <TouchableOpacity
              key={chip}
              onPress={() => onChange(chip)}
              style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
            >
              <Text style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}>
                {chip}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.stepperContainer}>
        <TouchableOpacity style={styles.stepperButton} onPress={handleMinus}>
          <Text style={styles.stepperButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.stepperValue}>{value}h</Text>
        <TouchableOpacity style={styles.stepperButton} onPress={handlePlus}>
          <Text style={styles.stepperButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.manualInputContainer}>
        <Text style={styles.manualInputHint}>Or type manually:</Text>
        <TextInput
          style={styles.manualInput}
          keyboardType="numeric"
          value={String(value)}
          onChangeText={(text) => {
            if (text === '') {
               onChange('');
               return;
            }
            let val = parseFloat(text);
            if (!isNaN(val)) {
              if (val > 24) val = 24;
              onChange(text);
            }
          }}
          onEndEditing={() => {
             let val = parseFloat(value);
             if (isNaN(val) || val < 0.5) onChange(0.5);
             else onChange(val);
          }}
        />
      </View>
    </View>
  );
};

export default function SubmitEntryScreen({ navigation }) {
  const { state } = useAuth();
  const insets = useSafeAreaInsets();
  
  const today = warsawDateKey(new Date());
  
  const [workDate, setWorkDate] = useState(today);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [hoursWorked, setHoursWorked] = useState(8);
  const [comments, setComments] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [entryId, setEntryId] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [focusInput, setFocusInput] = useState(null);
  const [existingDates, setExistingDates] = useState(new Set());
  const [existingEntries, setExistingEntries] = useState([]);

  const minDateObj = new Date();
  minDateObj.setDate(minDateObj.getDate() - 30);

  useEffect(() => {
    const currentMonthKey = today.substring(0, 7);
    Api.getMyEntries(state.employeeId, currentMonthKey)
      .then(res => {
        const entries = Array.isArray(res?.entries) ? res.entries : [];
        setExistingEntries(entries);
        const dates = new Set(entries.map(e => e.DateKey || e.WorkDate || '').filter(Boolean));
        setExistingDates(dates);
      })
      .catch(() => {});
  }, [state.employeeId]);

  const isDuplicate = existingDates.has(workDate);
  const duplicateEntry = isDuplicate ? existingEntries.find(e => e.DateKey === workDate || e.WorkDate === workDate) : null;
  const duplicateEntryId = duplicateEntry ? (duplicateEntry.ID || duplicateEntry.id || duplicateEntry.Id || duplicateEntry.itemId) : null;

  const handleSubmit = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError('');
    
    try {
      const payload = {
        employeeId: state.employeeId,
        employeeSpId: state.employeeSpId,
        employeeName: state.employeeName,
        workDate: workDate,
        dateKey: workDate,
        hoursWorked: Number(hoursWorked) || 8,
        comments: comments
      };
      
      const res = await Api.submitEntry(payload);
      
      if (res && res.success === false) {
        setError(res.message || 'Failed to submit entry.');
        setIsLoading(false);
        return;
      }

      const newEntryId = res.entryId || res.id || res.ID || res.itemId || res.Id;
      
      if (!newEntryId) {
        Alert.alert("Debug Info", "API didn't return an ID. Raw response: " + JSON.stringify(res));
      }
      
      setEntryId(Number(newEntryId) || 0);
      setIsSubmitted(true);
      setSuccess(true);
    } catch (err) {
      if (err.message && err.message.includes('409')) {
        setError('You already submitted an entry for this date');
      } else {
        setError('Failed to submit entry. Please try again.');
      }
      setIsLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setWorkDate(warsawDateKey(selectedDate));
    }
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
          <Text style={styles.headerTitle} numberOfLines={1} adjustsFontSizeToFit>Submit Attendance</Text>
        </View>
        <View style={styles.headerRight} />
      </View>
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {isSubmitted ? (
            <View>
              <View style={styles.successBanner}>
                <Text style={styles.successText}>Entry saved successfully! Please attach photo proof.</Text>
              </View>
              
              {entryId ? (
                <PhotoUpload
                  entryId={entryId}
                  employeeId={state.employeeId}
                  dateKey={workDate}
                  onUploadDone={() => navigation.navigate('WorkerDashboard')}
                />
              ) : (
                <View style={styles.placeholderBox}>
                  <Text style={styles.placeholderText}>Submit entry first, then upload photos</Text>
                </View>
              )}
              
              <TouchableOpacity style={styles.skipButton} onPress={() => navigation.navigate('WorkerDashboard')}>
                <Text style={styles.skipButtonText}>Skip & go to dashboard</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.label}>WORK DATE</Text>
              <TouchableOpacity 
                style={[styles.input, focusInput === 'workDate' && styles.inputFocused]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: COLORS.text, fontSize: 15 }}>{workDate}</Text>
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={new Date(workDate)}
                  mode="date"
                  display="default"
                  maximumDate={new Date()}
                  minimumDate={minDateObj}
                  onChange={handleDateChange}
                />
              )}
              
              <HoursPicker 
                value={hoursWorked} 
                onChange={setHoursWorked} 
              />
              
              <Text style={styles.label}>COMMENTS (OPTIONAL)</Text>
              <TextInput
                style={[styles.textArea, focusInput === 'comments' && styles.inputFocused]}
                value={comments}
                onChangeText={setComments}
                onFocus={() => setFocusInput('comments')}
                onBlur={() => setFocusInput(null)}
                placeholder="Describe work completed today..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={3}
                editable={!isLoading}
              />

              {isDuplicate && (
                <View style={styles.warningBanner}>
                  <Text style={styles.warningIcon}>⚠️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.warningTitle}>Entry already submitted</Text>
                    <Text style={styles.warningText}>You already have an attendance entry for this date.</Text>
                  </View>
                </View>
              )}

              {isDuplicate && duplicateEntryId && (
                <View style={{ marginTop: 8, marginBottom: 20 }}>
                  <Text style={[styles.label, { color: COLORS.primary, marginBottom: 12 }]}>ADD PHOTOS TO EXISTING ENTRY:</Text>
                  <PhotoUpload
                    entryId={duplicateEntryId}
                    employeeId={state.employeeId}
                    dateKey={workDate}
                    onUploadDone={() => {
                      Alert.alert("Success", "Photos added to your existing entry!");
                      navigation.navigate('WorkerDashboard');
                    }}
                  />
                </View>
              )}

              {!!error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
              
              <TouchableOpacity
                style={[styles.submitButton, (isLoading || isDuplicate) && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading || isDuplicate}
                activeOpacity={0.8}
              >
                <View style={styles.btnHighlight} />
                <Text style={[styles.submitButtonText, isDuplicate && { color: 'rgba(255,255,255,0.5)' }]}>
                  {isLoading ? 'Submitting...' : isDuplicate ? 'Already Submitted Today' : 'Submit Attendance'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
        <View style={{ paddingBottom: Platform.OS === 'android' ? 20 : insets.bottom, paddingTop: 10 }}>
          <PoweredBy />
        </View>
      </KeyboardAvoidingView>
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
  scrollContent: { padding: 16, paddingBottom: 40 },
  successBanner: {
    backgroundColor: 'rgba(16,185,129,0.2)',
    borderColor: 'rgba(16,185,129,0.3)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  successText: { color: COLORS.success, textAlign: 'center', fontWeight: '600' },
  placeholderBox: {
    borderWidth: 2,
    borderColor: 'rgba(37,99,235,0.4)',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    backgroundColor: 'rgba(37,99,235,0.05)',
  },
  placeholderText: { color: COLORS.textMuted, fontSize: 14 },
  skipButton: { marginTop: 10, padding: 12, alignItems: 'center' },
  skipButtonText: { color: COLORS.textMuted, textDecorationLine: 'underline', fontSize: 14 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6, textTransform: 'uppercase' },
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 16,
    justifyContent: 'center',
    height: 50,
  },
  textArea: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 14,
    color: COLORS.text,
    fontSize: 15,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  inputFocused: { borderColor: COLORS.primary },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderColor: 'rgba(245,158,11,0.35)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  warningIcon: { fontSize: 18, marginRight: 10 },
  warningTitle: { fontSize: 13, fontWeight: '700', color: COLORS.warning },
  warningText: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  errorContainer: {
    marginTop: 12,
    marginBottom: 12,
    padding: 10,
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderRadius: 8,
    borderColor: 'rgba(239,68,68,0.2)',
    borderWidth: 1,
  },
  errorText: { color: COLORS.danger, fontSize: 13, textAlign: 'center' },
  submitButton: {
    width: '100%',
    padding: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primaryDark,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  btnHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  submitButtonDisabled: { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.12)', borderWidth: 1, shadowOpacity: 0, borderBottomWidth: 1 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  hoursPickerContainer: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  hoursHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  hoursLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase' },
  hoursValueText: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  chipsScroll: { marginBottom: 16, flexDirection: 'row' },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1 },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primaryDark },
  chipInactive: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: COLORS.border },
  chipText: { fontSize: 14, fontWeight: '600' },
  chipTextActive: { color: 'white' },
  chipTextInactive: { color: '#94a3b8' },
  stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  stepperButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)', borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  stepperButtonText: { color: 'white', fontSize: 22 },
  stepperValue: { fontSize: 32, fontWeight: '800', color: 'white', minWidth: 80, textAlign: 'center' },
  manualInputContainer: { marginTop: 16 },
  manualInputHint: { fontSize: 12, color: COLORS.textMuted, marginBottom: 6 },
  manualInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderRadius: 8, color: 'white', padding: 10, fontSize: 15 }
});
