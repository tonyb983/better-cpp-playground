// Copyright (c) 2022 Tony Barbitta
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { Bencher, benchmark, BenchmarkResult } from '../bencher.js'
import { PrettyLogger } from '../pp.js'
import { applyExtensions, hashAny } from '../util.js'

applyExtensions()
const log = new PrettyLogger('fakeBenches', { consoleLog: true })


log.assert('hashCode' in Object.prototype, 'Object.prototype.hashCode is not defined, extension methods not applied?')

const bencher = new Bencher({ iters: 1000000, warmup: 1000, writeLine: (msg, ...args) => log.info(msg, ...args) })

// jvmHash
const jvmHash = await bencher.run('jvmHash', (n) => `${n}`.jvmHash())
// cyrbHash
const cyrbHash = await bencher.run('cyrbHash', (n) => `${n}`.cyrbHash())
// objHash aka 'object-hash'
const objHash = await bencher.run('objHash', (n) => hashAny(`${n}`))

const jvmResult = jvmHash.prettyString()
const cyrbResult = cyrbHash.prettyString()
const objResult = objHash.prettyString()


log.info(`jvmResultDebug:\n${jvmHash.debugString()}`)
log.info(`cyrbResultDebug:\n${cyrbHash.debugString()}`)
log.info(`objResultDebug:\n${objHash.debugString()}`)

log.info(`jvmResult:\n${jvmResult}`)
log.info(`cyrbResult:\n${cyrbResult}`)
log.info(`objResult:\n${objResult}`)

log.info(`comparison:\n${BenchmarkResult.generateComparison(jvmHash, cyrbHash)}`)
