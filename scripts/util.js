import { inspect as ins } from 'node:util'
import { isPromise as isP, isSymbolObject, isAsyncFunction as iaf } from 'node:util/types'
import pad from 'lodash/pad.js';
import padStart from 'lodash/padStart.js';
import padEnd from 'lodash/padEnd.js';

import hasher from 'object-hash'

import { Container } from './container.js';
import { PrettyLogger } from "./pp.js";
import project from './projectInfo.js'

// Private Members
const toString = Object.prototype.toString
const getTag = (value) => value == null ? value === undefined ? '[object Undefined]' : '[object Null]' : toString.call(value)
const timestampStripper = /(:|-|\.)/g

// =====================
// Pub Utility Functions
export const isAsyncFunction = (value) => notNil(value) && iaf(value)
/** 
 * Determines whether the given value is a boolean (primitive or class object).
 * @type {(value: any?) => value is bool} 
 */
export const isBool = (value) => notNil(value) && (typeof value == 'boolean' || value instanceof Boolean)
/**
 * Checks whether a value is an Object or at least object-like.
 * @param {unknown} value The value to check.
 * @returns {value is Object} Whether or not the value is an object.
 */
export const isObjectLike = (value) => notNil(value) && typeof value === 'object'
/**
 * Tests whether the given value is "Promise-like" aka, it is a function or object that
 * contains a `next` function.
 * @param {any?} value The value to test.
 * @returns {value is Promise<unknown>} True if the value is promise-like, false otherwise.
 */
export const isPromiseLike = (value) => notNil(value) &&
    (typeof value === 'function' || typeof value === 'object') &&
    'then' in value &&
    (typeof value['then'] === 'function')
/**
 * Determines whether the given value is a string (primitive or class object).
 * @type {(value: any?) => value is string}
 */
export const isString = (value) => notNil(value) && (typeof value === 'string' || value instanceof String)
/** @type {(value: any?) => value is null} */
export const isNil = (value) => value === null || value == undefined || typeof value === 'undefined'
/** @type {(value: T?) => value is T} */
export const notNil = (value) => !isNil(value)
/** @type {(value: any?) => value is function} */
export const isFunction = (value) => notNil(value) && typeof value === 'function'
/** @type {(value: any?) => value is number} */
export const isNumber = (value) => typeof value === 'number' || (isObjectLike(value) && getTag(value) == '[object Number]')
/**
 * Test whether the given value is a **BUILT-IN** Promise.
 * @param {unknown} value The value to test.
 * @returns {value is Promise<unknown>} `true` if `value` is a built-in `Promise`.
 */
export const isPromise = (value) => isP(value);
export const isClass = (cls) => {
    if (typeof (cls) === 'function' && 'prototype' in cls) {
        try {
            cls.arguments && cls.caller;
        } catch (e) {
            return true;
        }
    }
    return false;
};

/** @type {(obj: any?) => obj is { constructor: class}} */
export const hasConstructor = (obj) => notNil(obj) && (typeof obj === 'object' || typeof obj === 'function') && 'constructor' in obj && isFunction(obj['constructor'])
/** @type {(obj: any?) => obj is { prototype: {constructor: class}}} */
export const hasPrototype = (obj) => notNil(obj) && (typeof obj === 'object' || typeof obj === 'function') && 'prototype' in obj && typeof obj['prototype'] === 'object'

/** @type {(cls: any?) => cls is {constructor: Function} & {prototype: Object} & Function} */
export const isLikelyClassDeclaration = (cls) => typeof cls === 'function' && hasConstructor(cls) && hasPrototype(cls)

/** @type {(obj: any?) => obj is {constructor: Function & {prototype: {constructor: Function & {prototype: any}}}}} */
export const isLikelyClassInstance = (obj) => {
    if (hasConstructor(obj) &&
        hasPrototype(obj['constructor'] &&
            hasConstructor(obj['constructor']['prototype'])) &&
        obj.constructor.prototype.constructor === obj.constructor) {
        return true
    }

    return false
}

