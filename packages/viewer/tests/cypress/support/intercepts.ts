import type { FlatExtent, SingleCoordinate } from '@swissgeo/coordinates'
import type { ExternalWMSLayer, ExternalWMTSLayer } from '@swissgeo/layers'
import type { Geometry } from 'geojson'

import { LV95, registerProj4, WGS84 } from '@swissgeo/coordinates'
import { layerUtils } from '@swissgeo/layers/utils'
import { randomIntBetween } from '@swissgeo/numbers'
import { centroid } from '@turf/turf'
import proj4 from 'proj4'

import { FAKE_URL_CALLED_AFTER_ROUTE_CHANGE } from '@/store/plugins/storeSync/urlToStore.plugin'

registerProj4(proj4)

// Load fixtures once and cache them for reuse across all tests.
// Interface definitions moved here for fixture cache typing
interface IdentifyBounds {
    lowerX: number
    upperX: number
    lowerY: number
    upperY: number
}

// Exported because it's used in test files (infobox.cy.ts, featureSelection.cy.ts)
export interface MockFeature {
    geometry: Geometry
    layerBodId: string
    bbox: FlatExtent
    featureId: string
    layerName: string
    type: string
    id: string
    properties: {
        label: string
        link_title: string
        link_uri: string
        link_2_title: string | null
        link_2_uri: string | null
        link_3_title: string | null
        link_3_uri: string | null
        x: number
        y: number
        lon: number
        lat: number
    }
    bounds?: IdentifyBounds
}

interface MockFeatureDetail {
    type: string
    featureId: string
    bbox: FlatExtent
    layerBodId: string
    layerName: string
    id: string
    geometry: Geometry
    properties: {
        name: string
        label: string
    }
}

const fixtureCache: {
    featureTemplate?: MockFeature
    featureDetailTemplate?: MockFeatureDetail
} = {}

// Cache transformation results keyed by source/target projection and coordinates
const proj4Cache = new Map<string, [number, number]>()

/**
 * Gets a cached proj4 coordinate transformation, or calculates and caches it if not found.
 *
 * @param from - Source projection EPSG code (e.g., "EPSG:2056" for LV95)
 * @param to - Target projection EPSG code (e.g., "EPSG:4326" for WGS84)
 * @param coordinate - The [x, y] coordinate to transform
 * @returns The transformed [x, y] coordinate
 */
function getCachedProj4Transform(
    from: string,
    to: string,
    coordinate: [number, number]
): [number, number] {
    // Create a unique cache key combining projection systems and coordinates
    const key = `${from}-${to}-${coordinate[0]}-${coordinate[1]}`
    if (!proj4Cache.has(key)) {
        // Cache miss: compute and store the transformation
        proj4Cache.set(key, proj4(from, to, coordinate))
    }
    // Return the cached result
    return proj4Cache.get(key)!
}

const mockExternalWms1 = layerUtils.makeExternalWMSLayer({
    id: 'ch.swisstopo-vd.official-survey',
    name: 'OpenData-AV',
    baseUrl: 'https://fake.wms.base-1.url/?',
    customAttributes: {
        item: 'MyItem',
    },
})
const mockExternalWms2 = layerUtils.makeExternalWMSLayer({
    id: 'Periodic Tracking, with | comma & @ ; äö',
    name: 'Periodic Tracking, with | comma & @ ; äö',
    baseUrl: 'https://fake.wms.base-1.url/?',
    opacity: 0.8,
})
const mockExternalWms3 = layerUtils.makeExternalWMSLayer({
    id: 'ch.swisstopo-vd.spannungsarme-gebiete-2',
    name: 'Spannungsarme Gebiete 2',
    baseUrl: 'https://fake.wms.base-2.url/?',
    isVisible: false,
})
const mockExternalWms4 = layerUtils.makeExternalWMSLayer({
    id: 'ch.swisstopo-vd.stand-oerebkataster-2',
    name: 'Verfügbarkeit des ÖREB-Katasters 2',
    baseUrl: 'https://fake.wms.base-2.url/?',
    isVisible: false,
    opacity: 0.4,
})

// mock configs are read only, no need to clone them
Cypress.Commands.add('getExternalWmsMockConfig', () =>
    cy.wrap([mockExternalWms1, mockExternalWms2, mockExternalWms3, mockExternalWms4])
)

