// ============================================================
// DigDeep — Personal Field Logbook Screen (FR4)
// Offline-first photo capture, GPS tagging, structured
// metadata, Atlas node linking, and Field Card export.
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  FlatList,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';

import {
  insertLogEntry,
  getAllLogEntries,
  deleteLogEntry,
} from '../../storage/database';
import { useAppStore } from '../../store/useAppStore';
import { COLORS, TYPOGRAPHY, RADII, SPACING } from '../../theme';
import type {
  FieldLogEntry,
  FieldCategory,
  FieldMaterial,
} from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Category & Material Options ─────────────────────────────

const CATEGORIES: { id: FieldCategory; label: string; emoji: string }[] = [
  { id: 'masonry', label: 'Masonry / Brickwork', emoji: '🧱' },
  { id: 'water_architecture', label: 'Water Architecture', emoji: '🪜' },
  { id: 'sculpture', label: 'Sculpture / Relief', emoji: '🗿' },
  { id: 'coin_metal', label: 'Coin / Metal', emoji: '🪙' },
  { id: 'inscription', label: 'Inscription / Script', emoji: '📜' },
  { id: 'terrain', label: 'Terrain / Landscape', emoji: '🏔️' },
];

const MATERIALS: { id: FieldMaterial; label: string }[] = [
  { id: 'sandstone', label: 'Sandstone' },
  { id: 'granite', label: 'Granite' },
  { id: 'terracotta', label: 'Terracotta' },
  { id: 'burnt_brick', label: 'Burnt Brick' },
  { id: 'bronze', label: 'Bronze' },
  { id: 'unknown', label: 'Unknown' },
];

// ─── Helper: generate local UUID ─────────────────────────────

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── New Entry Form ───────────────────────────────────────────

function NewEntryForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  const { atlasNodes } = useAppStore();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [category, setCategory] = useState<FieldCategory | null>(null);
  const [material, setMaterial] = useState<FieldMaterial | null>(null);
  const [notes, setNotes] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [linkedNodeIds, setLinkedNodeIds] = useState<string[]>([]);
  const [fetchingGps, setFetchingGps] = useState(false);

  async function handleTakePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera Access Required', 'Please allow camera access to capture field photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function handlePickFromGallery() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Gallery Access Required', 'Please allow photo library access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function handleFetchGPS() {
    setFetchingGps(true);
    const perm = await Location.requestForegroundPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Location Access', 'GPS location not granted. You can enter location manually.');
      setFetchingGps(false);
      return;
    }
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    setLatitude(loc.coords.latitude);
    setLongitude(loc.coords.longitude);
    setFetchingGps(false);
  }

  function toggleNodeLink(nodeId: string) {
    setLinkedNodeIds((prev) =>
      prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]
    );
  }

  function handleSave() {
    const entry: FieldLogEntry = {
      id: generateId(),
      photoUri,
      category,
      material,
      latitude,
      longitude,
      locationLabel: locationLabel.trim() || null,
      notes: notes.trim(),
      linkedNodeIds,
      createdAt: new Date().toISOString(),
      syncedAt: null,
    };
    insertLogEntry(entry);
    onSave();
  }

  return (
    <ScrollView contentContainerStyle={formStyles.scroll} showsVerticalScrollIndicator={false}>
      {/* Photo */}
      <Text style={formStyles.sectionLabel}>1. Field Photo</Text>
      {photoUri ? (
        <View style={formStyles.photoPreview}>
          <Image source={{ uri: photoUri }} style={formStyles.photoImg} resizeMode="cover" />
          <TouchableOpacity style={formStyles.changePhotoBtn} onPress={handleTakePhoto}>
            <Text style={formStyles.changePhotoBtnText}>Retake</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={formStyles.photoActions}>
          <TouchableOpacity style={formStyles.photoBtn} onPress={handleTakePhoto} activeOpacity={0.8}>
            <Text style={formStyles.photoBtnIcon}>📷</Text>
            <Text style={formStyles.photoBtnText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={formStyles.photoBtn} onPress={handlePickFromGallery} activeOpacity={0.8}>
            <Text style={formStyles.photoBtnIcon}>🖼️</Text>
            <Text style={formStyles.photoBtnText}>From Gallery</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Category */}
      <Text style={formStyles.sectionLabel}>2. Category</Text>
      <View style={formStyles.pillGrid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[formStyles.pill, category === cat.id && formStyles.pillActive]}
            onPress={() => setCategory(cat.id)}
            activeOpacity={0.8}
          >
            <Text style={formStyles.pillEmoji}>{cat.emoji}</Text>
            <Text style={[formStyles.pillText, category === cat.id && formStyles.pillTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Material */}
      <Text style={formStyles.sectionLabel}>3. Material</Text>
      <View style={formStyles.pillGrid}>
        {MATERIALS.map((mat) => (
          <TouchableOpacity
            key={mat.id}
            style={[formStyles.pill, material === mat.id && formStyles.pillActive]}
            onPress={() => setMaterial(mat.id)}
            activeOpacity={0.8}
          >
            <Text style={[formStyles.pillText, material === mat.id && formStyles.pillTextActive]}>
              {mat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Location */}
      <Text style={formStyles.sectionLabel}>4. Location</Text>
      <View style={formStyles.locationRow}>
        <TouchableOpacity
          style={formStyles.gpsBtn}
          onPress={handleFetchGPS}
          activeOpacity={0.8}
          disabled={fetchingGps}
        >
          <Text style={formStyles.gpsBtnText}>
            {fetchingGps ? '📡 Locating...' : latitude ? `📍 ${latitude.toFixed(5)}, ${longitude?.toFixed(5)}` : '📡 Auto-GPS'}
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={formStyles.textInput}
        placeholder="Manual region label (e.g. 'Qutb Complex, Delhi')"
        placeholderTextColor={COLORS.textMuted}
        value={locationLabel}
        onChangeText={setLocationLabel}
      />

      {/* Notes */}
      <Text style={formStyles.sectionLabel}>5. Field Observations</Text>
      <TextInput
        style={[formStyles.textInput, formStyles.textArea]}
        placeholder="Describe what you observed: masonry pattern, mortar type, dimensions, any unusual features..."
        placeholderTextColor={COLORS.textMuted}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={4}
      />

      {/* Atlas Node Linking */}
      {atlasNodes.length > 0 && (
        <>
          <Text style={formStyles.sectionLabel}>6. Link to Atlas Concept (optional)</Text>
          <View style={formStyles.nodeGrid}>
            {atlasNodes.map((node) => (
              <TouchableOpacity
                key={node.id}
                style={[formStyles.nodeChip, linkedNodeIds.includes(node.id) && formStyles.nodeChipActive]}
                onPress={() => toggleNodeLink(node.id)}
                activeOpacity={0.8}
              >
                <Text style={formStyles.nodeChipEmoji}>{node.emoji}</Text>
                <Text
                  style={[formStyles.nodeChipText, linkedNodeIds.includes(node.id) && formStyles.nodeChipTextActive]}
                  numberOfLines={1}
                >
                  {node.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Save & Cancel */}
      <View style={formStyles.actions}>
        <TouchableOpacity style={formStyles.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
          <Text style={formStyles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={formStyles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
          <Text style={formStyles.saveBtnText}>Save Field Entry 📓</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ─── Log Entry Card ───────────────────────────────────────────

function LogEntryCard({
  entry,
  onDelete,
  onExport,
}: {
  entry: FieldLogEntry;
  onDelete: (id: string) => void;
  onExport: (entry: FieldLogEntry) => void;
}) {
  const cat = CATEGORIES.find((c) => c.id === entry.category);
  return (
    <View style={cardStyles.card}>
      {entry.photoUri && (
        <Image source={{ uri: entry.photoUri }} style={cardStyles.thumb} resizeMode="cover" />
      )}
      <View style={cardStyles.meta}>
        <View style={cardStyles.tagRow}>
          {cat && (
            <View style={cardStyles.tag}>
              <Text style={cardStyles.tagText}>{cat.emoji} {cat.label}</Text>
            </View>
          )}
          {entry.material && (
            <View style={cardStyles.tag}>
              <Text style={cardStyles.tagText}>{MATERIALS.find((m) => m.id === entry.material)?.label}</Text>
            </View>
          )}
        </View>
        {entry.locationLabel && (
          <Text style={cardStyles.location}>📍 {entry.locationLabel}</Text>
        )}
        {entry.latitude && (
          <Text style={cardStyles.gpsCoords}>
            {entry.latitude.toFixed(4)}°N, {entry.longitude?.toFixed(4)}°E
          </Text>
        )}
        {entry.notes.length > 0 && (
          <Text style={cardStyles.notes} numberOfLines={3}>{entry.notes}</Text>
        )}
        <Text style={cardStyles.date}>{new Date(entry.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
      </View>
      <View style={cardStyles.actions}>
        <TouchableOpacity style={cardStyles.exportBtn} onPress={() => onExport(entry)} activeOpacity={0.8}>
          <Text style={cardStyles.exportBtnText}>Export Card 🪪</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            Alert.alert('Delete Entry', 'Remove this field log?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => onDelete(entry.id) },
            ])
          }
        >
          <Text style={cardStyles.deleteBtn}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main Logbook Screen ──────────────────────────────────────

export default function FieldLogbookScreen() {
  const navigation = useNavigation<any>();
  const [entries, setEntries] = useState<FieldLogEntry[]>([]);
  const [showForm, setShowForm] = useState(false);

  function refresh() {
    setEntries(getAllLogEntries());
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleDelete(id: string) {
    deleteLogEntry(id);
    refresh();
  }

  function handleExport(entry: FieldLogEntry) {
    navigation.navigate('FieldCardExport', { entryId: entry.id });
  }

  if (showForm) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>New Field Entry</Text>
        </View>
        <NewEntryForm
          onSave={() => { refresh(); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>📓 Field Logbook</Text>
        <TouchableOpacity style={styles.newEntryBtn} onPress={() => setShowForm(true)} activeOpacity={0.8}>
          <Text style={styles.newEntryBtnText}>+ New Entry</Text>
        </TouchableOpacity>
      </View>

      {entries.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🧭</Text>
          <Text style={styles.emptyTitle}>No Field Logs Yet</Text>
          <Text style={styles.emptyDesc}>
            Go explore a local historical site, ancient wall, well, or coin. Photograph and log your findings here.
          </Text>
          <TouchableOpacity style={styles.startBtn} onPress={() => setShowForm(true)} activeOpacity={0.8}>
            <Text style={styles.startBtnText}>Log Your First Discovery →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <LogEntryCard entry={item} onDelete={handleDelete} onExport={handleExport} />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingVertical: 12,
    backgroundColor: COLORS.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: TYPOGRAPHY.lg, fontWeight: TYPOGRAPHY.weightBold, color: COLORS.sand },
  newEntryBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADII.sm,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  newEntryBtnText: { color: '#fff', fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.weightBold },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: TYPOGRAPHY.xl, fontWeight: TYPOGRAPHY.weightBold, color: COLORS.textPrimary },
  emptyDesc: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  startBtn: {
    marginTop: 8,
    backgroundColor: COLORS.accent,
    borderRadius: RADII.md,
    paddingVertical: 13,
    paddingHorizontal: 24,
  },
  startBtnText: { color: '#fff', fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.weightBold },
});

const formStyles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 48, gap: 10 },
  sectionLabel: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.textSecondary,
    marginTop: 10,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  photoActions: { flexDirection: 'row', gap: 10 },
  photoBtn: {
    flex: 1,
    backgroundColor: COLORS.cardActive,
    borderRadius: RADII.md,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.borderActive,
  },
  photoBtnIcon: { fontSize: 28 },
  photoBtnText: { fontSize: TYPOGRAPHY.xs, color: COLORS.textSecondary, fontWeight: TYPOGRAPHY.weightSemiBold },
  photoPreview: { borderRadius: RADII.md, overflow: 'hidden', position: 'relative' },
  photoImg: { width: '100%', height: 200 },
  changePhotoBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: RADII.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  changePhotoBtnText: { color: '#fff', fontSize: TYPOGRAPHY.xs },
  pillGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: RADII.full,
    backgroundColor: COLORS.cardLocked,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  pillEmoji: { fontSize: 14 },
  pillText: { fontSize: TYPOGRAPHY.xs, color: COLORS.textSecondary, fontWeight: TYPOGRAPHY.weightMedium },
  pillTextActive: { color: '#fff', fontWeight: TYPOGRAPHY.weightBold },
  locationRow: { marginBottom: 8 },
  gpsBtn: {
    backgroundColor: COLORS.cardActive,
    borderRadius: RADII.sm,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.borderActive,
    alignSelf: 'flex-start',
  },
  gpsBtnText: { fontSize: TYPOGRAPHY.sm, color: COLORS.sand, fontWeight: TYPOGRAPHY.weightSemiBold },
  textInput: {
    backgroundColor: COLORS.cardActive,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textPrimary,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  nodeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  nodeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.cardLocked,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxWidth: (SCREEN_WIDTH - 56) / 2,
  },
  nodeChipActive: { borderColor: COLORS.moss, backgroundColor: 'rgba(90,122,58,0.2)' },
  nodeChipEmoji: { fontSize: 14 },
  nodeChipText: { fontSize: 11, color: COLORS.textSecondary, flex: 1 },
  nodeChipTextActive: { color: COLORS.moss },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: RADII.md,
    backgroundColor: COLORS.cardLocked,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelBtnText: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.weightSemiBold },
  saveBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: RADII.md,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: TYPOGRAPHY.sm, fontWeight: TYPOGRAPHY.weightBold },
});

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardActive,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  thumb: { width: '100%', height: 160 },
  meta: { padding: 14, gap: 6 },
  tagRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(196,131,42,0.15)',
    borderRadius: RADII.full,
    borderWidth: 1,
    borderColor: COLORS.borderActive,
  },
  tagText: { fontSize: 11, color: COLORS.sand, fontWeight: TYPOGRAPHY.weightSemiBold },
  location: { fontSize: TYPOGRAPHY.xs, color: COLORS.textSecondary },
  gpsCoords: { fontSize: 11, color: COLORS.textMuted, fontFamily: 'monospace' },
  notes: { fontSize: TYPOGRAPHY.xs, color: COLORS.textPrimary, lineHeight: 18 },
  date: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  exportBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADII.sm,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  exportBtnText: { color: '#fff', fontSize: TYPOGRAPHY.xs, fontWeight: TYPOGRAPHY.weightBold },
  deleteBtn: { fontSize: 20, paddingHorizontal: 8 },
});
