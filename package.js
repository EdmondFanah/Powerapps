/**
 * package.js - Builds the deployable solution .zip for Power Apps canvas.
 *
 * Usage: node package.js  (or: npm run package)
 *
 * Steps:
 *  1. Copies the latest bundle.js + ControlManifest.xml from out/controls/
 *     into SolutionUnpacked/Controls/SampleNamespace.DataGridControl/
 *  2. Copies solution.xml and customizations.xml into SolutionUnpacked/Other/
 *  3. Runs "pac solution pack" to produce a properly formatted DataGridPCFSolution.zip
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = __dirname;
const outDir = path.join(root, 'out', 'controls');
const unpackedDir = path.join(root, 'SolutionUnpacked');
const unpackedOther = path.join(unpackedDir, 'Other');
const unpackedControls = path.join(unpackedDir, 'Controls', 'SampleNamespace.DataGridControl');
const zipFile = path.join(root, 'DataGridPCFSolution.zip');

// 1. Ensure SolutionUnpacked folder structure exists
fs.mkdirSync(unpackedOther, { recursive: true });
fs.mkdirSync(unpackedControls, { recursive: true });

// 2. Copy build outputs
console.log('Copying build outputs...');
['bundle.js', 'ControlManifest.xml'].forEach(file => {
  const src = path.join(outDir, file);
  if (!fs.existsSync(src)) {
    console.error(`ERROR: ${src} not found. Run "npm run build" first.`);
    process.exit(1);
  }
  fs.copyFileSync(src, path.join(unpackedControls, file));
  console.log(`  Copied ${file}`);
});

// 3. Copy solution XML files into Other/
fs.copyFileSync(path.join(root, 'SolutionPackage', 'solution.xml'), path.join(unpackedOther, 'Solution.xml'));
fs.copyFileSync(path.join(root, 'SolutionPackage', 'customizations.xml'), path.join(unpackedOther, 'Customizations.xml'));
console.log('  Copied Solution.xml and Customizations.xml');

// 4. Delete old zip if it exists
if (fs.existsSync(zipFile)) fs.unlinkSync(zipFile);

// 5. Use pac solution pack to create the zip
console.log('Running pac solution pack...');
const pacCmd = `pac solution pack --folder "${unpackedDir}" --zipfile "${zipFile}" --packagetype Unmanaged`;
execSync(pacCmd, { stdio: 'inherit' });

console.log(`\nDone! Import ${path.basename(zipFile)} into Power Apps at https://make.powerapps.com`);
