'use strict'

const fs = require('fs/promises')
const path = require('path')
const autocannon = require('autocannon')

const helper = require('./helper')
const regression = require('./helper/regression')

const TARGET_ENV = process.env.TARGET_ENV ?? 'local'
const TEST_ENV = process.env.TEST_ENV ?? 'dev'
const UPDATE_SNAPS = !!process.env.UPDATE_SNAPS
const ONLY = process.env.ONLY
const VERBOSE = !!process.env.VERBOSE
const PROXY_CONCURRENCY = process.env.PROXY_CONCURRENCY ? parseInt(process.env.PROXY_CONCURRENCY) : 8
const RESULT_FILE = process.env.RESULT_FILE ?? 'result/regression.json'

async function test () {
  const service = await helper.startProxy({
    target: helper.targets[TARGET_ENV],
    concurrency: PROXY_CONCURRENCY
  })

  const c = await regression.loadCases({
    dir: path.join(__dirname, './snaps', TEST_ENV, 'regression'),
    request: service.request,
    updateSnaps: UPDATE_SNAPS,
    only: ONLY,
    verbose: VERBOSE
  })

  // run concurrent requests
  // match them with snap
  const start = Date.now()
  let done = 0
  const results = {}
  for (const case_ of c.cases) {
    console.log(' *** running', case_.file, case_.test, '...')
    autocannon({
      url: service.url,
      requests: [case_],
      duration: case_.test.duration ?? 1,
      amount: case_.test.amount,
      connections: case_.test.connections,
      timeout: case_.test.timeout
    }, (error, result) => {
      console.log(' *** done', case_.file, case_.count)
      if (error) { console.error({ error }) }

      results[case_.file] = result
      console.log(autocannon.printResult(result))

      if (++done === c.cases.length) {
        end({ start, service, results })
      }
    })
  }
}

async function end ({ start, service, results }) {
  await fs.writeFile(path.join(__dirname, RESULT_FILE), JSON.stringify(results, null, 2), 'utf8')
  console.log('done in ', Date.now() - start, 'ms')
  service.close()
}

test()
