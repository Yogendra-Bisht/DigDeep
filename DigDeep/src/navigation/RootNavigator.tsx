// ============================================================
// DigDeep — Root Navigator
// ============================================================
// Decides: show Onboarding OR Main app based on profile state.
// Second launch skips onboarding entirely (FR1.3).
// ============================================================

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

import { useAppStore } from '../store/useAppStore';
import { initializeDatabase, seedMockArchaeologyPack } from '../storage';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import MainNavigator from './MainNavigator';
import { COLORS } from '../theme';
import type { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isHydrated, profile, hydrateFromStorage } = useAppStore();

  useEffect(() => {
    async function bootstrap() {
      await initializeDatabase();
      seedMockArchaeologyPack();  // sync in v2 file API
      hydrateFromStorage();
    }
    bootstrap();
  }, []);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  const isOnboarded = profile?.onboardingComplete === true;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {isOnboarded ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Onboarding">
            {(props) => (
              <OnboardingScreen
                {...props}
                onComplete={() => {
                  // Re-hydrate so navigator switches to Main
                  hydrateFromStorage();
                }}
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
