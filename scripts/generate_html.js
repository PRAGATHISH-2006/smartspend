const fs = require('fs');
const path = require('path');

const b64 = fs.readFileSync(path.join(__dirname, '..', 'assets', 'favicon.png')).toString('base64');
const dataUri = 'data:image/png;base64,' + b64;

const html = `<!DOCTYPE html>
<html lang="ta">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <title>வெற்றி நிதி மேலாண்மை</title>

    <!-- Immediate Favicons (inline data URI bypasses browser cache) -->
    <link rel="icon" type="image/png" href="${dataUri}" />
    <link rel="shortcut icon" type="image/png" href="${dataUri}" />
    <link rel="icon" type="image/png" sizes="64x64" href="/favicon.png?v=2026" />
    <link rel="shortcut icon" href="/favicon.ico?v=2026" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/manifest.json" />

    <meta name="theme-color" content="#059669" />
    <meta name="description" content="வெற்றி நிதி மேலாண்மை - Finance Management for All Citizens" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="வெற்றி நிதி மேலாண்மை" />

    <!-- React Native Web Reset -->
    <style id="expo-reset">
      html, body {
        height: 100%;
        margin: 0;
        padding: 0;
        background-color: #0F172A;
      }
      body {
        overflow: hidden;
      }
      #root {
        display: flex;
        height: 100%;
        flex: 1;
      }
    </style>
    <script>
      document.title = 'வெற்றி நிதி மேலாண்மை';
    </script>
  </head>

  <body>
    <noscript>
      You need to enable JavaScript to run this app.
    </noscript>
    <div id="root"></div>
  </body>
</html>
`;

fs.writeFileSync(path.join(__dirname, '..', 'public', 'index.html'), html, 'utf8');
if (!fs.existsSync(path.join(__dirname, '..', 'web'))) {
  fs.mkdirSync(path.join(__dirname, '..', 'web'));
}
fs.writeFileSync(path.join(__dirname, '..', 'web', 'index.html'), html, 'utf8');
console.log('Successfully generated public/index.html and web/index.html');

