import {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StatusBar} from 'expo-status-bar';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import HomeTabsScreen from './src/screens/HomeTabsScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import SplashScreen from './src/screens/SplashScreen';
import ActivityScreen from './src/screens/ActivityScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import TermsScreen from './src/screens/TermsScreen';
import PrivacyScreen from './src/screens/PrivacyScreen';
import './global.css';

const Stack = createNativeStackNavigator();

const AUTH_KEY = 'mc_logged_in';
const ONBOARDING_KEY = 'mc_seen_onboarding';

export default function App() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const bootstrap = async () => {
      const [authValue, onboardingValue] = await Promise.all([
        AsyncStorage.getItem(AUTH_KEY),
        AsyncStorage.getItem(ONBOARDING_KEY),
      ]);

      const nextScreen =
        authValue === 'true'
          ? 'HomeTabs'
          : onboardingValue === 'true'
            ? 'Login'
            : 'Onboarding';

      setTimeout(() => {
        if (isMounted) {
          setInitialRoute(nextScreen);
        }
      }, 1000);
    };

    bootstrap();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!initialRoute) {
    return (
      <>
        <StatusBar style="light" />
        <SplashScreen />
      </>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{headerShown: false}}>
        <Stack.Screen name="Onboarding">
          {(props) => (
            <OnboardingScreen
              {...props}
              onGetStarted={async () => {
                await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
                props.navigation.replace('Login');
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Login">
           {(props) => (
             <LoginScreen
               {...props}
               route={{
                 ...props.route,
                 params: {
                   onLogin: async () => {
                     await AsyncStorage.setItem(AUTH_KEY, 'true');
                     props.navigation.replace('HomeTabs');
                   }
                 }
               }}
             />
           )}
        </Stack.Screen>
        
        <Stack.Screen name="SignUp" component={SignUpScreen} />

        <Stack.Screen name="HomeTabs">
           {(props) => (
             <HomeTabsScreen
               {...props}
               onLogout={async () => {
                 await AsyncStorage.removeItem(AUTH_KEY);
                 props.navigation.replace('Login');
               }}
             />
           )}
        </Stack.Screen>

        <Stack.Screen name="Activity" component={ActivityScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Terms" component={TermsScreen} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
