import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CollectionScreen from '../screens/CollectionScreen';
import HomeScreen from '../screens/HomeScreen';
import MyPageScreen from '../screens/MyPageScreen';
import RewardsScreen from '../screens/RewardsScreen';
import TagScreen from '../screens/TagScreen';
import { useLanguage } from '../contexts/useLanguage';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: 'home',
  Collection: 'albums',
  Tag: null,
  Rewards: 'gift',
  MyPage: 'person',
};

function CustomTabBar({ state, descriptors, navigation }) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const barHeight = 56 + insets.bottom;

  return (
    <View>
      {/* 플로팅 맵 버튼 (웹 bottom-nav__map-button 동일) */}
      <TouchableOpacity
        style={[styles.mapButton, { bottom: barHeight + 14 }]}
        onPress={() => navigation.navigate('MyProgress')}
        activeOpacity={0.85}
      >
        <Ionicons name="map-outline" size={20} color="#374151" />
      </TouchableOpacity>

      {/* 탭바 */}
      <View style={[styles.tabBar, { height: barHeight, paddingBottom: insets.bottom }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const tabLabels = {
            Home: t('nav.home'),
            Collection: t('nav.collection'),
            Tag: t('nav.tag'),
            Rewards: t('nav.reward'),
            MyPage: t('nav.mypage'),
          };
          const label = tabLabels[route.name] ?? route.name;
          const icon = TAB_ICONS[route.name];

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          if (route.name === 'Tag') {
            return (
              <TouchableOpacity key={route.name} style={styles.fabItem} onPress={onPress} activeOpacity={0.85}>
                <View style={styles.fab}>
                  <Ionicons name="scan" size={26} color="#fff" />
                </View>
                <Text style={styles.fabLabel}>{label}</Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity key={route.name} style={styles.tabItem} onPress={onPress} activeOpacity={0.7}>
              <Ionicons
                name={isFocused ? icon : `${icon}-outline`}
                size={20}
                color={isFocused ? colors.primary : colors.gray400}
              />
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const SCREENS = [
  { name: 'Home',       component: HomeScreen },
  { name: 'Collection', component: CollectionScreen },
  { name: 'Tag',        component: TagScreen },
  { name: 'Rewards',    component: RewardsScreen },
  { name: 'MyPage',     component: MyPageScreen },
];

export default function MainNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {SCREENS.map((s) => (
        <Tab.Screen key={s.name} name={s.name} component={s.component} />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
    paddingHorizontal: 8,
    paddingTop: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  tabLabel: {
    fontSize: 11,
    color: colors.gray400,
    lineHeight: 14,
  },
  tabLabelActive: {
    color: colors.primary,
  },
  fabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    marginTop: -24,
    paddingBottom: 4,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  fabLabel: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    lineHeight: 14,
  },
  mapButton: {
    position: 'absolute',
    right: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
    zIndex: 10,
  },
});
