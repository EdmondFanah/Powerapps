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

const solutionPackageDir = path.join(root, 'SolutionPackage');

// Write a temp PowerShell script to zip with forward-slash paths (required by Power Apps)
if (process.platform === 'win32') {
  // Delete old zip via PowerShell to avoid Windows lock issues
  if (fs.existsSync(zipFile)) {
    execSync(`powershell -Command "Remove-Item -Force '${zipFile}'"`, { stdio: 'inherit' });
  }
  const tmpScript = path.join(root, '_mkzip.ps1');
  const ps = `
Add-Type -Assembly 'System.IO.Compression'
Add-Type -Assembly 'System.IO.Compression.FileSystem'
$src = '${solutionPackageDir}'
$dest = '${zipFile}'
if (Test-Path $dest) { Remove-Item $dest }
$zip = [System.IO.Compression.ZipFile]::Open($dest, [System.IO.Compression.ZipArchiveMode]::Create)
Get-ChildItem $src -Recurse -File | ForEach-Object {
    $rel = $_.FullName.Substring($src.Length + 1).Replace('\\', '/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $rel) | Out-Null
}
$zip.Dispose()
`.trimStart();
  fs.writeFileSync(tmpScript, ps, 'utf8');
  execSync(`powershell -ExecutionPolicy Bypass -File "${tmpScript}"`, { stdio: 'inherit' });
  fs.unlinkSync(tmpScript);
} else {
  execSync(`cd "${solutionPackageDir}" && zip -r "${zipFile}" .`, { stdio: 'inherit' });
}

console.log(`\nDone! Import ${path.basename(zipFile)} into Power Apps at https://make.powerapps.com`);
