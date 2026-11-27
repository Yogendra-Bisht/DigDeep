// ============================================================
// DigDeep — Site Codex & Illustrated Book Reader Screen
// Sections:
//   1. Overview — Single long-form illuminated manuscript page
//   2. Gallery  — Curated watercolor plates with fullscreen lightbox
//   3. Facts    — Bite-sized archaeological curiosities & secrets
//   4. Explore  — Era, key figures, interactive labs & linked sites
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppStore } from '../../store/useAppStore';
import { markLayerComplete, getCompletedLayers } from '../../storage/database';
import { COLORS, TYPOGRAPHY, RADII, PARCHMENT, FONTS } from '../../theme';
import { NODE_PAINTINGS, type PaintingPlate } from '../../assets/paintings';
import { getSiteCodexEntry } from '../../data/siteCodexData';
import AncientBookPage from '../../components/AncientBookPage';
import type { AtlasStackParamList, DepthMode } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type RouteProps = RouteProp<AtlasStackParamList, 'NodeDetail'>;
type NavProps = NativeStackNavigationProp<AtlasStackParamList, 'NodeDetail'>;

type CodexSection = 'overview' | 'gallery' | 'facts' | 'explore';

const SECTIONS: { id: CodexSection; index: number; label: string; icon: string; color: string }[] = [
  { id: 'overview', index: 1, label: 'Overview', icon: '📜', color: COLORS.layerHook },
  { id: 'gallery', index: 2, label: 'Gallery', icon: '🖼️', color: COLORS.layerWhy },
  { id: 'facts', index: 3, label: 'Facts', icon: '✨', color: COLORS.layerEvidence },
  { id: 'explore', index: 4, label: 'Explore', icon: '🧭', color: COLORS.layerInvestigate },
];

