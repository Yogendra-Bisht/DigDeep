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
    console.warn(`[WorldPack] nodes.json not found for ${worldId}`);
    return [];
  }
  try {
    const raw = await file.text();
    const nodes = JSON.parse(raw) as AtlasNode[];
    return validateNodes(nodes);
  } catch (e) {
    console.error(`[WorldPack] Failed to parse nodes for ${worldId}`, e);
    return [];
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

// ─── Mock Pack Seeder (Dev / Phase 1 testing) ────────────────

export async function seedMockArchaeologyPack(): Promise<void> {
  const worldId: WorldId = 'archaeology';
  if (isPackDownloaded(worldId)) return;

  const manifest: PackManifest = {
    worldId,
    version: '0.1.0-mock',
    releaseDate: new Date().toISOString(),
    totalNodes: 4,
    assets: [],
  };

  const nodes: AtlasNode[] = [
    {
      id: 'arch-mystery-01',
      worldId: 'archaeology',
      branch: 'mysteries',
      title: 'The Indus Script',
      subtitle: 'Still undeciphered after 100 years',
      emoji: '🪬',
      status: 'unlocked',
      position: { x: 100, y: 150 },
      connections: ['arch-science-01'],
      layers: [
        { layerIndex: 1, label: 'Hook', contentIntuitive: 'Over 4,000 inscribed seals found — none decoded. What were they writing?', contentDeepDive: 'The corpus spans ~400 unique signs across 4,500+ short inscriptions, with no bilingual Rosetta key discovered.' },
        { layerIndex: 2, label: 'Why', contentIntuitive: 'Without knowing the spoken language, the script remains a lock with no key.', contentDeepDive: 'Proposed decipherments (Dravidian, Indo-Aryan, Sumerian-linked) remain contested due to insufficient long-text samples.' },
        { layerIndex: 3, label: 'Evidence', contentIntuitive: 'Sign frequency analysis shows top 10 signs appearing in 80% of inscriptions.', contentDeepDive: 'Rao et al. (2009) demonstrated non-random conditional entropy matching known linguistic scripts.' },
        { layerIndex: 4, label: 'Investigate', contentIntuitive: 'Look at 3 seals below. Which signs repeat? Can you spot a pattern?', contentDeepDive: 'Using the sign frequency table, identify signs with the highest bigram probability.', interactiveType: 'quiz' },
      ],
    },
    {
      id: 'arch-science-01',
      worldId: 'archaeology',
      branch: 'sciences',
      title: 'Stratigraphy & the Law of Superposition',
      subtitle: 'Reading time through layers of earth',
      emoji: '🪨',
      status: 'unlocked',
      position: { x: 300, y: 100 },
      connections: ['arch-mystery-01', 'arch-cases-01'],
      layers: [
        { layerIndex: 1, label: 'Hook', contentIntuitive: 'If you dig 3 metres down and find a coin, is it older or newer than a coin 1 metre down?', contentDeepDive: "Steno's Law of Superposition (1669): undisturbed strata deposit with youngest layers at top." },
        { layerIndex: 2, label: 'Why', contentIntuitive: 'Layers form like pages of a book — the bottom pages are always older.', contentDeepDive: 'Primary context preservation requires interpreting finds relative to their stratigraphic unit (SU).' },
        { layerIndex: 3, label: 'Evidence', contentIntuitive: "Vadnagar's 7 layers span 2,800 years. Each layer holds a different civilization's fingerprint.", contentDeepDive: 'Harris Matrix notation formally represents stratigraphic relationships.' },
        { layerIndex: 4, label: 'Investigate', contentIntuitive: 'Swipe to dig the site. Place each artifact in the correct layer.', contentDeepDive: 'Assign Harris Matrix notation to the 5 exposed SUs and identify the terminus post quem.', interactiveType: 'dig' },
      ],
    },
    {
      id: 'arch-cases-01',
      worldId: 'archaeology',
      branch: 'cases',
      title: 'Keezhadi Excavation',
      subtitle: 'Urban Sangam civilization on the Vaigai',
      emoji: '🏺',
      status: 'unlocked',
      position: { x: 200, y: 300 },
      connections: ['arch-science-01', 'arch-field-01'],
      layers: [
        { layerIndex: 1, label: 'Hook', contentIntuitive: 'A 2,200-year-old urban settlement discovered under a dry riverbed in Tamil Nadu.', contentDeepDive: 'Keezhadi has yielded stratified evidence of a literate, craft-specialised urban society contemporaneous with Sangam poetry.' },
        { layerIndex: 2, label: 'Why', contentIntuitive: 'Alluvial silt deposited over centuries buried the city — only GPR revealed the grid layout.', contentDeepDive: 'Nine excavation seasons (2015–present) across 115 trenches have exposed brick structures, ring wells, and a planned orthogonal street grid.' },
        { layerIndex: 3, label: 'Evidence', contentIntuitive: 'Finds include Tamil-Brahmi inscribed pottery, copper artefacts, gold ornaments, and a bone stylus.', contentDeepDive: 'AMS radiocarbon dating returned 2σ dates of 580–200 BCE, pushing back Tamil literacy by ~300 years.' },
        { layerIndex: 4, label: 'Investigate', contentIntuitive: 'Examine the inscribed pottery sherd. What does the inscription style tell you about ancient Tamil Nadu?', contentDeepDive: 'Compare the Keezhadi Brahmi corpus with Asokan and Jaina Brahmi scripts. Identify morphological divergences.', interactiveType: 'artifact' },
      ],
    },
    {
      id: 'arch-field-01',
      worldId: 'archaeology',
      branch: 'fieldwork',
      title: 'Reading Local Masonry',
      subtitle: 'Date a wall without digging',
      emoji: '🧱',
      status: 'unlocked',
      position: { x: 400, y: 250 },
      connections: ['arch-cases-01'],
      layers: [
        { layerIndex: 1, label: 'Hook', contentIntuitive: 'Next time you see an old wall, look at how the bricks are laid. The pattern tells you its age.', contentDeepDive: 'Bonding patterns (English bond, Flemish bond) are diagnostic chronological indicators in historical masonry analysis.' },
        { layerIndex: 2, label: 'Why', contentIntuitive: 'Different eras used different construction techniques — bond patterns, mortar types, and brick dimensions all changed over time.', contentDeepDive: 'Standard brick dimensions in Indian historical contexts shifted from large Harappan bricks (4:2:1 ratio) to smaller medieval formats.' },
        { layerIndex: 3, label: 'Evidence', contentIntuitive: 'A Harappan brick is roughly 28x14x7 cm. A colonial-era brick is closer to 23x11x7 cm. Measure and compare.', contentDeepDive: 'Typological seriation of brick dimensions combined with mortar petrography provides relative chronological brackets.' },
        { layerIndex: 4, label: 'Investigate', contentIntuitive: 'Go outside. Find any old wall. Photograph it, measure a brick if possible, and log it in your Field Logbook.', contentDeepDive: 'Record bond type, estimated brick dimensions, mortar colour and texture. Link to this node and tag as Masonry/Brickwork.', interactiveType: 'field_prompt' },
      ],
    },
  ];

  await writePackFiles(worldId, manifest, nodes);
  console.log('[WorldPack] Mock Archaeology pack seeded ✅');
}
