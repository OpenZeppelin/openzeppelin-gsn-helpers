const { registerRelay, deployRelayHub, fundRecipient } = require('./src/helpers');
const { relayHub } = require('./src/data');
const expectError = require('./src/expectError');
const _ = require('lodash');

module.exports = {
  registerRelay,
  deployRelayHub,
  fundRecipient,
  expectError,
  relayHub: _.pick(relayHub, ['abi', 'address', 'bytecode'])
};