const mockExternalWmts1 = layerUtils.makeExternalWMTSLayer({
    id: 'TestExternalWMTS-1',
    name: 'Test External WMTS 1',
    baseUrl: 'https://fake.wmts.getcap-1.url/WMTSGetCapabilities.xml',
})

const mockExternalWmts2 = layerUtils.makeExternalWMTSLayer({
    id: 'TestExternalWMTS-2;,|@special-chars-äö',
    name: 'Test External WMTS 2;,|@special-chars-äö',
    baseUrl: 'https://fake.wmts.getcap-1.url/WMTSGetCapabilities.xml',
})

const mockExternalWmts3 = layerUtils.makeExternalWMTSLayer({
    id: 'TestExternalWMTS-3',
    name: 'Test External WMTS 3',
    baseUrl: 'https://fake.wmts.getcap-2.url/WMTSGetCapabilities.xml',
})

const mockExternalWmts4 = layerUtils.makeExternalWMTSLayer({
    id: 'TestExternalWMTS-4',
    name: 'Test External WMTS 4',
    baseUrl: 'https://fake.wmts.getcap-2.url/WMTSGetCapabilities.xml',
})

// mock configs are read only, no need to clone them
Cypress.Commands.add('getExternalWmtsMockConfig', () =>
    cy.wrap([mockExternalWmts1, mockExternalWmts2, mockExternalWmts3, mockExternalWmts4])
)

/**
 * Adds an intercept to the fake URL called each time the Vue-router changes route.
 *
 * @param options
 * @param options.aliasName Default is `'routeChange'`
 */
export function addVueRouterIntercept(options: { aliasName?: string } = {}) {
    const { aliasName = 'routeChange' } = options
    cy.intercept(FAKE_URL_CALLED_AFTER_ROUTE_CHANGE, {
        statusCode: 200,
    }).as(aliasName)
}

/**
 * Catches WMTS type URLs in metric WebMercator, Mercator, LV95 or LV03. Returns the same tile for
 * all requests.
 *
 * @param options
 * @param options.aliasJpegTile Default is `'jpegTile'`
 * @param options.aliasPngTile Default is `'pngTile'`
 */
export function addWmtsIntercept(
    options: { aliasJpegTile?: string; aliasPngTile?: string } = {}
): void {
    const { aliasJpegTile = 'jpeg-tile', aliasPngTile = 'png-tile' } = options
    cy.intercept(/1.0.0\/.*\/.*\/.*\/(21781|2056|3857|4326)\/\d+\/\d+\/\d+.jpe?g/, {
        fixture: '256.jpeg',
    }).as(aliasJpegTile)
    cy.intercept(/1.0.0\/.*\/.*\/.*\/(21781|2056|3857|4326)\/\d+\/\d+\/\d+.png/, {
        fixture: '256.png',
    }).as(aliasPngTile)
}

/**
 * Catches WMS type URLs and returns the same image for all requests
 *
 * @param options
 * @param options Default is `'wmsPng'`
 * @param options.imageFormat Default is `'image/png'`
 */
export function addWmsIntercept(options: { aliasName?: string; imageFormat?: string } = {}): void {
    const { aliasName = 'wmsPng', imageFormat = 'image/png' } = options
    cy.intercept(
        {
            method: 'GET',
            hostname: /(wms\d*\.geo\.admin\.ch|sys-wms\d*\.\w+\.bgdi\.ch)/,
            query: {
                SERVICE: 'WMS',
                REQUEST: 'GetMap',
                FORMAT: imageFormat,
            },
        },
        { fixture: 'wms-geo-admin.png' }
    ).as(aliasName)
}

/**
 * @param options
 * @param options.aliasName Default is `'layerConfig'`
 */
export function addLayerConfigIntercept(options: { aliasName?: string } = {}) {
    const { aliasName = 'layerConfig' } = options
    cy.intercept('**/rest/services/all/MapServer/layersConfig**', {
        fixture: 'layers.fixture',
    }).as(aliasName)
}

/**
 * @param options
 * @param options.aliasName Default is `'topics'`
 */
