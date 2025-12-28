/*
  generate-icons.js (sharp version)
  - Reads public/logo.png (case-insensitive for Logo.png)
  - Produces PNGs at common PWA sizes in public/icons/
  - Produces maskable 512px icon and icon.ico (from 48/128/256)

  Usage:
    npm run generate:icons

  Requires: sharp, to-ico
*/

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const toIco = require('to-ico');

(async function main() {
  try {
    const projectRoot = path.join(__dirname, '..');
    const publicDir = path.join(projectRoot, 'public');
    const iconsDir = path.join(publicDir, 'icons');

    // Ensure source exists (case-insensitive check)
    const candidates = ['logo.png', 'Logo.png', 'logo.JPG', 'logo.jpeg', 'logo.webp'];
    const srcFile = candidates.map(c => path.join(publicDir, c)).find(fs.existsSync);
    if (!srcFile) {
      console.error('ERROR: no logo file found in public/. Place your logo at public/logo.png');
      process.exit(1);
    }

    if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir);

    const sizes = [48,72,96,128,144,152,192,256,384,512];

    const pngBuffersForIco = [];

    for (const s of sizes) {
      const outPath = path.join(iconsDir, `icon-${s}x${s}.png`);
      await sharp(srcFile)
        .resize(s, s, { fit: 'cover', position: sharp.strategy.attention })
        .png()
        .toFile(outPath);
      console.log('Wrote', outPath);

      if ([48,128,256].includes(s)) {
        const buf = await sharp(srcFile)
          .resize(s, s, { fit: 'cover', position: sharp.strategy.attention })
          .png()
          .toBuffer();
        pngBuffersForIco.push(buf);
      }
    }

    // Maskable icon - use 512 as a maskable icon (copy)
    const maskableSrc = path.join(iconsDir, 'maskable-icon-512x512.png');
    await sharp(srcFile).resize(512,512, { fit: 'cover', position: sharp.strategy.attention }).png().toFile(maskableSrc);
    console.log('Wrote', maskableSrc);

    // Generate ICO from selected PNGs
    const icoPath = path.join(iconsDir, 'icon.ico');
    const icoBuffer = await toIco(pngBuffersForIco);
    fs.writeFileSync(icoPath, icoBuffer);
    console.log('Wrote', icoPath);

    console.log('\nAll icons generated in public/icons/');
    console.log('Remember to commit the files and include them in your build/publish.');
  } catch (err) {
    console.error('Generator error:', err);
    process.exit(1);
  }
})();
