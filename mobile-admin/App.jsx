import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './src/contexts/AuthProvider';
import { useAuth } from './src/contexts/useAuth';
import LoginScreen     from './src/screens/LoginScreen';
import EventListScreen from './src/screens/EventListScreen';
import EventEditorScreen from './src/screens/EventEditorScreen';

const Stack = createNativeStackNavigator();

function Navigator() {
  const { token } = useAuth();
  return (
    <Stack.Navigator>
      {!token ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="EventList"   component={EventListScreen}   options={{ title: '이벤트 관리' }} />
          <Stack.Screen name="EventEditor" component={EventEditorScreen} options={{ title: '이벤트 편집' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Navigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
