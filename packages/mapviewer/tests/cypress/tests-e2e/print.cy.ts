/// <reference types="cypress" />

import type {
    MFPAttributes,
    MFPLayer,
    MFPLegend,
    MFPMap,
    MFPSpec,
    MFPVectorLayer,
    MFPWmsLayer,
    MFPWmtsLayer,
} from '@geoblocks/mapfishprint'
import type { Interception } from 'cypress/types/net-stubbing'
import type { Feature, FeatureCollection, GeoJsonProperties, Geometry } from 'geojson'

import { LV95 } from '@swissgeo/coordinates'
import { formatThousand } from '@swissgeo/numbers'
import { getApi3BaseUrl, getServiceKmlBaseUrl } from '@swissgeo/staging-config'
import { kmlMetadataTemplate } from 'support/drawing'
import { assertDefined } from 'support/utils'

import { ENVIRONMENT } from '@/config'
import useLayersStore from '@/store/modules/layers'
import { transformLayerIntoUrlString } from '@/store/plugins/storeSync/layersParamParser'

interface LaunchPrintOptions {
    layout?: string
    scale?: number
    withLegend?: boolean
    withGrid?: boolean
}

const defaultMapAttributes: MFPMap = {
    center: LV95.bounds.center,
    scale: 1500000,
    dpi: 254,
    projection: 'EPSG:2056',
    rotation: 0,
    layers: [],
}

const defaultLegendAttribute: MFPLegend = {
    name: 'Legend',
    classes: [],
}

const defaultAttributes: MFPAttributes = {
    copyright: '© attribution.test.wmts.layer',
    legend: defaultLegendAttribute,
    printLegend: 0,
    map: defaultMapAttributes,
}

const defaultSpec: MFPSpec = {
    layout: '1. A4 landscape',
    format: 'pdf',
    lang: 'en',
    attributes: defaultAttributes,
}

function launchPrint(config: LaunchPrintOptions = {}) {
    const {
        layout = 'A4 landscape',
        scale = 1500000,
        withLegend = false,
        withGrid = false,
    } = config

    cy.get('[data-cy="menu-print-section"]:visible').click()
    cy.get('[data-cy="menu-print-form"]').should('be.visible')

    if (layout !== '1. A4 landscape') {
        cy.get('[data-cy="print-layout-selector"]').click()
        cy.get('[data-cy="print-layout-selector"]')
            .find(`[data-cy="dropdown-item-${layout}"]`)
            .contains(layout)
            .click()
    }
    if (scale !== 1500000) {
        cy.get('[data-cy="print-scale-selector"]').click()
        cy.get('[data-cy="print-scale-selector"]')
            .find(`[data-cy="dropdown-item-${scale}"]`)
            .contains(`1:${formatThousand(scale)}`)
            .click()
    }
    if (withLegend) {
        cy.get('[data-cy="checkboxLegend"]').check()
        cy.get('[data-cy="checkboxLegend"]').should('be.checked')
    }
    if (withGrid) {
        cy.get('[data-cy="checkboxGrid"]').check()
        cy.get('[data-cy="checkboxGrid"]').should('be.checked')
    }

    cy.get('[data-cy="print-map-button"]:visible').click()
    cy.get('[data-cy="abort-print-button"]').should('be.visible')
}

