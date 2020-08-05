:warning: This project is **deprecated**. All development on the GSN has been moved to the [OpenGSN](https://github.com/opengsn) organization. Please refer to the [OpenGSN localgsn implementation](https://github.com/opengsn/localgsn). We won't be developing new features nor addressing issues. Read [here](https://forum.openzeppelin.com/t/doubling-down-in-security/2712) for more info.

# OpenZeppelin GSN Helpers

[![NPM Package](https://img.shields.io/npm/v/@openzeppelin/gsn-helpers.svg)](https://www.npmjs.org/package/@openzeppelin/gsn-helpers)

**Helper functions and scripts for using the Gas Station Network**. Develop and test your GSN application with minimal setup.

Provides methods for:

 * Deploying a `RelayHub` instance
 * Funding a recipient
 * Query a recipient's or relayer owner's GSN balance
 * Running and registering a relayer
 * Withdrawing a relayer's revenue

## Overview

### Installation

```console
$ npm install @openzeppelin/gsn-helpers
```

### Usage

The GSN Helpers come in two flavors: a command-line interface and a JavaScript library, providing high flexibility.

The following samples show how to use each to deploy the `RelayHub` contract, fund a recipient and then start a relayer server.

#### Using the CLI

```console
$ npx oz-gsn deploy-relay-hub --ethereumNodeURL http://localhost:8545
Deploying singleton RelayHub instance
RelayHub deployed at 0xd216153c06e857cd7f72665e0af1d7d82172f494

$ npx oz-gsn fund-recipient --recipient <address> --amount 50000000
Recipient <address> balance is now 50000000 wei

$ npx oz-gsn run-relayer --ethereumNodeURL http://localhost:8545 --quiet
Starting relayer
~/.cache/gsn-nodejs/gsn-relay-v0.2.1
 -EthereumNodeUrl http://localhost:8545
 -RelayHubAddress 0xd216153c06e857cd7f72665e0af1d7d82172f494
 -Port 8090
 -Url http://localhost:8090
Relay is funded and ready!
```

#### Using the JavaScript library

```javascript
const {
  deployRelayHub,
  runRelayer,
  fundRecipient,
} = require('@openzeppelin/gsn-helpers');

const web3 = new Web3('http://localhost:8545');

await deployRelayHub(web3);

await runRelayer(web3, { quiet: true });

await fundRecipient(web3, { recipient: <address>, amount: 50000000 });
```

NOTE: All of these actions require a [local blockchain](https://github.com/trufflesuite/ganache-cli/) to be running in the background on port 8545.

## Learn More

 * Head to [Preparing a Testing Environment](https://docs.openzeppelin.com/gsn-helpers/preparing-a-testing-environment) to quickstart your project with ready-to-use GSN setup scripts.
 * For detailed usage information, take a look at the [API Reference](https://docs.openzeppelin.com/gsn-helpers/api).

## License

The MIT License.
