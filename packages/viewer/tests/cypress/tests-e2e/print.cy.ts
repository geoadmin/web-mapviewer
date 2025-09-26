/// <reference types="cypress" />

import { formatThousand } from '@swissgeo/numbers'

import { getServiceKmlBaseUrl } from '@/config/baseUrl.config'
import { transformLayerIntoUrlString } from '@/router/storeSync/layersParamParser'
import type ExternalWMTSLayer from '@/api/layers/ExternalWMTSLayer.class'
import { assertDefined } from 'support/utils'
import type { MFPLayer, MFPMap, MFPSymbolizer, MFPSymbolizerLine, MFPSymbolizers, MFPVectorLayer, MFPWmsLayer, MFPWmtsLayer } from '@geoblocks/mapfishprint'
import type { Feature, FeatureCollection } from 'geojson';
import type { Interception } from 'cypress/types/net-stubbing'
import { kmlMetadataTemplate } from 'support/drawing'

interface LaunchPrintOptions {
    layout?: string
    scale?: number
    withLegend?: boolean
    withGrid?: boolean
}

interface PrintRequestBody {
    attributes: {
        map: MFPMap
        copyright: string
        url: string
        qrimage: string
        printDate: string
        printLegend: number
        legend: {
            name: string
            classes: Legend[]
        }
    }
    format: string
    layout: string
    lang: string
    outputFilename: string | null
}

interface ExpectedValues {
    layout?: string
    format?: string
    lang?: string
    copyright?: string
    mapScale?: number
    mapDpi?: number
    projection?: string
    legends?: Legend[]
    layers?: (MFPWmtsLayer | MFPWmsLayer | MFPVectorLayer)[]
}

