// ============================================================
// DigDeep — Main Tab Navigator (Post-Onboarding)
// Integrates Atlas Navigator, Logbook, Packs & Settings
// ============================================================

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';

import AtlasNavigator from './AtlasNavigator';
import LogbookNavigator from './LogbookNavigator';
import { COLORS, TYPOGRAPHY } from '../theme';
import type { MainTabParamList } from '../types';

// Placeholder screens for Phase 3 modules
const PlaceholderScreen = ({ label, phase }: { label: string; phase: string }) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{label}</Text>
    <Text style={styles.placeholderSub}>Scheduled for {phase} →</Text>
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
        tabBarIcon: () => {
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
      <Tab.Screen name="Atlas" component={AtlasNavigator} />
      <Tab.Screen name="Logbook" component={LogbookNavigator} />
      <Tab.Screen name="Packs">
        {() => <PlaceholderScreen label="Offline Content Packs & Sync" phase="Phase 4" />}
      </Tab.Screen>
      <Tab.Screen name="Settings">
        {() => <PlaceholderScreen label="Settings & Depth Preferences" phase="Phase 3" />}
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
