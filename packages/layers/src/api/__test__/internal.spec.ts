import { assertType, describe, expect, it } from 'vitest'

import type {
    GeoAdminAggregateLayer,
    GeoAdminGeoJSONLayer,
    GeoAdminLayer,
    GeoAdminWMSLayer,
    GeoAdminWMTSLayer,
} from '@/types'

import { generateLayerObject } from '@/api'
import { LayerType, YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA } from '@/types'

import rawLayerConfig from './rawLayerConfig.json'

function parseLayer(layerId: string): GeoAdminLayer | undefined {
    return generateLayerObject(
        // @ts-expect-error no idea why TS complains here...
        rawLayerConfig[layerId] as Record<string, unknown>,
        layerId,
        rawLayerConfig,
        'en',
        'production'
    )
}

describe('Test layer config parsing', () => {
    describe('WMS', () => {
        it('parses a WMS layer defining a gutter correctly', () => {
            const layerId = 'ch.vbs.kataster-belasteter-standorte-militaer'
            const layer = parseLayer(layerId)

            // @ts-expect-error raising type from GeoAdminLayer to GeoAdminWMSLayer
            assertType<GeoAdminWMSLayer>(layer)
            const wmsLayer = layer as GeoAdminWMSLayer
            assertType<number>(wmsLayer.gutter)

            expect(wmsLayer.id).to.eq(layerId)
            expect(wmsLayer.gutter).to.eq(15)

            expect(wmsLayer.hasTooltip).to.be.true
            expect(wmsLayer.name).to.eq('CCS military')
            expect(wmsLayer.isExternal).to.be.false
            expect(wmsLayer.hasLegend).to.be.true
            expect(wmsLayer.isHighlightable).to.be.true
            expect(wmsLayer.searchable).to.be.true
            expect(wmsLayer.timeConfig).toBeDefined()
            expect(wmsLayer.timeConfig.currentTimeEntry).to.be.undefined
            expect(wmsLayer.opacity).to.eq(0.75)
        })
        it('parses a WMS with multiple year-timestamps correctly', () => {
            const layerId = 'ch.bafu.gewaesserschutz-chemischer_zustand_doc'
            const layer = parseLayer(layerId)

            // @ts-expect-error raising type from GeoAdminLayer to GeoAdminWMSLayer
            assertType<GeoAdminWMSLayer>(layer)
            const wmsLayer = layer as GeoAdminWMSLayer

            expect(wmsLayer.timeConfig).to.not.be.undefined
            expect(wmsLayer.timeConfig?.timeEntries).to.toHaveLength(13)
            expect(
                wmsLayer.timeConfig?.timeEntries.map((entry) =>
                    parseInt(entry.timestamp.substring(0, 4))
                )
            ).to.eql([2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011])
        })
    })
    describe('WMTS', () => {
        it('parses a WMTS with full-date timestamp correctly', () => {
            const layerId = 'ch.swisstopo.lubis-luftbilder-dritte-firmen'
            const layer = parseLayer(layerId)

            // @ts-expect-error raising type from GeoAdminLayer to GeoAdminWMTSLayer
            assertType<GeoAdminWMTSLayer>(layer)
            const wmtsLayer = layer as GeoAdminWMTSLayer

            expect(wmtsLayer.timeConfig).to.not.be.undefined
            expect(wmtsLayer.timeConfig?.timeEntries).to.toHaveLength(92)
            expect(
                wmtsLayer.timeConfig?.timeEntries.map((entry) =>
                    parseInt(entry.timestamp.substring(0, 4))
                )
            ).to.eql([
                YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA,
                2016,
                2011,
                2010,
                2009,
                2008,
                2007,
                2006,
                2005,
                2004,
                2003,
                2002,
                2001,
                2000,
                1999,
                1998,
                1997,
                1996,
                1995,
                1994,
                1993,
                1992,
                1991,
                1990,
                1989,
                1988,
                1987,
                1986,
                1985,
                1984,
                1983,
                1982,
                1981,
                1980,
                1979,
                1978,
                1977,
                1976,
                1975,
                1974,
                1973,
                1972,
                1971,
                1970,
                1969,
                1968,
                1967,
                1966,
                1965,
                1964,
                1963,
                1962,
                1961,
                1960,
                1959,
                1958,
                1957,
                1956,
                1955,
                1954,
                1953,
                1952,
                1951,
                1950,
                1949,
                1948,
                1947,
                1946,
                1945,
                1943,
                1939,
                1938,
                1937,
                1936,
                1935,
                1934,
                1933,
                1932,
                1931,
                1930,
                1929,
                1928,
                1927,
                1926,
                1925,
                1924,
                1923,
                1922,
                1921,
                1920,
                1919,
                1918,
            ])
        })
        it('parses a WMTS with year only timestamp correctly', () => {
            const layerId = 'ch.swisstopo.lubis-terrestrische_aufnahmen'
            const layer = parseLayer(layerId)

            // @ts-expect-error raising type from GeoAdminLayer to GeoAdminWMTSLayer
            assertType<GeoAdminWMTSLayer>(layer)
            const wmtsLayer = layer as GeoAdminWMTSLayer

            expect(wmtsLayer.timeConfig).to.not.be.undefined
            expect(wmtsLayer.timeConfig?.timeEntries).to.toHaveLength(34)
            expect(
                wmtsLayer.timeConfig?.timeEntries.map((entry) => parseInt(entry.timestamp))
            ).to.eql([
                YEAR_TO_DESCRIBE_ALL_OR_CURRENT_DATA,
                1961,
                1947,
                1945,
                1944,
                1943,
                1942,
                1941,
                1940,
                1939,
                1938,
                1937,
                1936,
                1935,
                1934,
                1933,
                1932,
                1931,
                1930,
                1929,
                1928,
                1927,
                1926,
                1925,
                1924,
                1923,
                1922,
                1921,
                1920,
                1919,
                1918,
                1917,
                1916,
                1915,
            ])
        })
    })
    describe('Aggregate', () => {
        it('parses an aggregate layer and its sub-layers correctly', () => {
            const layerId = 'ch.bfs.gebaeude_wohnungs_register_waermequelle_heizung'
            const layer = parseLayer(layerId)

            // @ts-expect-error raising type from GeoAdminLayer to GeoAdminAggregateLayer
            assertType<GeoAdminAggregateLayer>(layer)
            const aggregateLayer = layer as GeoAdminAggregateLayer

            expect(aggregateLayer.subLayers).toHaveLength(2)
            expect(aggregateLayer.subLayers[0].subLayerId).to.eq(
                'ch.bfs.gebaeude_wohnungs_register_waermequelle_heizung_wmts'
            )
            expect(aggregateLayer.subLayers[0].minResolution).to.eq(10)
            expect(aggregateLayer.subLayers[1].subLayerId).to.eq(
                'ch.bfs.gebaeude_wohnungs_register_waermequelle_heizung_wms'
            )
            expect(aggregateLayer.subLayers[1].maxResolution).to.eq(10)
        })
    })
    describe('GeoJSON', () => {
        it('parses a GeoJSON layer correctly', () => {
            const layerId = 'ch.meteoschweiz.messwerte-luftfeuchtigkeit-10min'
            const layer = parseLayer(layerId)

            expect(layer).to.not.be.undefined
            expect(layer.type).to.eq(LayerType.GEOJSON)
            const geoJsonLayer = layer as GeoAdminGeoJSONLayer

            expect(geoJsonLayer.geoJsonUrl).to.eq(
                'https://data.geo.admin.ch/ch.meteoschweiz.messwerte-luftfeuchtigkeit-10min/ch.meteoschweiz.messwerte-luftfeuchtigkeit-10min_en.json'
            )
            expect(geoJsonLayer.styleUrl).to.eq(
                'https://api3.geo.admin.ch/static/vectorStyles/ch.meteoschweiz.messwerte-luftfeuchtigkeit-10min.json'
            )
        })
    })
})
