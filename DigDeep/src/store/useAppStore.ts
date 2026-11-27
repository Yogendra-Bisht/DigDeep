// ============================================================
// DigDeep — Global App State Store (Zustand)
// ============================================================
// Lightweight global state using Zustand.
// Zustand is chosen over Redux for minimal boilerplate and
// excellent React Native compatibility.
//
// MMKV persistence is handled via the storage layer directly
// for profile data; Zustand holds the in-memory reactive state.
// ============================================================

import { create } from 'zustand';
import type { DepthMode, UserProfile, WorldId, AtlasNode } from '../types';
import {
  loadUserProfile,
  saveUserProfile,
  setDepthMode as persistDepthMode,
  setSelectedWorld as persistSelectedWorld,
  getNodeStates,
  setNodeState,
} from '../storage/mmkv';

interface AppState {
  // Profile
  profile: UserProfile | null;
  isHydrated: boolean;

  // Atlas
  atlasNodes: AtlasNode[];
  nodeStates: Record<string, 'locked' | 'unlocked' | 'mastered'>;

  // Actions
  hydrateFromStorage: () => void;
  completeOnboarding: (worldId: WorldId, depthMode: DepthMode) => void;
  returnToHome: () => void;
  setDepthMode: (mode: DepthMode) => void;
  setSelectedWorld: (worldId: WorldId) => void;
  setAtlasNodes: (nodes: AtlasNode[]) => void;
  updateNodeState: (nodeId: string, status: 'locked' | 'unlocked' | 'mastered') => void;
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export const useAppStore = create<AppState>((set, get) => ({
  profile: null,
  isHydrated: false,
  atlasNodes: [],
  nodeStates: {},

  hydrateFromStorage: () => {
    const profile = loadUserProfile();
    const nodeStates = getNodeStates();
    set({ profile, nodeStates, isHydrated: true });
  },

  completeOnboarding: (worldId, depthMode) => {
    const existing = get().profile;
    const now = new Date().toISOString();
    const profile: UserProfile = {
      id: existing?.id || generateId(),
      selectedWorld: worldId,
      depthMode,
      onboardingComplete: true,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    saveUserProfile(profile);
    set({ profile });
  },

  returnToHome: () => {
    set((state) => ({
      profile: state.profile
        ? { ...state.profile, onboardingComplete: false }
        : null,
    }));
  },

  setDepthMode: (mode) => {
    persistDepthMode(mode);
    set((state) => ({
      profile: state.profile ? { ...state.profile, depthMode: mode } : null,
    }));
  },

  setSelectedWorld: (worldId) => {
    persistSelectedWorld(worldId);
    set((state) => ({
      profile: state.profile ? { ...state.profile, selectedWorld: worldId } : null,
    }));
  },

  setAtlasNodes: (nodes) => set({ atlasNodes: nodes }),

  updateNodeState: (nodeId, status) => {
    setNodeState(nodeId, status);
    set((state) => ({
      nodeStates: { ...state.nodeStates, [nodeId]: status },
    }));
  },
}));
