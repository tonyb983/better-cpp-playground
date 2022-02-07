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
import * as util from './util.js'
util.applyExtensions()
import project from './projectInfo.js'
import { PrettyLogger } from './pp.js'

const logger = new PrettyLogger('printTimingPerFile', { consoleLog: true })
logger.logi('Printing timing per file...')

const timingDir = path.resolve(project.timingDir())
logger.logi(`Found timingDir: ${timingDir}`)

/** @typedef {'B' | 'E' | 'X' | 'i' | 'I' | 'C' | 'b' | 'n' | 'e' | 'S' | 'T' | 'p' | 'F' | 's' | 't' | 'f' | 'P' | 'N' | 'O' | 'D' | 'M' | 'V' | 'v' | 'R' | 'c'} TraceEventTypeLetter */
/** @typedef {{name: string, cat?: string, ph: TraceEventTypeLetter, ts: number, tts?: number, pid: number, tid: number, dur?: number, cname?: string, args?: { detail: string} | { 'avg ms': number, count: number} }} TraceEvent */
/** @typedef {{ name: string; eventType: string; timestamp: number; duration: number; }} SimpleTraceEvent */
/** @typedef {{beginningOfTime: number, traceEvents: Array<TraceEvent>}} TraceEventData */
/** @typedef {{beginningOfTime: number, traceEvents: Array<SimpleTraceEvent>}} SimplifiedEventData */
/** @typedef {{startTime: number, eventCount: number, earliestEvents: Array<SimpleTraceEvent>, totalTime: number, longestEvents: Array<SimpleTraceEvent>, latestEvents: Array<SimpleTraceEvent>}} ProcessedEventData */

/** 
 * Convert a trace event category letter into a descriptive string.
 * @type {(l: TraceEventTypeLetter) => string} 
 */
const eventTypeToString = (l) => {
    switch (l) {
        case 'B': return 'Duration (Begin)'
        case 'E': return 'Duration (End)'
        case 'X': return 'Complete'
        case 'i': return 'Instant'
        case 'I': return 'Deprecated'
        case 'C': return 'Counter'
        case 'b': return 'Async (Nestable Start)'
        case 'n': return 'Async (Nestable Instant)'
        case 'e': return 'Async (Nestable End)'
        case 'S': return 'Deprecated (Start)'
        case 'T': return 'Deprecated (Step Into)'
        case 'p': return 'Deprecated (Step Past)'
        case 'F': return 'Deprecated (End)'
        case 's': return 'Flow (Start)'
        case 't': return 'Flow (Step)'
        case 'f': return 'Flow (End)'
        case 'P': return 'Sample'
        case 'N': return 'Object (Created)'
        case 'O': return 'Object (Snapshot)'
        case 'D': return 'Object (Destroyed)'
        case 'M': return 'Metadata'
        case 'V': return 'Memory Dump (Global)'
        case 'v': return 'Memory Dump (Process)'
        case 'R': return 'Mark'
        case 'c': return 'Clock Sync'
        default: return `Error Unknown: ${l}`
    }
}

/** 
 * Convert a trace event into a simplified trace event.
 * @type {(e: TraceEvent) => SimpleTraceEvent} 
 */
const simplifyEvent = (e) => {
    let name = e.name
    if ('args' in e) {
        if ('detail' in e.args) {
            name = `${name} (${e.args.detail})`
        } else if ('avg ms' in e.args && 'count' in e.args) {
            name = `${name} (#${e.args.count} - ${e.args['avg ms']} avg ms)`
        }
    }
    return {
        name,
        eventType: eventTypeToString(e.ph),
        timestamp: e.ts,
        duration: util.notNil(e['dur']) ? e.dur : Number.NaN,
    }
}

/** 
 * Process a timing file and return a ProcessedEventData object from its 'traceEvents' data.
 * @type {(data: SimplifiedEventData) => ProcessedEventData}
 */
const processFileData = (data) => {
    /** @type {{ beginningOfTime: number, traceEvents: Array<TraceEvent>}} */
    const { beginningOfTime: startTime, traceEvents } = data

    const eventCount = traceEvents.length

    const simple = traceEvents.map(e => simplifyEvent(e))
    // Sort by timestamp
    simple.sort((a, b) => a.timestamp - b.timestamp)
    const latestEvents = simple.slice(-10)
    const earliestEvents = simple.slice(0, 10)
    const timed = simple.filter(e => e.duration > 0)
    timed.sort((a, b) => b.duration - a.duration)
    const longestEvents = timed.slice(0, 10)
    const totalTime = simple.filter(e => e.duration > 0).map(e => e.duration).reduce((a, b) => a + b, 0)

    return {
        earliestEvents,
        eventCount,
        latestEvents,
        longestEvents,
        startTime,
        totalTime,
    }
}

