const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const distDir = path.join(projectRoot, 'dist');
const distIndex = path.join(distDir, 'index.html');

console.log('[Post-Build] Copying public static assets to dist...');

// 1. Copy all static assets from public/ to dist/, NEVER overwriting index.html
if (fs.existsSync(publicDir)) {
  const files = fs.readdirSync(publicDir);
  for (const file of files) {
    if (file === 'index.html' || file.startsWith('index.html.')) continue;
    const srcPath = path.join(publicDir, file);
    const destPath = path.join(distDir, file);
    fs.cpSync(srcPath, destPath, { recursive: true, force: true });
    console.log(`[Post-Build] Copied public/${file} -> dist/${file}`);
  }
}

// 2. Enhance dist/index.html with PWA meta tags & favicons without touching bundle scripts
if (fs.existsSync(distIndex)) {
  let html = fs.readFileSync(distIndex, 'utf8');

  // Verify that the Expo script tag is present
  const hasScript = /<script\b[^>]*src=["'][^"']*_expo\/static\/js\/web\/[^"']*["'][^>]*><\/script>/i.test(html) ||
                    /<script\b[^>]*defer[^>]*><\/script>/i.test(html) ||
                    html.includes('/_expo/static/js/web/');

  if (!hasScript) {
    console.warn('[Post-Build] WARNING: No Expo web script tag detected in dist/index.html!');
  } else {
    console.log('[Post-Build] Verified Expo web script bundle tag is present in dist/index.html.');
  }

  // Ensure app title
  const appTitle = 'வெற்றி நிதி மேலாண்மை';
  if (html.includes('<title>')) {
    html = html.replace(/<title>.*?<\/title>/, `<title>${appTitle}</title>`);
  }

  // Inject PWA meta tags & icons into <head>
  const metaTags = `
    <!-- PWA & Brand Favicons -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/manifest.json" />

    <meta name="theme-color" content="#059669" />
    <meta name="description" content="வெற்றி நிதி மேலாண்மை - Intelligent Mobile Financial Engine" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="${appTitle}" />
  `;

  if (!html.includes('rel="manifest"')) {
    html = html.replace('</head>', `${metaTags}\n  </head>`);
  }

  fs.writeFileSync(distIndex, html, 'utf8');
  console.log('[Post-Build] Successfully enhanced dist/index.html with brand meta tags.');
} else {
  console.error('[Post-Build] ERROR: dist/index.html not found!');
  process.exit(1);
}

