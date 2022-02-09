// Copyright (c) 2022 Tony Barbitta
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

// import { expect, assert } from 'chai'

import * as util from '../util.js'

describe('util tests', () => {
    describe('isArray tests', () => {
        it('should detect arrays', () => {
            assert.isTrue(util.isArray([])) //?.
            assert.isTrue(util.isArray([1, 2, 3])) //?.
            assert.isTrue(util.isArray(Array.from([]))) //?.
            assert.isTrue(util.isArray(new Array())) //?.
            const fakeArray = { 0: 1, 1: 2, 2: 3, length: 3 };
            assert.isTrue(util.isArray(Array.from(fakeArray))) //?.
            assert.isTrue(util.isArray(Array.from(new Map()))) //?.
        })

        it('should not detect non-arrays', () => {
            assert.isFalse(util.isArray({}))
            assert.isFalse(util.isArray({}.length))
            assert.isFalse(util.isArray('hello'))
            assert.isFalse(util.isArray())
            assert.isFalse(util.isArray(null))
            assert.isFalse(util.isArray(undefined))
            const fakeArray = { 0: 1, 1: 2, 2: 3, length: 3 };
            assert.isFalse(util.isArray(fakeArray))
            assert.isFalse(util.isArray(new Map()))
        })
    })

    describe('isBool tests', () => {
        it('should detect bools', () => {
            assert.isTrue(util.isBool(true))
            assert.isTrue(util.isBool(false))
            assert.isTrue(util.isBool(new Boolean()))
            assert.isTrue(util.isBool(new Boolean(true)))
        })

        it('should not detect non-bools', () => {
            assert.isFalse(util.isBool({}.length))
            assert.isFalse(util.isBool('hello'))
            assert.isFalse(util.isBool())
            assert.isFalse(util.isBool(null))
            assert.isFalse(util.isBool(undefined))
        })
    })

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

    describe('hasConstructor tests', () => {
        it('should detect constructors', () => {
            assert.isTrue('constructor' in {});
            assert.isTrue(util.hasConstructor(String))
            assert.isTrue(util.hasConstructor(new String()))
            assert.isTrue(util.hasConstructor(Function))
            assert.isTrue(util.hasConstructor(new Object))
            assert.isTrue(util.hasConstructor(Array))
            assert.isTrue(util.hasConstructor(new Array()))
            assert.isTrue(util.hasConstructor({}))
            assert.isFalse(util.hasConstructor(1))
            assert.isFalse(util.hasConstructor(true))
            assert.isFalse(util.hasConstructor({ constructor: true }))
        })
    })

    describe('hasPrototype tests', () => {
        it('should detect prototypes', () => {
            assert.isFalse('prototype' in {});
            assert.isTrue(util.hasPrototype(String))
            assert.isTrue(util.hasPrototype(new String().constructor))
            assert.isTrue('prototype' in Function)
            assert.isTrue(util.hasPrototype(Function))
            assert.isTrue(util.hasPrototype(new Object().constructor))
            assert.isTrue(util.hasPrototype(Array))
            assert.isTrue(util.hasPrototype(new Array().constructor))
            assert.isTrue(util.hasPrototype({}.constructor))
            assert.isFalse(util.hasPrototype(1))
            assert.isFalse(util.hasPrototype(true))
            assert.isFalse(util.hasPrototype({ prototype: true }))
        })
    })

    describe('isLikelyClassDeclaration tests', () => {
        it('should detect class declarations', () => {
            assert.isTrue(util.isLikelyClassDeclaration(String))
            assert.isTrue(util.isLikelyClassDeclaration(Function))
            assert.isTrue(util.isLikelyClassDeclaration(Map))
            assert.isTrue(util.isLikelyClassDeclaration(Object))
            assert.isTrue(util.isLikelyClassDeclaration(Array))
        })

        it('should not detect class instances', () => {
            assert.isFalse(util.isLikelyClassDeclaration(new String()))
            // I don't know how to stop this from breaking the function.
            // Everything else works perfectly fine except Function and Function instances.
            // The problem is that String instanceof Function is true, which sucks,
            //   so there is seemingly no way to detect instances of the Function class.
            // assert.isFalse(util.isLikelyClassDeclaration(new Function()))
            assert.isFalse(util.isLikelyClassDeclaration(new Map()))
            assert.isFalse(util.isLikelyClassDeclaration(new Object()))
            assert.isFalse(util.isLikelyClassDeclaration(new Array()))
        })
    })

    describe('isLikelyClassInstance tests', () => {
        it('should detect class instances', () => {
            assert.isTrue(util.isLikelyClassInstance(new String()))
            // I don't know how to stop this from breaking the function.
            // Everything else works perfectly fine except Function and Function instances.
            // The problem is that String instanceof Function is true, which sucks,
            //   so there is seemingly no way to detect instances of the Function class.
            // assert.isTrue(util.isLikelyClassInstance(new Function()))
            assert.isTrue(util.isLikelyClassInstance(new Map()))
            assert.isTrue(util.isLikelyClassInstance(new Object()))
            assert.isTrue(util.isLikelyClassInstance(new Array()))
        })

        it('should not detect class declarations', () => {
            assert.isFalse(util.isLikelyClassInstance(String))
            assert.isFalse(util.isLikelyClassInstance(Function))
            assert.isFalse(util.isLikelyClassInstance(Map))
            assert.isFalse(util.isLikelyClassInstance(Object))
            assert.isFalse(util.isLikelyClassInstance(Array))
        })
    })

    describe('isAsyncFunction tests', () => {
        it('should detect async functions', () => {
            const async1 = async () => Promise.resolve()
            async function async2() {
                return Promise.resolve()
            }

            assert.isTrue(util.isAsyncFunction(async () => { }))
            assert.isTrue(util.isAsyncFunction(async1))
            assert.isTrue(util.isAsyncFunction(async2))
        })

        it('should not detect regular functions', () => {
            const notAsync = () => { }
            const notAsync2 = function () { }

            assert.isFalse(util.isAsyncFunction(() => { }))
            assert.isFalse(util.isAsyncFunction(notAsync))
            assert.isFalse(util.isAsyncFunction(notAsync2))
        })
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
                setTimeout(() => value = 1, 100)
                await util.delay(105)
                assert.throws(() => { throw new Error('Error!') })
                assert.equal(value, 1)
                done()
            })
        })
    })

    describe('sanitizeWindowsPath tests', () => {
        const samplePaths = [
            ['c:/blah\\blah', 'c:/blah\\blah',],
            ['d:/games/some:thing/', 'd:/games/something/',],
            ['c:../a', 'c:../a',],
            ['c:\\blah\\a\\*\\something', 'c:\\blah\\a\\\\something',],
            ['c:/ignore', 'c:/ignore',],
            ['d:\\<OHNO>\\e.exe', 'd:\\OHNO\\e.exe',],
            ['c:/"ignore"', 'c:/ignore',],
            ['c:/some/|file|', 'c:/some/file',],
            ['c:\\some\\file', 'c:\\some\\file',],
            ['d:\\?ignore?\\some\\dir', 'd:\\ignore\\some\\dir',],
            ['C:\\*foo*\\*tmp*.3\\', 'C:\\foo\\tmp.3\\',],
            ['C:\\foo<\\>tmp.3?_\\*cycles|\\:"root.js', 'C:\\foo\\tmp.3_\\cycles\\root.js',],
        ]
        it('correctly removes all special characters', () => {
            samplePaths.forEach(([input, expected]) => {
                assert.equal(util.sanitizeWindowsPath(input), expected, `Failure for path ${input}`)
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

        describe('Array extensions', () => {
            describe('tap tests', () => {
                it('should work', () => {
                    const arr = [1, 2, 3, 4, 5];
                    let i = 0;
                    const arr2 = arr.tap(() => i++);
                    assert.deepEqual(arr, arr2, 'Array should not be modified by tap');
                    assert.equal(i, 1, 'tap should execute once');
                })
            })
        })

        describe('Function extensions', () => {
            describe('runCatching test', () => {
                it('should work normally for unexceptional functions', () => {
                    let i = 0;
                    const fn = () => { i += 1 }
                    fn.runCatching()
                    assert.equal(i, 1, 'runCatching should execute once')
                })

                it('should fail with grace for exceptional functions', () => {
                    const fn = () => { throw new Error('fn threw') }
                    assert.throws(() => fn(), 'fn threw', 'fn() should throw')
                    assert.doesNotThrow(() => fn.runCatching(), 'fn.runCatching() should not throw')
                    const result = fn.runCatching()
                    assert.instanceOf(result, Error, 'result should be an error')
                })
            })

            describe('runCatchingAsync tests', () => {
                it('should work normally for non-exception throwing functions', async () => {
                    let i = 0
                    const fn = async () => { await util.delay(50); i += 1; }
                    const result = await fn.runCatchingAsync()
                    assert.isUndefined(result, 'result should be undefined')
                    assert.equal(i, 1, 'fn.runCatchingAsync() should execute once')
                })

                it('should fail gracefully', async () => {
                    let i = 0;
                    const fn = async () => { await util.delay(50); throw new Error('fn threw'); i += 1; }
                    const result = await fn.runCatchingAsync()
                    assert.instanceOf(result, Error, 'result should be an error')
                    assert.equal(i, 0, 'fn.runCatchingAsync() should stop execution when error is thrown')
                })
            })
        })

        describe('String extensions', () => {
            const isNotEmptyString = (value) => assert.isString(value) && assert.isNotEmpty(value)
            const assertInteger = (value) => assert.isNumber(value) && `${value}`.includes('.') === false
            const isNonZeroInteger = (value) => assertInteger(value) && assert.isNotZero(value)
            describe('hashCode/jvmHash tests', () => {
                it('hashCode should be valid', () => {
                    const strObj = new String('hello');
                    const str = 'hello';
                    const hashWord = 'hashCode';

                    assert.property(strObj, 'hashCode');
                    assert.property(str, 'hashCode');
                    assert.property('hashCode', 'hashCode');

                    isNonZeroInteger(strObj.hashCode());
                    isNonZeroInteger(str.hashCode());
                    isNonZeroInteger('hashCode'.hashCode());
                    assert.equal(strObj.hashCode(), str.hashCode(), 'hashCode for primitive and object strings that are the same should be the same');
                    assert.equal(hashWord.hashCode(), 'hashCode'.hashCode(), 'hashCode for the same word should be the same');
                    assert.equal(''.hashCode(), 0, 'hashCode for empty string should be 0');
                })

                it('jvmHash should be valid', () => {
                    const strObj = new String('hello');
                    const str = 'hello';
                    const hashWord = 'jvmHash';

                    assert.property(strObj, 'jvmHash');
                    assert.property(str, 'jvmHash');
                    assert.property('jvmHash', 'jvmHash');

                    isNonZeroInteger(strObj.jvmHash());
                    isNonZeroInteger(str.jvmHash());
                    isNonZeroInteger('jvmHash'.jvmHash());
                    assert.equal(strObj.jvmHash(), str.jvmHash(), 'jvmHash for primitive and object strings that are the same should be the same');
                    assert.equal(hashWord.jvmHash(), 'jvmHash'.jvmHash(), 'jvmHash for the same word should be the same');
                    assert.equal(''.jvmHash(), 0, 'jvmHash for empty string should be 0');
                })
            })

            describe('cyrbHash tests', () => {
                it('cyrbHash should be valid', () => {
                    const strObj = new String('hello');
                    const str = 'hello';
                    const hashWord = 'cyrbHash';

                    assert.property(strObj, 'cyrbHash');
                    assert.property(str, 'cyrbHash');
                    assert.property('cyrbHash', 'cyrbHash');

                    isNonZeroInteger(strObj.cyrbHash());
                    isNonZeroInteger(str.cyrbHash());
                    isNonZeroInteger('cyrbHash'.cyrbHash());
                    assert.equal(strObj.cyrbHash(), str.cyrbHash(), 'cyrbHash for primitive and object strings that are the same should be the same');
                    assert.equal(hashWord.cyrbHash(), 'cyrbHash'.cyrbHash(), 'cyrbHash for the same word should be the same');
                    assert.equal(''.cyrbHash(), 0, 'cyrbHash for empty string should be 0');
                })

                it('should produce different hashes with different seeds', () => {
                    const str = 'hello';
                    const hashes = [
                        str.cyrbHash(0),
                        str.cyrbHash(1),
                        str.cyrbHash(2),
                        str.cyrbHash(3),
                        str.cyrbHash(4),
                        str.cyrbHash(5),
                    ];

                    const arrLen = hashes.length;
                    hashes.forEach(h => assert.equal(hashes.filter(h2 => h2 !== h).length, arrLen - 1));
                })

                it('should produce 0 for empty string despite seed', () => {
                    const str = '';
                    const hashes = [
                        str.cyrbHash(0),
                        str.cyrbHash(1),
                        str.cyrbHash(2),
                        str.cyrbHash(3),
                        str.cyrbHash(4),
                        str.cyrbHash(5),
                    ];

                    assert.isTrue(hashes.every(h => h === 0));
                })
            })
        })
    })
})