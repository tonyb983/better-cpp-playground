// Copyright (c) 2022 Tony Barbitta
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import chalk from 'chalk';

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

    /**
     * Gets the name of this log level.
     * @returns {string}
     */
    name() {
        return this.#name
    }

    /**
     * Gets the name of this log level. Identical to `name()`.
     * @returns {string}
     */
    toString() {
        return this.#name
    }

    /**
     * Gets the numeric value of this log level.
     * @returns {number}
     */
    toInt() {
        return this.#num
    }

    /**
     * Gets the name of this log level colored with the appropriate color.
     * Identical to `logLevel.color(logLevel.name())`.
     * @returns {string}
     */
    colored() {
        return this.#color(this.#name)
    }

    /**
     * Colors the given msg with the appropriate color for this log level.
     * @param {string} msg The text to color.
     * @returns {string}
     */
    color(msg) {
        return this.#color(msg)
    }
}

/**
 * @type {{info: typeof LogLevel.Info, warning: typeof LogLevel.Warning, error: typeof LogLevel.Error, fatal: typeof LogLevel.Fatal}}
 */
export const LogLevels = {
    info: LogLevel.Info,
    warning: LogLevel.Warning,
    error: LogLevel.Error,
    fatal: LogLevel.Fatal,
}
