import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../auth/AuthProvider';
import LoginScreen from '../screens/auth/LoginScreen';
import EventListScreen from '../screens/events/EventListScreen';
import EventEditorScreen from '../screens/events/EventEditorScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

const HEADER = {
  headerStyle: { backgroundColor: colors.surface },
  headerShadowVisible: false,
  headerTintColor: colors.gray900,
  headerBackTitle: '',
};

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={HEADER}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="EventList" component={EventListScreen} options={{ title: '이벤트 관리' }} />
            <Stack.Screen name="EventEditor" component={EventEditorScreen} options={({ route }) => ({ title: route.params?.eventId ? '이벤트 수정' : '이벤트 생성' })} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
