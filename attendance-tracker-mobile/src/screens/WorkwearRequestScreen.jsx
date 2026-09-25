import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, ActivityIndicator, Alert, StatusBar, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Api } from '../api/api';

const COLORS = {
  bg: '#051424',
  surface: 'rgba(255,255,255,0.07)',
  border: 'rgba(255,255,255,0.10)',
  borderActive: 'rgba(37,99,235,0.5)',
  text: '#f1f5f9',
  textMuted: '#64748b',
  textSecondary: '#94a3b8',
  primary: '#2563eb',
  primaryDim: 'rgba(37,99,235,0.08)',
  primaryBorder: 'rgba(37,99,235,0.25)',
  success: '#10b981',
  successBg: 'rgba(16,185,129,0.1)',
  danger: '#ef4444',
  dangerBg: 'rgba(239,68,68,0.15)',
  cardBg: 'rgba(255,255,255,0.07)',
};

const CATALOG = {
  shoes: {
    types: ['Welder Shoes', 'BHP Shoes'],
    sizes: {
      'Welder Shoes': ['40','41','42','43','44','45','46'],
      'BHP Shoes':    ['38','39','40','41','42','43','44','45','46'],
    },
  },
  helmet: {
    types: ['Safety Helmet', 'Welding Helmet'],
    subtypes: {
      'Safety Helmet': [],
      'Welding Helmet': ['Automatic', 'Basic'],
    },
  },
  dress: {
    types: ['Normal', 'Welding Clothes', 'Longsleeve'],
    sizes: {
      'Normal':          ['SA','SB','SC','MA','MB','MC','LA','LB','LC','XLa','XLb','XLc','XXLa','XXLb'],
      'Welding Clothes': ['SA','SB','SC','MA','MB','MC','LA','LB','LC','XLa','XLb','XLc','XXLa','XXLb','LMAX'],
      'Longsleeve':      ['S','M','L','XL','XXL','XXXL'],
    },
  },
  others: [
    'Welding Sleeve',
    'Welding Apron',
    'Leather Cap Hood',
    'Welding Gloves',
    'Other Gloves',
    'Welding Mask Glass',
  ],
};

