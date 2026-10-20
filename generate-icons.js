const path = require('path');
const fs = require('fs');
const { Jimp } = require('jimp');

async function generateIcons() {
  const root = path.resolve(__dirname);
  const srcIconPath = path.join(root, 'assets', 'icon', 'app_icon.png');
  
  if (!fs.existsSync(srcIconPath)) {
    console.error('Source icon not found at:', srcIconPath);
    return;
  }

  console.log('Reading source icon:', srcIconPath);
  const image = await Jimp.read(srcIconPath);

  // Android mipmap densities and their dimensions
  const mipmaps = [
    { folder: 'mipmap-mdpi', size: 48 },
    { folder: 'mipmap-hdpi', size: 72 },
    { folder: 'mipmap-xhdpi', size: 96 },
    { folder: 'mipmap-xxhdpi', size: 144 },
    { folder: 'mipmap-xxxhdpi', size: 192 }
  ];

  const resDir = path.join(root, 'android', 'app', 'src', 'main', 'res');

  for (const m of mipmaps) {
    const targetDir = path.join(resDir, m.folder);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // 1. Standard square launcher
    const iconClone = image.clone();
    iconClone.resize({ w: m.size, h: m.size });
    await iconClone.write(path.join(targetDir, 'ic_launcher.png'));

    // 2. Foreground for adaptive icons
    await iconClone.write(path.join(targetDir, 'ic_launcher_foreground.png'));

    // 3. Round launcher (circle masked)
    const roundClone = iconClone.clone();
    roundClone.circle();
    await roundClone.write(path.join(targetDir, 'ic_launcher_round.png'));

    console.log(`[Generated] ${m.folder} (${m.size}x${m.size})`);
  }

  // Also export PWA / web icons (192x192 & 512x512)
  const iconDir = path.join(root, 'assets', 'icon');
  const icon192 = image.clone();
  icon192.resize({ w: 192, h: 192 });
  await icon192.write(path.join(iconDir, 'icon-192.png'));

  const icon512 = image.clone();
  icon512.resize({ w: 512, h: 512 });
  await icon512.write(path.join(iconDir, 'icon-512.png'));

  console.log('[Generated] PWA Web icons: icon-192.png, icon-512.png');
  console.log('>>> All Android and Web App icons successfully updated!');
}

generateIcons().catch(console.error);
