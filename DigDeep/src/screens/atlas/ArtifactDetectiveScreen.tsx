// ============================================================
// DigDeep — Artifact Detective Inspection Suite (FR3B)
// High-resolution inspection, interactive surface hotspots,
// and 3-step structured Hypothesis Builder with deduction summary.
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ARTIFACT_CASES } from '../../data/artifactCases';
import { useAppStore } from '../../store/useAppStore';
import { COLORS, TYPOGRAPHY, RADII, PARCHMENT, FONTS } from '../../theme';
import { CASE_PAINTINGS } from '../../assets/paintings';
import type {
  AtlasStackParamList,
  ArtifactHotspot,
  HypothesisQuestion,
} from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type RouteProps = RouteProp<AtlasStackParamList, 'ArtifactDetective'>;
type NavProps = NativeStackNavigationProp<AtlasStackParamList, 'ArtifactDetective'>;

export default function ArtifactDetectiveScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavProps>();
  const { caseId } = route.params;
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0);

  const { profile } = useAppStore();
  const depthMode = profile?.depthMode || 'intuitive';

  // Load target case
  const artifactCase = ARTIFACT_CASES[caseId] || ARTIFACT_CASES['case-amphora-01'];

  // State
  const [selectedHotspot, setSelectedHotspot] = useState<ArtifactHotspot | null>(
    artifactCase.hotspots[0]
  );
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> optionId
  const [showDeduction, setShowDeduction] = useState<boolean>(false);

  // Switch between cases
  const availableCaseIds = Object.keys(ARTIFACT_CASES);
  const currentCaseIdx = availableCaseIds.indexOf(artifactCase.id);
  const prevCaseId = currentCaseIdx > 0 ? availableCaseIds[currentCaseIdx - 1] : null;
  const nextCaseId =
    currentCaseIdx >= 0 && currentCaseIdx < availableCaseIds.length - 1
      ? availableCaseIds[currentCaseIdx + 1]
      : null;
  const plate = CASE_PAINTINGS[artifactCase.id];

  function handleSelectOption(qId: string, optId: string) {
    setAnswers((prev) => ({ ...prev, [qId]: optId }));
  }

  // Check if all 3 questions answered
  const allAnswered = artifactCase.hypothesisQuestions.every((q) => answers[q.id]);

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgSurface} translucent />

      {/* Header with Back & Forward Case Navigation */}
      <View style={[styles.header, { paddingTop: topInset + 8 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔍 Artifact Codex</Text>
        <TouchableOpacity
          onPress={() => nextCaseId && navigation.replace('ArtifactDetective', { caseId: nextCaseId })}
          disabled={!nextCaseId}
          style={[styles.backBtn, !nextCaseId && { opacity: 0.35 }]}
          activeOpacity={0.7}
        >
          <Text style={styles.backBtnText}>Next →</Text>
        </TouchableOpacity>
      </View>

      {/* Case Selector Pills */}
      <View style={styles.casePickerRow}>
        {availableCaseIds.map((cId, idx) => {
          const c = ARTIFACT_CASES[cId];
          const isSelected = c.id === artifactCase.id;
          return (
            <TouchableOpacity
              key={cId}
              style={[
                styles.casePickerPill,
                isSelected && styles.casePickerPillActive,
              ]}
              onPress={() => {
                navigation.replace('ArtifactDetective', { caseId: cId });
              }}
            >
              <Text style={styles.casePickerEmoji}>{c.emoji}</Text>
              <Text
                style={[
                  styles.casePickerText,
                  isSelected && styles.casePickerTextActive,
                ]}
              >
                Case #{idx + 1}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Artifact Title & Provenance Parchment Card */}
        <View style={styles.parchmentCard}>
          <View style={styles.parchmentInner}>
            <View style={styles.metadataHeader}>
              <Text style={styles.metadataEmoji}>{artifactCase.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.caseTitle}>{artifactCase.title}</Text>
                <Text style={styles.casePeriod}>{artifactCase.period}</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Provenance:</Text>
              <Text style={styles.metaValue}>{artifactCase.provenance}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Material Fabric:</Text>
              <Text style={styles.metaValue}>{artifactCase.material}</Text>
            </View>
          </View>
        </View>

        {/* Interactive 2D Inspection Canvas with Painted Artifact & Hotspots */}
        <View style={styles.inspectionSection}>
          <Text style={styles.sectionHeader}>1. Illuminated Plate & Surface Inspection</Text>
          <Text style={styles.sectionSub}>
            Tap the numbered wax markers on the painted artifact to inspect wear, inscriptions, and manufacturing clues.
          </Text>

          <View style={styles.specimenCanvas}>
            {plate ? (
              <Image
                source={plate.source}
                style={styles.specimenPainting}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.specimenVisual}>
                <Text style={styles.specimenIcon}>{artifactCase.emoji}</Text>
              </View>
            )}
            <View style={styles.plateLabelOverlay}>
              <Text style={styles.specimenCaption}>
                {plate ? plate.plateNumber : 'Archival Plate'} · Tap pins 1–{artifactCase.hotspots.length}
              </Text>
            </View>

            {/* Hotspot Markers */}
            {artifactCase.hotspots.map((spot, idx) => {
              const isSelected = selectedHotspot?.id === spot.id;
              return (
                <TouchableOpacity
                  key={spot.id}
                  style={[
                    styles.hotspotPin,
                    { left: `${spot.xPercent}%`, top: `${spot.yPercent}%` },
                    isSelected && styles.hotspotPinActive,
                  ]}
                  onPress={() => setSelectedHotspot(spot)}
                  activeOpacity={0.8}
                >
                  <View style={styles.hotspotPulse} />
                  <Text style={styles.hotspotNumber}>{idx + 1}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Active Hotspot Clue Card (Handwritten Parchment Note) */}
          {selectedHotspot && (
            <View style={styles.clueCard}>
              <View style={styles.clueCardHeader}>
                <View style={styles.clueBadge}>
                  <Text style={styles.clueBadgeText}>{selectedHotspot.clueBadge}</Text>
                </View>
                <Text style={styles.clueTitle}>{selectedHotspot.title}</Text>
              </View>
              <Text style={styles.clueText}>
                {depthMode === 'intuitive'
                  ? selectedHotspot.observationIntuitive
                  : selectedHotspot.observationDeepDive}
              </Text>
            </View>
          )}
        </View>

        {/* 2. Structured Hypothesis Builder */}
        <View style={styles.hypothesisSection}>
          <Text style={styles.sectionHeader}>2. Archaeological Hypothesis Builder</Text>
          <Text style={styles.sectionSub}>
            Formulate your deduction by evaluating the physical clues against 3 historical criteria:
          </Text>

          {artifactCase.hypothesisQuestions.map((q, qIndex) => {
            const selectedOptId = answers[q.id];

            return (
              <View key={q.id} style={styles.questionCard}>
                <Text style={styles.questionTitle}>
                  Question {qIndex + 1}: {q.question}
                </Text>

                <View style={styles.optionsList}>
                  {q.options.map((opt) => {
                    const isChosen = selectedOptId === opt.id;
                    const showFeedback = !!selectedOptId;

                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={[
                          styles.optionBtn,
                          isChosen && styles.optionBtnChosen,
                          showFeedback && isChosen && opt.isCorrect && styles.optionCorrect,
                          showFeedback && isChosen && !opt.isCorrect && styles.optionIncorrect,
                        ]}
                        onPress={() => handleSelectOption(q.id, opt.id)}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.optionText}>{opt.text}</Text>
                        {showFeedback && isChosen && (
                          <Text style={styles.optionExplanation}>{opt.explanation}</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>

        {/* Unlock Deduction Summary CTA */}
        {allAnswered && !showDeduction && (
          <TouchableOpacity
            style={styles.unlockDeductionBtn}
            onPress={() => setShowDeduction(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.unlockDeductionText}>
              Unlock Full Archaeological Deduction Summary 📜
            </Text>
          </TouchableOpacity>
        )}

        {/* Deduction Summary Card */}
        {showDeduction && (
          <View style={styles.deductionCard}>
            <View style={styles.deductionHeader}>
              <Text style={styles.deductionBadge}>DEDUCTION SOLVED</Text>
              <Text style={styles.deductionTitle}>
                {artifactCase.deductionSummary.title}
              </Text>
            </View>

            <Text style={styles.deductionBody}>
              {depthMode === 'intuitive'
                ? artifactCase.deductionSummary.bodyIntuitive
                : artifactCase.deductionSummary.bodyDeepDive}
            </Text>

            <View style={styles.significanceBox}>
              <Text style={styles.significanceHeader}>Key Archaeological Significance:</Text>
              {artifactCase.deductionSummary.significancePoints.map((point, i) => (
                <View key={i} style={styles.significancePointRow}>
                  <Text style={styles.significanceBullet}>◆</Text>
                  <Text style={styles.significancePointText}>{point}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bottom Case Back / Forward Navigation */}
        <View style={styles.caseNavBar}>
          <TouchableOpacity
            style={[styles.caseNavBtn, !prevCaseId && { opacity: 0.35 }]}
            disabled={!prevCaseId}
            onPress={() => prevCaseId && navigation.replace('ArtifactDetective', { caseId: prevCaseId })}
          >
            <Text style={styles.caseNavBtnText}>← Prev Case</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.caseNavBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.caseNavBtnText}>Return to Folio</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.caseNavBtn, styles.caseNavBtnPrimary, !nextCaseId && { opacity: 0.35 }]}
            disabled={!nextCaseId}
            onPress={() => nextCaseId && navigation.replace('ArtifactDetective', { caseId: nextCaseId })}
          >
            <Text style={[styles.caseNavBtnText, { color: '#fff' }]}>Next Case →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backBtnText: {
    color: COLORS.sand,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.weightSemiBold,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.weightBold,
  },
  casePickerRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.bgSurface,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  casePickerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADII.full,
    backgroundColor: COLORS.cardLocked,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  casePickerPillActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  casePickerEmoji: {
    fontSize: 14,
  },
  casePickerText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weightMedium,
  },
  casePickerTextActive: {
    color: '#fff',
    fontWeight: TYPOGRAPHY.weightBold,
  },

  scroll: {
    padding: 16,
    paddingBottom: 40,
    gap: 20,
  },

  // Parchment Provenance Card
  parchmentCard: {
    backgroundColor: PARCHMENT.paper,
    borderRadius: RADII.md,
    padding: 6,
    borderWidth: 1.5,
    borderColor: PARCHMENT.borderDouble,
  },
  parchmentInner: {
    borderWidth: 1,
    borderColor: PARCHMENT.border,
    borderRadius: 6,
    padding: 12,
    gap: 8,
  },
  metadataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  metadataEmoji: {
    fontSize: 38,
  },
  caseTitle: {
    fontFamily: FONTS.handwriting,
    fontSize: 23,
    color: PARCHMENT.inkPrimary,
    lineHeight: 28,
  },
  casePeriod: {
    fontFamily: FONTS.serif,
    fontSize: TYPOGRAPHY.xs,
    fontStyle: 'italic',
    color: PARCHMENT.rubric,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metaLabel: {
    fontFamily: FONTS.serif,
    fontSize: TYPOGRAPHY.xs,
    color: PARCHMENT.inkMuted,
    fontWeight: TYPOGRAPHY.weightBold,
    width: 105,
  },
  metaValue: {
    fontFamily: FONTS.serif,
    fontSize: TYPOGRAPHY.xs,
    color: PARCHMENT.inkPrimary,
    flex: 1,
    fontWeight: TYPOGRAPHY.weightMedium,
  },

  // Inspection
  inspectionSection: {
    gap: 8,
  },
  sectionHeader: {
    fontFamily: FONTS.handwriting,
    fontSize: 22,
    color: COLORS.sand,
  },
  sectionSub: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  specimenCanvas: {
    height: 260,
    backgroundColor: PARCHMENT.paperDark,
    borderRadius: RADII.lg,
    borderWidth: 2,
    borderColor: PARCHMENT.goldLeaf,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  specimenPainting: {
    width: '100%',
    height: '100%',
  },
  plateLabelOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    backgroundColor: 'rgba(42, 27, 14, 0.78)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADII.full,
  },
  specimenVisual: {
    alignItems: 'center',
    gap: 8,
  },
  specimenIcon: {
    fontSize: 72,
  },
  specimenCaption: {
    fontFamily: FONTS.serif,
    fontSize: 10,
    color: PARCHMENT.paperHighlight,
    letterSpacing: 0.6,
  },
  hotspotPin: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(196, 131, 42, 0.4)',
    borderWidth: 2,
    borderColor: COLORS.sand,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -16 }, { translateY: -16 }],
  },
  hotspotPinActive: {
    backgroundColor: COLORS.accent,
    borderColor: '#fff',
    transform: [{ translateX: -16 }, { translateY: -16 }, { scale: 1.2 }],
  },
  hotspotPulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    opacity: 0.3,
  },
  hotspotNumber: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  clueCard: {
    backgroundColor: PARCHMENT.paper,
    borderRadius: RADII.md,
    padding: 14,
    borderWidth: 1.5,
    borderColor: PARCHMENT.borderDouble,
    gap: 6,
  },
  clueCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clueBadge: {
    backgroundColor: PARCHMENT.rubric,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADII.sm,
  },
  clueBadgeText: {
    fontSize: 10,
    color: PARCHMENT.paperHighlight,
    fontWeight: TYPOGRAPHY.weightBold,
  },
  clueTitle: {
    fontFamily: FONTS.handwriting,
    fontSize: 19,
    color: PARCHMENT.inkPrimary,
    flex: 1,
  },
  clueText: {
    fontFamily: FONTS.serif,
    fontSize: 14,
    color: PARCHMENT.inkSecondary,
    lineHeight: 22,
  },
  caseNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  caseNavBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.cardActive,
    borderWidth: 1,
    borderColor: COLORS.borderActive,
  },
  caseNavBtnPrimary: {
    backgroundColor: PARCHMENT.rubric,
    borderColor: PARCHMENT.waxSeal,
  },
  caseNavBtnText: {
    fontFamily: FONTS.serif,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.sand,
  },

  // Hypothesis Builder
  hypothesisSection: {
    gap: 12,
  },
  questionCard: {
    backgroundColor: COLORS.cardActive,
    borderRadius: RADII.md,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  questionTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  optionsList: {
    gap: 8,
  },
  optionBtn: {
    backgroundColor: COLORS.cardLocked,
    borderRadius: RADII.sm,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  optionBtnChosen: {
    borderColor: COLORS.sand,
    backgroundColor: COLORS.cardSelected,
  },
  optionCorrect: {
    borderColor: COLORS.moss,
    backgroundColor: 'rgba(90, 122, 58, 0.2)',
  },
  optionIncorrect: {
    borderColor: '#A83232',
    backgroundColor: 'rgba(168, 50, 50, 0.2)',
  },
  optionText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  optionExplanation: {
    fontSize: 11,
    color: COLORS.sand,
    lineHeight: 16,
    fontStyle: 'italic',
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
  },

  // Unlock CTA
  unlockDeductionBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADII.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  unlockDeductionText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.weightBold,
  },

  // Deduction Summary
  deductionCard: {
    backgroundColor: COLORS.cardSelected,
    borderRadius: RADII.lg,
    padding: 18,
    borderWidth: 1.5,
    borderColor: COLORS.moss,
    gap: 12,
  },
  deductionHeader: {
    gap: 4,
  },
  deductionBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.moss,
    letterSpacing: 1,
  },
  deductionTitle: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.sand,
  },
  deductionBody: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  significanceBox: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: RADII.sm,
    padding: 12,
    gap: 6,
  },
  significanceHeader: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.sand,
    marginBottom: 2,
  },
  significancePointRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
  },
  significanceBullet: {
    fontSize: 8,
    color: COLORS.moss,
    marginTop: 4,
  },
  significancePointText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
});
