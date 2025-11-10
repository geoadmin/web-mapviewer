import { LayerType } from '@swissgeo/layers'
import { encodeExternalLayerParam } from '@swissgeo/layers/api'
import { describe, expect, it } from 'vitest'

import { getServiceKmlBaseUrl } from '@/config/baseUrl.config'
import { decodeUrlLayerId } from '@/store/plugins/storeSync/layersParamParser'

describe('External layer parsing with decodeUrlLayerId', () => {
    it('parses a KML layer correctly', () => {
        const kmlFileId = '1234567abc'
        const kmlFileUrl = `https://${getServiceKmlBaseUrl()}/api/kml/files/${kmlFileId}`
        const result = decodeUrlLayerId(`${LayerType.KML}|${encodeExternalLayerParam(kmlFileUrl)}`)
        expect(result.type).to.eq(LayerType.KML)
        expect(result.baseUrl).to.eq(kmlFileUrl)
        expect(result.id).to.eq(kmlFileUrl)
    })
    it('parses a KML external layer correctly', () => {
        const kmlFileId = '1234567abc'
        const kmlFileUrl = `https://totally.random.kml.url/${kmlFileId}`
        const result = decodeUrlLayerId(`${LayerType.KML}|${encodeExternalLayerParam(kmlFileUrl)}`)
        expect(result.type).to.eq(LayerType.KML)
        expect(result.baseUrl).to.eq(kmlFileUrl)
        expect(result.id).to.eq(kmlFileUrl)
    })
    it('parses an external WMS layer correctly', () => {
        const wmsBaseUrl = 'https://base.wms.url/?SERVICE=GetMap'
        const wmsLayerId = 'random.wms.layer_id'
        const result = decodeUrlLayerId(
            `${LayerType.WMS}|${encodeExternalLayerParam(wmsBaseUrl)}|${encodeExternalLayerParam(wmsLayerId)}`
        )
        expect(result.type).to.equal(LayerType.WMS)
        expect(result.baseUrl).to.eq(wmsBaseUrl)
        expect(result.id).to.eq(wmsLayerId)
    })
    it('parses an external WMTS layer correctly', () => {
        const wmtsGetCapUrl = 'https://base.wmts.url/getCapabilitiesEndpoint.xml'
        const wmtsLayerId = 'random.wmts.layer_id'
        const result = decodeUrlLayerId(
            `${LayerType.WMTS}|${encodeExternalLayerParam(wmtsGetCapUrl)}|${encodeExternalLayerParam(wmtsLayerId)}`
        )
        expect(result.type).to.equal(LayerType.WMTS)
        expect(result.baseUrl).to.eq(wmtsGetCapUrl)
        expect(result.id).to.eq(wmtsLayerId)
    })
})