export const isPrimitive = (value) => ['boolean', 'number', 'string'].includes(typeof value)

/** Used for built-in method references. */
const objectProto = Object.prototype

/**
 * Checks if `value` is likely a prototype object.
 *
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
export const isLikelyPrototype = (value) => {
    const Ctor = value && value.constructor
    const proto = (typeof Ctor === 'function' && Ctor.prototype) || objectProto

    return value === proto
}

export const isSymbol = (value) => notNil(value) && (typeof value === 'symbol' || isSymbolObject(value))
/**
 * Gets an ISO String timestamp with all special characters removed.
 * @returns {string} The date string.
 */
export const getTimestamp = () => new Date().toISOString().replace(timestampStripper, '')

/**
 * The `inspect()` method returns a string representation of `object` that is
 * intended for debugging. The output of `util.inspect` may change at any time
 * and should not be depended upon programmatically. Additional `options` may be
 * passed that alter the result.`util.inspect()` will use the constructor's name and/or `@@toStringTag` to make
 * an identifiable tag for an inspected value.
 *
 * ```js
 * class Foo {
 *   get [Symbol.toStringTag]() {
 *     return 'bar';
 *   }
 * }
 *
 * class Bar {}
 *
 * const baz = Object.create(null, { [Symbol.toStringTag]: { value: 'foo' } });
 *
 * util.inspect(new Foo()); // 'Foo [bar] {}'
 * util.inspect(new Bar()); // 'Bar {}'
 * util.inspect(baz);       // '[foo] {}'
 * ```
 *
 * Circular references point to their anchor by using a reference index:
 *
 * ```js
 * const { inspect } = require('util');
 *
 * const obj = {};
 * obj.a = [obj];
 * obj.b = {};
 * obj.b.inner = obj.b;
 * obj.b.obj = obj;
 *
 * console.log(inspect(obj));
 * // <ref *1> {
 * //   a: [ [Circular *1] ],
 * //   b: <ref *2> { inner: [Circular *2], obj: [Circular *1] }
 * // }
 * ```
 *
 * The following example inspects all properties of the `util` object:
 *
 * ```js
 * const util = require('util');
 *
 * console.log(util.inspect(util, { showHidden: true, depth: null }));
 * ```
 *
 * The following example highlights the effect of the `compact` option:
 *
 * ```js
 * const util = require('util');
 *
 * const o = {
 *   a: [1, 2, [[
 *     'Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit, sed do ' +
 *       'eiusmod \ntempor incididunt ut labore et dolore magna aliqua.',
 *     'test',
 *     'foo']], 4],
 *   b: new Map([['za', 1], ['zb', 'test']])
 * };
 * console.log(util.inspect(o, { compact: true, depth: 5, breakLength: 80 }));
 *
 * // { a:
 * //   [ 1,
 * //     2,
 * //     [ [ 'Lorem ipsum dolor sit amet,\nconsectetur [...]', // A long line
 * //           'test',
 * //           'foo' ] ],
 * //     4 ],
 * //   b: Map(2) { 'za' => 1, 'zb' => 'test' } }
 *
 * // Setting `compact` to false or an integer creates more reader friendly output.
 * console.log(util.inspect(o, { compact: false, depth: 5, breakLength: 80 }));
 *
 * // {
 * //   a: [
 * //     1,
 * //     2,
 * //     [
 * //       [
 * //         'Lorem ipsum dolor sit amet,\n' +
 * //           'consectetur adipiscing elit, sed do eiusmod \n' +
 * //           'tempor incididunt ut labore et dolore magna aliqua.',
 * //         'test',
 * //         'foo'
 * //       ]
 * //     ],
 * //     4
 * //   ],
 * //   b: Map(2) {
 * //     'za' => 1,
 * //     'zb' => 'test'
 * //   }
 * // }
 *
 * // Setting `breakLength` to e.g. 150 will print the "Lorem ipsum" text in a
 * // single line.
 * ```
 *
 * The `showHidden` option allows [`WeakMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) and
 * [`WeakSet`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet) entries to be
 * inspected. If there are more entries than `maxArrayLength`, there is no
 * guarantee which entries are displayed. That means retrieving the same [`WeakSet`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet) entries twice may
 * result in different output. Furthermore, entries
 * with no remaining strong references may be garbage collected at any time.
 *
 * ```js
 * const { inspect } = require('util');
 *
 * const obj = { a: 1 };
 * const obj2 = { b: 2 };
 * const weakSet = new WeakSet([obj, obj2]);
 *
 * console.log(inspect(weakSet, { showHidden: true }));
 * // WeakSet { { a: 1 }, { b: 2 } }
 * ```
 *
 * The `sorted` option ensures that an object's property insertion order does not
 * impact the result of `util.inspect()`.
 *
 * ```js
 * const { inspect } = require('util');
 * const assert = require('assert');
 *
 * const o1 = {
 *   b: [2, 3, 1],
 *   a: '`a` comes before `b`',
 *   c: new Set([2, 3, 1])
 * };
 * console.log(inspect(o1, { sorted: true }));
 * // { a: '`a` comes before `b`', b: [ 2, 3, 1 ], c: Set(3) { 1, 2, 3 } }
 * console.log(inspect(o1, { sorted: (a, b) => b.localeCompare(a) }));
 * // { c: Set(3) { 3, 2, 1 }, b: [ 2, 3, 1 ], a: '`a` comes before `b`' }
 *
 * const o2 = {
 *   c: new Set([2, 1, 3]),
 *   a: '`a` comes before `b`',
 *   b: [2, 3, 1]
 * };
 * assert.strict.equal(
 *   inspect(o1, { sorted: true }),
 *   inspect(o2, { sorted: true })
 * );
 * ```
 *
 * `util.inspect()` is a synchronous method intended for debugging. Its maximum
 * output length is approximately 128 MB. Inputs that result in longer output will
 * be truncated.
 * @param {any?} obj Any JavaScript primitive or `Object`.
 * @param {{showHidden?: boolean, depth?: number | null, color?: boolean}} opts
 * @return {string} The representation of `object`.
 */
