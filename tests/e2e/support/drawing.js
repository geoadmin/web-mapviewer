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
    cy.intercept(`**/api/icons/sets/default/icons/**@1x-255,0,0.png`, {
        fixture: 'service-icons/placeholder.png',
    }).as('icon-default')
    cy.intercept(`**/api/icons/sets/second/icons/**@1x.png`, {
        fixture: 'service-icons/placeholder.png',
    }).as('icon-second')
}

Cypress.Commands.add('drawGeoms', () => {
    cy.clickDrawingTool('marker')
    cy.get(olSelector).click(170, 190)

    cy.clickDrawingTool('text')
    cy.get(olSelector).click(200, 190)

    cy.clickDrawingTool('measure')
    cy.get(olSelector).click(100, 200).click(150, 200).click(150, 230).click(100, 200)

    cy.clickDrawingTool('line')
    cy.get(olSelector).click(210, 200).click(220, 200).dblclick(230, 230)
})

// https://docs.cypress.io/api/events/catalog-of-events#Uncaught-Exceptions
// As we have some issue with uncaught exception when testing with drawing, we disable the "fail on uncaught" approach
// This exception is typically raised by a call to api3.geo.admin.ch/files/... with a HTTP 200 ERR_INCOMPLETE_CHUNKED_ENCODING error
Cypress.on('uncaught:exception', () => {
    // returning false here prevents Cypress from failing the test
    return false
})

Cypress.Commands.add('goToDrawing', (isMobileViewport = false) => {
    // see drawing.store.js (wait is at the end of this function)
    cy.intercept('**/tell-cypress-icon-sets-available', {}).as('icon-sets-available')

    addIconFixtureAndIntercept()
    addIconSetsFixtureAndIntercept()
    addDefaultIconsFixtureAndIntercept()
    addSecondIconsFixtureAndIntercept()
    cy.goToMapView()
    if (isMobileViewport) {
        cy.get('[data-cy="menu-button"]').click()
    }
    cy.get('[data-cy="menu-tray-drawing-section"]').click()
    cy.readStoreValue('state.ui.showDrawingOverlay').should('be.true')
    cy.wait('@icon-sets-available')
})

Cypress.Commands.add('clickDrawingTool', (name) => {
    expect(['marker', 'text', 'line', 'measure']).to.include(name)
    cy.get(`[data-cy="drawing-toolbox-mode-button-${name.toUpperCase()}`).click()
    cy.readStoreValue('state.drawing.mode').should('eq', name.toUpperCase())
})

Cypress.Commands.add('readDrawingFeatures', (type, callback) => {
    cy.readWindowValue('drawingManager').then((manager) => {
        const features = manager.source.getFeatures()
        expect(features).to.have.lengthOf(1, 'no feature found in the drawing manager')
        const foundType = features[0].getGeometry().getType()
        expect(foundType).to.equal(type)
        if (callback) {
            callback(features)
        }
    })
})

Cypress.Commands.add('checkDrawnGeoJsonProperty', (key, expected, checkIfContains = false) => {
    cy.readWindowValue('drawingManager').then((manager) => {
        const features = manager.source.getFeatures()
        expect(features).to.have.lengthOf(1, 'no feature found in the drawing manager')
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

Cypress.Commands.add('checkKMLRequest', (interception, data, create = false) => {
    // Check request
    if (!create) {
        const urlArray = interception.request.url.split('/')
        const id = urlArray[urlArray.length - 1]
        expect(id).to.be.eq('1234_fileId')
    }
    expect(interception.request.headers['content-type']).to.contain(
        'multipart/form-data; boundary='
    )
    expect(interception.request.body).to.contain('</kml>')
    data.forEach((text) => expect(interception.request.body).to.contain(text))
})
