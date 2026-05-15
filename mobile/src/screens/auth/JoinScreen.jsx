import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/useAuth';
import { colors, font, radius, spacing } from '../../theme';

function Checkbox({ checked, onPress, label }) {
  return (
    <TouchableOpacity style={styles.checkRow} onPress={onPress}>
      <View style={[styles.checkBox, checked && styles.checkBoxChecked]}>
        {checked && <Text style={styles.checkMark}>✓</Text>}
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function JoinScreen({ navigation }) {
  const { signup } = useAuth();
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirmPassword: '' });
  const [terms, setTerms] = useState({ service: false, privacy: false, marketing: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const allChecked = Object.values(terms).every(Boolean);

  const handleSubmit = async () => {
    setError('');
    const name = form.displayName.trim();
    if (!name) { setError('이름을 입력해주세요.'); return; }
    if (form.password !== form.confirmPassword) { setError('비밀번호가 일치하지 않습니다.'); return; }
    if (!terms.service || !terms.privacy) { setError('필수 약관에 동의해주세요.'); return; }
    setLoading(true);
    try { await signup(form.email.trim().toLowerCase(), form.password, name); }
    catch (err) { setError(err.message || '회원가입에 실패했습니다.'); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Join Land-In</Text>
          <Text style={styles.subtitle}>Create your account and start exploring.</Text>

          {[
            { key: 'displayName', label: '이름', placeholder: '이름을 입력하세요' },
            { key: 'email', label: 'Email', placeholder: 'your@email.com', type: 'email-address' },
            { key: 'password', label: 'Password', placeholder: '8자 이상', secure: true },
            { key: 'confirmPassword', label: 'Confirm Password', placeholder: '비밀번호 재입력', secure: true },
          ].map(({ key, label, placeholder, type, secure }) => (
            <View key={key} style={styles.field}>
              <Text style={styles.label}>{label}</Text>
              <TextInput style={styles.input} value={form[key]}
                onChangeText={(v) => setForm((p) => ({ ...p, [key]: v }))}
                placeholder={placeholder} placeholderTextColor={colors.gray400}
                secureTextEntry={secure} keyboardType={type === 'email-address' ? 'email-address' : 'default'}
                autoCapitalize="none" autoCorrect={false} />
            </View>
          ))}

          <View style={styles.termsBox}>
            <Checkbox checked={allChecked} onPress={() => { const n = !allChecked; setTerms({ service: n, privacy: n, marketing: n }); }} label="전체 동의" />
            <View style={styles.divider} />
            <Checkbox checked={terms.service} onPress={() => setTerms((p) => ({ ...p, service: !p.service }))} label="[필수] 서비스 이용약관" />
            <Checkbox checked={terms.privacy} onPress={() => setTerms((p) => ({ ...p, privacy: !p.privacy }))} label="[필수] 개인정보처리방침" />
            <Checkbox checked={terms.marketing} onPress={() => setTerms((p) => ({ ...p, marketing: !p.marketing }))} label="[선택] 마케팅 수신 동의" />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={[styles.btn, loading && styles.disabled]} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.btnText}>{loading ? '가입 중...' : '가입하기'}</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>이미 계정이 있으신가요? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>로그인</Text>
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
  title: { fontSize: font.xxl, fontWeight: '800', color: colors.gray900, marginBottom: spacing.xs },
  subtitle: { fontSize: font.sm, color: colors.gray400, marginBottom: spacing.xl },
  field: { marginBottom: spacing.lg },
  label: { fontSize: font.sm, fontWeight: '600', color: colors.gray600, marginBottom: spacing.xs },
  input: { backgroundColor: colors.gray100, borderRadius: radius.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: font.md, color: colors.gray900 },
  termsBox: { backgroundColor: colors.gray100, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.lg, gap: spacing.sm },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  checkBox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: colors.gray300, alignItems: 'center', justifyContent: 'center' },
  checkBoxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkMark: { color: colors.white, fontSize: 12, fontWeight: '700' },
  checkLabel: { fontSize: font.sm, color: colors.gray600 },
  divider: { height: 1, backgroundColor: colors.gray300 },
  error: { fontSize: font.sm, color: colors.danger, marginBottom: spacing.md },
  btn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: spacing.md + 2, alignItems: 'center', marginBottom: spacing.xl },
  btnText: { color: colors.white, fontSize: font.md, fontWeight: '700' },
  disabled: { opacity: 0.6 },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { fontSize: font.sm, color: colors.gray500 },
  link: { fontSize: font.sm, color: colors.primary, fontWeight: '600' },
});
