/// <reference types="cypress" />

import { formatThousand } from '@geoadmin/numbers'

import { getServiceKmlBaseUrl } from '@/config/baseUrl.config'
import { transformLayerIntoUrlString } from '@/router/storeSync/layersParamParser'

function launchPrint(config = {}) {
    const {
        layout = '1. A4 landscape',
        scale = 1500000,
        withLegend = false,
        withGrid = false,
    } = config

    cy.get('[data-cy="menu-print-section"]:visible').click()
    cy.get('[data-cy="menu-print-form"]').should('be.visible')

    if (layout !== '1. A4 landscape') {
        cy.get('[data-cy="print-layout-selector"]').click()
        cy.get('[data-cy="print-layout-selector"]').find('li a').contains(layout).click()
    }
    if (scale !== 1500000) {
        cy.get('[data-cy="print-scale-selector"]').click()
        cy.get('[data-cy="print-scale-selector"]')
            .find('li a')
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

function checkPrintRequest(body, expectedValues = {}) {
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

    cy.location('hostname').then((hostname) => {
        expect(body.outputFilename).to.equal(`${hostname}_\${yyyy-MM-dd'T'HH-mm-ss'Z'}`)
    })

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

        legends.forEach((legend, index) => {
            const legendClass = legendClasses[index]
            expect(legendClass).to.be.an('object', `missing legend class at index ${index}`)
            expect(legendClass.name).to.equals(
                legend.name,
                'Name mismatch between legend and layer'
            )
            expect(legendClass.icons)
                .to.be.an('array')
                .lengthOf(legend.icons.length, `No icon in legend for layer ${legend.name}`)
            legend.icons.forEach((icon, iconIndex) => {
                expect(legendClass.icons[iconIndex]).to.contains(icon)
            })
        })
    } else {
        expect(attributes.printLegend).to.equals(
            0,
            'should tell print service to not have legend with a zero value'
        )
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
    layers.forEach((layer, index) => {
        const layerInSpec = layersInSpec[index]
        expect(layerInSpec).to.be.an('object', `Missing layer spec at index ${index}`)
        expect(layerInSpec.type).to.equals(layer.type, `Wrong layer type for layer`)

        if (layer.type === 'wmts') {
            expect(layerInSpec.layers).to.deep.equals(layer.layers)
            // Check for matrix size, should start with 1x1
            expect(layerInSpec.matrices).to.be.an('array').not.empty
            expect(layerInSpec.matrices[0]?.matrixSize).to.deep.eq(layer.matrixSize ?? [1, 1])
            expect(layerInSpec.matrixSet).to.eq(
                layer.matrixSet ?? projection,
                `wrong matrix set in WMTS layer ${layer.layer}`
            )
            if (layer.opacity) {
                expect(layerInSpec.opacity).to.equals(layer.opacity, 'Wrong opacity for layer')
            }
            if (layer.baseURL) {
                expect(layerInSpec.baseURL).to.equals(layer.baseURL, 'Wrong base URL for layer')
            }
        } else if (layer.type === 'wms') {
            expect(layerInSpec.layer).to.equals(layer.layer)
        } else if (layer.type === 'geojson') {
            expect(layerInSpec.geoJson?.features).to.be.an('array').lengthOf(layer.featureCount)
            if (layer.featureCount > 0) {
                // There was a bug where multiple features were printed using the same style
                // This test makes sure that each feature is printed with different styles
                layerInSpec.geoJson.features.forEach((feature, index) => {
                    const styleId = `${layer.featureCount - index}`
                    expect(feature.properties).to.be.an(
                        'object',
                        `Missing feature properties at index ${index}`
                    )
                    expect(feature.properties._mfp_style).to.equal(
                        styleId,
                        `Wrong style ID for feature at index ${index}`
                    )
                    expect(layerInSpec.style).to.be.an('object', 'Missing layer styles')
                    expect(Object.keys(layerInSpec.style)).to.contain(
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
            cy.get('[data-cy="print-layout-selector"]').find('li').should('have.length', 5)
            cy.get('[data-cy="print-layout-selector"]')
                .find('li a.active')
                .should('contain', 'A4 landscape')
            cy.get('[data-cy="print-scale-selector"]').find('li').should('have.length', 15)
            cy.get('[data-cy="print-scale-selector"]')
                .find('li a.active')
                .should('contain', `1:${formatThousand(1500000)}`)
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
                .then((body) => {
                    checkPrintRequest(body, {
                        layers: [
                            {
                                layer: 'test.background.layer2',
                                type: 'wmts',
                            },
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
                .then((body) => {
                    checkPrintRequest(body, {
                        layout: '2. A4 portrait',
                        mapScale: 500000,
                        dpi: 254,
                        legends: [], // we've activated legend printing with no layer having a legend
                        layers: [
                            {
                                layers: ['org.epsg.grid_2056'],
                                type: 'wms',
                            },
                            {
                                layer: 'test.background.layer2',
                                type: 'wmts',
                            },
                        ],
                    })
                })
        })
    })
    context('Send print request with layers', () => {
        // When we attempt to print a layer and there are no features from that layer
        // within the print extent, the layer is absent from the print spec. We need
        // to ensure the print extent contains the feature (or ensure it does not contain the feature)
        function startPrintWithKml(kmlFixture, center = '2660000,1190000') {
            cy.intercept('HEAD', '**/**.kml', {
                headers: { 'Content-Type': 'application/vnd.google-earth.kml+xml' },
            }).as('kmlHeadRequest')
            cy.intercept('GET', '**/**.kml', { fixture: kmlFixture }).as('kmlGetRequest')

            cy.goToMapView(
                {
                    layers: `KML|${getServiceKmlBaseUrl()}some-kml-file.kml`,
                    z: 9,
                    center,
                },
                true
            )
            cy.wait(['@kmlHeadRequest', '@kmlGetRequest'])
            cy.readStoreValue('state.layers.activeLayers').should('have.length', 1)

            cy.openMenuIfMobile()

            // Print
            cy.get('[data-cy="menu-print-section"]').should('be.visible').click()
            cy.get('[data-cy="menu-print-form"]').should('be.visible')

            cy.get('[data-cy="print-map-button"]').should('be.visible').click()
            cy.get('[data-cy="abort-print-button"]').should('be.visible')
        }

        it('should send a print request to mapfishprint (with layers added)', () => {
            cy.goToMapView({
                layers: [
                    'test-1.wms.layer',
                    'test-2.wms.layer,,',
                    'test-3.wms.layer,f',
                    'test-4.wms.layer,f,0.4',
                    // add duplicate layer to test duplicate attributions
                    'test.wmts.layer,,0.5',
                    'test.wmts.layer,,0.8',
                ].join(';'),
            })
            launchPrint({
                withLegend: true,
            })
            cy.wait('@printRequest')
                .its('request.body')
                .then((body) => {
                    checkPrintRequest(body, {
                        copyright: `© ${[
                            'attribution.test-1.wms.layer',
                            'attribution.test-2.wms.layer',
                            'attribution.test.wmts.layer',
                        ].join(', ')}`,
                        // hidden layers still go in spec, so we need to count them here
                        layers: [
                            {
                                layer: 'test.wmts.layer',
                                type: 'wmts',
                            },
                            {
                                layer: 'test.wmts.layer',
                                type: 'wmts',
                            },
                            {
                                layers: ['test-2.wms.layer'],
                                type: 'wms',
                            },
                            {
                                layers: ['test-1.wms.layer'],
                                type: 'wms',
                            },
                            {
                                layer: 'test.background.layer2',
                                type: 'wmts',
                            },
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
                            // layer WMS 3 and 4 are not visible and should not output any legends
                            // the WMTS layer is doubled, but should only output one legend (same for both)
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

            cy.wait('@printRequest')
                .its('request.body')
                .then((body) => {
                    checkPrintRequest(body, {
                        mapScale: 5000,
                        // KML adds an attribution too
                        copyright: '© sys-public.dev.bgdi.ch, attribution.test.wmts.layer',
                        layers: [
                            {
                                type: 'geojson',
                                featureCount: 1,
                            },
                            {
                                layer: 'test.background.layer2',
                                type: 'wmts',
                            },
                        ],
                        legends: [], // no legends with KML files
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

            // Test local import
            cy.log('Switch to local import')
            cy.get('[data-cy="import-file-local-btn"]:visible').click()
            cy.get('[data-cy="import-file-local-content"]').should('be.visible')

            // Attach a local GPX file
            cy.log('Test add a local GPX file')
            cy.fixture(localGpxlFile, null).as('gpxFixture')
            cy.get('[data-cy="file-input"]').selectFile('@gpxFixture', {
                force: true,
            })
            cy.get('[data-cy="import-file-load-button"]:visible').click()

            // Assertions for successful import
            cy.get('[data-cy="file-input-text"]')
                .should('have.class', 'is-valid')
                .should('not.have.class', 'is-invalid')
            cy.get('[data-cy="file-input-valid-feedback"]')
                .should('be.visible')
                .contains('File successfully imported')
            cy.get('[data-cy="import-file-load-button"]').should('be.visible').contains('Import')
            cy.get('[data-cy="import-file-online-content"]').should('not.be.visible')
            cy.readStoreValue('state.layers.activeLayers').should('have.length', 1)

            // Close the import tool
            cy.get('[data-cy="import-file-close-button"]:visible').click()
            cy.get('[data-cy="import-file-content"]').should('not.exist')

            // Print
            launchPrint()
            cy.wait('@printRequest')
                .its('request.body')
                .then((body) => {
                    checkPrintRequest(body, {
                        mapScale: 10000,
                        copyright: '© line-and-marker.gpx, attribution.test.wmts.layer',
                        layers: [
                            {
                                type: 'geojson',
                                // In this GPX layer, there are two features (a line and a point).
                                featureCount: 2,
                            },
                            {
                                layer: 'test.background.layer2',
                                type: 'wmts',
                            },
                        ],
                        legends: [],
                    })

                    const [gpxLayer] = body.attributes.map.layers
                    expect(gpxLayer).to.be.an('object')
                    expect(gpxLayer.style).to.be.an('object')
                    expect(gpxLayer.style).to.have.property("[_mfp_style = '2']")
                    const mapFishStyle = gpxLayer.style["[_mfp_style = '2']"]
                    expect(mapFishStyle).to.be.an('object')
                    expect(mapFishStyle).to.have.property('symbolizers')
                    expect(mapFishStyle.symbolizers).to.be.an('array')
                    const [firstSymbolizer] = mapFishStyle.symbolizers
                    expect(firstSymbolizer).to.be.an('object')
                    expect(firstSymbolizer).to.have.property('type')
                    expect(firstSymbolizer.type).to.equals('line')
                    expect(firstSymbolizer).to.have.property('strokeWidth')
                    expect(firstSymbolizer.strokeWidth).to.lessThan(2) // thinner than the drawn in the OL map.
                })
        })
        /** We need to ensure the structure of the query sent is correct */
        it('should send a print request correctly to mapfishprint (icon and label)', () => {
            startPrintWithKml('print/label.kml', '2614500.01,1210249.96')

            cy.wait('@printRequest').then((interception) => {
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
                    externalGraphic: '001-marker@1x-255,0,0.png', // suffix only
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

            cy.wait('@printRequest').then((interception) => {
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
                    externalGraphic: '001-marker@1x-255,0,0.png', // suffix only
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

            cy.wait('@printRequest').then((interception) => {
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
                layerObjects[1].opacity = 0.8
                layerObjects[2].opacity = 0.4
                // some layers are not visible by default, let's set them all as visible
                layerObjects.forEach((layer) => {
                    layer.visible = true
                })
                cy.goToMapView(
                    {
                        layers: layerObjects
                            .map((object) => transformLayerIntoUrlString(object))
                            .join(';'),
                    },
                    true
                )

                cy.get('[data-cy="menu-print-section"]').should('be.visible').click()
                cy.get('[data-cy="menu-print-form"]').should('be.visible')

                cy.get('[data-cy="checkboxLegend"]').check()
                cy.get('[data-cy="checkboxLegend"]').should('be.checked')

                cy.get('[data-cy="print-map-button"]').should('be.visible').click()
                cy.get('[data-cy="abort-print-button"]').should('be.visible')

                cy.wait('@printRequest').then((interception) => {
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

                    // Check map attributes
                    const mapAttributes = attributes.map
                    expect(mapAttributes['scale']).to.equals(1500000)
                    expect(mapAttributes['dpi']).to.equals(254)
                    expect(mapAttributes['projection']).to.equals('EPSG:2056')

                    // Check layers
                    const layers = mapAttributes.layers
                    expect(layers).to.be.an('array')
                    expect(layers).to.have.length(5)

                    const expectedLayers = [
                        ...layerObjects.toReversed().map((layer) => {
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

                    // Check for matrix size, should start with 1x1
                    expect(layers[layers.length - 1]['matrices'][0]['matrixSize']).to.deep.eq([
                        1, 1,
                    ])
                })
            })
        })
        it('prints external WMTS correctly', () => {
            cy.getExternalWmtsMockConfig().then((layerObjects) => {
                // some layers are not visible by default, let's set them all as visible
                layerObjects.forEach((layer) => {
                    layer.visible = true
                })
                cy.goToMapView(
                    {
                        layers: layerObjects
                            .map((object) => transformLayerIntoUrlString(object))
                            .join(';'),
                    },
                    true
                )

                launchPrint({
                    withLegend: true,
                })
                cy.wait('@printRequest')
                    .its('request.body')
                    .then((body) => {
                        checkPrintRequest(body, {
                            copyright: '© GIS-Zentrum Stadt Zuerich, attribution.test.wmts.layer',
                            layers: [
                                ...layerObjects.toReversed().map((layer) => {
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
                            // we don't support (yet) external layer legend printing
                            legends: [],
                        })
                    })
            })
        })
    })
})
