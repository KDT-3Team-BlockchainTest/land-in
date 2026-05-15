import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme';

import LoginScreen from '../screens/auth/LoginScreen';
import JoinScreen from '../screens/auth/JoinScreen';
import HomeScreen from '../screens/HomeScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import CollectionScreen from '../screens/CollectionScreen';
import TagScreen from '../screens/TagScreen';
import RewardsScreen from '../screens/RewardsScreen';
import NftGalleryScreen from '../screens/NftGalleryScreen';
import MyPageScreen from '../screens/MyPageScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.gray100,
          paddingBottom: 4,
          height: 60,
        },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: 'home',
            Collection: 'albums',
            Tag: 'nfc',
            Rewards: 'gift',
            MyPage: 'person-circle',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: '홈' }} />
      <Tab.Screen name="Collection" component={CollectionScreen} options={{ tabBarLabel: '컬렉션' }} />
      <Tab.Screen name="Tag" component={TagScreen} options={{ tabBarLabel: 'NFC 스캔' }} />
      <Tab.Screen name="Rewards" component={RewardsScreen} options={{ tabBarLabel: '리워드' }} />
      <Tab.Screen name="MyPage" component={MyPageScreen} options={{ tabBarLabel: '마이' }} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Join" component={JoinScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ headerShown: true, title: '이벤트 상세', headerBackTitle: '' }}
      />
      <Stack.Screen
        name="NftGallery"
        component={NftGalleryScreen}
        options={{ headerShown: true, title: 'NFT 갤러리', headerBackTitle: '' }}
      />
    </Stack.Navigator>
  );
}

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
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
