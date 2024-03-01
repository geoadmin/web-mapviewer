import { expect } from 'chai'
import { describe, it } from 'vitest'

import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import ExternalWMTSLayer from '@/api/layers/ExternalWMTSLayer.class'
import KMLLayer from '@/api/layers/KMLLayer.class'
import { API_SERVICE_KML_BASE_URL } from '@/config'
import { createLayerObject } from '@/router/storeSync/LayerParamConfig.class'
import { ActiveLayerConfig } from '@/utils/layerUtils'

describe('External layer parsing with createLayerObject', () => {
    it('parses a KML layer correctly', () => {
        const kmlFileId = '1234567abc'
        const kmlFileUrl = `https://${API_SERVICE_KML_BASE_URL}/api/kml/files/${kmlFileId}`
        const result = createLayerObject(new ActiveLayerConfig(`KML|${kmlFileUrl}`, true, 0.8))
        expect(result).to.be.an.instanceof(KMLLayer)
        expect(result.opacity).to.eq(0.8)
        expect(result.visible).to.be.true
        expect(result.name).to.equal('KML')
        expect(result.kmlFileUrl).to.eq(kmlFileUrl)
        expect(result.adminId).to.be.null // no admin ID in URL
        expect(result.fileId).to.be.eq(kmlFileId)
    })
    it('parses a KML external layer correctly', () => {
        const kmlFileId = '1234567abc'
        const kmlFileUrl = `https://totally.random.kml.url/${kmlFileId}`
        const result = createLayerObject(new ActiveLayerConfig(`KML|${kmlFileUrl}`, true, 0.8))
        expect(result).to.be.an.instanceof(KMLLayer)
        expect(result.opacity).to.eq(0.8)
        expect(result.visible).to.be.true
        expect(result.name).to.equal('KML')
        expect(result.kmlFileUrl).to.eq(kmlFileUrl)
        expect(result.adminId).to.be.null // no admin ID in URL
        expect(result.fileId).to.be.null
    })
    it('parses an external WMS layer correctly', () => {
        const wmsBaseUrl = 'https://base.wms.url/?SERVICE=GetMap'
        const wmsVersion = '1.3.0'
        const wmsLayerId = 'random.wms.layer_id'
        const parsedLayer = new ActiveLayerConfig(`WMS|${wmsBaseUrl}|${wmsLayerId}`, true, 0.8)
        const result = createLayerObject(parsedLayer)
        expect(result).to.be.an.instanceof(ExternalWMSLayer)
        expect(result.baseUrl).to.eq(wmsBaseUrl)
        expect(result.wmsVersion).to.eq(wmsVersion)
        expect(result.externalLayerId).to.eq(wmsLayerId)
    })
    it('parses an external WMTS layer correctly', () => {
        const wmtsGetCapUrl = 'https://base.wmts.url/getCapabilitiesEndpoint.xml'
        const wmtsLayerId = 'random.wmts.layer_id'
        const parsedLayer = new ActiveLayerConfig(`WMTS|${wmtsGetCapUrl}|${wmtsLayerId}`, true, 0.8)
        const result = createLayerObject(parsedLayer)
        expect(result).to.be.an.instanceof(ExternalWMTSLayer)
        expect(result.baseUrl).to.eq(wmtsGetCapUrl)
        expect(result.externalLayerId).to.eq(wmtsLayerId)
    })
})
