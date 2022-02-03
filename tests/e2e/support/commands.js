// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

const addLayerTileFixture = () => {
    // catching WMTS type URLs
    cy.intercept(`**/3857/**/**/**/**.jpeg`, {
        fixture: '256.jpeg',
    })
    cy.intercept(`**/3857/**/**/**/**.png`, {
        fixture: '256.png',
    })
}

const addFileAPIFixtureAndIntercept = () => {
    cy.intercept(
        {
            method: 'POST',
            url: '/api/kml/admin',
        },
        {
            statusCode: 201,
            fixture: 'service-kml/create-file.fixture.json',
        }
    ).as('post-kml')
    cy.intercept(
        {
            method: 'PUT',
            url: '/api/kml/admin/**',
        },
        {
            statusCode: 200,
            fixture: 'service-kml/update-file.fixture.json',
        }
    ).as('update-kml')
    // intercepting now the call to the file itself
    cy.fixture('service-kml/create-file.fixture.json').then((fileFixture) => {
        cy.intercept(`**/api/kml/files/${fileFixture.fileId}`, {
            body: '<kml></kml>',
        }).as('get-kml')
    })
}

const addLayerFixtureAndIntercept = () => {
    cy.intercept('**/rest/services/all/MapServer/layersConfig**', {
        fixture: 'layers.fixture',
    }).as('layers')
}

const addTopicFixtureAndIntercept = () => {
    cy.intercept('**/rest/services', {
        fixture: 'topics.fixture',
    }).as('topics')
}

const addCatalogFixtureAndIntercept = () => {
    // intercepting further topic metadata retrieval
    cy.fixture('topics.fixture').then((mockedTopics) => {
        mockedTopics.topics.forEach((topic) => {
            cy.intercept(`**/rest/services/${topic.id}/CatalogServer?lang=**`, {
                fixture: 'catalogs.fixture',
            }).as(`topic-${topic.id}`)
        })
    })
}
const addHeightFixtureAndIntercept = () => {
    cy.intercept('**/rest/services/height**', {
        fixture: 'height.fixture',
    }).as('coordinates-for-height')
}

const addWhat3WordFixtureAndIntercept = () => {
    cy.intercept('**/convert-to-3wa**', {
        fixture: 'what3word.fixture',
    }).as('convert-to-w3w')
    cy.intercept('**/convert-to-coordinates**', {
        fixture: 'what3word.fixture',
    }).as('coordinates-for-w3w')
}

// Adds a command that visit the main view and wait for the map to be shown (for the app to be ready)
Cypress.Commands.add(
    'goToMapView',
    (
        lang = 'en',
        otherParams = {},
        withHash = false,
        geolocationMockupOptions = { latitude: 47, longitude: 7 }
    ) => {
        addLayerTileFixture()
        addFileAPIFixtureAndIntercept()
        addLayerFixtureAndIntercept()
        addTopicFixtureAndIntercept()
        addCatalogFixtureAndIntercept()
        addWhat3WordFixtureAndIntercept()
        addHeightFixtureAndIntercept()
        let flattenedOtherParams = ''
        Object.keys(otherParams).forEach((key) => {
            flattenedOtherParams += `&${key}=${otherParams[key]}`
        })
        // see app.store.js
        cy.intercept('**/tell-cypress-app-is-done-loading', {}).as('app-done-loading')
        // Alias used to wait until layers have been updated after loading configuration.
        cy.intercept('**/tell-cypress-layers-are-configured', {}).as('layers-configured')

        // geolocation mockup from https://github.com/cypress-io/cypress/issues/2671
        const mockGeolocation = (win, latitude, longitude) => {
            cy.stub(win.navigator.geolocation, 'getCurrentPosition', (callback) => {
                return callback({ coords: { latitude, longitude } })
            })
        }
        cy.visit(`/${withHash ? '#/' : ''}?lang=${lang}${flattenedOtherParams}`, {
            onBeforeLoad: (win) => {
                mockGeolocation(
                    win,
                    geolocationMockupOptions.latitude,
                    geolocationMockupOptions.longitude
                )
            },
        })
        // waiting for the app to load and layers to be configured.
        cy.wait('@app-done-loading')
        cy.wait('@layers-configured')
        // we leave some room for the CI to catch the DOM element (can be a bit slow depending on the CPU power of CI's VM)
        cy.get('[data-cy="map"]', { timeout: 10000 }).should('be.visible')
    }
)

// Reads a value from the Vuex store
// for state module value, the key should look like "state.{moduleName}.{valueName}" (e.g. "state.position.center")
// for getters, the key should look like "getters.{getterName}" (e.g. "getters.centerEpsg4326")
Cypress.Commands.add('readStoreValue', (key) => {
    return cy.window().its(`store.${key}`)
})

// Reads a value from the window
Cypress.Commands.add('readWindowValue', (key) => {
    return cy.window().its(key)
})

// from https://github.com/cypress-io/cypress/issues/1123#issuecomment-672640129
Cypress.Commands.add(
    'paste',
    {
        prevSubject: true,
        element: true,
    },
    ($element, text) => {
        const subString = text.substr(0, text.length - 1)
        const lastChar = text.slice(-1)

        cy.get($element)
            .click()
            .then(() => {
                $element.text(subString)
                $element.val(subString)
                cy.get($element).type(lastChar)
            })
    }
)

/**
 * @param endpoint {String} endpoint on the server to mock up, without the base URL part. It can
 *   have wildcards (e.g. 'rest/services/ech/SearchServer*?type=layers*')
 * @param wantedOutput {Object} the mocked up JSON output for this endpoint
 * @param aliasName {String} the name of the alias, so you can wait for it with `cy.wait('@aliasName')`
 */
const mockupBackendResponse = (endpoint, wantedOutput, aliasName) => {
    cy.intercept(`**/${endpoint}`, {
        body: wantedOutput,
    }).as(aliasName)
}
Cypress.Commands.add('mockupBackendResponse', mockupBackendResponse)

// Reads a value from clipboard
Cypress.Commands.add('readClipboardValue', () => {
    return cy.window().then((win) => {
        return win.navigator.clipboard.readText().then((t) => {
            return t
        })
    })
})
