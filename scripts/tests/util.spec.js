// Copyright (c) 2022 Tony Barbitta
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { expect, assert } from 'chai'
import { utils } from 'mocha'
import { delay } from 'rxjs'

import * as util from '../util.js'

describe('util tests', () => {
    describe('isString tests', () => {
        it('should catch primitive string', () => assert.isTrue(util.isString('string')))

        it('should catch String objects', () => assert.isTrue(util.isString(new String('string'))))

        it('should reject any other value', () => {
            assert.isFalse(util.isString(null))
            assert.isFalse(util.isString(1))
            assert.isFalse(util.isString(true))
            assert.isFalse(util.isString({}))
        })
    })

    describe('isNumber tests', () => {
        it('should catch primitive numbers', () => {
            assert.isTrue(util.isNumber(1))
            assert.isTrue(util.isNumber(0))
            assert.isTrue(util.isNumber(3.14))
        })

        it('should catch Number objects', () => {
            assert.isTrue(util.isNumber(new Number(1)))
            assert.isTrue(util.isNumber(new Number(0)))
            assert.isTrue(util.isNumber(new Number(3.14)))
        })

        it('should reject any other value', () => {
            assert.isFalse(util.isNumber(null))
            assert.isFalse(util.isNumber('hello'))
            assert.isFalse(util.isNumber(true))
            assert.isFalse(util.isNumber({}))
            assert.isFalse(util.isNumber([]))
            assert.isFalse(util.isNumber(new Object()))
        })
    })

    describe('isFunction tests', () => {
        it('should accept lambdas', () => assert.isTrue(util.isFunction(() => { })))
        it('should accept function refs', () => assert.isTrue(util.isFunction(Object.prototype.constructor)))
        it('should accept constructors', () => assert.isTrue(util.isFunction(String)))
        it('should reject any other value', () => {
            assert.isFalse(util.isFunction(null), 'null is not a function')
            assert.isFalse(util.isFunction(undefined), 'undefined is not a function')
            assert.isFalse(util.isFunction(1), '1 is not a function')
            assert.isFalse(util.isFunction('hello'), 'hello is not a function')
            assert.isFalse(util.isFunction({}), '{} is not a function')
        })
    })

    describe('isNil / notNil tests', () => {
        it('should detect/reject null', () => {
            assert.isTrue(util.isNil(null))
            assert.isFalse(util.notNil(null))
        })
        it('should detect/reject undefined', () => {
            assert.isTrue(util.isNil(undefined))
            assert.isFalse(util.notNil(undefined))
        })
        it('should reject/detect {}}', () => {
            assert.isFalse(util.isNil({}))
            assert.isTrue(util.notNil({}))
        })
    })

    describe('isObjectLike tests', () => {
        it('accepts empty object', () => util.isObjectLike({}))
        it('accepts arrays', () => util.isObjectLike([1, 2, 3]))
        it('rejects constructors', () => util.isObjectLike(String))
        it('rejects nulls', () => util.isObjectLike(null))
    })

    describe('getTimestamp tests', () => {
        it('should strip all special characters', () => {
            assert.isFalse(util.getTimestamp().includes('-'))
            assert.isFalse(util.getTimestamp().includes(':'))
        })
    })

    describe('launch tests', () => {
        it('should work', () => {
            util.launch('LaunchTests', (ctx) => {
                assert.isOk(ctx.logger)
                assert.isOk(ctx.utils)
                assert.isOk(ctx.container)

                assert.isTrue(ctx.utils.isBool(true))
                const m = new Map()
                assert.isNotOk(ctx.container.get(Map))
                ctx.container.put(m)
                assert.isOk(ctx.container.get(Map))
            })
        })

        it('should handle async functions', (done) => {
            util.launch('LaunchTests', async (ctx) => {
                assert.isOk(ctx.logger)
                assert.isOk(ctx.utils)
                assert.isOk(ctx.container)

                assert.isTrue(ctx.utils.isBool(true))
                const m = new Map()
                assert.isNotOk(ctx.container.get(Map))
                ctx.container.put(m)
                assert.isOk(ctx.container.get(Map))
                let value = 0
                setTimeout(() => value = 1, 500)
                await util.delay(500)
                assert.throws(() => { throw new Error('Error!') })
                assert.isTrue(value === 1)
                console.log(value)
                assert.isTrue(ctx.utils.isBool(true))
                ctx.logger.info('After delay!')
                done()
            })
        })
    })

    describe('extension method tests', () => {
        const assertExtMethodsEnabled = () => {
            const { array, fn, object, string } = util.extensionMethods
            assert.containsAllKeys(Array.prototype, array, 'Array.prototype should contain extension methods.')
            assert.containsAllKeys(String.prototype, string, 'String.prototype should contain extension methods.')
            assert.containsAllKeys(Function.prototype, fn, 'Function.prototype should contain extension methods.')
            assert.containsAllKeys(Object.prototype, object, 'Object.prototype should contain extension methods.')
        }

        const assertExtMethodsDisabled = () => {
            const { array, fn, object, string } = util.extensionMethods
            assert.doesNotHaveAnyKeys(Array.prototype, array, 'Array.prototype should not contain extension methods.')
            assert.doesNotHaveAnyKeys(String.prototype, string, 'String.prototype should not contain extension methods.')
            assert.doesNotHaveAnyKeys(Function.prototype, fn, 'Function.prototype should not contain extension methods.')
            assert.doesNotHaveAnyKeys(Object.prototype, object, 'Object.prototype should not contain extension methods.')
        }

        beforeEach(() => {
            assertExtMethodsDisabled()
            util.applyExtensions()
            assertExtMethodsEnabled()
        })

        afterEach(() => {
            assertExtMethodsEnabled()
            util.removeExtensions()
            assertExtMethodsDisabled()
        })

        // These tests are kind of pointless now that I've added the above `beforeEach` and `afterEach` hooks.
        describe('apply/remove-Extensions tests', () => {
            it('should apply extension methods', () => {
                assertExtMethodsEnabled()
            })

            it('should remove extension methods', () => {
                assertExtMethodsEnabled()
            })

            it('should properly track extension calls', () => {
                const NUM_CALLS = 50;
                [...Array(50).keys()].forEach(() => util.applyExtensions())
                assertExtMethodsEnabled()
                assert.containsAllKeys(Object.prototype, ['_extensionCounter'], 'Object.prototype should contain extension counter.');
                assert.equal(Object.prototype._extensionCounter, NUM_CALLS + 1, 'Object.prototype._extensionCounter should be 50.');

                [...Array(NUM_CALLS - 1).keys()].forEach(() => util.removeExtensions())
                assertExtMethodsEnabled()
                assert.containsAllKeys(Object.prototype, ['_extensionCounter'], 'Object.prototype should contain extension counter.');
                assert.equal(Object.prototype._extensionCounter, 2, 'Object.prototype._extensionCounter should be 50.');
                util.removeExtensions()
            })
        })

        describe('Object extensions', () => {
            describe('hashCode tests', () => {
                beforeEach(() => assert.isTrue('hashCode' in Object.prototype))

                it('should produce the same hash for all empty objects', () => {
                    const mo = () => new Object();
                    const EMPTY = new Object();

                    const obj = Object.create(Object.prototype);
                    const objs = [mo(), mo(), mo(), mo(), mo(), mo()];
                    assert.equal(util.hashAny(obj), util.hashAny(EMPTY));
                    objs.forEach(o => assert.equal(util.hashAny(o), util.hashAny(EMPTY)));
                })

                it('should hash any type of object', () => {
                    const assertStringAndNotEmpty = (value) => assert.isString(value) && assert.isNotEmpty(value)
                    assertStringAndNotEmpty(util.hashAny(Object))
                    assertStringAndNotEmpty(util.hashAny(() => 4))
                    assertStringAndNotEmpty(util.hashAny(new Date()))
                    assertStringAndNotEmpty(util.hashAny('hello'))
                })
            })

            describe('inspect tests', () => {
                it('inspect should exist and work', () => {
                    assert.isTrue(Object.prototype.isPrototypeOf(Map))
                    assert.isTrue('hashCode' in Object.prototype)
                    assert.isTrue('inspect' in Object.prototype)
                    const map = new Map()
                    assert.isTrue('inspect' in map)
                    assert.isFunction(map.inspect)
                    assert.isFunction(map.hashCode)
                    assert.isString(map.inspect())
                    assert.isNotEmpty(map.inspect())
                })
            })

            describe('isDefault tests', () => {
                it('isDefault should exist and work', () => {
                    assert.isTrue(Object.prototype.isPrototypeOf(Map))
                    assert.isTrue('hashCode' in Object.prototype)
                    assert.isTrue('isDefault' in Object.prototype)
                    const map = new Map()
                    assert.isTrue('isDefault' in map)
                    assert.isFunction(map.isDefault)
                    assert.isFunction(map.hashCode)
                    assert.isFalse(map.isDefault())
                    const obj = new Object()
                    assert.isTrue('isDefault' in obj)
                    assert.isTrue(obj.isDefault())
                })
            })
        })
    })
})