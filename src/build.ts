import * as fs from 'fs';
import * as path from 'path';

const STORES: string[] = ['rica-haircare', 'rica-wax'];
const targetStore: string | undefined = process.argv[2];
const storesToBuild: string[] = targetStore ? [targetStore] : STORES;

console.log('🔨 Building Shopify themes...\n');

const rootDir = path.join(__dirname, '..');

function copyDirectory(src: string, dest: string): void {
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

  const distDir = path.join(rootDir, 'dist', store);
  const themeDir = path.join(rootDir, 'theme');

  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir, { recursive: true });

  if (fs.existsSync(themeDir)) {
    copyDirectory(themeDir, distDir);
    console.log('   ✅ Copied shared theme files');
  } else {
    console.error('   ⚠️  Warning: theme/ directory not found');
  }

  const distTemplatesDir = path.join(distDir, 'templates');
  fs.mkdirSync(distTemplatesDir, { recursive: true });
  copyDirectory(path.join(rootDir, 'templates'), distTemplatesDir);
  console.log('   ✅ Copied store-specific templates');

  const distConfigDir = path.join(distDir, 'config');
  fs.mkdirSync(distConfigDir, { recursive: true });
  fs.copyFileSync(
    path.join(rootDir, 'config', 'settings_data.json'),
    path.join(distConfigDir, 'settings_data.json'),
  );
  console.log('   ✅ Copied store-specific settings_data.json');

  console.log(`   ✨ ${store} theme built successfully!\n`);
});

console.log('🎉 Build complete! Themes are ready in dist/ directory.');
