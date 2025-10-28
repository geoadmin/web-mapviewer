import type { RouteLocationNormalizedGeneric } from 'vue-router'

import { describe, expect, it } from 'vitest'

import UrlParamConfig, {
    type AbstractParamConfigInput,
} from '@/router/storeSync/UrlParamConfig.class'

interface Store {
    test: string | number | boolean
}

describe('Test all SimpleUrlParamConfig class functionalities', () => {
    const fakeStore: Store = {
        test: 'test',
    }
    const defaultOptions = {
        urlParamName: 'test',
        actionsToWatch: ['test'],
        setValuesInStore: (_to: RouteLocationNormalizedGeneric, _urlParamValue?: string) => { },
        extractValueFromStore: () => 'test',
        keepInUrlWhenDefault: true,
        valueType: String as NumberConstructor | StringConstructor | BooleanConstructor,
        defaultValue: '',
    }
    const createTestInstance = <T extends string | number | boolean>(
        options: Partial<AbstractParamConfigInput<T>> = {}
    ) => {
        const config: AbstractParamConfigInput<T> = {
            ...defaultOptions,
            ...options,
        } as AbstractParamConfigInput<T>
        return new UrlParamConfig<T>(config)
    }

    describe('outputs the correct type with the readFromStore function', () => {
        it('returns undefined if the store given in param is undefined', () => {
            const testInstance = createTestInstance<string>({
                extractValueFromStore: () => undefined,
            })
            expect(testInstance.readValueFromStore()).to.be.undefined
        })
        it('outputs string correctly', () => {
            const testInstance = createTestInstance<string>({
                valueType: String,
                extractValueFromStore: () => fakeStore.test as string,
            })
            expect(testInstance.readValueFromStore()).to.be.a('string').that.eq('test')
        })
        it('outputs boolean correctly', () => {
            let valueInStore = true
            const testInstance = createTestInstance<boolean>({
                valueType: Boolean,
                extractValueFromStore: () => valueInStore,
            })
            expect(testInstance.readValueFromStore()).to.be.a('boolean').that.eq(valueInStore)
            valueInStore = false
            expect(testInstance.readValueFromStore()).to.be.a('boolean').that.eq(valueInStore)
        })
        it('outputs numbers correctly', () => {
            const testInstance = createTestInstance<number>({
                valueType: Number,
                extractValueFromStore: () => 123,
            })
            expect(testInstance.readValueFromStore()).to.be.a('number').that.eq(123)
        })
    })
    describe('outputs the correct type while reading values from the query', () => {
        it('returns undefined if the query given in param is undefined', () => {
            const testInstance = createTestInstance()
            expect(testInstance.readValueFromQuery(undefined)).to.be.undefined
        })
        describe('boolean', () => {
            it('outputs boolean correctly when they stay in the URL when false', () => {
                const testInstance = createTestInstance<boolean>({
                    keepInUrlWhenDefault: true,
                    valueType: Boolean,
                    defaultValue: false,
                })
                expect(testInstance.readValueFromQuery({ test: 'true' }))
                    .to.be.a('boolean')
                    .that.eq(true)
                expect(testInstance.readValueFromQuery({ test: '' }))
                    .to.be.a('boolean')
                    .that.eq(true)
                expect(testInstance.readValueFromQuery({ test: 'false' }))
                    .to.be.a('boolean')
                    .that.eq(false)
            })
            it('outputs boolean correctly when they are removed from the URL when false', () => {
                const testInstance = createTestInstance<boolean>({
                    keepInUrlWhenDefault: false,
                    valueType: Boolean,
                    defaultValue: false,
                })
                expect(testInstance.readValueFromQuery({ test: 'true' }))
                    .to.be.a('boolean')
                    .that.eq(true)
                expect(
                    testInstance.readValueFromQuery({}),
                    'It should return false when the param is not found in the query and keepInUrlWhenDefault is false'
                )
                    .to.be.a('boolean')
                    .that.eq(false)
            })
        })
        describe('string', () => {
            it('outputs string correctly', () => {
                const testInstance = createTestInstance<string>({
                    valueType: String,
                    keepInUrlWhenDefault: true,
                })
                expect(testInstance.readValueFromQuery({ test: 'test' }))
                    .to.be.a('string')
                    .that.eq('test')
            })
            it('outputs an empty string for a string that is not present in the URL (with keepInUrlWhenDefault=false)', () => {
                const testInstance = createTestInstance<string>({
                    valueType: String,
                    keepInUrlWhenDefault: false,
                    defaultValue: '',
                })
                expect(testInstance.readValueFromQuery({})).to.eq('')
            })
        })
        describe('number', () => {
            it('outputs numbers correctly', () => {
                const testInstance = createTestInstance<number>({
                    valueType: Number,
                })
                expect(testInstance.readValueFromQuery({ test: '123' }))
                    .to.be.a('number')
                    .that.eq(123)
            })
            it('outputs zero for a number that is not present in the URL (with keepInUrlWhenDefault=false)', () => {
                const testInstance = createTestInstance<number>({
                    valueType: Number,
                    keepInUrlWhenDefault: false,
                    defaultValue: 0,
                })
                expect(testInstance.readValueFromQuery({})).to.eq(0)
            })
        })
    })
    describe('Testing valuesAreDifferentBetweenQueryAndStore', () => {
        describe('boolean', () => {
            it('tells when a boolean, that stays in the URL when false, has changed', () => {
                const testInstance = createTestInstance<boolean>({
                    valueType: Boolean,
                    keepInUrlWhenDefault: true,
                    extractValueFromStore: () => fakeStore.test as boolean,
                })
                fakeStore.test = true
                expect(
                    testInstance.valuesAreDifferentBetweenQueryAndStore({ test: 'false' })
                ).to.be.true
                fakeStore.test = false
                expect(
                    testInstance.valuesAreDifferentBetweenQueryAndStore({ test: 'false' })
                ).to.be.false
            })
            it("tells when a boolean, that doesn't stay in the URL when false, has changed", () => {
                const testInstance = createTestInstance<boolean>({
                    valueType: Boolean,
                    keepInUrlWhenDefault: false,
                    extractValueFromStore: () => fakeStore.test as boolean,
                    defaultValue: false,
                })
                fakeStore.test = true
                expect(
                    testInstance.valuesAreDifferentBetweenQueryAndStore({}),
                    "It should detect that the value in the store is true and that the query doesn't contain this param"
                ).to.be.true
                fakeStore.test = false
                expect(
                    testInstance.valuesAreDifferentBetweenQueryAndStore({ test: 'true' }),
                    "It should detect that the store's value is false, and the query's value is true"
                ).to.be.true
                fakeStore.test = false
                expect(
                    testInstance.valuesAreDifferentBetweenQueryAndStore({}),
                    'It should detect that the the lack of the URL param means the value in the store is false'
                ).to.be.false
            })
        })
        describe('string', () => {
            it('tells when a string, that stays in the URL when empty, has changed', () => {
                const testInstance = createTestInstance<string>({
                    valueType: String,
                    extractValueFromStore: () => fakeStore.test as string,
                })
                fakeStore.test = 'test'
                expect(
                    testInstance.valuesAreDifferentBetweenQueryAndStore({ test: 'test' }),
                    'String values are equals, URL should not change'
                ).to.be.false
                fakeStore.test = 'test'
                expect(
                    testInstance.valuesAreDifferentBetweenQueryAndStore({ test: 'not-test' }),
                    'String value is not the same between store and URL, should return true'
                ).to.be.true
            })
            it("tells when a string, that doesn't says in the URL when empty, has changed", () => {
                const defaultValue = 'default value'
                const testInstance = createTestInstance<string>({
                    valueType: String,
                    keepInUrlWhenDefault: true,
                    defaultValue,
                    extractValueFromStore: () => fakeStore.test as string,
                })
                fakeStore.test = 'test'
                expect(
                    testInstance.valuesAreDifferentBetweenQueryAndStore({}),
                    'Should detect when the param is not found in the URL but it has a value in the store'
                ).to.be.true
                fakeStore.test = ''
                expect(
                    testInstance.valuesAreDifferentBetweenQueryAndStore({ test: 'test' }),
                    'Should detect when the param is found in the URL but it is empty in the store'
                ).to.be.true
                fakeStore.test = ''
                expect(
                    testInstance.valuesAreDifferentBetweenQueryAndStore({ test: '' }),
                    "Should not tell there's a difference when the query is empty and the store value too"
                ).to.be.false
            })
            it('does not trigger a change when the store value is set to default, and nothing is present in the url', () => {
                const defaultValue = 'a default value'
                const testInstance = createTestInstance<string>({
                    valueType: String,
                    keepInUrlWhenDefault: false,
                    defaultValue,
                    extractValueFromStore: () => fakeStore.test as string,
                })
                fakeStore.test = defaultValue
                expect(
                    testInstance.valuesAreDifferentBetweenQueryAndStore({}),
                    'Should not detect a change as the store holds the default value, and keepInUrlWhenDefault is false'
                ).to.be.false
            })
        })
        describe('numbers', () => {
            it('tells when a number, that stays in the URL when zero, has changed', () => {
                const testInstance = createTestInstance<number>({
                    valueType: Number,
                    defaultValue: 0,
                    extractValueFromStore: () => fakeStore.test as number,
                })
                fakeStore.test = 1
                expect(testInstance.valuesAreDifferentBetweenQueryAndStore({ test: '0' })).to.be
                    .true
            })
            it("tells when a number, that doesn't stays in the URL when zero, has changed", () => {
                const testInstance = createTestInstance<number>({
                    valueType: Number,
                    defaultValue: 0,
                    keepInUrlWhenDefault: false,
                    extractValueFromStore: () => fakeStore.test as number,
                })
                fakeStore.test = 1
                expect(testInstance.valuesAreDifferentBetweenQueryAndStore({})).to.be.true
                fakeStore.test = 0
                expect(testInstance.valuesAreDifferentBetweenQueryAndStore({ test: '1' })).to.be
                    .true
                fakeStore.test = 0
                expect(
                    testInstance.valuesAreDifferentBetweenQueryAndStore({}),
                    'as the value in the store is set to the default value, and the query is empty, the function should consider that they are equal'
                ).to.be.false
            })
        })
    })
})
