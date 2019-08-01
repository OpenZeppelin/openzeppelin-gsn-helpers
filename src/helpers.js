const data = require('./data');

const axios = require('axios');
const sleep = require('sleep-promise');
const utils = require('web3').utils;

const ether = function(value) {
  return new utils.BN(utils.toWei(value, 'ether'));
}

async function registerRelay(web3, relayUrl, relayHubAddress, stake, unstakeDelay, funds, from) {
  try {
    if (await isRelayReady(relayUrl)) {
      return;
    }
  } catch (error) {
    throw Error(`Could not reach the relay at ${relayUrl}, is it running?`);
  }

  try {
    console.error(`Funding GSN relay at ${relayUrl}`);

    const response = await axios.get(`${relayUrl}/getaddr`);
    const relayAddress = response.data.RelayServerAddress;

    const relayHub = new web3.eth.Contract(data.relayHub.abi, relayHubAddress);

    await relayHub.methods.stake(relayAddress, unstakeDelay.toString()).send({ value: stake, from });

    await web3.eth.sendTransaction({ from, to: relayAddress, value: funds });

    await waitForRelay(relayUrl);

    console.error(`Relay is funded and ready!`);

  } catch (error) {
    throw Error(`Failed to fund relay: '${error}'`);
  }
}

async function deployRelayHub(web3, from) {
  if ((await web3.eth.getCode(data.relayHub.address)).length > '0x0'.length) {
    return data.relayHub.address;
  }

  console.error(`Deploying singleton RelayHub instance`);
  await web3.eth.sendTransaction({ from, to: data.relayHub.deploy.deployer, value: ether(data.relayHub.deploy.fundsEther) });

  await web3.eth.sendSignedTransaction(data.relayHub.deploy.tx);

  console.error(`RelayHub deployed!`);
  console.log(data.relayHub.address);

  return data.relayHub.address;
}

async function fundRecipient(web3, recipient, amount, from) {
  if (!recipient) throw new Error('Recipient to be funded not set');
  const relayHub = new web3.eth.Contract(data.relayHub.abi, data.relayHub.address);

  const currentBalance = new web3.utils.BN(await relayHub.methods.balanceOf(recipient).call());
  if (currentBalance.lte(amount)) {
    await relayHub.methods.depositFor(recipient).send({ value: amount.sub(currentBalance), from });
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
  console.error(`Will wait up to ${timeout}s for the relay to be ready`);

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
      relayHubAddress: data.relayHub.address,
      stake: ether('1'),
      unstakeDelay: 604800, // 1 week
      funds: ether('5'),
      from: await defaultFromAccount(web3), // We could skip this if from is supplied
    };

    options = { ...defaultOptions, ... options};

    await registerRelay(web3, options.relayUrl, options.relayHubAddress, options.stake, options.unstakeDelay, options.funds, options.from);
  },

  deployRelayHub: async function (web3, options = {}) {
    const defaultOptions = {
      from: await defaultFromAccount(web3), // We could skip this if from is supplied
    };

    options = { ...defaultOptions, ... options};

    await deployRelayHub(web3, options.from);
  },

  fundRecipient: async function (web3, options = {}) {
    const defaultOptions = {
      amount: ether('1'),
      from: await defaultFromAccount(web3), // We could skip this if from is supplied
    };

    options = { ...defaultOptions, ... options};

    await fundRecipient(web3, options.recipient, options.amount, options.from);
  },
};