export const inspect = (obj, { showHidden = true, depth = null, color = true }) => ins(obj, showHidden, depth, color);

/**
 * Calculates the hash of any value or object.
 * @param {any?} value The value to hash.
 * @returns {string} The hashed value.
 */
export const hashAny = (value) => hasher(value)

/**
 * Attempts to call the function indicated by `key` on the given `input. Returns the
 * result of the call, or `undefined` if the function has no return value. Returns
 * null if the function does not exist or errored during execution.
 * @template TInput The type of the input object to this function.
 * @template TReturn The return type of called function.
 * @param {TInput} input The object with the property to call.
 * @param {keyof TInput} key The key of `input` to call.
 * @param  {...any} args Any additional arguments 
 * @returns {TReturn | undefined } The return value of the called function, or undefined if function could not be called or errored during execution.
 */
export const tryCall = (input, key, ...args) => {
    const fn = input[key]
    if (!isFunction(fn)) {
        PrettyLogger.global().warn(`${key} is not a function or has the wrong number of arguments.`)
    }

    try {
        if (fn.length !== args.length) {
            PrettyLogger.global().warn(`Argument mismatch for function '${fn.name}': Expected ${fn.length} but ${args.length} were provided. Attempting call...`)
        }
        const result = fn(...args)
        return result
    } catch (err) {
        PrettyLogger.global().error(`Error calling function '${fn.name}': ${err}`)
    }

    return null
}

