#!/usr/bin/env node

const program = require('commander');

program
  .version(require('./package.json').version)
  .command('run-relayer', 'downloads and runs a relayer binary, and registers it, deploying a hub if needed')
  .command('deploy-relay-hub', 'deploy the singleton RelayHub instance')
  .command('register-relayer', 'stake for a relayer and fund it')
  .command('fund-recipient', 'fund a recipient contract so that it can receive relayed calls')
  .command('balance', 'query a recipient or relayer owner GSN balance')
  .command('withdraw', "withdraw a relayer's owner revenue")
  .parse(process.argv);
