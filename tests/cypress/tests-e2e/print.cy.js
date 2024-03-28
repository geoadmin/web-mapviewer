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
                .should('have.text', '1. A4 landscape')
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

                const attributes = interception.request.body.attributes
                expect(attributes).to.haveOwnProperty('printLegend')
                expect(attributes['printLegend']).to.equals(0)
                expect(attributes).to.haveOwnProperty('qrimage')
                expect(attributes['qrimage']).to.contains(
                    encodeURIComponent('https://s.geo.admin.ch/0000000')
                )

                const mapAttributes = attributes.map
                expect(mapAttributes['scale']).to.equals(1500000)
                expect(mapAttributes['dpi']).to.equals(96)
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
                expect(mapAttributes['dpi']).to.equals(96)
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
                    'test.wmts.layer,,0.5',
                ].join(';'),
            })
            cy.get('[data-cy="menu-active-layers"]').should('be.visible').click()
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
                expect(mapAttributes['scale']).to.equals(1500000)
                expect(mapAttributes['dpi']).to.equals(96)
                expect(mapAttributes['projection']).to.equals('EPSG:2056')

                const layers = mapAttributes.layers
                expect(layers).to.be.an('array')
                expect(layers).to.have.length(4)
                expect(layers[0]['layer']).to.equals('test.wmts.layer')
                expect(layers[1]['layers'][0]).to.equals('test-2.wms.layer')
                expect(layers[2]['layers'][0]).to.equals('test-1.wms.layer')
                expect(layers[3]['layer']).to.equals('test.background.layer2')

                expect(layers[0]['type']).to.equals('wmts')
                expect(layers[1]['type']).to.equals('wms')
                expect(layers[2]['type']).to.equals('wms')
                expect(layers[3]['type']).to.equals('wmts')
            })
        })
    })
})
