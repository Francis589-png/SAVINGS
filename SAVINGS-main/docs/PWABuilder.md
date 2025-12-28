# PWABuilder / Microsoft Store Checklist

This document explains how to prepare and verify the PWA for packaging with PWABuilder and submission to the Microsoft Store.

## Current status (automated)
- manifest.json exists and includes:
  - `name`, `short_name`, `start_url`, `display`, `background_color`, `theme_color` and `icons`.
- Icons generated in `public/icons/` (48–512 PNGs, `maskable-icon-512x512.png`, and `icon.ico`). Use `npm run generate:icons` to regenerate.
- `next.config.ts` uses `@ducanh2912/next-pwa` with `register: true` and `dest: 'public'` (service worker will be generated on build).

## Before submitting to PWABuilder
1. Ensure your app is hosted publicly over HTTPS (PWABuilder requires a reachable URL).
2. Run a production build and serve it (locally or on staging):

```bash
npm run build
npm run start # or serve the build on a static host
```

3. Verify in a Chromium-based browser (Edge/Chrome):
   - `https://your-app.example/manifest.json` loads
   - Service worker is registered (DevTools > Application > Service Workers)
   - `https://your-app.example/` is installable (check "Install" prompt or DevTools > Application > Manifest)

4. Test offline behaviour (optional): turn offline in DevTools > Network and verify basic pages load.

## Submit to PWABuilder
- Use https://pwabuilder.com and provide your HTTPS URL. PWABuilder will:
  - Validate manifest and service worker
  - Generate Windows packaging (MSIX) and Windows-specific assets

## Windows Store specific hints
- Microsoft Store requires:
  - Windows 10+ target
  - Edge WebView2 runtime available to users
  - App metadata: name, version, description, privacy policy URL, screenshots
- PWABuilder will generate `.msix` or `.appx` you can upload to Partner Center.

## Additional tips
- If you cannot host publicly, use `ngrok` to temporarily expose your local server: `npx ngrok http 3000` and use the generated HTTPS URL in PWABuilder.
- Keep a clear privacy policy URL and screenshots ready for Store submission.

---

If you'd like, I can:
- Run `npm run build` and verify `public/sw.js` and that the manifest is served, or
- Prepare a minimal `assets/windows/` folder with recommended Microsoft tile sizes.

Tell me which of the next steps you want me to take.