/**
 * Same as `utils.tryCall` but with fewer checks and no logging. Won't fail but won't 
 * let you know if it would have.
 * Attempts to call the function indicated by `key` on the given `input. Returns the
 * result of the call, or `undefined` if the function has no return value. Returns
 * null if the function does not exist or errored during execution.
 * @template TInput The type of the input object to this function.
 * @template TReturn The return type of called function.
 * @param {TInput} input The object with the property to call.
 * @param {keyof TInput} key The key of `input` to call.
 * @param  {...any} args Any additional arguments 
 * @returns {TReturn | undefined } The return value of the called function, or undefined if function could not be called or errored during execution.
 */
export const tryCallFast = (input, key, ...args) => {
    let result = undefined
    try {
        result = input[key](...args)
    } catch (err) {

    }

    return result
}

/**
 * Runs `fn` inside of a scope, calling `dispose` when complete, whether
 * through normal execution or exception.
 * @param {(...args) => void} dispose The function to call when the scope is exited.
 * @param {(...args) => unknown} fn The function to call inside of the scope.
 */
export const scoped = (dispose, fn) => {
    let didThrow = false
    let result = undefined
    try {
        result = fn()
    } catch (err) {
        didThrow = true
        result = err
    } finally {
        dispose()
    }

    if (didThrow) {
        throw result
    } else {
        return result
    }
}

// ===================
// Extension Functions

/**
 * Hash the current object.
 * @param {any?} self The self Object.
 * @returns {string} The string hash.
 */
const hashCode = (self) => hasher(self)

/**
 * Determine if the current object is equal to `{}`.
 * @param {any?} self The self Object.
 * @returns {boolean} True if this object is default, false otherwise.
 */
const isDefault = (self) => hashCode(self) === hashCode({})

const objInspect = (self, showHidden = true, depth = null, color = true) => ins(self, showHidden, depth, color)

/**
 * Tap allows one to perform a one-time action in the middle of processing
 * an array in a chain of method calls.
 * 
 * Example:
 * ```js
 * const array = [1, 2, 3, 4, 5, 6, 7, 8]
 * array
 *   .map(x => x * 2)
 *   .tap(xs => console.log('Multiplied each array member by 2!'))
 *   .filter(x => x % 3 === 0)
 *   .tap(xs => console.log(`Filtered out all numbers that are not divisible by 3! There are ${xs.length} value remaining.`))
 *   .forEach(x => doSomethingWith(x))
 * ```
 * @param {Array<unknown>} self The array to tap.
 * @param {(fn: Function) => Array<unknown>} fn The function to perform, it will receive the current array as its argument.
 * @returns This array unchanged.
 */
const tap = (self, fn) => {
    fn(self)
    return self
}

/**
 * @template {TResult} TResult The result of a successful function.
 * @template {TError} TError The error type thrown on failure.
 * @param {Function} self The function object to call.
 * @param  {...any} args The args to pass to this `Function`.
 * @returns {TResult | TError } The result of the `Function`.
 */
const runCatching = (self, ...args) => {
    try {
        const result = self(...args)
        return result
    } catch (err) {
        return err
    }
}

/**
 * @template {TResult} TResult The result of a successful function.
 * @template {TError} TError The error type thrown on failure.
 * @param {Function} self The function object to call.
 * @param  {...any} args The args to pass to this `Function`.
 * @returns {Promise<TResult | TError>} The result of the `Function`.
 */
const runCatchingAsync = async (self, ...args) => {
    let result = undefined
    try {
        result = self(...args)
    } catch (err) {
        return Promise.resolve(err)
    }

    if (isPromise(result) || isPromiseLike(result)) {
        return await result
    }
    return result
}

/**
 * Calculates the hash for **this string** using the same algorithm as
 * the java language uses. Not secure.
 * @param {string} self This string.
 * @returns {number} The hash code for this string.
 */
