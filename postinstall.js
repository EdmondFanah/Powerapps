/**
 * postinstall.js - Patches pcf-scripts startTask to fix the outputDir path.
 * 
 * pcf-scripts@1.51.1 has a bug in startTask.js where it does
 *   path.join(outDir, controls[0])
 * which appends "bundle.js" to the path instead of a subfolder.
 * This script corrects it after npm install.
 */
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'node_modules', 'pcf-scripts', 'tasks', 'startTask.js');

if (!fs.existsSync(file)) {
  console.log('postinstall: startTask.js not found, skipping patch');
  process.exit(0);
}

let content = fs.readFileSync(file, 'utf8');

const buggyLine = 'const outputDir = path.join(outDir, controls[0]);';
const fixedLine = '// outDir is already the controls output directory (e.g. out/controls)\n            const outputDir = outDir;';

if (content.includes(buggyLine)) {
  content = content.replace(buggyLine, fixedLine);
  fs.writeFileSync(file, content, 'utf8');
  console.log('postinstall: patched pcf-scripts/tasks/startTask.js ✓');
} else if (content.includes('const outputDir = outDir;')) {
  console.log('postinstall: startTask.js already patched, skipping');
} else {
  console.warn('postinstall: WARNING - startTask.js pattern not found, manual patch may be needed');
}
