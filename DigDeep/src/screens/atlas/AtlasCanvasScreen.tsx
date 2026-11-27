// ============================================================
// DigDeep — Atlas Canvas Screen (FR2.1)
// Interactive 2D Cartographic Relic Map:
//   • Midnight Lapis & Burnished Gold expedition chart
//   • Astrolabe Relic Medallion nodes with 4-section progress dots
//   • SVG trade-route connections, gridlines & Compass Rose
//   • Interactive Quick-Inspect Preview Card with Prev/Next & Open Codex
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line, Circle, Polygon, Text as SvgText } from 'react-native-svg';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppStore } from '../../store/useAppStore';
import { loadAtlasNodes } from '../../engine/worldpack';
import { getCompletedLayers } from '../../storage/database';
import { NODE_PAINTINGS } from '../../assets/paintings';
import { getSiteCodexEntry } from '../../data/siteCodexData';
import { COLORS, TYPOGRAPHY, RADII, FONTS, PARCHMENT } from '../../theme';
import type { AtlasNode, AtlasStackParamList, NodeBranch, NodeStatus } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_WIDTH = 1250;
const CANVAS_HEIGHT = 1150;

type NavigationProp = NativeStackNavigationProp<AtlasStackParamList, 'AtlasCanvas'>;

const BRANCH_CONFIG: Record<NodeBranch, { label: string; color: string; emoji: string }> = {
  mysteries: { label: 'Mysteries', color: COLORS.branchMysteries, emoji: '🔮' },
  sciences: { label: 'Sciences', color: COLORS.branchSciences, emoji: '🔬' },
  cases: { label: 'Real Cases', color: COLORS.branchCases, emoji: '🏛️' },
  fieldwork: { label: 'FieldWork', color: COLORS.branchFieldwork, emoji: '🧭' },
};

