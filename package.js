/**
 * package.js - Builds the deployable solution .zip for Power Apps import.
 *
 * Usage: node package.js  (or: npm run package)
 *
 * Requirements: pac CLI (already installed alongside pcf-scripts)
 *
 * Steps:
 *  1. Reads ControlManifest.xml and bundle.js from out/controls/
 *  2. Copies them into SolutionUnpacked/Controls/SampleNamespace.DataGridControl/
 *  3. Writes solution.xml and customizations.xml into SolutionUnpacked/Other/
 *  4. Runs pac solution pack to produce DataGridPCFSolution.zip
 */
const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root         = __dirname;
const outDir       = path.join(root, 'out', 'controls');
const zipFile      = path.join(root, 'DataGridPCFSolution.zip');
const unpackedDir  = path.join(root, 'SolutionUnpacked');
const otherDir     = path.join(unpackedDir, 'Other');
const controlsDir  = path.join(unpackedDir, 'Controls', 'SampleNamespace.DataGridControl');
const SOLUTION_VERSION = '1.0.3.0';

// 1. Check build outputs exist
['bundle.js', 'ControlManifest.xml'].forEach(file => {
  if (!fs.existsSync(path.join(outDir, file))) {
    console.error(`ERROR: out/controls/${file} not found. Run "npm run build" first.`);
    process.exit(1);
  }
});

// 2. Ensure folder structure
fs.mkdirSync(otherDir,    { recursive: true });
fs.mkdirSync(controlsDir, { recursive: true });

// 3. Copy built files into SolutionUnpacked
fs.copyFileSync(path.join(outDir, 'bundle.js'),          path.join(controlsDir, 'bundle.js'));
fs.copyFileSync(path.join(outDir, 'ControlManifest.xml'), path.join(controlsDir, 'ControlManifest.xml'));

// 4. Write solution.xml (bump version)
const solutionXml = fs.readFileSync(path.join(root, 'SolutionPackage', 'solution.xml'), 'utf8')
  .replace(/<Version>[^<]*<\/Version>/, `<Version>${SOLUTION_VERSION}</Version>`);
fs.writeFileSync(path.join(otherDir, 'Solution.xml'), solutionXml, 'utf8');

// 5. Write customizations.xml (empty CustomControls — pac fills it from the Controls folder)
const customizationsXml =
`<?xml version="1.0" encoding="utf-8"?>
<ImportExportXml xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Entities /><Roles /><Workflows /><FieldSecurityProfiles /><Templates />
  <EntityMaps /><EntityRelationships /><OrganizationSettings /><optionsets />
  <CustomControls />
  <SolutionPluginAssemblies /><EntityDataProviders />
  <Languages><Language>1033</Language></Languages>
</ImportExportXml>`;
fs.writeFileSync(path.join(otherDir, 'Customizations.xml'), customizationsXml, 'utf8');

// 6. Run pac solution pack (produces correct zip format with forward-slash paths)
if (fs.existsSync(zipFile)) fs.unlinkSync(zipFile);
console.log('Running pac solution pack...');
execSync(
  `pac solution pack --folder "${unpackedDir}" --zipfile "${zipFile}" --packagetype Managed`,
  { stdio: 'inherit' }
);

const size = (fs.statSync(zipFile).size / 1024).toFixed(1);
console.log(`Done! DataGridPCFSolution.zip written (${size} KB)`);
console.log(`Import at https://make.powerapps.com → Solutions → Import solution`);

