const { ether, send, singletons, time } = require('openzeppelin-test-helpers');

const data = require('./data');

const axios = require('axios');
const sleep = require('sleep-promise');

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

    const relayHub = relayHubContract(relayHubAddress);

    await relayHub.methods.stake(relayAddress, unstakeDelay.toString()).send({ value: stake, from });

    await send.ether(from, relayAddress, funds);

    await waitForRelay(relayUrl);

    console.log(`Relay is funded and ready!`);

  } catch (error) {
    throw Error(`Failed to fund relay: '${error}'`);
  }
}

async function deployRelayHub(web3, from) {
  if ((await web3.eth.getCode(data.relayHub.address)).length > '0x0'.length) {
    return relayHubContract();
  }

  console.log(`Deploying singleton RelayHub instance`);
  await send.ether(from, data.relayHub.deploy.deployer , ether(data.relayHub.deploy.fundsEther));

  await web3.eth.sendSignedTransaction(data.relayHub.deploy.tx);

  console.log(`RelayHub deployed!`);

  return relayHubContract();
}

async function fundRecipient(web3, recipient, amount, from) {
  const relayHub = relayHubContract();

  const currentBalance = new web3.utils.BN(await relayHub.methods.balanceOf(recipient).call());
  if (currentBalance.lte(amount)) {
    await relayHub.methods.depositFor(recipient).send({ value: amount.sub(currentBalance), from });
  }
}

function relayHubContract(address = data.relayHub.address) {
  return new web3.eth.Contract(data.relayHub.abi, address);
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
      relayHubAddress: data.relayHub.address,
      stake: ether('1'),
      unstakeDelay: time.duration.weeks(1),
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
