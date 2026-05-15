import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/useAuth';
import GradientActionButton from '../../components/common/GradientActionButton';
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
    } finally { setLoading(false); }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logo}>Land In</Text>
            <Text style={styles.sub}>NFC로 장소를 수집하고{'\n'}특별한 NFT를 받아보세요 ✨</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="example@email.com"
              placeholderTextColor={colors.gray400}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={[styles.label, { marginTop: 16 }]}>비밀번호</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호를 입력하세요"
              placeholderTextColor={colors.gray400}
              secureTextEntry
            />

            <View style={{ marginTop: 28 }}>
              <GradientActionButton label={loading ? '로그인 중...' : '로그인'} onPress={handleLogin} disabled={loading} />
            </View>

            <TouchableOpacity style={styles.joinLink} onPress={() => navigation.navigate('Join')}>
              <Text style={styles.joinText}>
                계정이 없으신가요? <Text style={{ color: colors.primary, fontWeight: '700' }}>회원가입</Text>
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
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },
  header: { alignItems: 'center', marginBottom: 48 },
  logo: { fontSize: 38, fontWeight: '900', color: colors.primary, letterSpacing: -1 },
  sub: { ...typography.body, textAlign: 'center', lineHeight: 22, marginTop: 10, color: colors.gray500 },
  form: {},
  label: { ...typography.label, marginBottom: 6 },
  input: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.gray300, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: colors.gray900 },
  joinLink: { alignItems: 'center', marginTop: 22 },
  joinText: { ...typography.body, color: colors.gray600 },
});
