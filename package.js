/**
 * package.js - Builds the deployable solution .zip for Power Apps import.
 *
 * Usage: node package.js  (or: npm run package)
 *
 * No external dependencies required — uses Node.js built-ins + PowerShell Compress-Archive.
 *
 * Steps:
 *  1. Reads ControlManifest.xml and bundle.js from out/controls/
 *  2. Builds solution.xml and customizations.xml with the manifest fully embedded
 *  3. Writes files to a temp folder, then zips with PowerShell Compress-Archive
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const root = __dirname;
const outDir = path.join(root, 'out', 'controls');
const zipFile = path.join(root, 'DataGridPCFSolution.zip');
const SOLUTION_VERSION = '1.0.1.0';
const CONTROL_VERSION = '1.0.1';
const CONTROL_NAME = 'SampleNamespace.DataGridControl';

// 1. Check build outputs exist
['bundle.js', 'ControlManifest.xml'].forEach(file => {
  if (!fs.existsSync(path.join(outDir, file))) {
    console.error(`ERROR: out/controls/${file} not found. Run "npm run build" first.`);
    process.exit(1);
  }
});

const manifestXml = fs.readFileSync(path.join(outDir, 'ControlManifest.xml'), 'utf8');
const bundleJs    = fs.readFileSync(path.join(outDir, 'bundle.js'));
const bundleBase64 = bundleJs.toString('base64');
// Strip the <?xml?> declaration so it embeds cleanly inside customizations.xml
const manifestInner = manifestXml.replace(/<\?xml[^?]*\?>\s*/, '');

// 2. Build solution.xml — use the existing SolutionPackage/solution.xml as base, bump version
const solutionXml = fs.readFileSync(path.join(root, 'SolutionPackage', 'solution.xml'), 'utf8')
  .replace(/<Version>[^<]*<\/Version>/, `<Version>${SOLUTION_VERSION}</Version>`);

// 3. Build customizations.xml with fully embedded manifest and bundle (base64)
const customizationsXml = `<?xml version="1.0" encoding="utf-8"?>
<ImportExportXml xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Entities />
  <Roles />
  <Workflows />
  <FieldSecurityProfiles />
  <Templates />
  <EntityMaps />
  <EntityRelationships />
  <OrganizationSettings />
  <optionsets />
  <CustomControls>
    <CustomControl Name="${CONTROL_NAME}" Version="${CONTROL_VERSION}">
      <Manifest>${manifestInner.trim()}</Manifest>
      <Resources>
        <Resource Path="Controls/${CONTROL_NAME}/bundle.js" Order="1" Version="${CONTROL_VERSION}" FileContent="${bundleBase64}" />
      </Resources>
    </CustomControl>
  </CustomControls>
  <SolutionPluginAssemblies />
  <EntityDataProviders />
  <Languages>
    <Language>1033</Language>
  </Languages>
</ImportExportXml>`;

// 4. Write to temp dir and zip with PowerShell Compress-Archive (guaranteed-compatible zip)
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dgp-solution-'));
try {
  fs.writeFileSync(path.join(tmpDir, 'solution.xml'),       solutionXml,       'utf8');
  fs.writeFileSync(path.join(tmpDir, 'customizations.xml'), customizationsXml, 'utf8');

  if (fs.existsSync(zipFile)) fs.unlinkSync(zipFile);

  execSync(
    `powershell -NoProfile -Command "Compress-Archive -Path '${tmpDir}\\*' -DestinationPath '${zipFile}' -Force"`,
    { stdio: 'inherit' }
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

const size = (fs.statSync(zipFile).size / 1024).toFixed(1);
console.log(`Done! DataGridPCFSolution.zip written (${size} KB)`);
console.log(`Import at https://make.powerapps.com → Solutions → Import solution`);