/** 
 * Given a directory entry, return a tuple containing the name and contents of the file.
 * Throws Error if path does not exist.
 * @type {(dirent: fs.Dirent) => [string, TraceEventData]?} 
 */
const readTraceFile = (pathlike) => {
    if (fs.existsSync(pathlike)) {
        return [path.basename(pathlike), require(pathlike)]
    } else {
        throw new Error(`File at path ${pathlike} does not exist!`)
    }
}

/** 
 * Reads the contents of the timing directory and returns an array of [fileName, fileData] tuples.
 * @type {(dir: fs.PathLike) => Array<[string, TraceEventData]>} 
 */
const readTimingFilesFromDir = (dir) => {
    logger.logi(`Reading timing data from directory '${dir}'`)
    if (!fs.existsSync(dir)) {
        logger.loge(`Given directory (${dir}) does not exist!`)
        return []
    }

    let filecount = 0
    return fs.readdirSync(dir, { withFileTypes: true })
        .filter(d => d.isFile() && d.name.endsWith(project.timingExt))
        .tap((files) => {
            logger.logi(`Found ${files.length} timing files to analyze.`)
            filecount = files.length
        })
        .map(fn => readTraceFile(fn))
        .filter(t => util.notNil(t))
        .tap((pairs) => {
            if (pairs.length !== filecount) {
                logger.logw(`Some files were not successfully read. Expected ${filecount} files, but only found ${pairs.length} files.`)
            }
        })
}

/** @type {(data: Array<[string, TraceEventData]>) => Array<[string, SimplifiedEventData]>} */
const simplifyTimingData = (data) => data.map(([name, data]) => [name, {
    ...data,
    traceEvents: data.traceEvents.map(e => simplifyEvent(e)),
}])

/** @type {(simpleData: Array<[string, SimplifiedEventData]>) => Array<[string, SimplifiedEventData, ProcessedEventData]>} */
const processTimingData = (simpleData) => simpleData.map(([name, data]) => [name, data, processFileData(data)])

/** @type {(e: TraceEvent, linebreak?: boolean) => void} */
const logFullEvent = (e, linebreak) => {
    const lb = util.notNil(linebreak) && util.isBool(linebreak) && linebreak ? '\n' : ', '
    logger.logi(`Name: ${e.name}${lb}Category: ${e.cat ?? ''}${lb}Type: ${e.ph}${lb}Timestamp: ${e.ts}${lb}Duration: ${e.dur ?? ''}${lb}PID: ${e.pid}${lb}TID: ${e.tid}${lb}Args: ${util.notNil(e.args) ? JSON.stringify(e.args) : '{}'}`)
}

/** @type {(e: SimpleTraceEvent, linebreak?: boolean) => void} */
const logSimpleEvent = (e, linebreak) => {
    const lb = util.notNil(linebreak) && util.isBool(linebreak) && linebreak ? '\n' : ', '
    logger.logi(`Name: ${e.name}${lb}Type: ${e.eventType}${lb}Timestamp: ${e.timestamp}${lb}Duration: ${e.duration}`)
}

const processSingleFile = (file) => {
    logger.logi(`Processing file '${file}'`)
    const fp = path.resolve(file)
    logger.logi(`Resolved path '${fp}'`)
    const content = readTraceFile(fp)
    logger.logi(`ReadTraceFile result: '${JSON.stringify(content, null, 2)}'`)
    if (util.isNil(content)) {
        logger.loge(`Unable to read file ${fp}!`)
        return
    }

    const simp = simplifyTimingData([content])
    logger.logi(`Result from simplifyTimingData: '${JSON.stringify(simp, null, 2)}'`)
    const proc = processTimingData(simp)
    logger.logi(`Result from processTimingData: '${JSON.stringify(proc, null, 2)}'`)
    return;
    const [name, { traceEvents }, processed] = proc[0]
    const { earliestEvents, eventCount, latestEvents, longestEvents, totalTime } = processed
    logger.logi(`Processed File: ${name}`)
    logger.logi(`  Events With Duration: ${traceEvents.filter(e => e.duration > 0).length}`)
    logger.logi(`  Total Time: ${totalTime}`)
    logger.logi(`  Event Count: ${eventCount}`)
    logger.logi(`  Earliest Events: [${earliestEvents.map(e => e.name).join(', ')}]`)
    logger.logi(`  Latest Events: [${latestEvents.map(e => e.name).join(', ')}]`)
    logger.logi(`  Longest Events: [${longestEvents.map(e => e.name).join(', ')}]`)
    logger.logi('\n')
    logger.logi(`  Raw Processed Object:\n${JSON.stringify(processed, null, 2)}`)
    traceEvents.forEach(e => logSimpleEvent(e))
    // logger.logi(`Raw Data:\n${JSON.stringify(traceEvents, null, 2)}`)
}

const testFile = 'C:\\Tony\\Code\\Cpp\\playground\\.timing\\lib3.cpp.json'
processSingleFile(testFile)
