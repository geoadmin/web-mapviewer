import type { LocationQuery, RouteLocationNormalizedGeneric } from 'vue-router'

import { describe, expect, it } from 'vitest'

import UrlParamConfig, {
    type AbstractParamConfigInput,
} from '@/store/plugins/storeSync/UrlParamConfig.class'

class DummyUrlParamConfig<T extends string | number | boolean> extends UrlParamConfig<T> {
    constructor({
        keepInUrlWhenDefault = true,
        valueType = String as NumberConstructor | StringConstructor | BooleanConstructor,
        extractValueFromStore = undefined,
        defaultValue = undefined as T | undefined,
    }: Partial<AbstractParamConfigInput<T>> = {}) {
        const config: AbstractParamConfigInput<T> = {
            urlParamName: 'test',
            actionsToWatch: ['test'],
            setValuesInStore: (_to: RouteLocationNormalizedGeneric, _urlParamValue?: T) => {},
            extractValueFromStore: extractValueFromStore ?? (() => undefined),
            keepInUrlWhenDefault,
            valueType,
            defaultValue,
        }
        super(config)
    }
}

describe('Test all AbstractParamConfig class functionalities', () => {
    describe('readValueFromQuery', () => {
        it('returns undefined when the query given in param is undefined', () => {
            const testInstance = new DummyUrlParamConfig()
            expect(testInstance.readValueFromQuery(undefined)).to.be.undefined
        })
        describe('keepInUrlWhenDefault=true', () => {
            it('returns a string correctly', () => {
                const defaultValue = 'default value'
                const testInstance = new DummyUrlParamConfig<string>({
                    keepInUrlWhenDefault: true,
                    valueType: String,
                    extractValueFromStore: undefined,
                    defaultValue,
                })
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
                const testInstance = new DummyUrlParamConfig<number>({
                    keepInUrlWhenDefault: true,
                    valueType: Number,
                    extractValueFromStore: undefined,
                    defaultValue,
                })
                expect(testInstance.readValueFromQuery({ test: '1234' })).to.eq(1234)
                expect(testInstance.readValueFromQuery({ test: '' })).to.eq(0)
                expect(testInstance.readValueFromQuery({ test: `${defaultValue}` })).to.eq(
                    defaultValue
                )
                expect(testInstance.readValueFromQuery({})).to.be.undefined
            })
            it('returns a boolean correctly', () => {
                const defaultValue = true
                const testInstance = new DummyUrlParamConfig<boolean>({
                    keepInUrlWhenDefault: true,
                    valueType: Boolean,
                    extractValueFromStore: undefined,
                    defaultValue,
                })
                expect(testInstance.readValueFromQuery({ test: 'true' })).to.be.true
                expect(testInstance.readValueFromQuery({ test: 'false' })).to.be.false
                expect(testInstance.readValueFromQuery({ test: '' })).to.be.true
                expect(testInstance.readValueFromQuery({})).to.be.undefined
            })
        })
        describe('keepInUrlWhenDefault=false', () => {
            it('returns a string correctly', () => {
                const defaultValue = 'default value'
                const testInstance = new DummyUrlParamConfig<string>({
                    keepInUrlWhenDefault: false,
                    valueType: String,
                    extractValueFromStore: undefined,
                    defaultValue,
                })
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
                const testInstance = new DummyUrlParamConfig<number>({
                    keepInUrlWhenDefault: false,
                    valueType: Number,
                    extractValueFromStore: undefined,
                    defaultValue,
                })
                expect(testInstance.readValueFromQuery({ test: '1234' })).to.eq(1234)
                expect(testInstance.readValueFromQuery({ test: '' })).to.eq(0)
                expect(testInstance.readValueFromQuery({})).to.eq(
                    defaultValue,
                    'when keepInUrlWhenDefault is false, and the query is empty, we should receive the default value as the read output'
                )
            })
            it('returns a boolean correctly', () => {
                const defaultValue = true
                const testInstance = new DummyUrlParamConfig<boolean>({
                    keepInUrlWhenDefault: false,
                    valueType: Boolean,
                    extractValueFromStore: undefined,
                    defaultValue,
                })
                expect(testInstance.readValueFromQuery({ test: 'true' })).to.be.true
                expect(testInstance.readValueFromQuery({ test: 'false' })).to.be.false
                expect(testInstance.readValueFromQuery({ test: '' })).to.be.true
                // When keepInUrlWhenDefault is false and the query is empty, it should return the default value
                expect(testInstance.readValueFromQuery({})).to.be.true
            })
        })
    })
    describe('populateQueryWithStoreValue', () => {
        it('does not raise error or exception if the given query or store is undefined or null', () => {
            const testInstance = new DummyUrlParamConfig()
            testInstance.populateQueryWithStoreValue(undefined)
            testInstance.populateQueryWithStoreValue({})
            expect(true).to.be.true
        })
        describe('keepInUrlWhenDefault=true', () => {
            const checkUndefinedHandling = <T extends string | number | boolean>(
                testInstance: DummyUrlParamConfig<T>
            ) => {
                it('handles undefined store value correctly', () => {
                    const query: LocationQuery = {}
                    testInstance.populateQueryWithStoreValue(query)
                    expect(query).to.haveOwnProperty('test')
                    // When store value is undefined, it gets converted to string 'undefined'
                    expect(query.test).to.eq('undefined')
                })
            }
            describe('String', () => {
                const defaultValue = 'defaultValue'
                const testInstance = new DummyUrlParamConfig<string>({
                    keepInUrlWhenDefault: true,
                    valueType: String,
                    extractValueFromStore: () => 'dummy-value',
                    defaultValue,
                })
                it('populates strings correctly', () => {
                    const query: LocationQuery = {}
                    testInstance.populateQueryWithStoreValue(query)
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.eq('dummy-value')
                })
                it('handles empty store value correctly', () => {
                    const testInstanceEmpty = new DummyUrlParamConfig<string>({
                        keepInUrlWhenDefault: true,
                        valueType: String,
                        extractValueFromStore: () => '',
                        defaultValue,
                    })
                    const query: LocationQuery = {}
                    testInstanceEmpty.populateQueryWithStoreValue(query)
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.eq('')
                })
                it('handles default value correctly', () => {
                    const testInstanceDefault = new DummyUrlParamConfig<string>({
                        keepInUrlWhenDefault: true,
                        valueType: String,
                        extractValueFromStore: () => defaultValue,
                        defaultValue,
                    })
                    const query: LocationQuery = {}
                    testInstanceDefault.populateQueryWithStoreValue(query)
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.eq(defaultValue)
                })
                checkUndefinedHandling(
                    new DummyUrlParamConfig<string>({
                        keepInUrlWhenDefault: true,
                        valueType: String,
                        extractValueFromStore: () => undefined,
                        defaultValue,
                    })
                )
            })
            describe('Number', () => {
                const defaultValue = 789
                const testInstance = new DummyUrlParamConfig<number>({
                    keepInUrlWhenDefault: true,
                    valueType: Number,
                    extractValueFromStore: () => 123.45,
                    defaultValue,
                })
                it('populates numbers correctly', () => {
                    const query: LocationQuery = {}
                    testInstance.populateQueryWithStoreValue(query)
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.eq('123.45')
                })
                it('handles zero store value correctly', () => {
                    const testInstanceZero = new DummyUrlParamConfig<number>({
                        keepInUrlWhenDefault: true,
                        valueType: Number,
                        extractValueFromStore: () => 0,
                        defaultValue,
                    })
                    const query: LocationQuery = {}
                    testInstanceZero.populateQueryWithStoreValue(query)
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.eq('0')
                })
                it('handles default value correctly', () => {
                    const testInstanceDefault = new DummyUrlParamConfig<number>({
                        keepInUrlWhenDefault: true,
                        valueType: Number,
                        extractValueFromStore: () => defaultValue,
                        defaultValue,
                    })
                    const query: LocationQuery = {}
                    testInstanceDefault.populateQueryWithStoreValue(query)
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.eq('789')
                })
                checkUndefinedHandling(
                    new DummyUrlParamConfig<number>({
                        keepInUrlWhenDefault: true,
                        valueType: Number,
                        extractValueFromStore: () => undefined,
                        defaultValue,
                    })
                )
            })
            describe('Boolean', () => {
                const testInstance = new DummyUrlParamConfig<boolean>({
                    keepInUrlWhenDefault: true,
                    valueType: Boolean,
                    extractValueFromStore: () => true,
                })
                it('populates true boolean correctly', () => {
                    const query: LocationQuery = {}
                    testInstance.populateQueryWithStoreValue(query)
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.eq('')
                })
                it('populates false boolean correctly', () => {
                    const testInstanceFalse = new DummyUrlParamConfig<boolean>({
                        keepInUrlWhenDefault: true,
                        valueType: Boolean,
                        extractValueFromStore: () => false,
                    })
                    const query: LocationQuery = {}
                    testInstanceFalse.populateQueryWithStoreValue(query)
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.eq('false')
                })
                it('handles null store value correctly', () => {
                    const testInstanceNull = new DummyUrlParamConfig<boolean>({
                        keepInUrlWhenDefault: true,
                        valueType: Boolean,
                        extractValueFromStore: () => undefined,
                    })
                    const query: LocationQuery = {}
                    testInstanceNull.populateQueryWithStoreValue(query)
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.eq('false')
                })
                it('handles undefined store value correctly', () => {
                    const testInstanceUndefined = new DummyUrlParamConfig<boolean>({
                        keepInUrlWhenDefault: true,
                        valueType: Boolean,
                        extractValueFromStore: () => undefined,
                    })
                    const query: LocationQuery = {}
                    testInstanceUndefined.populateQueryWithStoreValue(query)
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.eq('false')
                })
            })
        })
        describe('keepInUrlWhenDefault=false', () => {
            const checkNullAndUndefinedHandling = <T extends string | number | boolean>(
                testInstance: DummyUrlParamConfig<T>
            ) => {
                it('handles null store value correctly', () => {
                    const query: LocationQuery = {}
                    testInstance.populateQueryWithStoreValue(query)
                    expect(query).to.haveOwnProperty('test')
                    // When store value is undefined, it gets converted to string 'undefined'
                    expect(query.test).to.eq('undefined')
                })
                it('handles undefined store value correctly', () => {
                    const query: LocationQuery = {}
                    testInstance.populateQueryWithStoreValue(query)
                    expect(query).to.haveOwnProperty('test')
                    // When store value is undefined, it gets converted to string 'undefined'
                    expect(query.test).to.eq('undefined')
                })
            }
            describe('String', () => {
                const defaultValue = 'default value'
                const testInstance = new DummyUrlParamConfig<string>({
                    keepInUrlWhenDefault: false,
                    valueType: String,
                    extractValueFromStore: () => 'dummy-value',
                    defaultValue,
                })
                it('populates strings correctly', () => {
                    const query: LocationQuery = {}
                    testInstance.populateQueryWithStoreValue(query)
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.eq('dummy-value')
                })
                it('handles empty store value correctly', () => {
                    const testInstanceEmpty = new DummyUrlParamConfig<string>({
                        keepInUrlWhenDefault: false,
                        valueType: String,
                        extractValueFromStore: () => '',
                        defaultValue,
                    })
                    const query: LocationQuery = {}
                    testInstanceEmpty.populateQueryWithStoreValue(query)
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.eq('')
                })
                it('handles default value correctly', () => {
                    const testInstanceDefault = new DummyUrlParamConfig<string>({
                        keepInUrlWhenDefault: false,
                        valueType: String,
                        extractValueFromStore: () => defaultValue,
                        defaultValue,
                    })
                    const query: LocationQuery = {}
                    testInstanceDefault.populateQueryWithStoreValue(query)
                    expect(query).to.not.haveOwnProperty('test')
                })
                checkNullAndUndefinedHandling(
                    new DummyUrlParamConfig<string>({
                        keepInUrlWhenDefault: false,
                        valueType: String,
                        extractValueFromStore: () => undefined,
                        defaultValue,
                    })
                )
            })
            describe('Number', () => {
                const defaultValue = 789
                const testInstance = new DummyUrlParamConfig<number>({
                    keepInUrlWhenDefault: false,
                    valueType: Number,
                    extractValueFromStore: () => 123.45,
                    defaultValue,
                })
                it('populates numbers correctly', () => {
                    const query: LocationQuery = {}
                    testInstance.populateQueryWithStoreValue(query)
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.eq('123.45')
                })
                it('handles zero store value correctly', () => {
                    const testInstanceZero = new DummyUrlParamConfig<number>({
                        keepInUrlWhenDefault: false,
                        valueType: Number,
                        extractValueFromStore: () => 0,
                        defaultValue,
                    })
                    const query: LocationQuery = {}
                    testInstanceZero.populateQueryWithStoreValue(query)
                    expect(query).to.haveOwnProperty('test')
                    expect(query.test).to.eq('0')
                })
                it('handles default value correctly', () => {
                    const testInstanceDefault = new DummyUrlParamConfig<number>({
                        keepInUrlWhenDefault: false,
                        valueType: Number,
                        extractValueFromStore: () => defaultValue,
                        defaultValue,
                    })
                    const query: LocationQuery = {}
                    testInstanceDefault.populateQueryWithStoreValue(query)
                    expect(query).to.not.haveOwnProperty('test')
                })
                checkNullAndUndefinedHandling(
                    new DummyUrlParamConfig<number>({
                        keepInUrlWhenDefault: false,
                        valueType: Number,
                        extractValueFromStore: () => undefined,
                        defaultValue,
                    })
                )
            })
            describe('Boolean', () => {
                const defaultValue = false
                const testInstance = new DummyUrlParamConfig<boolean>({
                    keepInUrlWhenDefault: false,
                    valueType: Boolean,
                    extractValueFromStore: () => true,
                    defaultValue,
                })
                it('populates true boolean correctly', () => {
                    const query: LocationQuery = {}
                    testInstance.populateQueryWithStoreValue(query)
                    expect(query).to.haveOwnProperty('test')
                    expect(
                        query.test,
                        'only the param name should be added when dealing with a true boolean, so that the URL does not contains =true but only the param name'
                    ).to.eq('')
                })
                it('populates false (default value) boolean correctly', () => {
                    const testInstanceDefault = new DummyUrlParamConfig<boolean>({
                        keepInUrlWhenDefault: false,
                        valueType: Boolean,
                        extractValueFromStore: () => defaultValue,
                        defaultValue,
                    })
                    const query: LocationQuery = {}
                    testInstanceDefault.populateQueryWithStoreValue(query)
                    expect(
                        query,
                        'false is the default value, and with keepInUrlWhenDefault being set to false it should not be added to the query'
                    ).to.not.haveOwnProperty('test')
                })
                it('handles null store value correctly', () => {
                    const testInstanceNull = new DummyUrlParamConfig<boolean>({
                        keepInUrlWhenDefault: false,
                        valueType: Boolean,
                        extractValueFromStore: () => undefined,
                        defaultValue,
                    })
                    const query: LocationQuery = {}
                    testInstanceNull.populateQueryWithStoreValue(query)
                    expect(
                        query,
                        'as null is "falsy" it should be considered equal to default value, and thus not be added to the query'
                    ).to.not.haveOwnProperty('test')
                })
                it('handles undefined store value correctly', () => {
                    const testInstanceUndefined = new DummyUrlParamConfig<boolean>({
                        keepInUrlWhenDefault: false,
                        valueType: Boolean,
                        extractValueFromStore: () => undefined,
                        defaultValue,
                    })
                    const query: LocationQuery = {}
                    testInstanceUndefined.populateQueryWithStoreValue(query)
                    expect(
                        query,
                        'as undefined is "falsy" it should be considered equal to default value, and thus not be added to the query'
                    ).to.not.haveOwnProperty('test')
                })
            })
        })
    })
})
