import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/useAuth';
import { colors, font, radius, spacing } from '../theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try { await login(form.email.trim().toLowerCase(), form.password); }
    catch (err) { setError(err.message || '로그인에 실패했습니다.'); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.brand}>
            <Text style={styles.brandName}>Land-In</Text>
            <Text style={styles.brandSub}>Partner Admin</Text>
          </View>
          <Text style={styles.title}>관리자 로그인</Text>
          <Text style={styles.subtitle}>제휴사 계정으로 로그인하여 컬렉션과 보상을 관리하세요.</Text>

          <View style={styles.field}>
            <Text style={styles.label}>이메일</Text>
            <TextInput style={styles.input} value={form.email}
              onChangeText={(v) => setForm((p) => ({ ...p, email: v }))}
              autoCapitalize="none" keyboardType="email-address"
              placeholderTextColor={colors.gray400} placeholder="admin@example.com" />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>비밀번호</Text>
            <TextInput style={styles.input} value={form.password}
              onChangeText={(v) => setForm((p) => ({ ...p, password: v }))}
              secureTextEntry placeholderTextColor={colors.gray400} placeholder="••••••••" />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={[styles.btn, loading && styles.disabled]} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.btnText}>{loading ? '로그인 중…' : '로그인'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xxl, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  brand: { alignItems: 'center', marginBottom: spacing.xl },
  brandName: { fontSize: font.xxl, fontWeight: '900', color: colors.primary },
  brandSub: { fontSize: font.xs, color: colors.gray400, marginTop: 2 },
  title: { fontSize: font.xl, fontWeight: '800', color: colors.gray900, marginBottom: spacing.xs },
  subtitle: { fontSize: font.sm, color: colors.gray400, marginBottom: spacing.xl, lineHeight: 20 },
  field: { marginBottom: spacing.lg },
  label: { fontSize: font.sm, fontWeight: '600', color: colors.gray600, marginBottom: spacing.xs },
  input: { backgroundColor: colors.gray100, borderRadius: radius.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: font.md, color: colors.gray900 },
  error: { fontSize: font.sm, color: colors.danger, marginBottom: spacing.md },
  btn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: spacing.md, alignItems: 'center' },
  btnText: { color: colors.white, fontWeight: '700', fontSize: font.md },
  disabled: { opacity: 0.6 },
});
