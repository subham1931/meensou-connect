import { useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { StatusBar } from "expo-status-bar"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import HomeTabsScreen from "./src/screens/HomeTabsScreen"
import LoginScreen from "./src/screens/LoginScreen"
import SignUpScreen from "./src/screens/SignUpScreen"
import OnboardingScreen from "./src/screens/OnboardingScreen"
import SplashScreen from "./src/screens/SplashScreen"
import ActivityScreen from "./src/screens/ActivityScreen"
import ProfileDetailsScreen from "./src/screens/ProfileDetailsScreen"
import SettingsScreen from "./src/screens/SettingsScreen"
import TermsScreen from "./src/screens/TermsScreen"
import PrivacyScreen from "./src/screens/PrivacyScreen"
import { getCurrentEmployeeSession, signInEmployee, signOutEmployee, type EmployeeProfile } from "./src/services/mobileAuth"
import "./global.css"

const Stack = createNativeStackNavigator()

const ONBOARDING_KEY = "mc_seen_onboarding"

export default function App() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null)
  const [employeeProfile, setEmployeeProfile] = useState<EmployeeProfile | null>(null)

  useEffect(() => {
    let isMounted = true
    const bootstrap = async () => {
      try {
        const [auth, onboardingValue] = await Promise.all([
          getCurrentEmployeeSession(),
          AsyncStorage.getItem(ONBOARDING_KEY),
        ])
        if (!isMounted) return

        setEmployeeProfile(auth?.employee || null)
        const nextScreen = auth?.employee
          ? "HomeTabs"
          : onboardingValue === "true"
            ? "Login"
            : "Onboarding"
        setTimeout(() => {
          if (isMounted) setInitialRoute(nextScreen)
        }, 1000)
      } catch {
        if (!isMounted) return
        const onboardingValue = await AsyncStorage.getItem(ONBOARDING_KEY)
        const nextScreen = onboardingValue === "true" ? "Login" : "Onboarding"
        setTimeout(() => {
          if (isMounted) setInitialRoute(nextScreen)
        }, 1000)
      }
    }

    bootstrap()
    return () => {
      isMounted = false
    }
  }, [])

  if (!initialRoute) {
    return (
      <>
        <StatusBar style="light" />
        <SplashScreen />
      </>
    )
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding">
          {(props) => (
            <OnboardingScreen
              {...props}
              onGetStarted={async () => {
                await AsyncStorage.setItem(ONBOARDING_KEY, "true")
                props.navigation.replace("Login")
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Login">
          {(props) => (
            <LoginScreen
              {...props}
              onLogin={async (identifier, password) => {
                const auth = await signInEmployee(identifier, password)
                setEmployeeProfile(auth.employee || null)
                props.navigation.replace("HomeTabs")
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="SignUp" component={SignUpScreen} />

        <Stack.Screen name="HomeTabs">
          {(props) => (
            <HomeTabsScreen
              {...props}
              employeeProfile={employeeProfile}
              onLogout={async () => {
                await signOutEmployee()
                setEmployeeProfile(null)
                props.navigation.replace("Login")
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Activity" component={ActivityScreen} />
        <Stack.Screen name="ProfileDetails">
          {(props) => (
            <ProfileDetailsScreen
              {...props}
              employeeProfile={employeeProfile}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Terms" component={TermsScreen} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