interface Legend {
    name: string
    icons: string[]
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


function checkPrintRequest(body: PrintRequestBody, expectedValues: ExpectedValues = {}) {
    expect(body).to.be.an('object')
    const {
        layout = '1. A4 landscape',
        format = 'pdf',
        lang = 'en',
        copyright = '© attribution.test.wmts.layer',
        mapScale = 1500000,
        mapDpi = 254,
        projection = 'EPSG:2056',
        legends = [],
        layers = [],
    } = expectedValues

    expect(body.layout).to.equal(layout, 'wrong print layer')
    expect(body.format).to.equal(format, 'wrong print format')
    expect(body.lang).to.equal(lang, 'wrong print lang')
    expect(body.outputFilename).to.match(
        /map\.geo\.admin\.ch_PDF_20[0-9]{2}-[0-9]{2}-[0-9]{2}T[0-9]{2}_[0-9]{2}_[0-9]{2}/
    )

    const { attributes } = body
    expect(attributes).to.be.an('object')
    if (legends.length > 0) {
        expect(
            attributes.printLegend,
            'should use attribute legend to pass down legend information'
        ).to.be.undefined
        expect(attributes.legend).to.be.an('object', 'missing legend definition in print spec')
        const legendAttributes = attributes.legend
        expect(legendAttributes.name).to.equals(
            'Legend',
            'wrong name for the legend definition in print spec'
        )
        expect(legendAttributes.classes)
            .to.be.an('array')
            .lengthOf(legends.length, 'missing one or more layer legend')
        const legendClasses = legendAttributes.classes

        legends.forEach((legend: Legend, index: number) => {
            const legendClass = legendClasses[index]
            expect(legendClass).to.be.an('object', `missing legend class at index ${index}`)
            assertDefined(legendClass)
            expect(legendClass.name).to.equals(
                legend.name,
                'Name mismatch between legend and layer'
            )
            expect(legendClass.icons)
                .to.be.an('array')
                .lengthOf(legend.icons.length, `No icon in legend for layer ${legend.name}`)
            legend.icons.forEach((icon: string, iconIndex: number) => {
                expect(legendClass.icons[iconIndex]).to.contains(icon)
            })
        })
    } else {
        if (attributes.printLegend) {
            expect(attributes.printLegend).to.equals(
                0,
                'should tell print service to not have legend with a zero value'
            )
        }
    }

    expect(attributes.copyright).to.equal(copyright)
    expect(attributes.qrimage).to.contains(encodeURIComponent('https://s.geo.admin.ch/0000000'))

    const mapAttributes = attributes.map
    expect(mapAttributes).to.be.an('object')
    expect(mapAttributes.scale).to.equals(mapScale, 'wrong map scale')
    expect(mapAttributes.dpi).to.equals(mapDpi, 'wrong map dpi')
    expect(mapAttributes.projection).to.equals(projection, 'wrong map projection')

    const layersInSpec = body.attributes.map?.layers

    expect(layersInSpec).to.be.an('array').lengthOf(layers.length, 'Missing layer in print spec')
    layers.forEach((layer: MFPLayer, index: number) => {
        const layerInSpec = layersInSpec[index]
        expect(layerInSpec).to.be.an('object', `Missing layer spec at index ${index}`)
        assertDefined(layerInSpec)
        expect(layerInSpec.type).to.equals(layer.type, `Wrong layer type for layer`)

        if (layer.type === 'wmts') {
            const wmtsLayer = layer as MFPWmtsLayer
            const wmtsLayerInSpec = layerInSpec as MFPWmtsLayer
            expect(wmtsLayerInSpec.layer).to.deep.equals(wmtsLayer.layer)
            expect(wmtsLayerInSpec.matrices).to.be.an('array').not.empty
            expect(wmtsLayerInSpec.matrices[0]?.matrixSize).to.deep.eq(wmtsLayer.matrixSize ?? [1, 1])
            expect(wmtsLayerInSpec.matrixSet).to.eq(
                wmtsLayer.matrixSet ?? projection,
                `wrong matrix set in WMTS layer ${wmtsLayer.layer}`
            )
            if (wmtsLayer.opacity) {
                expect(wmtsLayerInSpec.opacity).to.equals(wmtsLayer.opacity, 'Wrong opacity for layer')
            }
            if (wmtsLayer.baseURL) {
                expect(wmtsLayerInSpec.baseURL).to.equals(wmtsLayer.baseURL, 'Wrong base URL for layer')
            }
        } else if (layer.type === 'wms') {
            const wmsLayer = layer as MFPWmsLayer
            const wmsLayerInSpec = layerInSpec as MFPWmsLayer
            expect(wmsLayerInSpec.layers).to.deep.equals(wmsLayer.layers)
        } else if (layer.type === 'geojson') {
            const vectorLayer = layer as MFPVectorLayer
            const vectorLayerInSpec = layerInSpec as MFPVectorLayer
            expect((vectorLayerInSpec.geoJson as FeatureCollection).features).to.be.an('array').lengthOf(vectorLayer.featureCount)
            if (vectorLayer.featureCount > 0) {
                vectorLayerInSpec.geoJson.features.forEach((feature: Feature, idx: number) => {
                    const styleId = `${vectorLayer.featureCount - idx}`
                    expect(feature.properties).to.be.an(
                        'object',
                        `Missing feature properties at index ${idx}`
                    )
                    assertDefined(feature.properties)
                    expect(feature.properties._mfp_style).to.equal(
                        styleId,
                        `Wrong style ID for feature at index ${idx}`
                    )
                    expect(vectorLayerInSpec.style).to.be.an('object', 'Missing layer styles')
                    expect(Object.keys(vectorLayerInSpec.style)).to.contain(
                        `[_mfp_style = '${styleId}']`,
                        `Missing MapFishPrint style ID ${styleId} in layer styles`
                    )
                })
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
                .then((body: PrintRequestBody) => {
                    checkPrintRequest(body, {
                        layers: [
                            {
                                layer: 'test.background.layer2',
                                type: 'wmts',
                            } as MFPWmtsLayer,
                        ],
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
                .then((body: PrintRequestBody) => {
                    checkPrintRequest(body, {
                        layout: '2. A4 portrait',
                        mapScale: 500000,
                        mapDpi: 254,
                        legends: [],
                        layers: [
                            {
                                layers: ['org.epsg.grid_2056'],
                                type: 'wms',
                            } as MFPWmsLayer,
                            {
                                layer: 'test.background.layer2',
                                type: 'wmts',
                            } as MFPWmtsLayer
                        ],
                    })
                })
        })
    })

    context('Send print request with layers', () => {
        function startPrintWithKml(kmlFixture: string, center = '2660000,1190000') {
            cy.intercept('HEAD', '**/**.kml', {
                headers: { 'Content-Type': 'application/vnd.google-earth.kml+xml' },
            }).as('kmlHeadRequest')

            cy.intercept('GET', `**${getServiceKmlBaseUrl()}some-kml-file.kml`, { fixture: kmlFixture }).as('kmlGetRequest')
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
                    layers: `KML|${getServiceKmlBaseUrl()}some-kml-file.kml`,
                    z: 9,
                    center,
                },
                withHash: true,
            })
            cy.wait(['@kmlHeadRequest', '@kmlGetAdminRequest'])
            cy.readStoreValue('state.layers.activeLayers').should('have.length', 1)

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
                },
            })
            launchPrint({
                withLegend: true,
            })
            cy.wait('@printRequest')
                .its('request.body')
                .then((body: PrintRequestBody) => {
                    checkPrintRequest(body, {
                        copyright: `© ${[
                            'attribution.test-1.wms.layer',
                            'attribution.test-2.wms.layer',
                            'attribution.test.wmts.layer',
                        ].join(', ')}`,
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
                        legends: [
                            {
                                name: 'WMS test layer 1',
                                icons: ['static/images/legends/test-1.wms.layer_en.png'],
                            },
                            {
                                name: 'WMS test layer 2',
                                icons: ['static/images/legends/test-2.wms.layer_en.png'],
                            },
                            {
                                name: 'WMTS test layer, with very long title that should be truncated on the menu',
                                icons: ['static/images/legends/test.wmts.layer_en.png'],
                            },
                        ],
                    })
                })
        })

