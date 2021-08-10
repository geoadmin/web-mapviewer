// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

const { MapBrowserEvent } = require('ol')

const API_SERVICE_ICON_BASE_URL = 'https://service-icons.bgdi-dev.swisstopo.cloud/'

const addIconsetsFixtureAndIntercept = () => {
    cy.intercept(`**${API_SERVICE_ICON_BASE_URL}v4/iconsets/`, {
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

const addCatalogFixtureAndIntercept = () => {
    // intercepting further topic metadata retrieval
    cy.fixture('topics.fixture').then((mockedTopics) => {
        mockedTopics.topics.forEach((topic) => {
            cy.intercept(`**/rest/services/${topic.id}/CatalogServer?lang=en`, {
                fixture: 'catalogs.fixture',
            }).as(`topic-${topic.id}`)
        })
    })
}

// Adds a command that visit the main view and wait for the map to be shown (for the app to be ready)
Cypress.Commands.add('goToMapView', (lang = 'en', otherParams = {}, withHash = false) => {
    addLayerFixtureAndIntercept()
    addTopicFixtureAndIntercept()
    addCatalogFixtureAndIntercept()
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

Cypress.Commands.add('getDrawingMap', () => {
    return cy.readWindowValue('drawingMap')
})

Cypress.Commands.add('clickDrawingTool', (name) => {
    expect(['marker', 'text', 'line', 'measure']).to.include(name)
    cy.get(`[data-cy="drawing-${name}`).click()
    cy.readStoreValue('state.drawing.mode').should('eq', name.toUpperCase())
})

Cypress.Commands.add('readDrawingFeatures', (type, callback) => {
    cy.readWindowValue('drawingManager')
        .then((manager) => manager.source.getFeatures())
        .then((features) => {
            expect(features).to.have.length(1)
            const foundType = features[0].getGeometry().getType()
            expect(foundType).to.equal(type)
            if (callback) callback(features)
        })
})

Cypress.Commands.add('readDrawnGeoJSON', () => cy.readStoreValue('state.drawing.geoJson'))

Cypress.Commands.add('checkDrawnGeoJsonProperty', (key, expected) => {
    cy.readWindowValue('drawingManager')
        .then((manager) => manager.source.getFeatures())
        .then((features) => {
            expect(features).to.have.length(1)
            const v = features[0].get(key)
            expect(v).to.equal(
                expected,
                `${v} != ${expected} Properties are ${JSON.stringify(
                    features[0].getProperties(),
                    null,
                    2
                )}`
            )
        })
})

/**
 * This function has been taken from the OL draw spec. Simulates a browser event on the map
 * viewport. The client x/y location will be adjusted as if the map were centered at 0,0.
 *
 * @param {string} type Event type.
 * @param {number} x Horizontal offset from map center.
 * @param {number} y Vertical offset from map center.
 * @param {boolean} [opt_shiftKey] Shift key is pressed.
 * @param {number} [opt_pointerId] Pointer id.
 * @returns {MapBrowserEvent} The simulated event.
 */
function simulateEvent(map, type, x, y, opt_shiftKey, opt_pointerId = 0) {
    cy.log(`simulating ${type} at [${x}, ${y}]`)

    var viewport = map.getViewport()
    let position = viewport.getBoundingClientRect()

    // calculated in case body has top < 0 (test runner with small window)
    const shiftKey = opt_shiftKey !== undefined ? opt_shiftKey : false
    const event = {}
    event.type = type
    event.target = viewport.firstChild
    event.clientX = position.left + x + position.width / 2
    event.clientY = position.top + y + position.height / 2
    event.shiftKey = shiftKey
    event.preventDefault = function () {}
    event.pointerType = 'mouse'
    event.pointerId = opt_pointerId
    event.isPrimary = true
    event.button = 0
    // @ts-ignore
    const simulatedEvent = new MapBrowserEvent(type, map, event)
    map.handleMapBrowserEvent(simulatedEvent)
    return simulatedEvent
}

Cypress.Commands.add('clickDrawingMap', (x, y, callback) => {
    cy.getDrawingMap().then((map) => {
        // Create a point, a geojson will appear in the store
        simulateEvent(map, 'pointermove', x, y)
        simulateEvent(map, 'pointerdown', x, y)
        simulateEvent(map, 'pointerup', x, y)
        if (callback) callback(map)
    })
})

Cypress.Commands.add('dragDrawingMap', (sx, sy, tx, ty, callback) => {
    cy.getDrawingMap().then((map) => {
        simulateEvent(map, 'pointerdown', sx, sy)
        simulateEvent(map, 'pointermove', tx, ty)
        simulateEvent(map, 'pointerdrag', tx, ty)
        simulateEvent(map, 'pointerup', tx, ty)
        if (callback) callback(map)
    })
})

Cypress.Commands.add('isDrawingEmpty', () => {
    cy.readWindowValue('drawingManager')
        .then((manager) => manager.source.getFeatures())
        .then((features) => {
            expect(features).to.have.length(0)
        })
})
