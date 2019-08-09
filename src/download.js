const process = require('process');
const homedir = require('os').homedir();
const { createWriteStream, chmodSync } = require('fs');
const { pathExists, ensureDir } = require('fs-extra');
const { dirname } = require('path');
const axios = require('axios');

const REPOSITORY = 'OpenZeppelin/openzeppelin-gsn-helpers';
const VERSION = 'v0.1.4';
const BINARY = 'gsn-relay';
const PATH = `${homedir}/.gsn/${BINARY}-${VERSION}`;

async function ensureRelayer(path=PATH) {
  if (await hasRelayer(path)) return path;
  await downloadRelayer(path);
  return path;
}

async function hasRelayer(path=PATH) {
  return await pathExists(path);
}

async function downloadRelayer(path=PATH) {
  await ensureDir(dirname(path));
  const url = getUrl();
  const writer = createWriteStream(path);
  console.error(`Downloading relayer from ${url}`);
  const response = await axios.get(url, { responseType: 'stream' });
  response.data.pipe(writer);
  
  await new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });

  console.error(`Relayer downloaded to ${path}`);
  chmodSync(path, '775');
}

function getUrl() {
  return `https://github.com/${REPOSITORY}/releases/download/${VERSION}/${BINARY}-${getPlatform()}-${getArch()}`
}

function getPlatform() {
  switch(process.platform) {
    case 'win32': return 'windows';
    default: return process.platform;
  }
}

function getArch() {
  switch(process.arch) {
    case 'x64': return 'amd64';
    case 'x32': return '386';
    case 'ia32': return '386';
    default: return process.arch;
  }
}

function getPath() {
  return PATH;
}

module.exports = {
  ensureRelayer, downloadRelayer, hasRelayer, getUrl, getPath
}