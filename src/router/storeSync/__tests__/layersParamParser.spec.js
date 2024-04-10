import { expect } from 'chai'
import { describe, it } from 'vitest'

import { parseLayersParam } from '@/router/storeSync/layersParamParser'

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
        const [layer] = parseLayersParam(`${layerId}@myCustomParam=${customParamValue}`)
        checkLayer(layer, layerId, true, undefined, customAttributes)
    }

    it('Returns nothing if the query value is an empty array', () => {
        expect(parseLayersParam(null)).to.be.an('Array').empty
        expect(parseLayersParam(null)).to.be.an('Array').empty
    })
    it('Returns an object containing the layer info if a layer ID is in the query', () => {
        const layerId = 'fake-layer-id'
        const result = parseLayersParam(layerId)
        expect(result).to.be.an('Array').length(1)
        checkLayer(result[0], layerId, true)
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
            {
                id: 'KML|somerandomurl.ch/file.kml|An external KML',
                opacity: 0.4,
            },
            {
                id: 'WMTS|https://totally.fake.wmts.url/WMTSGetCapabilties.xml|a.layer.id|A name for the external WMTS layer',
                opacity: 0.8,
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
        const results = parseLayersParam(queryString)
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

    describe('Visibility/Opacity parsing', () => {
        it('Parses correctly the visible when specified', () => {
            const layerId = 'fake-layer-id'
            const result = parseLayersParam(`${layerId},f`)
            checkLayer(result[0], layerId, false)
        })
        it('Parses correctly the visible and opacity when both specified', () => {
            const layerId = 'fake-layer-id'
            const opacity = 0.36
            const result = parseLayersParam(`${layerId},f,${opacity}`)
            checkLayer(result[0], layerId, false, opacity)
        })
        it('Sets default value to visible if it is ignored and opacity is set', () => {
            const layerId = 'fake-layer-id'
            const opacity = 0.5
            const result = parseLayersParam(`${layerId},,${opacity}`)
            checkLayer(result[0], layerId, true, opacity)
        })
    })

    describe('Custom params', () => {
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
            const [layer] = parseLayersParam(queryString)
            checkLayer(layer, layerId, false, opacity, customParams)
        })
    })

    describe('External layer management', () => {
        it('parse correctly an external KML layer', () => {
            const externalLayerUrlId = 'KML|https://somerandomurl.ch/file.kml|Some custom label'
            const result = parseLayersParam(`${externalLayerUrlId},f,0.6`)
            expect(result).to.be.an('Array').with.lengthOf(1)
            const [layer] = result
            expect(layer).to.be.an('Object')
            expect(layer.id).to.eq(externalLayerUrlId)
            expect(layer.visible).to.be.false
            expect(layer.opacity).to.eq(0.6)
        })
        it('parses an external WMTS layer correctly', () => {
            const externalLayerIdInUrl =
                'WMTS|https://fake.wmts.admin.ch|some_fake_layer_id|Fake WMTS Layer'
            const results = parseLayersParam(`${externalLayerIdInUrl},t,1.0`)
            expect(results).to.be.an('Array').length(1)
            const [externalWMTSLayer] = results
            expect(externalWMTSLayer).to.be.an('Object')
            expect(externalWMTSLayer.id).to.eq(externalLayerIdInUrl)
            expect(externalWMTSLayer.visible).to.be.true
            expect(externalWMTSLayer.opacity).to.eq(1.0)
        })
        it('parses an external WMS layer correctly', () => {
            const externalLayerIdInUrl =
                'WMS|https://fake.wms.admin.ch|some_fake_layer_id|0.0.0|Fake WMS Layer'
            const results = parseLayersParam(`${externalLayerIdInUrl},t,0.8`)
            expect(results).to.be.an('Array').length(1)
            const [externalWMSLayer] = results
            expect(externalWMSLayer).to.be.an('Object')
            expect(externalWMSLayer.id).to.eq(externalLayerIdInUrl)
            expect(externalWMSLayer.visible).to.be.true
            expect(externalWMSLayer.opacity).to.eq(0.8)
        })
    })
})
