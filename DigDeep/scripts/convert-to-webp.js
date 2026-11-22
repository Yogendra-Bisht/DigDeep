/**
 * DigDeep – WebP Asset Conversion Script (Phase 4)
 * ─────────────────────────────────────────────────
 * Converts PNG assets in ./assets/ to WebP using the `sharp` npm package.
 * Keeps originals as backups in ./assets/originals/
 *
 * Usage:
 *   npm install sharp --save-dev
 *   node scripts/convert-to-webp.js
 *
 * NOTE: EAS/Expo reads icons and splash screens from app.json.
 * Icon/splash assets MUST remain PNG (Apple and Google requirements).
 * Only convertible assets are: in-app images referenced via require().
 * This script skips icon.png, splash-icon.png, android-icon-*.png, favicon.png.
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const BACKUP_DIR = path.join(ASSETS_DIR, 'originals');

// Assets that MUST stay as PNG (store/OS requirements)
const SKIP_FILES = new Set([
  'icon.png',
  'splash-icon.png',
  'android-icon-foreground.png',
  'android-icon-background.png',
  'android-icon-monochrome.png',
  'favicon.png',
]);

async function convertAssets() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const files = fs.readdirSync(ASSETS_DIR).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));

  let converted = 0;
  let skipped = 0;

  for (const file of files) {
    if (SKIP_FILES.has(file)) {
      console.log(`⏭  Skip (required PNG): ${file}`);
      skipped++;
      continue;
    }

    const srcPath = path.join(ASSETS_DIR, file);
    const baseName = path.basename(file, path.extname(file));
    const destPath = path.join(ASSETS_DIR, `${baseName}.webp`);
    const backupPath = path.join(BACKUP_DIR, file);

    // Backup original
    fs.copyFileSync(srcPath, backupPath);

    // Convert to WebP (quality 85 — good balance of size vs fidelity)
    const info = await sharp(srcPath)
      .webp({ quality: 85, effort: 6 })
      .toFile(destPath);

    const origSize = fs.statSync(srcPath).size;
    const saving = (((origSize - info.size) / origSize) * 100).toFixed(1);

    console.log(`✅ ${file} → ${baseName}.webp | ${(origSize/1024).toFixed(1)}KB → ${(info.size/1024).toFixed(1)}KB (${saving}% smaller)`);
    converted++;
  }

  console.log(`\n📦 Done. Converted: ${converted} | Skipped: ${skipped}`);
  console.log(`📁 Originals backed up in: ${BACKUP_DIR}`);
  console.log(`\n⚠️  Remember to update any require('./assets/xxx.png') → require('./assets/xxx.webp') in your source files.`);
}

convertAssets().catch(err => {
  console.error('❌ Conversion failed:', err.message);
  process.exit(1);
});
