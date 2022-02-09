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

import { LogLevel, LogLevels } from './levels.js'

/** @typedef {(text: string, lvl: LogLevel, msg: any, ...args) => void} OnLogFunction The type of function expected from a log sink. */
/** @typedef {{ onLog: OnLogFunction }} LogSink A sink that accepts log messages. */

class BaseLogSink {
    constructor(...args) { }

    /**
     * Accept a log message and do something (or nothing) with it.
     * @param {string} text The text generated by the Logger's Formatter.
     * @param {LogLevel} lvl The level of the log.
     * @param {string} msg The original message passed to the Logger.
     * @param {...any?} args The original arguments passed to the logger.
     */
    onLog(text, lvl, msg, ...args) { }
}

const DefaultInMemoryLogSinkOptions = {
    bufferSize: 1000,
    closeWhenFull: false,
}

Object.freeze(DefaultInMemoryLogSinkOptions)

/**
 * A LogSink that stores log messages into an in-memory buffer / array.
 * Could also be called `TestLogSink`
 */
export class InMemoryLogSink extends BaseLogSink {
    #opts
    #buffer = []
    /**
     * Create a new InMemoryLogSink.
     * @param {{bufferSize?: number, closeWhenFull?: boolean}} opts The options for this InMemoryLogSink.
     * @param  {...any} args Any additional arguments (currently unused).
     */
    constructor(opts, ...args) {
        super(...args)
        this.#opts = { ...DefaultInMemoryLogSinkOptions, ...opts }
    }

    /**
     * Accept a log message and do something (or nothing) with it.
     * @param {string} text The text generated by the Logger's Formatter.
     * @param {LogLevel} lvl The level of the log.
     * @param {string} msg The original message passed to the Logger.
     * @param {...any?} args The original arguments passed to the logger.
     */
    onLog(text, lvl, msg, ...args) {
        const isFull = this.#buffer.length >= this.#opts.bufferSize;

        if (isFull) {
            if (this.#opts.closeWhenFull) {
                return
            } else {
                this.#buffer.shift();
            }
        }

        this.#buffer.push(stripAscii(text))
    }

    get length() {
        return this.#buffer.length;
    }

    nth(n) {
        if (n < 0 || n >= this.#buffer.length) {
            return undefined
        } else {
            return this.#buffer[n]
        }
    }

    forEach(fn) {
        this.#buffer.forEach(fn);
    }

    map(fn) {
        return this.#buffer.map(fn);
    }

    filter(fn) {
        return this.#buffer.filter(fn);
    }
}

InMemoryLogSink[Symbol.iterator] = function () {
    // ...it returns the iterator object:
    // 2. Onward, for..of works only with the iterator object below, asking it for next values
    return {
        current: 0,
        last: this.length,
        nth: this.nth,

        // 3. next() is called on each iteration by the for..of loop
        next() {
            // 4. it should return the value as an object {done:.., value :...}
            if (this.current < this.last) {
                return { done: false, value: this.nth(this.current++) };
            } else {
                return { done: true };
            }
        }
    };
};

/**
 * Create a custom log sink that calls the given function each time a log is received.
 * @param {(text: string, lvl: LogLevel, msg: any, ...args) => void} fn The function to call when a log is received.
 * @returns A new log sink.
 */
const CustomLogSink = (fn) => class extends BaseLogSink {
    constructor(...args) {
        super(...args)
    }

    /**
     * Accept a log message and do something (or nothing) with it.
     * @param {string} text The text generated by the Logger's Formatter.
     * @param {LogLevel} lvl The level of the log.
     * @param {string} msg The original message passed to the Logger.
     * @param {...any?} args The original arguments passed to the logger.
     */
    onLog(text, lvl, msg, ...args) {
        fn(text, lvl, msg, ...args)
    }
}

/**
 * 
 * @param {*} fn 
 * @param  {...any} ctorArgs 
 * @returns 
 */
const createCustomLogSink = (fn, ...ctorArgs) => {
    const CustomSink = CustomLogSink(fn)
    return new CustomSink(...ctorArgs)
}

export class FileLogSink extends BaseLogSink {
    #opts
    #file
    constructor(opts, ...args) {
        super(...args)
    }
}