export function addTopicIntercept(options: { aliasName?: string } = {}) {
    const { aliasName = 'topics' } = options
    cy.intercept('**/rest/services', {
        fixture: 'topics.fixture',
    }).as(aliasName)
}

/**
 * Loop over all topics from the fixture file `topics.fixture`, and intercept the request to their
 * catalog with the same fixture file.
 *
 * @param options
 * @param options.aliasPrefix Prefix that will be used in conjunction with each topic ID to create
 *   the alias on the catalog endpoint. Default is `'topic-'`
 */
export function addCatalogIntercept(options: { aliasPrefix?: string } = {}) {
    const { aliasPrefix = 'topic-' } = options
    interface MockTopic {
        activatedLayers: string[]
        backgroundLayers: string[]
        defaultBackground: string
        groupId: number
        id: string
        plConfig: string | null
        selectedLayers: string[]
    }
    // intercepting further topic metadata retrieval
    cy.fixture('topics.fixture').then((mockedTopics: { topics: MockTopic[] }) => {
        mockedTopics.topics.forEach((topic) => {
            cy.intercept(`**/rest/services/${topic.id}/CatalogServer?lang=**`, {
                fixture: 'catalogs.fixture',
            }).as(`${aliasPrefix}${topic.id}`)
        })
    })
}

/**
 * @param options
 * @param options.aliasName Default is `'coordinates-for-height'`
 */
export function addHeightIntercept(options: { aliasName?: string } = {}) {
    const { aliasName = 'coordinates-for-height' } = options
    cy.intercept('**/rest/services/height**', {
        fixture: 'service-alti/height.fixture',
    }).as(aliasName)
}

export function addWhat3WordIntercept(
    options: { convertToAliasName?: string; convertFromAliasName?: string } = {}
) {
    const { convertToAliasName = 'convert-to-w3w', convertFromAliasName = 'convert-from-w3w' } =
        options
    cy.intercept('**/convert-to-3wa**', {
        fixture: 'what3word.fixture',
    }).as(convertToAliasName)
    cy.intercept('**/convert-to-coordinates**', {
        fixture: 'what3word.fixture',
    }).as(convertFromAliasName)
}

function addIconsSetIntercept(): void {
    cy.intercept(`**/api/icons/sets`, {
        fixture: 'service-icons/sets.fixture.json',
    }).as('icon-sets')
}

function addDefaultIconsIntercept(): void {
    cy.intercept(`**/api/icons/sets/default/icons`, {
        fixture: 'service-icons/set-default.fixture.json',
    }).as('icon-set-default')
}

function addSecondIconsIntercept(): void {
    cy.intercept(`**/api/icons/sets/babs/icons`, {
        fixture: 'service-icons/set-babs.fixture.json',
    }).as('icon-set-babs')
}

function addGeoJsonIntercept(): void {
    cy.intercept('**/test.geojson.layer.json', {
        fixture: 'geojson.fixture.json',
    }).as('geojson-data')
    cy.intercept('**/vectorStyles/**', {
        fixture: 'geojson-style.fixture.json',
    }).as('geojson-style')
}

function addCesiumTilesetIntercepts(): void {
    cy.intercept('**/*.3d/**/tileset.json', {
        fixture: '3d/tileset.json',
    }).as('cesiumTileset')
    cy.intercept('**/tile.vctr*', {
        fixture: '3d/tile.vctr',
    }).as('cesiumTile')
    cy.intercept('**/*.terrain.3d/**/*.terrain*', {
        fixture: '3d/tile.terrain',
    }).as('cesiumTerrainTile')
    cy.intercept('**/*.terrain.3d/**/layer.json', {
        fixture: '3d/terrain-3d-layer.json',
    }).as('cesiumTerrainConfig')
}

function addHtmlPopupIntercepts(): void {
    cy.intercept('**/MapServer/**/htmlPopup**', {
        fixture: 'html-popup.fixture.html',
    }).as('htmlPopup')
}

let lastIdentifiedFeatures: MockFeature[] = []

/**
 * Generates dynamically a list of features, with the length corresponding to what was requested in
 * the request's query.
 *
 * Features IDs will start from 1 + offset (if an offset is given) and coordinates will be randomly
 * selected within the LV95 extent (or within the selection box, if one is given).
 */
