// ============================================================
// DigDeep — Onboarding Screen
// ============================================================
// Requirements:
//   • FR1.1 — World selection grid (Archaeology active, rest locked)
//   • FR1.2 — Depth mode toggle (Intuitive Explorer / Deep Dive Researcher)
//   • FR1.3 — Zero sign-up wall (local profile only)
//   • Onboarding completable in < 3 taps
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { useAppStore } from '../../store/useAppStore';
import type { DepthMode, WorldId } from '../../types';
import { COLORS, TYPOGRAPHY } from '../../theme';

const { width } = Dimensions.get('window');

interface WorldOption {
  id: WorldId;
  title: string;
  emoji: string;
  tagline: string;
  active: boolean;
}

const WORLDS: WorldOption[] = [
  { id: 'archaeology', title: 'Archaeology', emoji: '⛏️', tagline: 'Dig into the past', active: true },
  { id: 'cosmos', title: 'Cosmos', emoji: '🌌', tagline: 'Coming soon', active: false },
  { id: 'earthage', title: 'EarthAge', emoji: '🌍', tagline: 'Coming soon', active: false },
  { id: 'quantumworld', title: 'Quantum World', emoji: '⚛️', tagline: 'Coming soon', active: false },
  { id: 'fieldexpeditions', title: 'Field Expeditions', emoji: '🧭', tagline: 'Coming soon', active: false },
];

interface Props {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedWorld, setSelectedWorld] = useState<WorldId>('archaeology');
  const [depthMode, setDepthMode] = useState<DepthMode>('intuitive');
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const toggleOffset = useSharedValue(0);

  const toggleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(toggleOffset.value, { damping: 15 }) }],
  }));

  function handleWorldSelect(world: WorldOption) {
    if (!world.active) return;
    setSelectedWorld(world.id);
    // Auto-advance to step 2 on world tap (1 of 2 taps done)
    setStep(2);
  }

  function handleDepthToggle(mode: DepthMode) {
    setDepthMode(mode);
    toggleOffset.value = mode === 'intuitive' ? 0 : (width / 2 - 48);
  }

  function handleStart() {
    completeOnboarding(selectedWorld, depthMode);
    onComplete();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <Text style={styles.logoText}>DigDeep</Text>
          <Text style={styles.tagline}>One interest. A whole world.</Text>
        </Animated.View>

        {step === 1 && (
          <Animated.View entering={FadeInDown.duration(500).delay(200)}>
            <Text style={styles.sectionLabel}>Choose your world</Text>
            <View style={styles.worldGrid}>
              {WORLDS.map((world) => (
                <TouchableOpacity
                  key={world.id}
                  style={[
                    styles.worldCard,
                    world.active ? styles.worldCardActive : styles.worldCardLocked,
                    selectedWorld === world.id && styles.worldCardSelected,
                  ]}
                  onPress={() => handleWorldSelect(world)}
                  activeOpacity={world.active ? 0.8 : 1}
                >
                  <Text style={styles.worldEmoji}>{world.emoji}</Text>
                  <Text style={[styles.worldTitle, !world.active && styles.textMuted]}>
                    {world.title}
                  </Text>
                  <Text style={[styles.worldTagline, !world.active && styles.textMuted]}>
                    {world.tagline}
                  </Text>
                  {!world.active && (
                    <View style={styles.lockedBadge}>
                      <Text style={styles.lockedText}>Vote</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {step === 2 && (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.depthSection}>
            <Text style={styles.sectionLabel}>How deep do you want to go?</Text>

            {/* Depth Toggle */}
            <View style={styles.toggleContainer}>
              <View style={styles.toggleTrack}>
                <Animated.View style={[styles.toggleThumb, toggleStyle]} />
                <TouchableOpacity
                  style={styles.toggleOption}
                  onPress={() => handleDepthToggle('intuitive')}
                >
                  <Text style={[styles.toggleLabel, depthMode === 'intuitive' && styles.toggleLabelActive]}>
                    Intuitive Explorer
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.toggleOption}
                  onPress={() => handleDepthToggle('deepdive')}
                >
                  <Text style={[styles.toggleLabel, depthMode === 'deepdive' && styles.toggleLabelActive]}>
                    Deep Dive Researcher
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Mode description */}
            <View style={styles.modeDesc}>
              {depthMode === 'intuitive' ? (
                <Text style={styles.modeDescText}>
                  🌱 Core concepts, visual stories, and narrative mysteries — no jargon required.
                </Text>
              ) : (
                <Text style={styles.modeDescText}>
                  🔬 Advanced terminology, source methodologies, lab data, and analytical tools.
                </Text>
              )}
              <Text style={styles.modeDescHint}>You can switch this anytime in Settings.</Text>
            </View>

            {/* CTA */}
            <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.85}>
              <Text style={styles.startBtnText}>Start Exploring ⛏️</Text>
            </TouchableOpacity>

            {/* Back */}
            <TouchableOpacity onPress={() => setStep(1)} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Change world</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1, padding: 24, paddingBottom: 48 },

  header: { alignItems: 'center', marginBottom: 40, marginTop: 24 },
  logoText: { fontSize: 36, fontWeight: '800', color: COLORS.sand, letterSpacing: 1 },
  tagline: { fontSize: 15, color: COLORS.textSecondary, marginTop: 6 },

  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },

  // World Grid
  worldGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  worldCard: {
    width: (width - 72) / 2,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
  },
  worldCardActive: { backgroundColor: COLORS.cardActive, borderColor: COLORS.sand },
  worldCardLocked: { backgroundColor: COLORS.cardLocked, borderColor: COLORS.border },
  worldCardSelected: { borderColor: COLORS.accent, backgroundColor: COLORS.cardSelected },
  worldEmoji: { fontSize: 32 },
  worldTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  worldTagline: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center' },
  textMuted: { color: COLORS.textMuted },
  lockedBadge: {
    marginTop: 4,
    backgroundColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  lockedText: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },

  // Depth Toggle
  depthSection: { flex: 1 },
  toggleContainer: { marginBottom: 24 },
  toggleTrack: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardLocked,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
    height: 52,
  },
  toggleThumb: {
    position: 'absolute',
    width: width / 2 - 36,
    height: 44,
    top: 4,
    left: 4,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    zIndex: 0,
  },
  toggleOption: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  toggleLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  toggleLabelActive: { color: COLORS.textPrimary },

  // Mode Description
  modeDesc: {
    backgroundColor: COLORS.cardActive,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modeDescText: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },
  modeDescHint: { fontSize: 12, color: COLORS.textMuted },

  // CTA
  startBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  startBtnText: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  backBtn: { alignItems: 'center', paddingVertical: 8 },
  backBtnText: { fontSize: 14, color: COLORS.textSecondary },
});
