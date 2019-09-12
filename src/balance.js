const { getRecipientAddress, getRelayHub } = require('./helpers');
const { merge } = require('lodash');

async function balance(web3, options = {}) {
  options.recipient = getRecipientAddress(options.recipient);

  const relayHub = getRelayHub(web3);

  return relayHub.methods.balanceOf(options.recipient).call();
}

module.exports = {
  balance,
};
