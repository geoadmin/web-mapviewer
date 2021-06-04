// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

const API_SERVICE_ICON_BASE_URL = 'https://service-icons.bgdi-dev.swisstopo.cloud/'

const addIconsetsFixtureAndIntercept = () => {
    cy.intercept(`**${API_SERVICE_ICON_BASE_URL}iconsets/`, {
        fixture: 'iconsets.fixture',
    }).as('iconsets')
}

const addDefaultIconsFixtureAndIntercept = () => {
    cy.intercept(`**${API_SERVICE_ICON_BASE_URL}v4/iconsets/default/icons`, {
        fixture: 'iconset_default.fixture',
    }).as('iconset_default')
}

const addBabsIconsFixtureAndIntercept = () => {
    cy.intercept(`**${API_SERVICE_ICON_BASE_URL}v4/iconsets/babs/icons`, {
        fixture: 'iconset_babs.fixture',
    }).as('iconset_babs')
}

const addIconFixtureAndIntercept = () => {
    cy.intercept(`**${API_SERVICE_ICON_BASE_URL}v4/iconsets/*/icon/*.png`, async (req) => {
        const parts = req.url.split('/')
        // fixtures with a coma in their name can not be loaded. :/
        // so we replace by underscores
        const filename = parts[parts.length - 1].replaceAll(',', '_')
        const iconset = parts[parts.length - 3]
        req.reply({
            fixture: `${iconset}/${filename}`,
        })
    }).as('icon')
}

Cypress.Commands.add('goToDrawing', () => {
    addIconFixtureAndIntercept()
    addIconsetsFixtureAndIntercept()
    addDefaultIconsFixtureAndIntercept()
    addBabsIconsFixtureAndIntercept()
    cy.goToMapView()
    cy.get('[data-cy="menu-button"]').click()
    cy.get('.menu-section-head-title:first').click() // FIXME: how to address a specific menusection
    cy.readStoreValue('state.ui.showDrawingOverlay').should('be.true')
})

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

// Adds a command that visit the main view and wait for the map to be shown (for the app to be ready)
Cypress.Commands.add('goToMapView', (lang = 'en', otherParams = {}, withHash = false) => {
    addLayerFixtureAndIntercept()
    addTopicFixtureAndIntercept()
    let flattenedOtherParams = ''
    Object.keys(otherParams).forEach((key) => {
        flattenedOtherParams += `&${key}=${otherParams[key]}`
    })
    cy.visit(`/${withHash ? '#/' : ''}?lang=${lang}${flattenedOtherParams}`)
    cy.wait('@layers')
    cy.wait('@topics')
    // we leave some room for the CI to catch the DOM element (can be a bit slow depending on the CPU power of CI's VM)
    cy.get('[data-cy="map"]', { timeout: 10000 }).should('be.visible')
})
// from https://github.com/cypress-io/cypress/issues/2671
Cypress.Commands.add(
    'goToMapViewWithMockGeolocation',
    (latitude = 47, longitude = 7, lang = 'en') => {
        addLayerFixtureAndIntercept()
        addTopicFixtureAndIntercept()
        const mockGeolocation = (win, latitude, longitude) => {
            cy.stub(win.navigator.geolocation, 'getCurrentPosition', (callback) => {
                return callback({ coords: { latitude, longitude } })
            })
        }
        cy.visit(`/?lang=${lang}`, {
            onBeforeLoad: (win) => {
                mockGeolocation(win, latitude, longitude)
            },
        })
        cy.wait('@layers')
        cy.wait('@topics')
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
