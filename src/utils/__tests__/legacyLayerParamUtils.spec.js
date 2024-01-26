import { expect } from 'chai'
import { describe, it } from 'vitest'

import { LayerAttribution } from '@/api/layers/AbstractLayer.class'
import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import ExternalWMTSLayer from '@/api/layers/ExternalWMTSLayer.class'
import GeoAdminWMSLayer from '@/api/layers/GeoAdminWMSLayer.class'
import GeoAdminWMTSLayer from '@/api/layers/GeoAdminWMTSLayer.class'
import LayerTimeConfig from '@/api/layers/LayerTimeConfig.class'
import LayerTimeConfigEntry from '@/api/layers/LayerTimeConfigEntry.class'
import { getLayersFromLegacyUrlParams, isLayersUrlParamLegacy } from '@/utils/legacyLayerParamUtils'

describe('Test parsing of legacy URL param into new params', () => {
    describe('test getLayersFromLegacyUrlParams', () => {
        const fakeLayerConfig = [
            new GeoAdminWMSLayer(
                'Test layer WMS',
                'test.wms.layer',
                'test.wms.layer',
                0.8,
                true,
                [new LayerAttribution('attribution.test.wms.layer')],
                'https://base-url/',
                'png',
                new LayerTimeConfig()
            ),
            new GeoAdminWMTSLayer('Test layer WMTS', 'test.wmts.layer'),
            new GeoAdminWMTSLayer(
                'Test timed layer WMTS',
                'test.timed.wmts.layer',
                'test.timed.wmts.layer',
                0.8,
                true,
                [new LayerAttribution('attribution.test.timed.wmts.layer')],
                'png',
                new LayerTimeConfig('123', [
                    new LayerTimeConfigEntry('123'),
                    new LayerTimeConfigEntry('456'),
                    new LayerTimeConfigEntry('789'),
                ])
            ),
        ]
        it('Parses layers IDs and pass them along', () => {
            const result = getLayersFromLegacyUrlParams(fakeLayerConfig, 'layers=test.wms.layer')
            expect(result).to.be.an('Array').length(1)
            const [firstLayer] = result
            expect(firstLayer.getID()).to.eq('test.wms.layer')
        })
        it('Parses visibility when specified', () => {
            const checkOneLayerVisibility = (flagValue) => {
                const result = getLayersFromLegacyUrlParams(
                    fakeLayerConfig,
                    `layers=test.wms.layer&layers_visibility=${flagValue}`
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
            const result = getLayersFromLegacyUrlParams(fakeLayerConfig, 'layers=test.wms.layer')
            expect(result).to.be.an('Array').length(1)
            const [firstLayer] = result
            expect(firstLayer.visible).to.be.true
        })
        it('Parses opacity when specified', () => {
            const checkOneLayerOpacity = (opacity) => {
                const result = getLayersFromLegacyUrlParams(
                    fakeLayerConfig,
                    `layers=test.wms.layer&layers_opacity=${opacity}`
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
                    `layers=test.timed.wmts.layer&layers_timestamp=${timestamp}`
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
                'layers=test.wmts.layer,test.wms.layer,test.timed.wmts.layer&layers_opacity=0.6,0.5,0.8&layers_visibility=false,true,false&layers_timestamp=,,456'
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
                expect(layer.getID()).to.eq(expectedId)
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
                    `layers=KML||${kmlFileUrl}`
                )
                expect(result).to.be.an('Array').length(1)
                const [kmlLayer] = result
                expect(kmlLayer.getID()).to.eq(`KML|${kmlFileUrl}`)
                expect(kmlLayer.getURL()).to.eq(kmlFileUrl)
            })
            it('Handles opacity/visibility correctly with external layers', () => {
                const result = getLayersFromLegacyUrlParams(
                    fakeLayerConfig,
                    'layers=KML||https://we-dont-care-about-this-url&layers_opacity=0.65&layers_visibility=true'
                )
                expect(result).to.be.an('Array').length(1)
                const [kmlLayer] = result
                expect(kmlLayer.opacity).to.eq(0.65)
                expect(kmlLayer.visible).to.be.true
            })
            it('parses a legacy external WMS layer correctly', () => {
                const wmsLayerName = 'Name of the WMS layer'
                const wmsBaseUrl = 'https://fake.url?SERVICE=GetMap&'
                const wmsLayerId = 'fake.layer.id'
                const wmsVersion = '9.9.9'
                const legacyLayerUrlString = `WMS||${wmsLayerName}||${wmsBaseUrl}||${wmsLayerId}||${wmsVersion}`

                const result = getLayersFromLegacyUrlParams(
                    fakeLayerConfig,
                    `layers=${encodeURIComponent(
                        legacyLayerUrlString
                    )}&layers_opacity=0.45&layers_visibility=true`
                )
                expect(result).to.be.an('Array').length(1)
                const [externalWmsLayer] = result
                expect(externalWmsLayer).to.be.instanceof(ExternalWMSLayer)
                expect(externalWmsLayer.opacity).to.eq(0.45)
                expect(externalWmsLayer.wmsVersion).to.eq(wmsVersion)
                expect(externalWmsLayer.externalLayerId).to.eq(wmsLayerId)
                expect(externalWmsLayer.name).to.eq(wmsLayerName)
                expect(externalWmsLayer.baseURL).to.eq(wmsBaseUrl)
                // see ID format in adr/2021_03_16_url_param_structure.md
                // base URL must be encoded so that no & sign is present, otherwise it would break the URL param parsing
                expect(externalWmsLayer.getID()).to.eq(`WMS|${wmsBaseUrl}|${wmsLayerId}`)
            })
            it('parses a legacy external WMTS layer correctly', () => {
                const wmtsLayerId = 'fake.wmts.id'
                const wmtsGetCapabilitesUrl = 'https://fake.wmts.server/WMTSCapabilities.xml'
                const legacyLayerUrlString = encodeURIComponent(
                    `WMTS||${wmtsLayerId}||${wmtsGetCapabilitesUrl}`
                )
                const result = getLayersFromLegacyUrlParams(
                    fakeLayerConfig,
                    `layers=${legacyLayerUrlString}&layers_opacity=0.77&layers_visibility=false`
                )
                expect(result).to.be.an('Array').length(1)
                const [externalWmtsLayer] = result
                expect(externalWmtsLayer).to.be.instanceof(ExternalWMTSLayer)
                expect(externalWmtsLayer.opacity).to.eq(0.77)
                expect(externalWmtsLayer.visible).to.be.false
                expect(externalWmtsLayer.externalLayerId).to.eq(wmtsLayerId)
                expect(externalWmtsLayer.baseURL).to.eq(wmtsGetCapabilitesUrl)
                // see ID format in adr/2021_03_16_url_param_structure.md
                // as there was no definition of the layer name in the URL with the old external layer URL structure, we end up with the layer ID as name too
                expect(externalWmtsLayer.getID()).to.eq(
                    `WMTS|${wmtsGetCapabilitesUrl}|${wmtsLayerId}`
                )
            })
            it('does not parse an external layer if it is in the current format', () => {
                const wmtsResult = getLayersFromLegacyUrlParams(
                    fakeLayerConfig,
                    'WMTS|https://url.to.wmts.server|layer.id|LayerName'
                )
                expect(wmtsResult).to.be.an('Array').empty
                const wmsResult = getLayersFromLegacyUrlParams(
                    fakeLayerConfig,
                    `WMS|${'https://wms.server.url?PARAM1=x&'}|layer.id|5.4.3|LayerName`
                )
                expect(wmsResult).to.be.an('Array').empty
            })
        })
    })
    describe('test isLayersUrlParamLegacy', () => {
        it('recognize a valid new layers param as such', () => {
            expect(isLayersUrlParamLegacy('layer.id@time=123')).to.be.false
            expect(isLayersUrlParamLegacy('layer.id-layer-name-extension@time=123')).to.be.false
            expect(isLayersUrlParamLegacy('layer.id_layername_extension@time=123')).to.be.false
            expect(isLayersUrlParamLegacy('layer.id,f')).to.be.false
            expect(isLayersUrlParamLegacy('layer.id@time=123,f')).to.be.false
            expect(isLayersUrlParamLegacy('layer.id,,0.5')).to.be.false
            expect(isLayersUrlParamLegacy('layer.id@time=123,,0.5')).to.be.false
        })
        it('recognize many layers with the new syntax as non legacy', () => {
            expect(
                isLayersUrlParamLegacy(
                    'layer.id,,0.5;layer.id.2;layer.id.3,f;layer.id.4@time=123,,0.5'
                )
            ).to.be.false
        })
        it('detects single layers without any parameter as legacy', () => {
            expect(isLayersUrlParamLegacy('layer.id')).to.be.true
            expect(isLayersUrlParamLegacy('layer.id.finish.with.t')).to.be.true
            expect(isLayersUrlParamLegacy('layer.id-layer-name-extension')).to.be.true
            expect(isLayersUrlParamLegacy('layer.id_layer_name_extension')).to.be.true
        })
        it('detects old layers syntax with any number of layers as legacy', () => {
            expect(isLayersUrlParamLegacy('layer.id,layer.id.2,layer.id_3')).to.be.true
        })
        it('detects legacy external URL structure correctly', () => {
            expect(
                isLayersUrlParamLegacy(
                    encodeURIComponent(
                        'WMTS||fake.layer.id||https://fake.get.cap.url/WMTSGetCapabilities.xml'
                    )
                )
            ).to.be.true
            expect(
                isLayersUrlParamLegacy(
                    encodeURIComponent(
                        'WMS||fake layer name||https://fake.wms.server/||fake.wms.layer_id||0.0.0'
                    )
                )
            ).to.be.true
        })
        it("doesn't detect the new external layer format as legacy", () => {
            expect(
                isLayersUrlParamLegacy(
                    'WMTS|https://fake.get.cap.url/WMTSGetCapabilities.xml|fake.layer.id|Layer name'
                )
            ).to.be.false
            expect(
                isLayersUrlParamLegacy(
                    'WMS|https://base.url/|wms.layer_id|2.2.2|External layer name'
                )
            ).to.be.false
        })
    })
})
