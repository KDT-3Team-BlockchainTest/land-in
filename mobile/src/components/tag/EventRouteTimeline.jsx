import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import PlaceImage from '../common/PlaceImage';
import { colors, radius } from '../../theme';

const STATE_CONFIG = {
  done:    { color: colors.success, icon: 'checkmark-circle', label: '완료' },
  locked:  { color: colors.gray300, icon: 'lock-closed',     label: '잠김' },
  reward:  { color: colors.violet,  icon: 'gift',             label: '리워드' },
};

export default function EventRouteTimeline({ steps = [] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {steps.map((step, i) => {
        const cfg = STATE_CONFIG[step.stepState] || STATE_CONFIG.locked;
        return (
          <View key={step.id ?? i} style={styles.item}>
            <View style={[styles.imageWrap, step.stepState === 'done' && styles.imageWrapDone]}>
              <PlaceImage uri={step.image} style={styles.image} />
              {step.stepState !== 'locked' && (
                <View style={[styles.stateIcon, { backgroundColor: cfg.color }]}>
                  <Ionicons name={cfg.icon} size={12} color="#fff" />
                </View>
              )}
            </View>
            {i < steps.length - 1 && (
              <View style={[styles.connector, step.stepState === 'done' && styles.connectorDone]} />
            )}
            <Text style={styles.stepTitle} numberOfLines={1}>{step.title}</Text>
            {step.nft && (
              <Text style={styles.nftLabel} numberOfLines={1}>{step.nft.name}</Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingBottom: 4, gap: 0 },
  item: { width: 90, alignItems: 'center', marginRight: 8 },
  imageWrap: {
    width: 64, height: 64, borderRadius: radius.md, overflow: 'hidden',
    borderWidth: 2, borderColor: colors.gray200 || colors.gray300,
  },
  imageWrapDone: { borderColor: colors.success },
  image: { width: '100%', height: '100%' },
  stateIcon: {
    position: 'absolute', bottom: 2, right: 2,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  connector: {
    position: 'absolute', top: 31, right: -12,
    width: 12, height: 2, backgroundColor: colors.gray200 || colors.gray300,
  },
  connectorDone: { backgroundColor: colors.success },
  stepTitle: { fontSize: 11, fontWeight: '600', color: colors.gray700 || colors.gray600, marginTop: 6, textAlign: 'center' },
  nftLabel: { fontSize: 10, color: colors.violet, fontWeight: '600', textAlign: 'center', marginTop: 2 },
});
