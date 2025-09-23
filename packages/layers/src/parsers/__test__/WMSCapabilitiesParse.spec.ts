import type { FlatExtent } from '@swissgeo/coordinates'
import { LV95, WEBMERCATOR, WGS84 } from '@swissgeo/coordinates'
import { readFile } from 'fs/promises'
import { assertType, beforeAll, describe, expect, it } from 'vitest'

import type { ExternalWMSLayer, LayerAttribution, LayerLegend } from '@/types/layers'

import externalWMSParser, { type WMSCapabilitiesResponse } from '@/parsers/WMSCapabilitiesParser'

describe('WMSCapabilitiesParser - invalid', () => {
    it('Throw Error on invalid input', () => {
        const invalidContent = 'Invalid input'
        expect(() =>
            externalWMSParser.parse(invalidContent, new URL('https://example.com'))
        ).toThrowError(/failed/i)
    })
})

describe('WMSCapabilitiesParser of wms-geoadmin-sample.xml', () => {
    let capabilities: WMSCapabilitiesResponse

    beforeAll(async () => {
        const content = await readFile(`${__dirname}/fixtures/wms-geoadmin-sample.xml`, 'utf8')
        capabilities = externalWMSParser.parse(content, new URL('https://wms.geo.admin.ch'))
    })
    it('Parse Capabilities', () => {
        expect(capabilities.version).to.eql('1.3.0')
        expect(capabilities.Capability).to.be.an('object')
        expect(capabilities.Service).to.be.an('object')
        expect(capabilities.originUrl).toBeInstanceOf(URL)
        expect(capabilities.originUrl.toString()).to.eql('https://wms.geo.admin.ch/')
    })
    it('Parse layer attributes', () => {
        // Base layer
        let layer: ExternalWMSLayer | undefined = externalWMSParser.getExternalLayer(
            capabilities,
            'wms-bgdi'
        )

        expect(layer).toBeDefined()
        assertType<ExternalWMSLayer>(layer!)

        expect(layer!.id).to.eql('wms-bgdi')
        expect(layer!.name).to.eql('WMS BGDI')
        expect(layer!.abstract).to.eql('Public Federal Geo Infrastructure (BGDI)')
        expect(layer!.baseUrl).to.eql('https://wms.geo.admin.ch/?')

        // General layer
        layer = externalWMSParser.getExternalLayer(capabilities, 'ch.swisstopo-vd.official-survey')
        expect(layer).toBeDefined()
        expect(layer!.id).to.eql('ch.swisstopo-vd.official-survey')
        expect(layer!.name).to.eql('OpenData-AV')
        expect(layer!.abstract).to.eql('The official survey (AV).')
        expect(layer!.baseUrl).to.eql('https://wms.geo.admin.ch/?')

        // Layer without .Name
        layer = externalWMSParser.getExternalLayer(capabilities, 'Periodic-Tracking')
        expect(layer).toBeDefined()
        expect(layer!.id).to.eql('Periodic-Tracking')
        expect(layer!.name).to.eql('Periodic-Tracking')
        expect(layer!.abstract).to.eql('Layer without Name element should use the Title')
        expect(layer!.baseUrl).to.eql('https://wms.geo.admin.ch/?')
    })
    it('Parse layer attribution', () => {
        // Attribution in root layer
        let layer = externalWMSParser.getExternalLayer(
            capabilities,
            'ch.swisstopo-vd.official-survey'
        )

        expect(layer).toBeDefined()
        assertType<ExternalWMSLayer>(layer!)

        expect(layer!.id).to.eql('ch.swisstopo-vd.official-survey')
        assertType<Array<LayerAttribution>>(layer!.attributions)
        expect(layer!.attributions.length).to.eql(1)
        assertType<LayerAttribution>(layer!.attributions[0]!)
        expect(layer!.attributions[0]!.name).to.eql('The federal geoportal')
        expect(layer!.attributions[0]!.url).to.eql('https://www.geo.admin.ch/attribution')

        // Attribution in layer!
        layer = externalWMSParser.getExternalLayer(capabilities, 'Periodic-Tracking')

        expect(layer).toBeDefined()
        assertType<ExternalWMSLayer>(layer!)

        expect(layer!.id).to.eql('Periodic-Tracking')
        assertType<Array<LayerAttribution>>(layer!.attributions)
        expect(layer!.attributions.length).to.eql(1)
        assertType<LayerAttribution>(layer!.attributions[0]!)
        expect(layer!.attributions[0]!.name).to.eql('BGDI')
        expect(layer!.attributions[0]!.url).to.eql('https://www.geo.admin.ch/attribution-bgdi')
    })
    it('Get Layer Extent in LV95', () => {
        const externalLayers = externalWMSParser.getAllExternalLayers(capabilities, {
            outputProjection: LV95,
        })

        expect(externalLayers).toBeDefined()
        assertType<ExternalWMSLayer[]>(externalLayers)

        // Extent from matching CRS BoundingBox
        expect(externalLayers[0]!.id).to.eql('ch.swisstopo-vd.official-survey')
        let expected: FlatExtent = [2100000, 1030000, 2900000, 1400000]
        // Here we should not do any re-projection therefore do an exact match
        expect(externalLayers[0]!.extent).toEqual(expected)

        // Extent from non matching CRS BoundingBox
        expect(externalLayers[1]!.id).to.eql('Periodic-Tracking')
        expected = [2485071.58, 1075346.31, 2828515.82, 1299941.79]
        expect(externalLayers[1]!.extent!.length).to.eql(4)
        expected.forEach((value, index) => {
            expect(externalLayers[1]!.extent![index]).toBeCloseTo(value, 2)
        })
    })
    it('Parse layer legend', () => {
        // General layer
        let layer = externalWMSParser.getExternalLayer(
            capabilities,
            'ch.swisstopo-vd.official-survey'
        )

        expect(layer).toBeDefined()
        assertType<ExternalWMSLayer>(layer!)

        expect(layer!.id).to.eql('ch.swisstopo-vd.official-survey')
        expect(layer!.abstract).toBeDefined()
        expect(layer!.abstract!.length).toBeGreaterThan(0)
        expect(layer!.hasDescription).toBeTruthy()
        expect(layer!.hasLegend).toBeFalsy()
        expect(layer!.legends?.length).to.eql(0)

        // Layer without .Name
        layer = externalWMSParser.getExternalLayer(capabilities, 'Periodic-Tracking')
        expect(layer).toBeDefined()
        expect(layer!.id).to.eql('Periodic-Tracking')
        expect(layer!.hasDescription).toBeTruthy()
        expect(layer!.hasLegend).toBeTruthy()
        expect(layer!.legends).to.be.an('array')
        assertType<Array<LayerLegend>>(layer!.legends!)
        expect(layer!.legends!.length).to.eql(1)

        assertType<LayerLegend>(layer!.legends![0]!)
        expect(layer!.legends![0]!.url).to.eql(
            'https://wms.geo.admin.ch/?version=1.3.0&service=WMS&request=GetLegend&layer=ch.swisstopo-vd.geometa-periodische_nachfuehrung&format=image/png&STYLE=default'
        )
        expect(layer!.legends![0]!.format).to.eql('image/png')
        expect(layer!.legends![0]!.width).to.eql(168)
        expect(layer!.legends![0]!.height).to.eql(22)

        // Layer without abstract and legend
        layer = externalWMSParser.getExternalLayer(
            capabilities,
            'ch.swisstopo-vd.stand-oerebkataster'
        )
        expect(layer).toBeDefined()
        expect(layer!.id).to.eql('ch.swisstopo-vd.stand-oerebkataster')
        expect(layer!.hasDescription).toBeFalsy()
        expect(layer!.hasLegend).toBeFalsy()
        expect(layer!.legends?.length).to.eql(0)
    })
})

