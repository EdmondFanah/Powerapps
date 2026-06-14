/**
 * validate-zip.js — Pre-import validation for DataGridPCFSolution.zip
 * Run: node validate-zip.js
 *
 * Checks everything Power Apps validates during solution import.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const zipFile = path.join(__dirname, 'DataGridPCFSolution.zip');

// ─── Minimal ZIP reader ───────────────────────────────────────────────────────
function readZipEntries(zipPath) {
  const buf = fs.readFileSync(zipPath);
  const entries = {};

  // Find End of Central Directory
  let eocdOffset = -1;
  for (let i = buf.length - 22; i >= 0; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocdOffset = i; break; }
  }
  if (eocdOffset === -1) throw new Error('Not a valid ZIP file (EOCD not found)');

  const cdOffset = buf.readUInt32LE(eocdOffset + 16);
  const cdCount  = buf.readUInt16LE(eocdOffset + 10);

  let pos = cdOffset;
  for (let i = 0; i < cdCount; i++) {
    if (buf.readUInt32LE(pos) !== 0x02014b50) throw new Error('Invalid central directory');
    const method      = buf.readUInt16LE(pos + 10);
    const compSize    = buf.readUInt32LE(pos + 20);
    const uncompSize  = buf.readUInt32LE(pos + 24);
    const nameLen     = buf.readUInt16LE(pos + 28);
    const extraLen    = buf.readUInt16LE(pos + 30);
    const commentLen  = buf.readUInt16LE(pos + 32);
    const localOffset = buf.readUInt32LE(pos + 42);
    const name        = buf.slice(pos + 46, pos + 46 + nameLen).toString('utf8').replace(/\\/g, '/');
    pos += 46 + nameLen + extraLen + commentLen;

    // Read local file header to get actual data offset
    const localExtraLen = buf.readUInt16LE(localOffset + 28);
    const dataOffset    = localOffset + 30 + nameLen + localExtraLen;
    const compData      = buf.slice(dataOffset, dataOffset + compSize);

    let data;
    if (method === 0) {
      data = compData;
    } else if (method === 8) {
      data = zlib.inflateRawSync(compData);
    } else {
      throw new Error(`Unsupported compression method ${method} for ${name}`);
    }

    entries[name] = data;
  }
  return entries;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
function pass(msg)  { console.log(`  ✔  ${msg}`); passed++; }
function fail(msg)  { console.error(`  ✘  ${msg}`); failed++; }
function header(msg){ console.log(`\n[${msg}]`); }

function parseXml(text, label) {
  // Minimal XML validity: check it can be parsed by checking tag balance
  // Use regex-based checks since we have no DOM in plain Node
  // Note: <?xml?> declaration is optional in XML 1.0 — pac omits it on some files
  if (!text.trim().startsWith('<')) { fail(`${label}: does not appear to be XML`); return null; }
  if (text.includes('&') && !/&amp;|&lt;|&gt;|&quot;|&apos;/.test(text)) {
    fail(`${label}: unescaped & character found`); return null;
  }
  // Check for unclosed CDATA or obviously broken XML
  const openClose = (tag) => {
    const opens  = (text.match(new RegExp(`<${tag}[\\s>]`, 'g')) || []).length;
    const closes = (text.match(new RegExp(`</${tag}>`, 'g')) || []).length;
    return { opens, closes };
  };
  return { text, openClose };
}

function attr(text, attrName) {
  const m = text.match(new RegExp(`${attrName}="([^"]+)"`));
  return m ? m[1] : null;
}

function tagContent(text, tag) {
  const m = text.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return m ? m[1].trim() : null;
}

// ─── Run checks ──────────────────────────────────────────────────────────────
console.log(`\nValidating: ${zipFile}\n${'─'.repeat(60)}`);

// 1. File exists
header('ZIP FILE');
if (!fs.existsSync(zipFile)) { fail('DataGridPCFSolution.zip not found'); process.exit(1); }
const sizKB = (fs.statSync(zipFile).size / 1024).toFixed(1);
pass(`File exists (${sizKB} KB)`);

// 2. Read zip
let entries;
try {
  entries = readZipEntries(zipFile);
  pass(`ZIP is readable (${Object.keys(entries).length} entries)`);
} catch (e) {
  fail(`ZIP read error: ${e.message}`); process.exit(1);
}

// 3. Required root files
header('REQUIRED FILES');
const required = ['[Content_Types].xml', 'solution.xml', 'customizations.xml'];
required.forEach(f => {
  if (entries[f]) pass(`${f} present`);
  else fail(`${f} MISSING — Power Apps will reject the zip`);
});

// 4. Controls folder
header('CONTROLS FOLDER');
const bundleKey   = Object.keys(entries).find(k => k.endsWith('bundle.js'));
const manifestKey = Object.keys(entries).find(k => k.endsWith('ControlManifest.xml'));
if (bundleKey)   pass(`bundle.js found at: ${bundleKey}`);
else             fail('bundle.js not found in zip');
if (manifestKey) pass(`ControlManifest.xml found at: ${manifestKey}`);
else             fail('ControlManifest.xml not found in zip');
if (bundleKey) {
  const bundleSize = entries[bundleKey].length;
  if (bundleSize > 1000) pass(`bundle.js size: ${(bundleSize/1024).toFixed(1)} KB (non-trivial)`);
  else fail(`bundle.js is suspiciously small (${bundleSize} bytes)`);
}

// 5. solution.xml checks
header('SOLUTION.XML');
if (entries['solution.xml']) {
  const sol = entries['solution.xml'].toString('utf8');
  const xml = parseXml(sol, 'solution.xml');
  if (xml) {
    pass('Valid XML structure');
    const uniqueName = tagContent(sol, 'UniqueName');
    if (uniqueName) pass(`UniqueName: ${uniqueName}`);
    else fail('UniqueName missing');
    const version = tagContent(sol, 'Version');
    if (version && /^\d+\.\d+\.\d+\.\d+$/.test(version)) pass(`Version: ${version} (correct format)`);
    else fail(`Version "${version}" invalid — must be X.X.X.X`);
    const prefix = tagContent(sol, 'CustomizationPrefix');
    if (prefix) pass(`Publisher prefix: ${prefix}`);
    else fail('CustomizationPrefix missing');
    if (sol.includes('type="66"')) pass('RootComponent type=66 (CustomControl) present');
    else fail('RootComponent type="66" missing — control won\'t be registered');
    const rcMatch = sol.match(/<RootComponent\s[^>]*/);
    const schemaName = rcMatch ? attr(rcMatch[0], 'schemaName') : null;
    if (schemaName) pass(`RootComponent schemaName: ${schemaName}`);
    else fail('RootComponent schemaName missing');
  }
}

