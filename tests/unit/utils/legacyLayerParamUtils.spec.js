import { expect } from 'chai'
import WMSLayer from '@/api/layers/WMSLayer.class'
import LayerTimeConfig from '@/api/layers/LayerTimeConfig.class'
import { getLayersFromLegacyUrlParams, isLayersUrlParamLegacy } from '@/utils/legacyLayerParamUtils'
import WMTSLayer from '@/api/layers/WMTSLayer.class'

describe('Test parsing of legacy URL param into new params', () => {
    context('test getLayersFromLegacyUrlParams', () => {
        const fakeLayerConfig = [
            new WMSLayer(
                'Test layer WMS',
                'test.wms.layer',
                0.8,
                'attribution.test.wms.layer',
                null,
                'https://base-url/',
                'png',
                new LayerTimeConfig()
            ),
            new WMTSLayer('Test layer WMTS', 'test.wmts.layer'),
            new WMTSLayer(
                'Test timed layer WMTS',
                'test.timed.wmts.layer',
                0.8,
                'attribution.test.timed.wmts.layer',
                null,
                'png',
                new LayerTimeConfig('123', ['123', '456', '789'])
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
                    `layers=test.timed.wmts.layer&layers_timestamps=${timestamp}`
                )
                expect(result).to.be.an('Array').length(1)
                const [firstLayer] = result
                expect(firstLayer).to.haveOwnProperty('timeConfig')
                expect(firstLayer.timeConfig).to.haveOwnProperty('currentTimestamp')
                expect(firstLayer.timeConfig.currentTimestamp).to.eq(timestamp)
            }
            fakeLayerConfig[2].timeConfig.series.forEach((timestamp) =>
                checkOneLayerTimestamps(timestamp)
            )
        })
        it('Parses multiples layers with all params set', () => {
            const result = getLayersFromLegacyUrlParams(
                fakeLayerConfig,
                'layers=test.wmts.layer,test.wms.layer,test.timed.wmts.layer&layers_opacity=0.6,0.5,0.8&layers_visibility=false,true,false&layers_timestamps=,,456'
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
                    expect(layer.timeConfig).to.haveOwnProperty('currentTimestamp')
                    expect(layer.timeConfig.currentTimestamp).to.eq(expecedTimestamp)
                }
            }
            checkLayer(wmtsLayer, 'test.wmts.layer', 0.6, false)
            checkLayer(wmsLayer, 'test.wms.layer', 0.5, true)
            checkLayer(timedWmtsLayer, 'test.timed.wmts.layer', 0.8, false, '456')
        })
        it('Parses KML layers IDs correctly', () => {
            const kmlFileUrl = 'https://public.geo.admin.ch/super-legit-file-id'
            const result = getLayersFromLegacyUrlParams(
                fakeLayerConfig,
                `layers=KML||${encodeURIComponent(kmlFileUrl)}`
            )
            expect(result).to.be.an('Array').length(1)
            const [kmlLayer] = result
            expect(kmlLayer.getID()).to.eq(`KML|${kmlFileUrl}|Drawing`)
            expect(kmlLayer.getURL()).to.eq(kmlFileUrl)
        })
        it('Handles opacity/visibility correctly with external layers', () => {
            const result = getLayersFromLegacyUrlParams(
                fakeLayerConfig,
                'layers=KML||we-dont-care-about-this-url&layers_opacity=0.65&layers_visibility=true'
            )
            expect(result).to.be.an('Array').length(1)
            const [kmlLayer] = result
            expect(kmlLayer.opacity).to.eq(0.65)
            expect(kmlLayer.visible).to.be.true
        })
    })
    context('test isLayersUrlParamLegacy', () => {
        it('recognize a valid new layers param as such', () => {
            expect(isLayersUrlParamLegacy('layer.id')).to.be.false
            expect(isLayersUrlParamLegacy('layer.id@time=123')).to.be.false
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
        it('detects old layers syntax with many layers as legacy', () => {
            expect(isLayersUrlParamLegacy('layer.id,layer.id')).to.be.true
        })
    })
})
