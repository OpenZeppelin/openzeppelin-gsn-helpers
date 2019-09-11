const data = require('./data');
const { getRecipientAddress, getRelayHub } = require('./helpers');
const { merge } = require('lodash');

async function balance(web3, options = {}) {
  const defaultOptions = {
    relayHubAddress: data.relayHub.address,
  };

  options = merge(defaultOptions, options);

  options.recipient = getRecipientAddress(options.recipient);

  const relayHub = getRelayHub(web3, options.relayHubAddress);

  return relayHub.methods.balanceOf(options.recipient).call();
}

module.exports = {
  balance,
};
