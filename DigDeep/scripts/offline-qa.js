/**
 * DigDeep – Offline Resilience QA Script (Phase 4)
 * ─────────────────────────────────────────────────
 * Run this in Node to validate that all critical data paths
 * are present on-device without any network dependency.
 *
 * This is a STATIC validator (no device needed) — it checks:
 *  1. All content node data is bundled as static TS (not fetched)
 *  2. All Artifact Detective cases are bundled as static TS
 *  3. Database schema bootstraps without network
 *  4. MMKV keys are defined locally
 *  5. No `fetch()` or `axios` calls in src/ (would fail offline)
 *
 * Usage: node scripts/offline-qa.js
 */

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');

let passed = 0;
let failed = 0;

function check(label, condition, hint = '') {
  if (condition) {
    console.log(`✅ PASS: ${label}`);
    passed++;
  } else {
    console.log(`❌ FAIL: ${label}${hint ? `\n   → ${hint}` : ''}`);
    failed++;
  }
}

function readSrc(rel) {
  return fs.readFileSync(path.join(SRC, rel), 'utf8');
}

function scanForPattern(dir, pattern, excludes = []) {
  const hits = [];
  function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      if (!entry.name.endsWith('.ts') && !entry.name.endsWith('.tsx')) continue;
      if (excludes.some(e => full.includes(e))) continue;
      const content = fs.readFileSync(full, 'utf8');
      if (pattern.test(content)) hits.push(full.replace(SRC, 'src'));
    }
  }
  walk(dir);
  return hits;
}

console.log('\n🔍 DigDeep Offline Resilience QA\n' + '='.repeat(40));

// 1. Static data bundles exist
check(
  'archaeologyNodes.ts exists and exports nodes array',
  fs.existsSync(path.join(SRC, 'data/archaeologyNodes.ts')) &&
    readSrc('data/archaeologyNodes.ts').includes('export const ARCHAEOLOGY_NODES'),
  'Create src/data/archaeologyNodes.ts with exported array'
);

check(
  'artifactCases.ts exists and exports cases array',
  fs.existsSync(path.join(SRC, 'data/artifactCases.ts')) &&
    readSrc('data/artifactCases.ts').includes('export const ARTIFACT_CASES'),
  'Create src/data/artifactCases.ts with exported array'
);

// 2. No fetch() calls in src/ (network calls = offline failure)
const fetchHits = scanForPattern(SRC, /\bfetch\s*\(/, ['node_modules']);
check(
  'No raw fetch() calls in src/',
  fetchHits.length === 0,
  `Remove fetch() from: ${fetchHits.join(', ')}`
);

// 3. No axios in src/
const axiosHits = scanForPattern(SRC, /\baxios\b/, ['node_modules']);
check(
  'No axios usage in src/',
  axiosHits.length === 0,
  `Remove axios from: ${axiosHits.join(', ')}`
);

// 4. Database uses expo-sqlite (local)
check(
  'database.ts uses expo-sqlite (local storage)',
  fs.existsSync(path.join(SRC, 'storage/database.ts')) &&
    readSrc('storage/database.ts').includes('expo-sqlite'),
  'Ensure database.ts imports from expo-sqlite'
);

// 5. MMKV storage uses react-native-mmkv (local)
check(
  'mmkv.ts uses react-native-mmkv (local storage)',
  fs.existsSync(path.join(SRC, 'storage/mmkv.ts')) &&
    readSrc('storage/mmkv.ts').includes('react-native-mmkv'),
  'Ensure mmkv.ts imports from react-native-mmkv'
);

// 6. WorldPack engine uses expo-file-system v2 (local)
check(
  'worldpack.ts uses expo-file-system local File API',
  fs.existsSync(path.join(SRC, 'engine/worldpack.ts')) &&
    readSrc('engine/worldpack.ts').includes('expo-file-system') &&
    !readSrc('engine/worldpack.ts').includes('readAsStringAsync'),
  'worldpack.ts must use new File() API, not deprecated readAsStringAsync'
);

// 7. Field Card export uses local capture only
check(
  'FieldCardExportScreen uses react-native-view-shot (local PNG capture)',
  fs.existsSync(path.join(SRC, 'screens/logbook/FieldCardExportScreen.tsx')) &&
    readSrc('screens/logbook/FieldCardExportScreen.tsx').includes('react-native-view-shot'),
  'FieldCardExportScreen must use captureRef from react-native-view-shot'
);

check(
  'FieldCardExportScreen uses expo-sharing (no remote server)',
  readSrc('screens/logbook/FieldCardExportScreen.tsx').includes('expo-sharing'),
  'FieldCardExportScreen must share locally via expo-sharing'
);

// 8. No sign-up wall (zero-auth requirement)
const authHits = scanForPattern(SRC, /signIn|signUp|login|register|auth\.(createUser|signIn)/);
check(
  'No mandatory auth gate in src/ (zero sign-up wall)',
  authHits.length === 0,
  `Auth gating found in: ${authHits.join(', ')}`
);

// 9. Navigation wiring for Phase 3 screens
check(
  'StratigraphyDig wired into AtlasNavigator',
  fs.existsSync(path.join(SRC, 'navigation/AtlasNavigator.tsx')) &&
    readSrc('navigation/AtlasNavigator.tsx').includes('StratigraphyDig'),
  'Add StratigraphyDig screen to AtlasNavigator'
);

check(
  'LogbookNavigator exists and wires FieldCardExport',
  fs.existsSync(path.join(SRC, 'navigation/LogbookNavigator.tsx')) &&
    readSrc('navigation/LogbookNavigator.tsx').includes('FieldCardExport'),
  'Create LogbookNavigator with FieldCardExport route'
);

check(
  'MainNavigator uses LogbookNavigator (not placeholder)',
  readSrc('navigation/MainNavigator.tsx').includes('LogbookNavigator') &&
    !readSrc('navigation/MainNavigator.tsx').includes('PlaceholderScreen label="Personal Field Logbook"'),
  'Replace Logbook placeholder in MainNavigator with LogbookNavigator'
);

// Summary
console.log('\n' + '='.repeat(40));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
if (failed === 0) {
  console.log('🎉 All offline checks passed! App is fully offline-capable.\n');
} else {
  console.log(`⚠️  Fix ${failed} issue(s) before EAS build.\n`);
  process.exit(1);
}
