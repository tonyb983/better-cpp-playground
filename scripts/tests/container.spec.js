import chai from 'chai'
const expect = chai.expect
const assert = chai.assert

import { hashAny, inspect } from '../util.js'

import { Container } from '../container.js'

describe('Container tests', () => {
    it('should accept a [string, function] pair', () => {
        const provider = new Container()
        provider.put(['foo', () => 'bar'])
        const foo = provider.get('foo')
        assert.isOk(foo)
        assert.isFunction(foo)
        assert.equal(foo(), 'bar')

        const sym = Symbol('foo')
        provider.put([sym.toString, () => 'baz'])
        const bar = provider.get(sym.toString)
        assert.isOk(bar)
        assert.isFunction(bar)
        assert.equal(bar(), 'baz')
    })

    it('should accept a class instance accessible through the class constructor', () => {
        class Dummy {
            #name = ''
            #count = 0
            value() {
                this.#count += 1
                return this.#count
            }

            constructor(name) {
                this.#name = name
            }
        }

        const provider = new Container('ContainerTests')
        const instance = new Dummy('foo')
        assert.isOk(provider)
        assert.isOk(instance)
        assert.isOk(instance['constructor'])
        assert.isOk(instance['constructor']['prototype'])
        assert.isTrue(instance instanceof Dummy)
        assert.equal(instance.constructor, Dummy)
        assert.equal(instance.constructor.prototype, Dummy.prototype)
        provider.put(instance)
        assert.isOk(provider.get(Dummy))
        assert.equal(provider.get(Dummy).value(), 1)
        assert.equal(provider.get(Dummy).value(), 2)
    })

    it('should accept a default constructible class', () => {
        class Dummy {
            #name = ''
            #count = 0
            value() {
                this.#count += 1
                return this.#count
            }

            constructor() {
                this.#name = 'hurr durr'
            }
        }

        const provider = new Container('ContainerTests')
        assert.isOk(provider)
        provider.put(Dummy)
        const service = provider.get(Dummy)
        assert.isOk(service)
        assert.equal(service.value(), 1)
        assert.equal(service.value(), 2)
    })

    it('works with other misc. values', () => {
        const PG_PORT = Symbol('PostgresPort')
        const provider = new Container('ContainerTests')
        assert.isOk(provider)
        provider.put([PG_PORT, 5432])
        const port = provider.get(PG_PORT)
        assert.isOk(port)
        assert.equal(port, 5432)

        const obj = {
            execute: () => 'hurr durr',
            hash: (value) => hashAny(value)
        }
        const obj2 = {
            execute: () => 'durr hurr',
            hash: (value) => value
        }
        const text = 'text'
        provider.put(obj)
        assert.isOk(provider.get(obj))
        assert.equal(provider.get(obj).execute(), 'hurr durr')
        assert.equal(provider.get(obj).hash(text), hashAny(text))
        provider.put(obj2)
        assert.isOk(provider.get(obj2))
        assert.equal(provider.get(obj2).execute(), 'durr hurr')
        assert.equal(provider.get(obj2).hash(text), text)
    })
})