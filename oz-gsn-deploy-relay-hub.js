const program = require('commander');
const lodash = require('lodash');

program
  .option('--ethereumNodeURL <url>')
  .option('--from <account>')
  .parse(process.argv);

const nodeURL = program.ethereumNodeURL !== undefined ? program.ethereumNodeURL : 'http://localhost:8545';

const Web3 = require('web3');
const web3 = new Web3(nodeURL);

const { deployRelayHub } = require('./src/helpers');

const opts = lodash.pick(program, ['from']);
opts.verbose = true;
deployRelayHub(web3, opts)
  .then(address => console.log(address));
