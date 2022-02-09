// Copyright (c) 2022 Tony Barbitta
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import {
    format,
    formatWithOptions,
    stripVTControlCharacters as stripAscii
} from 'node:util';

import { getTimestamp, isBool, isString } from '../util.js'
import { LogLevel, LogLevels } from './levels.js'

import chalk from 'chalk';

const lBracket = chalk.gray('[')
const rBracket = chalk.gray(']')
const pipe = chalk.gray('|')

const nonEmptyString = (value) => isString(value) && !!value.length

const DefaultFormatOptions = {
    breakLength: 60,
    colors: false,
    depth: 4,
    compact: true,
    getters: true,
    maxArrayLength: 20,
    maxStringLength: 50,
    showHidden: true,
    showProxy: true,
    sorted: true,
}
const makeFormatFunction = (opts) => (msg, ...args) => formatWithOptions(opts, msg, ...args)

export class DefaultLogFormatter {
    #name
    #formatFunc
    constructor(loggerName, opts) {
        this.#name = loggerName
        const options = Object.assign({}, DefaultFormatOptions, opts)
        this.formatFunction(makeFormatFunction(options))
    }

    get name() { return this.#name }
    set name(val) { nonEmptyString(val) ? this.#name = val : this.#name = 'Unnamed' }

    get isColor() { return false }

    get formatFunction() { return this.#formatFunc }
    set formatFunction(fn) {
        if (typeof fn === 'function' && fn.arguments.length > 0) {
            this.#formatFunc = fn
        }
    }

    /**
     * Make the log prefix: [timestamp]Level|Name| 
     * @param {LogLevel} lvl The level of the log.
     * @returns The new colored log message prefix.
     */
    makePrefix(lvl) {
        return `[${getTimestamp()}]${lvl.toString()}|${this.#name}|`
    }

    /**
     * Formats the message and args for the level, colored for console output.
     * @param {LogLevel} lvl The level of the log message.
     * @param {any} msg The message to print.
     * @param  {...any?} args Additional data to log.
     */
    formatMsg(lvl, msg, ...args) {
        const p = this.makePrefix(lvl)
        const m = this.formatFunction(msg, ...args)
        return `${p} ${m}`
    }
}

const DefaultColorFormatOptions = {
    breakLength: 60,
    colors: true,
    depth: 4,
    compact: true,
    getters: true,
    maxArrayLength: 20,
    maxStringLength: 50,
    showHidden: true,
    showProxy: true,
    sorted: true,
}

export class ColorLogFormatter extends DefaultLogFormatter {
    constructor(loggerName, opts) {
        super(loggerName, opts)
        const options = Object.assign({}, DefaultColorFormatOptions, opts)
        this.formatFunction(makeFormatFunction(options))
    }

    get isColor() { return true }

    /**
     * Make the log prefix: [timestamp]Level|Name| 
     * @param {LogLevel} lvl The level of the log.
     * @returns The created, colored, prefix.
     */
    makePrefix(lvl) {
        return `${lBracket}${chalk.magenta(this.#name)}${rBracket}:${lvl.colored()}|`
    }

    /**
     * Formats the message and args for the level, colored for console output.
     * @param {LogLevel} lvl The level of the log message.
     * @param {any} msg The message to print.
     * @param  {...any?} args Additional data to log.
     */
    formatMsg(lvl, msg, ...args) {
        const p = this.makePrefix(lvl)
        const m = this.formatFunction(msg, ...args)
        return `${p} ${m}`
    }
}
