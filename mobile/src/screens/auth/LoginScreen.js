import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { colors, radius, typography } from '../../theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      Alert.alert('로그인 실패', err.message || '이메일 또는 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logo}>Land In</Text>
            <Text style={styles.subtitle}>NFC로 장소를 수집하고{'\n'}특별한 NFT를 받아보세요</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="이메일을 입력하세요"
              placeholderTextColor={colors.gray400}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호를 입력하세요"
              placeholderTextColor={colors.gray400}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{loading ? '로그인 중...' : '로그인'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.joinLink} onPress={() => navigation.navigate('Join')}>
              <Text style={styles.joinLinkText}>
                계정이 없으신가요? <Text style={{ color: colors.primary }}>회원가입</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  header: { alignItems: 'center', marginBottom: 48 },
  logo: { fontSize: 36, fontWeight: '800', color: colors.primary, letterSpacing: -1 },
  subtitle: { marginTop: 12, ...typography.body, textAlign: 'center', lineHeight: 22 },
  form: { gap: 8 },
  label: { ...typography.label, marginBottom: 4, marginTop: 16 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.gray300,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.gray900,
  },
  button: {
    marginTop: 24,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  joinLink: { marginTop: 20, alignItems: 'center' },
  joinLinkText: { ...typography.body, color: colors.gray600 },
});