export default function AtlasCanvasScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0);

  const { profile, nodeStates, setAtlasNodes, returnToHome } = useAppStore();
  const [nodes, setNodes] = useState<AtlasNode[]>([]);
  const [activeBranch, setActiveBranch] = useState<NodeBranch | 'all'>('all');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [layerProgressMap, setLayerProgressMap] = useState<Record<string, number>>({});

  // Shared values for Pan & Pinch zoom gestures
  const translateX = useSharedValue(-CANVAS_WIDTH / 5);
  const translateY = useSharedValue(-CANVAS_HEIGHT / 6);
  const savedTranslateX = useSharedValue(-CANVAS_WIDTH / 5);
  const savedTranslateY = useSharedValue(-CANVAS_HEIGHT / 6);

  const scale = useSharedValue(0.95);
  const savedScale = useSharedValue(0.95);

  useEffect(() => {
    async function initNodes() {
      const worldId = profile?.selectedWorld || 'archaeology';
      const loaded = await loadAtlasNodes(worldId);
      setNodes(loaded);
      setAtlasNodes(loaded);
      if (loaded.length > 0 && !selectedNodeId) {
        setSelectedNodeId(loaded[0].id);
      }

      // Read SQLite section completion counts for medallion progress dots
      const prog: Record<string, number> = {};
      loaded.forEach((n) => {
        prog[n.id] = getCompletedLayers(n.id).length;
      });
      setLayerProgressMap(prog);
    }
    initNodes();
  }, [profile?.selectedWorld, nodeStates]);

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
      scale.value = Math.min(Math.max(nextScale, 0.55), 2.0);
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

  function focusOnNode(node: AtlasNode) {
    const targetX = SCREEN_WIDTH / 2 - (node.position.x + 70);
    const targetY = 210 - (node.position.y + 40);
    translateX.value = withSpring(targetX, { damping: 16 });
    translateY.value = withSpring(targetY, { damping: 16 });
    savedTranslateX.value = targetX;
    savedTranslateY.value = targetY;
    scale.value = withSpring(1);
    savedScale.value = 1;
  }

  function handleResetView() {
    translateX.value = withSpring(-CANVAS_WIDTH / 6);
    translateY.value = withSpring(-CANVAS_HEIGHT / 6);
    savedTranslateX.value = -CANVAS_WIDTH / 6;
    savedTranslateY.value = -CANVAS_HEIGHT / 6;
    scale.value = withSpring(0.95);
    savedScale.value = 0.95;
  }

  function handleNodeTap(node: AtlasNode) {
    if (selectedNodeId === node.id) {
      navigation.navigate('NodeDetail', { nodeId: node.id });
    } else {
      setSelectedNodeId(node.id);
    }
  }

  const nodePositionMap = new Map<string, { x: number; y: number }>();
  nodes.forEach((n) => {
    nodePositionMap.set(n.id, n.position);
  });

  function getConnectionColor(fromStatus: NodeStatus, toStatus: NodeStatus) {
    if (fromStatus === 'mastered' && toStatus === 'mastered') {
      return COLORS.nodeMastered;
    }
    if (fromStatus === 'unlocked' || toStatus === 'unlocked') {
      return 'rgba(230, 179, 74, 0.45)';
    }
    return COLORS.border;
  }

  const displayNodes =
    activeBranch === 'all' ? nodes : nodes.filter((n) => n.branch === activeBranch);

  const masteredCount = nodes.filter(
    (n) => (nodeStates[n.id] || n.status) === 'mastered'
  ).length;

  const selectedNode = displayNodes.find((n) => n.id === selectedNodeId) || displayNodes[0];
  const selectedIdx = selectedNode ? displayNodes.findIndex((n) => n.id === selectedNode.id) : -1;
  const selectedCodex = selectedNode ? getSiteCodexEntry(selectedNode.id) : null;
  const selectedPlate = selectedNode
    ? NODE_PAINTINGS[selectedNode.id] || selectedCodex?.gallery[0]
    : null;

  // Gridline coordinates for cartographic background
  const gridCols = [150, 350, 550, 750, 950, 1150];
  const gridRows = [150, 350, 550, 750, 950];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgSurface} translucent />

      {/* Phone-Aligned Top Header */}
      <View style={[styles.header, { paddingTop: topInset + 8 }]}>
        <View style={styles.headerRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.headerTitle}>🧭 DigDeep Atlas</Text>
            <Text style={styles.headerCounter}>
              {masteredCount}/{nodes.length} Sites Mastered
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={returnToHome}
              activeOpacity={0.7}
            >
              <Text style={styles.resetBtnText}>🏠 Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={handleResetView}
              activeOpacity={0.7}
            >
              <Text style={styles.resetBtnText}>⌖ Center</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.resetBtn, styles.labBtn]}
              onPress={() =>
                navigation.navigate('ArtifactDetective', { caseId: 'case-amphora-01' })
              }
              activeOpacity={0.7}
            >
              <Text style={styles.labBtnText}>Lab →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable Jewel-Toned Branch Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <TouchableOpacity
            style={[styles.filterPill, activeBranch === 'all' && styles.filterPillActive]}
            onPress={() => setActiveBranch('all')}
          >
            <Text
              style={[
                styles.filterPillText,
                activeBranch === 'all' && styles.filterPillTextActive,
              ]}
            >
              ✦ All ({nodes.length})
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
                    backgroundColor: conf.color + '2E',
                    borderColor: conf.color,
                  },
                ]}
                onPress={() => setActiveBranch(branch)}
              >
                <Text style={styles.filterEmoji}>{conf.emoji}</Text>
                <Text
                  style={[
                    styles.filterPillText,
                    isActive && { color: conf.color, fontWeight: TYPOGRAPHY.weightBold },
                  ]}
                >
                  {conf.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Interactive Pannable/Zoomable Cartographic Canvas */}
      <View style={styles.viewport}>
        <GestureDetector gesture={composedGestures}>
          <Animated.View style={[styles.canvas, animatedCanvasStyle]}>
            {/* Cartography Gridlines, Compass Rose & Trade-Route Lines */}
            <Svg style={StyleSheet.absoluteFill} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
              {/* Latitude & Longitude Grid */}
              {gridCols.map((x) => (
                <Line
                  key={`col-${x}`}
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={CANVAS_HEIGHT}
                  stroke="rgba(230, 179, 74, 0.06)"
                  strokeWidth={1}
                  strokeDasharray="6, 8"
                />
              ))}
              {gridRows.map((y) => (
                <Line
                  key={`row-${y}`}
                  x1={0}
                  y1={y}
                  x2={CANVAS_WIDTH}
                  y2={y}
                  stroke="rgba(230, 179, 74, 0.06)"
                  strokeWidth={1}
                  strokeDasharray="6, 8"
                />
              ))}

              {/* Decorative Compass Rose */}
              <Circle
                cx={620}
                cy={480}
                r={120}
                stroke="rgba(230, 179, 74, 0.09)"
                strokeWidth={1.5}
                fill="none"
              />
              <Circle
                cx={620}
                cy={480}
                r={92}
                stroke="rgba(45, 212, 191, 0.08)"
                strokeWidth={1}
                strokeDasharray="4, 6"
                fill="none"
              />
              <Polygon
                points="620,375 630,470 620,480 610,470"
                fill="rgba(230, 179, 74, 0.14)"
              />
              <Polygon
                points="620,585 630,490 620,480 610,490"
                fill="rgba(230, 179, 74, 0.08)"
              />
              <SvgText
                x={615}
                y={368}
                fill="rgba(230, 179, 74, 0.35)"
                fontSize="13"
                fontWeight="bold"
              >
                N
              </SvgText>

              {/* Connection Network */}
              {nodes.map((node) => {
                const startPos = node.position;
                const nodeState = nodeStates[node.id] || node.status;

                return node.connections.map((targetId) => {
                  const endPos = nodePositionMap.get(targetId);
                  if (!endPos || node.id > targetId) return null;

                  const targetState =
                    nodeStates[targetId] ||
                    nodes.find((n) => n.id === targetId)?.status ||
                    'locked';

                  const strokeColor = getConnectionColor(nodeState, targetState);

                  return (
                    <Line
                      key={`${node.id}-${targetId}`}
                      x1={startPos.x + 75}
                      y1={startPos.y + 42}
                      x2={endPos.x + 75}
                      y2={endPos.y + 42}
                      stroke={strokeColor}
                      strokeWidth={2.2}
                      strokeDasharray={
                        nodeState === 'locked' && targetState === 'locked' ? '4, 6' : '8, 4'
                      }
                    />
                  );
                });
              })}
            </Svg>

            {/* Relic Medallion Nodes */}
            {displayNodes.map((node) => {
              const currentStatus: NodeStatus = nodeStates[node.id] || node.status;
              const branchInfo = BRANCH_CONFIG[node.branch];
              const isSelected = selectedNode?.id === node.id;
              const completedCount = layerProgressMap[node.id] || 0;

              return (
                <TouchableOpacity
                  key={node.id}
                  style={[
                    styles.nodeContainer,
                    { left: node.position.x, top: node.position.y },
                  ]}
                  activeOpacity={0.85}
                  onPress={() => handleNodeTap(node)}
                >
                  {/* Outer Astrolabe Halo */}
                  <View
                    style={[
                      styles.medallionOuterRing,
                      { borderColor: isSelected ? COLORS.sand : branchInfo.color + '88' },
                      isSelected && styles.medallionOuterSelected,
                    ]}
                  >
                    {/* Inner Relic Medallion */}
                    <View
                      style={[
                        styles.medallionInner,
                        {
                          borderColor:
                            currentStatus === 'mastered' ? COLORS.nodeMastered : branchInfo.color,
                          backgroundColor:
                            currentStatus === 'mastered' ? '#12332B' : COLORS.cardActive,
                        },
                      ]}
                    >
                      <Text style={styles.nodeEmoji}>{node.emoji}</Text>

                      {/* 4-Dot Codex Progress Bar */}
                      <View style={styles.progressDotsRow}>
                        {[1, 2, 3, 4].map((dot) => (
                          <View
                            key={dot}
                            style={[
                              styles.progressDot,
                              completedCount >= dot && {
                                backgroundColor:
                                  currentStatus === 'mastered'
                                    ? COLORS.nodeMastered
                                    : COLORS.accent,
                              },
                            ]}
                          />
                        ))}
                      </View>
                    </View>

                    {currentStatus === 'mastered' && (
                      <View style={styles.masteredBadge}>
                        <Text style={styles.masteredBadgeText}>✓</Text>
                      </View>
                    )}
                  </View>

                  {/* Jewel-Accented Nameplate */}
                  <View
                    style={[
                      styles.nodeLabelBox,
                      { borderLeftColor: branchInfo.color },
                      isSelected && styles.nodeLabelBoxSelected,
                    ]}
                  >
                    <Text style={styles.nodeTitle} numberOfLines={1} ellipsizeMode="tail">
                      {node.title}
                    </Text>
                    <Text style={[styles.nodeBranchText, { color: branchInfo.color }]}>
                      {branchInfo.emoji} {branchInfo.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Interactive Quick-Inspect Relic Preview Card */}
      {selectedNode && selectedCodex && (
        <View style={styles.previewDrawer}>
          <View style={styles.previewTopRow}>
            {selectedPlate && (
              <Image
                source={selectedPlate.source}
                style={styles.previewThumb}
                resizeMode="cover"
              />
            )}
            <View style={styles.previewMeta}>
              <Text style={styles.previewTitle} numberOfLines={1}>
                {selectedNode.emoji} {selectedNode.title}
              </Text>
              <Text style={styles.previewEra} numberOfLines={1}>
                {selectedCodex.era}
              </Text>
              <Text style={styles.previewLoc} numberOfLines={1}>
                📍 {selectedCodex.location}
              </Text>
            </View>
          </View>

          <View style={styles.previewActions}>
            <TouchableOpacity
              style={[styles.previewNavBtn, selectedIdx <= 0 && { opacity: 0.35 }]}
              disabled={selectedIdx <= 0}
              onPress={() => {
                const prev = displayNodes[selectedIdx - 1];
                if (prev) {
                  setSelectedNodeId(prev.id);
                  focusOnNode(prev);
                }
              }}
            >
              <Text style={styles.previewNavText}>← Prev</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.openCodexBtn}
              onPress={() => navigation.navigate('NodeDetail', { nodeId: selectedNode.id })}
              activeOpacity={0.85}
            >
              <Text style={styles.openCodexText}>Open Codex Book →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.previewNavBtn,
                selectedIdx >= displayNodes.length - 1 && { opacity: 0.35 },
              ]}
              disabled={selectedIdx >= displayNodes.length - 1}
              onPress={() => {
                const next = displayNodes[selectedIdx + 1];
                if (next) {
                  setSelectedNodeId(next.id);
                  focusOnNode(next);
                }
              }}
            >
              <Text style={styles.previewNavText}>Next →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bgSurface,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  titleBlock: {
    flex: 1,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.sand,
    fontFamily: FONTS.serif,
  },
  headerCounter: {
    fontSize: 11,
    color: COLORS.moss,
    fontWeight: TYPOGRAPHY.weightSemiBold,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.cardActive,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  labBtn: {
    backgroundColor: COLORS.accent + '22',
    borderColor: COLORS.accent,
  },
  labBtnText: {
    fontSize: 11,
    color: COLORS.sand,
    fontWeight: TYPOGRAPHY.weightBold,
  },
  resetBtnText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weightSemiBold,
  },
  filterScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: RADII.full,
    backgroundColor: COLORS.cardLocked,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterPillActive: {
    backgroundColor: COLORS.accent + '2E',
    borderColor: COLORS.accent,
  },
  filterEmoji: {
    fontSize: 12,
  },
  filterPillText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weightMedium,
  },
  filterPillTextActive: {
    color: COLORS.sand,
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

  // Relic Medallion Node
  nodeContainer: {
    position: 'absolute',
    alignItems: 'center',
    width: 150,
    zIndex: 2,
  },
  medallionOuterRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 16, 27, 0.65)',
  },
  medallionOuterSelected: {
    borderStyle: 'solid',
    borderWidth: 2.5,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 12,
    elevation: 10,
    transform: [{ scale: 1.08 }],
  },
  medallionInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  nodeEmoji: {
    fontSize: 28,
  },
  progressDotsRow: {
    flexDirection: 'row',
    gap: 3,
  },
  progressDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.border,
  },
  masteredBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.nodeMastered,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.bg,
  },
  masteredBadgeText: {
    color: COLORS.bg,
    fontSize: 11,
    fontWeight: 'bold',
  },
  nodeLabelBox: {
    marginTop: 6,
    backgroundColor: COLORS.bgSurface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
    alignItems: 'flex-start',
    width: 146,
  },
  nodeLabelBoxSelected: {
    backgroundColor: COLORS.cardSelected,
    borderColor: COLORS.accent,
  },
  nodeTitle: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.textPrimary,
  },
  nodeBranchText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weightSemiBold,
    marginTop: 1,
  },

  // Quick-Inspect Preview Drawer
  previewDrawer: {
    backgroundColor: COLORS.bgSurface,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.accent,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 8,
  },
  previewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  previewThumb: {
    width: 50,
    height: 50,
    borderRadius: RADII.sm,
    borderWidth: 1.5,
    borderColor: PARCHMENT.goldLeaf,
  },
  previewMeta: {
    flex: 1,
  },
  previewTitle: {
    fontFamily: FONTS.serif,
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.textPrimary,
  },
  previewEra: {
    fontSize: 11,
    color: COLORS.sand,
    marginTop: 1,
  },
  previewLoc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  previewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  previewNavBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.cardActive,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewNavText: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weightSemiBold,
    color: COLORS.textSecondary,
  },
  openCodexBtn: {
    flex: 1,
    backgroundColor: COLORS.accent,
    paddingVertical: 9,
    borderRadius: RADII.sm,
    alignItems: 'center',
  },
  openCodexText: {
    fontFamily: FONTS.serif,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.bg,
  },
});
