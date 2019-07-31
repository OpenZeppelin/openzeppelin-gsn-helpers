const program = require('commander');
const lodash = require('lodash');

program
  .option('--ethereumNodeURL <url>')
  .option('--relayUrl <url>')
  .option('--relayHubAddress <address>')
  .option('--stake <stake>')
  .option('--unstakeDelay <delay>')
  .option('--funds <funds>')
  .option('--from <account>')
  .parse(process.argv);

const nodeURL = program.ethereumNodeURL !== undefined ? program.ethereumNodeURL : 'http://localhost:8545';

const Web3 = require('web3');
const web3 = new Web3(nodeURL);

require('openzeppelin-test-helpers/configure')({ web3 });

const { registerRelay } = require('./src/helpers');
registerRelay(web3, lodash.pick(program, ['relayUrl', 'relayHubAddress', 'stake', 'unstakeDelay', 'funds', 'from']));
