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
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ARTIFACT_CASES } from '../../data/artifactCases';
import { useAppStore } from '../../store/useAppStore';
import { COLORS, TYPOGRAPHY, RADII } from '../../theme';
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

  function handleSelectOption(qId: string, optId: string) {
    setAnswers((prev) => ({ ...prev, [qId]: optId }));
  }

  // Check if all 3 questions answered
  const allAnswered = artifactCase.hypothesisQuestions.every((q) => answers[q.id]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backBtnText}>← Back to Node</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Artifact Detective</Text>
        <View style={{ width: 60 }} />
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
        {/* Artifact Title & Provenance Card */}
        <View style={styles.metadataCard}>
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

        {/* Interactive 2D Inspection Canvas with Hotspots */}
        <View style={styles.inspectionSection}>
          <Text style={styles.sectionHeader}>1. High-Resolution Surface Inspection</Text>
          <Text style={styles.sectionSub}>
            Tap the illuminated hotspots on the artifact to analyze surface wear, inscriptions, and manufacturing marks.
          </Text>

          <View style={styles.specimenCanvas}>
            {/* Specimen Visual Representation */}
            <View style={styles.specimenVisual}>
              <Text style={styles.specimenIcon}>{artifactCase.emoji}</Text>
              <Text style={styles.specimenCaption}>[ 360° Orthophoto Surface Model ]</Text>
            </View>

            {/* Hotspot Markers */}
            {artifactCase.hotspots.map((spot) => {
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
                  <Text style={styles.hotspotNumber}>●</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Active Hotspot Clue Card */}
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

  // Metadata Card
  metadataCard: {
    backgroundColor: COLORS.cardActive,
    borderRadius: RADII.md,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  metadataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  metadataEmoji: {
    fontSize: 40,
  },
  caseTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.sand,
  },
  casePeriod: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metaLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textMuted,
    width: 100,
  },
  metaValue: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textPrimary,
    flex: 1,
    fontWeight: TYPOGRAPHY.weightMedium,
  },

  // Inspection
  inspectionSection: {
    gap: 8,
  },
  sectionHeader: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.textPrimary,
  },
  sectionSub: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  specimenCanvas: {
    height: 240,
    backgroundColor: COLORS.cardLocked,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.borderActive,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  specimenVisual: {
    alignItems: 'center',
    gap: 8,
  },
  specimenIcon: {
    fontSize: 72,
  },
  specimenCaption: {
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 1,
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
    fontSize: 10,
  },
  clueCard: {
    backgroundColor: COLORS.cardActive,
    borderRadius: RADII.md,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderActive,
    gap: 6,
  },
  clueCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clueBadge: {
    backgroundColor: 'rgba(196, 131, 42, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADII.sm,
  },
  clueBadgeText: {
    fontSize: 10,
    color: COLORS.sand,
    fontWeight: TYPOGRAPHY.weightBold,
  },
  clueTitle: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  clueText: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
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
