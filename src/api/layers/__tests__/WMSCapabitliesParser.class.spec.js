import { readFile } from 'fs/promises'
import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest'

import ExternalGroupOfLayers from '@/api/layers/ExternalGroupOfLayers.class'
import { LayerLegend } from '@/api/layers/ExternalLayer.class'
import ExternalWMSLayer from '@/api/layers/ExternalWMSLayer.class'
import WMSCapabilitiesParser from '@/api/layers/WMSCapabilitiesParser.class'
import { LV95, WEBMERCATOR, WGS84 } from '@/utils/coordinates/coordinateSystems'

describe('WMSCapabilitiesParser - invalid', () => {
    it('Throw Error on invalid input', () => {
        const invalidContent = 'Invalid input'

        expect(
            () => new WMSCapabilitiesParser(invalidContent, 'https://wms.geo.admin.ch')
        ).toThrowError(/failed/i)
    })
})

describe('WMSCapabilitiesParser of wms-geoadmin-sample.xml', () => {
    let capabilities
    beforeAll(async () => {
        const content = await readFile(`${__dirname}/wms-geoadmin-sample.xml`, 'utf8')
        capabilities = new WMSCapabilitiesParser(content, 'https://wms.geo.admin.ch')
    })
    it('Parse Capabilities', async () => {
        expect(capabilities.version).toBe('1.3.0')
        expect(capabilities.Capability).toBeTypeOf('object')
        expect(capabilities.Service).toBeTypeOf('object')
        expect(capabilities.originUrl).toBeInstanceOf(URL)
        expect(capabilities.originUrl.toString()).toBe('https://wms.geo.admin.ch/')
    })
    it('Parse layer attributes', () => {
        // General layer
        let layer = capabilities.getExternalLayerObject('ch.swisstopo-vd.official-survey', WGS84)
        expect(layer.externalLayerId).toBe('ch.swisstopo-vd.official-survey')
        expect(layer.name).toBe('OpenData-AV')
        expect(layer.abstract).toBe('The official survey (AV).')
        expect(layer.baseURL).toBe('https://wms.geo.admin.ch/?')

        // Layer without .Name
        layer = capabilities.getExternalLayerObject('Periodic-Tracking', WGS84)
        expect(layer.externalLayerId).toBe('Periodic-Tracking')
        expect(layer.name).toBe('Periodic-Tracking')
        expect(layer.abstract).toBe('Layer without Name element should use the Title')
        expect(layer.baseURL).toBe('https://wms.geo.admin.ch/?')
    })
    it('Parse layer attribution', () => {
        // Attribution in root layer
        let layer = capabilities.getExternalLayerObject('ch.swisstopo-vd.official-survey', WGS84)
        expect(layer.externalLayerId).toBe('ch.swisstopo-vd.official-survey')
        expectTypeOf(layer.attributions).toBeArray()
        expect(layer.attributions.length).toBe(1)
        expectTypeOf(layer.attributions[0]).toEqualTypeOf({ name: 'string', url: 'string' })
        expect(layer.attributions[0].name).toBe('The federal geoportal')
        expect(layer.attributions[0].url).toBe('https://www.geo.admin.ch/attribution')

        // Attribution in layer
        layer = capabilities.getExternalLayerObject('Periodic-Tracking', WGS84)
        expect(layer.externalLayerId).toBe('Periodic-Tracking')
        expectTypeOf(layer.attributions).toBeArray()
        expect(layer.attributions.length).toBe(1)
        expectTypeOf(layer.attributions[0]).toEqualTypeOf({ name: 'string', url: 'string' })
        expect(layer.attributions[0].name).toBe('BGDI')
        expect(layer.attributions[0].url).toBe('https://www.geo.admin.ch/attribution-bgdi')
    })
    it('Get Layer Extent in LV95', () => {
        const externalLayers = capabilities.getAllExternalLayerObjects(LV95)
        // Extent from matching CRS BoundingBox
        expect(externalLayers[0].externalLayerId).toBe('ch.swisstopo-vd.official-survey')
        let expected = [
            [2100000, 1030000],
            [2900000, 1400000],
        ]
        // Here we should not do any re-projection therefore do an exact match
        expect(externalLayers[0].extent).toEqual(expected)

        // Extent from non matching CRS BoundingBox
        expect(externalLayers[1].externalLayerId).toBe('Periodic-Tracking')
        expected = [
            [2485071.58, 1075346.3],
            [2828515.82, 1299941.79],
        ]
        expect(externalLayers[1].extent.length).toBe(2)
        expect(externalLayers[1].extent[0].length).toBe(2)
        expect(externalLayers[1].extent[1].length).toBe(2)
        expect(externalLayers[1].extent[0][0]).toBeCloseTo(expected[0][0], 1)
        expect(externalLayers[1].extent[0][1]).toBeCloseTo(expected[0][1], 1)
        expect(externalLayers[1].extent[1][0]).toBeCloseTo(expected[1][0], 1)
        expect(externalLayers[1].extent[1][1]).toBeCloseTo(expected[1][1], 1)
    })
    it('Parse layer legend', () => {
        // General layer
        let layer = capabilities.getExternalLayerObject('ch.swisstopo-vd.official-survey', WGS84)
        expect(layer.externalLayerId).toBe('ch.swisstopo-vd.official-survey')
        expect(layer.legends.length).toBe(0)

        // Layer without .Name
        layer = capabilities.getExternalLayerObject('Periodic-Tracking', WGS84)
        expect(layer.externalLayerId).toBe('Periodic-Tracking')
        expect(layer.legends.length).toBe(1)
        expect(layer.legends[0]).toBeInstanceOf(LayerLegend)
        expect(layer.legends[0].url).toBe(
            'https://wms.geo.admin.ch/?version=1.3.0&service=WMS&request=GetLegendGraphic&sld_version=1.1.0&layer=ch.swisstopo-vd.geometa-periodische_nachfuehrung&format=image/png&STYLE=default'
        )
        expect(layer.legends[0].format).toBe('image/png')
        expect(layer.legends[0].width).toBe(168)
        expect(layer.legends[0].height).toBe(22)
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
        let capabilities = new WMSCapabilitiesParser(content, 'https://wms.geo.admin.ch')
        let layer = capabilities.getExternalLayerObject('ch.swisstopo-vd.official-survey', WGS84)
        expect(layer.baseURL).toBe('https://wms.geo.admin.ch/')

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
        capabilities = new WMSCapabilitiesParser(content, 'https://wms.geo.admin.ch')
        layer = capabilities.getExternalLayerObject('ch.swisstopo-vd.official-survey', WGS84)
        expect(layer.baseURL).toBe('https://wms.geo.admin.ch/map?')
    })
})

