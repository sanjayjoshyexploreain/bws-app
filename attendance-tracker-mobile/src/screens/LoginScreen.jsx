import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView,
  Image, Pressable, Animated
} from 'react-native';

import { useAuth } from '../context/AuthContext';
import { Api } from '../api/api';
import PoweredBy from '../components/PoweredBy';

const COLORS = {
  bg: '#030b14', // Deep Navy
  surface: 'rgba(10, 25, 47, 0.65)',
  border: 'rgba(255,255,255,0.08)',
  borderFocus: '#3b82f6',
  text: '#f8fafc',
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
};

const ADMIN_TAP_COUNT = 5;

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

export default function LoginScreen() {
  const { login, isLoading, error: authError } = useAuth();
  const [localError, setLocalError] = useState('');
  const [focusInput, setFocusInput] = useState(null);
  
  const [pinVisible, setPinVisible] = useState(false);

  const [adminTapCount, setAdminTapCount] = useState(0);
  const [adminAccessVisible, setAdminAccessVisible] = useState(false);
  const tapTimerRef = useRef(null);

  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isGeneratingOtp, setIsGeneratingOtp] = useState(false);

  const [employeeIdInput, setEmployeeIdInput] = useState('');
  const [pinInput, setPinInput] = useState('');

  const btnScale = useRef(new Animated.Value(1)).current;

  const handleTitleTap = () => {
    const newCount = adminTapCount + 1;
    setAdminTapCount(newCount);
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => setAdminTapCount(0), 3000);

    if (newCount >= ADMIN_TAP_COUNT) {
      setAdminTapCount(0);
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      setAdminAccessVisible(true);
    }
  };

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

  const handleWorkerLogin = async () => {
    setLocalError('');
    const employeeId = employeeIdInput.trim().replace(/\s+/g, '').toUpperCase();
    const pin = pinInput.trim();

    if (!employeeId || !pin) {
      setLocalError('Please enter your name/ID and PIN.');
      return;
    }
    await login(employeeId, pin);
  };

  const handlePressIn = () => {
    Animated.spring(btnScale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(btnScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  };

  const displayError = localError || authError;

  return (
    <SafeAreaView style={styles.safeArea}>
      <TechnicalGrid />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleTitleTap}
            style={styles.header}
          >
            <Image 
              source={require('../../assets/splash-icon.png')} 
              style={styles.logo}
            />
          </TouchableOpacity>

          <View style={styles.card}>
            {/* Glowing Corner Accents */}
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />

            {adminAccessVisible ? (
              // ── ADMIN MODE ──
              <View>
                <View style={styles.adminHeader}>
                  <Text style={styles.adminTitle}>Admin Portal</Text>
                  <Text style={styles.adminSubtitle}>Secure infrastructure access</Text>
                </View>

                {!otpSent ? (
                  <View style={styles.otpStep1}>
                    <Text style={styles.otpHint}>
                      Authenticate to receive a one-time login code via email.
                    </Text>
                    <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                      <Pressable
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        onPress={handleGenerateOtp}
                        disabled={isGeneratingOtp}
                        style={[styles.submitButton, isGeneratingOtp && styles.btnDisabled]}
                      >
                        <View style={styles.btnHighlight} />
                        <Text style={styles.submitButtonText}>
                          {isGeneratingOtp ? 'SENDING...' : 'GENERATE OTP'}
                        </Text>
                      </Pressable>
                    </Animated.View>
                  </View>
                ) : (
                  <View>
                    <View style={styles.successBanner}>
                      <Text style={{ color: COLORS.success, fontSize: 16 }}>✓</Text>
                      <Text style={styles.successBannerText}>
                        OTP sent to admin email.
                      </Text>
                    </View>

                    <Text style={styles.label}>AUTHORIZATION CODE</Text>
                    <View style={[styles.inputContainer, focusInput === 'otp' && styles.inputFocused]}>
                      <View style={styles.inputIcon}>
                        <Text style={{ color: COLORS.textSecondary, fontSize: 16 }}>🔑</Text>
                      </View>
                      <TextInput
                        style={[styles.input, { letterSpacing: 4 }]}
                        value={otpValue}
                        onChangeText={setOtpValue}
                        placeholder="Enter OTP from email"
                        placeholderTextColor={COLORS.textMuted}
                        secureTextEntry={!pinVisible}
                        maxLength={10}
                        editable={!isLoading}
                        onFocus={() => setFocusInput('otp')}
                        onBlur={() => setFocusInput(null)}
                      />
                      <TouchableOpacity onPress={() => setPinVisible(!pinVisible)} style={styles.eyeIcon}>
                        <Text style={{ color: COLORS.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1 }}>{pinVisible ? "HIDE" : "SHOW"}</Text>
                      </TouchableOpacity>
                    </View>

                    <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                      <Pressable
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        onPress={handleAdminLogin}
                        disabled={!otpValue.trim() || isLoading}
                        style={[styles.submitButton, (!otpValue.trim() || isLoading) && styles.btnDisabled]}
                      >
                        <View style={styles.btnHighlight} />
                        <Text style={styles.submitButtonText}>
                          {isLoading ? 'VERIFYING...' : 'LOGIN'}
                        </Text>
                      </Pressable>
                    </Animated.View>

                    <TouchableOpacity
                      style={styles.resendBtn}
                      onPress={() => { setOtpSent(false); setOtpValue(''); setLocalError(''); }}
                    >
                      <Text style={styles.resendBtnText}>Request new OTP</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              // ── WORKER MODE ──
              <View>
                <Text style={styles.label}>FULL NAME OR EMPLOYEE ID</Text>
                <View style={[styles.inputContainer, focusInput === 'name' && styles.inputFocused]}>
                  <View style={styles.inputIcon}>
                    <Text style={{ color: COLORS.textSecondary, fontSize: 16 }}>👤</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={employeeIdInput}
                    onChangeText={setEmployeeIdInput}
                    placeholder="Name or ID"
                    placeholderTextColor={COLORS.textMuted}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    autoComplete="off"
                    editable={!isLoading}
                    onFocus={() => setFocusInput('name')}
                    onBlur={() => setFocusInput(null)}
                  />
                </View>
                <Text style={styles.hint}>e.g. JOHN MATHEW or E1001</Text>

                <Text style={styles.label}>PIN</Text>
                <View style={[styles.inputContainer, focusInput === 'pin' && styles.inputFocused]}>
                  <View style={styles.inputIcon}>
                    <Text style={{ color: COLORS.textSecondary, fontSize: 16 }}>🔒</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={pinInput}
                    onChangeText={setPinInput}
                    placeholder="Enter your 4-digit PIN"
                    placeholderTextColor={COLORS.textMuted}
                    secureTextEntry={!pinVisible}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!isLoading}
                    onFocus={() => setFocusInput('pin')}
                    onBlur={() => setFocusInput(null)}
                  />
                      <TouchableOpacity onPress={() => setPinVisible(!pinVisible)} style={styles.eyeIcon}>
                        <Text style={{ color: COLORS.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1 }}>{pinVisible ? "HIDE" : "SHOW"}</Text>
                      </TouchableOpacity>
                </View>

                <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                  <Pressable
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    onPress={handleWorkerLogin}
                    disabled={isLoading}
                    style={[styles.submitButton, isLoading && styles.btnDisabled]}
                  >
                    <View style={styles.btnHighlight} />
                    <Text style={styles.submitButtonText}>
                      {isLoading ? 'SIGNING IN...' : 'Sign In'}
                    </Text>
                  </Pressable>
                </Animated.View>
              </View>
            )}

            {!!displayError && (
              <View style={styles.errorContainer}>
                <Text style={{ color: COLORS.danger, fontSize: 16 }}>⚠️</Text>
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
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: -40, // Negative margin to overlap the logo's transparent bottom padding
    alignItems: 'center',
    width: '100%',
    zIndex: 1,
  },
  logo: {
    width: '100%',
    maxWidth: 500,
    height: 240,
    resizeMode: 'contain',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 26,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 12,
    zIndex: 2,
  },
  cornerTL: { position: 'absolute', top: -1, left: -1, width: 24, height: 24, borderTopWidth: 2, borderLeftWidth: 2, borderColor: '#60a5fa', borderTopLeftRadius: 26, shadowColor: '#60a5fa', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 8, elevation: 6 },
  cornerTR: { position: 'absolute', top: -1, right: -1, width: 24, height: 24, borderTopWidth: 2, borderRightWidth: 2, borderColor: '#60a5fa', borderTopRightRadius: 26, shadowColor: '#60a5fa', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 8, elevation: 6 },
  cornerBL: { position: 'absolute', bottom: -1, left: -1, width: 24, height: 24, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: '#60a5fa', borderBottomLeftRadius: 26, shadowColor: '#60a5fa', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 8, elevation: 6 },
  cornerBR: { position: 'absolute', bottom: -1, right: -1, width: 24, height: 24, borderBottomWidth: 2, borderRightWidth: 2, borderColor: '#60a5fa', borderBottomRightRadius: 26, shadowColor: '#60a5fa', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 8, elevation: 6 },
  // Admin header
  adminHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  adminTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  adminSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // OTP Step 1
  otpStep1: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  otpHint: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  successBanner: {
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.successBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  successBannerText: {
    color: COLORS.success,
    fontSize: 13,
    fontWeight: '600',
  },
  // Shared
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: -8,
    marginBottom: 20,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
  },
  inputFocused: {
    borderColor: COLORS.borderFocus,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  inputIcon: {
    paddingLeft: 16,
    paddingRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
    color: COLORS.text,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#0ea5e9', // Metallic light blue
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    borderBottomWidth: 3,
    borderBottomColor: '#0369a1', // Darker bottom edge for 3D depth
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  btnHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Glossier top highlight for metallic feel
  },
  btnDisabled: {
    opacity: 0.6,
  },
  resendBtn: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  resendBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  // Error
  errorContainer: {
    marginTop: 16,
    padding: 14,
    backgroundColor: COLORS.dangerBg,
    borderRadius: 12,
    borderColor: COLORS.dangerBorder,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
});
