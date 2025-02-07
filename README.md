# Elastic IPFS e2e test suite

The `Elastic IPFS` e2e test suite provides a set of tools for e2e testing.

## e2e testing `bitswap-peer` service

There are 3 tests for `bitswap-peer`: `smoke`, `regression` and `load`.  
While `smoke` test performs a single request to the bitswap service, in order to test one of the most important feature of the bitswap peer suche as concurrency, we need to test under concurrent requests.  
The test stack is composed of `autocannon` and the `http-proxy`, built on top of `libp2p`, which means that every time the test run, an `http-proxy` instance is setup to target a `bitswap-peer` service or a cluster.

### How to run tests

Install node deps, please note node `v18` is required.

```bash
npm i
```

- run smoke test

```bash
npm run test:smoke -- zQmUGsfJPhJ6CLuvnvcdvJH5jc7Yxf19pSD1jRn9wbsPCBY data

# get data for block
npm run test:smoke -- $cid data 
# get info for block
npm run test:smoke -- $cid
```

- run regression test

```bash
npm run test:regression
```

- run load test

```bash
npm run test:load
```

#### compare results

```bash
node compare-results.js result/current-regression-1.json result/next-regression-1.json
node compare-results.js result/current-regression-2.json result/next-regression-2.json
node compare-results.js result/current-load-1.json result/next-load-2.json
node compare-results.js result/current-load-2.json result/next-load-2.json
```

---

### Smoke test

The purpose of the smoke test is to assert the service is able to receive a request and serve a response.  

#### Options

- **TARGET_ENV** (default `local`)

