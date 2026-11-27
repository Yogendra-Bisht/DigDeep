// ============================================================
// DigDeep — Stratigraphy "Dig Layer by Layer" Mini-Simulator (FR3A)
// Touch-based vertical swipe excavation with tool selection,
// artifact discovery, and Law of Superposition sequencing.
// ============================================================

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY, RADII, SPACING } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Types ───────────────────────────────────────────────────

type Tool = 'brush' | 'trowel' | 'magnifier' | 'carbon_kit';
type ArtifactStatus = 'hidden' | 'uncovered' | 'sampled';

interface SoilLayer {
  id: string;
  name: string;
  color: string;
  textureNote: string;
  depthLabel: string;
  revealProgress: number; // 0 to 1
}

interface BuriedArtifact {
  id: string;
  layerId: string;       // appears at which layer
  emoji: string;
  name: string;
  period: string;
  requiredTool: Tool;
  clue: string;
  status: ArtifactStatus;
  xPercent: number;
  yPercent: number;
}

// ─── Static Data ─────────────────────────────────────────────

const TOOLS: { id: Tool; emoji: string; name: string; desc: string }[] = [
  { id: 'brush', emoji: '🖌️', name: 'Brush', desc: 'Gentle debris removal for delicate organic material' },
  { id: 'trowel', emoji: '🪄', name: 'Trowel', desc: 'Precise soil scraping for compact clay layers' },
  { id: 'magnifier', emoji: '🔍', name: 'Magnifier', desc: 'Surface inspection and inscription analysis' },
  { id: 'carbon_kit', emoji: '⚗️', name: 'Carbon Kit', desc: 'Charred seed & organic sample extraction for C-14 dating' },
];

const SOIL_LAYERS: SoilLayer[] = [
  { id: 'topsoil', name: 'Topsoil & Modern Debris', color: '#5C4A32', textureNote: 'Loose loam with plastic & glass fragments', depthLabel: '0 – 30 cm', revealProgress: 0 },
  { id: 'silt', name: 'Alluvial Silt Deposit', color: '#7A6240', textureNote: 'Fine-grained riverside flood deposit, pale brown', depthLabel: '30 – 90 cm', revealProgress: 0 },
  { id: 'clay', name: 'Compressed Clay Horizon', color: '#6B4F28', textureNote: 'Dense red-orange fired clay; structural floor surface', depthLabel: '90 – 150 cm', revealProgress: 0 },
  { id: 'ash', name: 'Ash & Destruction Layer', color: '#3D3025', textureNote: 'Charcoal-rich dark band; evidence of conflagration event', depthLabel: '150 – 210 cm', revealProgress: 0 },
];

const BURIED_ARTIFACTS: BuriedArtifact[] = [
  { id: 'medieval-coin', layerId: 'silt', emoji: '🪙', name: 'Medieval Copper Paisa', period: 'c. 14th Century CE', requiredTool: 'trowel', clue: 'Corroded copper disc — later historical horizon', status: 'hidden', xPercent: 30, yPercent: 50 },
  { id: 'terracotta-seal', layerId: 'clay', emoji: '🪬', name: 'Terracotta Sealing', period: 'c. 3rd–4th Century CE', requiredTool: 'brush', clue: 'Fragile clay seal with incised unicorn motif — handle with brush only!', status: 'hidden', xPercent: 65, yPercent: 40 },
  { id: 'burnt-seeds', layerId: 'ash', emoji: '🌾', name: 'Charred Paddy Seeds', period: 'c. 500–300 BCE', requiredTool: 'carbon_kit', clue: 'Organic carbon sample — use Carbon Kit for AMS dating', status: 'hidden', xPercent: 50, yPercent: 55 },
  { id: 'nbpw-sherd', layerId: 'clay', emoji: '🏺', name: 'NBPW Pottery Sherd', period: 'c. 500–200 BCE', requiredTool: 'brush', clue: 'Northern Black Polished Ware — high-fired Gangetic diagnostic', status: 'hidden', xPercent: 25, yPercent: 65 },
];

// ─── Layer Card Component ─────────────────────────────────────

