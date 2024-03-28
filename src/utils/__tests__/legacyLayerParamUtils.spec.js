import { expect } from 'chai'
import { describe, it } from 'vitest'

import { LayerAttribution } from '@/api/layers/AbstractLayer.class'
import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import ExternalWMTSLayer from '@/api/layers/ExternalWMTSLayer.class'
import GeoAdminWMSLayer from '@/api/layers/GeoAdminWMSLayer.class'
import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import LayerTimeConfig from '@/api/layers/LayerTimeConfig.class'
import LayerTimeConfigEntry from '@/api/layers/LayerTimeConfigEntry.class'
import {
    createLayersParamForFeaturePreselection,
    getLayersFromLegacyUrlParams,
    isLegacyParams,
    parseOpacity,
} from '@/utils/legacyLayerParamUtils'

describe('Test parsing of legacy URL param into new params', () => {
    describe('test getLayersFromLegacyUrlParams', () => {
        const fakeLayerConfig = [
            new GeoAdminWMSLayer({
                name: 'Test layer WMS',
                geoAdminId: 'test.wms.layer',
                technicalName: 'test.wms.layer',
                opacity: 0.8,
                attributions: [new LayerAttribution('attribution.test.wms.layer')],
                baseUrl: 'https://base-url/',
                format: 'png',
                timeConfig: new LayerTimeConfig(),
            }),
            new GeoAdminWMTSLayer({
                name: 'Test layer WMTS',
                geoAdminId: 'test.wmts.layer',
                technicalName: 'test.wmts.layer',
                attributions: [new LayerAttribution('test')],
            }),
            new GeoAdminWMTSLayer({
                name: 'Test timed layer WMTS',
                technicalName: 'test.timed.wmts.layer',
                geoAdminId: 'test.timed.wmts.layer',
                opacity: 0.8,
                attributions: [new LayerAttribution('attribution.test.timed.wmts.layer')],
                timeConfig: new LayerTimeConfig('123', [
                    new LayerTimeConfigEntry('123'),
                    new LayerTimeConfigEntry('456'),
                    new LayerTimeConfigEntry('789'),
                ]),
            }),
        ]
        it('Parses layers IDs and pass them along', () => {
            const result = getLayersFromLegacyUrlParams(
                fakeLayerConfig,
                'test.wms.layer',
                undefined,
                undefined,
                undefined
            )
            expect(result).to.be.an('Array').length(1)
            const [firstLayer] = result
            expect(firstLayer.id).to.eq('test.wms.layer')
        })
        it('Parses visibility when specified', () => {
            const checkOneLayerVisibility = (flagValue) => {
                const result = getLayersFromLegacyUrlParams(
                    fakeLayerConfig,
                    `test.wms.layer`,
                    `${flagValue}`,
                    undefined,
                    undefined
                )
                expect(result).to.be.an('Array').length(1)
                const [firstLayer] = result
                expect(firstLayer).to.haveOwnProperty('visible')
                expect(firstLayer.visible).to.eq(
                    flagValue,
                    'param layer_visibility was not parsed correctly'
                )
            }
            checkOneLayerVisibility(true)
            checkOneLayerVisibility(false)
        })
        it('sets visibility to true when layers_visibility is not present', () => {
            const result = getLayersFromLegacyUrlParams(
                fakeLayerConfig,
                'test.wms.layer',
                undefined,
                undefined,
                undefined
            )
            expect(result).to.be.an('Array').length(1)
            const [firstLayer] = result
            expect(firstLayer.visible).to.be.true
        })
        it('Parses opacity when specified', () => {
            const checkOneLayerOpacity = (opacity) => {
                const result = getLayersFromLegacyUrlParams(
                    fakeLayerConfig,
                    `test.wms.layer`,
                    undefined,
                    `${opacity}`,
                    undefined
                )
                expect(result).to.be.an('Array').length(1)
                const [firstLayer] = result
                expect(firstLayer).to.haveOwnProperty('opacity')
                expect(firstLayer.opacity).to.eq(opacity)
            }
            for (let i = 0; i <= 10; i += 1) {
                checkOneLayerOpacity(i / 10.0)
            }
        })
        it('Parses timestamps when specified', () => {
            const checkOneLayerTimestamps = (timestamp) => {
                const result = getLayersFromLegacyUrlParams(
                    fakeLayerConfig,
                    `test.timed.wmts.layer`,
                    undefined,
                    undefined,
                    `${timestamp}`
                )
                expect(result).to.be.an('Array').length(1)
                const [firstLayer] = result
                expect(firstLayer).to.haveOwnProperty('timeConfig')
                expect(firstLayer.timeConfig.currentTimestamp).to.eq(timestamp)
            }
            fakeLayerConfig[2].timeConfig.timeEntries.forEach((entry) =>
                checkOneLayerTimestamps(entry.timestamp)
            )
        })
        it('Parses multiples layers with all params set', () => {
            const result = getLayersFromLegacyUrlParams(
                fakeLayerConfig,
                'test.wmts.layer,test.wms.layer,test.timed.wmts.layer',
                'false,true,false',
                '0.6,0.5,0.8',
                ',,456'
            )
            expect(result).to.be.an('Array').length(3)
            const [wmtsLayer, wmsLayer, timedWmtsLayer] = result
            const checkLayer = (
                layer,
                expectedId,
                expectedOpacity,
                expectedVisibility,
                expecedTimestamp = undefined
            ) => {
                expect(layer.id).to.eq(expectedId)
                expect(layer).to.haveOwnProperty('opacity')
                expect(layer.opacity).to.eq(expectedOpacity)
                expect(layer).to.haveOwnProperty('visible')
                expect(layer.visible).to.eq(expectedVisibility)
                if (expecedTimestamp) {
                    expect(layer).to.haveOwnProperty('timeConfig')
                    expect(layer.timeConfig.currentTimestamp).to.eq(expecedTimestamp)
                }
            }
            checkLayer(wmtsLayer, 'test.wmts.layer', 0.6, false)
            checkLayer(wmsLayer, 'test.wms.layer', 0.5, true)
            checkLayer(timedWmtsLayer, 'test.timed.wmts.layer', 0.8, false, '456')
        })
        describe('support for legacy external layers URL format', () => {
            it('Parses KML layers IDs correctly', () => {
                const kmlFileUrl = 'https://public.geo.admin.ch/super-legit-file-id'
                const result = getLayersFromLegacyUrlParams(
                    fakeLayerConfig,
                    `KML||${kmlFileUrl}`,
                    undefined,
                    undefined,
                    undefined
                )
                expect(result).to.be.an('Array').length(1)
                const [kmlLayer] = result
                expect(kmlLayer.id).to.eq(`KML|${kmlFileUrl}`)
                expect(kmlLayer.baseUrl).to.eq(kmlFileUrl)
            })
            it('Handles opacity/visibility correctly with external layers', () => {
                const result = getLayersFromLegacyUrlParams(
                    fakeLayerConfig,
                    'KML||https://we-dont-care-about-this-url',
                    'true',
                    '0.65',
                    undefined
                )
                expect(result).to.be.an('Array').length(1)
                const [kmlLayer] = result
                expect(kmlLayer.opacity).to.eq(0.65)
                expect(kmlLayer.visible).to.be.true
            })
            it('parses a legacy external WMS layer correctly', () => {
                const wmsLayerName = 'Name of the WMS layer, with a comma'
                const wmsBaseUrl = 'https://fake.url?SERVICE=GetMap&'
                const wmsLayerId = 'fake.layer.id'
                const wmsVersion = '9.9.9'
                const legacyLayerUrlString = `WMS||${wmsLayerName}||${wmsBaseUrl}||${wmsLayerId}||${wmsVersion}`

                const result = getLayersFromLegacyUrlParams(
                    fakeLayerConfig,
                    `${encodeURIComponent(legacyLayerUrlString)}`,
                    `true`,
                    `0.45`,
                    undefined
                )
                expect(result).to.be.an('Array').length(1)
                const [externalWmsLayer] = result
                expect(externalWmsLayer).to.be.instanceof(ExternalWMSLayer)
                expect(externalWmsLayer.opacity).to.eq(0.45)
                expect(externalWmsLayer.wmsVersion).to.eq(wmsVersion)
                expect(externalWmsLayer.id).to.eq(wmsLayerId)
                expect(externalWmsLayer.name).to.eq(wmsLayerName)
                expect(externalWmsLayer.baseUrl).to.eq(wmsBaseUrl)
                // see ID format in adr/2021_03_16_url_param_structure.md
                // base URL must be encoded so that no & sign is present, otherwise it would break the URL param parsing
                expect(externalWmsLayer.urlId).to.eq(`WMS|${wmsBaseUrl}|${wmsLayerId}`)
            })
            it('parses a legacy external WMTS layer correctly', () => {
                const wmtsLayerId = 'fake.wmts.id'
                const wmtsGetCapabilitesUrl = 'https://fake.wmts.server/WMTSCapabilities.xml'
                const legacyLayerUrlString = encodeURIComponent(
                    `WMTS||${wmtsLayerId}||${wmtsGetCapabilitesUrl}`
                )
                const result = getLayersFromLegacyUrlParams(
                    fakeLayerConfig,
                    `${legacyLayerUrlString}`,
                    `false`,
                    `0.77`,
                    undefined
                )
                expect(result).to.be.an('Array').length(1)
                const [externalWmtsLayer] = result
                expect(externalWmtsLayer).to.be.instanceof(ExternalWMTSLayer)
                expect(externalWmtsLayer.opacity).to.eq(0.77)
                expect(externalWmtsLayer.visible).to.be.false
                expect(externalWmtsLayer.id).to.eq(wmtsLayerId)
                expect(externalWmtsLayer.baseUrl).to.eq(wmtsGetCapabilitesUrl)
                // see ID format in adr/2021_03_16_url_param_structure.md
                // as there was no definition of the layer name in the URL with the old external layer URL structure, we end up with the layer ID as name too
                expect(externalWmtsLayer.urlId).to.eq(
                    `WMTS|${wmtsGetCapabilitesUrl}|${wmtsLayerId}`
                )
            })
            it('does not parse an external layer if it is in the current format', () => {
                const wmtsResult = getLayersFromLegacyUrlParams(
                    fakeLayerConfig,
                    'WMTS|https://url.to.wmts.server|layer.id',
                    undefined,
                    undefined,
                    undefined
                )
                expect(wmtsResult).to.be.an('Array').empty
                const wmsResult = getLayersFromLegacyUrlParams(
                    fakeLayerConfig,
                    `WMS|${'https://wms.server.url?PARAM1=x&'}|layer.id`,
                    undefined,
                    undefined,
                    undefined
                )
                expect(wmsResult).to.be.an('Array').empty
            })
            describe('utility functions for legacy Parameter Handling', () => {
                it('ensure the parseOpacity Function always returns a valid value', () => {
                    const correct_opacity = parseOpacity(0.321)
                    expect(correct_opacity).to.equal(0.321)
                    const opacity_too_low = parseOpacity(-0.2)
                    expect(opacity_too_low).to.equal(0)
                    const opacity_too_high = parseOpacity(1.45)
                    expect(opacity_too_high).to.equal(1)
                    const opacity_NaN = parseOpacity('test')
                    expect(opacity_NaN).to.equal(1)
                })
                it('Makes sure the isLegacyParams function recognize a legacy URL', () => {
                    expect(isLegacyParams('?test=true')).to.equal(true)
                    expect(isLegacyParams('/?test=true')).to.equal(true)
                    expect(isLegacyParams('/?test')).to.equal(true)
                })
                it("Makes sure the isLegacyParams function don't match new URL", () => {
                    expect(isLegacyParams(undefined)).to.equal(false)
                    expect(isLegacyParams(null)).to.equal(false)
                    expect(isLegacyParams('')).to.equal(false)
                    expect(isLegacyParams('/?')).to.equal(false)
                    expect(isLegacyParams('?')).to.equal(false)
                    expect(isLegacyParams('#/map?test')).to.equal(false)
                    expect(isLegacyParams('/#/map?test')).to.equal(false)
                    expect(isLegacyParams('#?test=false')).to.equal(false)
                    expect(isLegacyParams('#/?test=false')).to.equal(false)
                })
            })
        })
        describe('ensure layers parameter handler for feature preselection works as intended', () => {
            /**
             * Small precision regarding the createLayersParamForFeaturePreselection, which is what
             * we are testing here : This function is only called when : there is a layer-id
             * parameter set and that layer is already within the query 'layers' parameters. This
             * means we do not need to test if there is no param_key set, or if there is no layers
             * set
             */

            // This function deals mostly with the special parameters and features id order,
            // As they are not important, but could break the tests if we made a simple string comparison
            // layer.id@time=123@features=1,2 is the same end result as layer.id@features=2,1@time=123
            function compareLayersStrings(layerString1, layerString2) {
                const [layer1AndParams, visibility1, opacity1] = layerString1.split(',')
                const [layer2AndParams, visibility2, opacity2] = layerString2.split(',')
                expect(visibility1).to.eq(visibility2)
                expect(opacity1).to.eq(opacity2)
                const layer1Split = layer1AndParams.split('@')
                const layer2Split = layer2AndParams.split('@')
                layer1Split.sort()
                layer2Split.sort()
                expect(layer1Split.length).to.eq(layer2Split.length)
                for (let i = 0; i < layer1Split.length; i++) {
                    if (layer1Split[i].includes('features')) {
                        expect(layer2Split[i].includes('features')).to.eq(true)
                        const features_1 = layer1Split[i].split('=')[1].split(':')

                        const features_2 = layer2Split[i].split('=')[1].split(':')
                        features_1.sort()
                        features_2.sort()
                        expect(features_1.join(':')).to.eq(features_2.join(':'))
                    } else {
                        expect(layer1Split[i]).to.eq(layer2Split[i])
                    }
                }
            }
            function testLayersStringCreation(params) {
                const result = createLayersParamForFeaturePreselection(
                    params.layerId,
                    params.featuresId,
                    params.layers
                )

                const [layer1, layer2] = result.split(';')
                const [expectedLayer1, expectedLayer2] = params.expectedResult.split(';')
                compareLayersStrings(layer1, expectedLayer1)
                compareLayersStrings(layer2, expectedLayer2)
            }
            it('adds a Feature parameter when the layer has no parameter at all', () => {
                const params = {
                    layerId: 'layer.id',
                    featuresId: '1,2,3',
                    layers: 'layer.id;layer.id2',
                    expectedResult: 'layer.id@features=1:2:3;layer.id2',
                }
                testLayersStringCreation(params)
            })
            it('adds a Feature parameter when the layer only has visibility and opacity params', () => {
                const params = {
                    layerId: 'layer.id',
                    featuresId: '1,2,3',
                    layers: 'layer.id,,0.3;layer.id2',
                    expectedResult: 'layer.id@features=1:2:3,,0.3;layer.id2',
                }
                testLayersStringCreation(params)
            })
            it('adds a Feature parameter when there is a time parameter given', () => {
                const params = {
                    layerId: 'layer.id',
                    featuresId: '1,2,3',
                    layers: 'layer.id@time=1234;layer.id2',
                    expectedResult: 'layer.id@time=1234@features=1:2:3;layer.id2',
                }
                testLayersStringCreation(params)
            })
            it("combines existing features between the already given features and the legacy parameter's features", () => {
                const params = {
                    layerId: 'layer.id',
                    featuresId: '1,2,3',
                    layers: 'layer.id@features=3:4:5;layer.id2',
                    expectedResult: 'layer.id@features=1:2:3:4:5;layer.id2',
                }
                testLayersStringCreation(params)
            })
            it('combines existing features when all parameters are set', () => {
                const params = {
                    layerId: 'layer.id',
                    featuresId: '1,2,3',
                    layers: 'layer.id@features=3:4:5@time=1234,f,0.2;layer.id2',
                    expectedResult: 'layer.id@time=1234@features=1:2:3:4:5,f,0.2;layer.id2',
                }
                testLayersStringCreation(params)
            })
            it('does not add a feature parameter when the feature ids are an empty string', () => {
                const params = {
                    layerId: 'layer.id',
                    featuresId: '',
                    layers: 'layer.id;layer.id2',
                    expectedResult: 'layer.id;layer.id2',
                }
                testLayersStringCreation(params)
            })
            it('does not add a feature parameter when the feature ids are null', () => {
                // I am not certain this is possible, but I prefer to test it anyway
                const params = {
                    layerId: 'layer.id',
                    featuresId: null,
                    layers: 'layer.id;layer.id2',
                    expectedResult: 'layer.id;layer.id2',
                }
                testLayersStringCreation(params)
            })
            it('does not add a feature parameter when the feature ids are all empty strings', () => {
                const params = {
                    layerId: 'layer.id',
                    featuresId: ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
                    layers: 'layer.id;layer.id2',
                    expectedResult: 'layer.id;layer.id2',
                }
                testLayersStringCreation(params)
            })
            it('adds a feature value for each non empty string in the features ids', () => {
                const params = {
                    layerId: 'layer.id',
                    featuresId: ',,,,,,,,,,,,,,,,,,,,,1,,,,,,,,,,,,,,,,,,,,,,,,34',
                    layers: 'layer.id;layer.id2',
                    expectedResult: 'layer.id@features=1:34;layer.id2',
                }
                testLayersStringCreation(params)
            })
            it('preserve an existing feature parameter when there are no features Ids to add', () => {
                const params = {
                    layerId: 'layer.id',
                    featuresId: ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,',
                    layers: 'layer.id@features=12:14;layer.id2',
                    expectedResult: 'layer.id@features=12:14;layer.id2',
                }
                testLayersStringCreation(params)
            })
        })
    })
})
