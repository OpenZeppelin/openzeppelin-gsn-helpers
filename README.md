# OpenZeppelin GSN Helpers

**Test and development helper methods and scripts for using the Gas Station Network.** Provides methods for quickly deploying a relay hub, funding a recipient, or registering a relayer (the last based on [fundrelay.js](https://github.com/tabookey/tabookey-gasless/blob/master/scripts/fundrelay.js) from `tabookey-gasless`).

## Install

```
npm install @openzeppelin/gsn-helpers
```

## Features

This suite has helper methods and command line scripts to:
- Deploy a new relay hub
- Register a relayer in the hub
- Fund a recipient contract in the hub

## Usage from code

Import the relevant scripts from the gsn-helpers package, and provide a valid `web3.js` instance to use them. All options are optional unless noted, and default to the values listed here.

```js
const { registerRelay, deployRelayHub, fundRecipient } = require('@openzeppelin/gsn-helpers');
const web3 = new Web3(...);

// Deploy a relay hub instance
await deployRelayHub(web3, {
  from: accounts[0]
});

// Register a relayer in the hub, requires the relayer process to be running
await registerRelay(web3, {
  relayUrl: 'http://localhost:8090',
  relayHubAddress: '0xd216153c06e857cd7f72665e0af1d7d82172f494',
  stake: ether('1'), 
  unstakeDelay: 604800, // 1 week
  funds: ether('5'),
  from: accounts[0]
});

// Fund a recipient
await fundRecipient(web3, {
  recipient: RECIPIENT_ADDRESS, // required
  amount: ether('1'),
  from: accounts[0],
  relayHubAddress: '0xd216153c06e857cd7f72665e0af1d7d82172f494'
});
```

## Usage from command line

You can also run the command above from the command line directly, which is useful for setting up your development or testing environment.

```
$ npx oz-gsn --help
Usage: oz-gsn [options] [command]

Options:
  -V, --version     output the version number
  -h, --help        output usage information

Commands:
  deploy-relay-hub  deploy the singleton RelayHub instance
  register-relayer  stake for a relayer and fund it
  fund-recipient    fund a recipient contract so that it can receive relayed calls
  help [cmd]        display help for [cmd]
```

## Sample testing setup

You can use the `oz-gsn` command line helpers to deploy a relay hub, spin up a relayer, and register it on your testing setup. Make sure to donwload the relayer binary to run it locally:

```bash
ganache_url="http://localhost:8545"
relayer_port=8099
relayer_url="http://localhost:${relayer_port}"

relayer_running() {
  nc -z localhost "$relayer_port"
}

setup_gsn_relay() {
  relay_hub_addr=$(npx oz-gsn deploy-relay-hub --ethereumNodeURL $ganache_url)
  echo "Launching GSN relay server to hub $relay_hub_addr"

  ./bin/gsn-relay -DevMode -RelayHubAddress $relay_hub_addr -EthereumNodeUrl $ganache_url -Url $relayer_url &> /dev/null &
  gsn_relay_server_pid=$!

  while ! relayer_running; do
    sleep 0.1
  done
  echo "GSN relay server launched!"

  npx oz-gsn register-relayer --ethereumNodeURL $ganache_url --relayUrl $relayer_url
}
```

Then, on your tests, you only need to set up a GSN provider and register any recipients:

```js
beforeEach(async function () {
  // Create web3 instance and a contract
  this.web3 = new Web3(PROVIDER_URL);
  this.accounts = await this.web3.eth.getAccounts();
  const Recipient = new this.web3.eth.Contract(RecipientAbi, null, { data: RecipientBytecode });
  this.recipient = await Recipient.deploy().send({ from: this.accounts[0], gas: 1e6 });
  
  // Register the recipient in the hub
  await fundRecipient(this.web3, { recipient: this.recipient.options.address });
  
  // Create gsn provider and plug it into the recipient
  const gsnProvider = new GSNProvider(PROVIDER_URL);
  this.recipient.setProvider(gsnProvider);
});
```

All transactions sent to the `recipient` contract instance will be sent as a meta-transaction via the GSN running locally on your workstation.

## License

The MIT License.
