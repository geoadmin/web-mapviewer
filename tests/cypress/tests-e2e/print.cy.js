/// <reference types="cypress" />

import { encodeExternalLayerParam } from '@/api/layers/layers-external.api'
import { getServiceKmlBaseUrl } from '@/config/baseUrl.config'
import { encodeLayerParam } from '@/router/storeSync/layersParamParser'
import { formatThousand } from '@/utils/numberUtils.js'

const printID = 'print-123456789'

function checkZoom(customZoom) {
    cy.readStoreValue('state.position.zoom').should((zoom) => {
        expect(zoom).to.equal(customZoom)
    })
}

describe('Testing print', () => {
    beforeEach(() => {
        cy.viewport(1920, 1080)

        interceptCapabilities()
        interceptShortLink()

        interceptPrintRequest()
        interceptPrintStatus()
        interceptDownloadReport()

        interceptPrintRequest()
        interceptPrintStatus()
        interceptDownloadReport()
    })

    function interceptCapabilities() {
        cy.intercept('GET', '**/capabilities.json', { fixture: 'print/capabilities.json' }).as(
            'capabilities'
        )
    }

    function interceptPrintRequest() {
        cy.intercept('POST', '**/report.pdf', (req) => {
            req.reply({
                body: {
                    ref: printID,
                    statusURL: '/print/status/' + printID,
                    downloadURL: '/print/report/' + printID,
                },
                delay: 200,
            })
        }).as('printRequest')
    }

    function interceptPrintStatus() {
        cy.intercept('GET', '**/status/**', (req) => {
            req.reply({
                body: {
                    done: true,
                    status: 'running',
                    elapsedTime: 2594,
                    waitingTime: 0,
                    downloadURL: '/print/report/' + printID,
                },
                delay: 1000,
            })
        }).as('printStatus')
    }

    function interceptDownloadReport() {
        cy.intercept('GET', '**/report/print**', {
            headers: { 'content-disposition': 'attachment; filename=mapfish-print-report.pdf' },
            fixture: 'print/mapfish-print-report.pdf',
        }).as('downloadReport')
    }

    function interceptShortLink() {
        let shortUrl = 'https://s.geo.admin.ch/0000000'
        cy.intercept(/^http[s]?:\/\/(sys-s\.\w+\.bgdi\.ch|s\.geo\.admin\.ch)\//, {
            body: { shorturl: shortUrl, success: true },
        }).as('shortlink')
    }
    context('Print UI', () => {
        it('should populate the UI with the capabilities from mapfishprint', () => {
            cy.goToMapView()
            cy.get('[data-cy="menu-print-section"]').should('be.visible').click()
            cy.get('[data-cy="menu-print-form"]').should('be.visible')
            cy.get('[data-cy="print-layout-selector"]').find('option').should('have.length', 5)
            cy.get('[data-cy="print-layout-selector"]')
                .find('option:selected')
                .should('have.value', '1. A4 landscape')
            cy.get('[data-cy="print-scale-selector"]').find('option').should('have.length', 15)
            cy.get('[data-cy="print-scale-selector"]')
                .find('option:selected')
                .should('have.text', `1:${formatThousand(1500000)}`)
        })
    })

    context('Send print request', () => {
        beforeEach(() => {
            cy.goToMapView()
            cy.get('[data-cy="menu-print-section"]').should('be.visible').click()
            cy.get('[data-cy="menu-print-form"]').should('be.visible')
        })

        it('should send a print request to mapfishprint (basic parameters)', () => {
            cy.get('[data-cy="print-map-button"]').should('be.visible').click()
            cy.get('[data-cy="abort-print-button"]').should('be.visible')

            cy.wait('@printRequest').then((interception) => {
                expect(interception.request.body).to.haveOwnProperty('layout')
                expect(interception.request.body['layout']).to.equal('1. A4 landscape')
                expect(interception.request.body).to.haveOwnProperty('format')
                expect(interception.request.body['format']).to.equal('pdf')
                expect(interception.request.body).to.haveOwnProperty('lang')
                expect(interception.request.body['lang']).to.equal('en')
                expect(interception.request.body).to.haveOwnProperty('outputFilename')
                cy.location('hostname').then((hostname) => {
                    expect(interception.request.body['outputFilename']).to.equal(
                        `${hostname}_\${yyyy-MM-dd'T'HH-mm-ss'Z'}`
                    )
                })

                expect(interception.request.body).to.haveOwnProperty('attributes')
                const attributes = interception.request.body.attributes
                expect(attributes).to.haveOwnProperty('copyright')
                expect(attributes['copyright']).to.equal('© attribution.test.wmts.layer')
                expect(attributes).to.haveOwnProperty('printLegend')
                expect(attributes['printLegend']).to.equals(0)
                expect(attributes).to.haveOwnProperty('qrimage')
                expect(attributes['qrimage']).to.contains(
                    encodeURIComponent('https://s.geo.admin.ch/0000000')
                )

                const mapAttributes = attributes.map
                expect(mapAttributes['scale']).to.equals(1500000)
                expect(mapAttributes['dpi']).to.equals(254)
                expect(mapAttributes['projection']).to.equals('EPSG:2056')

                const layers = mapAttributes.layers
                expect(layers).to.be.an('array')
                expect(layers).to.have.length(1)
                expect(layers[0]['matrixSet']).to.equals('EPSG:2056')
            })
        })

        it('should send a print request to mapfishprint (all parameters updated)', () => {
            // Set parameters
            cy.get('[data-cy="print-layout-selector"]').select('2. A4 portrait')
            cy.get('[data-cy="print-scale-selector"]').select(`1:${formatThousand(500000)}`)
            cy.get('[data-cy="checkboxLegend"]').check()
            cy.get('[data-cy="checkboxLegend"]').should('be.checked')
            cy.get('[data-cy="checkboxGrid"]').check()
            cy.get('[data-cy="checkboxGrid"]').should('be.checked')

            cy.get('[data-cy="debug-tools-header"]').should('be.visible').click()
            cy.get('[data-cy="current-projection"]').should('be.visible').contains('2056')
            cy.get('[data-cy="toggle-projection-button"]').should('be.visible').click()
            cy.get('[data-cy="current-projection"]').should('be.visible').contains('3857')

            cy.get('[data-cy="print-map-button"]').should('be.visible').click()
            cy.get('[data-cy="abort-print-button"]').should('be.visible')

            cy.wait('@printRequest').then((interception) => {
                expect(interception.request.body).to.haveOwnProperty('layout')
                expect(interception.request.body['layout']).to.equal('2. A4 portrait')
                expect(interception.request.body).to.haveOwnProperty('format')
                expect(interception.request.body['format']).to.equal('pdf')

                const attributes = interception.request.body.attributes
                expect(attributes).to.haveOwnProperty('printLegend')
                expect(attributes['printLegend']).to.equals(0)
                expect(attributes).to.haveOwnProperty('qrimage')
                expect(attributes['qrimage']).to.contains(
                    encodeURIComponent('https://s.geo.admin.ch/0000000')
                )

                const mapAttributes = attributes.map
                expect(mapAttributes['scale']).to.equals(500000)
                expect(mapAttributes['dpi']).to.equals(254)
                expect(mapAttributes['projection']).to.equals('EPSG:3857')

                const layers = mapAttributes.layers
                expect(layers).to.be.an('array')
                expect(layers).to.have.length(2) // with grid line
                expect(layers[1]['matrixSet']).to.equals('EPSG:3857')
            })
        })
    })
    context('Send print request with layers', () => {
        function startPrintWithKml(kmlFixture, zoom, center) {
            interceptPrintRequest()
            interceptPrintStatus()
            interceptDownloadReport()

            cy.intercept('HEAD', '**/**.kml', {
                headers: { 'Content-Type': 'application/vnd.google-earth.kml+xml' },
            }).as('kmlHeadRequest')
            cy.intercept('GET', '**/**.kml', { fixture: kmlFixture }).as('kmlGetRequest')

            const kmlID = `${getServiceKmlBaseUrl()}some-kml-file.kml`
            cy.goToMapView(
                {
                    layers: `KML|${kmlID}`,
                    z: zoom || 9,
                    center: center || '2655000,1203250',
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
            return kmlID
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
                    `© ${[
                        'attribution.test-1.wms.layer',
                        'attribution.test-2.wms.layer',
                        'attribution.test.wmts.layer',
                    ].join(', ')}`
                )

                // Check legends
                expect(attributes).to.haveOwnProperty('legend')

                const legendAttributes = attributes.legend
                expect(legendAttributes).to.haveOwnProperty('name')
                expect(legendAttributes['name']).to.equals('Legend')
                expect(legendAttributes).to.haveOwnProperty('classes')
                const legends = legendAttributes.classes
                expect(legends).to.be.an('array')
                expect(legends).to.have.length(3)

                const legend1 = legends[0]
                expect(legend1).to.haveOwnProperty('name')
                expect(legend1['name']).to.equals('WMS test layer 1')
                expect(legend1).to.haveOwnProperty('icons')
                expect(legend1['icons']).to.be.an('array')
                expect(legend1['icons']).to.have.length(1)
                expect(legend1['icons'][0]).to.contains(
                    'static/images/legends/test-1.wms.layer_en.png'
                )

                expect(attributes).to.haveOwnProperty('qrimage')
                expect(attributes['qrimage']).to.contains(
                    encodeURIComponent('https://s.geo.admin.ch/0000000')
                )

                const mapAttributes = attributes.map
                expect(mapAttributes['scale']).to.equals(1500000)
                expect(mapAttributes['dpi']).to.equals(254)
                expect(mapAttributes['projection']).to.equals('EPSG:2056')

                const layers = mapAttributes.layers
                expect(layers).to.be.an('array')
                expect(layers).to.have.length(5)
                expect(layers[0]['layer']).to.equals('test.wmts.layer')
                expect(layers[1]['layer']).to.equals('test.wmts.layer')
                expect(layers[2]['layers'][0]).to.equals('test-2.wms.layer')
                expect(layers[3]['layers'][0]).to.equals('test-1.wms.layer')
                expect(layers[4]['layer']).to.equals('test.background.layer2')

                expect(layers[0]['type']).to.equals('wmts')
                expect(layers[1]['type']).to.equals('wmts')
                expect(layers[2]['type']).to.equals('wms')
                expect(layers[3]['type']).to.equals('wms')
                expect(layers[4]['type']).to.equals('wmts')

                // Check for matrix size, should start with 1x1
                expect(layers[0]['matrices'][0]['matrixSize']).to.deep.eq([1, 1])
            })
        })
        it('should send a print request correctly to mapfishprint (with KML layer)', () => {
            const customZoom = 13
            const kmlID = startPrintWithKml('import-tool/external-kml-file.kml', customZoom)
            checkZoom(customZoom)
            cy.checkOlLayer(['test.background.layer2', kmlID])

            cy.wait('@printRequest').then((interception) => {
                expect(interception.request.body).to.haveOwnProperty('layout')
                expect(interception.request.body['layout']).to.equal('1. A4 landscape')
                expect(interception.request.body).to.haveOwnProperty('format')
                expect(interception.request.body['format']).to.equal('pdf')

                const attributes = interception.request.body.attributes
                expect(attributes).to.haveOwnProperty('printLegend')
                expect(attributes['printLegend']).to.equals(0)
                expect(attributes).to.haveOwnProperty('qrimage')
                expect(attributes['qrimage']).to.contains(
                    encodeURIComponent('https://s.geo.admin.ch/0000000')
                )

                const mapAttributes = attributes.map
                expect(mapAttributes['scale']).to.equals(2500000)
                expect(mapAttributes['dpi']).to.equals(254)
                expect(mapAttributes['projection']).to.equals('EPSG:2056')

                const layers = mapAttributes.layers
                expect(layers).to.be.an('array')
                expect(layers).to.have.length(2)
                expect(layers[0]['type']).to.equals('geojson')
                expect(layers[0]['geoJson']['features']).to.have.length(1)
                expect(layers[0]['geoJson']['features'][0]['properties']).to.haveOwnProperty(
                    '_mfp_style'
                )
                expect(layers[0]['geoJson']['features'][0]['properties']['_mfp_style']).to.equal(
                    '1'
                )
                expect(layers[0]['style']).to.haveOwnProperty("[_mfp_style = '1']")
            })
        })
        it('should send a print request correctly to mapfishprint with GPX layer', () => {
            cy.goToMapView({}, true)
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
            cy.get('[data-cy="menu-print-section"]').should('be.visible').click()
            cy.get('[data-cy="menu-print-form"]').should('be.visible')

            cy.get('[data-cy="print-map-button"]').should('be.visible').click()
            cy.get('[data-cy="abort-print-button"]').should('be.visible')

            cy.wait('@printRequest').then((interception) => {
                expect(interception.request.body).to.haveOwnProperty('layout')
                expect(interception.request.body['layout']).to.equal('1. A4 landscape')
                expect(interception.request.body).to.haveOwnProperty('format')
                expect(interception.request.body['format']).to.equal('pdf')

                const attributes = interception.request.body.attributes
                expect(attributes).to.haveOwnProperty('printLegend')
                expect(attributes['printLegend']).to.equals(0)
                expect(attributes).to.haveOwnProperty('qrimage')
                expect(attributes['qrimage']).to.contains(
                    encodeURIComponent('https://s.geo.admin.ch/0000000')
                )

                const mapAttributes = attributes.map
                expect(mapAttributes['scale']).to.equals(10000)
                expect(mapAttributes['dpi']).to.equals(254)
                expect(mapAttributes['projection']).to.equals('EPSG:2056')

                const layers = mapAttributes.layers
                expect(layers).to.be.an('array')
                expect(layers).to.have.length(2)

                // In this GPX layer, htere are two features (a line and a point).
                // There was a bug where both features are printed using the same style
                // This test case make sure that the two features are printed with different styles
                const gpxLayer = layers[0]
                expect(gpxLayer['type']).to.equals('geojson')
                expect(gpxLayer['geoJson']['features']).to.have.length(2)
                expect(gpxLayer['geoJson']['features'][0]['properties']).to.haveOwnProperty(
                    '_mfp_style'
                )

                expect(gpxLayer['geoJson']['features'][0]['properties']['_mfp_style']).to.equal('2')
                expect(gpxLayer['geoJson']['features'][1]['properties']['_mfp_style']).to.equal('1')
                expect(gpxLayer['style']).to.haveOwnProperty("[_mfp_style = '1']")
                expect(gpxLayer['style']).to.haveOwnProperty("[_mfp_style = '2']")
                expect(gpxLayer['style']["[_mfp_style = '2']"]['symbolizers'][0]['type']).to.equals(
                    'line'
                )
                expect(
                    gpxLayer['style']["[_mfp_style = '2']"]['symbolizers'][0]['strokeWidth']
                ).to.lessThan(2) // thinner than the drawn in the OL map.
            })
        })
        /** We need to ensure the structure of the query sent is correct */
        it('should send a print request correctly to mapfishprint (icon and label)', () => {
            const customZoom = 13
            const kmlID = startPrintWithKml('print/label.kml', customZoom)
            checkZoom(customZoom)
            cy.checkOlLayer(['test.background.layer2', kmlID])

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
                expect(mapAttributes['scale']).to.equals(2500000)
                expect(mapAttributes['dpi']).to.equals(254)
                expect(mapAttributes['projection']).to.equals('EPSG:2056')

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
            const customZoom = 13
            const kmlID = startPrintWithKml('print/old-geoadmin-label.kml', customZoom)

            checkZoom(customZoom)

            cy.readStoreValue('getters.centerEpsg4326').should((center) => {
                expect(center[0]).to.eq(8.161492)
                expect(center[1]).to.eq(46.978042)
            })

            cy.readStoreValue('state.position.center').should((center) => {
                expect(center[0]).to.eq(2655000)
                expect(center[1]).to.eq(1203250)
            })

            cy.checkOlLayer(['test.background.layer2', kmlID])

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
                expect(mapAttributes['scale']).to.equals(2500000)
                expect(mapAttributes['dpi']).to.equals(254)
                expect(mapAttributes['projection']).to.equals('EPSG:2056')

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
    })
    context('Send print request with external layers', () => {
        const bgLayer = 'test.background.layer2'
        // Fake WMS
        const fakeWmsBaseUrl1 = 'https://fake.wms.base-1.url/?'
        const fakeWmsBaseUrl2 = 'https://fake.wms.base-2.url/?'

        const fakeWmsLayerId1 = 'ch.swisstopo-vd.official-survey'
        const fakeWmsLayerId2 = 'Periodic Tracking, with | comma & @ ; äö'
        const fakeWmsLayerId3 = 'ch.swisstopo-vd.spannungsarme-gebiete-2'
        const fakeWmsLayerId4 = 'ch.swisstopo-vd.stand-oerebkataster-2'

        // format is WMS|BASE_URL|LAYER_IDS
        const fakeWmsLayerUrlId1 = `WMS|${fakeWmsBaseUrl1}|${fakeWmsLayerId1}@item=MyItem`
        const fakeWmsLayerUrlId2 = `WMS|${fakeWmsBaseUrl1}|${encodeExternalLayerParam(fakeWmsLayerId2)}`
        const fakeWmsLayerUrlId3 = `WMS|${fakeWmsBaseUrl2}|${fakeWmsLayerId3}`
        const fakeWmsLayerUrlId4 = `WMS|${fakeWmsBaseUrl2}|${fakeWmsLayerId4}`

        // Fake WMTS
        const fakeWmtsGetCapUrl1 = 'https://fake.wmts.getcap-1.url/WMTSGetCapabilities.xml'
        const fakeWmtsGetCapUrl2 = 'https://fake.wmts.getcap-2.url/WMTSGetCapabilities.xml'
        const fakeWmtsLayerId1 = 'TestExternalWMTS-1'
        const fakeWmtsLayerId2 = 'TestExternalWMTS-2;,|@special-chars-äö'
        const fakeWmtsLayerId3 = 'TestExternalWMTS-3'
        const fakeWmtsLayerId4 = 'TestExternalWMTS-4'

        // format is WMTS|GET_CAPABILITIES_URL|LAYER_ID
        const fakeWmtsLayerUrlId1 = `WMTS|${fakeWmtsGetCapUrl1}|${fakeWmtsLayerId1}`
        const fakeWmtsLayerUrlId2 = `WMTS|${fakeWmtsGetCapUrl1}|${encodeExternalLayerParam(fakeWmtsLayerId2)}`
        const fakeWmtsLayerUrlId3 = `WMTS|${fakeWmtsGetCapUrl2}|${fakeWmtsLayerId3}`
        const fakeWmtsLayerUrlId4 = `WMTS|${fakeWmtsGetCapUrl2}|${fakeWmtsLayerId4}`

        beforeEach(() => {
            // WMS intercept URL 1
            cy.intercept(
                {
                    url: `${fakeWmsBaseUrl1}**`,
                    query: { REQUEST: 'GetMap', LAYERS: fakeWmsLayerId1 },
                },
                {
                    fixture: '256.png',
                }
            ).as('externalWMSGetMap-1-layer-1')
            cy.intercept(
                {
                    url: `${fakeWmsBaseUrl1}**`,
                    query: { REQUEST: 'GetMap', LAYERS: fakeWmsLayerId2 },
                },
                {
                    fixture: '256.png',
                }
            ).as('externalWMSGetMap-1-layer-2')
            cy.intercept(
                { url: `${fakeWmsBaseUrl1}**`, query: { REQUEST: 'GetCapabilities' } },
                { fixture: 'external-wms-getcap-1.fixture.xml' }
            ).as('externalWMSGetCap-1')

            // WMS intercept URL 2
            cy.intercept(
                { url: `${fakeWmsBaseUrl2}**`, query: { REQUEST: 'GetMap' } },
                {
                    fixture: '256.png',
                }
            ).as('externalWMSGetMap-2')
            cy.intercept(
                { url: `${fakeWmsBaseUrl2}**`, query: { REQUEST: 'GetCapabilities' } },
                { fixture: 'external-wms-getcap-2.fixture.xml' }
            ).as('externalWMSGetCap-2')

            // WMTS intercept URL 1
            cy.intercept(`${fakeWmtsGetCapUrl1}`, {
                fixture: 'external-wmts-getcap-1.fixture.xml',
            }).as('externalWMTSGetCapOl-1')
            cy.intercept(`${fakeWmtsGetCapUrl1}?**`, {
                fixture: 'external-wmts-getcap-1.fixture.xml',
            }).as('externalWMTSGetCap-1')

            // WMTS intercept URL 2
            cy.intercept(`${fakeWmtsGetCapUrl2}`, {
                fixture: 'external-wmts-getcap-2.fixture.xml',
            }).as('externalWMTSGetCapOl-2')
            cy.intercept(`${fakeWmtsGetCapUrl2}?**`, {
                fixture: 'external-wmts-getcap-2.fixture.xml',
            }).as('externalWMTSGetCap-2')

            cy.intercept(
                'http://test.wmts.png/wmts/1.0.0/TestExternalWMTS-*/default/ktzh/**/*/*.png',
                {
                    fixture: '256.png',
                }
            ).as('externalWMTS')
        })

        it('prints external WMS correctly', () => {
            const fakeWmsLayerOpacity2 = 0.8
            const fakeWmsLayerOpacity4 = 0.4
            const layers = [
                fakeWmsLayerUrlId1,
                `${encodeLayerParam(fakeWmsLayerUrlId2)},,${fakeWmsLayerOpacity2}`,
                fakeWmsLayerUrlId3,
                `${fakeWmsLayerUrlId4},,${fakeWmsLayerOpacity4}`,
            ].join(';')
            cy.goToMapView({ layers })

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
                    {
                        layers: fakeWmsLayerId4.split(','),
                        type: 'wms',
                        baseURL: fakeWmsBaseUrl2,
                        opacity: fakeWmsLayerOpacity4,
                    },
                    {
                        layers: fakeWmsLayerId3.split(','),
                        type: 'wms',
                        baseURL: fakeWmsBaseUrl2,
                        opacity: 1,
                    },
                    {
                        layers: fakeWmsLayerId2.split(','),
                        type: 'wms',
                        baseURL: fakeWmsBaseUrl1,
                        opacity: fakeWmsLayerOpacity2,
                    },
                    {
                        layers: fakeWmsLayerId1.split(','),
                        type: 'wms',
                        baseURL: fakeWmsBaseUrl1,
                        opacity: 1,
                    },
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
                expect(layers[layers.length - 1]['matrices'][0]['matrixSize']).to.deep.eq([1, 1])
            })
        })
        it('prints external WMTS correctly', () => {
            const layers = [
                fakeWmtsLayerUrlId1,
                encodeLayerParam(fakeWmtsLayerUrlId2),
                fakeWmtsLayerUrlId3,
                fakeWmtsLayerUrlId4,
            ]

            cy.goToMapView({
                layers: layers.join(';'),
            })

            cy.get('[data-cy="menu-print-section"]').should('be.visible').click()
            cy.get('[data-cy="menu-print-form"]').should('be.visible')

            cy.get('[data-cy="checkboxLegend"]').check()
            cy.get('[data-cy="checkboxLegend"]').should('be.checked')

            cy.get('[data-cy="print-map-button"]').should('be.visible').click()
            cy.get('[data-cy="abort-print-button"]').should('be.visible')

            cy.wait('@printRequest').then((interception) => {
                cy.log('Print request', interception.request.body)
                expect(interception.request.body).to.haveOwnProperty('layout')
                expect(interception.request.body['layout']).to.equal('1. A4 landscape')
                expect(interception.request.body).to.haveOwnProperty('format')
                expect(interception.request.body['format']).to.equal('pdf')

                expect(interception.request.body).to.haveOwnProperty('attributes')
                const attributes = interception.request.body.attributes

                expect(attributes).to.haveOwnProperty('copyright')
                expect(attributes['copyright']).to.equal(
                    `© ${['GIS-Zentrum Stadt Zuerich', 'attribution.test.wmts.layer'].join(', ')}`
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
                    {
                        layer: fakeWmtsLayerId4,
                        type: 'wmts',
                        baseURL: `http://test.wmts.png/wmts/1.0.0/${fakeWmtsLayerId4}/default/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png`,
                        opacity: 1,
                        matrixSet: 'ktzh',
                    },
                    {
                        layer: fakeWmtsLayerId3,
                        type: 'wmts',
                        baseURL: `http://test.wmts.png/wmts/1.0.0/${fakeWmtsLayerId3}/default/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png`,
                        opacity: 1,
                        matrixSet: 'ktzh',
                    },
                    {
                        layer: fakeWmtsLayerId2,
                        type: 'wmts',
                        baseURL: `http://test.wmts.png/wmts/1.0.0/${fakeWmtsLayerId2.split(';')[0]}/default/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png`,
                        opacity: 1,
                        matrixSet: 'ktzh',
                    },
                    {
                        layer: fakeWmtsLayerId1,
                        type: 'wmts',
                        baseURL: `http://test.wmts.png/wmts/1.0.0/${fakeWmtsLayerId1}/default/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png`,
                        opacity: 1,
                        matrixSet: 'ktzh',
                    },
                    {
                        layer: bgLayer,
                        type: 'wmts',
                        baseURL: `https://sys-wmts.dev.bgdi.ch/1.0.0/${bgLayer}/default/{Time}/2056/{TileMatrix}/{TileCol}/{TileRow}.jpeg`,
                        opacity: 1,
                        matrixSet: 'EPSG:2056',
                    },
                ]

                for (let i = 0; i < layers.length; i++) {
                    expect(layers[i]['layer']).to.deep.equal(expectedLayers[i]['layer'])
                    expect(layers[i]['type']).to.equals(expectedLayers[i]['type'])
                    expect(layers[i]['baseURL']).to.equals(expectedLayers[i]['baseURL'])
                    expect(layers[i]['opacity']).to.equals(expectedLayers[i]['opacity'])
                    expect(layers[i]['matrixSet']).to.equals(expectedLayers[i]['matrixSet'])
                }
            })
        })
    })
})