function checkPrintRequest(body: MFPSpec, expectedValues: MFPSpec) {
    expect(body, 'missing print request body').to.be.an('object')
    const { layout, format, lang, attributes: expectedAttributes } = expectedValues ?? defaultSpec

    const { copyright, map, legend } = expectedAttributes ?? defaultAttributes

    const { layers = [], scale, dpi, projection } = map ?? defaultMapAttributes

    expect(body.layout, 'wrong print layer').to.equal(layout)
    expect(body.format, 'wrong print format').to.equal(format)
    expect(body.lang, 'wrong print lang').to.equal(lang)
    expect(body.outputFilename).to.match(
        /map\.geo\.admin\.ch_PDF_20[0-9]{2}-[0-9]{2}-[0-9]{2}T[0-9]{2}_[0-9]{2}_[0-9]{2}/
    )

    const { attributes } = body
    expect(attributes, 'attributes to be an object').to.be.an('object')
    if (legend && legend.classes && legend.classes.length > 0) {
        expect(
            attributes.printLegend,
            'it should use attribute printLegend to tell the print service to include the legend'
        ).to.eq(1)
        expect(attributes.legend, 'it should define a legend object').to.be.an('object')
        const legendAttributes = attributes.legend
        expect(legendAttributes!.name, 'the legend attribute has a name').to.equals('Legend')
        if (legend.classes) {
            expect(legendAttributes!.classes, 'the legend classes in print spec are defined')
                .to.be.an('array')
                .lengthOf(legend.classes.length)

            legend.classes.forEach((expectedLegend, index) => {
                const actualLegend = legendAttributes!.classes![index]
                expect(actualLegend, `the legend class at index ${index} is defined`).to.be.an(
                    'object'
                )
                assertDefined(actualLegend)
                expect(actualLegend.name, 'the name of the legend matches the layer').to.equals(
                    expectedLegend.name
                )
                if (expectedLegend.icons) {
                    expect(
                        actualLegend.icons,
                        `the icons from the layer ${expectedLegend.name} are passed to the print legend`
                    )
                        .to.be.an('array')
                        .lengthOf(expectedLegend.icons.length)
                    expectedLegend.icons.forEach((icon: string, iconIndex: number) => {
                        const actualIcon = actualLegend.icons![iconIndex]
                        expect(actualIcon, `The icon at index ${iconIndex} is defined`).to.be.an(
                            'string'
                        )
                        expect(actualIcon).to.eq(icon)
                    })
                }
            })
        }
    } else {
        if (attributes.printLegend) {
            expect(
                attributes.printLegend,
                'should tell print service to not print legend'
            ).to.equals(0)
        }
    }

    expect(attributes.copyright, 'the copyright in print spec is well defined').to.equal(copyright)
    expect(attributes.qrimage, 'the qrimage in print spec is well defined').to.contains(
        encodeURIComponent('https://s.geo.admin.ch/0000000')
    )

    const mapAttributes = attributes.map
    expect(mapAttributes, 'the map attributes in print spec is defined').to.be.an('object')
    expect(mapAttributes!.scale, 'the map scale is well defined').to.equals(scale)
    expect(mapAttributes!.dpi, 'the map dpi is well defined').to.equals(dpi)
    expect(mapAttributes!.projection, 'the map projection is well defined').to.equals(projection)

    const layersInSpec = body.attributes.map?.layers
    expect(layersInSpec, 'the map attribute contains a list of layers')
        .to.be.an('array')
        .lengthOf(layers.length)
    layers.forEach((layer: Partial<MFPLayer>, index: number) => {
        const layerInSpec = layersInSpec![index]
        expect(layerInSpec, `the layer print layer at index ${index} is defined`).to.be.an('object')
        assertDefined(layerInSpec)
        expect(layerInSpec.type, `the print layer type matches the map layer type`).to.equals(
            layer.type
        )

        if (layer.type === 'wmts') {
            const wmtsLayer = layer as MFPWmtsLayer
            const wmtsLayerInSpec = layerInSpec as MFPWmtsLayer
            expect(wmtsLayerInSpec.layer).to.deep.equals(wmtsLayer.layer)
            expect(wmtsLayerInSpec.matrices).to.be.an('array').not.empty
            if ('matrixSize' in wmtsLayer) {
                expect(wmtsLayerInSpec.matrices[0]?.matrixSize).to.deep.eq(
                    wmtsLayer.matrixSize ?? [1, 1]
                )
            } else {
                expect(wmtsLayerInSpec.matrices[0]?.matrixSize).to.deep.eq([1, 1])
            }

            expect(
                wmtsLayerInSpec.matrixSet,
                `wrong matrix set in WMTS layer ${wmtsLayer.layer}`
            ).to.eq(wmtsLayer.matrixSet ?? projection)
            if (wmtsLayer.opacity) {
                expect(wmtsLayerInSpec.opacity, 'Wrong opacity for layer').to.equals(
                    wmtsLayer.opacity
                )
            }
            if (wmtsLayer.baseURL) {
                expect(wmtsLayerInSpec.baseURL, 'Wrong base URL for layer').to.equals(
                    wmtsLayer.baseURL
                )
            }
        } else if (layer.type === 'wms') {
            const wmsLayer = layer as MFPWmsLayer
            const wmsLayerInSpec = layerInSpec as MFPWmsLayer
            expect(wmsLayerInSpec.layers).to.deep.equals(wmsLayer.layers)
        } else if (layer.type === 'geojson') {
            const vectorLayer = layer as MFPVectorLayer
            const vectorLayerInSpec = layerInSpec as MFPVectorLayer
            if ('featureCount' in vectorLayer && typeof vectorLayer.featureCount === 'number') {
                const featureCount: number = vectorLayer.featureCount
                expect((vectorLayerInSpec.geoJson as FeatureCollection).features)
                    .to.be.an('array')
                    .lengthOf(featureCount, 'missing features in vector layer')
                if (featureCount > 0) {
                    ;(
                        vectorLayerInSpec.geoJson as FeatureCollection<Geometry, GeoJsonProperties>
                    ).features.forEach((feature: Feature, idx: number) => {
                        const styleId = `${featureCount - idx}`
                        expect(
                            feature.properties,
                            `Missing feature properties at index ${idx}`
                        ).to.be.an('object')
                        assertDefined(feature.properties)
                        expect(
                            feature.properties._mfp_style,
                            `Wrong style ID for feature at index ${idx}`
                        ).to.equal(styleId)
                        expect(vectorLayerInSpec.style, 'Missing layer styles').to.be.an('object')
                        expect(
                            Object.keys(vectorLayerInSpec.style),
                            `Missing MapFishPrint style ID ${styleId} in layer styles`
                        ).to.contain(`[_mfp_style = '${styleId}']`)
                    })
                }
            }
        }
    })
}

