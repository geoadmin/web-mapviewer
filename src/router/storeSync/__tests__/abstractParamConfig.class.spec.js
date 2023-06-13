import AbstractParamConfig from '@/router/storeSync/abstractParamConfig.class'
import { expect } from 'chai'
import { describe, it } from 'vitest'

class DummyUrlParamConfig extends AbstractParamConfig {
    constructor(
        keepInUrlWhenDefault = true,
        valueType = String,
        extractValueFromStore = undefined,
        defaultValue = null
    ) {
        super(
            'test',
            'test',
            undefined,
            extractValueFromStore,
            keepInUrlWhenDefault,
            valueType,
            defaultValue
        )
    }
}

describe('Test all AbstractParamConfig class functionalities', () => {
    describe('readValueFromQuery', () => {
        it('returns undefined when the query given in param is null or undefined', () => {
            const testInstance = new DummyUrlParamConfig()
            expect(testInstance.readValueFromQuery(null)).to.be.undefined
            expect(testInstance.readValueFromQuery(undefined)).to.be.undefined
        })
        describe('keepInUrlWhenDefault=true', () => {
            it('returns a string correctly', () => {
                const defaultValue = 'default value'
                const testInstance = new DummyUrlParamConfig(true, String, null, defaultValue)
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
                expect(
                    testInstance.readValueFromQuery({
                        test: defaultValue,
                    })
                ).to.eq(defaultValue)
                expect(testInstance.readValueFromQuery({})).to.be.undefined
            })
            it('returns a number correctly', () => {
                const defaultValue = 789
                const testInstance = new DummyUrlParamConfig(true, Number, null, defaultValue)
                expect(testInstance.readValueFromQuery({ test: '1234' })).to.eq(1234)
                expect(testInstance.readValueFromQuery({ test: '' })).to.eq(0)
                expect(testInstance.readValueFromQuery({ test: `${defaultValue}` })).to.eq(
                    defaultValue
                )
                expect(testInstance.readValueFromQuery({})).to.be.undefined
            })
            it('returns a boolean correctly', () => {
                const defaultValue = true
                const testInstance = new DummyUrlParamConfig(true, Boolean, null, defaultValue)
                expect(testInstance.readValueFromQuery({ test: 'true' })).to.be.true
                expect(testInstance.readValueFromQuery({ test: 'false' })).to.be.false
                expect(testInstance.readValueFromQuery({ test: '' })).to.be.false
                // null value means the param without value, we want it to be true
                expect(testInstance.readValueFromQuery({ test: null })).to.be.true
                expect(testInstance.readValueFromQuery({})).to.be.undefined
            })
        })
        describe('keepInUrlWhenDefault=false', () => {
            it('returns a string correctly', () => {
                const defaultValue = 'default value'
                const testInstance = new DummyUrlParamConfig(false, String, null, defaultValue)
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
                expect(testInstance.readValueFromQuery({})).to.eq(
                    defaultValue,
                    'when keepInUrlWhenDefault is false, and the query is empty, we should receive the default value as the read output'
                )
            })
            it('returns a number correctly', () => {
                const defaultValue = 789
                const testInstance = new DummyUrlParamConfig(false, Number, null, defaultValue)
                expect(testInstance.readValueFromQuery({ test: '1234' })).to.eq(1234)
                expect(testInstance.readValueFromQuery({ test: '' })).to.eq(0)
                expect(testInstance.readValueFromQuery({})).to.eq(
                    defaultValue,
                    'when keepInUrlWhenDefault is false, and the query is empty, we should receive the default value as the read output'
                )
            })
            it('returns a boolean correctly', () => {
                const defaultValue = true
                const testInstance = new DummyUrlParamConfig(false, Boolean, null, defaultValue)
                expect(testInstance.readValueFromQuery({ test: 'true' })).to.be.true
                expect(testInstance.readValueFromQuery({ test: 'false' })).to.be.false
                expect(testInstance.readValueFromQuery({ test: '' })).to.be.false
                // null value means the param without value, we want it to be true
                expect(testInstance.readValueFromQuery({ test: null })).to.be.true
                expect(testInstance.readValueFromQuery({})).to.be.true
            })
        })
    })
    describe('populateQueryWithStoreValue', () => {
        it('does not raise error or exception if the given query or store is undefined or null', () => {
            const testInstance = new DummyUrlParamConfig()
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
        describe('keepInUrlWhenDefault=true', () => {
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
                const defaultValue = 'defaultValue'
                const testInstance = new DummyUrlParamConfig(
                    true,
                    String,
                    (store) => store['test'],
                    defaultValue
                )
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
                it('handles default value correctly', () => {
                    const query = {}
                    testInstance.populateQueryWithStoreValue(query, { test: defaultValue })
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.eq(defaultValue)
                })
                checkNullAndUndefinedHandling(testInstance)
            })
            describe('Number', () => {
                const defaultValue = 789
                const testInstance = new DummyUrlParamConfig(
                    true,
                    Number,
                    (store) => store['test'],
                    defaultValue
                )
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
                it('handles default value correctly', () => {
                    const query = {}
                    testInstance.populateQueryWithStoreValue(query, { test: defaultValue })
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.eq(defaultValue)
                })
                checkNullAndUndefinedHandling(testInstance)
            })
            describe('Boolean', () => {
                const testInstance = new DummyUrlParamConfig(
                    true,
                    Boolean,
                    (store) => store['test']
                )
                it('populates true boolean correctly', () => {
                    const query = {}
                    testInstance.populateQueryWithStoreValue(query, { test: true })
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.be.null
                })
                it('populates false boolean correctly', () => {
                    const query = {}
                    testInstance.populateQueryWithStoreValue(query, { test: false })
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.be.false
                })
                it('handles null store value correctly', () => {
                    const query = {}
                    testInstance.populateQueryWithStoreValue(query, { test: null })
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.be.false
                })
                it('handles undefined store value correctly', () => {
                    const query = {}
                    testInstance.populateQueryWithStoreValue(query, { test: undefined })
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.be.false
                })
            })
        })
        describe('keepInUrlWhenDefault=false', () => {
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
                const defaultValue = 'default value'
                const testInstance = new DummyUrlParamConfig(
                    false,
                    String,
                    (store) => store['test'],
                    defaultValue
                )
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
                it('handles default value correctly', () => {
                    const query = {}
                    testInstance.populateQueryWithStoreValue(query, { test: defaultValue })
                    expect(query).to.not.haveOwnProperty('test')
                })
                checkNullAndUndefinedHandling(testInstance)
            })
            describe('Number', () => {
                const defaultValue = 789
                const testInstance = new DummyUrlParamConfig(
                    false,
                    Number,
                    (store) => store['test'],
                    defaultValue
                )
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
                it('handles default value correctly', () => {
                    const query = {}
                    testInstance.populateQueryWithStoreValue(query, { test: defaultValue })
                    expect(query).to.not.haveOwnProperty('test')
                })
                checkNullAndUndefinedHandling(testInstance)
            })
            describe('Boolean', () => {
                const defaultValue = false
                const testInstance = new DummyUrlParamConfig(
                    false,
                    Boolean,
                    (store) => store['test'],
                    defaultValue
                )
                it('populates true boolean correctly', () => {
                    const query = {}
                    testInstance.populateQueryWithStoreValue(query, { test: true })
                    expect(query).to.haveOwnProperty('test')
                    expect(
                        query.test,
                        'only the param name should be added when dealing with a true boolean, so that the URL does not contains =true but only the param name'
                    ).to.be.null
                })
                it('populates false (default value) boolean correctly', () => {
                    const query = {}
                    testInstance.populateQueryWithStoreValue(query, { test: defaultValue })
                    expect(
                        query,
                        'false is the default value, and with keepInUrlWhenDefault being set to false it should not be added to the query'
                    ).to.not.haveOwnProperty('test')
                })
                it('handles null store value correctly', () => {
                    const query = {}
                    testInstance.populateQueryWithStoreValue(query, { test: null })
                    expect(
                        query,
                        'as null is "falsy" it should be considered equal to default value, and thus not be added to the query'
                    ).to.not.haveOwnProperty('test')
                })
                it('handles undefined store value correctly', () => {
                    const query = {}
                    testInstance.populateQueryWithStoreValue(query, { test: undefined })
                    expect(
                        query,
                        'as undefined is "falsy" it should be considered equal to default value, and thus not be added to the query'
                    ).to.not.haveOwnProperty('test')
                })
            })
        })
    })
})
