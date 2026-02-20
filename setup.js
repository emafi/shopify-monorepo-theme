const fs = require('fs');
const path = require('path');

const STORES = ['rica-haircare', 'rica-wax'];
const SHARED_DIRS = ['assets', 'layout', 'locales', 'sections', 'snippets'];

console.log('🚀 Setting up RICA Theme Monorepo...\n');

const themeDir = path.join(__dirname, 'theme');
if (!fs.existsSync(themeDir)) {
  fs.mkdirSync(themeDir, { recursive: true });
  console.log('✅ Created theme/ directory');
}

const themeConfigDir = path.join(themeDir, 'config');
if (!fs.existsSync(themeConfigDir)) {
  fs.mkdirSync(themeConfigDir, { recursive: true });
}

SHARED_DIRS.forEach(dir => {
  const src = path.join(__dirname, dir);
  const dest = path.join(themeDir, dir);
  if (fs.existsSync(src)) {
    if (fs.existsSync(dest)) {
      console.log(`⚠️  ${dir}/ already exists in theme/, skipping...`);
    } else {
      fs.renameSync(src, dest);
      console.log(`✅ Moved ${dir}/ to theme/${dir}/`);
    }
  }
});

const settingsSchemaSrc = path.join(__dirname, 'config', 'settings_schema.json');
const settingsSchemaDest = path.join(themeConfigDir, 'settings_schema.json');
if (fs.existsSync(settingsSchemaSrc) && !fs.existsSync(settingsSchemaDest)) {
  fs.copyFileSync(settingsSchemaSrc, settingsSchemaDest);
  console.log('✅ Copied config/settings_schema.json to theme/config/');
}

const storesDir = path.join(__dirname, 'stores');
if (!fs.existsSync(storesDir)) {
  fs.mkdirSync(storesDir, { recursive: true });
  console.log('✅ Created stores/ directory');
}

STORES.forEach(store => {
  const storeDir = path.join(storesDir, store);
  const storeTemplatesDir = path.join(storeDir, 'templates');
  const storeConfigDir = path.join(storeDir, 'config');
  
  if (!fs.existsSync(storeDir)) fs.mkdirSync(storeDir, { recursive: true });
  if (!fs.existsSync(storeTemplatesDir)) fs.mkdirSync(storeTemplatesDir, { recursive: true });
  if (!fs.existsSync(storeConfigDir)) fs.mkdirSync(storeConfigDir, { recursive: true });
  
  console.log(`✅ Created stores/${store}/ directory structure`);
  
  const templatesSrc = path.join(__dirname, 'templates');
  if (fs.existsSync(templatesSrc)) {
    const files = fs.readdirSync(templatesSrc);
    files.forEach(file => {
      const srcFile = path.join(templatesSrc, file);
      const destFile = path.join(storeTemplatesDir, file);
      if (fs.statSync(srcFile).isDirectory()) {
        if (!fs.existsSync(destFile)) {
          fs.mkdirSync(destFile, { recursive: true });
          const subFiles = fs.readdirSync(srcFile);
          subFiles.forEach(subFile => {
            fs.copyFileSync(path.join(srcFile, subFile), path.join(destFile, subFile));
          });
        }
      } else if (!fs.existsSync(destFile)) {
        fs.copyFileSync(srcFile, destFile);
      }
    });
    console.log(`   📄 Copied templates to stores/${store}/templates/`);
  }
  
  const settingsDataSrc = path.join(__dirname, 'config', 'settings_data.json');
  const settingsDataDest = path.join(storeConfigDir, 'settings_data.json');
  if (fs.existsSync(settingsDataSrc) && !fs.existsSync(settingsDataDest)) {
    fs.copyFileSync(settingsDataSrc, settingsDataDest);
    console.log(`   ⚙️  Copied settings_data.json to stores/${store}/config/`);
  }
});

const gitignorePath = path.join(__dirname, '.gitignore');
if (!fs.existsSync(gitignorePath)) {
  fs.writeFileSync(gitignorePath, `# Build outputs
dist/
node_modules/

# OS files
.DS_Store
Thumbs.db

# Editor files
.vscode/
.idea/
*.swp
*.swo
*~
`);
  console.log('✅ Created .gitignore');
}

console.log('\n✨ Setup complete!');
console.log('\nNext steps:');
console.log('1. Review and customize store-specific templates in stores/{store-name}/templates/');
console.log('2. Review and customize settings_data.json in stores/{store-name}/config/');
console.log('3. Run "npm run build" to build themes for deployment');
