import {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StatusBar} from 'expo-status-bar';
import HomeTabsScreen from './src/screens/HomeTabsScreen';
import LoginScreen from './src/screens/LoginScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import SplashScreen from './src/screens/SplashScreen';
import './global.css';

type Screen = 'splash' | 'onboarding' | 'login' | 'homeTabs';
const AUTH_KEY = 'mc_logged_in';
const ONBOARDING_KEY = 'mc_seen_onboarding';

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      const [authValue, onboardingValue] = await Promise.all([
        AsyncStorage.getItem(AUTH_KEY),
        AsyncStorage.getItem(ONBOARDING_KEY),
      ]);

      const nextScreen: Screen =
        authValue === 'true'
          ? 'homeTabs'
          : onboardingValue === 'true'
            ? 'login'
            : 'onboarding';

      setTimeout(() => {
        if (isMounted) {
          setScreen(nextScreen);
        }
      }, 1000);
    };

    bootstrap();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleGetStarted = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setScreen('login');
  };

  const handleLogin = async () => {
    await AsyncStorage.setItem(AUTH_KEY, 'true');
    setScreen('homeTabs');
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    setScreen('login');
  };

  return (
    <>
      <StatusBar style={screen === 'splash' ? 'light' : 'dark'} />
      {screen === 'splash' && <SplashScreen />}
      {screen === 'onboarding' && <OnboardingScreen onGetStarted={handleGetStarted} />}
      {screen === 'login' && <LoginScreen onLogin={handleLogin} />}
      {screen === 'homeTabs' && <HomeTabsScreen onLogout={handleLogout} />}
    </>
  );
}
