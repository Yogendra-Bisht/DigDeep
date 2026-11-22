// ============================================================
// DigDeep — WorldPack JSON Content Engine
// ============================================================
// Uses expo-file-system v2 async File/Directory/Paths API.
//
// Pack structure (under document directory):
//   packs/<worldId>/manifest.json   ← version, asset list
//   packs/<worldId>/nodes.json      ← AtlasNode[] array
// ============================================================

import { File, Directory, Paths } from 'expo-file-system';
import type { AtlasNode, PackManifest, WorldId } from '../types';
import { ARCHAEOLOGY_NODES } from '../data/archaeologyNodes';

// ─── File/Dir helpers ────────────────────────────────────────

function packDir(worldId: WorldId): Directory {
  return new Directory(Paths.document, 'packs', worldId);
}

function manifestFile(worldId: WorldId): File {
  return new File(Paths.document, 'packs', worldId, 'manifest.json');
}

function nodesFile(worldId: WorldId): File {
  return new File(Paths.document, 'packs', worldId, 'nodes.json');
}

// ─── Pack Existence Check ────────────────────────────────────

export function isPackDownloaded(worldId: WorldId): boolean {
  return manifestFile(worldId).exists;
}

// ─── Load Manifest ───────────────────────────────────────────

export async function loadManifest(worldId: WorldId): Promise<PackManifest | null> {
  const file = manifestFile(worldId);
  if (!file.exists) return null;
  try {
    const raw = await file.text();
    return JSON.parse(raw) as PackManifest;
  } catch (e) {
    console.error(`[WorldPack] Failed to parse manifest for ${worldId}`, e);
    return null;
  }
}

// ─── Load Atlas Nodes ────────────────────────────────────────

export async function loadAtlasNodes(worldId: WorldId): Promise<AtlasNode[]> {
  const file = nodesFile(worldId);
  if (!file.exists) {
    // If not found in dynamic storage, fallback to the pre-bundled dataset
    if (worldId === 'archaeology') {
      return ARCHAEOLOGY_NODES;
    }
    return [];
  }
  try {
    const raw = await file.text();
    const nodes = JSON.parse(raw) as AtlasNode[];
    return validateNodes(nodes);
  } catch (e) {
    console.error(`[WorldPack] Failed to parse nodes for ${worldId}`, e);
    return worldId === 'archaeology' ? ARCHAEOLOGY_NODES : [];
  }
}

// ─── Validate Nodes ──────────────────────────────────────────

function validateNodes(nodes: unknown[]): AtlasNode[] {
  return nodes.filter((node): node is AtlasNode => {
    if (typeof node !== 'object' || node === null) return false;
    const n = node as Record<string, unknown>;
    return (
      typeof n.id === 'string' &&
      typeof n.title === 'string' &&
      Array.isArray(n.layers) &&
      n.layers.length === 4
    );
  });
}

// ─── Write Pack to Filesystem ────────────────────────────────

export async function writePackFiles(
  worldId: WorldId,
  manifest: PackManifest,
  nodes: AtlasNode[]
): Promise<void> {
  const dir = packDir(worldId);
  if (!dir.exists) {
    dir.create();
  }
  await manifestFile(worldId).write(JSON.stringify(manifest));
  await nodesFile(worldId).write(JSON.stringify(nodes));
  console.log(`[WorldPack] Pack written for ${worldId} v${manifest.version}`);
}

// ─── Delete Pack ─────────────────────────────────────────────

export function deletePackFiles(worldId: WorldId): void {
  const dir = packDir(worldId);
  if (dir.exists) {
    dir.delete();
    console.log(`[WorldPack] Pack deleted for ${worldId}`);
  }
}

// ─── Mock / Initial Pack Seeder ──────────────────────────────
// Seeds the full 12-node Archaeology pack (FR2.1 / FR2.2)

export async function seedMockArchaeologyPack(): Promise<void> {
  const worldId: WorldId = 'archaeology';
  if (isPackDownloaded(worldId)) return;

  const manifest: PackManifest = {
    worldId,
    version: '1.0.0-archaeology',
    releaseDate: new Date().toISOString(),
    totalNodes: ARCHAEOLOGY_NODES.length,
    assets: [],
  };

  await writePackFiles(worldId, manifest, ARCHAEOLOGY_NODES);
  console.log(`[WorldPack] Archaeology pack seeded with ${ARCHAEOLOGY_NODES.length} nodes ✅`);
}