function addFeatureIdentificationIntercepts(): void {
    // Load fixtures only once on first call, then reuse from cache.
    if (!fixtureCache.featureTemplate) {
        cy.fixture('features/features.fixture').then(
            (featuresFixture: { results: MockFeature[] }) => {
                // using the first entry of the fixture as template
                fixtureCache.featureTemplate = featuresFixture.results.pop() as MockFeature
            }
        )
    }
    if (!fixtureCache.featureDetailTemplate) {
        cy.fixture('features/featureDetail.fixture').then(
            (featureDetail: { feature: MockFeatureDetail }) => {
                fixtureCache.featureDetailTemplate = featureDetail.feature
            }
        )
    }

    cy.intercept('**/MapServer/identify**', (identifyRequest) => {
        lastIdentifiedFeatures = []

        const {
            limit: identifyLimit = 10,
            offset = 0,
            geometry: identifyGeometry = null,
        } = identifyRequest.query
        let startingFeatureId: number = 1
        if (typeof offset === 'number') {
            startingFeatureId += offset
        } else {
            startingFeatureId += parseInt(offset)
        }
        const identifyBounds: IdentifyBounds = {
            lowerX: LV95.bounds.lowerX,
            upperX: LV95.bounds.upperX,
            lowerY: LV95.bounds.lowerY,
            upperY: LV95.bounds.upperY,
        }
        // if a selection box is sent, we use it as bounds to generate our random coordinates
        if (typeof identifyGeometry === 'string') {
            const coordinateSplit = identifyGeometry.split(',').map(parseFloat).map(Math.floor)
            if (coordinateSplit.length === 4) {
                identifyBounds.lowerX = coordinateSplit[0]!
                identifyBounds.upperX = coordinateSplit[2]!
                identifyBounds.lowerY = coordinateSplit[1]!
                identifyBounds.upperY = coordinateSplit[3]!
            } else if (coordinateSplit.length === 2) {
                identifyBounds.lowerX = coordinateSplit[0]! - 1000
                identifyBounds.upperX = coordinateSplit[0]! + 1000
                identifyBounds.lowerY = coordinateSplit[1]! - 1000
                identifyBounds.upperY = coordinateSplit[1]! + 1000
            }
        }

        const limit: number =
            typeof identifyLimit === 'string' ? parseInt(identifyLimit) : identifyLimit
        for (let i: number = 0; i < limit; i++) {
            const coordinate: [number, number] = [
                randomIntBetween(identifyBounds.lowerX, identifyBounds.upperX),
                randomIntBetween(identifyBounds.lowerY, identifyBounds.upperY),
            ]
            // Use cached proj4 transformation
            const coordinateWGS84 = getCachedProj4Transform(LV95.epsg, WGS84.epsg, coordinate)
            const featureId = `${startingFeatureId + i}`

            // Use shallow spread instead of deep clone for memory efficiency
            const feature: MockFeature = {
                ...fixtureCache.featureTemplate!,
                geometry: {
                    ...fixtureCache.featureTemplate!.geometry,
                },
                properties: {
                    ...fixtureCache.featureTemplate!.properties,
                },
            }
            if (feature.geometry.type !== 'GeometryCollection') {
                feature.geometry.coordinates = [coordinate]
            }
            feature.bbox = [...coordinate, ...coordinate] as FlatExtent
            feature.featureId = featureId
            feature.id = featureId
            feature.properties.label = `Feature ${featureId}`
            feature.properties.link_title = `Feature ${featureId} link title`
            feature.properties.link_uri = `https://fake.link.to.feature_${featureId}.ch`
            feature.properties.x = coordinate[0]!
            feature.properties.y = coordinate[1]!
            feature.properties.lon = coordinateWGS84[0]!
            feature.properties.lat = coordinateWGS84[1]!
            feature.bounds = identifyBounds

            lastIdentifiedFeatures.push(feature)
        }

        identifyRequest.reply({
            results: lastIdentifiedFeatures,
        })
    }).as('identify')

    // generating an intercept for each feature(s) detail
    cy.intercept(
        /.*\/rest\/services\/\w+\/MapServer\/[^/]+\/[^?]+\?.*\bgeometryFormat=geojson.*/,
        (req) => {
            const url =
                /.*\/rest\/services\/(?<topic>\w+)\/MapServer\/(?<layerId>.+)\/(?<features>[^?]+)/.exec(
                    req.url
                )

            if (!url || !url.groups) {
                req.reply(404)
                return
            }

            const generateFeature = (featureId: string) => {
                if (!url || !url.groups) {
                    req.reply(404)
                    return
                }

                // Use shallow spread instead of deep clone for memory efficiency
                const featureDetail: MockFeatureDetail = {
                    ...fixtureCache.featureDetailTemplate!,
                    geometry: {
                        ...fixtureCache.featureDetailTemplate!.geometry,
                    },
                    properties: {
                        ...fixtureCache.featureDetailTemplate!.properties,
                    },
                }
                featureDetail.featureId = featureId
                featureDetail.id = featureId
                featureDetail.properties.name = `Feature ${featureId} name`
                featureDetail.properties.label = `Feature ${featureId} label`

                if (featureDetail.layerBodId !== url.groups.layerId) {
                    featureDetail.layerBodId = url.groups.layerId!
                    featureDetail.layerName = `Name of ${url.groups.layerId}`
                }

                const matchingFeature = lastIdentifiedFeatures.find(
                    (feature) => feature.id === featureId
                )
                if (
                    featureDetail.geometry.type === 'GeometryCollection' ||
                    matchingFeature?.geometry.type === 'GeometryCollection'
                ) {
                    return featureDetail
                }

                if (matchingFeature) {
                    const coordinate: SingleCoordinate = centroid(matchingFeature.geometry).geometry
                        .coordinates as SingleCoordinate
                    featureDetail.bbox = [...coordinate, ...coordinate] as FlatExtent
                    featureDetail.geometry.coordinates = [coordinate]
                } else {
                    const randomCoordinate: SingleCoordinate = [
                        Cypress._.random(LV95.bounds.lowerX, LV95.bounds.upperX),
                        Cypress._.random(LV95.bounds.lowerY, LV95.bounds.upperY),
                    ]
                    featureDetail.bbox = [...randomCoordinate, ...randomCoordinate]
                    featureDetail.geometry.coordinates = [randomCoordinate]
                }
                return featureDetail
            }

            const features: string[] = url.groups.features?.split(',') ?? []
            if (features.length > 1) {
                req.reply({
                    type: 'FeatureCollection',
                    features: features.map((featureId) => generateFeature(featureId)),
                })
            } else if (features.length === 1) {
                const featureId = features[0]!
                const featureDetail = generateFeature(featureId)

                req.alias = `featureDetail_${featureId}`
                req.reply({
                    feature: featureDetail,
                })
            }
        }
    ).as('featureDetail')
}