describe('WMSCapabilitiesParser of wms-geoadmin-sample-sld-enabled.xml', () => {
    let capabilities: WMSCapabilitiesResponse

    beforeAll(async () => {
        const content = await readFile(
            `${__dirname}/fixtures/wms-geoadmin-sample-sld-enabled.xml`,
            'utf8'
        )
        capabilities = externalWMSParser.parse(content, new URL('https://wms.geo.admin.ch'))
    })
    it('Parse layer attributes', () => {
        // Base layer
        let layer = externalWMSParser.getExternalLayer(capabilities, 'wms-bgdi')
        expect(layer).toBeDefined()
        expect(layer!.id).to.eql('wms-bgdi')
        expect(layer!.name).to.eql('WMS BGDI')
        expect(layer!.abstract).to.eql('Public Federal Geo Infrastructure (BGDI)')
        expect(layer!.baseUrl).to.eql('https://wms.geo.admin.ch/?')

        // General layer
        layer = externalWMSParser.getExternalLayer(capabilities, 'ch.swisstopo-vd.official-survey')
        expect(layer).toBeDefined()
        expect(layer!.id).to.eql('ch.swisstopo-vd.official-survey')
        expect(layer!.name).to.eql('OpenData-AV')
        expect(layer!.abstract).to.eql('The official survey (AV).')
        expect(layer!.baseUrl).to.eql('https://wms.geo.admin.ch/?')

        // Layer without .Name
        layer = externalWMSParser.getExternalLayer(capabilities, 'Periodic-Tracking')
        expect(layer).toBeDefined()
        expect(layer!.id).to.eql('Periodic-Tracking')
        expect(layer!.name).to.eql('Periodic-Tracking')
        expect(layer!.abstract).to.eql('Layer without Name element should use the Title')
        expect(layer!.baseUrl).to.eql('https://wms.geo.admin.ch/?')
    })
    it('Parse layer attribution', () => {
        // Attribution in root layer
        let layer = externalWMSParser.getExternalLayer(
            capabilities,
            'ch.swisstopo-vd.official-survey'
        )
        expect(layer).toBeDefined()
        expect(layer!.id).to.eql('ch.swisstopo-vd.official-survey')
        assertType<Array<LayerAttribution>>(layer!.attributions)
        expect(layer!.attributions.length).to.eql(1)
        expect(layer!.attributions[0]!.name).to.eql('The federal geoportal')
        expect(layer!.attributions[0]!.url).to.eql('https://www.geo.admin.ch/attribution')

        // Attribution in layer
        layer = externalWMSParser.getExternalLayer(capabilities, 'Periodic-Tracking')
        expect(layer).toBeDefined()
        expect(layer!.id).to.eql('Periodic-Tracking')
        assertType<Array<LayerAttribution>>(layer!.attributions)
        expect(layer!.attributions.length).to.eql(1)
        expect(layer!.attributions[0]!.name).to.eql('BGDI')
        expect(layer!.attributions[0]!.url).to.eql('https://www.geo.admin.ch/attribution-bgdi')
    })
    it('Get Layer Extent in LV95', () => {
        const externalLayers = externalWMSParser.getAllExternalLayers(capabilities, {
            outputProjection: LV95,
        })
        // Extent from matching CRS BoundingBox
        expect(externalLayers[0]!.id).to.eql('ch.swisstopo-vd.official-survey')
        let expected: FlatExtent = [2100000, 1030000, 2900000, 1400000]
        // Here we should not do any re-projection therefore do an exact match
        expect(externalLayers[0]!.extent).toEqual(expected)

        // Extent from non matching CRS BoundingBox
        expect(externalLayers[1]!.id).to.eql('Periodic-Tracking')
        expected = [2485071.58, 1075346.31, 2828515.82, 1299941.79]
        expect(externalLayers[1]!.extent).toBeDefined()
        expect(externalLayers[1]!.extent!.length).to.eql(4)
        expected.forEach((value, index) => {
            expect(externalLayers[1]!.extent![index]).toBeCloseTo(value, 2)
        })
    })
    it('Parse layer legend', () => {
        // General layer
        let layer = externalWMSParser.getExternalLayer(
            capabilities,
            'ch.swisstopo-vd.official-survey'
        )
        expect(layer).toBeDefined()
        expect(layer!.id).to.eql('ch.swisstopo-vd.official-survey')
        expect(layer!.abstract).not.empty
        expect(layer!.hasDescription).toBeTruthy()
        expect(layer!.hasLegend).toBeTruthy()
        expect(layer!.legends).toBeDefined()
        expect(layer!.legends!.length).to.eql(1)
        expect(layer!.legends![0]!.url).to.eql(
            'https://wms.geo.admin.ch/?SERVICE=WMS&REQUEST=GetLegendGraphic&VERSION=1.3.0&FORMAT=image%2Fpng&LAYER=ch.swisstopo-vd.official-survey&SLD_VERSION=1.1.0'
        )

        // Layer without .Name
        layer = externalWMSParser.getExternalLayer(capabilities, 'Periodic-Tracking')
        expect(layer).toBeDefined()
        expect(layer!.id).to.eql('Periodic-Tracking')
        expect(layer!.hasDescription).toBeTruthy()
        expect(layer!.hasLegend).toBeTruthy()
        expect(layer!.legends).toBeDefined()
        expect(layer!.legends!.length).to.eql(1)
        expect(layer!.legends![0]!).toBeDefined()
        expect(layer!.legends![0]!.url).to.eql(
            'https://wms.geo.admin.ch/?version=1.3.0&service=WMS&request=GetLegendGraphic&sld_version=1.1.0&layer=ch.swisstopo-vd.geometa-periodische_nachfuehrung&format=image/png&STYLE=default'
        )
        expect(layer!.legends![0]!.format).to.eql('image/png')
        expect(layer!.legends![0]!.width).to.eql(168)
        expect(layer!.legends![0]!.height).to.eql(22)

        // Layer without abstract and legend in styles, but with a SLD enabled legend
        layer = externalWMSParser.getExternalLayer(
            capabilities,
            'ch.swisstopo-vd.stand-oerebkataster'
        )
        expect(layer).toBeDefined()
        expect(layer!.id).to.eql('ch.swisstopo-vd.stand-oerebkataster')
        expect(layer!.hasDescription).toBeTruthy()
        expect(layer!.hasLegend).toBeTruthy()
        expect(layer!.legends).toBeDefined()
        expect(layer!.legends!.length).to.eql(1)
        expect(layer!.legends![0]!.url).to.eql(
            'https://wms.geo.admin.ch/?SERVICE=WMS&REQUEST=GetLegendGraphic&VERSION=1.3.0&FORMAT=image%2Fpng&LAYER=ch.swisstopo-vd.stand-oerebkataster&SLD_VERSION=1.1.0'
        )
    })
})

