const data = require('./data');
const { defaultFromAccount, ether, getRecipientAddress, getRelayHub } = require('./helpers');
const { deployRelayHub } = require('./deploy');
const { merge } = require('lodash');

async function fundRecipient(web3, options = {}) {
  const defaultOptions = {
    amount: ether('1'),
    from: await defaultFromAccount(web3, options && options.from),
    relayHubAddress: data.relayHub.address,
  };

  options = merge(defaultOptions, options);

  options.recipient = getRecipientAddress(options.recipient);

  // Ensure relayHub is deployed on the local network
  if (options.relayHubAddress.toLowerCase() === data.relayHub.address.toLowerCase()) {
    await deployRelayHub(web3, options);
  }
  const relayHub = getRelayHub(web3, options.relayHubAddress);

  const targetAmount = new web3.utils.BN(options.amount);
  const currentBalance = new web3.utils.BN(await relayHub.methods.balanceOf(options.recipient).call());
  if (currentBalance.lt(targetAmount)) {
    const value = targetAmount.sub(currentBalance);
    await relayHub.methods.depositFor(options.recipient).send({ value, from: options.from });
    return targetAmount;
  } else {
    return currentBalance;
  }
}

module.exports = {
  fundRecipient,
};
