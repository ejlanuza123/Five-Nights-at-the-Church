/**
 * Build Script for Mobile Packaging (Five Nights at the Church)
 * Bundles pure web assets into www/ for Capacitor Android & iOS builds.
 */
const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const wwwDir = path.join(rootDir, 'www');

console.log('--- Five Nights at the Church: Mobile Asset Packager ---');
console.log('Source directory:', rootDir);
console.log('Target directory:', wwwDir);

// Ensure www exists
if (!fs.existsSync(wwwDir)) {
  fs.mkdirSync(wwwDir, { recursive: true });
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const items = fs.readdirSync(src);
    for (const item of items) {
      if (['node_modules', '.git', 'android', 'www', '.gemini'].includes(item)) continue;
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 1. Copy top-level required web files
const topFiles = ['index.html', 'manifest.json'];
topFiles.forEach(file => {
  const src = path.join(rootDir, file);
  const dest = path.join(wwwDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`[Copied] ${file}`);
  }
});

// 2. Copy directories
const folders = ['css', 'js', 'libs', 'assets'];
folders.forEach(folder => {
  const src = path.join(rootDir, folder);
  const dest = path.join(wwwDir, folder);
  if (fs.existsSync(src)) {
    console.log(`[Copying directory] ${folder}...`);
    copyRecursive(src, dest);
  }
});

// 3. Patch Capacitor Java 21 incompatibility with JDK 17 if needed
const capBuildGradle = path.join(rootDir, 'node_modules', '@capacitor', 'android', 'capacitor', 'build.gradle');
if (fs.existsSync(capBuildGradle)) {
  let content = fs.readFileSync(capBuildGradle, 'utf8');
  if (content.includes('JavaVersion.VERSION_21')) {
    content = content.replace(/JavaVersion\.VERSION_21/g, 'JavaVersion.VERSION_17');
    fs.writeFileSync(capBuildGradle, content, 'utf8');
    console.log('[Patched] Capacitor Android compile target set to Java 17');
  }
}

const capAppBuildGradle = path.join(rootDir, 'android', 'app', 'capacitor.build.gradle');
if (fs.existsSync(capAppBuildGradle)) {
  let content = fs.readFileSync(capAppBuildGradle, 'utf8');
  if (content.includes('JavaVersion.VERSION_21')) {
    content = content.replace(/JavaVersion\.VERSION_21/g, 'JavaVersion.VERSION_17');
    fs.writeFileSync(capAppBuildGradle, content, 'utf8');
    console.log('[Patched] android/app/capacitor.build.gradle set to Java 17');
  }
}

console.log('>>> Mobile asset bundle successfully exported to www/ !');
