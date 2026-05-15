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

export default function JoinScreen({ navigation }) {
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!email.trim() || !displayName.trim() || !password) {
      Alert.alert('입력 오류', '모든 항목을 입력해주세요.');
      return;
    }
    if (password !== passwordConfirm) {
      Alert.alert('입력 오류', '비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    try {
      await signup(email.trim(), password, displayName.trim());
    } catch (err) {
      Alert.alert('회원가입 실패', err.message || '다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← 뒤로</Text>
          </TouchableOpacity>

          <Text style={styles.title}>회원가입</Text>

          <View style={styles.form}>
            {[
              { label: '이메일', value: email, onChange: setEmail, placeholder: 'example@email.com', keyboard: 'email-address', secure: false },
              { label: '닉네임', value: displayName, onChange: setDisplayName, placeholder: '사용할 닉네임', keyboard: 'default', secure: false },
              { label: '비밀번호', value: password, onChange: setPassword, placeholder: '8자 이상', keyboard: 'default', secure: true },
              { label: '비밀번호 확인', value: passwordConfirm, onChange: setPasswordConfirm, placeholder: '비밀번호 재입력', keyboard: 'default', secure: true },
            ].map(({ label, value, onChange, placeholder, keyboard, secure }) => (
              <View key={label}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  placeholder={placeholder}
                  placeholderTextColor={colors.gray400}
                  keyboardType={keyboard}
                  autoCapitalize="none"
                  secureTextEntry={secure}
                />
              </View>
            ))}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{loading ? '가입 중...' : '가입하기'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 24 },
  back: { marginBottom: 24 },
  backText: { ...typography.body, color: colors.gray600 },
  title: { ...typography.h1, marginBottom: 32 },
  form: { gap: 8 },
  label: { ...typography.label, marginBottom: 4, marginTop: 12 },
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
    marginTop: 28,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
