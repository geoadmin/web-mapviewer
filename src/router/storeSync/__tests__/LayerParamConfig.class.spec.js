import { expect } from 'chai'
import { describe, it } from 'vitest'

import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import ExternalWMTSLayer from '@/api/layers/ExternalWMTSLayer.class'
import KMLLayer from '@/api/layers/KMLLayer.class'
import LayerTypes from '@/api/layers/LayerTypes.enum.js'
import { getServiceKmlBaseUrl } from '@/config/baseUrl.config'
import { createLayerObject } from '@/router/storeSync/LayerParamConfig.class'

describe('External layer parsing with createLayerObject', () => {
    it('parses a KML layer correctly', () => {
        const kmlFileId = '1234567abc'
        const kmlFileUrl = `https://${getServiceKmlBaseUrl()}/api/kml/files/${kmlFileId}`
        const result = createLayerObject({
            type: LayerTypes.KML,
            id: kmlFileUrl,
            baseUrl: kmlFileUrl,
            visible: true,
            opacity: 0.8,
        })
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
        const result = createLayerObject({
            type: LayerTypes.KML,
            id: kmlFileUrl,
            baseUrl: kmlFileUrl,
            visible: true,
            opacity: 0.8,
        })
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
        const result = createLayerObject({
            type: LayerTypes.WMS,
            id: wmsLayerId,
            baseUrl: wmsBaseUrl,
            visible: true,
            opacity: 0.8,
        })
        expect(result).to.be.an.instanceof(ExternalWMSLayer)
        expect(result.baseUrl).to.eq(wmsBaseUrl)
        expect(result.wmsVersion).to.eq(wmsVersion)
        expect(result.id).to.eq(wmsLayerId)
    })
    it('parses an external WMTS layer correctly', () => {
        const wmtsGetCapUrl = 'https://base.wmts.url/getCapabilitiesEndpoint.xml'
        const wmtsLayerId = 'random.wmts.layer_id'
        const result = createLayerObject({
            type: LayerTypes.WMTS,
            id: wmtsLayerId,
            baseUrl: wmtsGetCapUrl,
            visible: true,
            opacity: 0.8,
        })
        expect(result).to.be.an.instanceof(ExternalWMTSLayer)
        expect(result.baseUrl).to.eq(wmtsGetCapUrl)
        expect(result.id).to.eq(wmtsLayerId)
    })
})
