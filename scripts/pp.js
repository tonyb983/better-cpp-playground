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
import chalk from 'chalk'
import { Observable } from 'rxjs'
import { assert } from 'chai'
const betterBeTrue = assert.isTrue

import { getTimestamp, isBool, isFunction, isNil, isNumber, isObjectLike, notNil, } from './util.js'
import project from './projectInfo.js'

export class LogLevel {
    #num
    #name
    #color
    constructor(name, num, colorFunc) {
        this.#num = num
        this.#name = name
        this.#color = colorFunc
    }

    static Info = new LogLevel('Info', 0, chalk.green)
    static Warning = new LogLevel('Warning', 1, chalk.yellow)
    static Error = new LogLevel('Error', 2, chalk.redBright)
    static Fatal = new LogLevel('Fatal', 3, chalk.bold.underline.hex('#FFA500'))

    name() {
        this.#name
    }

    toString() {
        return this.#name
    }

    colored() {
        return this.#color(this.#name)
    }

    color(msg) {
        return this.#color(msg)
    }
}

class LogFormatter {
    #name
    constructor(loggerName, opts) {
        this.#name = loggerName
    }

    setName(name) {
        this.#name = name
    }

    /**
     * Make the log prefix: [timestamp]Level|Name| 
     * @param {LogLevel} lvl The level of the log.
     * @returns The created, colored, prefix.
     */
    makePrefix(lvl) {
        return `[${getTimestamp()}]${lvl.toString()}|${this.#name}|`
    }

    /**
     * Formats the message and args for the level.
     * @param {LogLevel} lvl The level of the log message.
     * @param {any} msg The message to print.
     * @param  {...any?} args Additional data to log.
     */
    formatMsg(lvl, msg, ...args) {
        const p = this.makePrefix(lvl)
        const a = notNil(args) ? ` | ${JSON.stringify(args)}` : ''
        return `${p} ${msg}${a}`
    }

    /**
     * Make the log prefix: [timestamp]Level|Name| 
     * @param {LogLevel} lvl The level of the log.
     * @returns The created, colored, prefix.
     */
    makePrefixColor(lvl) {
        return `${lBracket}${chalk.magenta(this.#name)}${rBracket}:${lvl.colored()}|`
    }

    /**
     * Formats the message and args for the level, colored for console output.
     * @param {LogLevel} lvl The level of the log message.
     * @param {any} msg The message to print.
     * @param  {...any?} args Additional data to log.
     */
    formatMsgColor(lvl, msg, ...args) {
        const p = this.makePrefixColor(lvl)
        const m = lvl.color(msg)
        const a = notNil(args) ? ` | ${lvl.color(JSON.stringify(args))}` : ''
        return `${p} ${m}${a}`
    }
}

const lBracket = chalk.gray('[')
const rBracket = chalk.gray(']')
const pipe = chalk.gray('|')

export class PrettyLogger {
    static #instance = undefined
    static #GLOBAL_CONSOLE_LOG = true
    /**
     * Set the console log status for the global logger.
     * @param {boolean} status Whether the global logger should log to console as well as file.
     */
    static setGlobalConsoleLog(status) {
        PrettyLogger.global().setConsoleOut(status)
    }
    /**
     * Get the global logger.
     * @returns {PrettyLogger} The global logger singleton.
     */
    static global() {
        if (PrettyLogger.#instance === undefined) {
            PrettyLogger.#instance = new PrettyLogger('Global', { consoleLog: PrettyLogger.#GLOBAL_CONSOLE_LOG })
        }
        return PrettyLogger.#instance
    }

    #consoleLog = false
    #formatter
    #listeners = new Set()
    #name = ''
    #outPath = ''

