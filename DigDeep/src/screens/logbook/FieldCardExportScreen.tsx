// ============================================================
// DigDeep – Field Card Export Screen
// Generates a branded "Explorer Field Card" PNG and shares it
// 100% offline: view-shot capture → expo-sharing + expo-media-library
// ============================================================

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

import { COLORS, TYPOGRAPHY, RADII, SPACING } from '../../theme';
import { getAllLogEntries } from '../../storage/database';
import type { LogbookStackParamList, FieldLogEntry } from '../../types';

// ─── Types ───────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<LogbookStackParamList, 'FieldCardExport'>;

// ─── Helper: format date ──────────────────────────────────────────────────────

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ─── Category Badge Colors ────────────────────────────────────────────────────

const BADGE_COLORS: Record<string, string> = {
  pottery:    '#C97B42',
  coins:      '#B8860B',
  tools:      '#5B7A5F',
  structures: '#7B6B9D',
  writing:    '#3A6B8C',
  default:    '#7A6552',
};

// ─── The Card View (what gets captured as PNG) ────────────────────────────────

const FieldCard = React.forwardRef<View, { entry: FieldLogEntry }>(
  ({ entry }, ref) => {
    const badgeColor = BADGE_COLORS[entry.category] ?? BADGE_COLORS.default;
    const coords =
      entry.gpsLat != null && entry.gpsLon != null
        ? `${entry.gpsLat.toFixed(4)}°, ${entry.gpsLon.toFixed(4)}°`
        : 'GPS not recorded';

    return (
      <View ref={ref} style={card.container} collapsable={false}>
        {/* Top banner */}
        <View style={card.banner}>
          <Text style={card.appTitle}>⛏ DigDeep</Text>
          <Text style={card.bannerSub}>Explorer Field Card</Text>
        </View>

        {/* Photo */}
        {entry.photoUri ? (
          <Image
            source={{ uri: entry.photoUri }}
            style={card.photo}
            resizeMode="cover"
          />
        ) : (
          <View style={[card.photo, card.photoPlaceholder]}>
            <Text style={card.photoPlaceholderText}>📷 No Photo</Text>
          </View>
        )}

        {/* Category badge */}
        <View style={[card.badge, { backgroundColor: badgeColor }]}>
          <Text style={card.badgeText}>{entry.category.toUpperCase()}</Text>
        </View>

        {/* Body */}
        <View style={card.body}>
          {/* Material */}
          {entry.material ? (
            <View style={card.row}>
              <Text style={card.label}>Material</Text>
              <Text style={card.value}>{entry.material}</Text>
            </View>
          ) : null}

          {/* GPS */}
          <View style={card.row}>
            <Text style={card.label}>Location</Text>
            <Text style={card.value}>{coords}</Text>
          </View>

          {/* Date */}
          <View style={card.row}>
            <Text style={card.label}>Recorded</Text>
            <Text style={card.value}>{formatDate(entry.createdAt)}</Text>
          </View>

          {/* Notes */}
          {entry.notes ? (
            <View style={card.notesBlock}>
              <Text style={card.label}>Field Notes</Text>
              <Text style={card.notesText} numberOfLines={4}>
                {entry.notes}
              </Text>
            </View>
          ) : null}

          {/* Atlas link */}
          {entry.linkedNodeId ? (
            <View style={card.row}>
              <Text style={card.label}>Atlas Node</Text>
              <Text style={[card.value, { color: COLORS.accent }]}>
                {entry.linkedNodeId}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Footer */}
        <View style={card.footer}>
          <Text style={card.footerText}>
            Offline · Excavated with DigDeep · Q1 2027
          </Text>
        </View>
      </View>
    );
  }
);

FieldCard.displayName = 'FieldCard';

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function FieldCardExportScreen({ route, navigation }: Props) {
  const { entryId } = route.params;

  const [entry, setEntry] = useState<FieldLogEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);

  const cardRef = useRef<View>(null);

  // Load entry from SQLite
  useEffect(() => {
    (async () => {
      try {
        const all = await getAllLogEntries();
        const found = all.find(e => e.id === entryId) ?? null;
        setEntry(found);
      } catch (err) {
        console.error('[FieldCardExport] load error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [entryId]);

  // Capture card as PNG
  const captureCard = useCallback(async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    try {
      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });
      setCapturedUri(uri);
      return uri;
    } catch (err) {
      console.error('[FieldCardExport] capture error:', err);
      return null;
    }
  }, []);

  // Share via native share sheet
  const handleShare = useCallback(async () => {
    setExporting(true);
    try {
      const uri = capturedUri ?? (await captureCard());
      if (!uri) throw new Error('Could not capture card image.');

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Sharing not available', 'Your device does not support sharing.');
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share Explorer Field Card',
        UTI: 'public.png',
      });
    } catch (err: any) {
      Alert.alert('Export failed', err.message ?? 'Unknown error.');
    } finally {
      setExporting(false);
    }
  }, [capturedUri, captureCard]);

  // Save to Camera Roll / Photos
  const handleSaveToPhotos = useCallback(async () => {
    setExporting(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Allow DigDeep to access your photo library to save Field Cards.'
        );
        return;
      }

      const uri = capturedUri ?? (await captureCard());
      if (!uri) throw new Error('Could not capture card image.');

      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Saved!', 'Your Explorer Field Card has been saved to your photo library. 🎉');
    } catch (err: any) {
      Alert.alert('Save failed', err.message ?? 'Unknown error.');
    } finally {
      setExporting(false);
    }
  }, [capturedUri, captureCard]);

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Loading field entry…</Text>
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorText}>Entry not found.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
          <Text style={styles.headerBackText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Export Field Card</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Preview label */}
        <Text style={styles.previewLabel}>Card Preview</Text>

        {/* The card that gets captured */}
        <View style={styles.cardWrapper}>
          <FieldCard ref={cardRef} entry={entry} />
        </View>

        {/* Export tip */}
        <View style={styles.tipBox}>
          <Text style={styles.tipText}>
            💡 Tap "Share" to send via WhatsApp, Email, AirDrop, or any app.{'\n'}
            Tap "Save to Photos" to add to your camera roll — 100% offline.
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.shareBtn, exporting && styles.btnDisabled]}
            onPress={handleShare}
            disabled={exporting}
          >
            {exporting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnText}>↑ Share Card</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.saveBtn, exporting && styles.btnDisabled]}
            onPress={handleSaveToPhotos}
            disabled={exporting}
          >
            {exporting ? (
              <ActivityIndicator color={COLORS.accent} size="small" />
            ) : (
              <Text style={[styles.btnText, { color: COLORS.accent }]}>
                ⬇ Save to Photos
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Card Styles ──────────────────────────────────────────────────────────────

const card = StyleSheet.create({
  container: {
    width: 320,
    backgroundColor: '#FEFAF4',
    borderRadius: RADII.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  banner: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#fff',
    letterSpacing: 0.5,
  },
  bannerSub: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  photo: {
    width: '100%',
    height: 200,
  },
  photoPlaceholder: {
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: TYPOGRAPHY.xxl,
    color: COLORS.textMuted,
  },
  badge: {
    position: 'absolute',
    top: 170,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: '#fff',
    letterSpacing: 1.2,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  label: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '700' as const,
    color: COLORS.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    minWidth: 70,
  },
  value: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '500' as const,
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  notesBlock: {
    marginTop: 4,
    gap: 4,
  },
  notesText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  footer: {
    backgroundColor: COLORS.bgSurface,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

// ─── Screen Styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  centered: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.md,
    color: COLORS.textSecondary,
  },
  errorEmoji: { fontSize: 40 },
  errorText: {
    fontSize: TYPOGRAPHY.lg,
    color: COLORS.textSecondary,
  },
  backBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.accent,
    borderRadius: RADII.md,
  },
  backBtnText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sm,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    backgroundColor: COLORS.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerBack: { width: 60 },
  headerBackText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.accent,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scroll: {
    alignItems: 'center',
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  previewLabel: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  cardWrapper: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
    marginBottom: 24,
  },
  tipBox: {
    backgroundColor: COLORS.bgSurface,
    borderRadius: RADII.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
    width: '100%',
  },
  tipText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  btn: {
    paddingVertical: 15,
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  shareBtn: {
    backgroundColor: COLORS.accent,
  },
  saveBtn: {
    backgroundColor: COLORS.bgSurface,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    fontSize: TYPOGRAPHY.md,
    fontWeight: '700',
    color: '#fff',
  },
});
