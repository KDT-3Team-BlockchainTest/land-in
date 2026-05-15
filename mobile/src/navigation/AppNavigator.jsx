import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/useAuth';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import WalletConnectScreen from '../screens/WalletConnectScreen';
import NftGalleryScreen from '../screens/NftGalleryScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import RewardsScreen from '../screens/RewardsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user } = useAuth();
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen name="WalletConnect" component={WalletConnectScreen}
              options={{ presentation: 'modal' }} />
            <Stack.Screen name="NftGallery" component={NftGalleryScreen}
              options={{ headerShown: true, title: 'NFT 갤러리', headerBackTitle: '' }} />
            <Stack.Screen name="EventDetail" component={EventDetailScreen}
              options={{ headerShown: true, title: '이벤트 상세', headerBackTitle: '' }} />
            <Stack.Screen name="Rewards" component={RewardsScreen}
              options={{ headerShown: true, title: '내 리워드', headerBackTitle: '' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
