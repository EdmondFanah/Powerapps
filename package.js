/**
 * package.js - Builds the deployable solution .zip for Power Apps canvas.
 *
 * Usage: node package.js  (or: npm run package)
 *
 * Steps:
 *  1. Copies the latest bundle.js + ControlManifest.xml from out/controls/
 *     into SolutionPackage/Controls/SampleNamespace.DataGridControl/
 *  2. Zips the SolutionPackage folder to DataGridPCFSolution.zip
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = __dirname;
const outDir = path.join(root, 'out', 'controls');
const solutionControlDir = path.join(root, 'SolutionPackage', 'Controls', 'SampleNamespace.DataGridControl');
const zipFile = path.join(root, 'DataGridPCFSolution.zip');

// 1. Copy build outputs into SolutionPackage
console.log('Copying build outputs into SolutionPackage...');
fs.mkdirSync(solutionControlDir, { recursive: true });

['bundle.js', 'ControlManifest.xml'].forEach(file => {
  const src = path.join(outDir, file);
  const dest = path.join(solutionControlDir, file);
  if (!fs.existsSync(src)) {
    console.error(`ERROR: ${src} not found. Run "npm run build" first.`);
    process.exit(1);
  }
  fs.copyFileSync(src, dest);
  console.log(`  Copied ${file}`);
});

// 2. Zip SolutionPackage using PowerShell
console.log('Creating DataGridPCFSolution.zip...');
if (fs.existsSync(zipFile)) fs.unlinkSync(zipFile);

const solutionPackageDir = path.join(root, 'SolutionPackage');

// Use PowerShell Compress-Archive (Windows) or zip (Unix)
if (process.platform === 'win32') {
  execSync(
    `powershell -Command "Compress-Archive -Path '${solutionPackageDir}\\*' -DestinationPath '${zipFile}' -Force"`,
    { stdio: 'inherit' }
  );
} else {
  execSync(`cd "${solutionPackageDir}" && zip -r "${zipFile}" .`, { stdio: 'inherit' });
}

console.log(`\nDone! Import ${path.basename(zipFile)} into Power Apps at https://make.powerapps.com`);
