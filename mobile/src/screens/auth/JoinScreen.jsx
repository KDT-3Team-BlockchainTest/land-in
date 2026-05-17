import React, { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/useAuth';
import { colors, radius } from '../../theme';

const initialTerms = { service: false, privacy: false, marketing: false };

export default function JoinScreen({ navigation }) {
  const { signup } = useAuth();
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirmPassword: '' });
  const [terms, setTerms] = useState(initialTerms);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const allChecked = Object.values(terms).every(Boolean);

  const setField = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  function toggleTerm(key) {
    if (key === 'all') {
      const next = !allChecked;
      setTerms({ service: next, privacy: next, marketing: next });
    } else {
      setTerms((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  }

  async function handleSignup() {
    setError('');
    const name = form.displayName.trim();
    const email = form.email.trim().toLowerCase();

    if (!name) { setError('Please enter your name.'); return; }
    if (!email) { setError('Please enter your email.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (!terms.service || !terms.privacy) { setError('Please agree to the required terms.'); return; }

    setLoading(true);
    try {
      await signup(email, form.password, name);
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            {/* 로고 다이아몬드 */}
            <View style={styles.logo} />

            <Text style={styles.title}>Join Land-In</Text>
            <Text style={styles.subtitle}>Create your account and start exploring.</Text>

            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={form.displayName}
                onChangeText={setField('displayName')}
                placeholder="Your name"
                placeholderTextColor="#bbb"
                autoCorrect={false}
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={form.email}
                onChangeText={setField('email')}
                placeholder="your@email.com"
                placeholderTextColor="#bbb"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={form.password}
                onChangeText={setField('password')}
                placeholder="At least 8 characters"
                placeholderTextColor="#bbb"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={form.confirmPassword}
                onChangeText={setField('confirmPassword')}
                placeholder="Re-enter your password"
                placeholderTextColor="#bbb"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* 약관 박스 */}
            <View style={styles.termsBox}>
              {/* 전체 동의 */}
              <TouchableOpacity style={[styles.termItem, styles.allAgree]} onPress={() => toggleTerm('all')}>
                <View style={[styles.checkbox, allChecked && styles.checkboxChecked]}>
                  {allChecked && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.allAgreeLabel}>Agree to all</Text>
              </TouchableOpacity>

              <View style={styles.termDivider} />

              {/* 서비스 이용약관 [필수] */}
              <TouchableOpacity style={styles.termItem} onPress={() => toggleTerm('service')}>
                <View style={[styles.checkbox, terms.service && styles.checkboxChecked]}>
                  {terms.service && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.termLabel}>
                  <Text style={styles.termRequired}>[Required] </Text>
                  Terms of Service
                </Text>
                <Text style={styles.viewLink}>View</Text>
              </TouchableOpacity>

              {/* 개인정보처리방침 [필수] */}
              <TouchableOpacity style={styles.termItem} onPress={() => toggleTerm('privacy')}>
                <View style={[styles.checkbox, terms.privacy && styles.checkboxChecked]}>
                  {terms.privacy && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.termLabel}>
                  <Text style={styles.termRequired}>[Required] </Text>
                  Privacy Policy
                </Text>
                <Text style={styles.viewLink}>View</Text>
              </TouchableOpacity>

              {/* 마케팅 [선택] */}
              <TouchableOpacity style={[styles.termItem, { marginBottom: 0 }]} onPress={() => toggleTerm('marketing')}>
                <View style={[styles.checkbox, terms.marketing && styles.checkboxChecked]}>
                  {terms.marketing && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.termLabel}>
                  <Text style={styles.termOptional}>[Optional] </Text>
                  Marketing Updates
                </Text>
                <Text style={styles.viewLink}>View</Text>
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* 가입 버튼 */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.submitBtnText}>{loading ? 'Creating account...' : 'Sign Up'}</Text>
            </TouchableOpacity>

            {/* 하단 링크 */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Log In</Text>
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
  termsBox: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  termItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  allAgree: { marginBottom: 15 },
  allAgreeLabel: { fontSize: 14, fontWeight: '700', color: '#111', marginLeft: 10 },
  termDivider: { height: 1, backgroundColor: '#eee', marginBottom: 15 },
  termLabel: { flex: 1, fontSize: 13, color: '#444', marginLeft: 10 },
  termRequired: { color: colors.primary },
  termOptional: { color: '#999' },
  viewLink: { fontSize: 12, color: '#999', textDecorationLine: 'underline' },
  checkbox: {
    width: 18, height: 18, borderRadius: 4,
    borderWidth: 1.5, borderColor: '#ccc',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark: { color: '#fff', fontSize: 11, fontWeight: '700' },
  errorText: {
    width: '100%', color: '#d64545', fontSize: 13,
    marginTop: 16, marginBottom: 4, textAlign: 'left',
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
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: 24 },
  footerText: { fontSize: 14, color: '#666' },
  linkText: { fontSize: 14, fontWeight: '600', color: colors.primary },
});
