import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/useAuth';
import GradientActionButton from '../../components/common/GradientActionButton';
import { colors, radius, typography } from '../../theme';

const FIELDS = [
  { key: 'email',    label: '이메일',      placeholder: 'example@email.com', keyboard: 'email-address', secure: false },
  { key: 'name',     label: '닉네임',      placeholder: '사용할 닉네임',        keyboard: 'default',       secure: false },
  { key: 'pw',       label: '비밀번호',     placeholder: '8자 이상',           keyboard: 'default',       secure: true  },
  { key: 'pwConfirm',label: '비밀번호 확인', placeholder: '비밀번호 재입력',      keyboard: 'default',       secure: true  },
];

export default function JoinScreen({ navigation }) {
  const { signup } = useAuth();
  const [vals, setVals] = useState({ email: '', name: '', pw: '', pwConfirm: '' });
  const [loading, setLoading] = useState(false);

  const set = (k) => (v) => setVals((prev) => ({ ...prev, [k]: v }));

  async function handleSignup() {
    if (!vals.email.trim() || !vals.name.trim() || !vals.pw) {
      Alert.alert('입력 오류', '모든 항목을 입력해주세요.');
      return;
    }
    if (vals.pw !== vals.pwConfirm) {
      Alert.alert('입력 오류', '비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    try {
      await signup(vals.email.trim(), vals.pw, vals.name.trim());
    } catch (err) {
      Alert.alert('회원가입 실패', err.message || '다시 시도해주세요.');
    } finally { setLoading(false); }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.title}>회원가입</Text>

          {FIELDS.map((f) => (
            <View key={f.key} style={{ marginBottom: 14 }}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={styles.input}
                value={vals[f.key]}
                onChangeText={set(f.key)}
                placeholder={f.placeholder}
                placeholderTextColor={colors.gray400}
                keyboardType={f.keyboard}
                autoCapitalize="none"
                secureTextEntry={f.secure}
              />
            </View>
          ))}

          <View style={{ marginTop: 12 }}>
            <GradientActionButton label={loading ? '가입 중...' : '가입하기'} onPress={handleSignup} disabled={loading} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 },
  back: { marginBottom: 24 },
  backText: { ...typography.body, color: colors.gray600 },
  title: { ...typography.h1, marginBottom: 28 },
  label: { ...typography.label, marginBottom: 6 },
  input: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.gray300, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: colors.gray900 },
});
