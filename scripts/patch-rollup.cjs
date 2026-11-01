const fs = require('fs');
const path = require('path');

const files = [
  path.resolve(__dirname, '../node_modules/rollup/dist/es/shared/node-entry.js'),
  path.resolve(__dirname, '../node_modules/rollup/dist/shared/rollup.js')
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');
  const target = 'await mkdir(dirname(fileName), { recursive: true });';
  const replacement = 'for (let i = 0; i < 8; i++) { try { await mkdir(dirname(fileName), { recursive: true }); break; } catch (e) { if ((e.code === "EPERM" || e.code === "EBUSY") && i < 7) { await new Promise(r => setTimeout(r, 150)); continue; } throw e; } }';
  if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync(file, code, 'utf8');
    console.log('Patched', file);
  } else {
    console.log('Already patched or not found in', file);
  }
}
