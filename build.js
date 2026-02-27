const fs = require('fs');
const path = require('path');

const STORES = ['rica-haircare', 'rica-wax'];
const targetStore = process.argv[2];
const storesToBuild = targetStore ? [targetStore] : STORES;

console.log('🔨 Building Shopify themes...\n');

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

storesToBuild.forEach((store) => {
  console.log(`📦 Building theme for ${store}...`);
  const distDir = path.join(__dirname, 'dist', store);
  const themeDir = path.join(__dirname, 'theme');

  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir, { recursive: true });

  if (fs.existsSync(themeDir)) {
    copyDirectory(themeDir, distDir);
    console.log(`   ✅ Copied shared theme files`);
  } else {
    console.error(`   ⚠️  Warning: theme/ directory not found`);
  }

  const distTemplatesDir = path.join(distDir, 'templates');
  if (fs.existsSync(storeTemplatesDir)) {
    if (!fs.existsSync(distTemplatesDir)) {
      fs.mkdirSync(distTemplatesDir, { recursive: true });
    }
    copyDirectory(storeTemplatesDir, distTemplatesDir);
    console.log(`   ✅ Copied store-specific templates`);
  }

  const distConfigDir = path.join(distDir, 'config');
  if (!fs.existsSync(distConfigDir)) {
    fs.mkdirSync(distConfigDir, { recursive: true });
  }
  fs.copyFileSync(
    path.join(__dirname, 'config', 'settings_data.json'),
    path.join(distConfigDir, 'settings_data.json'),
  );
  console.log(`   ✅ Copied store-specific settings_data.json`);

  console.log(`   ✨ ${store} theme built successfully!\n`);
});

console.log('🎉 Build complete! Themes are ready in dist/ directory.');
