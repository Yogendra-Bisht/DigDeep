// ============================================================
// DigDeep — Atlas Canvas Screen (FR2.1)
// Non-linear, interactive 2D node map with panning, zoom,
// branch filtering, and SVG connection lines.
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Svg, { Line } from 'react-native-svg';
import {
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppStore } from '../../store/useAppStore';
import { loadAtlasNodes } from '../../engine/worldpack';
import { COLORS, TYPOGRAPHY, RADII } from '../../theme';
import type { AtlasNode, AtlasStackParamList, NodeBranch, NodeStatus } from '../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 850;

type NavigationProp = NativeStackNavigationProp<AtlasStackParamList, 'AtlasCanvas'>;

const BRANCH_CONFIG: Record<
  NodeBranch,
  { label: string; color: string; emoji: string }
> = {
  mysteries: { label: 'Unsolved Mysteries', color: COLORS.branchMysteries, emoji: '🔮' },
  sciences: { label: 'Hard Sciences', color: COLORS.branchSciences, emoji: '🔬' },
  cases: { label: 'Real Cases', color: COLORS.branchCases, emoji: '📂' },
  fieldwork: { label: 'FieldWork', color: COLORS.branchFieldwork, emoji: '🏕️' },
};

export default function AtlasCanvasScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { profile, nodeStates, setAtlasNodes } = useAppStore();
  const [nodes, setNodes] = useState<AtlasNode[]>([]);
  const [activeBranch, setActiveBranch] = useState<NodeBranch | 'all'>('all');

  // Shared values for Pan & Pinch zoom gestures
  const translateX = useSharedValue(-CANVAS_WIDTH / 4);
  const translateY = useSharedValue(-CANVAS_HEIGHT / 4);
  const savedTranslateX = useSharedValue(-CANVAS_WIDTH / 4);
  const savedTranslateY = useSharedValue(-CANVAS_HEIGHT / 4);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  // Load nodes on mount
  useEffect(() => {
    async function initNodes() {
      const worldId = profile?.selectedWorld || 'archaeology';
      const loaded = await loadAtlasNodes(worldId);
      setNodes(loaded);
      setAtlasNodes(loaded);
    }
    initNodes();
  }, [profile?.selectedWorld]);

  // Gestures
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      const nextScale = savedScale.value * e.scale;
      // Clamp zoom between 0.6x and 2.0x
      scale.value = Math.min(Math.max(nextScale, 0.6), 2.0);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const composedGestures = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedCanvasStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // Quick reset view
  function handleResetView() {
    translateX.value = -CANVAS_WIDTH / 6;
    translateY.value = -CANVAS_HEIGHT / 6;
    savedTranslateX.value = -CANVAS_WIDTH / 6;
    savedTranslateY.value = -CANVAS_HEIGHT / 6;
    scale.value = 1;
    savedScale.value = 1;
  }

  // Node position dictionary for fast SVG line drawing
  const nodePositionMap = new Map<string, { x: number; y: number }>();
  nodes.forEach((n) => {
    nodePositionMap.set(n.id, n.position);
  });

  // Calculate connection line color based on status
  function getConnectionColor(fromStatus: NodeStatus, toStatus: NodeStatus) {
    if (fromStatus === 'mastered' && toStatus === 'mastered') {
      return COLORS.nodeMastered;
    }
    if (fromStatus === 'unlocked' || toStatus === 'unlocked') {
      return 'rgba(196, 131, 42, 0.55)'; // amber glow
    }
    return COLORS.border;
  }

  // Filtered nodes
  const displayNodes =
    activeBranch === 'all'
      ? nodes
      : nodes.filter((n) => n.branch === activeBranch);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* Top Bar: Title & Branch Filters */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Archaeology Atlas</Text>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={handleResetView}
            activeOpacity={0.7}
          >
            <Text style={styles.resetBtnText}>Center Map</Text>
          </TouchableOpacity>
        </View>

        {/* Branch Filter Pills */}
        <View style={styles.filterScroll}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              activeBranch === 'all' && styles.filterPillActive,
            ]}
            onPress={() => setActiveBranch('all')}
          >
            <Text
              style={[
                styles.filterPillText,
                activeBranch === 'all' && styles.filterPillTextActive,
              ]}
            >
              All (12)
            </Text>
          </TouchableOpacity>

          {(Object.keys(BRANCH_CONFIG) as NodeBranch[]).map((branch) => {
            const conf = BRANCH_CONFIG[branch];
            const isActive = activeBranch === branch;
            return (
              <TouchableOpacity
                key={branch}
                style={[
                  styles.filterPill,
                  isActive && {
                    backgroundColor: conf.color,
                    borderColor: conf.color,
                  },
                ]}
                onPress={() => setActiveBranch(branch)}
              >
                <Text style={styles.filterEmoji}>{conf.emoji}</Text>
                <Text
                  style={[
                    styles.filterPillText,
                    isActive && styles.filterPillTextActive,
                  ]}
                >
                  {conf.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Interactive Pannable/Zoomable Canvas */}
      <View style={styles.viewport}>
        <GestureDetector gesture={composedGestures}>
          <Animated.View style={[styles.canvas, animatedCanvasStyle]}>
            {/* SVG Connection Network */}
            <Svg
              style={StyleSheet.absoluteFill}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
            >
              {nodes.map((node) => {
                const startPos = node.position;
                const nodeState = nodeStates[node.id] || node.status;

                return node.connections.map((targetId) => {
                  const endPos = nodePositionMap.get(targetId);
                  if (!endPos) return null;

                  // Avoid rendering duplicate lines (only render if node.id < targetId)
                  if (node.id > targetId) return null;

                  const targetState =
                    nodeStates[targetId] ||
                    nodes.find((n) => n.id === targetId)?.status ||
                    'locked';

                  const strokeColor = getConnectionColor(nodeState, targetState);

                  return (
                    <Line
                      key={`${node.id}-${targetId}`}
                      x1={startPos.x + 40}
                      y1={startPos.y + 40}
                      x2={endPos.x + 40}
                      y2={endPos.y + 40}
                      stroke={strokeColor}
                      strokeWidth={2}
                      strokeDasharray={
                        nodeState === 'locked' && targetState === 'locked'
                          ? '4, 4'
                          : undefined
                      }
                    />
                  );
                });
              })}
            </Svg>

            {/* Nodes */}
            {displayNodes.map((node) => {
              const currentStatus: NodeStatus =
                nodeStates[node.id] || node.status;
              const branchInfo = BRANCH_CONFIG[node.branch];

              return (
                <TouchableOpacity
                  key={node.id}
                  style={[
                    styles.nodeContainer,
                    { left: node.position.x, top: node.position.y },
                    currentStatus === 'mastered' && styles.nodeMastered,
                  ]}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate('NodeDetail', { nodeId: node.id })
                  }
                >
                  {/* Node Circle */}
                  <View
                    style={[
                      styles.nodeCircle,
                      { borderColor: branchInfo.color },
                      currentStatus === 'mastered' && {
                        backgroundColor: COLORS.moss,
                      },
                    ]}
                  >
                    <Text style={styles.nodeEmoji}>{node.emoji}</Text>
                    {currentStatus === 'mastered' && (
                      <View style={styles.masteredBadge}>
                        <Text style={styles.masteredBadgeText}>✓</Text>
                      </View>
                    )}
                  </View>

                  {/* Node Label Box */}
                  <View style={styles.nodeLabelBox}>
                    <Text
                      style={styles.nodeTitle}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {node.title}
                    </Text>
                    <Text
                      style={[styles.nodeBranchText, { color: branchInfo.color }]}
                    >
                      {branchInfo.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Footer Navigation Tip */}
      <View style={styles.bottomLegend}>
        <Text style={styles.legendText}>
          👆 Pan & Pinch to explore • Tap any node to investigate
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bgSurface,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.sand,
  },
  resetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.cardActive,
    borderWidth: 1,
    borderColor: COLORS.borderActive,
  },
  resetBtnText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weightSemiBold,
  },
  filterScroll: {
    flexDirection: 'row',
    gap: 8,
    overflow: 'hidden',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADII.full,
    backgroundColor: COLORS.cardLocked,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterPillActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  filterEmoji: {
    fontSize: 12,
  },
  filterPillText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weightMedium,
  },
  filterPillTextActive: {
    color: '#fff',
    fontWeight: TYPOGRAPHY.weightBold,
  },

  // Canvas
  viewport: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: COLORS.bg,
  },
  canvas: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  },

  // Node Component
  nodeContainer: {
    position: 'absolute',
    alignItems: 'center',
    width: 140,
    zIndex: 2,
  },
  nodeCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.cardActive,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  nodeMastered: {
    opacity: 0.95,
  },
  nodeEmoji: {
    fontSize: 32,
  },
  masteredBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.moss,
    borderWidth: 1.5,
    borderColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  masteredBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  nodeLabelBox: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(26, 23, 19, 0.9)',
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    width: '100%',
  },
  nodeTitle: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  nodeBranchText: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weightSemiBold,
    marginTop: 1,
  },

  // Bottom Legend
  bottomLegend: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.bgSurface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  legendText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
  },
});
