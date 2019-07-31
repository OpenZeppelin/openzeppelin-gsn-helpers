#!/usr/bin/env node

const program = require('commander');

program
  .version(require('./package.json').version)
  .command('deploy-relay-hub', 'deploy the singleton RelayHub instance')
  .command('register-relayer', 'stake for a relayer and fund it')
  .parse(process.argv);
