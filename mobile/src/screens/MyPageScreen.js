import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { colors, radius, shadow, typography } from '../theme';

function MenuItem({ icon, label, onPress, danger }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
        <Ionicons name={icon} size={20} color={danger ? colors.primary : colors.gray600} />
      </View>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.gray300} />
    </TouchableOpacity>
  );
}

export default function MyPageScreen() {
  const { user, logout } = useAuth();

  function handleLogout() {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '로그아웃', style: 'destructive', onPress: logout },
      ]
    );
  }

  const initial = (user?.displayName || user?.email || '?')[0].toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.displayName}>{user?.displayName || '사용자'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {user?.walletAddress ? (
          <View style={styles.walletCard}>
            <Ionicons name="wallet-outline" size={18} color={colors.violet} />
            <View style={{ flex: 1 }}>
              <Text style={styles.walletLabel}>연결된 지갑</Text>
              <Text style={styles.walletAddress} numberOfLines={1}>
                {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
              </Text>
            </View>
            <View style={styles.walletConnectedDot} />
          </View>
        ) : (
          <View style={styles.walletCardEmpty}>
            <Ionicons name="wallet-outline" size={18} color={colors.gray400} />
            <Text style={styles.walletEmptyText}>지갑이 연결되지 않음</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="person-outline"
              label="프로필 정보"
              onPress={() => {}}
            />
            <MenuItem
              icon="notifications-outline"
              label="알림 설정"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 정보</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="information-circle-outline"
              label="서비스 소개"
              onPress={() => {}}
            />
            <MenuItem
              icon="shield-outline"
              label="개인정보처리방침"
              onPress={() => {}}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color={colors.primary} />
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    ...shadow.card,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: colors.primary },
  displayName: { ...typography.h2 },
  email: { ...typography.caption, marginTop: 4 },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(139,92,246,0.08)',
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 24,
  },
  walletLabel: { fontSize: 11, fontWeight: '600', color: colors.violet, marginBottom: 2 },
  walletAddress: { fontSize: 13, fontWeight: '600', color: colors.gray900 },
  walletConnectedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  walletCardEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.gray100,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 24,
  },
  walletEmptyText: { ...typography.caption, color: colors.gray400 },
  section: { marginBottom: 24 },
  sectionTitle: { ...typography.label, marginBottom: 10, paddingLeft: 4 },
  menuGroup: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadow.card,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDanger: { backgroundColor: colors.primarySoft },
  menuLabel: { flex: 1, ...typography.body, color: colors.gray900 },
  menuLabelDanger: { color: colors.primary },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.md,
    padding: 14,
    marginTop: 8,
  },
  logoutText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
});