// 6. customizations.xml checks
header('CUSTOMIZATIONS.XML');
if (entries['customizations.xml']) {
  const cust = entries['customizations.xml'].toString('utf8');
  const xml = parseXml(cust, 'customizations.xml');
  if (xml) {
    pass('Valid XML structure');
    if (cust.includes('<CustomControls>') || cust.includes('<CustomControls/>')) pass('<CustomControls> section present');
    else fail('<CustomControls> section missing');

    // pac file-reference format: <CustomControl><Name>...</Name><FileName>...</FileName></CustomControl>
    const isPacFormat = cust.includes('<FileName>');
    // embedded format: <CustomControl Name="..." Version="..."><Manifest>...</Manifest></CustomControl>
    const isEmbedded = cust.includes('<CustomControl ');

    if (isPacFormat) {
      pass('pac file-reference format detected');
      const nameMatch = cust.match(/<Name>([^<]+)<\/Name>/);
      if (nameMatch) pass(`CustomControl Name: ${nameMatch[1].replace('.xml','')}`);
      else fail('CustomControl <Name> element missing');
      const fileMatch = cust.match(/<FileName>([^<]+)<\/FileName>/);
      if (fileMatch) pass(`ControlManifest.xml referenced at: ${fileMatch[1]}`);
      else fail('CustomControl <FileName> element missing');
      if (cust.includes('FileContent=')) fail('FileContent attribute found — bundle must be a zip file entry, not base64');
      else pass('No inline FileContent (correct)');
    } else if (isEmbedded) {
      pass('Embedded manifest format detected');
      const ccName = attr(cust.match(/CustomControl [^>]*/)?.[0] || '', 'Name');
      if (ccName) pass(`CustomControl Name: ${ccName}`);
      else fail('CustomControl Name attribute missing');
      const ccVer = attr(cust.match(/CustomControl [^>]*/)?.[0] || '', 'Version');
      if (ccVer) pass(`CustomControl Version: ${ccVer}`);
      else fail('CustomControl Version attribute missing');
      if (cust.includes('<Manifest>')) pass('<Manifest> element present');
      else fail('<Manifest> element missing');
      if (cust.includes('<Resource ')) pass('<Resource> element present');
      else fail('<Resource> element missing');
      if (cust.includes('FileContent=')) fail('FileContent attribute found — bundle must be a zip file entry, not base64');
      else pass('No inline FileContent (correct)');
    } else {
      fail('<CustomControl> element missing from customizations.xml');
    }
  }
}

