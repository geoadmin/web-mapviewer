import { LV95, WEBMERCATOR, WGS84 } from '@geoadmin/coordinates'
import { readFile } from 'fs/promises'
import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest'

import { LayerLegend } from '@/api/layers/ExternalLayer.class'
import WMTSCapabilitiesParser from '@/api/layers/WMTSCapabilitiesParser.class'

describe('WMTSCapabilitiesParser of wmts-ogc-sample.xml', () => {
    let capabilities
    beforeAll(async () => {
        const content = await readFile(`${__dirname}/wmts-ogc-sample.xml`, 'utf8')
        capabilities = new WMTSCapabilitiesParser(content, 'https://example.com')
    })
    it('Throw Error on invalid input', () => {
        const invalidContent = 'Invalid input'

        expect(
            () => new WMTSCapabilitiesParser(invalidContent, 'https://example.com')
        ).toThrowError(/failed/i)
    })
    it('Parse Capabilities', async () => {
        expect(capabilities.version).toBe('1.0.0')
        expect(capabilities.Contents).toBeTypeOf('object')
        expect(capabilities.OperationsMetadata).toBeTypeOf('object')
        expect(capabilities.ServiceIdentification).toBeTypeOf('object')
        expect(capabilities.ServiceProvider).toBeTypeOf('object')
        expect(capabilities.originUrl).toBeInstanceOf(URL)
        expect(capabilities.originUrl.toString()).toBe('https://example.com/')
    })
    it('Parse layer attributes', () => {
        // General layer
        let layer = capabilities.getExternalLayerObject('BlueMarbleSecondGenerationAG', WGS84)
        expect(layer.id).toBe('BlueMarbleSecondGenerationAG')
        expect(layer.name).toBe('Blue Marble Second Generation - AG')
        expect(layer.abstract).toBe('Blue Marble Second Generation Canton Aargau Product')
        expect(layer.baseUrl).toBe('http://maps.example.com/cgi-bin/map.cgi?')

        // Layer without .Identifier
        layer = capabilities.getExternalLayerObject('BlueMarbleThirdGenerationZH', WGS84)
        expect(layer.id).toBe('BlueMarbleThirdGenerationZH')
        expect(layer.name).toBe('BlueMarbleThirdGenerationZH')
        expect(layer.abstract).toBe('Blue Marble Third Generation Canton Zürich Product')
        expect(layer.baseUrl).toBe('http://maps.example.com/cgi-bin/map.cgi?')
    })
    it('Parse layer attribution', () => {
        // General layer
        let layer = capabilities.getExternalLayerObject('BlueMarbleSecondGenerationAG', WGS84)
        expect(layer.id).toBe('BlueMarbleSecondGenerationAG')
        expectTypeOf(layer.attributions).toBeArray()
        expect(layer.attributions.length).toBe(1)
        expectTypeOf(layer.attributions[0]).toEqualTypeOf({ name: 'string', url: 'string' })
        expect(layer.attributions[0].name).toBe('Example')
        expect(layer.attributions[0].url).toBe('http://www.example.com')
    })
    it('Get Layer Extent in LV95', () => {
        const externalLayers = capabilities.getAllExternalLayerObjects(LV95)
        // Extent from WGS84BoundingBox
        expect(externalLayers[0].id).toBe('BlueMarbleNextGenerationCH')
        let expected = [
            [2485071.58, 1075346.31],
            [2828515.82, 1299941.79],
        ]
        expect(externalLayers[0].extent.length).toBe(2)
        expect(externalLayers[0].extent[0].length).toBe(2)
        expect(externalLayers[0].extent[1].length).toBe(2)
        expect(externalLayers[0].extent[0][0]).toBeCloseTo(expected[0][0], 2)
        expect(externalLayers[0].extent[0][1]).toBeCloseTo(expected[0][1], 2)
        expect(externalLayers[0].extent[1][0]).toBeCloseTo(expected[1][0], 2)
        expect(externalLayers[0].extent[1][1]).toBeCloseTo(expected[1][1], 2)

        // Extent from BoundingBox in WGS84
        expect(externalLayers[1].id).toBe('BlueMarbleSecondGenerationAG')
        expected = [
            [2627438.37, 1215506.64],
            [2677504.99, 1277102.76],
        ]
        expect(externalLayers[1].extent.length).toBe(2)
        expect(externalLayers[1].extent[0].length).toBe(2)
        expect(externalLayers[1].extent[1].length).toBe(2)
        expect(externalLayers[1].extent[0][0]).toBeCloseTo(expected[0][0], 2)
        expect(externalLayers[1].extent[0][1]).toBeCloseTo(expected[0][1], 2)
        expect(externalLayers[1].extent[1][0]).toBeCloseTo(expected[1][0], 2)
        expect(externalLayers[1].extent[1][1]).toBeCloseTo(expected[1][1], 2)

        // Extent from BoundingBox without CRS
        expect(externalLayers[2].id).toBe('BlueMarbleThirdGenerationZH')
        expected = [
            [2665255.25, 1229142.44],
            [2720879.67, 1287842.18],
        ]
        expect(externalLayers[2].extent.length).toBe(2)
        expect(externalLayers[2].extent[0].length).toBe(2)
        expect(externalLayers[2].extent[1].length).toBe(2)
        expect(externalLayers[2].extent[0][0]).toBeCloseTo(expected[0][0], 2)
        expect(externalLayers[2].extent[0][1]).toBeCloseTo(expected[0][1], 2)
        expect(externalLayers[2].extent[1][0]).toBeCloseTo(expected[1][0], 2)
        expect(externalLayers[2].extent[1][1]).toBeCloseTo(expected[1][1], 2)

        // Extent from the TileMatrixSet
        expect(externalLayers[3].id).toBe('BlueMarbleFourthGenerationJU')
        expected = [
            [2552296.05, 1218970.79],
            [2609136.96, 1266593.74],
        ]
        expect(externalLayers[3].extent.length).toBe(2)
        expect(externalLayers[3].extent[0].length).toBe(2)
        expect(externalLayers[3].extent[1].length).toBe(2)
        expect(externalLayers[3].extent[0][0]).toBeCloseTo(expected[0][0], 2)
        expect(externalLayers[3].extent[0][1]).toBeCloseTo(expected[0][1], 2)
        expect(externalLayers[3].extent[1][0]).toBeCloseTo(expected[1][0], 2)
        expect(externalLayers[3].extent[1][1]).toBeCloseTo(expected[1][1], 2)

        // Extent from matching BoundingBox
        expect(externalLayers[4].id).toBe('BlueMarbleFifthGenerationGE')
        expect(externalLayers[4].extent).toEqual([
            [2484928.06, 1108705.32],
            [2514614.27, 1130449.26],
        ])
    })

    it('Get Layer Extent in Web Mercator', () => {
        const externalLayers = capabilities.getAllExternalLayerObjects(WEBMERCATOR)
        // Extent from WGS84BoundingBox
        expect(externalLayers[0].id).toBe('BlueMarbleNextGenerationCH')
        let expected = [
            [663464.16, 5751550.86],
            [1167741.46, 6075303.61],
        ]
        expect(externalLayers[0].extent.length).toBe(2)
        expect(externalLayers[0].extent[0].length).toBe(2)
        expect(externalLayers[0].extent[1].length).toBe(2)
        expect(externalLayers[0].extent[0][0]).toBeCloseTo(expected[0][0], 1)
        expect(externalLayers[0].extent[0][1]).toBeCloseTo(expected[0][1], 1)
        expect(externalLayers[0].extent[1][0]).toBeCloseTo(expected[1][0], 1)
        expect(externalLayers[0].extent[1][1]).toBeCloseTo(expected[1][1], 1)

        // Extent from BoundingBox in WGS84
        expect(externalLayers[1].id).toBe('BlueMarbleSecondGenerationAG')
        expected = [
            [868292.03, 5956776.76],
            [942876.09, 6047171.27],
        ]
        expect(externalLayers[1].extent.length).toBe(2)
        expect(externalLayers[1].extent[0].length).toBe(2)
        expect(externalLayers[1].extent[1].length).toBe(2)
        expect(externalLayers[1].extent[0][0]).toBeCloseTo(expected[0][0], 1)
        expect(externalLayers[1].extent[0][1]).toBeCloseTo(expected[0][1], 1)
        expect(externalLayers[1].extent[1][0]).toBeCloseTo(expected[1][0], 1)
        expect(externalLayers[1].extent[1][1]).toBeCloseTo(expected[1][1], 1)

        // Extent from BoundingBox without CRS
        expect(externalLayers[2].id).toBe('BlueMarbleThirdGenerationZH')
        expected = [
            [923951.77, 5976419.03],
            [1007441.39, 6062053.42],
        ]
        expect(externalLayers[2].extent.length).toBe(2)
        expect(externalLayers[2].extent[0].length).toBe(2)
        expect(externalLayers[2].extent[1].length).toBe(2)
        expect(externalLayers[2].extent[0][0]).toBeCloseTo(expected[0][0], 1)
        expect(externalLayers[2].extent[0][1]).toBeCloseTo(expected[0][1], 1)
        expect(externalLayers[2].extent[1][0]).toBeCloseTo(expected[1][0], 1)
        expect(externalLayers[2].extent[1][1]).toBeCloseTo(expected[1][1], 1)

        // Extent from the TileMatrixSet
        expect(externalLayers[3].id).toBe('BlueMarbleFourthGenerationJU')
        expected = [
            [758085.73, 5961683.17],
            [841575.35, 6032314.73],
        ]
        expect(externalLayers[3].extent.length).toBe(2)
        expect(externalLayers[3].extent[0].length).toBe(2)
        expect(externalLayers[3].extent[1].length).toBe(2)
        expect(externalLayers[3].extent[0][0]).toBeCloseTo(expected[0][0], 1)
        expect(externalLayers[3].extent[0][1]).toBeCloseTo(expected[0][1], 1)
        expect(externalLayers[3].extent[1][0]).toBeCloseTo(expected[1][0], 1)
        expect(externalLayers[3].extent[1][1]).toBeCloseTo(expected[1][1], 1)
    })

    it('Get Layer Extent in WGS84', () => {
        const externalLayers = capabilities.getAllExternalLayerObjects(WGS84)
        // Extent from WGS84BoundingBox
        expect(externalLayers[0].id).toBe('BlueMarbleNextGenerationCH')
        expect(externalLayers[0].extent).toEqual([
            [5.96, 45.82],
            [10.49, 47.81],
        ])

        // Extent from BoundingBox in WGS84
        expect(externalLayers[1].id).toBe('BlueMarbleSecondGenerationAG')
        expect(externalLayers[1].extent).toEqual([
            [7.8, 47.09],
            [8.47, 47.64],
        ])

        // Extent from BoundingBox without CRS
        expect(externalLayers[2].id).toBe('BlueMarbleThirdGenerationZH')
        expect(externalLayers[2].extent).toEqual([
            [8.3, 47.21],
            [9.05, 47.73],
        ])

        // Extent from the TileMatrixSet
        expect(externalLayers[3].id).toBe('BlueMarbleFourthGenerationJU')
        expect(externalLayers[3].extent).toEqual([
            [6.81, 47.12],
            [7.56, 47.55],
        ])
    })
    it('Parse layer legend', () => {
        // General layer
        let layer = capabilities.getExternalLayerObject('BlueMarbleSecondGenerationAG', WGS84)
        expect(layer.id).toBe('BlueMarbleSecondGenerationAG')
        expectTypeOf(layer.legends).toBeArray()
        expect(layer.legends.length).toBe(1)
        expect(layer.legends[0]).toBeInstanceOf(LayerLegend)
        expect(layer.legends[0].url).toBe(
            'http://www.miramon.uab.es/wmts/Coastlines/coastlines_darkBlue.png'
        )
        expect(layer.legends[0].format).toBe('image/png')
    })
    it('Parse layer time dimension in format YYYYMMDD', () => {
        let layer = capabilities.getExternalLayerObject('BlueMarbleSecondGenerationAG', WGS84)
        expect(layer.id).toBe('BlueMarbleSecondGenerationAG')
        expect(layer.timeConfig).to.be.not.null.and.not.undefined
        expect(layer.timeConfig.hasTimestamp('20110805')).to.be.true
        expect(layer.timeConfig.hasTimestamp('20081024')).to.be.true
        expect(layer.timeConfig.hasTimestamp('20081023')).to.be.false

        expect(layer.timeConfig.getTimeEntryForYear(2008)).to.be.not.null.and.not.undefined
        expect(layer.timeConfig.getTimeEntryForYear(2005)).to.be.null

        expect(layer.timeConfig.currentTimeEntry).to.be.not.null.and.not.undefined
        expect(layer.timeConfig.currentTimeEntry.timestamp).toBe('20110805')
        expect(layer.timeConfig.currentTimeEntry.year).toBe(2011)
        expect(layer.timeConfig.currentYear).to.be.not.null.and.not.undefined
        expect(layer.timeConfig.currentYear).toBe(2011)
        expect(layer.timeConfig.currentTimestamp).to.be.not.null.and.not.undefined
        expect(layer.timeConfig.currentTimestamp).toBe('20110805')
    })
    it('Parse layer time dimension in format ISO format YYYY-MM-DD', () => {
        let layer = capabilities.getExternalLayerObject('BlueMarbleThirdGenerationZH', WGS84)
        expect(layer.id).toBe('BlueMarbleThirdGenerationZH')
        expect(layer.timeConfig).to.be.not.null.and.not.undefined
        expect(layer.timeConfig.hasTimestamp('2011-08-05')).to.be.true
        expect(layer.timeConfig.hasTimestamp('2008-10-24')).to.be.true
        expect(layer.timeConfig.hasTimestamp('2008-10-23')).to.be.false

        expect(layer.timeConfig.getTimeEntryForYear(2008)).to.be.not.null.and.not.undefined
        expect(layer.timeConfig.getTimeEntryForYear(2005)).to.be.null

        expect(layer.timeConfig.currentTimeEntry).to.be.not.null.and.not.undefined
        expect(layer.timeConfig.currentTimeEntry.timestamp).toBe('2011-08-05')
        expect(layer.timeConfig.currentTimeEntry.year).toBe(2011)
        expect(layer.timeConfig.currentYear).to.be.not.null.and.not.undefined
        expect(layer.timeConfig.currentYear).toBe(2011)
        expect(layer.timeConfig.currentTimestamp).to.be.not.null.and.not.undefined
        expect(layer.timeConfig.currentTimestamp).toBe('2011-08-05')
    })
    it('Parse layer time dimension in format full ISO format YYYY-MM-DDTHH:mm:ss.sssZ', () => {
        let layer = capabilities.getExternalLayerObject('BlueMarbleFourthGenerationJU', WGS84)
        expect(layer.id).toBe('BlueMarbleFourthGenerationJU')
        expect(layer.timeConfig).to.be.not.null.and.not.undefined
        expect(layer.timeConfig.hasTimestamp('2011-08-05T01:20:34.345Z')).to.be.true
        expect(layer.timeConfig.hasTimestamp('2008-10-24T01:20:34.345Z')).to.be.true
        expect(layer.timeConfig.hasTimestamp('2008-10-23T01:20:34.345Z')).to.be.false

        expect(layer.timeConfig.getTimeEntryForYear(2008)).to.be.not.null.and.not.undefined
        expect(layer.timeConfig.getTimeEntryForYear(2005)).to.be.null

        expect(layer.timeConfig.currentTimeEntry).to.be.not.null.and.not.undefined
        expect(layer.timeConfig.currentTimeEntry.timestamp).toBe('2011-08-05T01:20:34.345Z')
        expect(layer.timeConfig.currentTimeEntry.year).toBe(2011)
        expect(layer.timeConfig.currentYear).to.be.not.null.and.not.undefined
        expect(layer.timeConfig.currentYear).toBe(2011)
        expect(layer.timeConfig.currentTimestamp).to.be.not.null.and.not.undefined
        expect(layer.timeConfig.currentTimestamp).toBe('2011-08-05T01:20:34.345Z')
    })
    it('Parse layer time dimension in unknown format', () => {
        let layer = capabilities.getExternalLayerObject('BlueMarbleFifthGenerationGE', WGS84)
        expect(layer.id).toBe('BlueMarbleFifthGenerationGE')
        expect(layer.timeConfig).to.be.not.null.and.not.undefined
        expect(layer.timeConfig.hasTimestamp('Time A')).to.be.true
        expect(layer.timeConfig.hasTimestamp('Time B')).to.be.true

        expect(layer.timeConfig.currentTimeEntry).to.be.not.null.and.not.undefined
        expect(layer.timeConfig.currentTimeEntry.timestamp).toBe('Time A')
        expect(layer.timeConfig.currentTimeEntry.year).to.be.null
        expect(layer.timeConfig.currentYear).to.be.null
        expect(layer.timeConfig.currentTimestamp).to.be.not.null.and.not.undefined
        expect(layer.timeConfig.currentTimestamp).toBe('Time A')
    })
})
