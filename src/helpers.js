const data = require('./data');

const axios = require('axios');
const sleep = require('sleep-promise');
const utils = require('web3').utils;
const { merge } = require('lodash');

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
    console.error(`RelayHub found at ${data.relayHub.address}`)
    return data.relayHub.address;
  }

  console.error(`Deploying singleton RelayHub instance`);
  await web3.eth.sendTransaction({ from, to: data.relayHub.deploy.deployer, value: ether(data.relayHub.deploy.fundsEther) });

  await web3.eth.sendSignedTransaction(data.relayHub.deploy.tx);

  console.error(`RelayHub deployed at ${data.relayHub.address}`);

  return data.relayHub.address;
}

async function fundRecipient(web3, recipient, amount, from, relayHubAddress) {
  recipient = getRecipientAddress(recipient)
  
  // Ensure relayHub is deployed on the local network
  if (relayHubAddress.toLowerCase() === data.relayHub.address.toLowerCase()) {
    await deployRelayHub(web3, from);
  }
  const relayHub = getRelayHub(web3);
  
  const targetAmount = new web3.utils.BN(amount);
  const currentBalance = new web3.utils.BN(await relayHub.methods.balanceOf(recipient).call());
  if (currentBalance.lt(targetAmount)) {
    const value = targetAmount.sub(currentBalance);
    await relayHub.methods.depositFor(recipient).send({ value, from });
    console.error(`Deposited ${value.toString()} wei for ${recipient}`);
  } else {
    console.error(`Recipient ${recipient} has ${currentBalance.toString()} wei`);
  }
}

async function defaultFromAccount(web3, from = null) {
  if (from) return from;
  const requiredBalance = ether('10');

  const accounts = await web3.eth.getAccounts();
  for (const account of accounts) {
    const balance = new web3.utils.BN(await web3.eth.getBalance(account));
    if (balance.gte(requiredBalance)) {
      return account;
    }
  }

  throw Error(`Found no accounts with sufficient balance (${requiredBalance} wei)`);
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

function getRecipientAddress(recipient) {
  if (!recipient) throw new Error('Recipient address not set');
  if (typeof(recipient) !== 'string') {
    if (recipient.address) return recipient.address;
    else if (recipient.options && recipient.options.address) return recipient.options.address;
  }
  return recipient;
}

function getRelayHub(web3, options = {}) {
  return new web3.eth.Contract(data.relayHub.abi, data.relayHub.address, { data: data.relayHub.bytecode, ... options });
}

async function isRelayHubDeployed(web3) {
  const code = await web3.eth.getCode(data.relayHub.address);
  return code.length > 2;
}

async function getRecipientFunds(web3, recipient) {
  recipient = getRecipientAddress(recipient);
  const relayHub = await getRelayHub(web3);
  return await relayHub.methods.balanceOf(recipient).call();
}

module.exports = {
  registerRelay: async function (web3, options = {}) {
    const defaultOptions = {
      relayUrl: 'http://localhost:8090',
      relayHubAddress: data.relayHub.address,
      stake: ether('1'),
      unstakeDelay: 604800, // 1 week
      funds: ether('5'),
      from: await defaultFromAccount(web3, options && options.from),
    };

    options = merge(defaultOptions, options);

    await registerRelay(web3, options.relayUrl, options.relayHubAddress, options.stake, options.unstakeDelay, options.funds, options.from);
  },

  deployRelayHub: async function (web3, options = {}) {
    const defaultOptions = {
      from: await defaultFromAccount(web3, options && options.from),
    };

    options = merge(defaultOptions, options);

    return await deployRelayHub(web3, options.from);
  },

  fundRecipient: async function (web3, options = {}) {
    const defaultOptions = {
      amount: ether('1'),
      from: await defaultFromAccount(web3, options && options.from),
      relayHubAddress: data.relayHub.address
    };

    options = merge(defaultOptions, options);

    await fundRecipient(web3, options.recipient, options.amount, options.from, options.relayHubAddress);
  },

  getRelayHub,

  isRelayHubDeployed,

  getRecipientFunds
};