    /**
     * Create a new PrettyLogger which will save all logs to the script log dir. If consoleLog is passed
     * within the `opts` argument then the logs will also be printed to the console.
     * @param {any} name The name to assign to this logger.
     * @param {{consoleLog: boolean}} opts Options to apply.
     */
    constructor(name, opts) {
        if (notNil(opts) && notNil(opts['consoleLog']) && isBool(opts['consoleLog']) && opts['consoleLog']) {
            this.#consoleLog = true
        }

        this.#name = name
        this.#formatter = new LogFormatter(name)
        const logDir = project.scriptsLogDir()
        const timestamp = getTimestamp()
        this.#outPath = path.join(logDir, this.#name, `${timestamp}.log`)
        if (!fs.existsSync(logDir) || !fs.existsSync(path.join(logDir, this.#name))) {
            fs.mkdirSync(path.join(logDir, this.#name), { recursive: true })
        }

        if (!fs.existsSync(this.#outPath)) {
            fs.writeFileSync(this.#outPath, '', {})
        }

        this.info(chalk.grey(`PrettyLogger(${this.#name}) initialized.`))
        // console.log(`PrettyLogger created.\n\tconsoleLog = ${this.#consoleLog}\n\tname = ${this.#name}\n\toutPath = ${this.#outPath}`)
    }

    /**
     * Console Log - Logs the given message and any args passed as info to the console. The message
     * and args will be left unformatted so that the user can provide coloring if they would like.
     * @param {any} msg The message to print.
     * @param  {...any} args Optional additional data to log.
     */
    #log(lvl, msg, ...args) {
        if (this.#consoleLog) {
            console.log(this.#formatter.formatMsgColor(lvl, msg, ...args))
        }

        const logMsg = this.#formatter.formatMsg(lvl, msg, ...args)
        fs.appendFileSync(this.#outPath, logMsg + '\n')
        this.#dispatch(LogLevel.Error, msg, ...args)
    }

    /**
     * Change the name of an existing logger. Note this will not change the outpath
     * for log files.
     * @param {string} name The new name for this logger.
     */
    setName(name) {
        this.#name = name
        this.#formatter.setName(name)
    }

    /**
     * Change the console logging status for this existing logger.
     * @param {boolean} status The console out status.
     */
    setConsoleOut(status) {
        if (isBool(status)) {
            this.#consoleLog = status
        }
    }

    /**
     * Console Log - Logs the given message and any args passed as info to the console. The message
     * and args will be left unformatted so that the user can provide coloring if they would like.
     * @param {any} msg The message to print.
     * @param  {...any} args Optional additional data to log.
     */
    logc(lvl, msg, ...args) {
        if (this.#consoleLog) {
            const pre = this.#formatter.makePrefixColor(lvl)
            console.log(`${pre} ${msg}`, ...args)
        }

        const logMsg = this.#formatter.formatMsg(lvl, msg, ...args)
        fs.appendFileSync(this.#outPath, logMsg + '\n')
        this.#dispatch(lvl, msg, ...args)
    }

    /**
     * Info Log - Logs the given message and any args passed as info.
     * @param {any} msg The message to print.
     * @param  {...any} args Optional additional data to log.
     */
    info(msg, ...args) {
        this.#log(LogLevel.Info, msg, ...args)
    }

    /**
     * Warn Log - Logs the given message and any args passed as a warning.
     * @param {any} msg The message to print.
     * @param  {...any} args Optional additional data to log.
     */
    warn(msg, ...args) {
        this.#log(LogLevel.Warning, msg, ...args)
    }

    /**
     * Error Log - Logs the given message and any args passed as an error.
     * @param {any} msg The message to print.
     * @param  {...any} args Optional additional data to log.
     */
    error(msg, ...args) {
        this.#log(LogLevel.Error, msg, ...args)
    }

    /**
     * Assert - Asserts that the given condition is true. If not it will be logged and
     * then an error with be thrown. This used to call process.exit(1) instead of throwing
     * but I'm trying to make it more testable.
     * @param {boolean} condition The condition to test.
     * @param {*} msg The message to display on failure.
     * @param  {...any} args Any additional data to log.
     */
    assert(condition, msg, ...args) {
        let success = true;
        try {
            if (isFunction(condition)) {
                betterBeTrue(condition())
            } else {
                betterBeTrue(condition)
            }
        } catch (err) {
            success = false;
        }

        if (!success) {
            console.log(this.#formatter.formatMsgColor(LogLevel.Fatal, `Assertion Failed: ${msg}`, args))
            const logMsg = this.#formatter.formatMsg(LogLevel.Fatal, `Assertion Failed: ${msg}`, args)
            fs.appendFileSync(this.#outPath, logMsg + '\n')
            // process.exit(1)
            throw new Error("Assertion Failed")
        }
    }

    /**
     * Dispatch a log event to all listeners.
     * @param {LogLevel} lvl The log level of this dispatch.
     * @param {any} msg The log message.
     * @param  {...any} args The args passed to the log.
     */
    async #dispatch(lvl, msg, ...args) {
        for (const listener of this.#listeners) {
            if (isNil(listener)) {
                this.#listeners.delete(listener)
            } else {
                listener(lvl, msg, ...args)
            }
        }
    }

    /**
     * Validates that a listener can be called during a log event.
     * @param {unknown} listener The potential listener.
     * @returns {'fn' | 'obj' | ''} True if the listener is valid.
     */
    #validateListener(listener) {
        if (isFunction(listener) && listener.length > 0) {
            PrettyLogger.global().info(`Valid listener '${listener.name} found. (Function type that accepts at least 1 argument)`)
            return 'fn'
        }

        if (isObjectLike(listener) && 'onLog' in listener) {
            if (isFunction(listener.onLog) && listener.onLog.length > 0) {
                PrettyLogger.global().info(`Valid listener '${listener.name} found. (Object type with onLog function accepting at least 1 argument)`)
                return 'obj'
            }
        }

        return ''
    }

    /**
     * Adds a listener that will be called whenever this logger logs a message.
     * @param {function | {onLog: (log: [LogLevel, any, ...any]) => unknown}} listener The listener that will be called on each log.
     * @returns {{success: boolean, dispose: () => void}} The whether the add was successful and a disposable function that can be used to remove the listener.
     */
    addLogListener(listener) {
        switch (this.#validateListener(listener)) {
            case 'fn':
                fn = listener
                listener = { onLog: fn }
            case 'obj':
                this.#listeners.add(listener)
                return {
                    success: true,
                    dispose: () => this.#listeners.delete(listener)
                }

            default:
                return { success: false, dispose: () => { } }
        }
    }

    /**
     * Gets the number of current listeners.
     */
    listenerCount() {
        return this.#listeners.size
    }

    /**
     * Error Log - Logs the given message and any args passed as an error.
     * @param {*} msg 
     * @param  {...any} args 
     */
    assert_OLD(condition, msg, ...args) {
        const isSuccess = (value) => {
            if (isNil(value)) {
                return false
            } else if (isBool(value)) {
                return value
            } else if (isNumber(value)) {
                return value !== 0
            } else if (isFunction(value)) {
                let result = true
                try {
                    result = value()
                } catch (err) {
                    return false
                } finally {
                    if (isNil(result)) {
                        return false
                    } else {
                        return isSuccess(result)
                    }
                }
            } else {
                console.log(`Unable to determine type for value ${JSON.stringify(value)}.`)
                return false
            }
        }

        if (!isSuccess(condition)) {
            console.log(this.#formatter.formatMsgColor(LogLevel.Fatal, `Assertion Failed: ${msg}`, args))
            const logMsg = this.#formatter.formatMsg(LogLevel.Fatal, `Assertion Failed: ${msg}`, args)
            fs.appendFileSync(this.#outPath, logMsg + '\n')
            // process.exit(1)
            throw new Error("Assertion Failed")
        }
    }
}
