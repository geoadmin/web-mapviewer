import type { FlatExtent } from '@swissgeo/coordinates'

import { LV95, WEBMERCATOR, WGS84 } from '@swissgeo/coordinates'
import { readFile } from 'fs/promises'
import { Interval } from 'luxon'
import { assertType, beforeAll, describe, expect, it } from 'vitest'

import type { WMTSCapabilitiesResponse } from '@/types'
import type { ExternalWMTSLayer, LayerLegend } from '@/types/layers'

import wmtsCapabilitiesParser from '@/parsers/WMTSCapabilitiesParser'
import { timeConfigUtils } from '@/utils'

describe('WMTSCapabilitiesParser - invalid', () => {
    it('Throw Error on invalid input', () => {
        const invalidContent = 'Invalid input'
        expect(() =>
            wmtsCapabilitiesParser.parse(invalidContent, new URL('https://example.com'))
        ).toThrowError(/failed/i)
    })
})

describe('WMTSCapabilitiesParser of wmts-ogc-sample.xml', () => {
    let capabilities: WMTSCapabilitiesResponse

    beforeAll(async () => {
        const content = await readFile(`${__dirname}/fixtures/wmts-ogc-sample.xml`, 'utf8')
        capabilities = wmtsCapabilitiesParser.parse(content, new URL('https://example.com'))
    })

    it('Parse Capabilities', () => {
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
        let layer = wmtsCapabilitiesParser.getExternalLayer(
            capabilities,
            'BlueMarbleSecondGenerationAG',
            { outputProjection: WGS84 }
        )
        expect(layer).toBeDefined()
        assertType<ExternalWMTSLayer>(layer)
        expect(layer.id).toBe('BlueMarbleSecondGenerationAG')
        expect(layer.name).toBe('Blue Marble Second Generation - AG')
        expect(layer.abstract).toBe('Blue Marble Second Generation Canton Aargau Product')
        expect(layer.baseUrl).toBe('http://maps.example.com/cgi-bin/map.cgi?')

        // Layer without .Identifier
        layer = wmtsCapabilitiesParser.getExternalLayer(
            capabilities,
            'BlueMarbleThirdGenerationZH',
            {
                outputProjection: WGS84,
            }
        )
        expect(layer.id).toBe('BlueMarbleThirdGenerationZH')
        expect(layer.name).toBe('BlueMarbleThirdGenerationZH')
        expect(layer.abstract).toBe('Blue Marble Third Generation Canton Zürich Product')
        expect(layer.baseUrl).toBe('http://maps.example.com/cgi-bin/map.cgi?')
    })
    it('Parse layer attribution', () => {
        // General layer
        const layer = wmtsCapabilitiesParser.getExternalLayer(
            capabilities,
            'BlueMarbleSecondGenerationAG',
            { outputProjection: WGS84 }
        )

        expect(layer).toBeDefined()
        assertType<ExternalWMTSLayer>(layer)

        expect(layer.id).to.eq('BlueMarbleSecondGenerationAG')
        expect(layer.attributions).to.be.an('array')
        expect(layer.attributions.length).to.eq(1)
        const attribution = layer.attributions[0]
        expect(attribution.name).to.eq('Example')
        expect(attribution.url).to.eq('http://www.example.com')
    })
    it('Get Layer Extent in LV95', () => {
        const externalLayers = wmtsCapabilitiesParser.getAllExternalLayers(capabilities, {
            outputProjection: LV95,
        })
        expect(externalLayers.length).to.be.greaterThanOrEqual(5)
        assertType<ExternalWMTSLayer[]>(externalLayers)

        const firstLayer = externalLayers[0]
        const secondLayer = externalLayers[1]
        const thirdLayer = externalLayers[2]
        const fourthLayer = externalLayers[3]
        const fifthLayer = externalLayers[4]

        // Extent from WGS84BoundingBox
        expect(firstLayer.id).toBe('BlueMarbleNextGenerationCH')
        let expected: FlatExtent = [2485071.58, 1075346.31, 2828515.82, 1299941.79]
        expect(firstLayer.extent).to.be.an('Array')
        expect(firstLayer.extent.length).toBe(4)
        expected.forEach((value, index) => {
            expect(firstLayer.extent[index]).toBeCloseTo(value, 2)
        })

        // Extent from BoundingBox in WGS84
        expect(secondLayer.id).toBe('BlueMarbleSecondGenerationAG')
        expected = [2627438.37, 1215506.64, 2677504.99, 1277102.76]
        expect(secondLayer.extent).to.be.an('Array')
        expect(secondLayer.extent?.length).toBe(4)
        expected.forEach((value, index) => {
            expect(secondLayer.extent[index]).toBeCloseTo(value, 2)
        })

        // Extent from BoundingBox without CRS
        expect(thirdLayer.id).toBe('BlueMarbleThirdGenerationZH')
        expected = [2665255.25, 1229142.44, 2720879.67, 1287842.18]
        expect(thirdLayer.extent).to.be.an('Array')
        expect(thirdLayer.extent?.length).toBe(4)
        expected.forEach((value, index) => {
            expect(thirdLayer.extent[index]).toBeCloseTo(value, 2)
        })

        // Extent from the TileMatrixSet
        expect(fourthLayer.id).toBe('BlueMarbleFourthGenerationJU')
        expected = [2552296.05, 1218970.79, 2609136.96, 1266593.74]
        expect(fourthLayer.extent).to.be.an('Array')
        expect(fourthLayer.extent?.length).toBe(4)
        expected.forEach((value, index) => {
            expect(fourthLayer.extent[index]).toBeCloseTo(value, 2)
        })

        // Extent from matching BoundingBox
        expect(fifthLayer.id).toBe('BlueMarbleFifthGenerationGE')
        expect(fifthLayer.extent).toEqual([2484928.06, 1108705.32, 2514614.27, 1130449.26])
    })

    it('Get Layer Extent in Web Mercator', () => {
        const externalLayers = wmtsCapabilitiesParser.getAllExternalLayers(capabilities, {
            outputProjection: WEBMERCATOR,
        })
        expect(externalLayers.length).to.be.greaterThanOrEqual(4)
        assertType<ExternalWMTSLayer[]>(externalLayers)

        const firstLayer = externalLayers[0]
        const secondLayer = externalLayers[1]
        const thirdLayer = externalLayers[2]
        const fourthLayer = externalLayers[3]

        // Extent from WGS84BoundingBox
        expect(firstLayer.id).toBe('BlueMarbleNextGenerationCH')
        let expected: FlatExtent = [663464.17, 5751550.87, 1167741.46, 6075303.61]
        expect(firstLayer.extent).to.be.an('Array')
        expect(firstLayer.extent?.length).toBe(4)
        expected.forEach((value, index) => {
            expect(firstLayer.extent[index]).toBeCloseTo(value, 2)
        })

        // Extent from BoundingBox in WGS84
        expect(secondLayer.id).toBe('BlueMarbleSecondGenerationAG')
        expected = [868292.03, 5956776.76, 942876.09, 6047171.27]
        expect(secondLayer.extent).to.be.an('Array')
        expect(secondLayer.extent?.length).toBe(4)
        expected.forEach((value, index) => {
            expect(secondLayer.extent[index]).toBeCloseTo(value, 2)
        })

        // Extent from BoundingBox without CRS
        expect(thirdLayer.id).toBe('BlueMarbleThirdGenerationZH')
        expected = [923951.77, 5976419.03, 1007441.39, 6062053.42]
        expect(thirdLayer.extent).to.be.an('Array')
        expect(thirdLayer.extent?.length).toBe(4)
        expected.forEach((value, index) => {
            expect(thirdLayer.extent[index]).toBeCloseTo(value, 2)
        })

        // Extent from the TileMatrixSet
        expect(fourthLayer.id).toBe('BlueMarbleFourthGenerationJU')
        expected = [758085.73, 5961683.17, 841575.35, 6032314.73]
        expect(fourthLayer.extent).to.be.an('Array')
        expect(fourthLayer.extent?.length).toBe(4)
        expected.forEach((value, index) => {
            expect(fourthLayer.extent[index]).toBeCloseTo(value, 2)
        })
    })

    it('Get Layer Extent in WGS84', () => {
        const externalLayers = wmtsCapabilitiesParser.getAllExternalLayers(capabilities, {
            outputProjection: WGS84,
        })
        expect(externalLayers.length).to.be.greaterThanOrEqual(4)
        assertType<ExternalWMTSLayer[]>(externalLayers)

        const firstLayer = externalLayers[0]
        const secondLayer = externalLayers[1]
        const thirdLayer = externalLayers[2]
        const fourthLayer = externalLayers[3]

        // Extent from WGS84BoundingBox
        expect(firstLayer.id).toBe('BlueMarbleNextGenerationCH')
        expect(firstLayer.extent).toEqual([5.96, 45.82, 10.49, 47.81])

        // Extent from BoundingBox in WGS84
        expect(secondLayer.id).toBe('BlueMarbleSecondGenerationAG')
        expect(secondLayer.extent).toEqual([7.8, 47.09, 8.47, 47.64])

        // Extent from BoundingBox without CRS
        expect(thirdLayer.id).toBe('BlueMarbleThirdGenerationZH')
        expect(thirdLayer.extent).toEqual([8.3, 47.21, 9.05, 47.73])

        // Extent from the TileMatrixSet
        expect(fourthLayer.id).toBe('BlueMarbleFourthGenerationJU')
        expect(fourthLayer.extent).toEqual([6.81, 47.12, 7.56, 47.55])
    })
    it('Parse layer legend', () => {
        // General layer
        const layer = wmtsCapabilitiesParser.getExternalLayer(
            capabilities,
            'BlueMarbleSecondGenerationAG',
            { outputProjection: WGS84 }
        )

        expect(layer).toBeDefined()
        assertType<ExternalWMTSLayer>(layer)
        expect(layer.id).toBe('BlueMarbleSecondGenerationAG')

        expect(layer.legends).toBeDefined()
        assertType<LayerLegend[]>(layer.legends)
        expect(layer.legends.length).toBe(1)

        const legend = layer.legends[0]
        expect(legend.url).toBe('http://www.miramon.uab.es/wmts/Coastlines/coastlines_darkBlue.png')
        expect(legend.format).toBe('image/png')
    })
    it('Parse layer time dimension in format YYYYMMDD', () => {
        const layer = wmtsCapabilitiesParser.getExternalLayer(
            capabilities,
            'BlueMarbleSecondGenerationAG',
            { outputProjection: WGS84 }
        )

        expect(layer).toBeDefined()
        assertType<ExternalWMTSLayer>(layer)

        expect(layer.id).toBe('BlueMarbleSecondGenerationAG')
        expect(layer.timeConfig).toBeDefined()
        expect(timeConfigUtils.hasTimestamp(layer.timeConfig, '20110805')).toBe(true)
        expect(timeConfigUtils.hasTimestamp(layer.timeConfig, '20081024')).toBe(true)
        expect(timeConfigUtils.hasTimestamp(layer.timeConfig, '20081023')).toBe(false)

        expect(timeConfigUtils.getTimeEntryForYear(layer.timeConfig, 2008)).toBeDefined()
        expect(timeConfigUtils.getTimeEntryForYear(layer.timeConfig, 2005)).toBeUndefined()

        expect(layer.timeConfig.currentTimeEntry).toBeDefined()
        expect(layer.timeConfig?.currentTimeEntry.timestamp).toBe('20110805')
        expect(layer.timeConfig.currentTimeEntry.nonTimeBasedValue).toBeUndefined()
        expect(layer.timeConfig?.currentTimeEntry?.interval?.toISO()).to.eq(
            Interval.fromISO('2011-08-05/P1D').toISO()
        )
    })
    it('Parse layer time dimension in format ISO format YYYY-MM-DD', () => {
        const layer = wmtsCapabilitiesParser.getExternalLayer(
            capabilities,
            'BlueMarbleThirdGenerationZH',
            { outputProjection: WGS84 }
        )
        expect(layer.id).toBe('BlueMarbleThirdGenerationZH')
        expect(layer.timeConfig).toBeDefined()
        expect(timeConfigUtils.hasTimestamp(layer.timeConfig, '2011-08-05')).toBe(true)
        expect(timeConfigUtils.hasTimestamp(layer.timeConfig, '2008-10-24')).toBe(true)
        expect(timeConfigUtils.hasTimestamp(layer.timeConfig, '2008-10-23')).toBe(false)

        expect(timeConfigUtils.getTimeEntryForYear(layer.timeConfig, 2008)).toBeDefined()
        expect(timeConfigUtils.getTimeEntryForYear(layer.timeConfig, 2005)).toBeUndefined()

        expect(layer.timeConfig.currentTimeEntry).toBeDefined()
        expect(layer.timeConfig.currentTimeEntry.timestamp).toBe('2011-08-05')
        expect(layer.timeConfig.currentTimeEntry.nonTimeBasedValue).toBeUndefined()
        expect(layer.timeConfig.currentTimeEntry.interval?.toISO()).to.eq(
            Interval.fromISO('2011-08-05/P1D').toISO()
        )
    })
    it('Parse layer time dimension in format full ISO format YYYY-MM-DDTHH:mm:ss.sssZ', () => {
        const layer = wmtsCapabilitiesParser.getExternalLayer(
            capabilities,
            'BlueMarbleFourthGenerationJU',
            { outputProjection: WGS84 }
        )
        expect(layer.id).toBe('BlueMarbleFourthGenerationJU')
        expect(layer.timeConfig).toBeDefined()
        expect(timeConfigUtils.hasTimestamp(layer.timeConfig, '2011-08-05T01:20:34.345Z')).toBe(
            true
        )
        expect(timeConfigUtils.hasTimestamp(layer.timeConfig, '2008-10-24T01:20:34.345Z')).toBe(
            true
        )
        expect(timeConfigUtils.hasTimestamp(layer.timeConfig, '2008-10-23T01:20:34.345Z')).toBe(
            false
        )

        expect(timeConfigUtils.getTimeEntryForYear(layer.timeConfig, 2008)).toBeDefined()
        expect(timeConfigUtils.getTimeEntryForYear(layer.timeConfig, 2005)).toBeUndefined()

        expect(layer.timeConfig.currentTimeEntry).toBeDefined()
        expect(layer.timeConfig.currentTimeEntry.timestamp).toBe('2011-08-05T01:20:34.345Z')
        expect(layer.timeConfig.currentTimeEntry.nonTimeBasedValue).toBeUndefined()
        expect(layer.timeConfig.currentTimeEntry.interval?.toISO()).to.eq(
            Interval.fromISO('2011-08-05/P1D').toISO()
        )
    })
    it('Parse layer time dimension in unknown format', () => {
        const layer = wmtsCapabilitiesParser.getExternalLayer(
            capabilities,
            'BlueMarbleFifthGenerationGE',
            { outputProjection: WGS84 }
        )
        expect(layer.id).toBe('BlueMarbleFifthGenerationGE')
        expect(layer.timeConfig).toBeDefined()
        expect(timeConfigUtils.hasTimestamp(layer.timeConfig, 'Time A')).toBe(true)
        expect(timeConfigUtils.hasTimestamp(layer.timeConfig, 'Time B')).toBe(true)

        expect(layer.timeConfig.currentTimeEntry).toBeDefined()
        expect(layer.timeConfig.currentTimeEntry.timestamp).toBe('Time A')
    })
})
