import { expect } from 'chai'
import { beforeEach, describe, it } from 'vitest'

import { LayerAttribution } from '@/api/layers/AbstractLayer.class'
import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class.js'
import ExternalWMTSLayer from '@/api/layers/ExternalWMTSLayer.class.js'
import GeoAdminAggregateLayer from '@/api/layers/GeoAdminAggregateLayer.class.js'
import GeoAdminGeoJsonLayer from '@/api/layers/GeoAdminGeoJsonLayer.class.js'
import GeoAdminWMSLayer from '@/api/layers/GeoAdminWMSLayer.class'
import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class.js'
import KMLLayer from '@/api/layers/KMLLayer.class.js'
import LayerTimeConfig from '@/api/layers/LayerTimeConfig.class.js'
import LayerTimeConfigEntry from '@/api/layers/LayerTimeConfigEntry.class.js'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import { getServiceKmlBaseUrl } from '@/config/baseUrl.config'
import { parseLayersParam, transformLayerIntoUrlString } from '@/router/storeSync/layersParamParser'

describe('Testing layersParamParser', () => {
    const checkParsedLayer = (
        layer,
        id,
        visible = true,
        opacity = undefined,
        customAttributes = {}
    ) => {
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
        checkParsedLayer(layer, layerId, true, undefined, customAttributes)
    }

    describe('parseLayersParam', () => {
        it('Returns nothing if the query value is an empty array', () => {
            expect(parseLayersParam(null)).to.be.an('Array').empty
            expect(parseLayersParam(null)).to.be.an('Array').empty
        })
        it('Returns an object containing the layer info if a layer ID is in the query', () => {
            const layerId = 'fake-layer-id'
            const result = parseLayersParam(layerId)
            expect(result).to.be.an('Array').length(1)
            checkParsedLayer(result[0], layerId, true)
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
                    type: LayerTypes.KML,
                    id: 'somerandomurl.ch/file.kml',
                    baseUrl: 'somerandomurl.ch/file.kml',
                    opacity: 0.4,
                },
                {
                    type: LayerTypes.WMTS,
                    baseUrl: 'https://totally.fake.wmts.url/WMTSGetCapabilties.xml',
                    id: 'a.layer.id',
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
                checkParsedLayer(
                    results[index],
                    layer.id,
                    layer.visible,
                    layer.opacity,
                    layer.customAttributes
                )
            })
        })
        it('parses correctly a pre-selected feature on a layer', () => {
            const layerId = 'fake-layer-id'
            const featureId = '1234.050' // some of our IDs end with 0, we have to make sure they are treated as string and not numbers
            const result = parseLayersParam(`${layerId}@features=${featureId}`)
            checkParsedLayer(result[0], layerId, true, undefined, {
                features: featureId,
            })
        })
        it('parses correctly multiple pre-selected features on a single layer', () => {
            const layerId = 'fake-layer-id'
            const featureIds = ['1234.560', 'iAmSomeId']
            const result = parseLayersParam(`${layerId}@features=${featureIds.join(':')}`)
            checkParsedLayer(result[0], layerId, true, undefined, {
                features: featureIds.join(':'),
            })
        })

        describe('Visibility/Opacity parsing', () => {
            it('Parses correctly the visible when specified', () => {
                const layerId = 'fake-layer-id'
                const result = parseLayersParam(`${layerId},f`)
                checkParsedLayer(result[0], layerId, false)
            })
            it('Parses correctly the visible and opacity when both specified', () => {
                const layerId = 'fake-layer-id'
                const opacity = 0.36
                const result = parseLayersParam(`${layerId},f,${opacity}`)
                checkParsedLayer(result[0], layerId, false, opacity)
            })
            it('Sets default value to visible if it is ignored and opacity is set', () => {
                const layerId = 'fake-layer-id'
                const opacity = 0.5
                const result = parseLayersParam(`${layerId},,${opacity}`)
                checkParsedLayer(result[0], layerId, true, opacity)
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
                checkParsedLayer(layer, layerId, false, opacity, customParams)
            })
        })

        describe('External layer management', () => {
            it('parse correctly an external KML layer', () => {
                const kmlFileUrl = 'https://somerandomurl.ch/file.kml'
                const externalLayerUrlId = `KML|${kmlFileUrl}`
                const result = parseLayersParam(`${externalLayerUrlId},f,0.6`)
                expect(result).to.be.an('Array').with.lengthOf(1)
                const [layer] = result
                expect(layer).to.be.an('Object')
                expect(layer.type).to.eq(LayerTypes.KML)
                expect(layer.id).to.eq(kmlFileUrl)
                expect(layer.baseUrl).to.eq(kmlFileUrl)
                expect(layer.visible).to.be.false
                expect(layer.opacity).to.eq(0.6)
            })
            it('parses an external WMTS layer correctly', () => {
                const baseUrl = 'https://fake.wmts.admin.ch'
                const layerId = 'some_fake_layer_id'
                const externalLayerIdInUrl = `WMTS|${baseUrl}|${layerId}`
                const results = parseLayersParam(`${externalLayerIdInUrl},t,1.0`)
                expect(results).to.be.an('Array').length(1)
                const [externalWMTSLayer] = results
                expect(externalWMTSLayer).to.be.an('Object')
                expect(externalWMTSLayer.id).to.eq(layerId)
                expect(externalWMTSLayer.type).to.eq(LayerTypes.WMTS)
                expect(externalWMTSLayer.baseUrl).to.eq(baseUrl)
                expect(externalWMTSLayer.visible).to.be.true
                expect(externalWMTSLayer.opacity).to.eq(1.0)
            })
            it('parses an external WMS layer correctly', () => {
                const baseUrl = 'https://fake.wms.admin.ch'
                const layerId = 'some_fake_layer_id'
                const externalLayerIdInUrl = `WMS|${baseUrl}|${layerId}`
                const results = parseLayersParam(`${externalLayerIdInUrl},t,0.8`)
                expect(results).to.be.an('Array').length(1)
                const [externalWMSLayer] = results
                expect(externalWMSLayer).to.be.an('Object')
                expect(externalWMSLayer.id).to.eq(layerId)
                expect(externalWMSLayer.type).to.eq(LayerTypes.WMS)
                expect(externalWMSLayer.baseUrl).to.eq(baseUrl)
                expect(externalWMSLayer.visible).to.be.true
                expect(externalWMSLayer.opacity).to.eq(0.8)
            })
        })
    })
    describe('transformLayerIntoUrlString', () => {
        const attributions = [new LayerAttribution('fake layer attribution')]
        describe.each([
            {
                pristineLayer: new GeoAdminWMSLayer({
                    name: 'Fake layer',
                    id: 'fake.wms.id',
                    technicalName: 'fake.wms.id',
                    attributions,
                }),
                expectedLayerUrlId: 'fake.wms.id',
                testTime: true,
                testFeaturePreSelection: true,
            },
            {
                pristineLayer: new GeoAdminWMTSLayer({
                    name: 'fake WMTS layer',
                    id: 'fake.wmts.id',
                    technicalName: 'fake.wmts.id',
                    attributions,
                }),
                expectedLayerUrlId: 'fake.wmts.id',
                testTime: true,
            },
            {
                pristineLayer: new GeoAdminAggregateLayer({
                    name: 'fake aggregate layer',
                    id: 'fake.aggregate.id',
                    attributions,
                    subLayers: [
                        new GeoAdminWMSLayer({
                            name: 'sub layer 1',
                            id: 'sub.layer.id.1',
                            technicalName: 'sub.layer.id.1',
                            attributions,
                        }),
                        new GeoAdminWMSLayer({
                            name: 'sub layer 2',
                            id: 'sub.layer.id.2',
                            technicalName: 'sub.layer.id.2',
                            attributions,
                        }),
                    ],
                }),
                expectedLayerUrlId: 'fake.aggregate.id',
                testTime: false,
                testFeaturePreSelection: true,
            },
            {
                pristineLayer: new GeoAdminGeoJsonLayer({
                    name: 'fake GeoJSON layer',
                    id: 'fake.geojson.id',
                    geoJsonUrl: 'https://fake.geo.admin.ch',
                    styleUrl: 'https://fake.geo.admin.ch',
                    attributions,
                }),
                expectedLayerUrlId: 'fake.geojson.id',
                testTime: false,
                testFeaturePreSelection: true,
            },
            {
                pristineLayer: new KMLLayer({
                    // using an service-kml base URL to make it "internal"
                    kmlFileUrl: `${getServiceKmlBaseUrl()}fakeKmlId`,
                }),
                expectedLayerUrlId: `KML|${getServiceKmlBaseUrl()}fakeKmlId`,
                testTime: false,
                testFeaturePreSelection: false,
            },
            {
                pristineLayer: new KMLLayer({
                    // using any other URL as service-kml base URL to make it "external"
                    kmlFileUrl: 'https://some.random.domain.ch/file.kml',
                }),
                expectedLayerUrlId: 'KML|https://some.random.domain.ch/file.kml',
                testTime: false,
                testFeaturePreSelection: false,
            },
            {
                pristineLayer: new ExternalWMSLayer({
                    id: 'fake.external.wms',
                    name: 'Fake external WMS',
                    baseUrl: 'https://fake.wms.url?',
                    attributions,
                }),
                expectedLayerUrlId: 'WMS|https://fake.wms.url?|fake.external.wms',
                testTime: false,
                testFeaturePreSelection: true,
            },
            {
                pristineLayer: new ExternalWMTSLayer({
                    id: 'fake.external.wmts',
                    name: 'Fake external WMTS',
                    baseUrl: 'https://fake.wtms.url/getCap.xml',
                    attributions,
                }),
                expectedLayerUrlId: 'WMTS|https://fake.wtms.url/getCap.xml|fake.external.wmts',
                testTime: false,
                testFeaturePreSelection: true,
            },
            {
                pristineLayer: new ExternalWMSLayer({
                    id: 'fake.external.group',
                    name: 'Fake external group',
                    baseUrl: 'https://fake.wms.url?',
                    layers: [
                        new ExternalWMTSLayer({
                            id: 'fake.external.wmts',
                            name: 'Fake external WMTS',
                            baseUrl: 'https://fake.wtms.url/getCap.xml',
                            attributions,
                        }),
                    ],
                    attributions,
                }),
                expectedLayerUrlId: 'WMS|https://fake.wms.url?|fake.external.group',
                testTime: false,
                testFeaturePreSelection: true,
            },
        ])(
            'Test layers $pristineLayer.type isExternal: $pristineLayer.isExternal',
            ({
                pristineLayer,
                expectedLayerUrlId,
                testTime = false,
                testFeaturePreSelection = false,
            }) => {
                let layer
                beforeEach(() => {
                    layer = pristineLayer.clone()
                })
                it('correctly transforms a layer', () => {
                    expect(transformLayerIntoUrlString(layer, pristineLayer)).to.eq(
                        expectedLayerUrlId
                    )
                })
                it('does not add visibility flag if only opacity is defined', () => {
                    layer.opacity = 0.3
                    expect(transformLayerIntoUrlString(layer, pristineLayer)).to.eq(
                        `${expectedLayerUrlId},,0.3`
                    )
                })
                it('adds both visibility and opacity if not default values', () => {
                    layer.opacity = 0.3
                    layer.visible = false
                    expect(transformLayerIntoUrlString(layer, pristineLayer)).to.eq(
                        `${expectedLayerUrlId},f,0.3`
                    )
                })
                it('does not add opacity comma if set to default value', () => {
                    layer.visible = false
                    expect(transformLayerIntoUrlString(layer, pristineLayer)).to.eq(
                        `${expectedLayerUrlId},f`
                    )
                })
                if (testTime) {
                    it('handles correctly time as extra param', () => {
                        const wantedTimeEntry = new LayerTimeConfigEntry('20500101')
                        layer.timeConfig = new LayerTimeConfig('last', [
                            wantedTimeEntry,
                            // adding a bunch more
                            new LayerTimeConfigEntry('20000101'),
                            new LayerTimeConfigEntry('19500101'),
                        ])
                        layer.hasMultipleTimestamps = true
                        layer.timeConfig.currentTimeEntry = wantedTimeEntry
                        expect(transformLayerIntoUrlString(layer, pristineLayer)).to.eq(
                            `${expectedLayerUrlId}@year=2050`
                        )
                        // checking that the visibility flag and opacity are added AFTER the extra param
                        layer.opacity = 0.3
                        expect(transformLayerIntoUrlString(layer, pristineLayer)).to.eq(
                            `${expectedLayerUrlId}@year=2050,,0.3`
                        )
                    })
                }
                if (testFeaturePreSelection) {
                    it('handles correctly pre-selected feature IDs', () => {
                        const featureIds = ['123', 'feature_1']
                        expect(transformLayerIntoUrlString(layer, pristineLayer, featureIds)).to.eq(
                            `${expectedLayerUrlId}@features=${featureIds.join(':')}`
                        )
                    })
                }
            }
        )
        it('GeoAdmin GeoJSON layer : adds the updateDelay to the URL if not default value', () => {
            const geoJsonId = 'fake.geojson.id'
            const defaultUpdateDelay = 20000
            const geoJsonLayer = new GeoAdminGeoJsonLayer({
                name: 'fake GeoJSON layer',
                id: geoJsonId,
                geoJsonUrl: 'https://fake.geo.admin.ch',
                styleUrl: 'https://fake.geo.admin.ch',
                attributions,
                updateDelay: defaultUpdateDelay,
            })
            const layer = geoJsonLayer.clone()
            expect(transformLayerIntoUrlString(layer, geoJsonLayer)).to.eq(`${layer.id}`)
            layer.updateDelay = defaultUpdateDelay + 200
            expect(transformLayerIntoUrlString(layer, geoJsonLayer)).to.eq(
                `${layer.id}@updateDelay=${layer.updateDelay}`
            )
        })
    })
})
