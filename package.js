/**
 * package.js - Builds the deployable solution .zip for Power Apps import.
 *
 * Usage: node package.js  (or: npm run package)
 *
 * No external dependencies required — uses only Node.js built-ins.
 *
 * Steps:
 *  1. Reads ControlManifest.xml and bundle.js from out/controls/
 *  2. Builds solution.xml and customizations.xml with the manifest fully embedded
 *  3. Zips everything into DataGridPCFSolution.zip
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

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
const bundleJs   = fs.readFileSync(path.join(outDir, 'bundle.js'));

// 2. Build solution.xml
const solutionXml = `<?xml version="1.0" encoding="utf-8"?>
<ImportExportXml version="9.1.0.643" SolutionPackageVersion="9.1" languagecode="1033" generatedBy="CrmLive" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <SolutionManifest>
    <UniqueName>DataGridPCFSolution</UniqueName>
    <LocalizedNames>
      <LocalizedName description="DataGrid PCF Solution" languagecode="1033" />
    </LocalizedNames>
    <Descriptions>
      <Description description="DataGrid PCF Control for PowerApps Canvas" languagecode="1033" />
    </Descriptions>
    <Version>${SOLUTION_VERSION}</Version>
    <Managed>0</Managed>
    <Publisher>
      <UniqueName>DataGridPCFPub</UniqueName>
      <LocalizedNames>
        <LocalizedName description="DataGrid PCF Publisher" languagecode="1033" />
      </LocalizedNames>
      <Descriptions>
        <Description description="DataGrid PCF Publisher" languagecode="1033" />
      </Descriptions>
      <EMailAddress xsi:nil="true"></EMailAddress>
      <SupportingWebsiteUrl xsi:nil="true"></SupportingWebsiteUrl>
      <CustomizationPrefix>dgp</CustomizationPrefix>
      <CustomizationOptionValuePrefix>12193</CustomizationOptionValuePrefix>
      <Addresses>
        <Address>
          <AddressNumber>1</AddressNumber>
          <AddressTypeCode>1</AddressTypeCode>
          <City xsi:nil="true"></City>
          <County xsi:nil="true"></County>
          <Country xsi:nil="true"></Country>
          <Fax xsi:nil="true"></Fax>
          <FreightTermsCode xsi:nil="true"></FreightTermsCode>
          <ImportSequenceNumber xsi:nil="true"></ImportSequenceNumber>
          <Latitude xsi:nil="true"></Latitude>
          <Line1 xsi:nil="true"></Line1>
          <Line2 xsi:nil="true"></Line2>
          <Line3 xsi:nil="true"></Line3>
          <Longitude xsi:nil="true"></Longitude>
          <Name xsi:nil="true"></Name>
          <PostalCode xsi:nil="true"></PostalCode>
          <PostOfficeBox xsi:nil="true"></PostOfficeBox>
          <PrimaryContactName xsi:nil="true"></PrimaryContactName>
          <ShippingMethodCode>1</ShippingMethodCode>
          <StateOrProvince xsi:nil="true"></StateOrProvince>
          <Telephone1 xsi:nil="true"></Telephone1>
          <Telephone2 xsi:nil="true"></Telephone2>
          <Telephone3 xsi:nil="true"></Telephone3>
          <TimeZoneRuleVersionNumber xsi:nil="true"></TimeZoneRuleVersionNumber>
          <UPSZone xsi:nil="true"></UPSZone>
          <UTCOffset xsi:nil="true"></UTCOffset>
          <UTCConversionTimeZoneCode xsi:nil="true"></UTCConversionTimeZoneCode>
        </Address>
      </Addresses>
    </Publisher>
    <RootComponents>
      <RootComponent type="66" schemaName="${CONTROL_NAME}" behavior="0" />
    </RootComponents>
    <MissingDependencies />
  </SolutionManifest>
</ImportExportXml>`;

// 3. Build customizations.xml with fully embedded manifest and bundle (base64)
const bundleBase64 = bundleJs.toString('base64');
// Strip the outer <?xml?> declaration from manifest so it embeds cleanly
const manifestInner = manifestXml.replace(/<\?xml[^?]*\?>\s*/, '');

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
      <Manifest>
        ${manifestInner.trim()}
      </Manifest>
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

