import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Api } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import PoweredBy from '../components/PoweredBy';

const COLORS = {
  bg: '#051424',
  surface: 'rgba(255,255,255,0.07)',
  border: 'rgba(255,255,255,0.10)',
  borderFocus: '#2563eb',
  text: '#f1f5f9',
  textMuted: '#64748b',
  textSecondary: '#94a3b8',
  primary: '#2563eb',
  primaryDim: 'rgba(37,99,235,0.15)',
  primaryBorder: 'rgba(37,99,235,0.4)',
  success: '#10b981',
  successBg: 'rgba(16,185,129,0.1)',
  successBorder: 'rgba(16,185,129,0.25)',
  danger: '#ef4444',
  dangerBg: 'rgba(239,68,68,0.15)',
  dangerBorder: 'rgba(239,68,68,0.2)',
  cardBg: 'rgba(255,255,255,0.07)',
};

// Admin is unlocked by tapping the title 5 times
const ADMIN_TAP_COUNT = 5;

export default function LoginScreen() {
  const { login, isLoading, error: authError } = useAuth();
  const [localError, setLocalError] = useState('');
  const [focusInput, setFocusInput] = useState(null);

  // Hidden admin gate — tapping title 5 times
  const [adminTapCount, setAdminTapCount] = useState(0);
  const [adminAccessVisible, setAdminAccessVisible] = useState(false);
  const tapTimerRef = useRef(null);

  // Admin OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isGeneratingOtp, setIsGeneratingOtp] = useState(false);

  // Worker state
  const [employeeIdInput, setEmployeeIdInput] = useState('');
  const [pinInput, setPinInput] = useState('');

  // --- Secret admin unlock: tap title 5 times within 3 seconds ---
  const handleTitleTap = () => {
    const newCount = adminTapCount + 1;
    setAdminTapCount(newCount);

    // Reset tap counter after 3 seconds of inactivity
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => setAdminTapCount(0), 3000);

    if (newCount >= ADMIN_TAP_COUNT) {
      setAdminTapCount(0);
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      setAdminAccessVisible(true);
    }
  };

  // --- OTP handlers ---
  const handleGenerateOtp = async () => {
    setIsGeneratingOtp(true);
    setLocalError('');
    try {
      await Api.generateOtp();
      setOtpSent(true);
    } catch (err) {
      setLocalError('Failed to send OTP. Please try again.');
    } finally {
      setIsGeneratingOtp(false);
    }
  };

  const handleAdminLogin = async () => {
    if (!otpValue.trim()) return;
    setLocalError('');
    try {
      await login('ADMIN', otpValue.trim());
    } catch (err) {
      setLocalError(
        err?.message?.includes('Invalid')
          ? 'Invalid OTP. Please try again or generate a new one.'
          : 'Login failed. Please try again.'
      );
    }
  };

  // --- Worker login handler ---
  const handleWorkerLogin = async () => {
    setLocalError('');
    // Strip ALL spaces and uppercase — matches the Power Automate Filter Array logic
    const employeeId = employeeIdInput.trim().replace(/\s+/g, '').toUpperCase();
    const pin = pinInput.trim();

    if (!employeeId || !pin) {
      setLocalError('Please enter your name/ID and PIN.');
      return;
    }
    await login(employeeId, pin);
  };

  const displayError = localError || authError;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header — tap 5x to reveal admin */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleTitleTap}
            style={styles.header}
          >
            <Text style={styles.title}>B&W Attendance Tracker</Text>
            <Text style={styles.subtitle}>B&W Services</Text>
          </TouchableOpacity>

          <View style={styles.card}>
            {/* ── ADMIN MODE (visible only after 5 taps) ── */}
            {adminAccessVisible ? (
              <View>
                <View style={styles.adminHeader}>
                  <Text style={styles.adminTitle}>Admin Login</Text>
                  <Text style={styles.adminSubtitle}>Secure portal access</Text>
                </View>

                {!otpSent ? (
                  // Step 1: Generate OTP
                  <View style={styles.otpStep1}>
                    <Text style={styles.otpHint}>
                      Tap below to receive a one-time login code via email.
                    </Text>
                    <TouchableOpacity
                      style={[styles.otpGenerateBtn, isGeneratingOtp && styles.btnDisabled]}
                      onPress={handleGenerateOtp}
                      disabled={isGeneratingOtp}
                    >
                      <Text style={styles.otpGenerateBtnText}>
                        {isGeneratingOtp ? '⏳ Sending...' : '📧 Generate OTP'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  // Step 2: Enter OTP
                  <View>
                    <View style={styles.successBanner}>
                      <Text style={styles.successBannerText}>
                        ✓ OTP sent to admin email. Check your inbox.
                      </Text>
                    </View>

                    <Text style={styles.label}>ENTER OTP</Text>
                    <TextInput
                      style={[
                        styles.input,
                        focusInput === 'otp' && styles.inputFocused,
                        { letterSpacing: 4 }
                      ]}
                      value={otpValue}
                      onChangeText={setOtpValue}
                      placeholder="OTP from email"
                      placeholderTextColor={COLORS.textMuted}
                      secureTextEntry
                      maxLength={10}
                      editable={!isLoading}
                      onFocus={() => setFocusInput('otp')}
                      onBlur={() => setFocusInput(null)}
                    />

                    <TouchableOpacity
                      style={[
                        styles.submitButton,
                        (!otpValue.trim() || isLoading) && styles.btnDisabled
                      ]}
                      onPress={handleAdminLogin}
                      disabled={!otpValue.trim() || isLoading}
                    >
                      <Text style={styles.submitButtonText}>
                        {isLoading ? 'Verifying...' : 'Login with OTP'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.resendBtn}
                      onPress={() => { setOtpSent(false); setOtpValue(''); setLocalError(''); }}
                    >
                      <Text style={styles.resendBtnText}>Resend OTP</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              // ── WORKER MODE (default) ──
              <View>
                <Text style={styles.label}>FULL NAME OR EMPLOYEE ID</Text>
                <TextInput
                  style={[styles.input, focusInput === 'name' && styles.inputFocused]}
                  value={employeeIdInput}
                  onChangeText={setEmployeeIdInput}
                  placeholder="Enter your full name or Employee ID"
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  autoComplete="off"
                  editable={!isLoading}
                  onFocus={() => setFocusInput('name')}
                  onBlur={() => setFocusInput(null)}
                />
                <Text style={styles.hint}>e.g. JOHN MATHEW or E1001</Text>

                <Text style={styles.label}>PIN</Text>
                <TextInput
                  style={[styles.input, focusInput === 'pin' && styles.inputFocused]}
                  value={pinInput}
                  onChangeText={setPinInput}
                  placeholder="Enter your 4-digit PIN"
                  placeholderTextColor={COLORS.textMuted}
                  secureTextEntry
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!isLoading}
                  onFocus={() => setFocusInput('pin')}
                  onBlur={() => setFocusInput(null)}
                />

                <TouchableOpacity
                  style={[styles.submitButton, isLoading && styles.btnDisabled]}
                  onPress={handleWorkerLogin}
                  disabled={isLoading}
                >
                  <Text style={styles.submitButtonText}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Error Banner */}
            {!!displayError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{displayError}</Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <PoweredBy />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
  },
  // Admin header
  adminHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  adminTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  adminSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  // OTP Step 1
  otpStep1: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  otpHint: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  otpGenerateBtn: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: COLORS.primaryDim,
    borderColor: COLORS.primaryBorder,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
  },
  otpGenerateBtnText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  // Success banner
  successBanner: {
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.successBorder,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  successBannerText: {
    color: COLORS.success,
    fontSize: 13,
    textAlign: 'center',
  },
  // Shared
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  hint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: -10,
    marginBottom: 16,
  },
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    color: COLORS.text,
    fontSize: 15,
    marginBottom: 16,
  },
  inputFocused: {
    borderColor: COLORS.borderFocus,
  },
  submitButton: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  resendBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  resendBtnText: {
    color: COLORS.textMuted,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  // Error
  errorContainer: {
    marginTop: 12,
    padding: 10,
    backgroundColor: COLORS.dangerBg,
    borderRadius: 8,
    borderColor: COLORS.dangerBorder,
    borderWidth: 1,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    textAlign: 'center',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
});
