/*
  generate-icons.js (Jimp version)
  - Reads public/logo.png (case-insensitive for Logo.png)
  - Produces PNGs at common PWA sizes in public/icons/
  - Produces maskable 512px icon and icon.ico (from 48/128/256)

  Usage:
    npm run generate:icons

  No native dependencies required (uses jimp and png-to-ico)
*/

const fs = require('fs');
const path = require('path');
const { Jimp } = require('jimp');
const pngToIco = require('png-to-ico').default ?? require('png-to-ico');

(async function main() {
  try {
    console.log('icon-generator: start');
    const projectRoot = path.join(__dirname, '..');
    const publicDir = path.join(projectRoot, 'public');
    const iconsDir = path.join(publicDir, 'icons');

    // Ensure source exists (case-insensitive check)
    const candidates = ['logo.png', 'Logo.png', 'logo.JPG', 'logo.jpeg', 'logo.webp'];
    const srcFile = candidates.map(c => path.join(publicDir, c)).find(fs.existsSync);
    console.log('icon-generator: found candidate:', srcFile);
    if (!srcFile) {
      console.error('ERROR: no logo file found in public/. Place your logo at public/logo.png');
      process.exit(1);
    }

    if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

    const sizes = [48,72,96,128,144,152,192,256,384,512];

    const pngBuffersForIco = [];

    // helper to get buffer from jimp instance - modern Jimp exposes async getBuffer returning a Promise
    const getBuffer = (image, mime) => image.getBuffer(mime);

    const srcImage = await Jimp.read(srcFile);
    console.log('icon-generator: src image size', srcImage.bitmap?.width, srcImage.bitmap?.height);

    for (const s of sizes) {
      console.log('icon-generator: processing size', s);
      const outPath = path.join(iconsDir, `icon-${s}x${s}.png`);
      const img = srcImage.clone();
      img.cover({ w: s, h: s });
      // write using buffer to support Jimp builds without writeAsync
      const outBufFile = await getBuffer(img, Jimp.MIME_PNG ?? 'image/png');
      require('fs').writeFileSync(outPath, outBufFile);
      console.log('icon-generator: wrote', outPath);

      if ([48,128,256].includes(s)) {
        try {
          const buf = await getBuffer(img, Jimp.MIME_PNG ?? 'image/png');
          pngBuffersForIco.push(buf);
          console.log('icon-generator: buffered for ico', s);
        } catch (errBuf) {
          require('fs').writeFileSync(path.join(__dirname, `gen-error-buffer-${s}.txt`), String(errBuf && (errBuf.stack || errBuf)));
          console.error('icon-generator: buffer error for size', s, '; details in gen-error-buffer-' + s + '.txt');
          throw errBuf;
        }
      }
    }

    // Maskable icon - use 512 as a maskable icon (copy)
    const maskableSrc = path.join(iconsDir, 'maskable-icon-512x512.png');
    const maskableImg = srcImage.clone();
    maskableImg.cover({ w: 512, h: 512 });
    // Save maskable using buffer method for compatibility
    const maskBuf = await getBuffer(maskableImg, Jimp.MIME_PNG ?? 'image/png');
    require('fs').writeFileSync(maskableSrc, maskBuf);
    console.log('Wrote', maskableSrc);

    // Generate ICO from selected PNGs
    const icoPath = path.join(iconsDir, 'icon.ico');
    console.log('icon-generator: generating ico from', pngBuffersForIco.length, 'buffers');
    try {
      const icoBuffer = await pngToIco(pngBuffersForIco);
      fs.writeFileSync(icoPath, icoBuffer);
      console.log('Wrote', icoPath);
    } catch (e) {
      require('fs').writeFileSync(path.join(__dirname, 'gen-error-ico.txt'), String(e && (e.stack || e)));
      console.error('icon-generator: ico generation failed; details in gen-error-ico.txt');
    }

    console.log('\nAll icons generated in public/icons/');
    console.log('Remember to commit the files and include them in your build/publish.');
  } catch (err) {
    // Write a simple error file to avoid Node's inspect choking on weird errors
    try {
      require('fs').writeFileSync(path.join(__dirname, 'gen-error.txt'), String(err && (err.stack || err)));
      console.error('Generator error: details written to gen-error.txt');
    } catch (e) {
      console.error('Generator error (also failed to write file)');
    }
    process.exit(1);
  }
})();
