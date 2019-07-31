#!/usr/bin/env node

const program = require('commander');

program
  .version(require('./package.json').version)
  .command('register-relayer [name]', 'stake for a relayer and fund it')
  .parse(process.argv);
