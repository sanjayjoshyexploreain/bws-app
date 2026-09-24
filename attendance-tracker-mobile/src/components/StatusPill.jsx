import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StatusPill({ status }) {
  const getStyle = () => {
    switch(status?.toLowerCase()) {
      case 'approved': return styles.approved;
      case 'rejected': return styles.rejected;
      case 'pending': return styles.pending;
      default: return styles.default;
    }
  };

  const getTextStyle = () => {
    switch(status?.toLowerCase()) {
      case 'approved': return styles.approvedText;
      case 'rejected': return styles.rejectedText;
      case 'pending': return styles.pendingText;
      default: return styles.defaultText;
    }
  };

  return (
    <View style={[styles.pill, getStyle()]}>
      <Text style={[styles.text, getTextStyle()]}>
        {status || 'Unknown'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  approved: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  approvedText: {
    color: '#10b981',
  },
  rejected: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  rejectedText: {
    color: '#ef4444',
  },
  pending: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  pendingText: {
    color: '#f59e0b',
  },
  default: {
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  defaultText: {
    color: '#94a3b8',
  }
});
