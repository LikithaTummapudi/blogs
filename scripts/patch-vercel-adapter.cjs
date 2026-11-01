/**
 * Patches @astrojs/vercel/serverless adapter to target Node.js 22 runtime for Vercel Serverless Functions
 * and prevent fallback to outdated nodejs18.x or unsupported runtimes.
 */
const fs = require('fs');
const path = require('path');

const adapterPath = path.resolve(__dirname, '../node_modules/@astrojs/vercel/dist/serverless/adapter.js');

if (fs.existsSync(adapterPath)) {
  let content = fs.readFileSync(adapterPath, 'utf8');

  // Replace getRuntime implementation to return nodejs22.x (or nodejs20.x)
  const getRuntimeRegex = /function getRuntime\(process, logger\) \{[\s\S]*?\n\}/;
  const newGetRuntime = `function getRuntime(process, logger) {
    const version = process.version.slice(1);
    const major = version.split('.')[0];
    if (major === '20') {
        return 'nodejs20.x';
    }
    return 'nodejs22.x';
}`;

  if (getRuntimeRegex.test(content)) {
    content = content.replace(getRuntimeRegex, newGetRuntime);
    fs.writeFileSync(adapterPath, content, 'utf8');
    console.log('[patch-vercel-adapter] Successfully patched getRuntime to target nodejs22.x.');
  } else {
    console.log('[patch-vercel-adapter] getRuntime function pattern not matched.');
  }
} else {
  console.log('[patch-vercel-adapter] @astrojs/vercel not found, skipping patch.');
}
