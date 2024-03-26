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
        cy.intercept('GET', '**/capabilities.json', (req) => {
            req.reply({
                body: {
                    app: 'default',
                    layouts: [
                        {
                            name: '1. A4 landscape',
                            attributes: [
                                {
                                    name: 'name',
                                    type: 'String',
                                    default: 'this is a name',
                                },
                                {
                                    name: 'url',
                                    type: 'String',
                                },
                                {
                                    name: 'copyright',
                                    type: 'String',
                                },
                                {
                                    name: 'qrimage',
                                    type: 'String',
                                },
                                {
                                    name: 'legend',
                                    type: 'LegendAttributeValue',
                                    clientParams: {
                                        classes: {
                                            type: 'LegendAttributeValue[]',
                                            embeddedType: {
                                                classes: {
                                                    type: 'recursiveDefinition',
                                                    default: null,
                                                    isArray: true,
                                                },
                                                dpi: {
                                                    type: 'double',
                                                    default: null,
                                                },
                                                icons: {
                                                    type: 'URL',
                                                    default: null,
                                                    isArray: true,
                                                },
                                                name: {
                                                    type: 'String',
                                                    default: null,
                                                },
                                            },
                                            default: null,
                                            isArray: true,
                                        },
                                        dpi: {
                                            type: 'double',
                                            default: null,
                                        },
                                        icons: {
                                            type: 'URL',
                                            default: null,
                                            isArray: true,
                                        },
                                        name: {
                                            type: 'String',
                                            default: null,
                                        },
                                    },
                                },
                                {
                                    name: 'map',
                                    type: 'MapAttributeValues',
                                    clientParams: {
                                        zoomToFeatures: {
                                            type: 'ZoomToFeatures',
                                            embeddedType: {
                                                minScale: {
                                                    type: 'double',
                                                    default: null,
                                                },
                                                zoomType: {
                                                    type: 'ZoomType',
                                                    embeddedType: {},
                                                    default: 'EXTENT',
                                                },
                                                layer: {
                                                    type: 'String',
                                                    default: null,
                                                },
                                                minMargin: {
                                                    type: 'int',
                                                    default: 10,
                                                },
                                            },
                                        },
                                        dpi: {
                                            type: 'double',
                                        },
                                        bbox: {
                                            type: 'double',
                                            isArray: true,
                                        },
                                        center: {
                                            type: 'double',
                                            isArray: true,
                                        },
                                        width: {
                                            type: 'int',
                                            default: 802,
                                        },
                                        longitudeFirst: {
                                            type: 'boolean',
                                            default: null,
                                        },
                                        layers: {
                                            type: 'array',
                                            default: [],
                                        },
                                        projection: {
                                            type: 'String',
                                            default: null,
                                        },
                                        useNearestScale: {
                                            type: 'boolean',
                                            default: null,
                                        },
                                        dpiSensitiveStyle: {
                                            type: 'boolean',
                                            default: true,
                                        },
                                        pdfA: {
                                            type: 'boolean',
                                            default: null,
                                        },
                                        scale: {
                                            type: 'double',
                                            default: null,
                                        },
                                        useAdjustBounds: {
                                            type: 'boolean',
                                            default: null,
                                        },
                                        height: {
                                            type: 'int',
                                            default: 514,
                                        },
                                        areaOfInterest: {
                                            type: 'AreaOfInterest',
                                            embeddedType: {
                                                area: {
                                                    type: 'String',
                                                },
                                                display: {
                                                    type: 'AoiDisplay',
                                                    embeddedType: {},
                                                    default: 'RENDER',
                                                },
                                                style: {
                                                    type: 'String',
                                                    default: null,
                                                },
                                                renderAsSvg: {
                                                    type: 'boolean',
                                                    default: null,
                                                },
                                            },
                                            default: null,
                                        },
                                        rotation: {
                                            type: 'double',
                                            default: null,
                                        },
                                    },
                                    clientInfo: {
                                        dpiSuggestions: [72, 91, 128, 254, 300, 400],
                                        scales: [
                                            2500000, 1500000, 1000000, 500000, 300000, 200000,
                                            100000, 50000, 25000, 20000, 10000, 5000, 2500, 1000,
                                            500,
                                        ],
                                        maxDPI: 400,
                                        width: 802,
                                        height: 514,
                                    },
                                },
                                {
                                    name: 'scalebar',
                                    type: 'ScalebarAttributeValues',
                                    clientParams: {
                                        barSize: {
                                            type: 'int',
                                            default: 4,
                                        },
                                        backgroundColor: {
                                            type: 'String',
                                            default: 'rgba(255, 255, 255, 0)',
                                        },
                                        orientation: {
                                            type: 'String',
                                            default: 'horizontalLabelsBelow',
                                        },
                                        padding: {
                                            type: 'int',
                                            default: null,
                                        },
                                        verticalAlign: {
                                            type: 'String',
                                            default: 'bottom',
                                        },
                                        lockUnits: {
                                            type: 'boolean',
                                            default: false,
                                        },
                                        color: {
                                            type: 'String',
                                            default: 'black',
                                        },
                                        renderAsSvg: {
                                            type: 'boolean',
                                            default: true,
                                        },
                                        lineWidth: {
                                            type: 'int',
                                            default: null,
                                        },
                                        labelDistance: {
                                            type: 'int',
                                            default: 1,
                                        },
                                        type: {
                                            type: 'String',
                                            default: 'line',
                                        },
                                        align: {
                                            type: 'String',
                                            default: 'center',
                                        },
                                        unit: {
                                            type: 'String',
                                            default: null,
                                        },
                                        intervals: {
                                            type: 'int',
                                            default: 3,
                                        },
                                        subIntervals: {
                                            type: 'boolean',
                                            default: false,
                                        },
                                        geodetic: {
                                            type: 'boolean',
                                            default: false,
                                        },
                                        fontSize: {
                                            type: 'int',
                                            default: 8,
                                        },
                                        fontColor: {
                                            type: 'String',
                                            default: 'black',
                                        },
                                        font: {
                                            type: 'String',
                                            default: 'Helvetica',
                                        },
                                        barBgColor: {
                                            type: 'String',
                                            default: 'white',
                                        },
                                        labelRotation: {
                                            type: 'float',
                                            default: 0,
                                        },
                                    },
                                },
                                {
                                    name: 'northArrow',
                                    type: 'NorthArrowAttributeValues',
                                    clientParams: {
                                        graphic: {
                                            type: 'String',
                                            default: 'file://ressources/north_arrow.png',
                                        },
                                        backgroundColor: {
                                            type: 'String',
                                            default: 'rgba(255, 255, 255, 0)',
                                        },
                                    },
                                },
                            ],
                        },
                        {
                            name: '2. A4 portrait',
                            attributes: [
                                {
                                    name: 'name',
                                    type: 'String',
                                    default: 'this is a name',
                                },
                                {
                                    name: 'url',
                                    type: 'String',
                                },
                                {
                                    name: 'copyright',
                                    type: 'String',
                                },
                                {
                                    name: 'qrimage',
                                    type: 'String',
                                },
                                {
                                    name: 'legend',
                                    type: 'LegendAttributeValue',
                                    clientParams: {
                                        classes: {
                                            type: 'LegendAttributeValue[]',
                                            embeddedType: {
                                                classes: {
                                                    type: 'recursiveDefinition',
                                                    default: null,
                                                    isArray: true,
                                                },
                                                dpi: {
                                                    type: 'double',
                                                    default: null,
                                                },
                                                icons: {
                                                    type: 'URL',
                                                    default: null,
                                                    isArray: true,
                                                },
                                                name: {
                                                    type: 'String',
                                                    default: null,
                                                },
                                            },
                                            default: null,
                                            isArray: true,
                                        },
                                        dpi: {
                                            type: 'double',
                                            default: null,
                                        },
                                        icons: {
                                            type: 'URL',
                                            default: null,
                                            isArray: true,
                                        },
                                        name: {
                                            type: 'String',
                                            default: null,
                                        },
                                    },
                                },
                                {
                                    name: 'map',
                                    type: 'MapAttributeValues',
                                    clientParams: {
                                        zoomToFeatures: {
                                            type: 'ZoomToFeatures',
                                            embeddedType: {
                                                minScale: {
                                                    type: 'double',
                                                    default: null,
                                                },
                                                zoomType: {
                                                    type: 'ZoomType',
                                                    embeddedType: {},
                                                    default: 'EXTENT',
                                                },
                                                layer: {
                                                    type: 'String',
                                                    default: null,
                                                },
                                                minMargin: {
                                                    type: 'int',
                                                    default: 10,
                                                },
                                            },
                                        },
                                        dpi: {
                                            type: 'double',
                                        },
                                        bbox: {
                                            type: 'double',
                                            isArray: true,
                                        },
                                        center: {
                                            type: 'double',
                                            isArray: true,
                                        },
                                        width: {
                                            type: 'int',
                                            default: 555,
                                        },
                                        longitudeFirst: {
                                            type: 'boolean',
                                            default: null,
                                        },
                                        layers: {
                                            type: 'array',
                                            default: [],
                                        },
                                        projection: {
                                            type: 'String',
                                            default: null,
                                        },
                                        useNearestScale: {
                                            type: 'boolean',
                                            default: null,
                                        },
                                        dpiSensitiveStyle: {
                                            type: 'boolean',
                                            default: true,
                                        },
                                        pdfA: {
                                            type: 'boolean',
                                            default: null,
                                        },
                                        scale: {
                                            type: 'double',
                                            default: null,
                                        },
                                        useAdjustBounds: {
                                            type: 'boolean',
                                            default: null,
                                        },
                                        height: {
                                            type: 'int',
                                            default: 752,
                                        },
                                        areaOfInterest: {
                                            type: 'AreaOfInterest',
                                            embeddedType: {
                                                area: {
                                                    type: 'String',
                                                },
                                                display: {
                                                    type: 'AoiDisplay',
                                                    embeddedType: {},
                                                    default: 'RENDER',
                                                },
                                                style: {
                                                    type: 'String',
                                                    default: null,
                                                },
                                                renderAsSvg: {
                                                    type: 'boolean',
                                                    default: null,
                                                },
                                            },
                                            default: null,
                                        },
                                        rotation: {
                                            type: 'double',
                                            default: null,
                                        },
                                    },
                                    clientInfo: {
                                        dpiSuggestions: [72, 91, 128, 254, 300, 400],
                                        scales: [
                                            2500000, 1500000, 1000000, 500000, 300000, 200000,
                                            100000, 50000, 25000, 20000, 10000, 5000, 2500, 1000,
                                            500,
                                        ],
                                        maxDPI: 400,
                                        width: 555,
                                        height: 752,
                                    },
                                },
                                {
                                    name: 'scalebar',
                                    type: 'ScalebarAttributeValues',
                                    clientParams: {
                                        barSize: {
                                            type: 'int',
                                            default: 4,
                                        },
                                        backgroundColor: {
                                            type: 'String',
                                            default: 'rgba(255, 255, 255, 0)',
                                        },
                                        orientation: {
                                            type: 'String',
                                            default: 'horizontalLabelsBelow',
                                        },
                                        padding: {
                                            type: 'int',
                                            default: null,
                                        },
                                        verticalAlign: {
                                            type: 'String',
                                            default: 'bottom',
                                        },
                                        lockUnits: {
                                            type: 'boolean',
                                            default: false,
                                        },
                                        color: {
                                            type: 'String',
                                            default: 'black',
                                        },
                                        renderAsSvg: {
                                            type: 'boolean',
                                            default: true,
                                        },
                                        lineWidth: {
                                            type: 'int',
                                            default: null,
                                        },
                                        labelDistance: {
                                            type: 'int',
                                            default: 1,
                                        },
                                        type: {
                                            type: 'String',
                                            default: 'line',
                                        },
                                        align: {
                                            type: 'String',
                                            default: 'center',
                                        },
                                        unit: {
                                            type: 'String',
                                            default: null,
                                        },
                                        intervals: {
                                            type: 'int',
                                            default: 3,
                                        },
                                        subIntervals: {
                                            type: 'boolean',
                                            default: false,
                                        },
                                        geodetic: {
                                            type: 'boolean',
                                            default: false,
                                        },
                                        fontSize: {
                                            type: 'int',
                                            default: 8,
                                        },
                                        fontColor: {
                                            type: 'String',
                                            default: 'black',
                                        },
                                        font: {
                                            type: 'String',
                                            default: 'Helvetica',
                                        },
                                        barBgColor: {
                                            type: 'String',
                                            default: 'white',
                                        },
                                        labelRotation: {
                                            type: 'float',
                                            default: 0,
                                        },
                                    },
                                },
                                {
                                    name: 'northArrow',
                                    type: 'NorthArrowAttributeValues',
                                    clientParams: {
                                        graphic: {
                                            type: 'String',
                                            default: 'file://ressources/north_arrow.png',
                                        },
                                        backgroundColor: {
                                            type: 'String',
                                            default: 'rgba(255, 255, 255, 0)',
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                    smtp: {
                        enabled: false,
                    },
                    formats: ['bmp', 'gif', 'jpeg', 'jpg', 'pdf', 'png', 'svg', 'tif', 'tiff'],
                },
            })
        }).as('capabilities')
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
                delay: 500,
            })
        }).as('printStatus')
    }
    function interceptDownloadReport() {
        cy.intercept('GET', '**/report/print**', (req) => {
            req.reply({
                body: {
                    done: true,
                    status: 'running',
                    elapsedTime: 2594,
                    waitingTime: 0,
                    downloadURL: '/print/report/' + printID,
                },
                delay: 500,
            })
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
            cy.get('[data-cy="print-layout-selector"]').find('option').should('have.length', 2)
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
            cy.get('[data-cy="abort-print-button"]').should('be.visible').click()

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
            cy.get('[data-cy="checkboxGraticule"]').check()
            cy.get('[data-cy="checkboxGraticule"]').should('be.checked')

            cy.get('[data-cy="debug-tools-header"]').should('be.visible').click()
            cy.get('[data-cy="current-projection"]').should('be.visible').contains('2056')
            cy.get('[data-cy="toggle-projection-button"]').should('be.visible').click()
            cy.get('[data-cy="current-projection"]').should('be.visible').contains('3857')

            cy.get('[data-cy="print-map-button"]').should('be.visible').click()
            cy.get('[data-cy="abort-print-button"]').should('be.visible').click()

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
            cy.get('[data-cy="abort-print-button"]').should('be.visible').click()

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