const jvmHash = (self) => {
    let hash = 0, i = 0, chr
    if (self.length === 0) return hash
    for (i = 0; i < self.length; i++) {
        chr = self.charCodeAt(i)
        hash = ((hash << 5) - hash) + chr
        hash |= 0
    }
    return hash
}
/**
 * Uses the cyrb53 hash algorithm to calculate the hash for **this string**.
 * @link [`Stack Overflow Duh`](https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript?rq=1)
 * @param {string} self This string.
 * @param {number} seed The (optional) seed to use for the hash.
 * @returns The hash code for this string.
 */
const cyrbHash = (self, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < self.length; i++) {
        ch = self.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

/** 
 * Pads the start and end of this string aka centers this string.
 * @param {number} len The desired length of the string.
 * @param {string?} ch The character(s) to use for padding.
 */
export const lodashPadCenter = pad
export const lodashPadStart = padStart
export const lodashPadEnd = padEnd

export const extensionMethods = {
    'object': {
        hashCode: (self) => hashCode(self),
        isDefault: (self) => isDefault(self),
        inspect: (self, showHidden = true, depth = null, color = true) => objInspect(self, showHidden, depth, color),
    },
    'array': {
        tap: (self, fn) => tap.call(self, fn),
    },
    'string': {
        jvmHash: (self) => jvmHash(self),
        cyrbHash: (self, seed) => cyrbHash(self, seed),
        lodashPadStart: (self, len, chars = ' ') => lodashPadStart(self, len, chars),
        padCenter: (self, len, chars = ' ') => pad(self, len, chars),
        lodashPadEnd: (self, len, chars = ' ') => lodashPadEnd(self, len, chars),
    },
    'fn': {
        runCatching: (self, ...args) => runCatching(self, ...args),
        runCatchingAsync: async (self, ...args) => runCatchingAsync(self, ...args),
    },
}

/**
 * Applies extension methods to built-in types.
 * 
 * Object:
 *  - `hashCode()` - Calculates the hash code for this object.
 *  - `isDefault()` - Returns true if this object is equal to `{}`.
 * 
 * Array:
 *  - `tap` - Execute a function one time, useful within a chain of array function calls.
 * 
 * String:
 *  - `jvmHash` - Calculates the hash for this string using the same algorithm as the java language uses. Not secure.
 *  - `cyrbHash` - Uses the cyrb53 hash algorithm to calculate the hash for this string.
 *  - `hashCode` - Calculates the hash for this string (currently uses `jvmHash`).
 *  - `padCenter` - Pads the start and end of this string so that it is centered.
 *  - `lodashPadStart` - Pads the start of the string using the 'lodash' library.
 *  - `lodashPadEnd` - Pads the end of the string using the 'lodash' library.
 * 
 * Function:
 *  - `runCatching` - Attempts to run this function, returning the result or the error if it fails.
 *  - `runCatchingAsync` - Attempts to run this function, returning the result or the error if it fails.
 * 
 */
export const applyExtensions = () => {
    const hasCounter = '_extensionCounter' in Object.prototype
    if (hasCounter && Object.prototype._extensionCounter > 0) {
        Object.prototype._extensionCounter += 1
        return
    } else {
        Object.prototype._extensionCounter = 1
    }

    // Object
    if (!('hashCode' in Object.prototype)) {
        Object.prototype.hashCode = function () { return hashAny(this) }
    } else { console.warn('hashCode already exists on Object.prototype') }

    if (!('isDefault' in Object.prototype)) {
        /**
         * Checks whether this object is equal to '{}'.
         * @returns {boolean} True if this object is equal to `{}`.
         */
        Object.prototype.isDefault = function () { return this.hashCode() === hashAny({}) }
    } else { console.warn('isDefault already exists on Object.prototype') }

    if (!('inspect' in Object.prototype)) {
        Object.prototype.inspect = function (self, showHidden = true, depth = null, color = true) {
            return objInspect(self, showHidden, depth, color)
        }
    } else { console.warn('inspect already exists on Object.prototype') }

    // Array
    if (!('tap' in Array.prototype)) {
        Array.prototype.tap = function (fn) { return tap(this, fn) }
    } else { console.warn('tap already exists on Array.prototype') }

    // String
    // We don't check if this already exists since we *should* be overriding
    // the Object version defined above.
    // if (!('hashCode' in String.prototype)) {
    String.prototype.hashCode = function () { return jvmHash(this) }
    // } else { console.warn('hashCode already exists on String.prototype') }

    if (!('jvmHash' in String.prototype)) {
        String.prototype.jvmHash = function () { return jvmHash(this) }
    } else { console.warn('jvmHash already exists on String.prototype') }

    if (!('cyrbHash' in String.prototype)) {
        String.prototype.cyrbHash = function (seed = 0) { return cyrbHash(this, seed) }
    } else { console.warn('cyrbHash already exists on String.prototype') }

    if (!('lodashPadStart' in String.prototype)) {
        String.prototype.lodashPadStart = function (size, chars) { return padStart(this, size, chars) }
    } else { console.warn('lodashPadStart already exists on String.prototype') }

    if (!('padCenter' in String.prototype)) {
        String.prototype.padCenter = function (size, chars) { return lodashPadCenter(this, size, chars) }
    } else { console.warn('padCenter already exists on String.prototype') }

    if (!('lodashPadEnd' in String.prototype)) {
        String.prototype.lodashPadEnd = function (size, chars) { return padEnd(this, size, chars) }
    } else { console.warn('lodashPadEnd already exists on String.prototype') }

    // Function
    if (!('runCatching' in Function.prototype)) {
        Function.prototype.runCatching = function (...args) { return runCatching(this, ...args) }
    } else { console.warn('runCatching already exists on Function.prototype') }

    if (!('runCatchingAsync' in Function.prototype)) {
        Function.prototype.runCatchingAsync = async function (...args) { return runCatchingAsync(this, ...args) }

    } else { console.warn('runCatchingAsync already exists on Function.prototype') }
}

/**
 * Removes all extension methods added by `applyExtensions`.
 */
export const removeExtensions = () => {
    const hasCounter = '_extensionCounter' in Object.prototype
    if (!hasCounter) {
        console.error(`removeExtensions called but _extensionCounter doesn't exist on Object.prototype`)
    } else if (Object.prototype._extensionCounter < 1) {
        console.error(`removeExtensions called but _extensionCounter is 0`)
    } else if (Object.prototype._extensionCounter > 1) {
        Object.prototype._extensionCounter -= 1
        return
    } else {
        Object.prototype._extensionCounter = 0
    }

    // Object
    if ('hashCode' in Object.prototype) {
        delete Object.prototype.hashCode
    } else { console.warn('hashCode does not exist on Object.prototype') }

    if ('isDefault' in Object.prototype) {
        delete Object.prototype.isDefault
    } else { console.warn('isDefault does not exist on Object.prototype') }

    if ('inspect' in Object.prototype) {
        delete Object.prototype.inspect
    } else { console.warn('inspect does not exist on Object.prototype') }

    // Array
    if ('tap' in Array.prototype) {
        delete Array.prototype.tap
    } else { console.warn('tap does not exist on Array.prototype') }

    // String
    // We don't check if this does not exist since we *should* be overriding
    // the Object version defined above.
    // if ('hashCode' in String.prototype) {
    delete String.prototype.hashCode
    // } else { console.warn('hashCode does not exist on String.prototype') }

    if ('jvmHash' in String.prototype) {
        delete String.prototype.jvmHash
    } else { console.warn('jvmHash does not exist on String.prototype') }

    if ('cyrbHash' in String.prototype) {
        delete String.prototype.cyrbHash
    } else { console.warn('cyrbHash does not exist on String.prototype') }

    if ('lodashPadStart' in String.prototype) {
        delete String.prototype.lodashPadStart
    } else { console.warn('lodashPadStart does not exist on String.prototype') }

    if ('padCenter' in String.prototype) {
        delete String.prototype.padCenter
    } else { console.warn('padCenter does not exist on String.prototype') }

    if ('lodashPadEnd' in String.prototype) {
        delete String.prototype.lodashPadEnd
    } else { console.warn('lodashPadEnd does not exist on String.prototype') }

    // Function
    if ('runCatching' in Function.prototype) {
        delete Function.prototype.runCatching
    } else { console.warn('runCatching does not exist on Function.prototype') }

    if ('runCatchingAsync' in Function.prototype) {
        delete Function.prototype.runCatchingAsync
    } else { console.warn('runCatchingAsync does not exist on Function.prototype') }
}

/**
 * Delays the current function for the given number of `ms`.
 * 
 * Example:
 * ```js
 * const { delay } = require('./util.js');
 * console.log('Started!');
 * await delay(1000);
 * console.log('One second later!');
 * ```
 * @param {number?} ms The number of milliseconds to delay.
 * @returns A promise that resolves when the time has counted down.
 */
export const delay = ms => new Promise(res => setTimeout(res, ms))

/**
 * Wait for any key to be pressed by the user.
 * 
 * Example:
 * ```js
 * import { waitForKey } from './util.js';
 * console.log('Press any key to continue...');
 * await waitForKey();
 * console.log('Continuing!');
 * ```
 * @returns A promise that resolves when the user presses any key.
 */
export const waitForAnyKey = async () => {
    process.stdin.setRawMode(true)
    return new Promise(resolve => process.stdin.once('data', () => {
        process.stdin.setRawMode(false)
        resolve()
    }))
}

/**
 * Delay the current execution until the user presses any key,
 * or terminates the process if the user presses `Ctrl+C`.
 * @returns A promise that resolves when the user presses any key, or terminates the process if the user presses `Ctrl+C`.
 */
export const waitForAnyKeyOrCtrlC = async () => {
    process.stdin.setRawMode(true)
    return new Promise(resolve => process.stdin.once('data', data => {
        const byteArray = [...data]
        if (byteArray.length > 0 && byteArray[0] === 3) {
            console.log('^C')
            process.exit(1)
        }
        process.stdin.setRawMode(false)
        resolve()
    }))
}

const functions = {
    waitForAnyKey, waitForAnyKeyOrCtrlC, scoped,
    delay, isAsyncFunction, getTimestamp, isBool, getTag, isObjectLike, isString, isNil, notNil, isSymbol, isLikelyClassDeclaration, isLikelyClassInstance,
    isFunction, isNumber, inspect, isPromise, isPromiseLike, tryCall, tryCallFast, hasConstructor, hasPrototype, isLikelyPrototype, isSymbol
}

/**
 * Launch the given function within a service provider context. This will automatically
 * create a logger with the given name, apply utility extension functions, and set up
 * a service provider Container.
 * @template Result The return value of the executed function.
 * @param {string?} name The name to assign to this launch context.
 * @param {(context: {utils: typeof functions; logger: PrettyLogger; container: Container, project: typeof project}) => Result?} fn The main function to execute in this context.
 * @return {Result?} The result of the executed function.
 */
export const launch = async (name, fn) => {
    applyExtensions()
    const utils = { ...functions }
    const container = new Container(name ?? 'Launch')
    /** @type {PrettyLogger} */
    const logger = container.get(PrettyLogger)
    const context = { utils, container, logger, project }

    let didThrow = false
    let result = undefined
    try {
        result = fn(context)
        if (isPromise(result) || isPromiseLike(result) || isAsyncFunction(fn)) {
            result = await result
        }
    } catch (err) {
        context.logger.error(`Error occurred during launch: ${err}`)
        didThrow = true
        result = err
    } finally {
        removeExtensions()
        if (didThrow) {
            throw result
        } else {
            return result
        }
    }
}
