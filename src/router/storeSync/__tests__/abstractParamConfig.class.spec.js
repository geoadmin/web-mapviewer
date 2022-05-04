import { describe, it } from 'vitest'
import { expect } from 'chai'
import AbstractParamConfig from '@/router/storeSync/abstractParamConfig.class'

class DummyLayer extends AbstractParamConfig {
    constructor(
        keepValueInUrlWhenEmpty = true,
        valueType = String,
        extractValueFromStore = undefined
    ) {
        super('test', 'test', undefined, extractValueFromStore, keepValueInUrlWhenEmpty, valueType)
    }
    getID() {
        return 'test'
    }
    getURL() {
        return 'https://fake-url.ch'
    }
}

describe('Test all AbstractParamConfig class functionalities', () => {
    describe('readValueFromQuery', () => {
        it('returns undefined when the query given in param is null or undefined', () => {
            const testInstance = new DummyLayer()
            expect(testInstance.readValueFromQuery(null)).to.be.undefined
            expect(testInstance.readValueFromQuery(undefined)).to.be.undefined
        })
        describe('keepValueInUrlWhenEmpty=true', () => {
            it('returns a string correctly', () => {
                const testInstance = new DummyLayer(true, String)
                expect(
                    testInstance.readValueFromQuery({
                        test: 'this-is-a-test',
                    })
                ).to.eq('this-is-a-test')
                expect(
                    testInstance.readValueFromQuery({
                        test: '',
                    })
                ).to.eq('')
                expect(testInstance.readValueFromQuery({})).to.be.undefined
            })
            it('returns a number correctly', () => {
                const testInstance = new DummyLayer(true, Number)
                expect(testInstance.readValueFromQuery({ test: '1234' })).to.eq(1234)
                expect(testInstance.readValueFromQuery({ test: '' })).to.eq(0)
                expect(testInstance.readValueFromQuery({})).to.be.undefined
            })
            it('returns a boolean correctly', () => {
                const testInstance = new DummyLayer(true, Boolean)
                expect(testInstance.readValueFromQuery({ test: 'true' })).to.be.true
                expect(testInstance.readValueFromQuery({ test: 'false' })).to.be.false
                expect(testInstance.readValueFromQuery({ test: '' })).to.be.false
                expect(testInstance.readValueFromQuery({})).to.be.undefined
            })
        })
        describe('keepValueInUrlWhenEmpty=false', () => {
            it('returns a string correctly', () => {
                const testInstance = new DummyLayer(false, String)
                expect(
                    testInstance.readValueFromQuery({
                        test: 'this-is-a-test',
                    })
                ).to.eq('this-is-a-test')
                expect(
                    testInstance.readValueFromQuery({
                        test: '',
                    })
                ).to.eq('')
                expect(testInstance.readValueFromQuery({})).to.eq('')
            })
            it('returns a number correctly', () => {
                const testInstance = new DummyLayer(false, Number)
                expect(testInstance.readValueFromQuery({ test: '1234' })).to.eq(1234)
                expect(testInstance.readValueFromQuery({ test: '' })).to.eq(0)
                expect(testInstance.readValueFromQuery({})).to.eq(0)
            })
            it('returns a boolean correctly', () => {
                const testInstance = new DummyLayer(false, Boolean)
                expect(testInstance.readValueFromQuery({ test: 'true' })).to.be.true
                expect(testInstance.readValueFromQuery({ test: 'false' })).to.be.false
                expect(testInstance.readValueFromQuery({ test: '' })).to.be.false
                expect(testInstance.readValueFromQuery({})).to.be.false
            })
        })
    })
    describe('populateQueryWithStoreValue', () => {
        it('does not raise error or exception if the given query or store is undefined or null', () => {
            const testInstance = new DummyLayer()
            try {
                testInstance.populateQueryWithStoreValue(null, null)
                testInstance.populateQueryWithStoreValue(undefined, undefined)
                testInstance.populateQueryWithStoreValue(null, {})
                testInstance.populateQueryWithStoreValue(undefined, {})
                testInstance.populateQueryWithStoreValue({}, null)
                testInstance.populateQueryWithStoreValue({}, undefined)
            } catch (e) {
                expect({}, 'Must not fail when given invalid entry args').to.be.undefined
            }
        })
        describe('keepValueInUrlWhenEmpty=true', () => {
            const checkNullAndUndefinedHandling = (testInstance) => {
                it('handles null store value correctly', () => {
                    const query = {}
                    testInstance.populateQueryWithStoreValue(query, { test: null })
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.be.undefined
                })
                it('handles undefined store value correctly', () => {
                    const query = {}
                    testInstance.populateQueryWithStoreValue(query, { test: undefined })
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.be.undefined
                })
            }
            describe('String', () => {
                const testInstance = new DummyLayer(true, String, (store) => store['test'])
                it('populates strings correctly', () => {
                    const query = {}
                    testInstance.populateQueryWithStoreValue(query, { test: 'dummy-value' })
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.eq('dummy-value')
                })
                it('handles empty store value correctly', () => {
                    const query = {}
                    testInstance.populateQueryWithStoreValue(query, { test: '' })
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.eq('')
                })
                checkNullAndUndefinedHandling(testInstance)
            })
            describe('Number', () => {
                const testInstance = new DummyLayer(true, Number, (store) => store['test'])
                it('populates numbers correctly', () => {
                    const query = {}
                    testInstance.populateQueryWithStoreValue(query, { test: 123.45 })
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.eq(123.45)
                })
                it('handles zero store value correctly', () => {
                    const query = {}
                    testInstance.populateQueryWithStoreValue(query, { test: 0 })
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.eq(0)
                })
                checkNullAndUndefinedHandling(testInstance)
            })
            describe('Boolean', () => {
                const testInstance = new DummyLayer(true, Boolean, (store) => store['test'])
                it('populates true boolean correctly', () => {
                    const query = {}
                    testInstance.populateQueryWithStoreValue(query, { test: true })
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.be.true
                })
                it('populates false boolean correctly', () => {
                    const query = {}
                    testInstance.populateQueryWithStoreValue(query, { test: false })
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.be.false
                })
                checkNullAndUndefinedHandling(testInstance)
            })
        })
        describe('keepValueInUrlWhenEmpty=false', () => {
            const checkNullAndUndefinedHandling = (testInstance) => {
                it('handles null store value correctly', () => {
                    const query = {}
                    testInstance.populateQueryWithStoreValue(query, { test: null })
                    expect(query).to.not.haveOwnProperty('test')
                })
                it('handles undefined store value correctly', () => {
                    const query = {}
                    testInstance.populateQueryWithStoreValue(query, { test: undefined })
                    expect(query).to.not.haveOwnProperty('test')
                })
            }
            describe('String', () => {
                const testInstance = new DummyLayer(false, String, (store) => store['test'])
                it('populates strings correctly', () => {
                    const query = {}
                    testInstance.populateQueryWithStoreValue(query, { test: 'dummy-value' })
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.eq('dummy-value')
                })
                it('handles empty store value correctly', () => {
                    const query = {}
                    testInstance.populateQueryWithStoreValue(query, { test: '' })
                    expect(query).to.not.haveOwnProperty('test')
                })
                checkNullAndUndefinedHandling(testInstance)
            })
            describe('Number', () => {
                const testInstance = new DummyLayer(false, Number, (store) => store['test'])
                it('populates numbers correctly', () => {
                    const query = {}
                    testInstance.populateQueryWithStoreValue(query, { test: 123.45 })
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.eq(123.45)
                })
                it('handles zero store value correctly', () => {
                    const query = {}
                    testInstance.populateQueryWithStoreValue(query, { test: 0 })
                    expect(query).to.not.haveOwnProperty('test')
                })
                checkNullAndUndefinedHandling(testInstance)
            })
            describe('Boolean', () => {
                const testInstance = new DummyLayer(false, Boolean, (store) => store['test'])
                it('populates true boolean correctly', () => {
                    const query = {}
                    testInstance.populateQueryWithStoreValue(query, { test: true })
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.be.true
                })
                it('populates false boolean correctly', () => {
                    const query = {}
                    testInstance.populateQueryWithStoreValue(query, { test: false })
                    expect(query).to.not.haveOwnProperty('test')
                })
                checkNullAndUndefinedHandling(testInstance)
            })
        })
    })
})
