import { isNumber, randomIntBetween } from 'geoadmin/numbers'
import { LV95, registerProj4, WGS84 } from 'geoadmin/proj'
import proj4 from 'proj4'

import { FAKE_URL_CALLED_AFTER_ROUTE_CHANGE } from '@/router/storeSync/storeSync.routerPlugin'

registerProj4(proj4)

/**
 * Adds an intercept to the fake URL called each time the Vue-router changes route.
 *
 * @param {Object} [options]
 * @param {String} [options.aliasName='routeChange'] Default is `'routeChange'`
 * @see storeSync.routerPlugin.js
 */
export function addVueRouterIntercept(options = {}) {
    const { aliasName = 'routeChange' } = options
    cy.intercept(FAKE_URL_CALLED_AFTER_ROUTE_CHANGE, {
        statusCode: 200,
    }).as(aliasName)
}

/**
 * Catches WMTS type URLs in metric WebMercator, Mercator, LV95 or LV03. Returns the same tile for
 * all requests.
 *
 * @param {Object} [options]
 * @param {String} [options.aliasJpegTile='jpegTile'] Default is `'jpegTile'`
 * @param {String} [options.aliasPngTile='pngTile'] Default is `'pngTile'`
 */
export function addWmtsIntercept(options = {}) {
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
 * @param {Object} [options]
 * @param {String} [options.aliasName='wmsPng'] Default is `'wmsPng'`
 * @param {String} [options.imageFormat='image/png'] Default is `'image/png'`
 */
export function addWmsIntercept(options = {}) {
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
 * @param {Object} [options]
 * @param {String} [options.aliasName='layerConfig'] Default is `'layerConfig'`
 */
export function addLayerConfigIntercept(options = {}) {
    const { aliasName = 'layerConfig' } = options
    cy.intercept('**/rest/services/all/MapServer/layersConfig**', {
        fixture: 'layers.fixture',
    }).as(aliasName)
}

/**
 * @param {Object} [options]
 * @param {String} [options.aliasName='topics'] Default is `'topics'`
 */
export function addTopicIntercept(options = {}) {
    const { aliasName = 'topics' } = options
    cy.intercept('**/rest/services', {
        fixture: 'topics.fixture',
    }).as(aliasName)
}

/**
 * Loop over all topics from the fixture file `topics.fixture`, and intercept the request to their
 * catalog with the same fixture file.
 *
 * @param {Object} [options]
 * @param {String} [options.aliasPrefix='topic-'] Prefix that will be used in conjunction with each
 *   topic ID to create the alias on the catalog endpoint. Default is `'topic-'`
 */
export function addCatalogIntercept(options = {}) {
    const { aliasPrefix = 'topic-' } = options
    // intercepting further topic metadata retrieval
    cy.fixture('topics.fixture').then((mockedTopics) => {
        mockedTopics.topics.forEach((topic) => {
            cy.intercept(`**/rest/services/${topic.id}/CatalogServer?lang=**`, {
                fixture: 'catalogs.fixture',
            }).as(`${aliasPrefix}${topic.id}`)
        })
    })
}

/**
 * @param {Object} [options]
 * @param {String} [options.aliasName='coordinates-for-height'] Default is
 *   `'coordinates-for-height'`
 */
export function addHeightIntercept(options = {}) {
    const { aliasName = 'coordinates-for-height' } = options
    cy.intercept('**/rest/services/height**', {
        fixture: 'service-alti/height.fixture',
    }).as(aliasName)
}

export function addWhat3WordIntercept(options = {}) {
    const { convertToAliasName = 'convert-to-w3w', convertFromAliasName = 'convert-from-w3w' } =
        options
    cy.intercept('**/convert-to-3wa**', {
        fixture: 'what3word.fixture',
    }).as(convertToAliasName)
    cy.intercept('**/convert-to-coordinates**', {
        fixture: 'what3word.fixture',
    }).as(convertFromAliasName)
}

const addIconsSetIntercept = () => {
    cy.intercept(`**/api/icons/sets`, {
        fixture: 'service-icons/sets.fixture.json',
    }).as('icon-sets')
}

const addDefaultIconsFixtureAndIntercept = () => {
    cy.intercept(`**/api/icons/sets/default/icons`, {
        fixture: 'service-icons/set-default.fixture.json',
    }).as('icon-set-default')
}

const addSecondIconsFixtureAndIntercept = () => {
    cy.intercept(`**/api/icons/sets/babs/icons`, {
        fixture: 'service-icons/set-babs.fixture.json',
    }).as('icon-set-babs')
}

const addGeoJsonIntercept = () => {
    cy.intercept('**/test.geojson.layer.json', {
        fixture: 'geojson.fixture.json',
    }).as('geojson-data')
    cy.intercept('**/vectorStyles/**', {
        fixture: 'geojson-style.fixture.json',
    }).as('geojson-style')
}

const addCesiumTilesetIntercepts = () => {
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

const addHtmlPopupIntercepts = () => {
    cy.intercept('**/MapServer/**/htmlPopup**', {
        fixture: 'html-popup.fixture.html',
    }).as('htmlPopup')
}

let lastIdentifiedFeatures = []

/**
 * Generates dynamically a list of features, with the length corresponding to what was requested in
 * the request's query.
 *
 * Features IDs will start from 1 + offset (if an offset is given) and coordinates will be randomly
 * selected within the LV95 extent (or within the selection box, if one is given).
 */
const addFeatureIdentificationIntercepts = () => {
    let featureTemplate = {}
    let featureDetailTemplate = {}
    cy.fixture('features/features.fixture').then((featuresFixture) => {
        // using the first entry of the fixture as template
        featureTemplate = featuresFixture.results.pop()
    })
    cy.fixture('features/featureDetail.fixture').then((featureDetail) => {
        featureDetailTemplate = featureDetail.feature
    })

    cy.intercept('**/MapServer/identify**', (identifyRequest) => {
        lastIdentifiedFeatures = []

        const {
            limit = 10,
            offset = null,
            geometry: identifyGeometry = null,
        } = identifyRequest.query
        const startingFeatureId = 1 + (isNumber(offset) ? parseInt(offset) : 0)
        const identifyBounds = {
            lowerX: LV95.bounds.lowerX,
            upperX: LV95.bounds.upperX,
            lowerY: LV95.bounds.lowerY,
            upperY: LV95.bounds.upperY,
        }
        // if a selection box is sent, we use it as bounds to generate our random coordinates
        if (identifyGeometry) {
            const coordinateSplit = identifyGeometry.split(',').map(parseFloat).map(Math.floor)
            if (coordinateSplit.length === 4) {
                identifyBounds.lowerX = coordinateSplit[0]
                identifyBounds.upperX = coordinateSplit[2]
                identifyBounds.lowerY = coordinateSplit[1]
                identifyBounds.upperY = coordinateSplit[3]
            } else if (coordinateSplit.length === 2) {
                identifyBounds.lowerX = coordinateSplit[0] - 1000
                identifyBounds.upperX = coordinateSplit[0] + 1000
                identifyBounds.lowerY = coordinateSplit[1] - 1000
                identifyBounds.upperY = coordinateSplit[1] + 1000
            }
        }

        for (let i = 0; i < limit; i++) {
            const coordinate = [
                randomIntBetween(identifyBounds.lowerX, identifyBounds.upperX),
                randomIntBetween(identifyBounds.lowerY, identifyBounds.upperY),
            ]
            const coordinateWGS84 = proj4(LV95.epsg, WGS84.epsg, coordinate)
            const featureId = startingFeatureId + i
            const feature = Cypress._.cloneDeep(featureTemplate)
            feature.geometry.coordinates = [coordinate]
            feature.bbox = [...coordinate, ...coordinate]
            feature.featureId = featureId
            feature.id = featureId
            feature.properties.label = `Feature ${featureId}`
            feature.properties.link_title = `Feature ${featureId} link title`
            feature.properties.link_uri = `https://fake.link.to.feature_${featureId}.ch`
            feature.properties.x = coordinate[0]
            feature.properties.y = coordinate[1]
            feature.properties.lon = coordinateWGS84[0]
            feature.properties.lat = coordinateWGS84[1]
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
            const url = req.url.match(
                /.*\/rest\/services\/(?<topic>\w+)\/MapServer\/(?<layerId>.+)\/(?<features>[^?]+)/
            )

            if (!url) {
                req.reply(404)
                return
            }

            const generateFeature = (featureId) => {
                const featureDetail = Cypress._.cloneDeep(featureDetailTemplate)
                featureDetail.featureId = featureId
                featureDetail.id = featureId
                featureDetail.properties.name = `Feature ${featureId} name`
                featureDetail.properties.label = `Feature ${featureId} label`

                if (featureDetail.layerBodId !== url.groups.layerId) {
                    featureDetail.layerBodId = url.groups.layerId
                    featureDetail.layerName = `Name of ${url.groups.layerId}`
                }

                const matchingFeature = lastIdentifiedFeatures.find(
                    (feature) => feature.id === featureId
                )

                if (matchingFeature) {
                    const coordinate = matchingFeature.geometry.coordinates[0]
                    featureDetail.bbox = [...coordinate, ...coordinate]
                    featureDetail.geometry.coordinates = [coordinate]
                } else {
                    const randomCoordinate = [
                        Cypress._.random(LV95.bounds.lowerX, LV95.bounds.upperX),
                        Cypress._.random(LV95.bounds.lowerY, LV95.bounds.upperY),
                    ]
                    featureDetail.bbox = [...randomCoordinate, ...randomCoordinate]
                    featureDetail.geometry.coordinates = [randomCoordinate]
                }
                return featureDetail
            }

            const features = url.groups.features.split(',')
            if (features.length > 1) {
                req.reply({
                    type: 'FeatureCollection',
                    features: features.map((featureId) => generateFeature(featureId)),
                })
            } else {
                const featureId = features[0]
                const featureDetail = generateFeature(featureId)

                req.alias = `featureDetail_${featureId}`
                req.reply({
                    feature: featureDetail,
                })
            }
        }
    ).as('featureDetail')
}

function addPrintCapabilitiesIntercept() {
    cy.intercept('GET', '**/capabilities.json', { fixture: 'print/capabilities.json' }).as(
        'printCapabilities'
    )
}

function addPrintRequestIntercept(printId = 'print-123456789') {
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

function addPrintStatusIntercept(printId = 'print-123456789') {
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

function addPrintDownloadIntercept() {
    cy.intercept('GET', '**/report/print**', {
        headers: { 'content-disposition': 'attachment; filename=mapfish-print-report.pdf' },
        fixture: 'print/mapfish-print-report.pdf',
    }).as('printDownloadReport')
}

export function getDefaultFixturesAndIntercepts() {
    return {
        addVueRouterIntercept,
        addLayerTileFixture: addWmtsIntercept,
        addWmsLayerFixture: addWmsIntercept,
        addLayerFixtureAndIntercept: addLayerConfigIntercept,
        addTopicFixtureAndIntercept: addTopicIntercept,
        addCatalogFixtureAndIntercept: addCatalogIntercept,
        addHeightFixtureAndIntercept: addHeightIntercept,
        addWhat3WordFixtureAndIntercept: addWhat3WordIntercept,
        addIconsSetIntercept,
        addDefaultIconsFixtureAndIntercept,
        addSecondIconsFixtureAndIntercept,
        addGeoJsonIntercept,
        addCesiumTilesetIntercepts,
        addHtmlPopupIntercepts,
        addFeatureIdentificationIntercepts,
        addPrintCapabilitiesIntercept,
        addPrintRequestIntercept,
        addPrintStatusIntercept,
        addPrintDownloadIntercept,
    }
}
