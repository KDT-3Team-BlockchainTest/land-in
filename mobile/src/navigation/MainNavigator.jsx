import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { colors } from '../theme';
import HomeScreen       from '../screens/HomeScreen';
import CollectionScreen from '../screens/CollectionScreen';
import TagScreen        from '../screens/TagScreen';
import MyProgressScreen from '../screens/MyProgressScreen';
import MyPageScreen     from '../screens/MyPageScreen';

const Tab = createBottomTabNavigator();

const ICONS = { '홈':'🏠', '컬렉션':'🗂', '방문인증':'📡', '진행현황':'📊', '마이':'👤' };

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <View style={{ alignItems: 'center', paddingTop: 4 }}>
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>
              {ICONS[route.name] ?? '·'}
            </Text>
          </View>
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.gray300,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 12,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="홈"       component={HomeScreen}       />
      <Tab.Screen name="컬렉션"   component={CollectionScreen} />
      <Tab.Screen name="방문인증" component={TagScreen}        />
      <Tab.Screen name="진행현황" component={MyProgressScreen} />
      <Tab.Screen name="마이"     component={MyPageScreen}     />
    </Tab.Navigator>
  );
}
