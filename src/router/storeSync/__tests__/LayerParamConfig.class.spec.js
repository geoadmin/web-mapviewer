import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import ExternalWMTSLayer from '@/api/layers/ExternalWMTSLayer.class'
import KMLLayer from '@/api/layers/KMLLayer.class'
import { transformParsedExternalLayerIntoObject } from '@/router/storeSync/LayerParamConfig.class'
import { ActiveLayerConfig } from '@/store/modules/layers.store'
import { expect } from 'chai'
import { describe, it } from 'vitest'

describe('External layer parsing with transformParsedExternalLayerIntoObject', () => {
    it('parses a KML layer correctly', () => {
        const kmlFileId = '1234567abc'
        const kmlFileUrl = `https://totally.random.kml.url/${kmlFileId}`
        const kmlLayerName = 'What about some name?'
        const result = transformParsedExternalLayerIntoObject(
            new ActiveLayerConfig(`KML|${kmlFileUrl}|${kmlLayerName}`, true, 0.8)
        )
        expect(result).to.be.an.instanceof(KMLLayer)
        expect(result.opacity).to.eq(0.8)
        expect(result.visible).to.be.true
        expect(result.name).to.equal(kmlLayerName)
        expect(result.kmlFileUrl).to.eq(kmlFileUrl)
        expect(result.adminId).to.be.null // no admin ID in URL
        expect(result.fileId).to.eq(kmlFileId)
    })
    it('parses an external WMS layer correctly', () => {
        const wmsBaseUrl = 'https://base.wms.url/?SERVICE=GetMap'
        const wmsVersion = '4.5.6'
        const wmsLayerId = 'random.wms.layer_id'
        const wmsLayerName = 'Totally random name'
        const parsedLayer = new ActiveLayerConfig(
            `WMS|${encodeURIComponent(wmsBaseUrl)}|${wmsLayerId}|${wmsVersion}|${encodeURIComponent(
                wmsLayerName
            )}`,
            true,
            0.8
        )
        const result = transformParsedExternalLayerIntoObject(parsedLayer)
        expect(result).to.be.an.instanceof(ExternalWMSLayer)
        expect(result.baseURL).to.eq(wmsBaseUrl)
        expect(result.wmsVersion).to.eq(wmsVersion)
        expect(result.externalLayerId).to.eq(wmsLayerId)
        expect(result.name).to.eq(wmsLayerName)
    })
    it('parses an external WMTS layer correctly', () => {
        const wmtsGetCapUrl = 'https://base.wmts.url/getCapabilitiesEndpoint.xml'
        const wmtsLayerId = 'random.wmts.layer_id'
        const wmtsLayerName = 'Another random name'
        const parsedLayer = new ActiveLayerConfig(
            `WMTS|${encodeURIComponent(wmtsGetCapUrl)}|${wmtsLayerId}|${encodeURIComponent(
                wmtsLayerName
            )}`,
            true,
            0.8
        )
        const result = transformParsedExternalLayerIntoObject(parsedLayer)
        expect(result).to.be.an.instanceof(ExternalWMTSLayer)
        expect(result.baseURL).to.eq(wmtsGetCapUrl)
        expect(result.externalLayerId).to.eq(wmtsLayerId)
        expect(result.name).to.eq(wmtsLayerName)
    })
})
