import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/useAuth';
import { colors, font, radius, spacing } from '../../theme';

export default function LoginScreen({ navigation }) {
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
          <Text style={styles.logo}>Land-in</Text>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your Land-In journey.</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={form.email}
              onChangeText={(v) => setForm((p) => ({ ...p, email: v }))}
              placeholder="your@email.com" placeholderTextColor={colors.gray400}
              autoCapitalize="none" autoCorrect={false} keyboardType="email-address" />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} value={form.password}
              onChangeText={(v) => setForm((p) => ({ ...p, password: v }))}
              placeholder="Enter your password" placeholderTextColor={colors.gray400}
              secureTextEntry />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={[styles.btn, loading && styles.disabled]} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Signing in...' : 'Log In'}</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>New here? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Join')}>
              <Text style={styles.link}>Create account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xxl, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  logo: { fontSize: font.xxl, fontWeight: '900', color: colors.primary, textAlign: 'center', marginBottom: spacing.xl },
  title: { fontSize: font.xxl, fontWeight: '800', color: colors.gray900, marginBottom: spacing.xs },
  subtitle: { fontSize: font.sm, color: colors.gray400, marginBottom: spacing.xl },
  field: { marginBottom: spacing.lg },
  label: { fontSize: font.sm, fontWeight: '600', color: colors.gray600, marginBottom: spacing.xs },
  input: { backgroundColor: colors.gray100, borderRadius: radius.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: font.md, color: colors.gray900 },
  error: { fontSize: font.sm, color: colors.danger, marginBottom: spacing.md },
  btn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: spacing.md + 2, alignItems: 'center', marginBottom: spacing.xl },
  btnText: { color: colors.white, fontSize: font.md, fontWeight: '700' },
  disabled: { opacity: 0.6 },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { fontSize: font.sm, color: colors.gray500 },
  link: { fontSize: font.sm, color: colors.primary, fontWeight: '600' },
});