See [targets](#targets)

- **MUXERS** (default `mplex,yamux`)

Select stream muxers to use for the client, possible values are `mplex`, `yamux`. Default is both.

#### Examples

Run in local with dev scenario (for local development)

```bash
npm run test:smoke -- zQmUGsfJPhJ6CLuvnvcdvJH5jc7Yxf19pSD1jRn9wbsPCBY data
```

Run in dev with dev scenario (for dev testing)

```bash
TARGET_ENV=dev npm run test:smoke -- zQmUGsfJPhJ6CLuvnvcdvJH5jc7Yxf19pSD1jRn9wbsPCBY data
TARGET_ENV=dev npm run test:smoke -- zQmUGsfJPhJ6CLuvnvcdvJH5jc7Yxf19pSD1jRn9wbsPCBY
TARGET_ENV=dev MUXERS=yamux npm run test:smoke -- zQmUGsfJPhJ6CLuvnvcdvJH5jc7Yxf19pSD1jRn9wbsPCBY
TARGET_ENV=dev MUXERS=yamux,mplex npm run test:smoke -- zQmUGsfJPhJ6CLuvnvcdvJH5jc7Yxf19pSD1jRn9wbsPCBY
TARGET_ENV=dev MUXERS=mplex npm run test:smoke -- zQmUGsfJPhJ6CLuvnvcdvJH5jc7Yxf19pSD1jRn9wbsPCBY
```

### Regression test

The purpose of the regression test is to assert the correctness of responses.  
The default options will run a regression test against the local `bitswap-peer` service assuming it's pointing to `dev` storage.

#### Options

- **TARGET_ENV** (default `local`)

See [targets](#targets)

- **TEST_ENV** (default `dev`)

The test scenarios to load, are defined in the `/snaps` folder; currently supported values: `dev`, `staging`.

- **UPDATE_SNAPS** (default `false`)

Update snaps, instead of asserting.

- **ONLY**

Run the test with only the snap files that match the name, for example, `ONLY=single-block` will run both `single-block-info.json` and `single-block-data.json`

- **VERBOSE** (default `false`)

Enable verbosity on assertions.

- **RESULT_FILE** (default `result/regression.json`)

Path to save json result file from `autocannon`, to be used in comparison.

- **MUXERS** (default `mplex,yamux`)

Select stream muxers to use for the client, possible values are `mplex`, `yamux`. Default is both.

#### Examples

Run in local with dev scenario (for local development)

```bash
npm run test:regression
```

Run in dev with dev scenario (for dev testing)

```bash
TARGET_ENV=dev npm run test:regression
```

Run in staging with staging scenario (for staging testing)

```bash
TARGET_ENV=staging TEST_ENV=staging npm run test:regression
```

Update results for single-block-data.json

```bash
ONLY=single-block-data TARGET_ENV=dev UPDATE_SNAPS=1 npm run test:regression
```

Run test only for single-block-data.json and add verbosity

```bash
ONLY=single-block-data.json TARGET_ENV=dev VERBOSE=1 npm run test:regression
```

---

### Load test

The purpose of the regression test is to assert the system can handle a huge peek of traffic.  
Note that the test expects the service to respond, but it doesn't assert the correctness of such responses.  
The default options will run a load test against the local `bitswap-peer` service assuming it's pointing to `dev` storage.

**Note** current default settings (5 clients x 200 connections x 30 secs) are the current reference (in `dev`).

#### Options

- **TARGET_ENV** (default `local`)

See [targets](#targets)

- **TEST_ENV** (default `dev`)

The test scenarios to load, are defined in the `/snaps` folder; currently supported values: `dev`, `staging`.

- **TEST_CLIENTS** (default `5`)

Concurrent clients to run load test: for every client, will be run `TEST_CONNECTIONS` concurrent requests for `TEST_DURATION`.

- **TEST_CONNECTIONS** (default `200`)

Concurrent connections for `autocannon`.

- **TEST_DURATION** (default `30 secs`)

Test duration, in seconds - so it will run N connections for X seconds.

- **TEST_TIMEOUT** (default `5 mins`)

Timeout for each response, in seconds.

- **TEST_AMOUNT**

It overrides `duration`.

- **RESULT_FILE** (default `result/load.json`)

Path to save json result file from `autocannon`, to be used in comparison.

- **MUXERS** (default `mplex,yamux`)

Select stream muxers to use for the client, possible values are `mplex`, `yamux`. Default is both.

#### Examples

Run in local with dev scenario (for local development)

```bash
npm run test:load
```

Run in dev with dev scenario (for dev testing)

```bash
TARGET_ENV=dev npm run test:load
```

Run in staging with staging scenario (for staging testing)

```bash
TARGET_ENV=staging TEST_ENV=staging npm run test:load
```

Override default connections and durations

```bash
TARGET_ENV=dev TEST_CONNECTIONS=100 TEST_DURATION=60 npm run test:load
```

Override default clients

```bash
TARGET_ENV=dev TEST_CLIENTS=6 npm run test:load
```

Override default durations by the amount of requests

```bash
TARGET_ENV=dev TEST_CONNECTIONS=100 TEST_AMOUNT=100 npm run test:load
```

### Targets

The test target; possible values are `local`, `dev`, `staging`, and `prod` that point as following

```txt
local    /ip4/127.0.0.1/tcp/3000/ws/p2p/bafzbeia6mfzohhrwcvr3eaebk3gjqdwsidtfxhpnuwwxlpbwcx5z7sepei
dev      /dns4/elastic-dev.dag.house/tcp/443/wss/p2p/bafzbeia6mfzohhrwcvr3eaebk3gjqdwsidtfxhpnuwwxlpbwcx5z7sepei
staging  /dns4/elastic-staging.dag.house/tcp/443/wss/p2p/bafzbeigjqot6fm3i3yv37wiyybsfblrlsmib7bzlbnkpjxde6fw6b4fvei
prod     /dns4/elastic.dag.house/tcp/443/wss/p2p/bafzbeibhqavlasjc7dvbiopygwncnrtvjd2xmryk5laib7zyjor6kf3avm
```

---

### http proxy

The `http-proxy` provides an http interface to the `bitswap-peer` to be able to use common http tools for testing and benchmarks, allowing to send requests (and get responses) by http instead of the `libp2p` protocol (over `websocket`) - that is was the `http-proxy` service actually does.

#### how to use proxy

TODO

Then you can query it using http tools, for example, `curl` and `autocannon`

using curl

```bash
curl -X POST -H "Content-Type: application/json" \
-d '{"blocks": [{"type":"i","cid":"QmUGsfJPhJ6CLuvnvcdvJH5jc7Yxf19pSD1jRn9wbsPCBY"}]}' \
http://localhost:3002/
```

with autocannon

```bash
npx autocannon -m POST \
-H "Content-Type":"application/json" \
-b '{"blocks": [{"type":"i","cid":"QmUGsfJPhJ6CLuvnvcdvJH5jc7Yxf19pSD1jRn9wbsPCBY"},{"type":"i","cid":"QmRT1kpMn7ANggwsf31zVuXNUNwpHqt3u7DfKhEbtbftbM"},{"type":"d","cid":"QmUGsfJPhJ6CLuvnvcdvJH5jc7Yxf19pSD1jRn9wbsPCBY"},{"type":"d","cid":"QmRT1kpMn7ANggwsf31zVuXNUNwpHqt3u7DfKhEbtbftbM"}]}' \
http://localhost:3002/
```

## Acknowledgements

The "setup" stage before running the tests is missing, we assume data are already present in the target system - which is a **bad testing practice**.
