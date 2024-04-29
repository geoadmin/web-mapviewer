/// <reference types="cypress" />
import { formatThousand } from '@/utils/numberUtils.js'

const printID = 'print-123456789'

describe('Testing print', () => {
    beforeEach(() => {
        cy.viewport(1920, 1080)

        interceptCapabilities()
        interceptShortLink()
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
            interceptPrintRequest()
            interceptPrintStatus()
            interceptDownloadReport()
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
        it('should send a print request to mapfishprint (with layers added)', () => {
            interceptPrintRequest()
            interceptPrintStatus()
            interceptDownloadReport()
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
            interceptPrintRequest()
            interceptPrintStatus()
            interceptDownloadReport()

            cy.goToMapView({}, true)
            cy.readStoreValue('state.layers.activeLayers').should('be.empty')
            cy.openMenuIfMobile()
            cy.get('[data-cy="menu-tray-tool-section"]:visible').click()
            cy.get('[data-cy="menu-advanced-tools-import-file"]:visible').click()

            cy.get('[data-cy="import-file-content"]').should('be.visible')
            cy.get('[data-cy="import-file-online-content"]').should('be.visible')

            const localKmlFile = 'import-tool/external-kml-file.kml'

            // Test local import
            cy.log('Switch to local import')
            cy.get('[data-cy="import-file-local-btn"]:visible').click()
            cy.get('[data-cy="import-file-local-content"]').should('be.visible')

            // Attach a local KML file
            cy.log('Test add a local KML file')
            cy.fixture(localKmlFile, null).as('kmlFixture')
            cy.get('[data-cy="import-local-file-input"]').selectFile('@kmlFixture', {
                force: true,
            })
            cy.get('[data-cy="import-file-load-button"]:visible').click()

            // Assertions for successful import
            cy.get('[data-cy="import-local-file-input-text"]')
                .should('have.class', 'is-valid')
                .should('not.have.class', 'is-invalid')
            cy.get('[data-cy="import-file-load-button"]').should('be.visible').contains('Success')
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
        it.only('should send a print request correctly to mapfishprint with GPX layer', () => {
            interceptPrintRequest()
            interceptPrintStatus()
            interceptDownloadReport()

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
            cy.get('[data-cy="import-local-file-input"]').selectFile('@gpxFixture', {
                force: true,
            })
            cy.get('[data-cy="import-file-load-button"]:visible').click()

            // Assertions for successful import
            cy.get('[data-cy="import-local-file-input-text"]')
                .should('have.class', 'is-valid')
                .should('not.have.class', 'is-invalid')
            cy.get('[data-cy="import-file-load-button"]').should('be.visible').contains('Success')
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
                ).to.lessThan(1.5) // thinner than the drawn in the OL map.
            })
        })
    })
})