        it('should send a print request correctly to mapfishprint (with KML layer)', () => {
            startPrintWithKml('import-tool/external-kml-file.kml', '2776665.89,1175560.26')

            cy.wait('@printRequest').then((interception: Interception) => {
                console.log('interception', interception)
                checkPrintRequest(interception.request.body, {
                    mapScale: 5000,
                    copyright: '© sys-public.dev.bgdi.ch, attribution.test.wmts.layer',
                    layers: [
                        {
                            type: 'geojson',
                            featureCount: 1,
                        } as MFPVectorLayer,
                        {
                            layer: 'test.background.layer2',
                            type: 'wmts',
                        } as MFPWmtsLayer,
                    ],
                    legends: [],
                })
            })
        })

        it('should send a print request correctly to mapfishprint with GPX layer', () => {
            cy.goToMapView()
            cy.readStoreValue('state.layers.activeLayers').should('be.empty')
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
            cy.fixture(localGpxlFile, null).as('gpxFixture')
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
            cy.readStoreValue('state.layers.activeLayers').should('have.length', 1)

            cy.get('[data-cy="import-file-close-button"]:visible').click()
            cy.get('[data-cy="import-file-content"]').should('not.exist')

            launchPrint()
            cy.wait('@printRequest')
                .its('request.body')
                .then((body: PrintRequestBody) => {
                    checkPrintRequest(body, {
                        mapScale: 10000,
                        copyright: '© line-and-marker.gpx, attribution.test.wmts.layer',
                        layers: [
                            {
                                type: 'geojson',
                                // In this GPX layer, there are two features (a line and a point).
                                featureCount: 2,
                            } as MFPVectorLayer,
                            {
                                layer: 'test.background.layer2',
                                type: 'wmts',
                            } as MFPWmtsLayer,
                        ],
                        legends: [],
                    })

                    const [gpxLayer] = body.attributes.map.layers
                    const mfpVectorLayer = gpxLayer as MFPVectorLayer
                    expect(mfpVectorLayer).to.be.an('object')
                    assertDefined(mfpVectorLayer)
                    expect(mfpVectorLayer.style).to.be.an('object')
                    expect(mfpVectorLayer.style).to.have.property("[_mfp_style = '2']")
                    const mapFishStyle: MFPSymbolizers = mfpVectorLayer.style["[_mfp_style = '2']"]
                    expect(mapFishStyle).to.be.an('object')
                    expect(mapFishStyle).to.have.property('symbolizers')
                    expect(mapFishStyle.symbolizers).to.be.an('array')
                    const [firstSymbolizer]: MFPSymbolizer[] = mapFishStyle.symbolizers
                    const lineSymbolizer = firstSymbolizer as MFPSymbolizerLine
                    assertDefined(lineSymbolizer)
                    expect(lineSymbolizer).to.be.an('object')
                    expect(lineSymbolizer).to.have.property('type')
                    expect(lineSymbolizer.type).to.equals('line')
                    expect(lineSymbolizer).to.have.property('strokeWidth')
                    expect(lineSymbolizer.strokeWidth).to.lessThan(2) // thinner than the drawn in the OL map.
                })
        })

