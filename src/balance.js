const { getRecipientAddress, getRelayHub } = require('./helpers');

async function balance(web3, options = {}) {
  options.recipient = getRecipientAddress(options.recipient);

  const relayHub = getRelayHub(web3);

  return relayHub.methods.balanceOf(options.recipient).call();
}

module.exports = {
  balance,
};
