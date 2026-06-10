/**
 * package.js - Builds the deployable solution .zip for Power Apps import.
 *
 * Usage: node package.js  (or: npm run package)
 *
 * Requirements: pac CLI installed (winget install Microsoft.PowerPlatform.CLI)
 * No network auth needed — only builds the zip locally.
 *
 * Steps:
 *  1. Copies build outputs into SolutionUnpacked/
 *  2. Runs "pac solution pack" to produce DataGridPCFSolution.zip
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

// 1. Ensure folder structure
fs.mkdirSync(unpackedOther, { recursive: true });
fs.mkdirSync(unpackedControls, { recursive: true });

// 2. Check build outputs
['bundle.js', 'ControlManifest.xml'].forEach(file => {
  if (!fs.existsSync(path.join(outDir, file))) {
    console.error(`ERROR: out/controls/${file} not found. Run "npm run build" first.`);
    process.exit(1);
  }
});

// 3. Copy files into unpacked structure
fs.copyFileSync(path.join(root, 'SolutionPackage', 'solution.xml'), path.join(unpackedOther, 'Solution.xml'));
fs.copyFileSync(path.join(outDir, 'bundle.js'), path.join(unpackedControls, 'bundle.js'));
fs.copyFileSync(path.join(outDir, 'ControlManifest.xml'), path.join(unpackedControls, 'ControlManifest.xml'));
// customizations.xml source must have empty <CustomControls /> — pac fills it from Controls/ folder
fs.writeFileSync(path.join(unpackedOther, 'Customizations.xml'),
  `<?xml version="1.0" encoding="utf-8"?>\n` +
  `<ImportExportXml xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n` +
  `  <Entities /><Roles /><Workflows /><FieldSecurityProfiles /><Templates />\n` +
  `  <EntityMaps /><EntityRelationships /><OrganizationSettings /><optionsets />\n` +
  `  <CustomControls />\n` +
  `  <SolutionPluginAssemblies /><EntityDataProviders />\n` +
  `  <Languages><Language>1033</Language></Languages>\n` +
  `</ImportExportXml>`, 'utf8');

// 4. Delete old zip
if (fs.existsSync(zipFile)) fs.unlinkSync(zipFile);

// 5. Run pac solution pack
console.log('Running pac solution pack...');
execSync(
  `pac solution pack --folder "${unpackedDir}" --zipfile "${zipFile}" --packagetype Unmanaged`,
  { stdio: 'inherit' }
);

console.log(`\nDone! Import DataGridPCFSolution.zip at https://make.powerapps.com → Solutions → Import solution`);

console.log(`\nImport DataGridPCFSolution.zip at https://make.powerapps.com → Solutions → Import solution`);