// 4. Write the zip using a minimal ZIP writer (stored, no compression for XML; deflate for JS)
function writeZip(entries) {
  // entries: [{name, data: Buffer}]
  const parts = [];
  const centralDir = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = Buffer.from(entry.name, 'utf8');
    const data = entry.data;
    const compressed = zlib.deflateRawSync(data, { level: 6 });
    const useCompressed = compressed.length < data.length;
    const fileData = useCompressed ? compressed : data;
    const method = useCompressed ? 8 : 0;

    const crc = crc32(data);
    const now = new Date();
    const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
    const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

    const localHeader = Buffer.alloc(30 + nameBytes.length);
    localHeader.writeUInt32LE(0x04034b50, 0);  // signature
    localHeader.writeUInt16LE(20, 4);           // version needed
    localHeader.writeUInt16LE(0, 6);            // flags
    localHeader.writeUInt16LE(method, 8);       // compression
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(fileData.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(nameBytes.length, 26);
    localHeader.writeUInt16LE(0, 28);
    nameBytes.copy(localHeader, 30);

    parts.push(localHeader, fileData);

    const cdEntry = Buffer.alloc(46 + nameBytes.length);
    cdEntry.writeUInt32LE(0x02014b50, 0);   // CD signature
    cdEntry.writeUInt16LE(20, 4);           // version made by
    cdEntry.writeUInt16LE(20, 6);           // version needed
    cdEntry.writeUInt16LE(0, 8);            // flags
    cdEntry.writeUInt16LE(method, 10);      // compression
    cdEntry.writeUInt16LE(dosTime, 12);
    cdEntry.writeUInt16LE(dosDate, 14);
    cdEntry.writeUInt32LE(crc, 16);
    cdEntry.writeUInt32LE(fileData.length, 20);
    cdEntry.writeUInt32LE(data.length, 24);
    cdEntry.writeUInt16LE(nameBytes.length, 28);
    cdEntry.writeUInt16LE(0, 30);           // extra len
    cdEntry.writeUInt16LE(0, 32);           // comment len
    cdEntry.writeUInt16LE(0, 34);           // disk start
    cdEntry.writeUInt16LE(0, 36);           // internal attr
    cdEntry.writeUInt32LE(0, 38);           // external attr
    cdEntry.writeUInt32LE(offset, 42);      // local header offset
    nameBytes.copy(cdEntry, 46);
    centralDir.push(cdEntry);

    offset += localHeader.length + fileData.length;
  }

  const cdBuf = Buffer.concat(centralDir);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(cdBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...parts, cdBuf, eocd]);
}

function crc32(buf) {
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      t[i] = c;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

// 5. Assemble and write zip
const contentTypes = `<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="xml" ContentType="application/octet-stream"/>
  <Default Extension="js" ContentType="application/octet-stream"/>
</Types>`;

const zipBuffer = writeZip([
  { name: '[Content_Types].xml', data: Buffer.from(contentTypes, 'utf8') },
  { name: 'solution.xml',        data: Buffer.from(solutionXml, 'utf8') },
  { name: 'customizations.xml',  data: Buffer.from(customizationsXml, 'utf8') },
]);

fs.writeFileSync(zipFile, zipBuffer);
console.log(`Done! DataGridPCFSolution.zip written (${(zipBuffer.length / 1024).toFixed(1)} KB)`);
console.log(`Import at https://make.powerapps.com → Solutions → Import solution`);

console.log(`\nDone! Import DataGridPCFSolution.zip at https://make.powerapps.com → Solutions → Import solution`);

console.log(`\nImport DataGridPCFSolution.zip at https://make.powerapps.com → Solutions → Import solution`);