describe('WMSCapabilitiesParser - attributions', () => {
    it('Parse layer attribution - no attribution', () => {
        let content = `<?xml version='1.0' encoding="UTF-8" standalone="no"?>
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
        let capabilities = new WMSCapabilitiesParser(content, 'https://wms.geo.admin.ch')
        // No attribution, use Service
        let layer = capabilities.getExternalLayerObject('ch.swisstopo-vd.official-survey', WGS84)
        expect(layer.externalLayerId).toBe('ch.swisstopo-vd.official-survey')
        expectTypeOf(layer.attributions).toBeArray()
        expect(layer.attributions.length).toBe(1)
        expectTypeOf(layer.attributions[0]).toEqualTypeOf({ name: 'string', url: 'string' })
        expect(layer.attributions[0].name).toBe('WMS BGDI')
        expect(layer.attributions[0].url).toBeNull()

        // No attribution and Service without Title
        content = `<?xml version='1.0' encoding="UTF-8" standalone="no"?>
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
        capabilities = new WMSCapabilitiesParser(content, 'https://wms.geo.admin.ch')
        // Attribution in service
        layer = capabilities.getExternalLayerObject('ch.swisstopo-vd.official-survey', WGS84)
        expect(layer.externalLayerId).toBe('ch.swisstopo-vd.official-survey')
        expectTypeOf(layer.attributions).toBeArray()
        expect(layer.attributions.length).toBe(1)
        expectTypeOf(layer.attributions[0]).toEqualTypeOf({ name: 'string', url: 'string' })
        expect(layer.attributions[0].name).toBe('wms.geo.admin.ch')
        expect(layer.attributions[0].url).toBeNull()

        // No attribution and no service
        content = `<?xml version='1.0' encoding="UTF-8" standalone="no"?>
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
        capabilities = new WMSCapabilitiesParser(content, 'https://wms.geo.admin.ch')
        // Attribution in service
        layer = capabilities.getExternalLayerObject('ch.swisstopo-vd.official-survey', WGS84)
        expect(layer.externalLayerId).toBe('ch.swisstopo-vd.official-survey')
        expectTypeOf(layer.attributions).toBeArray()
        expect(layer.attributions.length).toBe(1)
        expectTypeOf(layer.attributions[0]).toEqualTypeOf({ name: 'string', url: 'string' })
        expect(layer.attributions[0].name).toBe('wms.geo.admin.ch')
        expect(layer.attributions[0].url).toBeNull()
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
        const capabilities = new WMSCapabilitiesParser(content, 'https://wms.geo.admin.ch')

        const layer = capabilities.getExternalLayerObject('ch.swisstopo-vd.official-survey', WGS84)
        expect(layer.externalLayerId).toBe('ch.swisstopo-vd.official-survey')
        expectTypeOf(layer.attributions).toBeArray()
        expect(layer.attributions.length).toBe(1)
        expectTypeOf(layer.attributions[0]).toEqualTypeOf({ name: 'string', url: 'string' })
        expect(layer.attributions[0].name).toBe('The federal geoportal')
        expect(layer.attributions[0].url).toBe('https://www.geo.admin.ch/attribution')
    })

    it('Parse layer attribution - attribution in layer', () => {
        let content = `<?xml version='1.0' encoding="UTF-8" standalone="no"?>
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
        let capabilities = new WMSCapabilitiesParser(content, 'https://wms.geo.admin.ch')
        // Attribution in layer
        let layer = capabilities.getExternalLayerObject('ch.swisstopo-vd.official-survey', WGS84)
        expect(layer.externalLayerId).toBe('ch.swisstopo-vd.official-survey')
        expectTypeOf(layer.attributions).toBeArray()
        expect(layer.attributions.length).toBe(1)
        expectTypeOf(layer.attributions[0]).toEqualTypeOf({ name: 'string', url: 'string' })
        expect(layer.attributions[0].name).toBe('BGDI Layer')
        expect(layer.attributions[0].url).toBe('https://www.geo.admin.ch/attribution-bgdi')

        // Attribution without title in layer
        content = `<?xml version='1.0' encoding="UTF-8" standalone="no"?>
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
        capabilities = new WMSCapabilitiesParser(content, 'https://wms.geo.admin.ch')
        layer = capabilities.getExternalLayerObject('ch.swisstopo-vd.official-survey', WGS84)
        expect(layer.externalLayerId).toBe('ch.swisstopo-vd.official-survey')
        expectTypeOf(layer.attributions).toBeArray()
        expect(layer.attributions.length).toBe(1)
        expectTypeOf(layer.attributions[0]).toEqualTypeOf({ name: 'string', url: 'string' })
        expect(layer.attributions[0].name).toBe('www.geo.admin.ch')
        expect(layer.attributions[0].url).toBe('https://www.geo.admin.ch/attribution-bgdi')
    })

    it('Parse layer attribution - invalid attribution URL', () => {
        let content = `<?xml version='1.0' encoding="UTF-8" standalone="no"?>
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
        let capabilities = new WMSCapabilitiesParser(content, 'https://wms.geo.admin.ch')
        // No attribution, use Service
        let layer = capabilities.getExternalLayerObject('ch.swisstopo-vd.official-survey', WGS84)
        expect(layer.externalLayerId).toBe('ch.swisstopo-vd.official-survey')
        expectTypeOf(layer.attributions).toBeArray()
        expect(layer.attributions.length).toBe(1)
        expectTypeOf(layer.attributions[0]).toEqualTypeOf({ name: 'string', url: 'string' })
        expect(layer.attributions[0].name).toBe('wms.geo.admin.ch')
        expect(layer.attributions[0].url).toBeNull()
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
        let capabilities = new WMSCapabilitiesParser(content, 'https://wms.geo.admin.ch')
        // LV95
        let layer = capabilities.getExternalLayerObject('ch.swisstopo-vd.official-survey', LV95)
        expect(layer.externalLayerId).toBe('ch.swisstopo-vd.official-survey')
        expectTypeOf(layer.extent).toBeArray()
        let expected = [
            [2485071.58, 1075346.3],
            [2828515.82, 1299941.79],
        ]
        expect(layer.extent.length).toBe(2)
        expect(layer.extent[0].length).toBe(2)
        expect(layer.extent[1].length).toBe(2)
        expect(layer.extent[0][0]).toBeCloseTo(expected[0][0], 1)
        expect(layer.extent[0][1]).toBeCloseTo(expected[0][1], 1)
        expect(layer.extent[1][0]).toBeCloseTo(expected[1][0], 1)
        expect(layer.extent[1][1]).toBeCloseTo(expected[1][1], 1)

        // WGS84
        layer = capabilities.getExternalLayerObject('ch.swisstopo-vd.official-survey', WGS84)
        expect(layer.externalLayerId).toBe('ch.swisstopo-vd.official-survey')
        expectTypeOf(layer.extent).toBeArray()
        expected = [
            [5.96, 45.82],
            [10.49, 47.81],
        ]
        // No re-projection expected therefore do an exact match
        expect(layer.extent).toEqual(expected)

        // Web mercator
        layer = capabilities.getExternalLayerObject('ch.swisstopo-vd.official-survey', WEBMERCATOR)
        expect(layer.externalLayerId).toBe('ch.swisstopo-vd.official-survey')
        expectTypeOf(layer.extent).toBeArray()
        expected = [
            [663464.17, 5751550.86],
            [1167741.46, 6075303.61],
        ]
        expect(layer.extent.length).toBe(2)
        expect(layer.extent[0].length).toBe(2)
        expect(layer.extent[1].length).toBe(2)
        expect(layer.extent[0][0]).toBeCloseTo(expected[0][0], 1)
        expect(layer.extent[0][1]).toBeCloseTo(expected[0][1], 1)
        expect(layer.extent[1][0]).toBeCloseTo(expected[1][0], 1)
        expect(layer.extent[1][1]).toBeCloseTo(expected[1][1], 1)
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
        let capabilities = new WMSCapabilitiesParser(content, 'https://wms.geo.admin.ch')
        // LV95
        let layer = capabilities.getExternalLayerObject('ch.swisstopo-vd.official-survey', LV95)
        expect(layer.externalLayerId).toBe('ch.swisstopo-vd.official-survey')
        expectTypeOf(layer.extent).toBeArray()
        let expected = [
            [2485071.58, 1075346.3],
            [2828515.82, 1299941.79],
        ]
        expect(layer.extent.length).toBe(2)
        expect(layer.extent[0].length).toBe(2)
        expect(layer.extent[1].length).toBe(2)
        expect(layer.extent[0][0]).toBeCloseTo(expected[0][0], 1)
        expect(layer.extent[0][1]).toBeCloseTo(expected[0][1], 1)
        expect(layer.extent[1][0]).toBeCloseTo(expected[1][0], 1)
        expect(layer.extent[1][1]).toBeCloseTo(expected[1][1], 1)

        // WGS84
        layer = capabilities.getExternalLayerObject('ch.swisstopo-vd.official-survey', WGS84)
        expect(layer.externalLayerId).toBe('ch.swisstopo-vd.official-survey')
        expectTypeOf(layer.extent).toBeArray()
        expected = [
            [5.96, 45.82],
            [10.49, 47.81],
        ]
        // No re-projection expected therefore do an exact match
        expect(layer.extent).toEqual(expected)

        // Web mercator
        layer = capabilities.getExternalLayerObject('ch.swisstopo-vd.official-survey', WEBMERCATOR)
        expect(layer.externalLayerId).toBe('ch.swisstopo-vd.official-survey')
        expectTypeOf(layer.extent).toBeArray()
        expected = [
            [663464.17, 5751550.86],
            [1167741.46, 6075303.61],
        ]
        expect(layer.extent.length).toBe(2)
        expect(layer.extent[0].length).toBe(2)
        expect(layer.extent[1].length).toBe(2)
        expect(layer.extent[0][0]).toBeCloseTo(expected[0][0], 1)
        expect(layer.extent[0][1]).toBeCloseTo(expected[0][1], 1)
        expect(layer.extent[1][0]).toBeCloseTo(expected[1][0], 1)
        expect(layer.extent[1][1]).toBeCloseTo(expected[1][1], 1)
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
        let capabilities = new WMSCapabilitiesParser(content, 'https://wms.geo.admin.ch')
        // LV95
        let layers = capabilities.getAllExternalLayerObjects(LV95)
        expect(layers.length).toBe(1)
        expect(layers[0].externalLayerId).toBe('ch.swisstopo-vd.official-survey')
        expect(layers[0]).toBeInstanceOf(ExternalGroupOfLayers)
        expect(layers[0].layers.length).toBe(3)
        expect(layers[0].layers[0]).toBeInstanceOf(ExternalWMSLayer)
        expect(layers[0].layers[0].externalLayerId).toBe('ch.swisstopo-vd.official-survey-1')

        expect(layers[0].layers[1]).toBeInstanceOf(ExternalWMSLayer)
        expect(layers[0].layers[1].externalLayerId).toBe('ch.swisstopo-vd.official-survey-2')

        expect(layers[0].layers[2]).toBeInstanceOf(ExternalWMSLayer)
        expect(layers[0].layers[2].externalLayerId).toBe('ch.swisstopo-vd.official-survey-3')
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
        let capabilities = new WMSCapabilitiesParser(content, 'https://wms.geo.admin.ch')
        // LV95
        let layers = capabilities.getAllExternalLayerObjects(LV95)
        expect(layers.length).toBe(1)
        expect(layers[0].externalLayerId).toBe('ch.swisstopo-vd.official-survey')
        expect(layers[0]).toBeInstanceOf(ExternalGroupOfLayers)
        expect(layers[0].layers.length).toBe(3)
        expect(layers[0].layers[0]).toBeInstanceOf(ExternalWMSLayer)
        expect(layers[0].layers[0].externalLayerId).toBe('ch.swisstopo-vd.official-survey-1')

        expect(layers[0].layers[1]).toBeInstanceOf(ExternalWMSLayer)
        expect(layers[0].layers[1].externalLayerId).toBe('ch.swisstopo-vd.official-survey-2')

        expect(layers[0].layers[2]).toBeInstanceOf(ExternalGroupOfLayers)
        expect(layers[0].layers[2].externalLayerId).toBe('ch.swisstopo-vd.official-survey-3')

        expect(layers[0].layers[2].layers[0]).toBeInstanceOf(ExternalWMSLayer)
        expect(layers[0].layers[2].layers[0].externalLayerId).toBe(
            'ch.swisstopo-vd.official-survey-3-sub-1'
        )

        expect(layers[0].layers[2].layers[1]).toBeInstanceOf(ExternalGroupOfLayers)
        expect(layers[0].layers[2].layers[1].externalLayerId).toBe(
            'ch.swisstopo-vd.official-survey-3-sub-2'
        )

        expect(layers[0].layers[2].layers[1].layers[0]).toBeInstanceOf(ExternalWMSLayer)
        expect(layers[0].layers[2].layers[1].layers[0].externalLayerId).toBe(
            'ch.swisstopo-vd.official-survey-3-sub-2-1'
        )

        expect(layers[0].layers[2].layers[1].layers[1]).toBeInstanceOf(ExternalWMSLayer)
        expect(layers[0].layers[2].layers[1].layers[1].externalLayerId).toBe(
            'ch.swisstopo-vd.official-survey-3-sub-2-2'
        )
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
        let capabilities = new WMSCapabilitiesParser(content, 'https://wms.geo.admin.ch')

        // search root layer
        let layer = capabilities.getExternalLayerObject('ch.swisstopo-vd.official-survey', LV95)
        expect(layer).not.toBeNull()
        expect(layer.externalLayerId).toBe('ch.swisstopo-vd.official-survey')

        // search first hierarchy layer
        layer = capabilities.getExternalLayerObject('ch.swisstopo-vd.official-survey-2', LV95)
        expect(layer).not.toBeNull()
        expect(layer.externalLayerId).toBe('ch.swisstopo-vd.official-survey-2')

        // Search sublayer
        layer = capabilities.getExternalLayerObject(
            'ch.swisstopo-vd.official-survey-3-sub-2-1',
            LV95
        )
        expect(layer).not.toBeNull()
        expect(layer.externalLayerId).toBe('ch.swisstopo-vd.official-survey-3-sub-2-1')

        // Search sublayer without name
        layer = capabilities.getExternalLayerObject('OpenData-AV 3.2.2', LV95)
        expect(layer).not.toBeNull()
        expect(layer.externalLayerId).toBe('OpenData-AV 3.2.2')
    })
})
