const { registerRelay, deployRelayHub, fundRecipient, getRelayHub } = require('./src/helpers');
const { relayHub } = require('./src/data');
const expectError = require('./src/expectError');
const _ = require('lodash');

module.exports = {
  registerRelay,
  deployRelayHub,
  fundRecipient,
  getRelayHub,
  expectError,
  relayHub: _.pick(relayHub, ['abi', 'address', 'bytecode'])
};
