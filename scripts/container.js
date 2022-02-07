// Copyright (c) 2022 Tony Barbitta
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { PrettyLogger } from './pp.js'
import {
    hashAny,
    inspect,
    isBool,
    isLikelyClassDeclaration,
    isLikelyClassInstance,
    isNil,
    isObjectLike,
    isPrimitive,
    isString,
    isSymbol,
    notNil
} from './util.js';

/**
 * @typedef {Object} Container
 */
export class Container {
    static #instance = undefined

    static withServices(...services) {
        return new Container('', false, ...services);
    }

    #logger
    #map = new Map();

    /**
     * Create a new Service Provider Container.
     * @param {string?} owner The name of the owner of the container.
     * @param {boolean?} print Whether to print **CONTAINER** logs to the console. Really only useful for debugging what the container is doing.
     * @param  {...any?} services Any services to add to the container upon construction.
     */
    constructor(owner, print, ...services) {
        const [name, ownerName] = isString(owner) ? [`Container[${owner}]`, owner] : [`Container`, 'Unnamed']
        const consoleLog = isBool(print) && print
        this.#logger = new PrettyLogger(name, { consoleLog });
        const ownerLogger = new PrettyLogger(ownerName, { consoleLog: true })
        this.#map.set(PrettyLogger, ownerLogger);
        services.forEach(service => {
            this.put(service)
        })
    }

    #safePut(key, value) {
        if (isNil(key) || isNil(value)) {
            this.#logger.error(`Nil key or value found: key = ${key} | value = ${value}`)
            return
        }

        if (this.#map.has(key)) {
            this.#logger.error(`Duplicate key found: key = ${key} | value = ${value}`)
            return
        }

        this.#map.set(key, value)
    }

    #clearNull() {
        let removals = []
        for (const [key, val] of this.#map.entries()) {
            if (isNil(key)) {
                this.#logger.warn(`Clearing null key from container (key: ${key}, val: ${val})`)
                removals.push(key)
            }

            if (isNil(val)) {
                this.#logger.warn(`Clearing null value from container (key: ${key}, val: ${val})`)
                removals.push(key)
            }
        }

        removals.forEach(key => this.#map.delete(key))
    }

    /**
     * Get a service from the container. Class instances are accessed using the
     * class constructor. Duplicate keys are not supported by the container.
     * 
     * Example:
     * ```js
     * const someMap = new Map()
     * someMap.set('foo', 'bar')
     * const container = new Container('ContainerExample')
     * container.put(someMap)
     * console.assert(container.get(Map).get('foo') === 'bar')
     * ```
     * @template Return The type of service requested.
     * @param {unknown} key The key assigned to the desired service
     * @returns {Return?} The service (if found) or nil.
     */
    get(key) {
        if (isSymbol(key)) {
            key = hashAny(key)
        }
        this.#logger.info(`Getting service '${key}' from container`)
        const service = this.#map.get(key)
        if (isNil(service)) {
            this.#logger.warn(`Service '${key}' not found in container`)
        } else {
            this.#logger.info(`Service '${service}' found in container`)
        }
        return service
    }

    /**
     * @param {unknown} service The service to put into the container.
     */
    put(service) {
        if (arguments.length !== 1) {
            throw new Error(`Invalid number of arguments passed to put. Expected 1, got ${arguments.length}. Remember to wrap (key, value) pairs in a tuple.`)
        }

        const isSym = isSymbol(service)

        if (isSym) {
            throw new Error('Symbols are not supported in Container')
        }

        const isPrim = isPrimitive(service)
        const isTuple = typeof service === 'object' && 'length' in service && service.length === 2
        if (isTuple && isSymbol(service[0])) {
            this.#logger.warn('Symbols are not supported in Container')
            service[0] = hashAny(service[0])
        }
        // const isInstance = isLikelyClassInstance(service)
        const isInstance = ['object', 'function'].includes(typeof service) && 'constructor' in service && !('prototype' in service) && 'prototype' in service['constructor']
        const isClass = isLikelyClassDeclaration(service)
        this.#logger.info(`Putting service ${service} | isPrimitive: ${isPrim} | isTuple: ${isTuple} | isInstance: ${isInstance} | isClass: ${isClass}`)

        if (isPrim) {
            this.#logger.info(`Adding primitive ${service} with key self`)
            this.#safePut(service, service)
            return
        }

        if (isTuple) {
            const [key, value] = service
            if (isSymbol(key)) {
                this.#logger.info(`Symbol found as key, hashing...`)
                const hash = hashAny(key)
                this.#logger.info(`Adding service ${value} under hashed key ${hash}`)
                this.#safePut(hash, value)
            } else {
                this.#logger.info(`Adding service ${value} under key ${key}`)
                this.#safePut(key, value)
            }
            return
        }

        if (isInstance) {
            this.#logger.info(`Likely class instance found`)
            const ctor = service.constructor
            const genericObject = ctor.name === 'Object'
            if (!genericObject) {
                const proto = ctor.prototype
                this.#logger.info(`Adding service '${ctor.name}' to container: ${inspect(service, { showHidden: true, depth: null, color: false })} | ${inspect(ctor, { showHidden: true, depth: null, color: false })} | ${inspect(proto, { showHidden: true, depth: null, color: false })}`)
                this.#safePut(ctor, service)
            } else {
                this.#logger.info(`Likely generic / anonymous object found, adding to container with self as key`)
                this.#safePut(service, service)
            }
            return
        }

        if (isClass) {
            this.#logger.info(`Likely class declaration found, attempting to instantiate`)

            try {
                const s = new service()
                this.#logger.info(`Successfully initialized class: ${s}`)
                if (s.constructor.prototype === service.prototype) {
                    this.#logger.info('new instance constructor.prototype === service.prototype, adding service')
                    this.#logger.info(`Instance: ${inspect(s, { showHidden: true, depth: null, color: false })} | Class: ${inspect(service, { showHidden: true, depth: null, color: false })}`)
                    this.#safePut(service, s);
                    return
                }
            } catch (e) {
                this.#logger.error(`Failed to instantiate class: ${e}`)
            }
        }

        this.#logger.warn(`Unknown type of service ${service}, adding with self as key.`)
        this.#safePut(service, service);
    }

    logInfo(msg, ...args) {
        this.#map.get(PrettyLogger).info(msg, ...args)
    }

    setLoggerName(name) {
        if (!isString(name)) {
            this.#logger.warn(`setLoggerName: name must be a string.`)
            return
        }

        this.#logger.info(`Changing logger name inside container to '${name}'`)
        const logger = this.#map.get(PrettyLogger)
        if (notNil(logger)) {
            logger.setName(name)
        }
    }
}