import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CollectionScreen from '../screens/CollectionScreen';
import HomeScreen from '../screens/HomeScreen';
import MyPageScreen from '../screens/MyPageScreen';
import RewardsScreen from '../screens/RewardsScreen';
import TagScreen from '../screens/TagScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home',       label: '홈',       icon: 'home',           component: HomeScreen },
  { name: 'Collection', label: '컬렉션',   icon: 'albums',         component: CollectionScreen },
  { name: 'Tag',        label: 'NFC 스캔', icon: 'scan-circle',    component: TagScreen },
  { name: 'Rewards',    label: '리워드',   icon: 'gift',           component: RewardsScreen },
  { name: 'MyPage',     label: '마이',     icon: 'person-circle',  component: MyPageScreen },
];

export default function MainNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.gray100,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11 },
        tabBarIcon: ({ color, size, focused }) => {
          const tab = TABS.find((t) => t.name === route.name);
          return (
            <Ionicons
              name={focused ? tab.icon : `${tab.icon}-outline`}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      {TABS.map((t) => (
        <Tab.Screen key={t.name} name={t.name} component={t.component} options={{ tabBarLabel: t.label }} />
      ))}
    </Tab.Navigator>
  );
}
