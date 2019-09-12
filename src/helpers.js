const data = require('./data');

const axios = require('axios');
const sleep = require('sleep-promise');
const utils = require('web3').utils;
const { merge } = require('lodash');

const ether = function(value) {
  return new utils.BN(utils.toWei(value, 'ether'));
};

const fromWei = function(wei) {
  return utils.fromWei(wei, 'ether');
};

async function defaultFromAccount(web3, from = null) {
  if (from) return from;
  const requiredBalance = ether('10');

  try {
    const accounts = await web3.eth.getAccounts();
    for (const account of accounts) {
      const balance = new web3.utils.BN(await web3.eth.getBalance(account));
      if (balance.gte(requiredBalance)) {
        return account;
      }
    }
  } catch (error) {
    throw Error(`Failed to retrieve accounts and balances: ${error}`);
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
  if (typeof recipient !== 'string') {
    if (recipient.address) return recipient.address;
    else if (recipient.options && recipient.options.address) return recipient.options.address;
  }
  return recipient;
}

function getRelayHub(web3, address, options = {}) {
  return new web3.eth.Contract(data.relayHub.abi, address || data.relayHub.address, {
    data: data.relayHub.bytecode,
    ...options,
  });
}

async function isRelayHubDeployed(web3) {
  const code = await web3.eth.getCode(data.relayHub.address);
  return code.length > 2;
}

async function getRecipientFunds(web3, recipient, relayHubAddress) {
  recipient = getRecipientAddress(recipient);
  const relayHub = await getRelayHub(web3, relayHubAddress);
  return await relayHub.methods.balanceOf(recipient).call();
}

module.exports = {
  defaultFromAccount,
  ether,
  fromWei,
  getRecipientAddress,
  getRecipientFunds,
  getRelayHub,
  isRelayHubDeployed,
  isRelayReady,
  waitForRelay,
};
