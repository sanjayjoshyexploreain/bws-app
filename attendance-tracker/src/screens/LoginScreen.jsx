import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Api } from '../api/api';
import PoweredBy from '../components/PoweredBy';

export default function LoginScreen() {
  const { login, isLoading, error: authError } = useAuth();
  const [localError, setLocalError] = useState('');
  const [adminAccessVisible, setAdminAccessVisible] = useState(false);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isGeneratingOtp, setIsGeneratingOtp] = useState(false);

  // Worker State
  const [employeeIdInput, setEmployeeIdInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [focusInput, setFocusInput] = useState(null);

  useEffect(() => {
    const hasAccess = sessionStorage.getItem('adminAccessGranted');
    if (hasAccess === 'true') {
      setAdminAccessVisible(true);
    }
  }, []);



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

  const handleAdminLogin = async (e) => {
    if (e) e.preventDefault();
    if (!otpValue.trim()) return;
    setLocalError('');
    try {
      await login('ADMIN', otpValue.trim());
    } catch (err) {
      setLocalError(
        err.message === 'Invalid credentials' || err.message === 'Invalid PIN'
          ? 'Invalid OTP. Please try again or request a new one.'
          : 'Login failed. Please try again.'
      );
    }
  };

  const handleWorkerSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    // Clean up input: remove ALL spaces so we can do an exact match regardless of spacing typos
    const employeeId = employeeIdInput.trim().replace(/\s+/g, '').toUpperCase();
    const pin = pinInput.trim();

    if (!employeeId || !pin) {
      setLocalError('Please enter your name and PIN.');
      return;
    }

    await login(employeeId, pin);
  };

  let displayError = localError || authError;
  if (displayError) {
    if (displayError.includes('Employee not found')) {
      displayError = "Name or ID not recognised. Please check your spelling.";
    } else if (displayError.includes('Invalid PIN')) {
      displayError = "Incorrect PIN. Please try again.";
    } else if (displayError.includes('Failed to fetch') || displayError.includes('Network Error')) {
      displayError = "Connection failed. Please try again.";
    }
  }

  const getInputStyle = (name) => ({
    width: '100%',
    padding: '13px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${focusInput === name ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text)',
    fontSize: '15px',
    outline: 'none',
    marginBottom: '16px',
    transition: 'border-color 0.2s',
    boxShadow: focusInput === name ? '0 0 0 3px var(--color-primary-glow)' : 'none',
    boxSizing: 'border-box'
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #0d1c2d, #051424)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <img src="/logo.svg" alt="B&W Logo" style={{ width: '140px', height: 'auto', filter: 'drop-shadow(0 0 12px rgba(37,99,235,0.6))' }} />
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--color-text)', marginTop: '12px', letterSpacing: '-0.02em' }}>B&amp;W Attendance Tracker</h1>
        <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>B&amp;W Services</div>
      </div>

      <div style={{
        width: '100%',
        maxWidth: '400px',
        marginTop: '8px',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        boxShadow: 'var(--shadow-card)'
      }}>
        {adminAccessVisible && (
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '18px', color: 'var(--color-text)', margin: '0 0 4px 0' }}>Admin Login</h2>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>Secure portal access</p>
          </div>
        )}

        {adminAccessVisible ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            {!otpSent ? (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--color-text-muted)',
                  marginBottom: '16px',
                  lineHeight: '1.6'
                }}>
                  Click below to receive a one-time login code
                  via email.
                </p>

                <button
                  onClick={handleGenerateOtp}
                  disabled={isGeneratingOtp}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'rgba(37,99,235,0.15)',
                    border: '1px solid rgba(37,99,235,0.4)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-primary)',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: isGeneratingOtp ? 'not-allowed' : 'pointer',
                    opacity: isGeneratingOtp ? 0.7 : 1
                  }}
                >
                  {isGeneratingOtp ? '⏳ Sending...' : '📧 Generate OTP'}
                </button>
              </div>
            ) : (
              <div>
                <div style={{
                  background: 'rgba(16,185,129,0.1)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  color: 'var(--color-success)',
                  textAlign: 'center'
                }}>
                  ✓ OTP sent to your email. Check your inbox.
                </div>

                <label style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '6px',
                  display: 'block',
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase'
                }}>
                  Enter OTP
                </label>
                <input
                  type="password"
                  value={otpValue}
                  onChange={e => setOtpValue(e.target.value)}
                  placeholder="Enter the OTP from your email"
                  maxLength={10}
                  disabled={isLoading}
                  onFocus={() => setFocusInput('otp')}
                  onBlur={() => setFocusInput(null)}
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text)',
                    fontSize: '15px',
                    outline: 'none',
                    marginBottom: '16px',
                    boxSizing: 'border-box',
                    letterSpacing: '0.1em'
                  }}
                />

                <button
                  onClick={handleAdminLogin}
                  disabled={isLoading || !otpValue.trim()}
                  style={{
                    width: '100%',
                    padding: '15px',
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: isLoading || !otpValue.trim()
                      ? 'not-allowed'
                      : 'pointer',
                    opacity: isLoading || !otpValue.trim() ? 0.6 : 1,
                    marginBottom: '12px'
                  }}
                >
                  {isLoading ? 'Verifying...' : 'Login with OTP'}
                </button>

                <button
                  onClick={() => {
                    setOtpSent(false);
                    setOtpValue('');
                    setLocalError('');
                  }}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: '8px'
                  }}
                >
                  Resend OTP
                </button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleWorkerSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '6px', display: 'block', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                FULL NAME OR EMPLOYEE ID
              </label>
              <input
                type="text"
                placeholder="Enter your full name or Employee ID"
                value={employeeIdInput}
                onChange={e => setEmployeeIdInput(e.target.value)}
                autoComplete="off"
                onFocus={() => setFocusInput('employeeId')}
                onBlur={() => setFocusInput(null)}
                style={getInputStyle('employeeId')}
                disabled={isLoading}
              />
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '-12px', marginBottom: '16px' }}>
                e.g. John Mathew or E1001
              </div>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '6px', display: 'block', letterSpacing: '0.03em', textTransform: 'uppercase' }}>PIN</label>
              <input
                type="password"
                placeholder="Enter your PIN"
                maxLength={6}
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                onFocus={() => setFocusInput('pin')}
                onBlur={() => setFocusInput(null)}
                style={getInputStyle('pin')}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '15px',
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '16px',
                fontWeight: '700',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: 'var(--shadow-button)',
                transition: 'opacity 0.2s, transform 0.1s',
                marginTop: '4px',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        {displayError && (
          <div style={{
            color: 'var(--color-danger)',
            fontSize: '13px',
            textAlign: 'center',
            marginTop: '12px',
            padding: '10px',
            background: 'var(--color-danger-bg)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(239,68,68,0.2)'
          }}>
            {displayError}
          </div>
        )}
      </div>

      <div style={{ marginTop: 'auto' }}>
        <PoweredBy />
      </div>
    </div>
  );
}
