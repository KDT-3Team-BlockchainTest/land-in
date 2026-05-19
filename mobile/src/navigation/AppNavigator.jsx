import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../auth/useAuth';
import EventDetailScreen from '../screens/EventDetailScreen';
import LanguageScreen from '../screens/LanguageScreen';
import MyProgressScreen from '../screens/MyProgressScreen';
import NftGalleryScreen from '../screens/NftGalleryScreen';
import WalletConnectScreen from '../screens/WalletConnectScreen';
import { colors } from '../theme';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator();

const HEADER_OPTS = {
  headerStyle: { backgroundColor: colors.surface },
  headerShadowVisible: false,
  headerTintColor: colors.gray900,
  headerBackTitle: '',
};

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen
            name="EventDetail"
            component={EventDetailScreen}
            options={{ headerShown: true, title: '이벤트 상세', ...HEADER_OPTS }}
          />
          <Stack.Screen
            name="NftGallery"
            component={NftGalleryScreen}
            options={{ headerShown: true, title: 'NFT 갤러리', ...HEADER_OPTS }}
          />
          <Stack.Screen
            name="MyProgress"
            component={MyProgressScreen}
            options={{ headerShown: true, title: '내 진행 현황', ...HEADER_OPTS }}
          />
          <Stack.Screen
            name="WalletConnect"
            component={WalletConnectScreen}
            options={{ headerShown: true, title: '지갑 연결', ...HEADER_OPTS }}
          />
          <Stack.Screen
            name="Language"
            component={LanguageScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
