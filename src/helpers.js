const { ether, send, time } = require('openzeppelin-test-helpers');

const axios = require('axios');
const sleep = require('sleep-promise');

const relayHubInterface = [{"constant":false,"inputs":[{"name":"transactionFee","type":"uint256"},{"name":"url","type":"string"}],"name":"registerRelay","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"relay","type":"address"},{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"encodedFunction","type":"bytes"},{"name":"transactionFee","type":"uint256"},{"name":"gasPrice","type":"uint256"},{"name":"gasLimit","type":"uint256"},{"name":"nonce","type":"uint256"},{"name":"signature","type":"bytes"},{"name":"approvalData","type":"bytes"}],"name":"canRelay","outputs":[{"name":"status","type":"uint256"},{"name":"recipientContext","type":"bytes"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"recipient","type":"address"},{"name":"encodedFunctionWithFrom","type":"bytes"},{"name":"transactionFee","type":"uint256"},{"name":"gasPrice","type":"uint256"},{"name":"gasLimit","type":"uint256"},{"name":"preChecksGas","type":"uint256"},{"name":"recipientContext","type":"bytes"}],"name":"recipientCallsAtomic","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"from","type":"address"}],"name":"getNonce","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"unsignedTx","type":"bytes"},{"name":"signature","type":"bytes"}],"name":"penalizeIllegalTransaction","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"recipient","type":"address"},{"name":"encodedFunction","type":"bytes"},{"name":"transactionFee","type":"uint256"},{"name":"gasPrice","type":"uint256"},{"name":"gasLimit","type":"uint256"},{"name":"nonce","type":"uint256"},{"name":"signature","type":"bytes"},{"name":"approvalData","type":"bytes"}],"name":"relayCall","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"version","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"relayedCallStipend","type":"uint256"}],"name":"requiredGas","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"target","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"relay","type":"address"}],"name":"canUnstake","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"relay","type":"address"}],"name":"getRelay","outputs":[{"name":"totalStake","type":"uint256"},{"name":"unstakeDelay","type":"uint256"},{"name":"unstakeTime","type":"uint256"},{"name":"owner","type":"address"},{"name":"state","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"relayedCallStipend","type":"uint256"},{"name":"gasPrice","type":"uint256"},{"name":"transactionFee","type":"uint256"}],"name":"maxPossibleCharge","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"unsignedTx1","type":"bytes"},{"name":"signature1","type":"bytes"},{"name":"unsignedTx2","type":"bytes"},{"name":"signature2","type":"bytes"}],"name":"penalizeRepeatedNonce","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"target","type":"address"}],"name":"depositFor","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"relay","type":"address"},{"name":"unstakeDelay","type":"uint256"}],"name":"stake","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"relay","type":"address"}],"name":"removeRelayByOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"relay","type":"address"}],"name":"unstake","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"relay","type":"address"},{"indexed":false,"name":"stake","type":"uint256"},{"indexed":false,"name":"unstakeDelay","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"relay","type":"address"},{"indexed":true,"name":"owner","type":"address"},{"indexed":false,"name":"transactionFee","type":"uint256"},{"indexed":false,"name":"stake","type":"uint256"},{"indexed":false,"name":"unstakeDelay","type":"uint256"},{"indexed":false,"name":"url","type":"string"}],"name":"RelayAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"relay","type":"address"},{"indexed":false,"name":"unstakeTime","type":"uint256"}],"name":"RelayRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"relay","type":"address"},{"indexed":false,"name":"stake","type":"uint256"}],"name":"Unstaked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"recipient","type":"address"},{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Deposited","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"dest","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"relay","type":"address"},{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"selector","type":"bytes4"},{"indexed":false,"name":"reason","type":"uint256"}],"name":"CanRelayFailed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"relay","type":"address"},{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"selector","type":"bytes4"},{"indexed":false,"name":"status","type":"uint8"},{"indexed":false,"name":"charge","type":"uint256"}],"name":"TransactionRelayed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"relay","type":"address"},{"indexed":false,"name":"sender","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Penalized","type":"event"}];

async function registerRelay(web3, relayUrl, relayHubAddress, stake, unstakeDelay, funds, from) {
  try {
    if (await isRelayReady(relayUrl)) {
      return;
    }
  } catch (error) {
    throw Error(`Could not reach the relay at ${relayUrl}, is it running?`);
  }

  try {
    console.log(`Funding GSN relay at ${relayUrl}`);

    const response = await axios.get(`${relayUrl}/getaddr`);
    const relayAddress = response.data.RelayServerAddress;

    const relayHub = new web3.eth.Contract(relayHubInterface, relayHubAddress);
    console.log(unstakeDelay)
    console.log(unstakeDelay.toString())
    await relayHub.methods.stake(relayAddress, unstakeDelay.toString()).send({ value: stake, from });

    await send.ether(from, relayAddress, funds);

    await waitForRelay(relayUrl);

    console.log(`Relay is funded and ready!`);

  } catch (error) {
    throw Error(`Failed to fund relay: '${error}'`);
  }
}

async function defaultFromAccount(web3) {
  const requiredBalance = ether('10');

  const accounts = await web3.eth.getAccounts();
  for (const account of accounts) {
    const balance = new web3.utils.BN(await web3.eth.getBalance(account));
    if (balance.gte(requiredBalance)) {
      return account;
    }
  }

  throw Error(`Found no accounts with sufficient balance (${requiredBalance} ETH)`);
}

async function waitForRelay(relayUrl) {
  const timeout = 30;
  console.log(`Will wait up to ${timeout}s for the relay to be ready`);

  for (let i = 0; i < timeout; ++i) {
    await sleep(1000);

    if (await isRelayReady(relayUrl)) {
      return;
    }
  }

  throw Error(`Relay not ready after ${timeout}s`);
}

async function isRelayReady(relayUrl) {
  const response = await axios.get(`${relayUrl}/getaddr`);
  return response.data.Ready;
}

module.exports = {
  registerRelay: async function (web3, options = {}) {
    const defaultOptions = {
      relayUrl: 'http://localhost:8090',
      relayHubAddress: '0x537F27a04470242ff6b2c3ad247A05248d0d27CE',
      stake: ether('1'),
      unstakeDelay: time.duration.weeks(1),
      funds: ether('5'),
      from: await defaultFromAccount(web3), // We could skip this if from is supplied
    };

    options = { ...defaultOptions, ... options};

    await registerRelay(web3, options.relayUrl, options.relayHubAddress, options.stake, options.unstakeDelay, options.funds, options.from);
  },
};
