// ============================================================
// DigDeep — Ancient Illuminated Book Page Component
// Renders content inside an aged parchment codex folio with:
//   • Layered book spine & page-edge shadows
//   • Double-ruled sepia border & corner flourishes
//   • Watercolor artifact painting plate with handwritten caption
//   • Illuminated rubricated drop-cap typography
//   • Handwritten cursive curator margin notes
//   • Interactive Back / Forward folio page-turner
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { PARCHMENT, FONTS, TYPOGRAPHY, RADII } from '../theme';
import type { PaintingPlate } from '../assets/paintings';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AncientBookPageProps {
  folioTitle: string;
  folioSubtitle?: string;
  plate?: PaintingPlate;
  bodyText: string;
  badgeText?: string;
  badgeColor?: string;
  modeLabel?: string;
  children?: React.ReactNode;
  onPrevPage?: () => void;
  prevLabel?: string;
  onNextPage?: () => void;
  nextLabel?: string;
  pageIndicator?: string;
}

export default function AncientBookPage({
  folioTitle,
  folioSubtitle,
  plate,
  bodyText,
  badgeText,
  badgeColor = PARCHMENT.rubric,
  modeLabel,
  children,
  onPrevPage,
  prevLabel = '← Previous',
  onNextPage,
  nextLabel = 'Next Page →',
  pageIndicator,
}: AncientBookPageProps) {
  const [zoomVisible, setZoomVisible] = useState(false);

  const trimmed = bodyText.trim();
  const paragraphs = trimmed.split(/\n\s*\n/).filter(Boolean);
  const firstPara = paragraphs[0] || '';
  const extraParas = paragraphs.slice(1);
  const dropCap = firstPara.length > 0 ? firstPara.charAt(0) : '';
  const restOfFirstPara = firstPara.length > 1 ? firstPara.slice(1) : '';

  return (
    <View style={styles.bookWrapper}>
      {/* Stacked underlying page edges (3D book depth) */}
      <View style={styles.pageStackBottom2} />
      <View style={styles.pageStackBottom1} />

      {/* Main Parchment Folio */}
      <View style={styles.parchmentSheet}>
        {/* Left Spine Crease Shadow */}
        <View style={styles.spineShadow} />

        {/* Outer & Inner Hand-Ruled Border */}
        <View style={styles.outerFrame}>
          <View style={styles.innerFrame}>
            {/* Top Corner Flourishes & Folio Header */}
            <View style={styles.folioTopRow}>
              <Text style={styles.cornerFlourish}>❦</Text>
              <Text style={styles.folioHeaderStamp} numberOfLines={1}>
                {plate ? plate.plateNumber : 'ARCHIVAL CODEX'}
              </Text>
              <Text style={styles.cornerFlourish}>❦</Text>
            </View>

            {/* Handwritten Folio Title */}
            <Text style={styles.handwrittenTitle}>{folioTitle}</Text>
            {folioSubtitle ? (
              <Text style={styles.folioSubtitle}>{folioSubtitle}</Text>
            ) : null}

            {/* Rubricated Divider Rule */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerDiamond}>✦</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Optional Layer / Category Seal */}
            {badgeText ? (
              <View style={[styles.sealBadge, { borderColor: badgeColor }]}>
                <Text style={[styles.sealBadgeText, { color: badgeColor }]}>
                  {badgeText}
                </Text>
              </View>
            ) : null}

            {/* Artifact / Site Watercolor Painting Plate */}
            {plate ? (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setZoomVisible(true)}
                style={styles.plateContainer}
              >
                <View style={styles.plateFrame}>
                  <Image
                    source={plate.source}
                    style={styles.plateImage}
                    resizeMode="cover"
                  />
                  <View style={styles.plateZoomPill}>
                    <Text style={styles.plateZoomText}>🔍 Tap to inspect plate</Text>
                  </View>
                </View>
                <Text style={styles.plateCaption}>{plate.caption}</Text>
              </TouchableOpacity>
            ) : null}

            {/* Illuminated Drop-Cap + Serif Manuscript Body */}
            <View style={styles.manuscriptBodyBox}>
              <View style={styles.dropCapRow}>
                {dropCap ? (
                  <View style={styles.dropCapBox}>
                    <Text style={styles.dropCapLetter}>{dropCap}</Text>
                  </View>
                ) : null}
                <Text style={styles.manuscriptBodyText}>
                  {restOfFirstPara}
                </Text>
              </View>

              {extraParas.map((para, idx) => (
                <Text key={idx} style={styles.extraParagraphText}>
                  {para}
                </Text>
              ))}
            </View>

            {/* Handwritten Margin Note */}
            {plate?.curatorNote ? (
              <View style={styles.marginNoteBox}>
                <Text style={styles.marginNoteHeading}>✍ Field Marginalia:</Text>
                <Text style={styles.marginNoteText}>{plate.curatorNote}</Text>
              </View>
            ) : null}

            {/* Extra interactive widgets passed from screen */}
            {children}

            {/* Mode Stamp */}
            {modeLabel ? (
              <Text style={styles.modeStamp}>{modeLabel}</Text>
            ) : null}

            {/* Book Page-Turner Navigation (Back / Forward) */}
            {(onPrevPage || onNextPage) && (
              <View style={styles.pageTurnerBar}>
                <TouchableOpacity
                  style={[
                    styles.turnBtn,
                    !onPrevPage && styles.turnBtnDisabled,
                  ]}
                  onPress={onPrevPage}
                  disabled={!onPrevPage}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.turnBtnText,
                      !onPrevPage && styles.turnBtnTextDisabled,
                    ]}
                  >
                    {prevLabel}
                  </Text>
                </TouchableOpacity>

                {pageIndicator ? (
                  <Text style={styles.pageIndicator}>{pageIndicator}</Text>
                ) : null}

                <TouchableOpacity
                  style={[
                    styles.turnBtn,
                    styles.turnBtnForward,
                    !onNextPage && styles.turnBtnDisabled,
                  ]}
                  onPress={onNextPage}
                  disabled={!onNextPage}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.turnBtnText,
                      styles.turnBtnForwardText,
                      !onNextPage && styles.turnBtnTextDisabled,
                    ]}
                  >
                    {nextLabel}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Fullscreen Plate Inspection Modal */}
      {plate && (
        <Modal
          visible={zoomVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setZoomVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalPlateNum}>{plate.plateNumber}</Text>
              <Image
                source={plate.source}
                style={styles.modalImage}
                resizeMode="contain"
              />
              <Text style={styles.modalCaption}>{plate.caption}</Text>
              <Text style={styles.modalNote}>✍ {plate.curatorNote}</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setZoomVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCloseText}>Close Plate ✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bookWrapper: {
    position: 'relative',
    marginBottom: 18,
  },
  pageStackBottom2: {
    position: 'absolute',
    left: 6,
    right: -4,
    top: 6,
    bottom: -6,
    backgroundColor: PARCHMENT.paperShadow,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: PARCHMENT.borderDouble,
  },
  pageStackBottom1: {
    position: 'absolute',
    left: 3,
    right: -2,
    top: 3,
    bottom: -3,
    backgroundColor: PARCHMENT.paperDark,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: PARCHMENT.border,
  },
  parchmentSheet: {
    backgroundColor: PARCHMENT.paper,
    borderRadius: RADII.md,
    borderWidth: 1.5,
    borderColor: PARCHMENT.borderDouble,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  spineShadow: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 10,
    backgroundColor: 'rgba(92, 60, 28, 0.14)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(92, 60, 28, 0.18)',
  },
  outerFrame: {
    margin: 8,
    marginLeft: 14,
    borderWidth: 1.5,
    borderColor: PARCHMENT.borderDouble,
    borderRadius: 6,
    padding: 3,
  },
  innerFrame: {
    borderWidth: 0.75,
    borderColor: PARCHMENT.border,
    borderRadius: 4,
    padding: 14,
  },
  folioTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cornerFlourish: {
    fontSize: 16,
    color: PARCHMENT.rubric,
  },
  folioHeaderStamp: {
    fontFamily: FONTS.handwriting,
    fontSize: 15,
    color: PARCHMENT.inkMuted,
    letterSpacing: 1,
  },
  handwrittenTitle: {
    fontFamily: FONTS.handwriting,
    fontSize: 28,
    color: PARCHMENT.inkPrimary,
    textAlign: 'center',
    lineHeight: 34,
    marginTop: 2,
  },
  folioSubtitle: {
    fontFamily: FONTS.serif,
    fontSize: 12,
    fontStyle: 'italic',
    color: PARCHMENT.inkSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: PARCHMENT.border,
  },
  dividerDiamond: {
    fontSize: 12,
    color: PARCHMENT.goldLeaf,
  },
  sealBadge: {
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: 'rgba(139, 38, 29, 0.06)',
    marginBottom: 12,
  },
  sealBadgeText: {
    fontFamily: FONTS.serif,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  plateContainer: {
    marginBottom: 14,
  },
  plateFrame: {
    borderWidth: 2,
    borderColor: PARCHMENT.borderDouble,
    backgroundColor: PARCHMENT.paperDark,
    padding: 4,
    borderRadius: 4,
    position: 'relative',
  },
  plateImage: {
    width: '100%',
    height: 195,
    borderRadius: 2,
  },
  plateZoomPill: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(42, 27, 14, 0.78)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  plateZoomText: {
    color: PARCHMENT.paperHighlight,
    fontSize: 11,
    fontFamily: FONTS.serif,
  },
  plateCaption: {
    fontFamily: FONTS.handwriting,
    fontSize: 15,
    color: PARCHMENT.inkSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  manuscriptBodyBox: {
    marginTop: 4,
  },
  dropCapRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dropCapBox: {
    width: 42,
    height: 44,
    borderWidth: 1.5,
    borderColor: PARCHMENT.rubric,
    backgroundColor: 'rgba(180, 131, 34, 0.14)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 3,
    borderRadius: 4,
  },
  dropCapLetter: {
    fontFamily: FONTS.handwriting,
    fontSize: 32,
    color: PARCHMENT.rubric,
    lineHeight: 36,
  },
  manuscriptBodyText: {
    flex: 1,
    fontFamily: FONTS.serif,
    fontSize: 15.5,
    lineHeight: 25,
    color: PARCHMENT.inkPrimary,
  },
  extraParagraphText: {
    fontFamily: FONTS.serif,
    fontSize: 15.5,
    lineHeight: 25,
    color: PARCHMENT.inkPrimary,
    marginTop: 12,
  },
  marginNoteBox: {
    marginTop: 14,
    padding: 10,
    backgroundColor: PARCHMENT.paperDark,
    borderLeftWidth: 3,
    borderLeftColor: PARCHMENT.goldLeaf,
    borderRadius: 4,
  },
  marginNoteHeading: {
    fontFamily: FONTS.handwriting,
    fontSize: 16,
    color: PARCHMENT.rubric,
    marginBottom: 2,
  },
  marginNoteText: {
    fontFamily: FONTS.handwriting,
    fontSize: 16,
    color: PARCHMENT.inkSecondary,
    lineHeight: 22,
  },
  modeStamp: {
    marginTop: 12,
    fontFamily: FONTS.serif,
    fontSize: 11,
    fontStyle: 'italic',
    color: PARCHMENT.inkMuted,
    textAlign: 'right',
  },
  pageTurnerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: PARCHMENT.border,
    gap: 8,
  },
  turnBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: PARCHMENT.borderDouble,
    backgroundColor: PARCHMENT.paperDark,
  },
  turnBtnForward: {
    backgroundColor: PARCHMENT.rubric,
    borderColor: PARCHMENT.waxSeal,
  },
  turnBtnDisabled: {
    opacity: 0.35,
  },
  turnBtnText: {
    fontFamily: FONTS.serif,
    fontSize: 12,
    fontWeight: '700',
    color: PARCHMENT.inkPrimary,
  },
  turnBtnForwardText: {
    color: PARCHMENT.paperHighlight,
  },
  turnBtnTextDisabled: {
    color: PARCHMENT.inkMuted,
  },
  pageIndicator: {
    fontFamily: FONTS.handwriting,
    fontSize: 15,
    color: PARCHMENT.inkSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 13, 10, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    width: SCREEN_WIDTH - 76,
    height: 280,
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
  modalCloseBtn: {
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: PARCHMENT.rubric,
    borderRadius: 8,
  },
  modalCloseText: {
    color: PARCHMENT.paperHighlight,
    fontFamily: FONTS.serif,
    fontWeight: '700',
    fontSize: 13,
  },
});