function addPrintCapabilitiesIntercept(): void {
    cy.intercept('GET', '**/capabilities.json', { fixture: 'print/capabilities.json' }).as(
        'printCapabilities'
    )
}

function addPrintRequestIntercept(options?: { printId?: string }): void {
    const { printId = 'print-123456789' } = options ?? {}
    cy.intercept('POST', '**/report.pdf', (req) => {
        req.reply({
            body: {
                ref: printId,
                statusURL: `/print/status/${printId}`,
                downloadURL: `/print/report/${printId}`,
            },
            delay: 200,
        })
    }).as('printRequest')
}

function addPrintStatusIntercept(options?: { printId?: string }): void {
    const { printId = 'print-123456789' } = options ?? {}
    cy.intercept('GET', '**/status/**', (req) => {
        req.reply({
            body: {
                done: true,
                status: 'running',
                elapsedTime: 2594,
                waitingTime: 0,
                downloadURL: `/print/report/${printId}`,
            },
            delay: 1000,
        })
    }).as('printStatus')
}

function addPrintDownloadIntercept(): void {
    cy.intercept('GET', '**/report/print**', {
        headers: { 'content-disposition': 'attachment; filename=mapfish-print-report.pdf' },
        fixture: 'print/mapfish-print-report.pdf',
    }).as('printDownloadReport')
}

