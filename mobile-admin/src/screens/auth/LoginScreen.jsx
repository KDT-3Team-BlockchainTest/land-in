import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/AuthProvider';
import { colors, radius, typography } from '../../theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) { Alert.alert('입력 오류', '이메일과 비밀번호를 입력하세요.'); return; }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      Alert.alert('로그인 실패', err.message || '이메일 또는 비밀번호를 확인하세요.');
    } finally { setLoading(false); }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>Land In</Text>
          <Text style={styles.badge}>Admin Console</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>이메일</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="admin@landin.com" placeholderTextColor={colors.gray400} keyboardType="email-address" autoCapitalize="none" />
          <Text style={[styles.label, { marginTop: 14 }]}>비밀번호</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="비밀번호" placeholderTextColor={colors.gray400} secureTextEntry />
          <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            <Text style={styles.btnText}>{loading ? '로그인 중...' : '관리자 로그인'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  header: { alignItems: 'center', marginBottom: 48 },
  logo: { fontSize: 32, fontWeight: '900', color: colors.primary },
  badge: { marginTop: 6, fontSize: 13, fontWeight: '700', color: colors.gray500, backgroundColor: colors.gray100, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100 },
  form: {},
  label: { fontSize: 12, fontWeight: '600', color: colors.gray500, marginBottom: 6 },
  input: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.gray300, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: colors.gray900, marginBottom: 4 },
  btn: { marginTop: 24, backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 16, alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
