const fs = require('fs');
const path = require('path');

const STORES = ['rica-haircare', 'rica-wax'];
const targetStore = process.argv[2];
const storesToBuild = targetStore ? [targetStore] : STORES;

console.log('🔨 Building Shopify themes...\n');

/**
 * Funzione di copia migliorata:
 * Se skipIfExists è true, non sovrascrive i file già presenti nella destinazione.
 */
function copyDirectory(src, dest, skipIfExists = false) {
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
      // LOGICA DI SALVAGUARDIA:
      // Se skipIfExists è vero e il file esiste già, lo saltiamo.
      if (skipIfExists && fs.existsSync(destPath)) {
        console.log(`   ⏭️  Skipping existing file: ${entry.name}`);
        continue;
      }
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

storesToBuild.forEach((store) => {
  console.log(`📦 Building theme for ${store}...`);
  const distDir = path.join(__dirname, 'dist', store);
  const themeDir = path.join(__dirname, 'theme');

  // 1. NON cancelliamo l'intera cartella 'dist' se vogliamo preservare i file.
  // Invece di fs.rmSync, creiamo la cartella se non esiste.
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // 2. Copia dei file base del tema
  if (fs.existsSync(themeDir)) {
    // Qui copiamo tutto, ma possiamo decidere se sovrascrivere o meno.
    // Se 'templates' è dentro 'themeDir', verrà gestito dalla funzione ricorsiva.
    copyDirectory(themeDir, distDir);
    console.log(`   ✅ Copied shared theme files`);
  }

  // 3. Gestione Cartella Templates (Salvaguardia)
  const storeTemplatesSrc = path.join(__dirname, 'stores', store, 'templates'); // Esempio di path corretto
  const distTemplatesDir = path.join(distDir, 'templates');

  if (fs.existsSync(storeTemplatesSrc)) {
    // Usiamo il flag true per NON sovrascrivere i file esistenti in /templates
    copyDirectory(storeTemplatesSrc, distTemplatesDir, true);
    console.log(`   ✅ Processed store templates (no overwrite)`);
  }

  // 4. Gestione settings_data.json (Salvaguardia)
  const configSrc = path.join(__dirname, 'config', 'settings_data.json');
  const configDest = path.join(distDir, 'config', 'settings_data.json');
  const distConfigDir = path.join(distDir, 'config');

  if (!fs.existsSync(distConfigDir)) {
    fs.mkdirSync(distConfigDir, { recursive: true });
  }

  if (fs.existsSync(configDest)) {
    console.log(`   ⏭️  Skipping settings_data.json (already exists)`);
  } else if (fs.existsSync(configSrc)) {
    fs.copyFileSync(configSrc, configDest);
    console.log(`   ✅ Copied settings_data.json`);
  }

  console.log(`   ✨ ${store} theme built successfully!\n`);
});

console.log('🎉 Build complete!');
