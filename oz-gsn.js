#!/usr/bin/env node

const program = require('commander');

program
  .version(require('./package.json').version)
  .command('run-relayer', 'downloads and runs a relayer binary, and registers it, deploying a hub if needed')
  .command('deploy-relay-hub', 'deploy the singleton relay hub instance')
  .command('register-relayer', 'stake for a relayer and fund it')
  .command('fund-recipient', 'fund a recipient contract so that it can receive relayed calls')
  .on('command:*', function () {
    console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
    process.exit(1);
  })
  .parse(process.argv);
