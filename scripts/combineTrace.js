// Copyright 2022 Tony Barbitta
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import fs from 'fs'
import path from 'path'

import { PrettyLogger } from './pp.js'
import { applyExtensions } from './util.js'
applyExtensions()

import project from './projectInfo.js'

const logger = new PrettyLogger('combineTrace', { consoleLog: true })
logger.logi('Combining `traceEvents` from each timing file...')

const timingDir = path.resolve(project.timingDir())
const buildDir = path.resolve(project.buildDir())
logger.logi(`Found timingDir: ${timingDir}`)
logger.logi(`Found buildDir: ${buildDir}`)
// beginningOfTime  - Time the compilation started
// traceEvents      - Array of trace events

logger.assert(fs.existsSync(timingDir), 'Timing directory does not exist!')

let eventCount = 0
const final = fs.readdirSync(timingDir, { withFileTypes: true })
    .filter(d => d.isFile() && d.name.endsWith(project.timingExt))
    .tap((files) => logger.logi(`Found ${files.length} timing files to combine.`))
    .map(d => d.name)
    // .map(fn => [fn, JSON.parse(fs.readFileSync(path.join(timingDir, fn), 'utf8'))])
    .map(fn => [fn, require(path.join(timingDir, fn))])
    .map(([fn, data]) => {
        eventCount += data.traceEvents.length
        const newEvents = data.traceEvents.map(e => { if ('tid' in e) e.tid = fn; return e })
        return {
            ...data,
            traceEvents: newEvents
        }
    })
    .tap((_) => logger.logi(`Expected length is ${eventCount} total events.`))
    .reduce((prev, curr) => ({
        ...prev,
        ...curr,
        beginningOfTime: Math.min(prev.beginningOfTime, curr.beginningOfTime),
        traceEvents: prev.traceEvents.concat(curr.traceEvents),
    }), { traceEvents: [], beginningOfTime: Number.MAX_SAFE_INTEGER })

logger.assert(final.traceEvents.length === eventCount, 'Expected length is ' + eventCount + ' total events. Found ' + final.traceEvents.length)

const target = path.join(timingDir, project.timingCombinedFilename + '.json')
logger.logi(`Writing combined trace to ${target}`)
if (fs.existsSync(target)) {
    logger.loge('Target file already exists: ' + target)
    return
}
fs.writeFileSync(target, JSON.stringify(final))