describe('Testing print', () => {
    beforeEach(() => {
        cy.viewport(1920, 1080)
    })

    context('Print UI', () => {
        it('should populate the UI with the capabilities from mapfishprint', () => {
            cy.goToMapView()
            launchPrint()
            cy.get('[data-cy="menu-print-section"]:visible').click()
            cy.get('[data-cy="menu-print-form"]').should('be.visible')

            cy.log('Check that scales are correctly populated')
            cy.get('[data-cy="print-scale-selector"]').click()
            cy.get('[data-cy="print-scale-selector"] [data-cy="dropdown-container"]')
                .find('[data-cy^="dropdown-item-"]')
                .should('have.length', 15)
            cy.get('[data-cy="print-scale-selector"] [data-cy="dropdown-container"]')
                .find('[data-cy^="dropdown-item-"].active')
                .should('contain', `1:${formatThousand(1500000)}`)

            cy.log('Check that layouts are correctly populated')
            cy.get('[data-cy="print-layout-selector"]').click()
            cy.get('[data-cy="print-layout-selector"] [data-cy="dropdown-container"]')
                .find('[data-cy^="dropdown-item-"]')
                .should('have.length', 5)
            cy.get('[data-cy="print-layout-selector"] [data-cy="dropdown-container"]')
                .find('[data-cy^="dropdown-item-"].active')
                .should('contain', 'A4 landscape')
        })
    })

    context('Send print request', () => {
        beforeEach(() => {
            cy.goToMapView()
        })
        it('should send a print request to mapfishprint (basic parameters)', () => {
            launchPrint()
            cy.wait('@printRequest')
                .its('request.body')
                .then((body: MFPSpec) => {
                    checkPrintRequest(body, {
                        ...defaultSpec,
                        attributes: {
                            ...defaultAttributes,
                            map: {
                                ...defaultMapAttributes,
                                layers: [
                                    {
                                        layer: 'test.background.layer2',
                                        type: 'wmts',
                                    } as MFPWmtsLayer,
                                ],
                            },
                        },
                    })
                })
        })
        it('should send a print request to mapfishprint (all parameters updated)', () => {
            launchPrint({
                layout: 'A4 portrait',
                scale: 500000,
                withLegend: true,
                withGrid: true,
            })
            cy.wait('@printRequest')
                .its('request.body')
                .then((body: MFPSpec) => {
                    checkPrintRequest(body, {
                        ...defaultSpec,
                        layout: '2. A4 portrait',
                        attributes: {
                            ...defaultAttributes,
                            printLegend: 1,
                            map: {
                                ...defaultMapAttributes,
                                scale: 500000,
                                dpi: 254,
                                layers: [
                                    {
                                        layers: ['org.epsg.grid_2056'],
                                        type: 'wms',
                                    } as MFPWmsLayer,
                                    {
                                        layer: 'test.background.layer2',
                                        type: 'wmts',
                                    } as MFPWmtsLayer,
                                ],
                            },
                        },
                    })
                })
        })
    })

    context('Send print request with layers', () => {
        function startPrintWithKml(kmlFixture: string, center = '2660000,1190000') {
            cy.intercept('HEAD', '**/**.kml', {
                headers: { 'Content-Type': 'application/vnd.google-earth.kml+xml' },
            }).as('kmlHeadRequest')

            cy.intercept('GET', `**${getServiceKmlBaseUrl(ENVIRONMENT)}some-kml-file.kml`, {
                fixture: kmlFixture,
            }).as('kmlGetRequest')
            cy.intercept(
                {
                    method: 'GET',
                    url: '**/api/kml/admin/**',
                },
                (req) => {
                    const headers = { 'Cache-Control': 'no-cache' }
                    req.reply(kmlMetadataTemplate({ id: req.url.split('/').pop()! }), headers)
                }
            ).as('kmlGetAdminRequest')
            cy.goToMapView({
                queryParams: {
                    layers: `KML|${getServiceKmlBaseUrl(ENVIRONMENT)}some-kml-file.kml`,
                    z: 9,
                    center,
                    bgLayer: 'test.background.layer2',
                },
                withHash: true,
            })
            cy.wait(['@kmlHeadRequest', '@kmlGetAdminRequest'])
            cy.getPinia().should((pinia) => {
                const layersStore = useLayersStore(pinia)
                expect(layersStore.activeLayers).to.have.length(1)
            })

            cy.openMenuIfMobile()

            cy.get('[data-cy="menu-print-section"]').should('be.visible').click()
            cy.get('[data-cy="menu-print-form"]').should('be.visible')

            cy.get('[data-cy="print-map-button"]').should('be.visible').click()
            cy.get('[data-cy="abort-print-button"]').should('be.visible')
        }

        it('should send a print request to mapfishprint (with layers added)', () => {
            cy.goToMapView({
                queryParams: {
                    layers: [
                        'test-1.wms.layer',
                        'test-2.wms.layer,,',
                        'test-3.wms.layer,f',
                        'test-4.wms.layer,f,0.4',
                        'test.wmts.layer,,0.5',
                        'test.wmts.layer,,0.8',
                    ].join(';'),
                    bgLayer: 'test.background.layer2',
                },
            })
            launchPrint({
                withLegend: true,
            })
            cy.wait('@printRequest')
                .its('request.body')
                .then((body: MFPSpec) => {
                    checkPrintRequest(body, {
                        ...defaultSpec,
                        attributes: {
                            ...defaultAttributes,
                            copyright: `© ${[
                                'attribution.test.wmts.layer',
                                'attribution.test-1.wms.layer',
                                'attribution.test-2.wms.layer',
                            ].join(', ')}`,
                            printLegend: 1,
                            legend: {
                                ...defaultLegendAttribute,
                                classes: [
                                    {
                                        name: 'WMS test layer 1',
                                        icons: [
                                            `${getApi3BaseUrl(ENVIRONMENT)}static/images/legends/test-1.wms.layer_en.png`,
                                        ],
                                    },
                                    {
                                        name: 'WMS test layer 2',
                                        icons: [
                                            `${getApi3BaseUrl(ENVIRONMENT)}static/images/legends/test-2.wms.layer_en.png`,
                                        ],
                                    },
                                    {
                                        name: 'WMTS test layer, with very long title that should be truncated on the menu',
                                        icons: [
                                            `${getApi3BaseUrl(ENVIRONMENT)}static/images/legends/test.wmts.layer_en.png`,
                                        ],
                                    },
                                ],
                            },
                            map: {
                                ...defaultMapAttributes,
                                layers: [
                                    {
                                        layer: 'test.wmts.layer',
                                        type: 'wmts',
                                    } as MFPWmtsLayer,
                                    {
                                        layer: 'test.wmts.layer',
                                        type: 'wmts',
                                    } as MFPWmtsLayer,
                                    {
                                        layers: ['test-2.wms.layer'],
                                        type: 'wms',
                                    } as MFPWmsLayer,
                                    {
                                        layers: ['test-1.wms.layer'],
                                        type: 'wms',
                                    } as MFPWmsLayer,
                                    {
                                        layer: 'test.background.layer2',
                                        type: 'wmts',
                                    } as MFPWmtsLayer,
                                ],
                            },
                        },
                    })
                })
        })
        it('should send a print request correctly to mapfishprint (with KML layer)', () => {
            startPrintWithKml('import-tool/external-kml-file.kml', '2776665.89,1175560.26')

            cy.wait('@printRequest').then((interception: Interception) => {
                checkPrintRequest(interception.request.body, {
                    ...defaultSpec,
                    attributes: {
                        ...defaultAttributes,
                        copyright: '© attribution.test.wmts.layer, sys-public.dev.bgdi.ch',
                        map: {
                            ...defaultMapAttributes,
                            scale: 5000,
                            layers: [
                                {
                                    type: 'geojson',
                                    geoJson: 'test',
                                    style: {},
                                } as MFPVectorLayer,
                                {
                                    layer: 'test.background.layer2',
                                    type: 'wmts',
                                } as MFPWmtsLayer,
                            ],
                        },
                    },
                })
            })
        })
        it('should send a print request correctly to mapfishprint with GPX layer', () => {
            cy.goToMapView()
            cy.getPinia().should((pinia) => {
                const layersStore = useLayersStore(pinia)
                expect(layersStore.activeLayers).to.be.empty
            })
            cy.openMenuIfMobile()
            cy.get('[data-cy="menu-tray-tool-section"]:visible').click()
            cy.get('[data-cy="menu-advanced-tools-import-file"]:visible').click()

            cy.get('[data-cy="import-file-content"]').should('be.visible')
            cy.get('[data-cy="import-file-online-content"]').should('be.visible')

            const localGpxlFile = 'print/line-and-marker.gpx'

            cy.log('Switch to local import')
            cy.get('[data-cy="import-file-local-btn"]:visible').click()
            cy.get('[data-cy="import-file-local-content"]').should('be.visible')

            cy.log('Test add a local GPX file')
            cy.fixture(localGpxlFile, undefined).as('gpxFixture')
            cy.get('[data-cy="file-input"]').selectFile('@gpxFixture', {
                force: true,
            })
            cy.get('[data-cy="import-file-load-button"]:visible').click()

            cy.get('[data-cy="file-input-text"]')
                .should('have.class', 'is-valid')
                .should('not.have.class', 'is-invalid')
            cy.get('[data-cy="file-input-valid-feedback"]')
                .should('be.visible')
                .contains('File successfully imported')
            cy.get('[data-cy="import-file-load-button"]').should('be.visible').contains('Import')
            cy.get('[data-cy="import-file-online-content"]').should('not.be.visible')
            cy.getPinia().should((pinia) => {
                const layersStore = useLayersStore(pinia)
                expect(layersStore.activeLayers).to.have.length(1)
            })

            cy.get('[data-cy="import-file-close-button"]:visible').click()
            cy.get('[data-cy="import-file-content"]').should('not.exist')

            launchPrint()
            cy.wait('@printRequest')
                .its('request.body')
                .then((body: MFPSpec) => {
                    checkPrintRequest(body, {
                        ...defaultSpec,
                        attributes: {
                            ...defaultAttributes,
                            copyright: '© attribution.test.wmts.layer, line-and-marker.gpx',
                            map: {
                                ...defaultMapAttributes,
                                scale: 10000,
                                layers: [
                                    {
                                        type: 'geojson',
                                        geoJson: 'test',
                                        style: {},
                                    } as MFPVectorLayer,
                                    {
                                        layer: 'test.background.layer2',
                                        type: 'wmts',
                                    } as MFPWmtsLayer,
                                ],
                            },
                        },
                    })
                })
        })
        it('should send a print request correctly to mapfishprint (KML from old geoadmin)', () => {
            startPrintWithKml('print/old-geoadmin-label.kml', '2655000.02,1203249.96')

            cy.wait('@printRequest')
                .its('request.body')
                .then((body: MFPSpec) => {
                    checkPrintRequest(body, {
                        ...defaultSpec,
                        attributes: {
                            copyright: '© attribution.test.wmts.layer, sys-public.dev.bgdi.ch',
                            map: {
                                ...defaultMapAttributes,
                                scale: 5000,
                                layers: [
                                    {
                                        type: 'geojson',
                                        geoJson: 'test',
                                        style: {},
                                    } as MFPVectorLayer,
                                    {
                                        layer: 'test.background.layer2',
                                        type: 'wmts',
                                    } as MFPWmtsLayer,
                                ],
                            },
                        },
                    })
                })
        })
        it('should send a print request correctly to mapfishprint when there are no features from the external layers within the print extent', () => {
            startPrintWithKml('print/label.kml', '2514218.7,1158958.4')

            cy.wait('@printRequest').then((interception: Interception) => {
                expect(interception.request.body).to.haveOwnProperty('layout')
                expect(interception.request.body).to.haveOwnProperty('format')

                const attributes = interception.request.body.attributes
                expect(attributes).to.haveOwnProperty('printLegend')
                expect(attributes).to.haveOwnProperty('qrimage')

                expect(attributes).to.haveOwnProperty('map')
                const mapAttributes = attributes.map

                expect(mapAttributes).to.haveOwnProperty('scale')
                expect(mapAttributes).to.haveOwnProperty('dpi')
                expect(mapAttributes).to.haveOwnProperty('projection')

                expect(mapAttributes).to.haveOwnProperty('layers')

                const layers = mapAttributes.layers

                expect(layers).to.be.an('array')
                expect(layers).to.have.length(1)
            })
        })
    })

    context('Send print request with external layers', () => {
        const bgLayer = 'test.background.layer2'

        it('prints external WMS correctly', () => {
            cy.getExternalWmsMockConfig().then((layerObjects) => {
                assertDefined(layerObjects[1])
                assertDefined(layerObjects[2])
                layerObjects[1].opacity = 0.8
                layerObjects[2].opacity = 0.4
                // some layers are not visible by default, let's set them all as visible
                layerObjects.forEach((layer) => {
                    layer.isVisible = true
                })
                cy.goToMapView({
                    queryParams: {
                        layers: layerObjects
                            .map((object) =>
                                transformLayerIntoUrlString(object, undefined, undefined)
                            )
                            .join(';'),
                        bgLayer: bgLayer,
                    },
                })

                launchPrint({
                    withLegend: true,
                })
                cy.wait('@printRequest')
                    .its('request.body')
                    .then((body: MFPSpec) => {
                        const expectedLayers: MFPLayer[] = [
                            ...layerObjects.toReversed().map((layer) => {
                                return {
                                    layers: layer.id.split(','),
                                    type: 'wms',
                                    baseURL: layer.baseUrl,
                                    opacity: layer.opacity,
                                } as MFPWmsLayer
                            }),
                            {
                                layer: bgLayer,
                                type: 'wmts',
                                baseURL: `https://sys-wmts.dev.bgdi.ch/1.0.0/${bgLayer}/default/current/2056/{TileMatrix}/{TileCol}/{TileRow}.jpeg`,
                                opacity: 1,
                                matrixSet: 'EPSG:2056',
                            } as MFPWmtsLayer,
                        ]
                        const expectedLegend: MFPLegend[] = layerObjects
                            .flatMap((layer) => {
                                return layer.legends?.map((legend) => {
                                    return {
                                        name: layer.name,
                                        icons: [legend.url],
                                    }
                                })
                            })
                            .filter((legend) => legend !== undefined)
                        console.log('woot', expectedLegend)

                        checkPrintRequest(body, {
                            ...defaultSpec,
                            attributes: {
                                copyright:
                                    '© attribution.test.wmts.layer, The federal geoportal, BGDI',
                                printLegend: expectedLegend.length > 0 ? 1 : 0,
                                legend: {
                                    name: 'Legend',
                                    classes: expectedLegend,
                                },
                                map: {
                                    ...defaultMapAttributes,
                                    layers: expectedLayers,
                                },
                            },
                        })
                    })
            })
        })
        it('prints external WMTS correctly', () => {
            cy.getExternalWmtsMockConfig().then((layerObjects) => {
                layerObjects.forEach((layer) => {
                    layer.isVisible = true
                })
                cy.goToMapView({
                    queryParams: {
                        layers: layerObjects
                            .map((object) =>
                                transformLayerIntoUrlString(object, undefined, undefined)
                            )
                            .join(';'),
                        bgLayer: bgLayer,
                    },
                    withHash: true,
                })

                launchPrint({
                    withLegend: true,
                })
                cy.wait('@printRequest')
                    .its('request.body')
                    .then((body: MFPSpec) => {
                        checkPrintRequest(body, {
                            ...defaultSpec,
                            attributes: {
                                copyright:
                                    '© attribution.test.wmts.layer, GIS-Zentrum Stadt Zuerich',
                                map: {
                                    ...defaultMapAttributes,
                                    layers: [
                                        ...layerObjects.toReversed().map((layer) => {
                                            return {
                                                layer: layer.id,
                                                type: 'wmts',
                                                baseURL: `http://test.wmts.png/wmts/1.0.0/${layer.id}/default/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png`,
                                                opacity: layer.opacity,
                                                matrixSet: 'ktzh',
                                                matrixSize: [11, 8],
                                                dimensions: [],
                                                dimensionParams: {},
                                                imageFormat: 'image/png',
                                                requestEncoding: 'KVP',
                                                matrices: [],
                                                style: 'some style',
                                                name: 'test',
                                                version: '1.3.0',
                                            } as MFPWmtsLayer
                                        }),
                                        {
                                            layer: bgLayer,
                                            type: 'wmts',
                                            baseURL: `https://sys-wmts.dev.bgdi.ch/1.0.0/${bgLayer}/default/current/2056/{TileMatrix}/{TileCol}/{TileRow}.jpeg`,
                                            opacity: 1,
                                            matrixSet: 'EPSG:2056',
                                        } as MFPWmtsLayer,
                                    ],
                                },
                            },
                        })
                    })
            })
        })
    })
})
