# OpenZeppelin GSN Helpers

**Test and development helper methods and scripts for using the Gas Station Network.** Provides methods for quickly running a relayer, deploying a relay hub, funding a recipient, or registering a relayer (the last based on [fundrelay.js](https://github.com/tabookey/tabookey-gasless/blob/master/scripts/fundrelay.js) from `tabookey-gasless`).

## Install

```
npm install @openzeppelin/gsn-helpers
```

## Features

This suite has helper methods and command line scripts to:
- Run a relayer process
- Deploy a new relay hub
- Register a relayer in the hub
- Fund a recipient contract in the hub
- Query a recipient contract or relayer owner's balance in the hub
- Withdraw a relayer's owner revenue from the hub

## Running the relayer binary

You can use the `npx oz-gsn run-relayer` command to automatically download a relayer binary for your current platform and start it. Before starting the relayer process, this command also deploys a relay hub to the current network (if there isn't one already), and then registers the relayer on it.

```bash
$ npx oz-gsn run-relayer --quiet
Deploying singleton RelayHub instance
RelayHub deployed at 0xd216153c06e857cd7f72665e0af1d7d82172f494
Downloading relayer from https://github.com/OpenZeppelin/openzeppelin-gsn-helpers/releases/download/v0.1.4/gsn-relay-linux-amd64
Relayer downloaded to ~/.gsn/gsn-relay-v0.1.4
Starting relayer
~/.gsn/gsn-relay-v0.1.4
 -EthereumNodeUrl http://localhost:8545
 -RelayHubAddress 0xd216153c06e857cd7f72665e0af1d7d82172f494
 -Port 8090
 -Url http://localhost:8090
 -GasPricePercent 0
 -Workdir /tmp/tmp-95095UJ2M2Pfw0xi
 -DevMode
Funding GSN relay at http://localhost:8090
Will wait up to 30s for the relay to be ready
Relay is funded and ready!
```

You can pass in the `--detach` option if you want to the process to exit after the relay is ready to use. This is useful to setup an ephemeral relayer for testing purposes. The command will output the PID of the relayer subprocess, so you can kill it afterwards (see _Sample testing setup_ below).

## Usage from code

Import the relevant scripts from the gsn-helpers package, and provide a valid `web3.js` instance to use them. All options are optional unless noted, and default to the values listed here.

```js
const { registerRelay, deployRelayHub, fundRecipient, balance, withdraw } = require('@openzeppelin/gsn-helpers');
const web3 = new Web3(...);

// Deploy a relay hub instance
await deployRelayHub(web3, {
  from: accounts[0]
});

// Download the platform-specific binary and run a relayer
await runRelayer({
  relayUrl: 'http://localhost:8090',
  workdir: process.cwd(), // defaults to a tmp dir
  devMode: true,
  ethereumNodeURL: 'http://localhost:8545',
  gasPricePercent: 0,
  port: 8090,
  quiet: true
});

// Register a relayer in the hub, requires the relayer process to be running
await registerRelay(web3, {
  relayUrl: 'http://localhost:8090',
  stake: ether('1'),
  unstakeDelay: 604800, // 1 week
  funds: ether('5'),
  from: accounts[0]
});

// Fund a recipient
await fundRecipient(web3, {
  recipient: RECIPIENT_ADDRESS, // required
  amount: ether('1'),
  from: accounts[0]
});

// Query a recipient's or owner's GSN balance
await balance(web3, {
  recipient: RECIPIENT_ADDRESS, // required
});

// Withdraw a relayer owner's GSN balance
await withdraw(web3, {
  from: OWNER_ADDRESS, // required
  to: OWNER_ADDRESS,
  amount: await balance(web3, { recipient: from })
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
  run-relayer       downloads and runs a relayer binary, and registers it, deploying a hub if needed
  deploy-relay-hub  deploy the singleton RelayHub instance
  register-relayer  stake for a relayer and fund it
  fund-recipient    fund a recipient contract so that it can receive relayed calls
  help [cmd]        display help for [cmd]
```

## Sample testing setup

You can use the `oz-gsn` command line helpers to download the relayer binary, deploy a relay hub, spin up a relayer, and register it on your testing setup:

```bash
trap cleanup EXIT

cleanup() {
  kill $gsn_relay_server_pid
}

ganache_url="http://localhost:$ganache_port"
relayer_port=8099

setup_gsn_relay() {
  gsn_relay_server_pid=$(npx oz-gsn run-relayer --ethereumNodeURL $ganache_url --port $relayer_port --detach --quiet)
}
```

Then, on your tests, you only need to set up a GSN provider and register any recipients:

```js
beforeEach('setup', async function () {
  // Create web3 instance and a contract
  this.web3 = new Web3(PROVIDER_URL);
  this.accounts = await this.web3.eth.getAccounts();

  // Create recipient contract
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

### Advanced setup

If you prefer more fine-grained control over the recipient setup, or running a custom relayer binary, you can use the following setup:

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

## License

The MIT License.