describe('WMSCapabilitiesParser - layer attributes', () => {
    it('Parse layer url attribute', () => {
        // URL from origin
        let content = `<?xml version='1.0' encoding="UTF-8" standalone="no"?>
        <WMS_Capabilities version="1.3.0">
            <Capability>
                <Layer>
                    <Title>WMS BGDI</Title>
                    <Layer queryable="1" opaque="0" cascaded="1">
                        <Name>ch.swisstopo-vd.official-survey</Name>
                        <Title>OpenData-AV</Title>
                    </Layer>
                </Layer>
            </Capability>
        </WMS_Capabilities>
        `
        let capabilities: WMSCapabilitiesResponse = externalWMSParser.parse(
            content,
            new URL('https://wms.geo.admin.ch')
        )
        let layer = externalWMSParser.getExternalLayer(
            capabilities,
            'ch.swisstopo-vd.official-survey'
        )
        expect(layer).toBeDefined()
        expect(layer!.baseUrl).to.eql('https://wms.geo.admin.ch/')

        // URL from Capability
        content = `<?xml version='1.0' encoding="UTF-8" standalone="no"?>
        <WMS_Capabilities version="1.3.0">
            <Capability>
                <Request>
                    <GetMap>
                        <Format>text/xml</Format>
                        <DCPType>
                            <HTTP>
                                <Get>
                                    <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink"
                                        xlink:href="https://wms.geo.admin.ch/map?" />
                                </Get>
                            </HTTP>
                        </DCPType>
                    </GetMap>
                </Request>
                <Layer>
                    <Title>WMS BGDI</Title>
                    <Layer queryable="1" opaque="0" cascaded="1">
                        <Name>ch.swisstopo-vd.official-survey</Name>
                        <Title>OpenData-AV</Title>
                    </Layer>
                </Layer>
            </Capability>
        </WMS_Capabilities>
        `
        capabilities = externalWMSParser.parse(content, new URL('https://wms.geo.admin.ch'))
        layer = externalWMSParser.getExternalLayer(capabilities, 'ch.swisstopo-vd.official-survey')
        expect(layer).toBeDefined()
        expect(layer!.baseUrl).to.eql('https://wms.geo.admin.ch/map?')
    })
})

