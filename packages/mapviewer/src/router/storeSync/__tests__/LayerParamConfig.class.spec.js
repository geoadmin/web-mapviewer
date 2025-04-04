import { LayerType } from '@geoadmin/layers'
import { expect } from 'chai'
import { describe, it } from 'vitest'

import { getServiceKmlBaseUrl } from '@/config/baseUrl.config'
import { createLayerObject, validateUrlInput } from '@/router/storeSync/LayerParamConfig.class'

describe('External layer parsing with createLayerObject', () => {
    it('parses a KML layer correctly', () => {
        const kmlFileId = '1234567abc'
        const kmlFileUrl = `https://${getServiceKmlBaseUrl()}/api/kml/files/${kmlFileId}`
        const { layer: result } = createLayerObject({
            type: LayerType.KML,
            id: kmlFileUrl,
            baseUrl: kmlFileUrl,
            visible: true,
            opacity: 0.8,
        })
        expect(result.type).to.eq(LayerType.KML)
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
        const { layer: result } = createLayerObject({
            type: LayerType.KML,
            id: kmlFileUrl,
            baseUrl: kmlFileUrl,
            visible: true,
            opacity: 0.8,
        })
        expect(result.type).to.eq(LayerType.KML)
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
        const { layer: result } = createLayerObject({
            type: LayerType.WMS,
            id: wmsLayerId,
            baseUrl: wmsBaseUrl,
            visible: true,
            opacity: 0.8,
        })
        expect(result.type).to.equal(LayerType.WMS)
        expect(result.baseUrl).to.eq(wmsBaseUrl)
        expect(result.wmsVersion).to.eq(wmsVersion)
        expect(result.id).to.eq(wmsLayerId)
    })
    it('parses an external WMTS layer correctly', () => {
        const wmtsGetCapUrl = 'https://base.wmts.url/getCapabilitiesEndpoint.xml'
        const wmtsLayerId = 'random.wmts.layer_id'
        const { layer: result } = createLayerObject({
            type: LayerType.WMTS,
            id: wmtsLayerId,
            baseUrl: wmtsGetCapUrl,
            visible: true,
            opacity: 0.8,
        })
        expect(result.type).to.equal(LayerType.WMTS)
        expect(result.baseUrl).to.eq(wmtsGetCapUrl)
        expect(result.id).to.eq(wmtsLayerId)
    })
    it('Creates warning when external layer has no url scheme', () => {
        const query = 'KML|external-kml-file.kml'
        const mockThis = { urlParamName: '' }
        const mockStore = {
            getters: {
                getLayerConfigById(_) {
                    return false
                },
            },
        }
        const { warnings } = validateUrlInput.apply(mockThis, [mockStore, query])
        expect(warnings).to.have.length(1)
        expect(warnings[0].msg).to.equal('url_external_layer_no_scheme_warning')
    })
})