function ChipRow({ items, selected, onSelect }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 2 }}>
        {items.map(item => (
          <TouchableOpacity
            key={item}
            onPress={() => onSelect(item === selected ? null : item)}
            style={[styles.chip, item === selected && styles.chipActive]}
          >
            <Text style={[styles.chipText, item === selected && styles.chipTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

function SectionCard({ emoji, title, isComplete, isExpanded, onToggle, children }) {
  return (
    <View style={[styles.sectionCard, isComplete && styles.sectionCardComplete]}>
      <TouchableOpacity style={styles.sectionHeader} onPress={onToggle} activeOpacity={0.7}>
        <Text style={styles.sectionTitle}>{emoji} {title}</Text>
        <Text style={styles.sectionChevron}>{isExpanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {isExpanded && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
}

export default function WorkwearRequestScreen({ navigation }) {
  const { state } = useAuth();
  const insets = useSafeAreaInsets();

  const [shoes, setShoes] = useState({ type: null, size: null });
  const [helmet, setHelmet] = useState({ type: null, subtype: null });
  const [dress, setDress] = useState({ type: null, size: null });
  const [others, setOthers] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleOther = (item) => {
    setOthers(prev =>
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    );
  };

  const toggle = (key) => setExpanded(prev => (prev === key ? null : key));

  const isValid = () => {
    const shoesOk  = shoes.type && shoes.size;
    const helmetOk = helmet.type && (helmet.type === 'Safety Helmet' || helmet.subtype);
    const dressOk  = dress.type && dress.size;
    return shoesOk || helmetOk || dressOk || others.length > 0;
  };

  const buildRequestString = () => {
    const parts = [];
    if (shoes.type && shoes.size)
      parts.push(`Shoes-${shoes.type.replace(/ /g,'-')}-${shoes.size}`);
    if (helmet.type) {
      if (helmet.type === 'Safety Helmet') parts.push('Helmet-SafetyHelmet');
      else if (helmet.subtype) parts.push(`Helmet-WeldingHelmet-${helmet.subtype}`);
    }
    if (dress.type && dress.size)
      parts.push(`Dress-${dress.type.replace(/ /g,'-')}-${dress.size}`);
    if (others.length > 0)
      parts.push(`Others-${others.map(i => i.replace(/ /g,'-')).join('|')}`);
    return parts.join(', ');
  };

  const handleSubmit = async () => {
    if (!isValid()) {
      setError('Please select at least one complete item.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const requestItems = buildRequestString();
      await Api.submitWorkwearRequest(state.employeeId, requestItems);
      setIsSubmitted(true);
      setTimeout(() => navigation.goBack(), 2500);
    } catch (err) {
      setError('Failed to submit request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 64, marginBottom: 16 }}>✅</Text>
        <Text style={styles.successTitle}>Request Submitted!</Text>
        <Text style={styles.successSubtitle}>Your workwear request has been recorded.</Text>
      </SafeAreaView>
    );
  }

  const shoesComplete  = !!(shoes.type && shoes.size);
  const helmetComplete = !!(helmet.type && (helmet.type === 'Safety Helmet' || helmet.subtype));
  const dressComplete  = !!(dress.type && dress.size);
  const othersComplete = others.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : insets.top + 16 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1} adjustsFontSizeToFit>Work Wear Request</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerText}>
            Select the items you require. Your previous request will be replaced.
          </Text>
        </View>

        {!!error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* ── SHOES ── */}
        <SectionCard
          emoji="👟" title="Shoes"
          isComplete={shoesComplete}
          isExpanded={expanded === 'shoes'}
          onToggle={() => toggle('shoes')}
        >
          <Text style={styles.subLabel}>Type</Text>
          <ChipRow
            items={CATALOG.shoes.types}
            selected={shoes.type}
            onSelect={(v) => setShoes({ type: v, size: null })}
          />
          {shoes.type && (
            <>
              <Text style={styles.subLabel}>Size</Text>
              <ChipRow
                items={CATALOG.shoes.sizes[shoes.type]}
                selected={shoes.size}
                onSelect={(v) => setShoes(s => ({ ...s, size: v }))}
              />
            </>
          )}
        </SectionCard>

        {/* ── HELMET ── */}
        <SectionCard
          emoji="⛑️" title="Helmet"
          isComplete={helmetComplete}
          isExpanded={expanded === 'helmet'}
          onToggle={() => toggle('helmet')}
        >
          <Text style={styles.subLabel}>Type</Text>
          <ChipRow
            items={CATALOG.helmet.types}
            selected={helmet.type}
            onSelect={(v) => setHelmet({ type: v, subtype: null })}
          />
          {helmet.type && CATALOG.helmet.subtypes[helmet.type]?.length > 0 && (
            <>
              <Text style={styles.subLabel}>Subtype</Text>
              <ChipRow
                items={CATALOG.helmet.subtypes[helmet.type]}
                selected={helmet.subtype}
                onSelect={(v) => setHelmet(h => ({ ...h, subtype: v }))}
              />
            </>
          )}
        </SectionCard>

        {/* ── DRESS / CLOTHES ── */}
        <SectionCard
          emoji="🥼" title="Clothes"
          isComplete={dressComplete}
          isExpanded={expanded === 'dress'}
          onToggle={() => toggle('dress')}
        >
          <Text style={styles.subLabel}>Type</Text>
          <ChipRow
            items={CATALOG.dress.types}
            selected={dress.type}
            onSelect={(v) => setDress({ type: v, size: null })}
          />
          {dress.type && (
            <>
              <Text style={styles.subLabel}>Size</Text>
              <ChipRow
                items={CATALOG.dress.sizes[dress.type]}
                selected={dress.size}
                onSelect={(v) => setDress(d => ({ ...d, size: v }))}
              />
            </>
          )}
        </SectionCard>

        {/* ── OTHERS ── */}
        <SectionCard
          emoji="🧤" title="Other Items"
          isComplete={othersComplete}
          isExpanded={expanded === 'others'}
          onToggle={() => toggle('others')}
        >
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {CATALOG.others.map(item => (
              <TouchableOpacity
                key={item}
                onPress={() => toggleOther(item)}
                style={[styles.chip, others.includes(item) && styles.chipActive]}
              >
                <Text style={[styles.chipText, others.includes(item) && styles.chipTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SectionCard>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, (!isValid() || isLoading) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!isValid() || isLoading}
        >
          {isLoading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitBtnText}>Submit Request</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'rgba(5, 20, 36, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  backBtn: { 
    paddingVertical: 4,
  },
  backText: { color: COLORS.primary, fontSize: 16, fontWeight: '600' },
  headerTitle: { 
    fontSize: 21, 
    fontWeight: 'bold', 
    color: COLORS.text, 
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  scrollContent: { padding: 16, paddingBottom: 40 },
  infoBanner: {
    backgroundColor: COLORS.primaryDim,
    borderColor: COLORS.primaryBorder,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  infoBannerText: { color: COLORS.textSecondary, fontSize: 13 },
  errorBanner: {
    backgroundColor: COLORS.dangerBg,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  errorText: { color: COLORS.danger, fontSize: 13 },
  // Section card
  sectionCard: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
  },
  sectionCardComplete: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  sectionChevron: { color: COLORS.textMuted, fontSize: 13 },
  sectionBody: { paddingHorizontal: 16, paddingBottom: 16 },
  subLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  // Chips
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  // Submit
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  // Success
  successTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  successSubtitle: { fontSize: 14, color: COLORS.textMuted },
});