describe('WMSCapabilitiesParser - attributions', () => {
    it('Parse layer attribution - no attribution in layer, fallback to service (with Title)', () => {
        const content = `<?xml version='1.0' encoding="UTF-8" standalone="no"?>
        <WMS_Capabilities version="1.3.0">
            <Service>
                <Name>WMS</Name>
                <Title>WMS BGDI</Title>
                <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink"
                    xlink:href="https://wms.geo.admin.ch/?" />
            </Service>

            <Capability>
                <Layer>
                    <Title>WMS BGDI</Title>
                    <Layer queryable="1" opaque="0" cascaded="1">
                        <Name>ch.swisstopo-vd.official-survey</Name>
                        <Title>OpenData-AV</Title>
                    </Layer>
                </Layer>
            </Capability>
        </WMS_Capabilities>
        `
        const capabilities: WMSCapabilitiesResponse = externalWMSParser.parse(
            content,
            new URL('https://wms.geo.admin.ch')
        )
        // No attribution, use Service
        const layer = externalWMSParser.getExternalLayer(
            capabilities,
            'ch.swisstopo-vd.official-survey'
        )

        expect(layer).toBeDefined()
        assertType<ExternalWMSLayer>(layer!)

        expect(layer!.id).to.eql('ch.swisstopo-vd.official-survey')
        assertType<Array<LayerAttribution>>(layer!.attributions)
        expect(layer!.attributions.length).to.eql(1)
        assertType<LayerAttribution>(layer!.attributions[0]!)
        expect(layer!.attributions[0]!.name).to.eql('WMS BGDI')
        expect(layer!.attributions[0]!.url).to.be.undefined
    })
    it('Parse layer attribution - no attribution in layer, fallback to service (no Title)', () => {
        // No attribution and Service without Title
        const content = `<?xml version='1.0' encoding="UTF-8" standalone="no"?>
        <WMS_Capabilities version="1.3.0">
            <Service>
                <Name>WMS</Name>
                <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink"
                    xlink:href="https://wms.geo.admin.ch/?" />
            </Service>

            <Capability>
                <Layer>
                    <Title>WMS BGDI</Title>
                    <Layer queryable="1" opaque="0" cascaded="1">
                        <Name>ch.swisstopo-vd.official-survey</Name>
                        <Title>OpenData-AV</Title>
                    </Layer>
                </Layer>
            </Capability>
        </WMS_Capabilities>
        `
        const capabilities: WMSCapabilitiesResponse = externalWMSParser.parse(
            content,
            new URL('https://wms.geo.admin.ch')
        )
        // Attribution in service
        const layer = externalWMSParser.getExternalLayer(
            capabilities,
            'ch.swisstopo-vd.official-survey'
        )

        expect(layer).toBeDefined()
        assertType<ExternalWMSLayer>(layer!)

        expect(layer!.id).to.eql('ch.swisstopo-vd.official-survey')
        assertType<Array<LayerAttribution>>(layer!.attributions)
        expect(layer!.attributions.length).to.eql(1)
        assertType<LayerAttribution>(layer!.attributions[0]!)
        expect(layer!.attributions[0]!.name).to.eql('wms.geo.admin.ch')
        expect(layer!.attributions[0]!.url).toBeUndefined()
    })
    it('Parse layer attribution - no attribution in layer or service', () => {
        // No attribution and no service
        const content = `<?xml version='1.0' encoding="UTF-8" standalone="no"?>
        <WMS_Capabilities version="1.3.0">
              <Capability>
                <Layer>
                    <Title>WMS BGDI</Title>
                    <Layer queryable="1" opaque="0" cascaded="1">
                        <Name>ch.swisstopo-vd.official-survey</Name>
                        <Title>OpenData-AV</Title>
                    </Layer>
                </Layer>
            </Capability>
        </WMS_Capabilities>
        `
        const capabilities: WMSCapabilitiesResponse = externalWMSParser.parse(
            content,
            new URL('https://wms.geo.admin.ch')
        )
        // Attribution in service
        const layer = externalWMSParser.getExternalLayer(
            capabilities,
            'ch.swisstopo-vd.official-survey'
        )

        expect(layer).toBeDefined()
        assertType<ExternalWMSLayer>(layer!)

        expect(layer!.id).to.eql('ch.swisstopo-vd.official-survey')
        assertType<Array<LayerAttribution>>(layer!.attributions)
        expect(layer!.attributions.length).to.eql(1)
        assertType<LayerAttribution>(layer!.attributions[0]!)
        expect(layer!.attributions[0]!.name).to.eql('wms.geo.admin.ch')
        expect(layer!.attributions[0]!.url).toBeUndefined()
    })

    it('Parse layer attribution - attribution in root layer', () => {
        const content = `<?xml version='1.0' encoding="UTF-8" standalone="no"?>
        <WMS_Capabilities version="1.3.0">
            <Service>
                <Name>WMS</Name>
                <Title>WMS BGDI</Title>
                <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink"
                    xlink:href="https://wms.geo.admin.ch/?" />
            </Service>

            <Capability>
                <Layer>
                    <Title>WMS BGDI</Title>
                    <Attribution>
                        <Title>The federal geoportal</Title>
                        <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink"
                            xlink:href="https://www.geo.admin.ch/attribution" />
                    </Attribution>
                    <Layer queryable="1" opaque="0" cascaded="1">
                        <Name>ch.swisstopo-vd.official-survey</Name>
                        <Title>OpenData-AV</Title>
                    </Layer>
                </Layer>
            </Capability>
        </WMS_Capabilities>
        `
        const capabilities: WMSCapabilitiesResponse = externalWMSParser.parse(
            content,
            new URL('https://wms.geo.admin.ch')
        )

        const layer = externalWMSParser.getExternalLayer(
            capabilities,
            'ch.swisstopo-vd.official-survey'
        )

        expect(layer).toBeDefined()
        assertType<ExternalWMSLayer>(layer!)

        expect(layer!.id).to.eql('ch.swisstopo-vd.official-survey')
        assertType<Array<LayerAttribution>>(layer!.attributions)
        expect(layer!.attributions.length).to.eql(1)
        assertType<LayerAttribution>(layer!.attributions[0]!)
        expect(layer!.attributions[0]!.name).to.eql('The federal geoportal')
        expect(layer!.attributions[0]!.url).to.eql('https://www.geo.admin.ch/attribution')
    })

    it('Parse layer attribution - attribution in layer (with Title)', () => {
        const content = `<?xml version='1.0' encoding="UTF-8" standalone="no"?>
        <WMS_Capabilities version="1.3.0">
            <Service>
                <Name>WMS</Name>
                <Title>WMS BGDI</Title>
                <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink"
                    xlink:href="https://wms.geo.admin.ch/?" />
            </Service>

            <Capability>
                <Layer>
                    <Title>WMS BGDI</Title>
                    <Layer queryable="1" opaque="0" cascaded="1">
                        <Name>ch.swisstopo-vd.official-survey</Name>
                        <Title>OpenData-AV</Title>
                        <Attribution>
                            <Title>BGDI Layer</Title>
                            <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink"
                                xlink:href="https://www.geo.admin.ch/attribution-bgdi" />
                            <LogoURL width="50" height="45">
                                <Format>image/png</Format>
                                <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple"
                                    xlink:href="http://wms.geo.admin.ch/medias/ch45x50.png" />
                            </LogoURL>
                        </Attribution>
                    </Layer>
                </Layer>
            </Capability>
        </WMS_Capabilities>
        `
        const capabilities: WMSCapabilitiesResponse = externalWMSParser.parse(
            content,
            new URL('https://wms.geo.admin.ch')
        )
        // Attribution in layer
        const layer = externalWMSParser.getExternalLayer(
            capabilities,
            'ch.swisstopo-vd.official-survey'
        )

        expect(layer).toBeDefined()
        assertType<ExternalWMSLayer>(layer!)

        expect(layer!.id).to.eql('ch.swisstopo-vd.official-survey')
        assertType<LayerAttribution[]>(layer!.attributions)
        expect(layer!.attributions.length).to.eql(1)
        assertType<LayerAttribution>(layer!.attributions[0]!)
        expect(layer!.attributions[0]!.name).to.eql('BGDI Layer')
        expect(layer!.attributions[0]!.url).to.eql('https://www.geo.admin.ch/attribution-bgdi')
    })
    it('Parse layer attribution - attribution in layer (no Title)', () => {
        // Attribution without title in layer
        const content = `<?xml version='1.0' encoding="UTF-8" standalone="no"?>
        <WMS_Capabilities version="1.3.0">
            <Service>
                <Name>WMS</Name>
                <Title>WMS BGDI</Title>
                <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink"
                    xlink:href="https://wms.geo.admin.ch/?" />
            </Service>

            <Capability>
                <Layer>
                    <Title>WMS BGDI</Title>
                    <Layer queryable="1" opaque="0" cascaded="1">
                        <Name>ch.swisstopo-vd.official-survey</Name>
                        <Title>OpenData-AV</Title>
                        <Attribution>
                            <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink"
                                xlink:href="https://www.geo.admin.ch/attribution-bgdi" />
                        </Attribution>
                    </Layer>
                </Layer>
            </Capability>
        </WMS_Capabilities>
        `
        const capabilities: WMSCapabilitiesResponse = externalWMSParser.parse(
            content,
            new URL('https://wms.geo.admin.ch')
        )
        const layer = externalWMSParser.getExternalLayer(
            capabilities,
            'ch.swisstopo-vd.official-survey'
        )

        expect(layer).toBeDefined()
        assertType<ExternalWMSLayer>(layer!)

        expect(layer!.id).to.eql('ch.swisstopo-vd.official-survey')
        assertType<LayerAttribution[]>(layer!.attributions)
        expect(layer!.attributions.length).to.eql(1)
        assertType<LayerAttribution>(layer!.attributions[0]!)
        expect(layer!.attributions[0]!.name).to.eql('www.geo.admin.ch')
        expect(layer!.attributions[0]!.url).to.eql('https://www.geo.admin.ch/attribution-bgdi')
    })

    it('Parse layer attribution - invalid attribution URL', () => {
        const content = `<?xml version='1.0' encoding="UTF-8" standalone="no"?>
        <WMS_Capabilities version="1.3.0">
            <Capability>
                <Layer>
                    <Title>WMS BGDI</Title>
                    <Layer queryable="1" opaque="0" cascaded="1">
                        <Name>ch.swisstopo-vd.official-survey</Name>
                        <Title>OpenData-AV</Title>
                        <Attribution>
                        <OnlineResource
                            xmlns:xlink="http://www.w3.org/1999/xlink"
                            xlink:href="invalid-url"
                        />
                        </Attribution>
                    </Layer>
                </Layer>
            </Capability>
        </WMS_Capabilities>
        `
        const capabilities: WMSCapabilitiesResponse = externalWMSParser.parse(
            content,
            new URL('https://wms.geo.admin.ch')
        )

        // No attribution, use Service
        const layer = externalWMSParser.getExternalLayer(
            capabilities,
            'ch.swisstopo-vd.official-survey'
        )

        expect(layer).toBeDefined()
        assertType<ExternalWMSLayer>(layer!)

        expect(layer!.id).to.eql('ch.swisstopo-vd.official-survey')
        assertType<LayerAttribution[]>(layer!.attributions)
        expect(layer!.attributions.length).to.eql(1)
        assertType<LayerAttribution>(layer!.attributions[0]!)
        expect(layer!.attributions[0]!.name).to.eql('wms.geo.admin.ch')
        expect(layer!.attributions[0]!.url).toBeUndefined()
    })
})

