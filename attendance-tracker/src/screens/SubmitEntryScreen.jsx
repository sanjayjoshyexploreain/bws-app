import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Api } from '../api/api';
import { warsawDateKey } from '../utils/time';
import PhotoUpload from '../components/PhotoUpload';
import PoweredBy from '../components/PoweredBy';

const HoursPicker = ({ value, onChange }) => {
  const chips = [4, 5, 6, 7, 8, 9, 10];
  
  const handleMinus = () => onChange(Math.max(0.5, Number(value) - 0.5));
  const handlePlus = () => onChange(Math.min(24, Number(value) + 0.5));
  const handleSlider = (e) => onChange(Number(e.target.value));
  
  const sliderPercent = ((Number(value) - 0.5) / 23.5) * 100;
  const sliderBg = 'linear-gradient(to right, #2563eb 0%, #2563eb ' + 
    sliderPercent + '%, rgba(255,255,255,0.12) ' + 
    sliderPercent + '%, rgba(255,255,255,0.12) 100%)';

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: '14px',
      padding: '16px',
      marginBottom: '16px'
    }}>
      <style>{`
        .hours-slider::-webkit-slider-thumb {
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(37,99,235,0.6);
          border: 2px solid white;
        }
        .hours-slider::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(37,99,235,0.6);
          border: 2px solid white;
        }
      `}</style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>HOURS WORKED</div>
        <div style={{ fontSize: '20px', fontWeight: '800', color: '#2563eb' }}>{value}h</div>
      </div>

      <div style={{ display: 'flex', overflowX: 'auto', msOverflowStyle: 'none', scrollbarWidth: 'none', marginBottom: '16px' }}>
        {chips.map(chip => {
          const isActive = value === chip;
          return (
            <button
              key={chip}
              type="button"
              onClick={() => onChange(chip)}
              style={{
                background: isActive ? '#2563eb' : 'rgba(255,255,255,0.07)',
                color: isActive ? 'white' : '#94a3b8',
                border: isActive ? 'none' : '1px solid rgba(255,255,255,0.12)',
                boxShadow: isActive ? '0 2px 8px rgba(37,99,235,0.4)' : 'none',
                padding: '8px 16px',
                borderRadius: '99px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                marginRight: '8px',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s'
              }}
            >
              {chip}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
        <button
          type="button"
          onClick={handleMinus}
          onMouseDown={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          onMouseUp={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '99px',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'white',
            fontSize: '22px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s'
          }}
        >−</button>
        <div style={{ fontSize: '32px', fontWeight: '800', color: 'white', minWidth: '80px', textAlign: 'center' }}>{value}h</div>
        <button
          type="button"
          onClick={handlePlus}
          onMouseDown={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          onMouseUp={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '99px',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'white',
            fontSize: '22px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s'
          }}
        >+</button>
      </div>

      <input
        type="range"
        className="hours-slider"
        min="0.5"
        max="24"
        step="0.5"
        value={Number(value) || 0}
        onChange={handleSlider}
        style={{
          width: '100%',
          height: '6px',
          borderRadius: '3px',
          appearance: 'none',
          outline: 'none',
          background: sliderBg,
          cursor: 'pointer',
          marginTop: '16px',
          marginBottom: '20px'
        }}
      />

      <div>
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Or type manually:</div>
        <input
          type="number"
          min="0.5"
          max="24"
          step="0.5"
          value={value}
          onChange={(e) => {
             const text = e.target.value;
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
          onBlur={() => {
             let val = parseFloat(value);
             if (isNaN(val) || val < 0.5) onChange(0.5);
             else onChange(val);
          }}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: '8px',
            color: 'white',
            padding: '10px 14px',
            fontSize: '15px',
            width: '100%',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>
    </div>
  );
};

export default function SubmitEntryScreen() {
  const { state } = useAuth();
  const navigate = useNavigate();
  
  const today = warsawDateKey(new Date());
  
  const [workDate, setWorkDate] = useState(today);
  const [hoursWorked, setHoursWorked] = useState(8);
  const [comments, setComments] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [entryId, setEntryId] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [focusInput, setFocusInput] = useState(null);
  const [existingDates, setExistingDates] = useState(new Set());

  const minDateObj = new Date();
  minDateObj.setDate(minDateObj.getDate() - 30);
  const minDate = warsawDateKey(minDateObj);

  // Fetch existing entries to detect duplicates
  useEffect(() => {
    const currentMonthKey = today.substring(0, 7);
    Api.getMyEntries(state.employeeId, currentMonthKey)
      .then(res => {
        const entries = Array.isArray(res?.entries) ? res.entries : [];
        const dates = new Set(entries.map(e => e.DateKey || e.WorkDate || '').filter(Boolean));
        setExistingDates(dates);
      })
      .catch(() => {}); // fail silently — duplicate check is best-effort on frontend
  }, [state.employeeId]);

  const isDuplicate = existingDates.has(workDate);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        hoursWorked: Number(hoursWorked),
        comments: comments
      };
      
      const res = await Api.submitEntry(payload);
      console.log('Submit entry response:', JSON.stringify(res));
      const newEntryId = Number(res.entryId || res.id || res.ID || res.itemId);
      setEntryId(newEntryId);
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
    fontFamily: 'inherit'
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #0d1c2d, #051424)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <header style={{
        background: 'rgba(5, 20, 36, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <button onClick={() => navigate(-1)} style={{
          color: 'var(--color-primary)',
          fontSize: '15px',
          fontWeight: '600',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginRight: '15px'
        }}>← Back</button>
        <div style={{ fontSize: '17px', fontWeight: '700', color: 'var(--color-text)', letterSpacing: '0.01em' }}>Submit Attendance</div>
      </header>
      
      <main style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
        {isSubmitted ? (
          <div>
            <div style={{
              background: 'var(--color-success-bg)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              color: 'var(--color-success)',
              textAlign: 'center',
              fontWeight: '600',
              marginBottom: '20px'
            }}>
              Entry saved successfully! Please attach photo proof.
            </div>
            
            {entryId ? (
              <PhotoUpload
                entryId={entryId}
                employeeId={state.employeeId}
                dateKey={workDate}
                onUploadDone={() => navigate('/')}
              />
            ) : (
              <div style={{
                border: '2px dashed rgba(37,99,235,0.4)',
                borderRadius: 'var(--radius-lg)',
                padding: '32px 20px',
                textAlign: 'center',
                background: 'rgba(37,99,235,0.05)',
                color: 'var(--color-text-muted)',
                fontSize: '14px'
              }}>
                Submit entry first, then upload photos
              </div>
            )}
            
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                textDecoration: 'underline',
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'center',
                padding: '12px',
                width: '100%',
                marginTop: '10px'
              }}
            >
              Skip & go to dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '6px', display: 'block', letterSpacing: '0.03em', textTransform: 'uppercase' }}>Work Date</label>
              <input
                type="date"
                value={workDate}
                onChange={e => setWorkDate(e.target.value)}
                onFocus={() => setFocusInput('workDate')}
                onBlur={() => setFocusInput(null)}
                max={today}
                min={minDate}
                required
                disabled={isLoading}
                style={getInputStyle('workDate')}
              />
            </div>
            
            <HoursPicker 
              value={hoursWorked} 
              onChange={(val) => setHoursWorked(val)} 
            />
            
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '6px', display: 'block', letterSpacing: '0.03em', textTransform: 'uppercase' }}>Comments (optional)</label>
              <textarea
                value={comments}
                onChange={e => setComments(e.target.value)}
                onFocus={() => setFocusInput('comments')}
                onBlur={() => setFocusInput(null)}
                placeholder="Describe work completed today..."
                rows="3"
                disabled={isLoading}
                style={{ ...getInputStyle('comments'), resize: 'vertical' }}
              />
            </div>

            {isDuplicate && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(245,158,11,0.12)',
                border: '1px solid rgba(245,158,11,0.35)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                marginTop: '4px',
              }}>
                <span style={{ fontSize: '18px' }}>⚠️</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#f59e0b' }}>Entry already submitted</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>You already have an attendance entry for this date.</div>
                </div>
              </div>
            )}

            {error && (
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
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading || isDuplicate}
              style={{
                width: '100%',
                padding: '15px',
                background: isDuplicate ? 'rgba(255,255,255,0.08)' : 'var(--color-primary)',
                color: isDuplicate ? 'var(--color-text-muted)' : 'white',
                border: isDuplicate ? '1px solid rgba(255,255,255,0.12)' : 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '16px',
                fontWeight: '700',
                cursor: (isLoading || isDuplicate) ? 'not-allowed' : 'pointer',
                boxShadow: isDuplicate ? 'none' : 'var(--shadow-button)',
                transition: 'opacity 0.2s, transform 0.1s',
                marginTop: '4px',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? 'Submitting...' : isDuplicate ? 'Already Submitted Today' : 'Submit Attendance'}
            </button>
          </form>
        )}
      </main>
      
      <div style={{ marginTop: 'auto' }}>
        <PoweredBy />
      </div>
    </div>
  );
}
