const { execSync } = require('child_process');

console.log('Running post-build to inject brand favicons and meta tags into dist/index.html...');
execSync('node scripts/post-build.js', { stdio: 'inherit' });