describe('WMSCapabilitiesParser - layer extent', () => {
    it('Parse layer layer extent from EX_GeographicBoundingBox', () => {
        const content = `<?xml version='1.0' encoding="UTF-8" standalone="no"?>
        <WMS_Capabilities version="1.3.0">
            <Capability>
                <Layer>
                    <Title>WMS BGDI</Title>
                    <Layer queryable="1" opaque="0" cascaded="1">
                        <Name>ch.swisstopo-vd.official-survey</Name>
                        <Title>OpenData-AV</Title>
                        <EX_GeographicBoundingBox>
                            <westBoundLongitude>5.96</westBoundLongitude>
                            <eastBoundLongitude>10.49</eastBoundLongitude>
                            <southBoundLatitude>45.82</southBoundLatitude>
                            <northBoundLatitude>47.81</northBoundLatitude>
                        </EX_GeographicBoundingBox>
                    </Layer>
                </Layer>
            </Capability>
        </WMS_Capabilities>
        `
        const capabilities: WMSCapabilitiesResponse = externalWMSParser.parse(
            content,
            new URL('https://wms.geo.admin.ch')
        )

        const layerLV95 = externalWMSParser.getExternalLayer(
            capabilities,
            'ch.swisstopo-vd.official-survey',
            { outputProjection: LV95 }
        )

        expect(layerLV95).toBeDefined()
        assertType<ExternalWMSLayer>(layerLV95!)

        expect(layerLV95!.id).to.eql('ch.swisstopo-vd.official-survey')
        expect(layerLV95!.extent).toHaveLength(4)
        let expected: FlatExtent = [2485071.58, 1075346.31, 2828515.82, 1299941.79]

        expect(layerLV95!.extent!.length).to.eql(4)
        expected.forEach((value, index) => {
            expect(layerLV95!.extent![index]).toBeCloseTo(value, 2)
        })

        const layerWGS84 = externalWMSParser.getExternalLayer(
            capabilities,
            'ch.swisstopo-vd.official-survey',
            { outputProjection: WGS84 }
        )

        expect(layerWGS84).toBeDefined()
        expect(layerWGS84!.id).toEqual('ch.swisstopo-vd.official-survey')
        expect(layerWGS84!.extent).toHaveLength(4)
        expected = [5.96, 45.82, 10.49, 47.81]
        // No re-projection expected, therefore, do an exact match
        expect(layerWGS84!.extent).toEqual(expected)

        const layerWebMercator = externalWMSParser.getExternalLayer(
            capabilities,
            'ch.swisstopo-vd.official-survey',
            { outputProjection: WEBMERCATOR }
        )
        expect(layerWebMercator).toBeDefined()
        expect(layerWebMercator!.id).to.eql('ch.swisstopo-vd.official-survey')
        expect(layerWebMercator!.extent).toHaveLength(4)
        expected = [663464.17, 5751550.87, 1167741.46, 6075303.61]
        expected.forEach((value, index) => {
            expect(layerWebMercator!.extent![index]).toBeCloseTo(value, 2)
        })
    })
    it('Parse layer layer extent from parent layer EX_GeographicBoundingBox', () => {
        const content = `<?xml version='1.0' encoding="UTF-8" standalone="no"?>
        <WMS_Capabilities version="1.3.0">
            <Capability>
                <Layer>
                    <Title>WMS BGDI</Title>
                    <EX_GeographicBoundingBox>
                        <westBoundLongitude>5.96</westBoundLongitude>
                        <eastBoundLongitude>10.49</eastBoundLongitude>
                        <southBoundLatitude>45.82</southBoundLatitude>
                        <northBoundLatitude>47.81</northBoundLatitude>
                    </EX_GeographicBoundingBox>
                    <Layer queryable="1" opaque="0" cascaded="1">
                        <Name>ch.swisstopo-vd.official-survey</Name>
                        <Title>OpenData-AV</Title>
                    </Layer>
                </Layer>
            </Capability>
        </WMS_Capabilities>
        `
        const capabilities: WMSCapabilitiesResponse = externalWMSParser.parse(
            content,
            new URL('https://wms.geo.admin.ch')
        )
        // LV95
        const layerLV95 = externalWMSParser.getExternalLayer(
            capabilities,
            'ch.swisstopo-vd.official-survey',
            { outputProjection: LV95 }
        )

        expect(layerLV95).toBeDefined()
        assertType<ExternalWMSLayer>(layerLV95!)

        expect(layerLV95!.id).to.eql('ch.swisstopo-vd.official-survey')
        expect(layerLV95!.extent).toHaveLength(4)
        let expected: FlatExtent = [2485071.58, 1075346.31, 2828515.82, 1299941.79]
        expected.forEach((value, index) => {
            expect(layerLV95!.extent![index]).toBeCloseTo(value, 2)
        })

        const layerWGS84 = externalWMSParser.getExternalLayer(
            capabilities,
            'ch.swisstopo-vd.official-survey',
            { outputProjection: WGS84 }
        )

        expect(layerWGS84).toBeDefined()
        assertType<ExternalWMSLayer>(layerWGS84!)

        expect(layerWGS84!.id).to.eql('ch.swisstopo-vd.official-survey')
        expect(layerWGS84!.extent).toHaveLength(4)
        expected = [5.96, 45.82, 10.49, 47.81]
        // No re-projection expected therefore do an exact match
        expect(layerWGS84!.extent).toEqual(expected)

        const layerWebMercator = externalWMSParser.getExternalLayer(
            capabilities,
            'ch.swisstopo-vd.official-survey',
            { outputProjection: WEBMERCATOR }
        )

        expect(layerWebMercator).toBeDefined()
        expect(layerWebMercator!.id).to.eql('ch.swisstopo-vd.official-survey')
        expect(layerWebMercator!.extent).toHaveLength(4)
        expected = [663464.17, 5751550.87, 1167741.46, 6075303.61]
        expected.forEach((value, index) => {
            expect(layerWebMercator!.extent![index]).toBeCloseTo(value, 2)
        })
    })
})

