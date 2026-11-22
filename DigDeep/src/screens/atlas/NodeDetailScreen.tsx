// ============================================================
// DigDeep — Node Detail & 4-Layer Content Reader Screen (FR2.2)
// Sequential 4-layer drawer (Hook → Why → Evidence → Investigate)
// with live depth toggle and interactive challenge launches.
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppStore } from '../../store/useAppStore';
import { markLayerComplete, getCompletedLayers } from '../../storage/database';
import { COLORS, TYPOGRAPHY, RADII, SPACING } from '../../theme';
import type {
  AtlasStackParamList,
  AtlasNode,
  DepthMode,
  NodeLayer,
} from '../../types';

type RouteProps = RouteProp<AtlasStackParamList, 'NodeDetail'>;
type NavProps = NativeStackNavigationProp<AtlasStackParamList, 'NodeDetail'>;

const LAYER_CONFIG = [
  { index: 1, label: 'Hook', icon: '🪝', color: COLORS.layerHook, subtitle: '60-Sec Mystery' },
  { index: 2, label: 'Why', icon: '💡', color: COLORS.layerWhy, subtitle: 'Core Mechanism' },
  { index: 3, label: 'Evidence', icon: '🧪', color: COLORS.layerEvidence, subtitle: 'Lab & Excavation Data' },
  { index: 4, label: 'Investigate', icon: '🔭', color: COLORS.layerInvestigate, subtitle: 'Interactive Case' },
];

