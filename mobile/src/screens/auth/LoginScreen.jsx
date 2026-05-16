import React, { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/useAuth';
import { colors, radius } from '../../theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      setError(err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            {/* 로고 다이아몬드 - 웹과 동일 */}
            <View style={styles.logo} />

            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your Land-In journey.</Text>

            {/* 이메일 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  placeholderTextColor="#bbb"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* 비밀번호 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#bbb"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* 옵션 행 */}
            <View style={styles.formOptions}>
              <TouchableOpacity style={styles.checkRow} onPress={() => setRemember(!remember)}>
                <View style={[styles.checkbox, remember && styles.checkboxChecked]}>
                  {remember && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkLabel}>Keep me signed in</Text>
              </TouchableOpacity>
              <Text style={styles.forgotPw}>Forgot password?</Text>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* 로그인 버튼 */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.submitBtnText}>{loading ? 'Signing in...' : 'Log In'}</Text>
            </TouchableOpacity>

            {/* 구분선 */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* 소셜 로그인 */}
            <View style={styles.socialGroup}>
              <TouchableOpacity style={styles.socialBtn}>
                <Text style={styles.socialBtnText}>Continue with Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Text style={styles.socialBtnText}>Continue with Apple</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialBtn, styles.kakaoBtn]}>
                <Text style={styles.socialBtnText}>Continue with Kakao</Text>
              </TouchableOpacity>
            </View>

            {/* 하단 링크 */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>New here? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Join')}>
                <Text style={styles.linkText}>Create account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fcfcfc' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingVertical: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 32,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 40,
    elevation: 4,
    alignItems: 'center',
  },
  logo: {
    width: 40, height: 40,
    backgroundColor: colors.primary,
    borderRadius: 12,
    transform: [{ rotate: '45deg' }],
    marginBottom: 24,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#111', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 32, textAlign: 'center', lineHeight: 20 },
  inputGroup: { width: '100%', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 8 },
  inputWrapper: { borderRadius: 12, overflow: 'hidden' },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111',
    width: '100%',
  },
  formOptions: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', marginTop: 8, marginBottom: 4,
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 18, height: 18, borderRadius: 4,
    borderWidth: 1.5, borderColor: '#ccc',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  checkLabel: { fontSize: 13, color: '#666' },
  forgotPw: { fontSize: 13, color: '#888' },
  errorText: {
    width: '100%', color: '#d64545', fontSize: 13,
    marginTop: 12, marginBottom: 4, textAlign: 'left',
  },
  submitBtn: {
    width: '100%', height: 56, backgroundColor: colors.primary,
    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    marginTop: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 6,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', width: '100%', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#eee' },
  dividerText: { fontSize: 13, color: '#bbb', marginHorizontal: 10 },
  socialGroup: { width: '100%', gap: 12 },
  socialBtn: {
    width: '100%', height: 50, borderRadius: 12,
    borderWidth: 1, borderColor: '#eee', backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  kakaoBtn: { backgroundColor: '#fee500', borderWidth: 0 },
  socialBtnText: { fontSize: 14, fontWeight: '500', color: '#111' },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: 24 },
  footerText: { fontSize: 14, color: '#666' },
  linkText: { fontSize: 14, fontWeight: '600', color: colors.primary },
});
