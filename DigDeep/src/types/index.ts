// ============================================================
// DigDeep — Global TypeScript Types & Interfaces
// ============================================================

// ─── User & App Settings ────────────────────────────────────

export type DepthMode = 'intuitive' | 'deepdive';

export type WorldId =
  | 'archaeology'
  | 'cosmos'
  | 'earthage'
  | 'quantumworld'
  | 'fieldexpeditions';

export interface UserProfile {
  id: string;                    // UUID generated locally
  selectedWorld: WorldId;
  depthMode: DepthMode;
  onboardingComplete: boolean;
  createdAt: string;             // ISO 8601
  updatedAt: string;
}

// ─── World / Content Pack ───────────────────────────────────

export type WorldStatus = 'active' | 'locked' | 'coming_soon';

export interface World {
  id: WorldId;
  title: string;
  tagline: string;
  iconEmoji: string;
  status: WorldStatus;
  color: string;                 // hex
  packVersion: string | null;    // null if not downloaded
  packSizeBytes: number | null;
}

// ─── Atlas Node ─────────────────────────────────────────────

export type NodeBranch = 'mysteries' | 'sciences' | 'cases' | 'fieldwork';
export type NodeStatus = 'locked' | 'unlocked' | 'mastered';

export interface AtlasNode {
  id: string;
  worldId: WorldId;
  branch: NodeBranch;
  title: string;
  subtitle: string;
  emoji: string;
  status: NodeStatus;
  position: { x: number; y: number }; // canvas coordinates
  connections: string[];               // array of connected node IDs
  layers: NodeLayer[];
}

export interface NodeLayer {
  layerIndex: 1 | 2 | 3 | 4;
  label: 'Hook' | 'Why' | 'Evidence' | 'Investigate';
  contentIntuitive: string;           // content for Intuitive Explorer mode
  contentDeepDive: string;            // content for Deep Dive Researcher mode
  mediaUrl?: string;                  // relative path or illustration identifier
  interactiveType?: 'quiz' | 'dig' | 'artifact' | 'field_prompt' | null;
  interactiveRefId?: string;          // e.g. caseId for artifact detective
}

// ─── Artifact Detective ──────────────────────────────────────

export interface ArtifactHotspot {
  id: string;
  title: string;
  xPercent: number; // 0 - 100
  yPercent: number; // 0 - 100
  observationIntuitive: string;
  observationDeepDive: string;
  clueBadge: string;
}

export interface HypothesisQuestion {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export interface ArtifactCase {
  id: string;
  title: string;
  provenance: string;
  period: string;
  material: string;
  emoji: string;
  description: string;
  hotspots: ArtifactHotspot[];
  hypothesisQuestions: HypothesisQuestion[];
  deductionSummary: {
    title: string;
    bodyIntuitive: string;
    bodyDeepDive: string;
    significancePoints: string[];
  };
}

// ─── Field Logbook ──────────────────────────────────────────

export type FieldCategory =
  | 'masonry'
  | 'water_architecture'
  | 'sculpture'
  | 'coin_metal'
  | 'inscription'
  | 'terrain';

export type FieldMaterial =
  | 'sandstone'
  | 'granite'
  | 'terracotta'
  | 'burnt_brick'
  | 'bronze'
  | 'unknown';

export interface FieldLogEntry {
  id: string;                         // UUID
  photoUri: string | null;            // local file URI
  category: FieldCategory | null;
  material: FieldMaterial | null;
  latitude: number | null;
  longitude: number | null;
  locationLabel: string | null;       // manual region entry
  notes: string;
  linkedNodeIds: string[];            // Atlas node IDs linked
  createdAt: string;                  // ISO 8601
  syncedAt: string | null;            // null = not synced
}

// ─── Content Pack Manifest ───────────────────────────────────

export interface PackManifest {
  worldId: WorldId;
  version: string;
  releaseDate: string;
  totalNodes: number;
  assets: PackAsset[];
}

export interface PackAsset {
  filename: string;
  checksum: string;
  sizeBytes: number;
  type: 'image' | 'json' | 'audio';
}

// ─── Navigation Param Lists ──────────────────────────────────

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Atlas: undefined;
  Logbook: undefined;
  Packs: undefined;
  Settings: undefined;
};

export type AtlasStackParamList = {
  AtlasCanvas: undefined;
  NodeDetail: { nodeId: string };
  ArtifactDetective: { caseId: string };
  StratigraphyDig: { siteId: string };
};

export type LogbookStackParamList = {
  LogbookMain: undefined;
  FieldCardExport: { entryId: string };
};
