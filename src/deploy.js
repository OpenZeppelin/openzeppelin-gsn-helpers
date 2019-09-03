const data = require('./data');
const { defaultFromAccount, ether } = require('./helpers');
const { merge } = require('lodash');

async function deployRelayHub(web3, options = {}) {
  const defaultOptions = {
    from: await defaultFromAccount(web3, options && options.from),
  };

  options = merge(defaultOptions, options);

  if ((await web3.eth.getCode(data.relayHub.address)).length > '0x0'.length) {
    if (options.verbose) console.error(`RelayHub found at ${data.relayHub.address}`);
    return data.relayHub.address;
  }

  if (options.verbose) console.error(`Deploying singleton RelayHub instance`);
  await web3.eth.sendTransaction({
    from: options.from,
    to: data.relayHub.deploy.deployer,
    value: ether(data.relayHub.deploy.fundsEther),
  });

  await web3.eth.sendSignedTransaction(data.relayHub.deploy.tx);

  if (options.verbose) console.error(`RelayHub deployed at ${data.relayHub.address}`);

  return data.relayHub.address;
}

module.exports = {
  deployRelayHub,
};
