/**
 * package.js - Builds the deployable solution .zip for Power Apps import.
 *
 * Usage: node package.js  (or: npm run package)
 *
 * Requires only Node.js + .NET (no pac CLI, no network auth).
 *
 * Steps:
 *  1. Builds bundle.js via npm run build
 *  2. Zips (bundle.js + ControlManifest.xml) into a control zip
 *  3. Packages control zip + solution.xml + customizations.xml into DataGridPCFSolution.zip
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = __dirname;
const outDir = path.join(root, 'out', 'controls');
const solutionPackageDir = path.join(root, 'SolutionPackage');
const zipFile = path.join(root, 'DataGridPCFSolution.zip');

const NAMESPACE = 'SampleNamespace';
const CONSTRUCTOR = 'DataGridControl';
const VERSION = '0.0.0.2';

// Derive control zip name from namespace.constructor_version
const controlZipName = `${NAMESPACE}.${CONSTRUCTOR}_${VERSION.replace(/\./g, '_')}.zip`;
const controlFolder = `Controls/${NAMESPACE}.${CONSTRUCTOR}`;

// 1. Check build outputs exist
['bundle.js', 'ControlManifest.xml'].forEach(file => {
  if (!fs.existsSync(path.join(outDir, file))) {
    console.error(`ERROR: out/controls/${file} not found. Run "npm run build" first.`);
    process.exit(1);
  }
});

console.log('Creating DataGridPCFSolution.zip...');

// 2. Use PowerShell + .NET ZipArchive to build the zip (no pac needed)
const bundleJs = path.join(outDir, 'bundle.js').replace(/\\/g, '\\\\');
const controlManifest = path.join(outDir, 'ControlManifest.xml').replace(/\\/g, '\\\\');
const solutionXml = path.join(solutionPackageDir, 'solution.xml').replace(/\\/g, '\\\\');
const customizationsXml = path.join(solutionPackageDir, 'customizations.xml').replace(/\\/g, '\\\\');
const zipOut = zipFile.replace(/\\/g, '\\\\');

const contentTypes = `<?xml version="1.0" encoding="utf-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/octet-stream" /><Default Extension="js" ContentType="application/octet-stream" /><Default Extension="zip" ContentType="application/octet-stream" /></Types>`;

const ps = `
Add-Type -Assembly 'System.IO.Compression'
Add-Type -Assembly 'System.IO.Compression.FileSystem'

$zipOut = '${zipOut}'
if (Test-Path $zipOut) { Remove-Item $zipOut }

# Build inner control zip in memory
$ctrlStream = New-Object System.IO.MemoryStream
$ctrlZip = [System.IO.Compression.ZipArchive]::new($ctrlStream, [System.IO.Compression.ZipArchiveMode]::Create, $true)
[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($ctrlZip, '${bundleJs}', 'bundle.js') | Out-Null
[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($ctrlZip, '${controlManifest}', 'ControlManifest.xml') | Out-Null
$ctrlZip.Dispose()

# Build outer solution zip
$outerZip = [System.IO.Compression.ZipFile]::Open($zipOut, [System.IO.Compression.ZipArchiveMode]::Create)

# Add control zip as Controls/{ns}.{ctor}/bundle entry (flat in Controls/ folder)
[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($outerZip, '${bundleJs}', '${controlFolder}/bundle.js') | Out-Null
[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($outerZip, '${controlManifest}', '${controlFolder}/ControlManifest.xml') | Out-Null

# Add solution XMLs
[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($outerZip, '${solutionXml}', 'solution.xml') | Out-Null
[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($outerZip, '${customizationsXml}', 'customizations.xml') | Out-Null

# Add [Content_Types].xml
$ctEntry = $outerZip.CreateEntry('[Content_Types].xml')
$ctWriter = New-Object System.IO.StreamWriter($ctEntry.Open())
$ctWriter.Write('${contentTypes}')
$ctWriter.Dispose()

$outerZip.Dispose()
Write-Host "Done: $zipOut"
`.trimStart();

const tmpScript = path.join(root, '_mkzip.ps1');
fs.writeFileSync(tmpScript, ps, 'utf8');
try {
  execSync(`powershell -ExecutionPolicy Bypass -File "${tmpScript}"`, { stdio: 'inherit' });
} finally {
  fs.unlinkSync(tmpScript);
}

console.log(`\nImport DataGridPCFSolution.zip at https://make.powerapps.com → Solutions → Import solution`);