function addExternalWmsLayerIntercepts(options?: {
    wmsLayers?: ExternalWMSLayer[]
    wmsGetCapabilitiesFixtureByBaseUrl?: Record<string, string>
}): void {
    const {
        wmsLayers = [mockExternalWms1, mockExternalWms2, mockExternalWms3, mockExternalWms4],
        wmsGetCapabilitiesFixtureByBaseUrl = {
            'https://fake.wms.base-1.url/?': 'external-wms-getcap-1.fixture.xml',
            'https://fake.wms.base-2.url/?': 'external-wms-getcap-2.fixture.xml',
        },
    } = options ?? {}
    wmsLayers.forEach((layer) => {
        cy.intercept(
            {
                url: `${layer.baseUrl}**`,
                query: { REQUEST: 'GetMap', LAYERS: layer.id },
            },
            {
                fixture: '256.png',
            }
        ).as(`externalWMS-GetMap-${layer.id}`)
    })
    wmsLayers
        .map((layer) => layer.baseUrl)
        .filter(
            (baseUrl, index) => wmsLayers.map((layer) => layer.baseUrl).indexOf(baseUrl) === index
        )
        .forEach((baseUrl) => {
            const getCapabilitiesFixture =
                wmsGetCapabilitiesFixtureByBaseUrl[baseUrl] ?? 'external-wms-getcap-1.fixture.xml'
            cy.intercept(
                { url: `${baseUrl}**`, query: { REQUEST: 'GetCapabilities' } },
                { fixture: getCapabilitiesFixture }
            ).as(`externalWMS-GetCap-${baseUrl}`)
        })
}

function addExternalWmtsIntercepts(options?: {
    wmtsLayers?: ExternalWMTSLayer[]
    wmtsGetCapabilitiesFixtureByBaseUrl?: Record<string, string>
}): void {
    const {
        wmtsLayers = [mockExternalWmts1, mockExternalWmts2, mockExternalWmts3, mockExternalWmts4],
        wmtsGetCapabilitiesFixtureByBaseUrl = {
            'https://fake.wmts.getcap-1.url/WMTSGetCapabilities.xml':
                'external-wmts-getcap-1.fixture.xml',
            'https://fake.wmts.getcap-2.url/WMTSGetCapabilities.xml':
                'external-wmts-getcap-2.fixture.xml',
        },
    } = options ?? {}
    wmtsLayers
        .map((layer) => layer.baseUrl)
        .filter(
            (baseUrl, index) => wmtsLayers.map((layer) => layer.baseUrl).indexOf(baseUrl) === index
        )
        .forEach((baseUrl) => {
            const fixture =
                wmtsGetCapabilitiesFixtureByBaseUrl[baseUrl] ?? 'external-wmts-getcap-1.fixture.xml'
            cy.intercept(`${baseUrl}**`, {
                fixture,
            }).as(`externalWMTS-GetCap-${baseUrl}`)
        })

    cy.intercept('http://test.wmts.png/wmts/1.0.0/TestExternalWMTS-*/default/ktzh/**/*/*.png', {
        fixture: '256.png',
    }).as('externalWMTS')
}

function addShortLinkIntercept({
    shortUrl = 'https://s.geo.admin.ch/0000000',
}: { shortUrl?: string } = {}): void {
    cy.intercept(/^http[s]?:\/\/(sys-s\.\w+\.bgdi\.ch|s\.geo\.admin\.ch)\//, {
        body: { shorturl: shortUrl, success: true },
    }).as('shortlink')
}

// eslint-disable-next-line no-unused-vars
export type InterceptCallback = (options?: Record<string, unknown>) => void

/**
 * Categorize intercepts and allow tests to opt-in to only what they need.
 *
 * CATEGORIES:
 *
 * - 'core': Essential for all tests (router, base layers, topics, catalog)
 * - 'features': Feature identification and queries (height, what3word, popups, identify)
 * - 'drawing': Drawing and import tools (icons, GeoJSON)
 * - 'print': Print functionality (capabilities, request, status, download)
 * - '3d': Cesium 3D mode (terrain tiles, imagery tiles)
 * - 'external': External layer providers (WMS, WMTS)
 *
 * USAGE:
 *
 * ```typescript
 * // Only core intercepts (minimal)
 * cy.goToMapView({ interceptCategories: ['core'] })
 *
 * // Core + features (most common)
 * cy.goToMapView({ interceptCategories: ['core', 'features'] })
 *
 * // All intercepts (backward compatible)
 * cy.goToMapView() // or cy.goToMapView({ interceptCategories: ['all'] })
 * ```
 */

