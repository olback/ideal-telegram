/*
 *  Update the version before a commit
 */

const semver = require('semver');
const path = require('path');
const fs = require('fs');

const packagePath = path.join(__dirname, '..', 'package.json');
let jsonData = JSON.parse(fs.readFileSync(packagePath));
console.log(`Old version: ${jsonData.version}`);
jsonData.version = semver.inc(jsonData.version, 'patch');
console.log(`New version: ${jsonData.version}`);
fs.writeFileSync(packagePath, JSON.stringify(jsonData, null, 4) + '\n');
