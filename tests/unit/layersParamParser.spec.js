import { expect } from 'chai'
import layersParamParser from '@/router/store-sync/layersParamParser'

describe('Testing layersParamParser', () => {
    const checkLayer = (layer, id, visible = true, opacity = undefined, customAttributes = {}) => {
        expect(layer).to.be.an('Object')
        expect(layer.id).to.eq(id)
        expect(layer.visible).to.eq(visible, `visible parsing failed for layer ${id}`)
        expect(layer.opacity).to.eq(opacity, `opacity parsing failed for layer ${id}`)
        Object.keys(customAttributes).forEach((key) => {
            expect(layer.customAttributes).to.haveOwnProperty(key)
            expect(layer.customAttributes[key]).to.eq(
                customAttributes[key],
                `custom param "${key}" parsing failed for layer ${id}`
            )
        })
    }
    const checkSingleCustomParam = (customParamValue) => {
        const layerId = 'fake-layer-id'
        const customAttributes = {
            myCustomParam: customParamValue,
        }
        const [layer] = layersParamParser(`${layerId}@myCustomParam=${customParamValue}`)
        checkLayer(layer, layerId, true, undefined, customAttributes)
    }

    it('Returns nothing if the query value is an empty array', () => {
        expect(layersParamParser(null)).to.be.an('Array').empty
        expect(layersParamParser(null)).to.be.an('Array').empty
    })

    it('Returns an object containing the layer info if a layer ID is in the query', () => {
        const layerId = 'fake-layer-id'
        const result = layersParamParser(layerId)
        expect(result).to.be.an('Array').length(1)
        checkLayer(result[0], layerId, true)
    })

    it('Parses correctly the visible when specified', () => {
        const layerId = 'fake-layer-id'
        const result = layersParamParser(`${layerId},f`)
        checkLayer(result[0], layerId, false)
    })

    it('Parses correctly the visible and opacity when both specified', () => {
        const layerId = 'fake-layer-id'
        const opacity = 0.36
        const result = layersParamParser(`${layerId},f,${opacity}`)
        checkLayer(result[0], layerId, false, opacity)
    })

    it('Sets default value to visible if it is ignored and opacity is set', () => {
        const layerId = 'fake-layer-id'
        const opacity = 0.5
        const result = layersParamParser(`${layerId},,${opacity}`)
        checkLayer(result[0], layerId, true, opacity)
    })

    it('Parses correctly one custom params (integer)', () => {
        checkSingleCustomParam(2021)
    })

    it('Parses correctly one custom params (boolean)', () => {
        checkSingleCustomParam(true)
    })

    it('Parses correctly one custom params (string)', () => {
        checkSingleCustomParam('testTestTest')
    })

    it('Parses correctly multiple custom params with visible and opacity set', () => {
        const layerId = 'fake-layer-id'
        const customParams = {
            test: true,
            year: 2020,
            customString: 'oneTwoThreeTest',
        }
        const opacity = 0.25
        // creating a queryString that looks like "fake-layer-id@test=true@year=2020@customString=oneTwoThreeTest,f,0.25"
        let queryString = layerId
        Object.keys(customParams).forEach((key) => {
            queryString += `@${key}=${customParams[key]}`
        })
        queryString += `,f,${opacity}`
        const [layer] = layersParamParser(queryString)
        checkLayer(layer, layerId, false, opacity, customParams)
    })

    it('Parses correctly multiple layers with different types of configuration', () => {
        const layers = [
            {
                id: 'test-visible-and-opacity',
                visible: false,
                opacity: 0.8,
            },
            {
                id: 'test-one-custom-attributes',
                customAttributes: {
                    year: 2019,
                },
            },
            {
                id: 'test-opacity-only',
                opacity: 0.67,
            },
            {
                id: 'test-visible-with-custom-attrs',
                visible: false,
                customAttributes: {
                    attr1: 'test1',
                    attr2: true,
                    attr3: 20200512,
                },
            },
        ]
        // building query string
        let queryString = ''
        layers.forEach((layer) => {
            if (queryString.length > 0) {
                queryString += ';'
            }
            queryString += layer.id
            if (layer.customAttributes) {
                Object.keys(layer.customAttributes).forEach((key) => {
                    queryString += `@${key}=${layer.customAttributes[key]}`
                })
            }
            if ('visible' in layer) {
                queryString += `,${layer.visible === true ? 't' : 'f'}`
            } else if (layer.opacity) {
                queryString += ','
            }
            if (layer.opacity) {
                queryString += `,${layer.opacity}`
            }
        })
        const results = layersParamParser(queryString)
        expect(results).to.be.an('Array').length(layers.length)
        layers.forEach((layer, index) => {
            checkLayer(
                results[index],
                layer.id,
                layer.visible,
                layer.opacity,
                layer.customAttributes
            )
        })
    })
})