export default function NodeDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavProps>();
  const { nodeId } = route.params;
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0);

  const { atlasNodes, profile, setDepthMode, updateNodeState } = useAppStore();
  const [activeSection, setActiveSection] = useState<CodexSection>('overview');
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Find target node & adjacent nodes for Back/Forward navigation
  const currentIndex = atlasNodes.findIndex((n) => n.id === nodeId);
  const node = currentIndex >= 0 ? atlasNodes[currentIndex] : undefined;
  const prevNode = currentIndex > 0 ? atlasNodes[currentIndex - 1] : null;
  const nextNode = currentIndex >= 0 && currentIndex < atlasNodes.length - 1 ? atlasNodes[currentIndex + 1] : null;
  const depthMode: DepthMode = profile?.depthMode || 'intuitive';

  useEffect(() => {
    setActiveSection('overview');
    setLightboxIndex(null);
    const done = getCompletedLayers(nodeId);
    setCompletedSections(done);
    if (!done.includes(1)) {
      markLayerComplete(nodeId, 1);
      setCompletedSections((prev) => [...prev, 1]);
    }
  }, [nodeId]);

  if (!node) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Site not found in Atlas</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Return to Atlas</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const codex = getSiteCodexEntry(node.id);
  const primaryPlate = NODE_PAINTINGS[node.id] || codex.gallery[0];
  const sectionIdx = SECTIONS.findIndex((s) => s.id === activeSection);

  function handleSelectSection(sectionId: CodexSection) {
    setActiveSection(sectionId);
    const meta = SECTIONS.find((s) => s.id === sectionId);
    if (meta && !completedSections.includes(meta.index)) {
      markLayerComplete(nodeId, meta.index);
      const updated = [...completedSections, meta.index];
      setCompletedSections(updated);
      if (updated.length >= 4) {
        updateNodeState(nodeId, 'mastered');
      }
    }
  }

  // Combine all 4 layers into one rich, long-form overview narrative
  const combinedOverviewBody = node.layers
    .map((layer) =>
      depthMode === 'intuitive' ? layer.contentIntuitive : layer.contentDeepDive
    )
    .join('\n\n');

  // Check if node has an interactive simulator (Artifact Detective or Stratigraphy Dig)
  const interactiveLayer = node.layers.find(
    (l) => l.interactiveType === 'artifact' || l.interactiveType === 'dig'
  );

  function handleLaunchInteractive() {
    if (!interactiveLayer) return;
    if (interactiveLayer.interactiveType === 'artifact') {
      const caseId = interactiveLayer.interactiveRefId || 'case-amphora-01';
      navigation.navigate('ArtifactDetective', { caseId });
    } else if (interactiveLayer.interactiveType === 'dig') {
      navigation.navigate('StratigraphyDig', { siteId: nodeId });
    }
  }

  // Connected nodes for Explore section
  const connectedNodes = atlasNodes.filter((n) => node.connections.includes(n.id));

  // Page-turner handlers
  const handlePrev =
    sectionIdx > 0
      ? () => handleSelectSection(SECTIONS[sectionIdx - 1].id)
      : prevNode
      ? () => navigation.replace('NodeDetail', { nodeId: prevNode.id })
      : undefined;

  const handleNext =
    sectionIdx < SECTIONS.length - 1
      ? () => handleSelectSection(SECTIONS[sectionIdx + 1].id)
      : nextNode
      ? () => navigation.replace('NodeDetail', { nodeId: nextNode.id })
      : undefined;

  const prevLabel = sectionIdx > 0 ? `← ${SECTIONS[sectionIdx - 1].label}` : '← Prev Site';
  const nextLabel =
    sectionIdx < SECTIONS.length - 1
      ? `${SECTIONS[sectionIdx + 1].label} →`
      : 'Next Site →';

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgSurface} translucent />

      {/* Top Header with Back, Depth Toggle & Next Site */}
      <View style={[styles.header, { paddingTop: topInset + 8 }]}>
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

        <TouchableOpacity
          onPress={() => nextNode && navigation.replace('NodeDetail', { nodeId: nextNode.id })}
          disabled={!nextNode}
          style={[styles.backButton, !nextNode && { opacity: 0.35 }]}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>

      {/* Node Info Banner */}
      <View style={styles.nodeBanner}>
        <Text style={styles.nodeBannerEmoji}>{node.emoji}</Text>
        <View style={styles.nodeBannerContent}>
          <Text style={styles.nodeBannerTitle}>{node.title}</Text>
          <Text style={styles.nodeBannerSub}>{codex.era} · {codex.location}</Text>
        </View>
      </View>

      {/* 4 Section Tabs: Overview | Gallery | Facts | Explore */}
      <View style={styles.sectionTabsContainer}>
        {SECTIONS.map((sec) => {
          const isActive = activeSection === sec.id;
          const isDone = completedSections.includes(sec.index);

          return (
            <TouchableOpacity
              key={sec.id}
              style={[
                styles.sectionTab,
                isActive && {
                  borderColor: sec.color,
                  backgroundColor: COLORS.cardSelected,
                },
              ]}
              onPress={() => handleSelectSection(sec.id)}
              activeOpacity={0.75}
            >
              <View style={styles.sectionTabTop}>
                <Text style={styles.sectionTabIcon}>{sec.icon}</Text>
                {isDone && <Text style={styles.sectionDoneBadge}>✓</Text>}
              </View>
              <Text
                style={[
                  styles.sectionTabLabel,
                  isActive && { color: sec.color, fontWeight: 'bold' },
                ]}
              >
                {sec.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Ancient Illuminated Book Reader */}
      <ScrollView
        contentContainerStyle={styles.contentScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION 1: OVERVIEW (Single Long-Form Illustrated Page) */}
        {activeSection === 'overview' && (
          <AncientBookPage
            folioTitle={node.title}
            folioSubtitle={`${codex.era} · ${codex.location}`}
            plate={primaryPlate}
            badgeText="SITE OVERVIEW · COMPLETE CODEX"
            badgeColor={PARCHMENT.rubric}
            bodyText={combinedOverviewBody}
            modeLabel={
              depthMode === 'intuitive'
                ? '🌱 Intuitive Explorer Edition'
                : '🔬 Deep Dive Researcher Edition'
            }
            pageIndicator="Folio I / IV"
            onPrevPage={handlePrev}
            prevLabel={prevLabel}
            onNextPage={handleNext}
            nextLabel={nextLabel}
          >
            {interactiveLayer && (
              <View style={styles.interactiveParchmentBox}>
                <Text style={styles.interactiveParchmentTitle}>
                  {interactiveLayer.interactiveType === 'artifact'
                    ? '🔍 Inspect Site Artifact Plate'
                    : '⛏️ Enter Stratigraphy Trench'}
                </Text>
                <Text style={styles.interactiveParchmentDesc}>
                  {interactiveLayer.interactiveType === 'artifact'
                    ? 'Launch the interactive Artifact Detective lab to examine surface hotspots on this site’s specimen.'
                    : 'Excavate the soil strata layer-by-layer in the Stratigraphy Simulator.'}
                </Text>
                <TouchableOpacity
                  style={styles.launchBtn}
                  onPress={handleLaunchInteractive}
                  activeOpacity={0.8}
                >
                  <Text style={styles.launchBtnText}>
                    {interactiveLayer.interactiveType === 'artifact'
                      ? 'Open Artifact Detective →'
                      : 'Launch Dig Simulator →'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </AncientBookPage>
        )}

        {/* SECTION 2: IMAGE & PAINTING GALLERY */}
        {activeSection === 'gallery' && (
          <AncientBookPage
            folioTitle={`${node.title}`}
            folioSubtitle={`Archival Paintings & Field Illustrations (${codex.gallery.length} Plates)`}
            badgeText="ILLUMINATED ART GALLERY"
            badgeColor={PARCHMENT.goldLeaf}
            bodyText="Each watercolour plate below was drawn in the spirit of 19th-century field expedition notebooks. Tap any framed painting to inspect it in full-screen museum detail."
            pageIndicator="Folio II / IV"
            onPrevPage={handlePrev}
            prevLabel={prevLabel}
            onNextPage={handleNext}
            nextLabel={nextLabel}
          >
            <View style={styles.galleryGrid}>
              {codex.gallery.map((item: PaintingPlate, idx: number) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.galleryCard}
                  activeOpacity={0.9}
                  onPress={() => setLightboxIndex(idx)}
                >
                  <View style={styles.galleryCardHeader}>
                    <Text style={styles.galleryPlateNum}>{item.plateNumber}</Text>
                    <Text style={styles.galleryZoomHint}>🔍 Tap to zoom</Text>
                  </View>
                  <View style={styles.galleryImageFrame}>
                    <Image
                      source={item.source}
                      style={styles.galleryImage}
                      resizeMode="cover"
                    />
                  </View>
                  <Text style={styles.galleryCaption}>{item.caption}</Text>
                  <Text style={styles.galleryNote}>✍ {item.curatorNote}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </AncientBookPage>
        )}

        {/* SECTION 3: INTERESTING FACTS */}
        {activeSection === 'facts' && (
          <AncientBookPage
            folioTitle={node.title}
            folioSubtitle="Curiosities, Field Secrets & Surprising Discoveries"
            badgeText="CURIOSITIES & FACTS"
            badgeColor={PARCHMENT.rubric}
            bodyText={`Collected from excavation diaries, laboratory forensics, and epigraphic archives at ${node.title}.`}
            modeLabel={
              depthMode === 'intuitive'
                ? '🌱 Intuitive Explorer Facts'
                : '🔬 Deep Dive Technical Facts'
            }
            pageIndicator="Folio III / IV"
            onPrevPage={handlePrev}
            prevLabel={prevLabel}
            onNextPage={handleNext}
            nextLabel={nextLabel}
          >
            <View style={styles.factsList}>
              {codex.facts.map((fact, idx) => (
                <View key={idx} style={styles.factCard}>
                  <View style={styles.factHeader}>
                    <View style={styles.factSeal}>
                      <Text style={styles.factSealNum}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.factTitle}>{fact.title}</Text>
                  </View>
                  <Text style={styles.factBody}>
                    {depthMode === 'intuitive' ? fact.intuitive : fact.deepDive}
                  </Text>
                </View>
              ))}
            </View>
          </AncientBookPage>
        )}

        {/* SECTION 4: EXPLORE (Timeline, Key Figures, Highlights & Linked Sites) */}
        {activeSection === 'explore' && (
          <AncientBookPage
            folioTitle={node.title}
            folioSubtitle="Chronology, Key Excavators & Connected Atlas Sites"
            badgeText="FIELD DOSSIER & CONNECTIONS"
            badgeColor={PARCHMENT.inkPrimary}
            bodyText={node.subtitle}
            pageIndicator="Folio IV / IV"
            onPrevPage={handlePrev}
            prevLabel={prevLabel}
            onNextPage={handleNext}
            nextLabel={nextLabel}
          >
            {/* Dossier Metadata */}
            <View style={styles.dossierBox}>
              <View style={styles.dossierRow}>
                <Text style={styles.dossierLabel}>Chronology:</Text>
                <Text style={styles.dossierValue}>{codex.era}</Text>
              </View>
              <View style={styles.dossierRow}>
                <Text style={styles.dossierLabel}>Region:</Text>
                <Text style={styles.dossierValue}>{codex.location}</Text>
              </View>
              <View style={styles.dossierRow}>
                <Text style={styles.dossierLabel}>Key Figures:</Text>
                <Text style={styles.dossierValue}>{codex.keyFigure}</Text>
              </View>
            </View>

            {/* Key Takeaways */}
            <View style={styles.highlightsBox}>
              <Text style={styles.highlightsHeading}>✦ Key Archaeological Takeaways</Text>
              {codex.highlights.map((pt, i) => (
                <View key={i} style={styles.highlightRow}>
                  <Text style={styles.highlightBullet}>◆</Text>
                  <Text style={styles.highlightText}>{pt}</Text>
                </View>
              ))}
            </View>

            {/* Interactive Lab Launcher */}
            {interactiveLayer && (
              <View style={styles.interactiveParchmentBox}>
                <Text style={styles.interactiveParchmentTitle}>
                  {interactiveLayer.interactiveType === 'artifact'
                    ? '🔍 Artifact Detective Suite'
                    : '⛏️ Stratigraphy Dig Simulator'}
                </Text>
                <Text style={styles.interactiveParchmentDesc}>
                  Put your knowledge into practice with this site’s interactive lab.
                </Text>
                <TouchableOpacity
                  style={styles.launchBtn}
                  onPress={handleLaunchInteractive}
                  activeOpacity={0.8}
                >
                  <Text style={styles.launchBtnText}>
                    {interactiveLayer.interactiveType === 'artifact'
                      ? 'Open Artifact Detective →'
                      : 'Launch Dig Simulator →'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Connected Atlas Sites */}
            {connectedNodes.length > 0 && (
              <View style={styles.connectedSection}>
                <Text style={styles.connectedHeading}>🗺️ Connected Sites on the Atlas</Text>
                <View style={styles.connectedChips}>
                  {connectedNodes.map((cn) => (
                    <TouchableOpacity
                      key={cn.id}
                      style={styles.connectedChip}
                      onPress={() => navigation.replace('NodeDetail', { nodeId: cn.id })}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.connectedChipEmoji}>{cn.emoji}</Text>
                      <Text style={styles.connectedChipText}>{cn.title} →</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </AncientBookPage>
        )}
      </ScrollView>

      {/* Gallery Fullscreen Lightbox Modal with Prev/Next */}
      {lightboxIndex !== null && codex.gallery[lightboxIndex] && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setLightboxIndex(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalPlateNum}>
                {codex.gallery[lightboxIndex].plateNumber} ({lightboxIndex + 1} / {codex.gallery.length})
              </Text>
              <Image
                source={codex.gallery[lightboxIndex].source}
                style={styles.modalImage}
                resizeMode="contain"
              />
              <Text style={styles.modalCaption}>
                {codex.gallery[lightboxIndex].caption}
              </Text>
              <Text style={styles.modalNote}>
                ✍ {codex.gallery[lightboxIndex].curatorNote}
              </Text>

              <View style={styles.modalNavRow}>
                <TouchableOpacity
                  style={[styles.modalNavBtn, lightboxIndex === 0 && { opacity: 0.35 }]}
                  disabled={lightboxIndex === 0}
                  onPress={() => setLightboxIndex(lightboxIndex - 1)}
                >
                  <Text style={styles.modalNavText}>← Prev</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setLightboxIndex(null)}
                >
                  <Text style={styles.modalCloseText}>Close ✕</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalNavBtn,
                    lightboxIndex === codex.gallery.length - 1 && { opacity: 0.35 },
                  ]}
                  disabled={lightboxIndex === codex.gallery.length - 1}
                  onPress={() => setLightboxIndex(lightboxIndex + 1)}
                >
                  <Text style={styles.modalNavText}>Next →</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bgSurface,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backButtonText: {
    color: COLORS.sand,
    fontSize: TYPOGRAPHY.sm,
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
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: COLORS.cardActive,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  nodeBannerEmoji: {
    fontSize: 32,
  },
  nodeBannerContent: {
    flex: 1,
  },
  nodeBannerTitle: {
    fontFamily: FONTS.serif,
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.textPrimary,
  },
  nodeBannerSub: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Section Tabs
  sectionTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: COLORS.bgSurface,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTab: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.cardLocked,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    gap: 3,
  },
  sectionTabTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionTabIcon: {
    fontSize: 15,
  },
  sectionDoneBadge: {
    fontSize: 10,
    color: COLORS.nodeMastered,
    fontWeight: 'bold',
  },
  sectionTabLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weightMedium,
  },

  // Scroll
  contentScroll: {
    padding: 16,
    paddingBottom: 40,
  },

  // Gallery inside Parchment
  galleryGrid: {
    marginTop: 14,
    gap: 16,
  },
  galleryCard: {
    backgroundColor: PARCHMENT.paperDark,
    borderRadius: RADII.sm,
    borderWidth: 1.5,
    borderColor: PARCHMENT.borderDouble,
    padding: 10,
  },
  galleryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  galleryPlateNum: {
    fontFamily: FONTS.handwriting,
    fontSize: 18,
    color: PARCHMENT.rubric,
  },
  galleryZoomHint: {
    fontFamily: FONTS.serif,
    fontSize: 11,
    color: PARCHMENT.inkMuted,
  },
  galleryImageFrame: {
    borderWidth: 1.5,
    borderColor: PARCHMENT.borderDouble,
    padding: 3,
    backgroundColor: PARCHMENT.paper,
    borderRadius: 4,
  },
  galleryImage: {
    width: '100%',
    height: 185,
    borderRadius: 2,
  },
  galleryCaption: {
    fontFamily: FONTS.serif,
    fontSize: 13.5,
    fontWeight: '700',
    color: PARCHMENT.inkPrimary,
    marginTop: 8,
  },
  galleryNote: {
    fontFamily: FONTS.handwriting,
    fontSize: 16,
    color: PARCHMENT.inkSecondary,
    marginTop: 3,
    lineHeight: 21,
  },

  // Facts inside Parchment
  factsList: {
    marginTop: 14,
    gap: 12,
  },
  factCard: {
    backgroundColor: PARCHMENT.paperDark,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: PARCHMENT.border,
    borderLeftWidth: 3.5,
    borderLeftColor: PARCHMENT.rubric,
    padding: 12,
    gap: 6,
  },
  factHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  factSeal: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: PARCHMENT.rubric,
    justifyContent: 'center',
    alignItems: 'center',
  },
  factSealNum: {
    color: PARCHMENT.paperHighlight,
    fontFamily: FONTS.serif,
    fontSize: 12,
    fontWeight: 'bold',
  },
  factTitle: {
    flex: 1,
    fontFamily: FONTS.handwriting,
    fontSize: 20,
    color: PARCHMENT.inkPrimary,
  },
  factBody: {
    fontFamily: FONTS.serif,
    fontSize: 14,
    lineHeight: 22,
    color: PARCHMENT.inkSecondary,
  },

  // Explore Dossier inside Parchment
  dossierBox: {
    marginTop: 14,
    backgroundColor: PARCHMENT.paperDark,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: PARCHMENT.border,
    padding: 12,
    gap: 8,
  },
  dossierRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dossierLabel: {
    fontFamily: FONTS.serif,
    fontSize: 12.5,
    fontWeight: '700',
    color: PARCHMENT.rubric,
    width: 92,
  },
  dossierValue: {
    flex: 1,
    fontFamily: FONTS.serif,
    fontSize: 12.5,
    color: PARCHMENT.inkPrimary,
    lineHeight: 18,
  },
  highlightsBox: {
    marginTop: 14,
    gap: 8,
  },
  highlightsHeading: {
    fontFamily: FONTS.handwriting,
    fontSize: 20,
    color: PARCHMENT.rubric,
  },
  highlightRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  highlightBullet: {
    color: PARCHMENT.goldLeaf,
    fontSize: 12,
    marginTop: 3,
  },
  highlightText: {
    flex: 1,
    fontFamily: FONTS.serif,
    fontSize: 14,
    lineHeight: 21,
    color: PARCHMENT.inkPrimary,
  },
  connectedSection: {
    marginTop: 16,
    gap: 8,
  },
  connectedHeading: {
    fontFamily: FONTS.handwriting,
    fontSize: 20,
    color: PARCHMENT.inkPrimary,
  },
  connectedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  connectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: PARCHMENT.paperDark,
    borderWidth: 1,
    borderColor: PARCHMENT.borderDouble,
    borderRadius: RADII.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  connectedChipEmoji: {
    fontSize: 14,
  },
  connectedChipText: {
    fontFamily: FONTS.serif,
    fontSize: 12,
    fontWeight: '700',
    color: PARCHMENT.inkPrimary,
  },

  // Interactive Launch Card
  interactiveParchmentBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: RADII.sm,
    backgroundColor: PARCHMENT.paperDark,
    borderWidth: 1.5,
    borderColor: PARCHMENT.goldLeaf,
    gap: 6,
  },
  interactiveParchmentTitle: {
    fontFamily: FONTS.handwriting,
    fontSize: 20,
    color: PARCHMENT.rubric,
  },
  interactiveParchmentDesc: {
    fontFamily: FONTS.serif,
    fontSize: 13,
    color: PARCHMENT.inkSecondary,
    lineHeight: 20,
  },
  launchBtn: {
    marginTop: 8,
    borderRadius: RADII.sm,
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: PARCHMENT.rubric,
    borderWidth: 1,
    borderColor: PARCHMENT.waxSeal,
  },
  launchBtnText: {
    fontFamily: FONTS.serif,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weightBold,
    color: PARCHMENT.paperHighlight,
  },

  // Lightbox Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 13, 10, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  modalCard: {
    width: '100%',
    backgroundColor: PARCHMENT.paper,
    borderRadius: RADII.md,
    borderWidth: 2,
    borderColor: PARCHMENT.goldLeaf,
    padding: 16,
    alignItems: 'center',
  },
  modalPlateNum: {
    fontFamily: FONTS.handwriting,
    fontSize: 22,
    color: PARCHMENT.rubric,
    marginBottom: 8,
  },
  modalImage: {
    width: SCREEN_WIDTH - 72,
    height: 270,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: PARCHMENT.borderDouble,
  },
  modalCaption: {
    fontFamily: FONTS.serif,
    fontSize: 14,
    fontWeight: '700',
    color: PARCHMENT.inkPrimary,
    textAlign: 'center',
    marginTop: 10,
  },
  modalNote: {
    fontFamily: FONTS.handwriting,
    fontSize: 17,
    color: PARCHMENT.inkSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  modalNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 16,
    gap: 10,
  },
  modalNavBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: PARCHMENT.borderDouble,
    backgroundColor: PARCHMENT.paperDark,
  },
  modalNavText: {
    fontFamily: FONTS.serif,
    fontSize: 12,
    fontWeight: '700',
    color: PARCHMENT.inkPrimary,
  },
  modalCloseBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    backgroundColor: PARCHMENT.rubric,
    borderRadius: 8,
  },
  modalCloseText: {
    color: PARCHMENT.paperHighlight,
    fontFamily: FONTS.serif,
    fontWeight: '700',
    fontSize: 12,
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
