// Puts the Voxelia icon and version info into the Windows .exe (pure JS, no Wine needed).
// usage: node tools/set-exe-icon.js <exe> <icon.ico> <version>
const fs = require('fs');
const ResEdit = require('resedit');
const PELibrary = require('pe-library');
const [exe, ico, ver] = process.argv.slice(2);
const pe = PELibrary.NtExecutable.from(fs.readFileSync(exe));
const res = PELibrary.NtExecutableResource.from(pe);
const iconFile = ResEdit.Data.IconFile.from(fs.readFileSync(ico));
const groups = ResEdit.Resource.IconGroupEntry.fromEntries(res.entries);
const gid = groups.length ? groups[0].id : 1, lang = groups.length ? groups[0].lang : 1033;
ResEdit.Resource.IconGroupEntry.replaceIconsForResource(res.entries, gid, lang, iconFile.icons.map(i => i.data));
let vi = ResEdit.Resource.VersionInfo.fromEntries(res.entries)[0];
if (!vi) vi = ResEdit.Resource.VersionInfo.createEmpty();
const [a, b, c] = ver.split('.').map(Number);
vi.setFileVersion(a, b, c, 0, 1033); vi.setProductVersion(a, b, c, 0, 1033);
vi.setStringValues({ lang: 1033, codepage: 1200 }, {
  FileDescription: 'Voxelia – The Lost Kingdom', ProductName: 'Voxelia',
  CompanyName: 'Voxelia', OriginalFilename: 'Voxelia.exe', InternalName: 'voxelia',
  FileVersion: ver, ProductVersion: ver, LegalCopyright: 'Voxelia'
});
vi.outputToResourceEntries(res.entries);
res.outputResource(pe);
fs.writeFileSync(exe, Buffer.from(pe.generate()));
console.log('icon + version set on', exe);
