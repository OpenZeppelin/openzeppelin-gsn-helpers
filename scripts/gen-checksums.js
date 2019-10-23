const utils = require('web3-utils');
const fs = require('fs');
const path = require('path');
const process = require('process');
const _ = require('lodash');

const targetPath = process.argv[2];
if (!targetPath) {
  console.error('Usage: gen-checksums.js DIR');
  process.exit(1);
}

const PLATFORMS = [['darwin', 'amd64'], ['linux', 'amd64'], ['linux', '386'], ['windows', 'amd64'], ['windows', '386']];

const checksums = PLATFORMS.reduce((checksums, [platform, arch]) => {
  let fname = path.join(targetPath, `gsn-relay-${platform}-${arch}`);
  if (platform === 'windows') fname += '.exe';

  const checksum = utils.sha3(fs.readFileSync(fname));
  return _.merge(checksums, {
    [platform]: {
      [arch]: checksum,
    },
  });
}, {});

console.log(JSON.stringify(checksums, null, 2));
