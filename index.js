const {
  registerRelay,
  deployRelayHub,
  fundRecipient,
  getRelayHub,
  isRelayHubDeployed,
  getRecipientFunds
} = require("./src/helpers");
const { relayHub } = require("./src/data");
const { runRelayer, runAndRegister } = require("./src/run");
const { downloadRelayer } = require("./src/download");
const expectError = require("./src/expectError");
const _ = require("lodash");

module.exports = {
  registerRelay,
  deployRelayHub,
  fundRecipient,
  getRelayHub,
  expectError,
  relayHub: _.pick(relayHub, ["abi", "address", "bytecode"]),
  runRelayer,
  runAndRegister,
  downloadRelayer,
  isRelayHubDeployed,
  getRecipientFunds
};
