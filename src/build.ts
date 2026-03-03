import * as fs from 'fs';
import * as path from 'path';

const STORES: string[] = ['rica-haircare', 'rica-wax'];
const targetStore: string | undefined = process.argv[2];
const storesToBuild: string[] = targetStore ? [targetStore] : STORES;

console.log('🔨 Building Shopify themes...\n');

const rootDir = path.join(__dirname, '..');

/**
 * Funzione di copia con flag opzionale per evitare la sovrascrittura dei file esistenti.
 */
function copyDirectory(src: string, dest: string, skipIfExists: boolean = false): void {
  if (!fs.existsSync(src)) return;

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath, skipIfExists);
    } else {
      // Se skipIfExists è true e il file esiste già nella destinazione, non copiarlo
      if (skipIfExists && fs.existsSync(destPath)) {
        continue;
      }
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

storesToBuild.forEach((store) => {
  console.log(`📦 Building theme for ${store}...`);

  const distDir = path.join(rootDir, 'dist', store);
  const themeDir = path.join(rootDir, 'theme');

  // RIMOSSO: fs.rmSync(distDir, ...) per non perdere i file salvati nelle build precedenti.
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // 1. Copia i file base del tema (sovrascrive i file core, ma non i templates/config se gestiti sotto)
  if (fs.existsSync(themeDir)) {
    copyDirectory(themeDir, distDir);
    console.log('   ✅ Copied shared theme files');
  } else {
    console.error('   ⚠️  Warning: theme/ directory not found');
  }

  // 2. Gestione Templates (NON sovrascrive i file se esistono già in dist)
  const srcTemplatesDir = path.join(rootDir, 'templates');
  const distTemplatesDir = path.join(distDir, 'templates');

  if (fs.existsSync(srcTemplatesDir)) {
    copyDirectory(srcTemplatesDir, distTemplatesDir, true);
    console.log('   ✅ Processed templates (preserved existing files)');
  }

  // 3. Gestione settings_data.json (NON sovrascrive se esiste già in dist)
  const distConfigDir = path.join(distDir, 'config');
  const srcSettingsFile = path.join(rootDir, 'config', 'settings_data.json');
  const distSettingsFile = path.join(distConfigDir, 'settings_data.json');

  if (!fs.existsSync(distConfigDir)) {
    fs.mkdirSync(distConfigDir, { recursive: true });
  }

  if (fs.existsSync(srcSettingsFile)) {
    if (!fs.existsSync(distSettingsFile)) {
      fs.copyFileSync(srcSettingsFile, distSettingsFile);
      console.log('   ✅ Copied settings_data.json');
    } else {
      console.log('   ⏭️  Skipped settings_data.json (already exists)');
    }
  }

  console.log(`   ✨ ${store} theme built successfully!\n`);
});

console.log('🎉 Build complete! Themes are ready in dist/ directory.');
