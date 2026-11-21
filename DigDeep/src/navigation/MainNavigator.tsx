// ============================================================
// DigDeep — Main Tab Navigator (Post-Onboarding)
// ============================================================

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../theme';
import type { MainTabParamList } from '../types';

// Placeholder screens — replaced in Phase 2 & 3
const PlaceholderScreen = ({ label }: { label: string }) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{label}</Text>
    <Text style={styles.placeholderSub}>Coming in Phase 2 →</Text>
  </View>
);

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color }) => {
          const icons: Record<string, string> = {
            Atlas: '🗺️',
            Logbook: '📓',
            Packs: '📦',
            Settings: '⚙️',
          };
          return <Text style={{ fontSize: 20 }}>{icons[route.name]}</Text>;
        },
      })}
    >
      <Tab.Screen name="Atlas">
        {() => <PlaceholderScreen label="Atlas" />}
      </Tab.Screen>
      <Tab.Screen name="Logbook">
        {() => <PlaceholderScreen label="Field Logbook" />}
      </Tab.Screen>
      <Tab.Screen name="Packs">
        {() => <PlaceholderScreen label="Content Packs" />}
      </Tab.Screen>
      <Tab.Screen name="Settings">
        {() => <PlaceholderScreen label="Settings" />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.bgSurface,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    paddingBottom: 8,
    height: 64,
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.weightSemiBold,
  },
  placeholder: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: TYPOGRAPHY.xxl,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.textPrimary,
  },
  placeholderSub: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textSecondary,
  },
});