/** Intercept category names */
export type InterceptCategory =
    | 'core'
    | 'features'
    | 'drawing'
    | 'print'
    | '3d'
    | 'external'
    | 'all'

/** Categorized intercepts mapped by category name */
const INTERCEPT_CATEGORIES: Record<InterceptCategory, Record<string, InterceptCallback>> = {
    // Core intercepts - required for basic app functionality
    core: {
        addVueRouterIntercept,
        addWmtsIntercept,
        addWmsIntercept,
        addLayerConfigIntercept,
        addTopicIntercept,
        addCatalogIntercept,
        addShortLinkIntercept,
    },

    // Feature-related intercepts - for feature identification, search, and queries
    features: {
        addHeightIntercept,
        addWhat3WordIntercept,
        addHtmlPopupIntercepts,
        addFeatureIdentificationIntercepts,
    },

    // Drawing and import intercepts - for drawing tools and GeoJSON import
    drawing: {
        addIconsSetIntercept,
        addDefaultIconsIntercept,
        addSecondIconsIntercept,
        addGeoJsonIntercept,
    },

    // Print intercepts - for map printing functionality
    print: {
        addPrintCapabilitiesIntercept,
        addPrintRequestIntercept,
        addPrintStatusIntercept,
        addPrintDownloadIntercept,
    },

    // 3D mode intercepts - for Cesium terrain and imagery
    '3d': {
        addCesiumTilesetIntercepts,
    },

    // External provider intercepts - for external WMS/WMTS layers
    external: {
        addExternalWmsLayerIntercepts,
        addExternalWmtsIntercepts,
    },

    // Special 'all' category - placeholder (will be computed)
    all: {},
}

/**
 * Returns intercepts for the specified categories. If no categories specified or 'all' is included,
 * returns all intercepts.
 *
 * @example
 *     // Get only core intercepts (saves ~60% memory for simple tests)
 *     const intercepts = getInterceptsByCategory(['core'])
 *
 * @example
 *     // Get core + features (common for map interaction tests)
 *     const intercepts = getInterceptsByCategory(['core', 'features'])
 *
 * @example
 *     // Get all intercepts (backward compatible)
 *     const intercepts = getInterceptsByCategory(['all'])
 *
 * @param categories - Array of category names to include (defaults to ['all'])
 * @returns Record of intercept callbacks to register
 */
export function getInterceptsByCategory(
    categories: InterceptCategory[] = ['all']
): Record<string, InterceptCallback> {
    // If 'all' is requested, return all intercepts
    if (categories.includes('all')) {
        return getDefaultFixturesAndIntercepts()
    }

    // Merge intercepts from all requested categories
    const intercepts: Record<string, InterceptCallback> = {}

    for (const category of categories) {
        const categoryIntercepts = INTERCEPT_CATEGORIES[category]
        if (categoryIntercepts) {
            Object.assign(intercepts, categoryIntercepts)
        }
    }

    return intercepts
}

/**
 * Returns all default fixtures and intercepts. This is the backward-compatible function that
 * registers all 21 intercepts.
 *
 * MEMORY IMPACT: Using this function loads all 21 intercepts (~10.5 MB per test). For memory
 * optimization, prefer `getInterceptsByCategory()` with specific categories.
 */
export function getDefaultFixturesAndIntercepts(): Record<string, InterceptCallback> {
    return {
        addVueRouterIntercept,
        addWmtsIntercept,
        addWmsIntercept,
        addLayerConfigIntercept,
        addTopicIntercept,
        addCatalogIntercept,
        addHeightIntercept,
        addWhat3WordIntercept,
        addIconsSetIntercept,
        addDefaultIconsIntercept,
        addSecondIconsIntercept,
        addGeoJsonIntercept,
        addCesiumTilesetIntercepts,
        addHtmlPopupIntercepts,
        addFeatureIdentificationIntercepts,
        addPrintCapabilitiesIntercept,
        addPrintRequestIntercept,
        addPrintStatusIntercept,
        addPrintDownloadIntercept,
        addExternalWmsLayerIntercepts,
        addExternalWmtsIntercepts,
        addShortLinkIntercept,
    }
}
