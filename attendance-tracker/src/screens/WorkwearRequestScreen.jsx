import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Api } from '../api/api';
import PoweredBy from '../components/PoweredBy';

const CATALOG = {
  shoes: {
    types: ['Welder Shoes', 'BHP Shoes'],
    sizes: {
      'Welder Shoes': ['40','41','42','43','44','45','46'],
      'BHP Shoes': ['38','39','40','41','42','43','44','45','46']
    }
  },
  helmet: {
    types: ['Safety Helmet', 'Welding Helmet'],
    subtypes: {
      'Safety Helmet': [],
      'Welding Helmet': ['Automatic', 'Basic']
    }
  },
  dress: {
    types: ['Normal', 'Welding Clothes', 'Longsleeve'],
    sizes: {
      'Normal': [
        'SA','SB','SC',
        'MA','MB','MC',
        'LA','LB','LC',
        'XLa','XLb','XLc',
        'XXLa','XXLb'
      ],
      'Welding Clothes': [
        'SA','SB','SC',
        'MA','MB','MC',
        'LA','LB','LC',
        'XLa','XLb','XLc',
        'XXLa','XXLb','LMAX'
      ],
      'Longsleeve': ['S','M','L','XL','XXL','XXXL']
    }
  },
  others: [
    'Welding Sleeve',
    'Welding Apron',
    'Leather Cap Hood',
    'Welding Gloves',
    'Other Gloves',
    'Welding Mask Glass'
  ]
};

