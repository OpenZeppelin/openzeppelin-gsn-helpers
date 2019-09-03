const program = require('commander');
const lodash = require('lodash');

program
  .option('-n, --ethereumNodeURL <url>', 'url to the local Ethereum node', 'http://localhost:8545')
  .option('--recipient <address>', 'address of the recipient contract')
  .option('--amount <amount>', 'amount of funds to deposit for the recipient contract, in wei (defaults to 1 Ether)')
  .option('-f, --from <account>', 'account to send transactions from (defaults to first account with balance)')
  .parse(process.argv);

const nodeURL = program.ethereumNodeURL !== undefined ? program.ethereumNodeURL : 'http://localhost:8545';

const Web3 = require('web3');
const web3 = new Web3(nodeURL);

const { fundRecipient } = require('./src/fund');
fundRecipient(web3, lodash.pick(program, ['from', 'recipient', 'amount'])).then(balance =>
  console.error(`Recipient ${program.recipient} balance is now ${balance.toString()} wei`),
);