describe('EX_GeographicBoundingBox - Group of layers', () => {
    it('Parse group of layers - single hierarchy', () => {
        const content = `<?xml version='1.0' encoding="UTF-8" standalone="no"?>
        <WMS_Capabilities version="1.3.0">
            <Capability>
                <Layer>
                    <Title>WMS BGDI</Title>
                    <EX_GeographicBoundingBox>
                        <westBoundLongitude>5.96</westBoundLongitude>
                        <eastBoundLongitude>10.49</eastBoundLongitude>
                        <southBoundLatitude>45.82</southBoundLatitude>
                        <northBoundLatitude>47.81</northBoundLatitude>
                    </EX_GeographicBoundingBox>
                    <Layer queryable="1" opaque="0" cascaded="1">
                        <Name>ch.swisstopo-vd.official-survey</Name>
                        <Title>OpenData-AV</Title>
                        <Layer queryable="1" opaque="0" cascaded="1">
                            <Name>ch.swisstopo-vd.official-survey-1</Name>
                            <Title>OpenData-AV 1</Title>
                        </Layer>
                        <Layer queryable="1" opaque="0" cascaded="1">
                            <Name>ch.swisstopo-vd.official-survey-2</Name>
                            <Title>OpenData-AV 2</Title>
                        </Layer>
                        <Layer queryable="1" opaque="0" cascaded="1">
                            <Name>ch.swisstopo-vd.official-survey-3</Name>
                            <Title>OpenData-AV 3</Title>
                        </Layer>
                    </Layer>
                </Layer>
            </Capability>
        </WMS_Capabilities>
        `
        const capabilities: WMSCapabilitiesResponse = externalWMSParser.parse(
            content,
            new URL('https://wms.geo.admin.ch')
        )
        const layers: ExternalWMSLayer[] = externalWMSParser.getAllExternalLayers(capabilities, {
            outputProjection: LV95,
        })

        expect(layers).toBeDefined()
        assertType<ExternalWMSLayer[]>(layers)

        expect(layers.length).to.eql(1)
        expect(layers[0]!.id).to.eql('ch.swisstopo-vd.official-survey')
        assertType<ExternalWMSLayer>(layers[0]!)

        expect(layers[0]!.layers!.length).to.eql(3)
        assertType<ExternalWMSLayer>(layers[0]!.layers![0]!)
        expect(layers[0]!.layers![0]!.id).to.eql('ch.swisstopo-vd.official-survey-1')

        assertType<ExternalWMSLayer>(layers[0]!.layers![1]!)
        expect(layers[0]!.layers![1]!.id).to.eql('ch.swisstopo-vd.official-survey-2')

        assertType<ExternalWMSLayer>(layers[0]!.layers![2]!)
        expect(layers[0]!.layers![2]!.id).to.eql('ch.swisstopo-vd.official-survey-3')
    })
    it('Parse group of layers - multiple hierarchy', () => {
        const content = `<?xml version='1.0' encoding="UTF-8" standalone="no"?>
        <WMS_Capabilities version="1.3.0">
            <Capability>
                <Layer>
                    <Title>WMS BGDI</Title>
                    <EX_GeographicBoundingBox>
                        <westBoundLongitude>5.96</westBoundLongitude>
                        <eastBoundLongitude>10.49</eastBoundLongitude>
                        <southBoundLatitude>45.82</southBoundLatitude>
                        <northBoundLatitude>47.81</northBoundLatitude>
                    </EX_GeographicBoundingBox>
                    <Layer queryable="1" opaque="0" cascaded="1">
                        <Name>ch.swisstopo-vd.official-survey</Name>
                        <Title>OpenData-AV</Title>
                        <Layer queryable="1" opaque="0" cascaded="1">
                            <Name>ch.swisstopo-vd.official-survey-1</Name>
                            <Title>OpenData-AV 1</Title>
                        </Layer>
                        <Layer queryable="1" opaque="0" cascaded="1">
                            <Name>ch.swisstopo-vd.official-survey-2</Name>
                            <Title>OpenData-AV 2</Title>
                        </Layer>
                        <Layer queryable="1" opaque="0" cascaded="1">
                            <Name>ch.swisstopo-vd.official-survey-3</Name>
                            <Title>OpenData-AV 3</Title>
                            <Layer queryable="1" opaque="0" cascaded="1">
                                <Name>ch.swisstopo-vd.official-survey-3-sub-1</Name>
                                <Title>OpenData-AV 3.1</Title>
                            </Layer>
                            <Layer queryable="1" opaque="0" cascaded="1">
                                <Name>ch.swisstopo-vd.official-survey-3-sub-2</Name>
                                <Title>OpenData-AV 3.2</Title>
                                <Layer queryable="1" opaque="0" cascaded="1">
                                    <Name>ch.swisstopo-vd.official-survey-3-sub-2-1</Name>
                                    <Title>OpenData-AV 3.2.1</Title>
                                </Layer>
                                <Layer queryable="1" opaque="0" cascaded="1">
                                    <Name>ch.swisstopo-vd.official-survey-3-sub-2-2</Name>
                                    <Title>OpenData-AV 3.2.2</Title>
                                </Layer>
                            </Layer>
                        </Layer>
                    </Layer>
                </Layer>
            </Capability>
        </WMS_Capabilities>
        `
        const capabilities: WMSCapabilitiesResponse = externalWMSParser.parse(
            content,
            new URL('https://wms.geo.admin.ch')
        )
        const layers: ExternalWMSLayer[] = externalWMSParser.getAllExternalLayers(capabilities, {
            outputProjection: LV95,
        })

        expect(layers).toBeDefined()
        expect(layers.length).to.eql(1)
        expect(layers[0]).toBeDefined()

        const parentLayer = layers[0]!
        expect(parentLayer.id).to.eql('ch.swisstopo-vd.official-survey')
        expect(parentLayer.layers).toBeDefined()
        expect(parentLayer.layers!.length).to.eql(3)

        const firstLayer = parentLayer.layers![0]!
        const secondLayer = parentLayer.layers![1]!
        const thirdLayer = parentLayer.layers![2]!

        assertType<ExternalWMSLayer>(firstLayer)
        expect(firstLayer.id).to.eql('ch.swisstopo-vd.official-survey-1')
        assertType<ExternalWMSLayer>(secondLayer)
        expect(secondLayer.id).to.eql('ch.swisstopo-vd.official-survey-2')
        assertType<ExternalWMSLayer>(thirdLayer)
        expect(thirdLayer.id).to.eql('ch.swisstopo-vd.official-survey-3')

        expect(thirdLayer.layers).toBeDefined()
        expect(thirdLayer.layers!.length).to.eql(2)

        const thirdLayerSub1 = thirdLayer.layers![0]!
        const thirdLayerSub2 = thirdLayer.layers![1]!
        assertType<ExternalWMSLayer>(thirdLayerSub1)
        expect(thirdLayerSub1.id).to.eql('ch.swisstopo-vd.official-survey-3-sub-1')
        assertType<ExternalWMSLayer>(thirdLayerSub2)
        expect(thirdLayerSub2.id).to.eql('ch.swisstopo-vd.official-survey-3-sub-2')

        expect(thirdLayerSub2.layers).toBeDefined()
        expect(thirdLayerSub2.layers!.length).to.eql(2)
        const thirdLayerSub2_1 = thirdLayerSub2.layers![0]!
        const thirdLayerSub2_2 = thirdLayerSub2.layers![1]!

        assertType<ExternalWMSLayer>(thirdLayerSub2_1)
        expect(thirdLayerSub2_1.id).to.eql('ch.swisstopo-vd.official-survey-3-sub-2-1')
        assertType<ExternalWMSLayer>(thirdLayerSub2_2)
        expect(thirdLayerSub2_2.id).to.eql('ch.swisstopo-vd.official-survey-3-sub-2-2')
    })
    it('Search layer in multiple hierarchy', () => {
        const content = `<?xml version='1.0' encoding="UTF-8" standalone="no"?>
        <WMS_Capabilities version="1.3.0">
            <Capability>
                <Layer>
                    <Title>WMS BGDI</Title>
                    <EX_GeographicBoundingBox>
                        <westBoundLongitude>5.96</westBoundLongitude>
                        <eastBoundLongitude>10.49</eastBoundLongitude>
                        <southBoundLatitude>45.82</southBoundLatitude>
                        <northBoundLatitude>47.81</northBoundLatitude>
                    </EX_GeographicBoundingBox>
                    <Layer queryable="1" opaque="0" cascaded="1">
                        <Name>ch.swisstopo-vd.official-survey</Name>
                        <Title>OpenData-AV</Title>
                        <Layer queryable="1" opaque="0" cascaded="1">
                            <Name>ch.swisstopo-vd.official-survey-1</Name>
                            <Title>OpenData-AV 1</Title>
                        </Layer>
                        <Layer queryable="1" opaque="0" cascaded="1">
                            <Name>ch.swisstopo-vd.official-survey-2</Name>
                            <Title>OpenData-AV 2</Title>
                        </Layer>
                        <Layer queryable="1" opaque="0" cascaded="1">
                            <Name>ch.swisstopo-vd.official-survey-3</Name>
                            <Title>OpenData-AV 3</Title>
                            <Layer queryable="1" opaque="0" cascaded="1">
                                <Name>ch.swisstopo-vd.official-survey-3-sub-1</Name>
                                <Title>OpenData-AV 3.1</Title>
                            </Layer>
                            <Layer queryable="1" opaque="0" cascaded="1">
                                <Name>ch.swisstopo-vd.official-survey-3-sub-2</Name>
                                <Title>OpenData-AV 3.2</Title>
                                <Layer queryable="1" opaque="0" cascaded="1">
                                    <Name>ch.swisstopo-vd.official-survey-3-sub-2-1</Name>
                                    <Title>OpenData-AV 3.2.1</Title>
                                </Layer>
                                <Layer queryable="1" opaque="0" cascaded="1">
                                    <Title>OpenData-AV 3.2.2</Title>
                                </Layer>
                                <Layer queryable="1" opaque="0" cascaded="1">
                                    <Name>ch.swisstopo-vd.official-survey-3-sub-2-3</Name>
                                    <Title>OpenData-AV 3.2.3</Title>
                                </Layer>
                            </Layer>
                        </Layer>
                    </Layer>
                </Layer>
            </Capability>
        </WMS_Capabilities>
        `
        const capabilities: WMSCapabilitiesResponse = externalWMSParser.parse(
            content,
            new URL('https://wms.geo.admin.ch')
        )

        // search root layer
        const layer = externalWMSParser.getExternalLayer(
            capabilities,
            'ch.swisstopo-vd.official-survey',
            { outputProjection: LV95 }
        )
        expect(layer).toBeDefined()
        expect(layer?.id).to.eql('ch.swisstopo-vd.official-survey')

        // // search first hierarchy layer
        // layer = externalWMSParser.getExternalLayer(
        //     capabilities,
        //     'ch.swisstopo-vd.official-survey-2',
        //     { outputProjection: LV95 }
        // )
        // expect(layer).toBeDefined()
        // expect(layer?.id).to.eql('ch.swisstopo-vd.official-survey-2')
        //
        // // Search sublayer
        // layer = externalWMSParser.getExternalLayer(
        //     capabilities,
        //     'ch.swisstopo-vd.official-survey-3-sub-2-1',
        //     { outputProjection: LV95 }
        // )
        // expect(layer).toBeDefined()
        // expect(layer?.id).to.eql('ch.swisstopo-vd.official-survey-3-sub-2-1')
        //
        // // Search sublayer without name
        // layer = externalWMSParser.getExternalLayer(capabilities, 'OpenData-AV 3.2.2', {
        //     outputProjection: LV95,
        // })
        // expect(layer).toBeDefined()
        // expect(layer?.id).to.eql('OpenData-AV 3.2.2')
    })
})