        it('should send a print request correctly to mapfishprint (icon and label)', () => {
            startPrintWithKml('print/label.kml', '2614500.01,1210249.96')

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
                expect(layers).to.have.length(2)

                const geoJsonLayer = layers[0]

                expect(geoJsonLayer).to.haveOwnProperty('type')
                expect(geoJsonLayer).to.haveOwnProperty('geoJson')
                expect(geoJsonLayer).to.haveOwnProperty('style')
                expect(geoJsonLayer['geoJson']).to.haveOwnProperty('features')
                expect(geoJsonLayer['geoJson']['features'][0]).to.haveOwnProperty('properties')
                expect(geoJsonLayer['geoJson']['features'][0]['properties']).to.haveOwnProperty(
                    '_mfp_style'
                )
                expect(geoJsonLayer['style']).to.haveOwnProperty("[_mfp_style = '1']")
                expect(geoJsonLayer['style']["[_mfp_style = '1']"]).to.haveOwnProperty(
                    'symbolizers'
                )

                const symbolizers = layers[0]['style']["[_mfp_style = '1']"]['symbolizers']
                const pointSymbol = symbolizers[0]
                expect(pointSymbol).to.haveOwnProperty('type')
                const pointSymbolAttributes = {
                    type: 'point',
                    externalGraphic: '001-marker@1x-255,0,0.png',
                    graphicWidth: 19.133858267716537,
                    graphicXOffset: -8.503937007874017,
                    graphicYOffset: -8.503937007874017,
                }

                for (const attribute in pointSymbolAttributes) {
                    expect(pointSymbol).to.haveOwnProperty(attribute)
                }

                const textSymbol = symbolizers[1]
                const textSymbolAttributes = {
                    type: 'text',
                    label: 'Sample Label',
                    fontFamily: 'Helvetica',
                    fontSize: '12px',
                    fontWeight: 'normal',
                    labelYOffset: 44.75,
                }
                for (const attribute in textSymbolAttributes) {
                    expect(textSymbol).to.haveOwnProperty(attribute)
                }
            })
        })

        it('should send a print request correctly to mapfishprint (KML from old geoadmin)', () => {
            startPrintWithKml('print/old-geoadmin-label.kml', '2655000.02,1203249.96')

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
                expect(layers).to.have.length(2)

                const geoJsonLayer = layers[0]

                expect(geoJsonLayer).to.haveOwnProperty('type')
                expect(geoJsonLayer).to.haveOwnProperty('geoJson')
                expect(geoJsonLayer).to.haveOwnProperty('style')
                expect(geoJsonLayer['geoJson']).to.haveOwnProperty('features')
                expect(geoJsonLayer['geoJson']['features'][0]).to.haveOwnProperty('properties')
                expect(geoJsonLayer['geoJson']['features'][0]['properties']).to.haveOwnProperty(
                    '_mfp_style'
                )
                expect(geoJsonLayer['style']).to.haveOwnProperty("[_mfp_style = '1']")
                expect(geoJsonLayer['style']["[_mfp_style = '1']"]).to.haveOwnProperty(
                    'symbolizers'
                )

                const symbolizers = layers[0]['style']["[_mfp_style = '1']"]['symbolizers']
                const pointSymbol = symbolizers[0]
                expect(pointSymbol).to.haveOwnProperty('type')
                const pointSymbolAttributes = {
                    type: 'point',
                    externalGraphic: '001-marker@1x-255,0,0.png',
                    graphicWidth: 19.133858267716537,
                    graphicXOffset: -8.503937007874017,
                    graphicYOffset: -8.503937007874017,
                }

                for (const attribute in pointSymbolAttributes) {
                    expect(pointSymbol).to.haveOwnProperty(attribute)
                }

                const textSymbol = symbolizers[1]
                const textSymbolAttributes = {
                    type: 'text',
                    label: 'Sample Label',
                    fontFamily: 'Helvetica',
                    fontSize: '12px',
                    fontWeight: 'normal',
                    labelYOffset: 44.75,
                }
                for (const attribute in textSymbolAttributes) {
                    expect(textSymbol).to.haveOwnProperty(attribute)
                }
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
            cy.getExternalWmsMockConfig().then((layerObjects: ExternalWMTSLayer[]) => {
                assertDefined(layerObjects[1])
                assertDefined(layerObjects[2])
                layerObjects[1].opacity = 0.8
                layerObjects[2].opacity = 0.4
                // some layers are not visible by default, let's set them all as visible
                layerObjects.forEach((layer: ExternalWMTSLayer) => {
                    layer.visible = true
                })
                cy.goToMapView({
                    queryParams: {
                        layers: layerObjects
                            .map((object: ExternalWMTSLayer) => transformLayerIntoUrlString(object, undefined, null))
                            .join(';'),
                    },
                    withHash: true,
                })

                cy.get('[data-cy="menu-print-section"]').should('be.visible').click()
                cy.get('[data-cy="menu-print-form"]').should('be.visible')

                cy.get('[data-cy="checkboxLegend"]').check()
                cy.get('[data-cy="checkboxLegend"]').should('be.checked')

                cy.get('[data-cy="print-map-button"]').should('be.visible').click()
                cy.get('[data-cy="abort-print-button"]').should('be.visible')

                cy.wait('@printRequest').then((interception: Interception) => {
                    expect(interception.request.body).to.haveOwnProperty('layout')
                    expect(interception.request.body['layout']).to.equal('1. A4 landscape')
                    expect(interception.request.body).to.haveOwnProperty('format')
                    expect(interception.request.body['format']).to.equal('pdf')

                    expect(interception.request.body).to.haveOwnProperty('attributes')
                    const attributes = interception.request.body.attributes
                    expect(attributes).to.not.haveOwnProperty('printLegend')

                    expect(attributes).to.haveOwnProperty('copyright')
                    expect(attributes['copyright']).to.equal(
                        `© ${['The federal geoportal', 'BGDI', 'attribution.test.wmts.layer'].join(
                            ', '
                        )}`
                    )

                    const mapAttributes = attributes.map
                    expect(mapAttributes['scale']).to.equals(1500000)
                    expect(mapAttributes['dpi']).to.equals(254)
                    expect(mapAttributes['projection']).to.equals('EPSG:2056')

                    const layers = mapAttributes.layers
                    expect(layers).to.be.an('array')
                    expect(layers).to.have.length(5)

                    const expectedLayers = [
                        ...layerObjects.toReversed().map((layer: ExternalWMTSLayer) => {
                            return {
                                layers: layer.id.split(','),
                                type: 'wms',
                                baseURL: layer.baseUrl,
                                opacity: layer.opacity,
                            }
                        }),
                        {
                            layer: bgLayer,
                            type: 'wmts',
                            baseURL: `https://sys-wmts.dev.bgdi.ch/1.0.0/${bgLayer}/default/{Time}/2056/{TileMatrix}/{TileCol}/{TileRow}.jpeg`,
                            opacity: 1,
                            matrixSet: 'EPSG:2056',
                        },
                    ]

                    for (let i = 0; i < layers.length; i++) {
                        expect(layers[i]['layers']).to.deep.equal(expectedLayers[i]['layers'])
                        expect(layers[i]['type']).to.equals(expectedLayers[i]['type'])
                        expect(layers[i]['baseURL']).to.equals(expectedLayers[i]['baseURL'])
                        expect(layers[i]['opacity']).to.equals(expectedLayers[i]['opacity'])
                        if (expectedLayers[i]?.['matrixSet']) {
                            expect(layers[i]['matrixSet']).to.equals(expectedLayers[i]['matrixSet'])
                        }
                    }

                    expect(layers[layers.length - 1]['matrices'][0]['matrixSize']).to.deep.eq([
                        1, 1,
                    ])
                })
            })
        })

        it.only('prints external WMTS correctly', () => {
            cy.getExternalWmtsMockConfig().then((layerObjects: ExternalWMTSLayer[]) => {
                layerObjects.forEach((layer: ExternalWMTSLayer) => {
                    layer.visible = true
                })
                cy.goToMapView({
                    queryParams: {
                        layers: layerObjects
                            .map((object: ExternalWMTSLayer) => transformLayerIntoUrlString(object, undefined, null))
                            .join(';'),
                    },
                    withHash: true,
                })

                launchPrint({
                    withLegend: true,
                })
                cy.wait('@printRequest')
                    .its('request.body')
                    .then((body: PrintRequestBody) => {
                        checkPrintRequest(body, {
                            copyright: '© GIS-Zentrum Stadt Zuerich, attribution.test.wmts.layer',
                            layers: [
                                ...layerObjects.toReversed().map((layer: ExternalWMTSLayer) => {
                                    return {
                                        layer: layer.id,
                                        type: 'wmts',
                                        baseURL: `http://test.wmts.png/wmts/1.0.0/${layer.id}/default/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png`,
                                        opacity: layer.opacity,
                                        matrixSet: 'ktzh',
                                        matrixSize: [11, 8],
                                    }
                                }),
                                {
                                    layer: bgLayer,
                                    type: 'wmts',
                                    baseURL: `https://sys-wmts.dev.bgdi.ch/1.0.0/${bgLayer}/default/{Time}/2056/{TileMatrix}/{TileCol}/{TileRow}.jpeg`,
                                    opacity: 1,
                                    matrixSet: 'EPSG:2056',
                                },
                            ],
                            legends: [],
                        })
                    })
            })
        })
    })
})