function SoilLayerCard({
  layer,
  index,
  isActive,
  revealedArtifacts,
  selectedTool,
  onSwipe,
  onArtifactTap,
}: {
  layer: SoilLayer;
  index: number;
  isActive: boolean;
  revealedArtifacts: BuriedArtifact[];
  selectedTool: Tool;
  onSwipe: (layerId: string) => void;
  onArtifactTap: (artifact: BuriedArtifact) => void;
}) {
  const revealX = useSharedValue(0);
  const revealProgress = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (!isActive) return;
      // Horizontal scraping gesture — move left = digging into layer
      const rawProgress = Math.max(0, Math.min(1, e.translationX / -SCREEN_WIDTH));
      revealProgress.value = rawProgress;
    })
    .onEnd(() => {
      if (!isActive) return;
      if (revealProgress.value > 0.55) {
        revealProgress.value = withTiming(1, { duration: 300 });
        runOnJS(onSwipe)(layer.id);
      } else {
        revealProgress.value = withSpring(0);
      }
    });

  const layerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: revealProgress.value * -SCREEN_WIDTH }],
    opacity: 1 - revealProgress.value * 0.6,
  }));

  return (
    <View style={styles.soilLayerWrapper}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.soilLayerCard, { backgroundColor: layer.color }, layerStyle]}>
          <View style={styles.layerInfo}>
            <Text style={styles.layerName}>{layer.name}</Text>
            <Text style={styles.layerDepth}>{layer.depthLabel}</Text>
            <Text style={styles.layerTexture}>{layer.textureNote}</Text>
          </View>
          {isActive && (
            <View style={styles.activeLayerHint}>
              <Text style={styles.activeHintText}>← Swipe left to excavate</Text>
            </View>
          )}
        </Animated.View>
      </GestureDetector>

      {/* Artifact pins within this layer */}
      {revealedArtifacts.map((a) => (
        <TouchableOpacity
          key={a.id}
          style={[styles.artifactPin, { left: `${a.xPercent}%`, top: `${a.yPercent}%` }]}
          onPress={() => onArtifactTap(a)}
          activeOpacity={0.8}
        >
          <Text style={styles.artifactPinEmoji}>{a.emoji}</Text>
          {a.status === 'sampled' && <Text style={styles.artifactSampledBadge}>✓</Text>}
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────

export default function StratigraphyDigScreen() {
  const navigation = useNavigation();

  const [layers, setLayers] = useState<SoilLayer[]>(SOIL_LAYERS);
  const [artifacts, setArtifacts] = useState<BuriedArtifact[]>(BURIED_ARTIFACTS);
  const [currentLayerIndex, setCurrentLayerIndex] = useState(0);
  const [selectedTool, setSelectedTool] = useState<Tool>('brush');
  const [selectedArtifact, setSelectedArtifact] = useState<BuriedArtifact | null>(null);
  const [toolFeedback, setToolFeedback] = useState<string | null>(null);
  const [phase, setPhase] = useState<'dig' | 'sequence' | 'complete'>('dig');
  const [sequenceOrder, setSequenceOrder] = useState<string[]>([]);

  // Artifacts currently visible in excavated layers
  const visibleArtifacts = artifacts.filter(
    (a) =>
      a.status !== 'hidden' ||
      layers.findIndex((l) => l.id === a.layerId) < currentLayerIndex
  );

  function handleLayerSwiped(layerId: string) {
    const idx = layers.findIndex((l) => l.id === layerId);
    if (idx === currentLayerIndex) {
      setCurrentLayerIndex((prev) => {
        const next = prev + 1;
        if (next >= layers.length) {
          setPhase('sequence');
        }
        return next;
      });

      // Reveal artifacts from this layer
      setArtifacts((prev) =>
        prev.map((a) =>
          a.layerId === layerId ? { ...a, status: 'uncovered' } : a
        )
      );
    }
  }

  function handleArtifactTap(artifact: BuriedArtifact) {
    setSelectedArtifact(artifact);

    if (artifact.requiredTool === selectedTool) {
      setToolFeedback(`✅ Correct! ${TOOLS.find((t) => t.id === selectedTool)?.name} is ideal for ${artifact.name}. Sample secured.`);
      setArtifacts((prev) =>
        prev.map((a) => (a.id === artifact.id ? { ...a, status: 'sampled' } : a))
      );
    } else {
      const correctTool = TOOLS.find((t) => t.id === artifact.requiredTool);
      setToolFeedback(
        `⚠️ Using ${TOOLS.find((t) => t.id === selectedTool)?.name} on ${artifact.name} risks destroying the context. Use ${correctTool?.emoji} ${correctTool?.name} instead — ${artifact.clue}`
      );
    }
  }

  // ── Layer Sequencing (Law of Superposition) ──

  function handleAddToSequence(layerId: string) {
    if (sequenceOrder.includes(layerId)) {
      setSequenceOrder((prev) => prev.filter((id) => id !== layerId));
    } else {
      setSequenceOrder((prev) => [...prev, layerId]);
    }
  }

  function checkSequence() {
    const correctOrder = [...SOIL_LAYERS].map((l) => l.id).reverse(); // ash → clay → silt → topsoil (oldest → youngest)
    const isCorrect = sequenceOrder.join(',') === correctOrder.join(',');
    if (isCorrect) {
      setPhase('complete');
    } else {
      setToolFeedback('❌ Not quite! Remember — the Law of Superposition: the DEEPEST layer is OLDEST. Oldest at top, youngest at bottom in your sequence.');
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Exit Dig</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stratigraphy Simulator</Text>
        <View style={styles.layerDepthBadge}>
          <Text style={styles.layerDepthBadgeText}>Layer {currentLayerIndex + 1}/{layers.length}</Text>
        </View>
      </View>

      {/* Tool Tray */}
      <View style={styles.toolTray}>
        <Text style={styles.toolTrayLabel}>Tool Tray:</Text>
        {TOOLS.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            style={[styles.toolBtn, selectedTool === tool.id && styles.toolBtnActive]}
            onPress={() => { setSelectedTool(tool.id); setToolFeedback(null); }}
            activeOpacity={0.8}
          >
            <Text style={styles.toolEmoji}>{tool.emoji}</Text>
            <Text style={[styles.toolName, selectedTool === tool.id && styles.toolNameActive]}>
              {tool.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tool Feedback Banner */}
      {toolFeedback && (
        <View style={styles.feedbackBanner}>
          <Text style={styles.feedbackText}>{toolFeedback}</Text>
          <TouchableOpacity onPress={() => setToolFeedback(null)}>
            <Text style={styles.feedbackDismiss}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {phase === 'dig' && (
          <View style={styles.digSection}>
            <Text style={styles.digInstructions}>
              Swipe ← to remove each soil layer. Tap artifacts with the correct tool.
            </Text>

            {/* Excavation cross-section */}
            <View style={styles.trenchContainer}>
              {/* Depth ruler */}
              <View style={styles.depthRuler}>
                {layers.map((_, i) => (
                  <View key={i} style={styles.rulerMark}>
                    <Text style={styles.rulerText}>{i * 60}cm</Text>
                  </View>
                ))}
              </View>

              {/* Soil layer stack */}
              <View style={styles.trenchLayers}>
                {layers.map((layer, idx) => {
                  const isActive = idx === currentLayerIndex;
                  const isExcavated = idx < currentLayerIndex;
                  const layerArtifacts = artifacts.filter(
                    (a) => a.layerId === layer.id && a.status !== 'hidden'
                  );

                  if (isExcavated) {
                    return (
                      <View key={layer.id} style={[styles.excavatedLayer]}>
                        <Text style={styles.excavatedLabel}>✓ {layer.name} — excavated</Text>
                        {layerArtifacts.map((a) => (
                          <TouchableOpacity
                            key={a.id}
                            style={styles.excavatedArtifact}
                            onPress={() => handleArtifactTap(a)}
                          >
                            <Text>{a.emoji} {a.name} ({a.period})</Text>
                            {a.status === 'sampled' && <Text style={styles.sampledTag}>Sampled ✓</Text>}
                          </TouchableOpacity>
                        ))}
                      </View>
                    );
                  }

                  return (
                    <SoilLayerCard
                      key={layer.id}
                      layer={layer}
                      index={idx}
                      isActive={isActive}
                      revealedArtifacts={layerArtifacts}
                      selectedTool={selectedTool}
                      onSwipe={handleLayerSwiped}
                      onArtifactTap={handleArtifactTap}
                    />
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* ── Layer Sequencing Phase ── */}
        {phase === 'sequence' && (
          <View style={styles.sequenceSection}>
            <Text style={styles.sectionTitle}>📐 Sequence the Layers</Text>
            <Text style={styles.sectionDesc}>
              Apply the Law of Superposition: arrange the layers from OLDEST (top) to YOUNGEST (bottom).
            </Text>

            {/* Sortable list */}
            <View style={styles.sequenceList}>
              {SOIL_LAYERS.slice().reverse().map((layer) => {
                const rank = sequenceOrder.indexOf(layer.id);
                return (
                  <TouchableOpacity
                    key={layer.id}
                    style={[
                      styles.sequenceCard,
                      { borderLeftColor: layer.color, borderLeftWidth: 4 },
                      rank !== -1 && { backgroundColor: COLORS.cardSelected },
                    ]}
                    onPress={() => handleAddToSequence(layer.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.sequenceRank}>
                      {rank !== -1 ? `#${rank + 1}` : '  '}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sequenceName}>{layer.name}</Text>
                      <Text style={styles.sequenceDepth}>{layer.depthLabel}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {toolFeedback && (
              <View style={styles.feedbackBanner}>
                <Text style={styles.feedbackText}>{toolFeedback}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.confirmBtn, sequenceOrder.length < 4 && styles.confirmBtnDisabled]}
              onPress={checkSequence}
              disabled={sequenceOrder.length < 4}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmBtnText}>Confirm Sequence →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Complete Phase ── */}
        {phase === 'complete' && (
          <View style={styles.completeSection}>
            <Text style={styles.completeTrophy}>⛏️</Text>
            <Text style={styles.completeTitle}>Excavation Complete!</Text>
            <Text style={styles.completeDesc}>
              You correctly applied the Law of Superposition. All artifacts have been catalogued and
              organic samples sent for AMS radiocarbon dating.
            </Text>
            <View style={styles.artifactSummary}>
              <Text style={styles.artifactSummaryTitle}>Finds Summary:</Text>
              {artifacts.map((a) => (
                <View key={a.id} style={styles.findRow}>
                  <Text style={styles.findEmoji}>{a.emoji}</Text>
                  <View>
                    <Text style={styles.findName}>{a.name}</Text>
                    <Text style={styles.findPeriod}>{a.period}</Text>
                  </View>
                  <Text style={[styles.findStatus, a.status === 'sampled' && { color: COLORS.moss }]}>
                    {a.status === 'sampled' ? '✓ Sampled' : 'Uncovered'}
                  </Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmBtnText}>Return to Atlas →</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { paddingVertical: 6, paddingHorizontal: 8 },
  backBtnText: { color: COLORS.sand, fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.weightSemiBold },
  headerTitle: { color: COLORS.textPrimary, fontSize: TYPOGRAPHY.base, fontWeight: TYPOGRAPHY.weightBold },
  layerDepthBadge: {
    backgroundColor: COLORS.cardLocked,
    borderRadius: RADII.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  layerDepthBadgeText: { fontSize: TYPOGRAPHY.xs, color: COLORS.textSecondary, fontWeight: TYPOGRAPHY.weightSemiBold },

  // Tool Tray
  toolTray: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  toolTrayLabel: { fontSize: TYPOGRAPHY.xs, color: COLORS.textMuted, marginRight: 4 },
  toolBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.cardLocked,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  toolBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.cardSelected },
  toolEmoji: { fontSize: 18 },
  toolName: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  toolNameActive: { color: COLORS.sand, fontWeight: TYPOGRAPHY.weightBold },

  // Feedback
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#1E1A14',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  feedbackText: { flex: 1, fontSize: TYPOGRAPHY.xs, color: COLORS.textPrimary, lineHeight: 18 },
  feedbackDismiss: { color: COLORS.textMuted, fontSize: 14, paddingLeft: 4 },

  // Dig section
  scroll: { padding: 16, paddingBottom: 48 },
  digSection: { gap: 12 },
  digInstructions: { fontSize: TYPOGRAPHY.xs, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 18 },

  // Trench
  trenchContainer: { flexDirection: 'row', gap: 8 },
  depthRuler: { width: 48, gap: 0 },
  rulerMark: { height: 90, justifyContent: 'flex-start', borderTopWidth: 1, borderTopColor: COLORS.border },
  rulerText: { fontSize: 9, color: COLORS.textMuted, paddingLeft: 4 },
  trenchLayers: { flex: 1, gap: 4 },

  // Soil Layer Card
  soilLayerWrapper: { height: 90, borderRadius: RADII.sm, overflow: 'hidden', position: 'relative' },
  soilLayerCard: {
    height: 90,
    borderRadius: RADII.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  layerInfo: { flex: 1 },
  layerName: { fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.weightBold, color: '#fff' },
  layerDepth: { fontSize: TYPOGRAPHY.xs, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  layerTexture: { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2, fontStyle: 'italic' },
  activeLayerHint: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: RADII.sm,
  },
  activeHintText: { fontSize: 11, color: COLORS.sand, fontWeight: TYPOGRAPHY.weightSemiBold },

  // Excavated layer
  excavatedLayer: {
    height: 90,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    paddingHorizontal: 14,
    gap: 4,
  },
  excavatedLabel: { fontSize: 11, color: COLORS.textMuted, fontStyle: 'italic' },
  excavatedArtifact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sampledTag: { fontSize: 10, color: COLORS.moss, marginLeft: 4 },
  artifactPin: {
    position: 'absolute',
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -18 }, { translateY: -18 }],
  },
  artifactPinEmoji: { fontSize: 24 },
  artifactSampledBadge: { position: 'absolute', bottom: 0, right: 0, fontSize: 10, color: COLORS.moss },

  // Sequence Phase
  sequenceSection: { gap: 14 },
  sectionTitle: { fontSize: TYPOGRAPHY.xl, fontWeight: TYPOGRAPHY.weightBold, color: COLORS.sand },
  sectionDesc: { fontSize: TYPOGRAPHY.xs, color: COLORS.textSecondary, lineHeight: 18 },
  sequenceList: { gap: 8 },
  sequenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.cardActive,
    borderRadius: RADII.sm,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sequenceRank: {
    width: 30,
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.accent,
    textAlign: 'center',
  },
  sequenceName: { fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.weightBold, color: COLORS.textPrimary },
  sequenceDepth: { fontSize: 11, color: COLORS.textMuted },

  // Buttons
  confirmBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADII.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmBtnDisabled: { backgroundColor: COLORS.cardLocked, borderWidth: 1, borderColor: COLORS.border },
  confirmBtnText: { color: '#fff', fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.weightBold },

  // Complete Phase
  completeSection: { gap: 16, alignItems: 'center' },
  completeTrophy: { fontSize: 64, marginTop: 16 },
  completeTitle: { fontSize: TYPOGRAPHY.xxl, fontWeight: TYPOGRAPHY.weightBold, color: COLORS.sand },
  completeDesc: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  artifactSummary: {
    width: '100%',
    backgroundColor: COLORS.cardActive,
    borderRadius: RADII.md,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  artifactSummaryTitle: { fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.weightBold, color: COLORS.textPrimary, marginBottom: 4 },
  findRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  findEmoji: { fontSize: 22 },
  findName: { fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.weightMedium, color: COLORS.textPrimary },
  findPeriod: { fontSize: TYPOGRAPHY.xs, color: COLORS.textSecondary },
  findStatus: { marginLeft: 'auto', fontSize: TYPOGRAPHY.xs, color: COLORS.textMuted, fontWeight: TYPOGRAPHY.weightSemiBold },
});