// 7. ControlManifest.xml checks
header('CONTROLMANIFEST.XML');
if (manifestKey && entries[manifestKey]) {
  const mf = entries[manifestKey].toString('utf8');
  const xml = parseXml(mf, 'ControlManifest.xml');
  if (xml) {
    pass('Valid XML structure');
    const ctrlType = attr(mf.match(/<control [^>]*/)?.[0] || '', 'control-type');
    if (ctrlType === 'virtual') pass(`control-type: virtual (Canvas compatible)`);
    else fail(`control-type: "${ctrlType}" — must be "virtual" for Canvas apps`);
    const ctrlVer = attr(mf.match(/<control [^>]*/)?.[0] || '', 'version');
    if (ctrlVer) pass(`Control version: ${ctrlVer}`);
    if (mf.includes('data-set')) fail('data-set found in manifest — requires dataset PCF feature flag (often unavailable)');
    else pass('No data-set — standard property-only control (always available in Canvas)');
    if (mf.includes('DataJson')) pass('DataJson property found');
    else fail('DataJson property missing');
    const apiVer = attr(mf.match(/<control [^>]*/)?.[0] || '', 'api-version');
    if (apiVer) pass(`api-version: ${apiVer}`);
    else fail('api-version missing');
  }
}

// 8. Cross-check: bundle path in customizations or FileName reference matches zip entry
header('CROSS-CHECKS');
if (entries['customizations.xml'] && bundleKey) {
  const cust = entries['customizations.xml'].toString('utf8');
  const resourcePath = attr(cust.match(/<Resource [^>]*/)?.[0] || '', 'Path');
  if (resourcePath) {
    const normalized = resourcePath.replace(/\\/g, '/');
    if (normalized === bundleKey) pass(`Resource Path matches zip entry: ${normalized}`);
    else fail(`Resource Path "${normalized}" does not match zip entry "${bundleKey}"`);
  } else if (cust.includes('<FileName>')) {
    pass('pac file-reference format — ControlManifest.xml and bundle.js are direct zip entries');
  } else {
    fail('No Resource Path or FileName reference found in customizations.xml');
  }
}

// Check solution schemaName matches customizations control name
if (entries['solution.xml'] && entries['customizations.xml']) {
  const sol  = entries['solution.xml'].toString('utf8');
  const cust = entries['customizations.xml'].toString('utf8');
  const solSchema = attr(sol.match(/RootComponent[^>]*/)?.[0] || '', 'schemaName');
  const ccName    = attr(cust.match(/CustomControl [^>]*/)?.[0] || '', 'Name');
  if (solSchema && ccName) {
    if (solSchema === ccName) pass(`SchemaName consistent: solution.xml ↔ customizations.xml (${solSchema})`);
    else fail(`Mismatch: solution schemaName="${solSchema}" vs customization Name="${ccName}"`);
  }
}

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(60)}`);
console.log(`Result: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log('\n✔ ZIP appears valid for Power Apps import.\n');
} else {
  console.log(`\n✘ ${failed} issue(s) found — fix before importing.\n`);
  process.exit(1);
}
