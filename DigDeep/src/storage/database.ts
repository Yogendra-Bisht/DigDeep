// ============================================================
// DigDeep — Expo SQLite Database Abstraction
// ============================================================
// SQLite is used for structured relational data:
//   • Field Logbook entries (photos, metadata, GPS, notes)
//   • Atlas node progress (layer completion per node)
//   • Pack manifest records
// ============================================================

import * as SQLite from 'expo-sqlite';
import type { FieldLogEntry, FieldCategory, FieldMaterial } from '../types';

const DB_NAME = 'digdeep.db';

// ─── Open DB (singleton) ─────────────────────────────────────

let _db: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!_db) {
    _db = SQLite.openDatabaseSync(DB_NAME);
  }
  return _db;
}

// ─── Schema Migration ────────────────────────────────────────

export async function initializeDatabase(): Promise<void> {
  const db = getDatabase();

  // Field Logbook
  db.execSync(`
    CREATE TABLE IF NOT EXISTS field_log_entries (
      id              TEXT PRIMARY KEY,
      photo_uri       TEXT,
      category        TEXT,
      material        TEXT,
      latitude        REAL,
      longitude       REAL,
      location_label  TEXT,
      notes           TEXT NOT NULL DEFAULT '',
      linked_node_ids TEXT NOT NULL DEFAULT '[]',
      created_at      TEXT NOT NULL,
      synced_at       TEXT
    );
  `);

  // Node Layer Progress
  db.execSync(`
    CREATE TABLE IF NOT EXISTS node_layer_progress (
      node_id       TEXT NOT NULL,
      layer_index   INTEGER NOT NULL,
      completed_at  TEXT NOT NULL,
      PRIMARY KEY (node_id, layer_index)
    );
  `);

  // Pack Manifests
  db.execSync(`
    CREATE TABLE IF NOT EXISTS pack_manifests (
      world_id      TEXT PRIMARY KEY,
      version       TEXT NOT NULL,
      release_date  TEXT NOT NULL,
      total_nodes   INTEGER NOT NULL,
      downloaded_at TEXT NOT NULL
    );
  `);

  console.log('[DB] DigDeep database initialized');
}

// ─── Field Logbook CRUD ──────────────────────────────────────

export function insertLogEntry(entry: FieldLogEntry): void {
  const db = getDatabase();
  db.runSync(
    `INSERT INTO field_log_entries
      (id, photo_uri, category, material, latitude, longitude,
       location_label, notes, linked_node_ids, created_at, synced_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.id,
      entry.photoUri,
      entry.category,
      entry.material,
      entry.latitude,
      entry.longitude,
      entry.locationLabel,
      entry.notes,
      JSON.stringify(entry.linkedNodeIds),
      entry.createdAt,
      entry.syncedAt,
    ]
  );
}

export function getAllLogEntries(): FieldLogEntry[] {
  const db = getDatabase();
  const rows = db.getAllSync<{
    id: string;
    photo_uri: string | null;
    category: string | null;
    material: string | null;
    latitude: number | null;
    longitude: number | null;
    location_label: string | null;
    notes: string;
    linked_node_ids: string;
    created_at: string;
    synced_at: string | null;
  }>('SELECT * FROM field_log_entries ORDER BY created_at DESC');

  return rows.map((row) => ({
    id: row.id,
    photoUri: row.photo_uri,
    category: row.category as FieldCategory | null,
    material: row.material as FieldMaterial | null,
    latitude: row.latitude,
    longitude: row.longitude,
    locationLabel: row.location_label,
    notes: row.notes,
    linkedNodeIds: JSON.parse(row.linked_node_ids) as string[],
    createdAt: row.created_at,
    syncedAt: row.synced_at,
  }));
}

export function updateLogEntry(id: string, updates: Partial<FieldLogEntry>): void {
  const db = getDatabase();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.notes !== undefined) { fields.push('notes = ?'); values.push(updates.notes); }
  if (updates.category !== undefined) { fields.push('category = ?'); values.push(updates.category); }
  if (updates.material !== undefined) { fields.push('material = ?'); values.push(updates.material); }
  if (updates.locationLabel !== undefined) { fields.push('location_label = ?'); values.push(updates.locationLabel); }
  if (updates.linkedNodeIds !== undefined) { fields.push('linked_node_ids = ?'); values.push(JSON.stringify(updates.linkedNodeIds)); }
  if (updates.syncedAt !== undefined) { fields.push('synced_at = ?'); values.push(updates.syncedAt); }

  if (fields.length === 0) return;
  values.push(id);
  db.runSync(`UPDATE field_log_entries SET ${fields.join(', ')} WHERE id = ?`, values);
}

export function deleteLogEntry(id: string): void {
  const db = getDatabase();
  db.runSync('DELETE FROM field_log_entries WHERE id = ?', [id]);
}

// ─── Node Layer Progress ─────────────────────────────────────

export function markLayerComplete(nodeId: string, layerIndex: number): void {
  const db = getDatabase();
  db.runSync(
    `INSERT OR REPLACE INTO node_layer_progress (node_id, layer_index, completed_at)
     VALUES (?, ?, ?)`,
    [nodeId, layerIndex, new Date().toISOString()]
  );
}

export function getCompletedLayers(nodeId: string): number[] {
  const db = getDatabase();
  const rows = db.getAllSync<{ layer_index: number }>(
    'SELECT layer_index FROM node_layer_progress WHERE node_id = ?',
    [nodeId]
  );
  return rows.map((r) => r.layer_index);
}
