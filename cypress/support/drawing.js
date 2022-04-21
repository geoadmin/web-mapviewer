import pako from 'pako'
import { parseInterception } from './multipart'
import { BREAKPOINT_PHONE_WIDTH } from '@/config'

const olSelector = '.ol-viewport'

const addIconSetsFixtureAndIntercept = () => {
    cy.intercept(`**/api/icons/sets`, {
        fixture: 'service-icons/sets.fixture.json',
    }).as('iconSets')
}

const addDefaultIconsFixtureAndIntercept = () => {
    cy.intercept(`**/api/icons/sets/default/icons`, {
        fixture: 'service-icons/set-default.fixture.json',
    }).as('iconSet-default')
}

const addSecondIconsFixtureAndIntercept = () => {
    cy.intercept(`**/api/icons/sets/second/icons`, {
        fixture: 'service-icons/set-second.fixture.json',
    }).as('iconSet-second')
}

const addIconFixtureAndIntercept = () => {
    const fixture = 'service-icons/placeholder.png'
    cy.intercept(`**/api/icons/sets/default/icons/**@1x-255,0,0.png`, {
        fixture,
    }).as('icon-default')
    cy.intercept(`**/api/icons/sets/second/icons/**@1x.png`, {
        fixture,
    }).as('icon-second')
}

Cypress.Commands.add('drawGeoms', () => {
    // The line needs to come before the measure to ensure we don't click
    // on one of the labels from the measure line.
    cy.clickDrawingTool('LINEPOLYGON')
    cy.get(olSelector).click(200, 300).click(250, 300).dblclick(250, 350)

    cy.clickDrawingTool('MEASURE')
    cy.get(olSelector).click(100, 300).click(150, 300).click(150, 350).click(100, 300)

    cy.clickDrawingTool('MARKER')
    cy.get(olSelector).click(100, 200)

    cy.clickDrawingTool('ANNOTATION')
    cy.get(olSelector).click(200, 200)
})

// https://docs.cypress.io/api/events/catalog-of-events#Uncaught-Exceptions
// As we have some issue with uncaught exception when testing with drawing, we disable the "fail on uncaught" approach
// This exception is typically raised by a call to api3.geo.admin.ch/files/... with a HTTP 200 ERR_INCOMPLETE_CHUNKED_ENCODING error
Cypress.on('uncaught:exception', () => {
    // returning false here prevents Cypress from failing the test
    return false
})

Cypress.Commands.add('goToDrawing', () => {
    addIconFixtureAndIntercept()
    addIconSetsFixtureAndIntercept()
    addDefaultIconsFixtureAndIntercept()
    addSecondIconsFixtureAndIntercept()
    cy.goToMapView()
    const viewportWidth = Cypress.config('viewportWidth')
    if (viewportWidth && viewportWidth < BREAKPOINT_PHONE_WIDTH) {
        cy.get('[data-cy="menu-button"]').click()
    }
    cy.get('[data-cy="menu-tray-drawing-section"]').click()
    cy.readStoreValue('state.ui.showDrawingOverlay').should('be.true')
    cy.waitUntilState((state) => state.drawing.iconSets.length > 0)
})

Cypress.Commands.add('clickDrawingTool', (drawingMode) => {
    expect(['MARKER', 'ANNOTATION', 'MEASURE', 'LINEPOLYGON']).to.include(drawingMode)
    cy.get(`[data-cy="drawing-toolbox-mode-button-${drawingMode}`).click()
    cy.readStoreValue('state.drawing.mode').should('eq', drawingMode)
})

Cypress.Commands.add('readDrawingFeatures', (type, callback) => {
    cy.readWindowValue('drawingLayer').then((drawingLayer) => {
        const features = drawingLayer.getSource().getFeatures()
        expect(features).to.have.lengthOf(1, 'no feature found in the drawing layer')
        const foundType = features[0].getGeometry().getType()
        expect(foundType).to.equal(type)
        if (callback) {
            callback(features)
        }
    })
})

Cypress.Commands.add('checkDrawnGeoJsonProperty', (key, expected, checkIfContains = false) => {
    cy.readWindowValue('drawingLayer').then((drawingLayer) => {
        const features = drawingLayer.getSource().getFeatures()
        expect(features).to.have.lengthOf(1, 'no feature found in the drawing layer')
        const firstFeature = features[0]
        if (checkIfContains) {
            expect(firstFeature.get(key)).to.contain(
                expected,
                `${firstFeature} != ${expected} Properties are ${JSON.stringify(
                    firstFeature.getProperties(),
                    null,
                    2
                )}`
            )
        } else {
            expect(firstFeature.get(key)).to.equal(
                expected,
                `${firstFeature} != ${expected} Properties are ${JSON.stringify(
                    firstFeature,
                    null,
                    2
                )}`
            )
        }
    })
})

Cypress.Commands.add('checkKMLRequest', async (interception, data, create = false) => {
    // Check request
    if (!create) {
        const urlArray = interception.request.url.split('/')
        const id = urlArray[urlArray.length - 1]
        expect(id).to.be.eq('1234_fileId')
    }
    expect(interception.request.headers['content-type']).to.contain(
        'multipart/form-data; boundary='
    )

    const { kml } = parseInterception(interception)
    const fileBuffer = await kml.blob.arrayBuffer()

    const inflated = pako.ungzip(new Uint8Array(fileBuffer))
    const decoded = new TextDecoder().decode(inflated)

    expect(decoded).to.contain('</kml>')
    data.forEach((test) => {
        const condition = test instanceof RegExp ? 'match' : 'contain'
        expect(decoded).to[condition](test)
    })
})