export default function NodeDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavProps>();
  const { nodeId } = route.params;

  const { atlasNodes, profile, setDepthMode, updateNodeState } = useAppStore();
  const [activeLayerIndex, setActiveLayerIndex] = useState<number>(1);
  const [completedLayers, setCompletedLayers] = useState<number[]>([]);

  // Find target node
  const node = atlasNodes.find((n) => n.id === nodeId);
  const depthMode: DepthMode = profile?.depthMode || 'intuitive';

  // Load completed layers from SQLite
  useEffect(() => {
    const done = getCompletedLayers(nodeId);
    setCompletedLayers(done);
    // Mark layer 1 visited automatically
    if (!done.includes(1)) {
      markLayerComplete(nodeId, 1);
      setCompletedLayers((prev) => [...prev, 1]);
    }
  }, [nodeId]);

  if (!node) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Node not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Return to Atlas</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Handle layer navigation
  function handleSelectLayer(index: number) {
    setActiveLayerIndex(index);
    if (!completedLayers.includes(index)) {
      markLayerComplete(nodeId, index);
      const updated = [...completedLayers, index];
      setCompletedLayers(updated);

      // If all 4 layers completed, mark node as mastered
      if (updated.length >= 4) {
        updateNodeState(nodeId, 'mastered');
      }
    }
  }

  const activeLayer = node.layers.find((l) => l.layerIndex === activeLayerIndex) || node.layers[0];
  const activeLayerMeta = LAYER_CONFIG[activeLayerIndex - 1];

  // Action for Layer 4 interactive challenge
  function handleLaunchInteractive() {
    if (activeLayer.interactiveType === 'artifact') {
      const caseId = activeLayer.interactiveRefId || 'case-amphora-01';
      navigation.navigate('ArtifactDetective', { caseId });
    } else if (activeLayer.interactiveType === 'dig') {
      navigation.navigate('StratigraphyDig', { siteId: nodeId });
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← Atlas</Text>
        </TouchableOpacity>

        {/* Dynamic Depth Mode Toggle */}
        <View style={styles.depthToggleBox}>
          <TouchableOpacity
            style={[
              styles.depthToggleBtn,
              depthMode === 'intuitive' && styles.depthToggleBtnActive,
            ]}
            onPress={() => setDepthMode('intuitive')}
          >
            <Text
              style={[
                styles.depthToggleText,
                depthMode === 'intuitive' && styles.depthToggleTextActive,
              ]}
            >
              Intuitive
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.depthToggleBtn,
              depthMode === 'deepdive' && styles.depthToggleBtnActive,
            ]}
            onPress={() => setDepthMode('deepdive')}
          >
            <Text
              style={[
                styles.depthToggleText,
                depthMode === 'deepdive' && styles.depthToggleTextActive,
              ]}
            >
              Deep Dive
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Node Info Banner */}
      <View style={styles.nodeBanner}>
        <Text style={styles.nodeBannerEmoji}>{node.emoji}</Text>
        <View style={styles.nodeBannerContent}>
          <Text style={styles.nodeBannerTitle}>{node.title}</Text>
          <Text style={styles.nodeBannerSub}>{node.subtitle}</Text>
        </View>
      </View>

      {/* 4-Layer Progression Tabs */}
      <View style={styles.layerTabsContainer}>
        {LAYER_CONFIG.map((layer) => {
          const isActive = activeLayerIndex === layer.index;
          const isDone = completedLayers.includes(layer.index);

          return (
            <TouchableOpacity
              key={layer.index}
              style={[
                styles.layerTab,
                isActive && {
                  borderColor: layer.color,
                  backgroundColor: COLORS.cardSelected,
                },
              ]}
              onPress={() => handleSelectLayer(layer.index)}
              activeOpacity={0.75}
            >
              <View style={styles.layerTabTop}>
                <Text style={styles.layerTabIcon}>{layer.icon}</Text>
                {isDone && <Text style={styles.layerDoneBadge}>✓</Text>}
              </View>
              <Text
                style={[
                  styles.layerTabLabel,
                  isActive && { color: layer.color, fontWeight: 'bold' },
                ]}
              >
                {layer.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Active Layer Content Reader */}
      <ScrollView
        contentContainerStyle={styles.contentScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Layer Header Badge */}
        <View
          style={[
            styles.activeLayerBadge,
            { backgroundColor: activeLayerMeta.color + '22', borderColor: activeLayerMeta.color },
          ]}
        >
          <Text style={[styles.activeLayerBadgeText, { color: activeLayerMeta.color }]}>
            LAYER {activeLayerMeta.index}: {activeLayerMeta.label.toUpperCase()} — {activeLayerMeta.subtitle}
          </Text>
        </View>

        {/* Content Body Based on Active Depth Mode */}
        <View style={styles.contentBodyCard}>
          <Text style={styles.contentBodyText}>
            {depthMode === 'intuitive'
              ? activeLayer.contentIntuitive
              : activeLayer.contentDeepDive}
          </Text>

          {/* Depth Mode indicator note */}
          <View style={styles.depthModeIndicator}>
            <Text style={styles.depthModeIndicatorText}>
              {depthMode === 'intuitive'
                ? '🌱 Viewing in Intuitive Explorer Mode'
                : '🔬 Viewing in Deep Dive Researcher Mode'}
            </Text>
          </View>
        </View>

        {/* Interactive Launch Button (for Layer 4 or nodes with challenges) */}
        {activeLayer.interactiveType && (
          <View style={styles.interactiveCard}>
            <Text style={styles.interactiveTitle}>
              {activeLayer.interactiveType === 'artifact' && '🔍 Artifact Detective Ready'}
              {activeLayer.interactiveType === 'dig' && '⛏️ Stratigraphy Dig Simulation'}
              {activeLayer.interactiveType === 'field_prompt' && '📓 Local Field Log Prompt'}
              {activeLayer.interactiveType === 'quiz' && '💡 Mystery Deduction Challenge'}
            </Text>
            <Text style={styles.interactiveDesc}>
              {activeLayer.interactiveType === 'artifact' &&
                'Examine high-resolution artifact details, inspect wear patterns, and formulate trade hypotheses.'}
              {activeLayer.interactiveType === 'dig' &&
                'Swipe through stratigraphic earth layers and sequence diagnostic artifacts.'}
              {activeLayer.interactiveType === 'field_prompt' &&
                'Head outside to observe architectural features in your area and record a Field Log card.'}
              {activeLayer.interactiveType === 'quiz' &&
                'Test your archaeological deduction against historical evidence.'}
            </Text>

            {activeLayer.interactiveType === 'artifact' && (
              <TouchableOpacity
                style={[styles.launchBtn, { backgroundColor: COLORS.accent }]}
                onPress={handleLaunchInteractive}
                activeOpacity={0.8}
              >
                <Text style={styles.launchBtnText}>Launch Artifact Detective →</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Next Layer CTA */}
        {activeLayerIndex < 4 && (
          <TouchableOpacity
            style={styles.nextLayerBtn}
            onPress={() => handleSelectLayer(activeLayerIndex + 1)}
            activeOpacity={0.8}
          >
            <Text style={styles.nextLayerBtnText}>
              Next: Layer {activeLayerIndex + 1} ({LAYER_CONFIG[activeLayerIndex].label}) →
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bgSurface,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  backButtonText: {
    color: COLORS.sand,
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.weightSemiBold,
  },
  depthToggleBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardLocked,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 2,
  },
  depthToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADII.sm - 2,
  },
  depthToggleBtnActive: {
    backgroundColor: COLORS.accent,
  },
  depthToggleText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weightMedium,
  },
  depthToggleTextActive: {
    color: '#fff',
    fontWeight: TYPOGRAPHY.weightBold,
  },

  // Banner
  nodeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.cardActive,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  nodeBannerEmoji: {
    fontSize: 34,
  },
  nodeBannerContent: {
    flex: 1,
  },
  nodeBannerTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.textPrimary,
  },
  nodeBannerSub: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Layer Navigation Tabs
  layerTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.bgSurface,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  layerTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.cardLocked,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  layerTabTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  layerTabIcon: {
    fontSize: 14,
  },
  layerDoneBadge: {
    fontSize: 10,
    color: COLORS.moss,
    fontWeight: 'bold',
  },
  layerTabLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
  },

  // Scroll Content
  contentScroll: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  activeLayerBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADII.sm,
    borderWidth: 1,
  },
  activeLayerBadgeText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.weightBold,
  },
  contentBodyCard: {
    backgroundColor: COLORS.cardActive,
    borderRadius: RADII.md,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 16,
  },
  contentBodyText: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  depthModeIndicator: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  depthModeIndicatorText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },

  // Interactive Card
  interactiveCard: {
    backgroundColor: COLORS.cardSelected,
    borderRadius: RADII.md,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.sand,
    gap: 8,
  },
  interactiveTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.sand,
  },
  interactiveDesc: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  launchBtn: {
    marginTop: 8,
    borderRadius: RADII.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  launchBtnText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.weightBold,
    color: '#fff',
  },

  // Next CTA
  nextLayerBtn: {
    borderRadius: RADII.sm,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: COLORS.cardActive,
    borderWidth: 1,
    borderColor: COLORS.borderActive,
  },
  nextLayerBtnText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.sand,
    fontWeight: TYPOGRAPHY.weightSemiBold,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.lg,
  },
});
