// ============================================================
// DigDeep — MMKV Storage Abstraction (Preferences & Session KV)
// ============================================================
// MMKV is used for fast key-value preferences:
//   • User profile (depth mode, selected world, onboarding flag)
//   • Node completion states
//   • App-level settings (theme, font scale, etc.)
// ============================================================

import { createMMKV } from 'react-native-mmkv';
import type { MMKV } from 'react-native-mmkv';
import type { DepthMode, UserProfile, WorldId } from '../types';

export const storage: MMKV = createMMKV({ id: 'digdeep-prefs' });

// ─── Keys ───────────────────────────────────────────────────
const KEYS = {
  USER_PROFILE: 'user_profile',
  NODE_STATES: 'node_states',          // JSON map: { [nodeId]: NodeStatus }
  DOWNLOADED_PACKS: 'downloaded_packs', // JSON array of WorldId
  LAST_OPEN_NODE: 'last_open_node',
} as const;

// ─── User Profile ────────────────────────────────────────────

export function saveUserProfile(profile: UserProfile): void {
  storage.set(KEYS.USER_PROFILE, JSON.stringify(profile));
}

export function loadUserProfile(): UserProfile | null {
  const raw = storage.getString(KEYS.USER_PROFILE);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function isOnboardingComplete(): boolean {
  const profile = loadUserProfile();
  return profile?.onboardingComplete ?? false;
}

export function setDepthMode(mode: DepthMode): void {
  const profile = loadUserProfile();
  if (!profile) return;
  saveUserProfile({ ...profile, depthMode: mode, updatedAt: new Date().toISOString() });
}

export function getDepthMode(): DepthMode {
  return loadUserProfile()?.depthMode ?? 'intuitive';
}

export function setSelectedWorld(worldId: WorldId): void {
  const profile = loadUserProfile();
  if (!profile) return;
  saveUserProfile({ ...profile, selectedWorld: worldId, updatedAt: new Date().toISOString() });
}

// ─── Node Completion State ───────────────────────────────────

type NodeStates = Record<string, 'locked' | 'unlocked' | 'mastered'>;

export function getNodeStates(): NodeStates {
  const raw = storage.getString(KEYS.NODE_STATES);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as NodeStates;
  } catch {
    return {};
  }
}

export function setNodeState(
  nodeId: string,
  status: 'locked' | 'unlocked' | 'mastered'
): void {
  const states = getNodeStates();
  states[nodeId] = status;
  storage.set(KEYS.NODE_STATES, JSON.stringify(states));
}

// ─── Downloaded Packs ───────────────────────────────────────

export function getDownloadedPacks(): WorldId[] {
  const raw = storage.getString(KEYS.DOWNLOADED_PACKS);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as WorldId[];
  } catch {
    return [];
  }
}

export function markPackDownloaded(worldId: WorldId): void {
  const packs = getDownloadedPacks();
  if (!packs.includes(worldId)) {
    storage.set(KEYS.DOWNLOADED_PACKS, JSON.stringify([...packs, worldId]));
  }
}

export function removePackDownloaded(worldId: WorldId): void {
  const packs = getDownloadedPacks().filter((id) => id !== worldId);
  storage.set(KEYS.DOWNLOADED_PACKS, JSON.stringify(packs));
}

// ─── Misc Session State ──────────────────────────────────────

export function setLastOpenNode(nodeId: string): void {
  storage.set(KEYS.LAST_OPEN_NODE, nodeId);
}

export function getLastOpenNode(): string | null {
  return storage.getString(KEYS.LAST_OPEN_NODE) ?? null;
}

export function clearAllStorage(): void {
  storage.clearAll();
}