export default function WorkwearRequestScreen() {
  const { state } = useAuth();
  const navigate = useNavigate();

  const [selections, setSelections] = useState({
    shoes: { type: null, size: null },
    helmet: { type: null, subtype: null },
    dress: { type: null, size: null },
    others: []
  });
  const [expandedCard, setExpandedCard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isValidSelection = () => {
    const shoesValid = selections.shoes.type && selections.shoes.size;
    const helmetValid = selections.helmet.type && (selections.helmet.type === 'Safety Helmet' || selections.helmet.subtype !== null);
    const dressValid = selections.dress.type && selections.dress.size;
    const othersValid = selections.others.length > 0;
    
    return shoesValid || helmetValid || dressValid || othersValid;
  };

  const buildRequestString = () => {
    const parts = [];
    
    if (selections.shoes.type && selections.shoes.size) {
      parts.push("Shoes-" + selections.shoes.type.replace(/ /g,'-') + "-" + selections.shoes.size);
    }
    
    if (selections.helmet.type) {
      if (selections.helmet.type === 'Safety Helmet') {
        parts.push("Helmet-SafetyHelmet");
      } else if (selections.helmet.subtype) {
        parts.push("Helmet-WeldingHelmet-" + selections.helmet.subtype);
      }
    }
    
    if (selections.dress.type && selections.dress.size) {
      parts.push("Dress-" + selections.dress.type.replace(/ /g,'-') + "-" + selections.dress.size);
    }
    
    if (selections.others.length > 0) {
      parts.push("Others-" + selections.others.map(i => i.replace(/ /g,'-')).join('|'));
    }
    
    return parts.join(", ");
  };

  const handleSubmit = async () => {
    if (!isValidSelection()) {
      setError('Please select at least one complete item');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const requestItems = buildRequestString();
      await Api.submitWorkwearRequest(state.employeeId, requestItems);
      setIsSubmitted(true);
      setTimeout(() => navigate('/'), 2500);
    } catch (err) {
      setError('Failed to submit request. Please try again.');
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '64px', color: 'var(--color-success)', marginBottom: '16px' }}>✓</div>
        <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '8px' }}>Request Submitted!</div>
        <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Your workwear request has been recorded.</div>
      </div>
    );
  }

  const hasAnyValid = isValidSelection();
  
  const chipStyle = (isActive) => ({
    padding: '10px 8px',
    borderRadius: 'var(--radius-sm)',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    minWidth: '44px',
    ...(isActive 
      ? { background: 'var(--color-primary)', color: 'white', border: 'none', boxShadow: '0 2px 8px rgba(37,99,235,0.35)' } 
      : { background: 'var(--bg-surface)', color: 'var(--color-text-secondary)', border: '1px solid var(--border-subtle)' })
  });

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top, #0d1c2d, #051424)', paddingBottom: '140px' }}>
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
          background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginRight: '16px', padding: 0
        }}>
          ← Back
        </button>
        <div style={{ fontSize: '17px', fontWeight: '700', color: 'var(--color-text)' }}>Work Wear Request</div>
      </header>

      <div style={{
        background: 'rgba(37,99,235,0.08)',
        border: '1px solid rgba(37,99,235,0.25)',
        borderRadius: 'var(--radius-md)',
        margin: '16px',
        padding: '14px',
        fontSize: '13px',
        color: 'var(--color-text-secondary)'
      }}>
        Select the items you require. Your previous request will be replaced.
      </div>

      {error && (
        <div style={{ margin: '0 16px 12px', color: 'var(--color-danger)', fontSize: '13px', padding: '10px 14px', background: 'var(--color-danger-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      {/* Shoes Card */}
      <div style={{ background: 'var(--bg-card)', backdropFilter: 'blur(10px)', border: `1px solid var(--border-subtle)`, borderLeft: (selections.shoes.type && selections.shoes.size) ? '3px solid var(--color-primary)' : '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', margin: '0 16px 12px', overflow: 'hidden', transition: 'border-color 0.2s' }}>
        <div onClick={() => setExpandedCard(expandedCard === 'shoes' ? null : 'shoes')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', cursor: 'pointer' }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-text)' }}>👟 Shoes</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: (selections.shoes.type && selections.shoes.size) ? 'var(--color-primary)' : 'var(--color-text-muted)', fontSize: '14px', fontWeight: '600' }}>
              {(selections.shoes.type && selections.shoes.size) ? `${selections.shoes.type} - Size ${selections.shoes.size}` : (selections.shoes.type ? `${selections.shoes.type} - select size` : 'Select')}
            </span>
            <span style={{ transform: expandedCard === 'shoes' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: 'var(--color-text-muted)' }}>▾</span>
          </div>
        </div>
        {expandedCard === 'shoes' && (
          <div style={{ padding: '12px 16px 16px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>TYPE</div>
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px' }}>
              {CATALOG.shoes.types.map(opt => (
                <div key={opt} onClick={() => setSelections(prev => ({ ...prev, shoes: { type: opt, size: null } }))} style={chipStyle(selections.shoes.type === opt)}>
                  {opt}
                </div>
              ))}
            </div>
            {selections.shoes.type && (
              <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '12px', paddingTop: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>SIZE</div>
                <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px' }}>
                  {CATALOG.shoes.sizes[selections.shoes.type].map(opt => (
                    <div key={opt} onClick={() => { setSelections(prev => ({ ...prev, shoes: { ...prev.shoes, size: opt } })); setExpandedCard(null); }} style={chipStyle(selections.shoes.size === opt)}>
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Helmet Card */}
      <div style={{ background: 'var(--bg-card)', backdropFilter: 'blur(10px)', border: `1px solid var(--border-subtle)`, borderLeft: (selections.helmet.type && (selections.helmet.type === 'Safety Helmet' || selections.helmet.subtype)) ? '3px solid var(--color-primary)' : '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', margin: '0 16px 12px', overflow: 'hidden', transition: 'border-color 0.2s' }}>
        <div onClick={() => setExpandedCard(expandedCard === 'helmet' ? null : 'helmet')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', cursor: 'pointer' }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-text)' }}>⛑️ Helmet</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: (selections.helmet.type && (selections.helmet.type === 'Safety Helmet' || selections.helmet.subtype)) ? 'var(--color-primary)' : 'var(--color-text-muted)', fontSize: '14px', fontWeight: '600' }}>
              {selections.helmet.type === 'Safety Helmet' ? 'Safety Helmet' : (selections.helmet.subtype ? `Welding Helmet - ${selections.helmet.subtype}` : (selections.helmet.type ? 'Welding Helmet - select type' : 'Select'))}
            </span>
            <span style={{ transform: expandedCard === 'helmet' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: 'var(--color-text-muted)' }}>▾</span>
          </div>
        </div>
        {expandedCard === 'helmet' && (
          <div style={{ padding: '12px 16px 16px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>TYPE</div>
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px' }}>
              {CATALOG.helmet.types.map(opt => (
                <div key={opt} onClick={() => {
                  setSelections(prev => ({ ...prev, helmet: { type: opt, subtype: null } }));
                  if (opt === 'Safety Helmet') setExpandedCard(null);
                }} style={chipStyle(selections.helmet.type === opt)}>
                  {opt}
                </div>
              ))}
            </div>
            {selections.helmet.type === 'Welding Helmet' && (
              <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '12px', paddingTop: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>WELDING HELMET TYPE</div>
                <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px' }}>
                  {CATALOG.helmet.subtypes['Welding Helmet'].map(opt => (
                    <div key={opt} onClick={() => { setSelections(prev => ({ ...prev, helmet: { ...prev.helmet, subtype: opt } })); setExpandedCard(null); }} style={chipStyle(selections.helmet.subtype === opt)}>
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dress Card */}
      <div style={{ background: 'var(--bg-card)', backdropFilter: 'blur(10px)', border: `1px solid var(--border-subtle)`, borderLeft: (selections.dress.type && selections.dress.size) ? '3px solid var(--color-primary)' : '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', margin: '0 16px 12px', overflow: 'hidden', transition: 'border-color 0.2s' }}>
        <div onClick={() => setExpandedCard(expandedCard === 'dress' ? null : 'dress')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', cursor: 'pointer' }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-text)' }}>👔 Dress</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: (selections.dress.type && selections.dress.size) ? 'var(--color-primary)' : 'var(--color-text-muted)', fontSize: '14px', fontWeight: '600' }}>
              {(selections.dress.type && selections.dress.size) ? `${selections.dress.type} - ${selections.dress.size}` : (selections.dress.type ? `${selections.dress.type} - select size` : 'Select')}
            </span>
            <span style={{ transform: expandedCard === 'dress' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: 'var(--color-text-muted)' }}>▾</span>
          </div>
        </div>
        {expandedCard === 'dress' && (
          <div style={{ padding: '12px 16px 16px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>TYPE</div>
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px' }}>
              {CATALOG.dress.types.map(opt => (
                <div key={opt} onClick={() => setSelections(prev => ({ ...prev, dress: { type: opt, size: null } }))} style={chipStyle(selections.dress.type === opt)}>
                  {opt}
                </div>
              ))}
            </div>
            {selections.dress.type && (
              <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '12px', paddingTop: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>SIZE</div>
                <div style={{ 
                  ...(selections.dress.type === 'Longsleeve' 
                    ? { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px' } 
                    : { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }
                  )
                }}>
                  {CATALOG.dress.sizes[selections.dress.type].map(opt => (
                    <div key={opt} onClick={() => { setSelections(prev => ({ ...prev, dress: { ...prev.dress, size: opt } })); setExpandedCard(null); }} style={chipStyle(selections.dress.size === opt)}>
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Others Card */}
      <div style={{ background: 'var(--bg-card)', backdropFilter: 'blur(10px)', border: `1px solid var(--border-subtle)`, borderLeft: selections.others.length > 0 ? '3px solid var(--color-primary)' : '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', margin: '0 16px 12px', overflow: 'hidden', transition: 'border-color 0.2s' }}>
        <div onClick={() => setExpandedCard(expandedCard === 'others' ? null : 'others')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', cursor: 'pointer' }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-text)' }}>🧤 Others</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: selections.others.length > 0 ? 'var(--color-primary)' : 'var(--color-text-muted)', fontSize: '14px', fontWeight: '600' }}>
              {selections.others.length > 0 ? `${selections.others.length} item(s) selected` : 'Select'}
            </span>
            <span style={{ transform: expandedCard === 'others' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: 'var(--color-text-muted)' }}>▾</span>
          </div>
        </div>
        {expandedCard === 'others' && (
          <div style={{ padding: '12px 16px 16px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px' }}>
              {CATALOG.others.map(opt => (
                <div key={opt} onClick={() => setSelections(prev => ({
                  ...prev,
                  others: prev.others.includes(opt) ? prev.others.filter(i => i !== opt) : [...prev.others, opt]
                }))} style={chipStyle(selections.others.includes(opt))}>
                  {opt}
                </div>
              ))}
            </div>
            <button onClick={() => setExpandedCard(null)} style={{
              width: '100%', marginTop: '16px', padding: '12px', background: 'var(--color-primary)', color: 'white', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer'
            }}>
              Done
            </button>
          </div>
        )}
      </div>

      {hasAnyValid && (
        <div style={{ margin: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Your Request</div>
          {(() => {
            const lines = [];
            if (selections.shoes.type && selections.shoes.size) lines.push(`Shoes — ${selections.shoes.type}, Size ${selections.shoes.size}`);
            if (selections.helmet.type && (selections.helmet.type === 'Safety Helmet' || selections.helmet.subtype)) lines.push(`Helmet — ${selections.helmet.type === 'Safety Helmet' ? 'Safety Helmet' : `Welding Helmet (${selections.helmet.subtype})`}`);
            if (selections.dress.type && selections.dress.size) lines.push(`Dress — ${selections.dress.type}, Size ${selections.dress.size}`);
            if (selections.others.length > 0) lines.push(`Others — ${selections.others.join(', ')}`);
            
            return lines.map((line, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: idx < lines.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '99px', background: 'var(--color-primary)' }}></div>
                <div style={{ fontSize: '14px', color: 'var(--color-text)', fontWeight: '500' }}>{line}</div>
              </div>
            ));
          })()}
        </div>
      )}

      {hasAnyValid && (
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          style={{
            position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 32px)', maxWidth: '448px', padding: '17px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-xl)', fontSize: '16px', fontWeight: '700', cursor: isLoading ? 'not-allowed' : 'pointer', boxShadow: 'var(--shadow-button)', zIndex: 10, opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'Submitting...' : 'Submit Request'}
        </button>
      )}

      <div style={{ marginTop: 'auto', paddingTop: '40px', paddingBottom: '20px' }}>
        <PoweredBy />
      </div>
    </div>
  );
}
