import { BREAKPOINT_TABLET } from '@/config'
import 'cypress-real-events'
import 'cypress-wait-until'
import { MapBrowserEvent } from 'ol'

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
        fixture: 'service-alti/height.fixture',
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

const addIconsSetIntercept = () => {
    cy.intercept(`**/api/icons/sets`, {
        fixture: 'service-icons/sets.fixture.json',
    }).as('icon-sets')
}

const addDefaultIconsFixtureAndIntercept = () => {
    cy.intercept(`**/api/icons/sets/default/icons`, {
        fixture: 'service-icons/set-default.fixture.json',
    }).as('icon-set-default')
}

const addSecondIconsFixtureAndIntercept = () => {
    cy.intercept(`**/api/icons/sets/babs/icons`, {
        fixture: 'service-icons/set-babs.fixture.json',
    }).as('icon-set-babs')
}

export function getDefaultFixturesAndIntercepts() {
    return {
        addLayerTileFixture,
        addLayerFixtureAndIntercept,
        addTopicFixtureAndIntercept,
        addCatalogFixtureAndIntercept,
        addHeightFixtureAndIntercept,
        addWhat3WordFixtureAndIntercept,
        addIconsSetIntercept,
        addDefaultIconsFixtureAndIntercept,
        addSecondIconsFixtureAndIntercept,
    }
}

/**
 * Command that visits the main view and waits for the map to be shown (for the app to be ready) All
 * parameters are optional. They can either be passed in order or inside a wrapper object.
 *
 * @param {String} lang Language of the app
 * @param {Object} otherParams URL parameters except the language
 * @param {Boolean} withHash Wheather or not to use the new URL format (that has a hash)
 * @param {Object} geolocationMockupOptions Latitude and Longitude of facked geolocation
 * @param {Object} fixturesAndIntercepts Contains functions that overwrite the default interceptions
 *   to the backend.
 */
Cypress.Commands.add(
    'goToMapView',
    (
        lang = 'en',
        otherParams = {},
        withHash = false,
        geolocationMockupOptions = { latitude: 47, longitude: 7 },
        fixturesAndIntercepts = {}
    ) => {
        // If parameters have been passed inside a wrapper object, unwrap the object
        if (typeof lang === 'object' && !(lang instanceof String)) {
            const params = lang
            return cy.goToMapView(
                params.lang,
                params.otherParams,
                params.withHash,
                params.geolocationMockupOptions,
                params.fixturesAndIntercepts
            )
        }
        // Intercepts passed as parameters to "fixturesAndIntercepts" will overwrite the correspondent
        // default intercept.
        const defIntercepts = getDefaultFixturesAndIntercepts()
        const intercepts = fixturesAndIntercepts
        for (const intercept in defIntercepts) {
            if (intercept in intercepts) {
                intercepts[intercept]()
            } else {
                defIntercepts[intercept]()
            }
        }

        let flattenedOtherParams = ''
        Object.keys(otherParams).forEach((key) => {
            flattenedOtherParams += `&${key}=${otherParams[key]}`
        })

        /**
         * Geolocation mockup
         *
         * @param {Cypress.AUTWindow} win A reference to the window object.
         * @param {GeolocationCoordinates} coords The fake coordinates to pass along.
         * @see https://github.com/cypress-io/cypress/issues/2671
         */
        const mockGeolocation = (win, coords) => {
            const handler = (callback) => callback({ coords })
            cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake(handler)
            cy.stub(win.navigator.geolocation, 'watchPosition').callsFake(handler)
        }
        cy.visit(`/${withHash ? '#/' : ''}?lang=${lang}${flattenedOtherParams}`, {
            onBeforeLoad: (win) => mockGeolocation(win, geolocationMockupOptions),
        })
        // waiting for the app to load and layers to be configured.
        cy.waitUntilState((state) => state.app.isReady)
        cy.waitUntilState((state) => {
            const active = state.layers.activeLayers.length
            // The required layers can be set via topic or manually.
            const targetTopic = state.topics.current?.layersToActivate.length
            const targetLayers =
                'layers' in otherParams
                    ? // Legacy layers come with an additional param. At least in our tests.
                      'layers_opacity' in otherParams || 'layers_visibility' in otherParams
                        ? otherParams.layers.split(',').length
                        : otherParams.layers.split(';').length
                    : 0
            // There are situations where neither value is falsy.
            // But the higher value seems to always be the right one.
            let target = Math.max(targetTopic, targetLayers)
            // If a layer has been set via adminId we just increment by one.
            target += Boolean(otherParams.adminId)

            return active === target
        })
        cy.get('[data-cy="map"]').should('be.visible')
    }
)

/**
 * Click on language command
 *
 * This command change the application to the given language independently of the ui mode
 * (mobile/tablet/desktop)
 *
 * @param {string} lang Language to click; de, fr, it, en or rm
 */
Cypress.Commands.add('clickOnLanguage', (lang) => {
    let menuSection = null
    const width = Cypress.config('viewportWidth')
    if (width < BREAKPOINT_TABLET) {
        // mobile/tablet : clicking on the menu button first
        menuSection = cy.get('[data-cy="menu-settings-section"]')
        menuSection.click()
    } else {
        // desktop
        menuSection = cy.get('[data-cy="header-settings-section"]')
    }
    menuSection.should('be.visible')
    menuSection.find(`[data-cy="menu-lang-${lang}"]`).click()
})

// cypress-wait-until wrapper to wait for a specific store state.
// cy.readStoreValue doesn't work as `.its` will prevent retries.
Cypress.Commands.add('waitUntilState', (predicate) => {
    cy.waitUntil(() => cy.window().then((win) => predicate(win.store.state)), {
        errorMsg:
            '"waitUntilState" failed, as the following predicate stayed false: ' +
            predicate.toString(),
    })
})

// Reads a value from the Vuex store
// for state module value, the key should look like "state.{moduleName}.{valueName}" (e.g. "state.position.center")
// for getters, the key should look like "getters.{getterName}" (e.g. "getters.centerEpsg4326")
Cypress.Commands.add('readStoreValue', (key) => {
    return cy.window().its(`store.${key}`)
})

/**
 * Dispatches a store action to update a value of the store.
 *
 * @param {String} action The store action to dispatch
 * @param {any} value The value that is passed as a parameter to the action
 */
Cypress.Commands.add('writeStoreValue', (action, value) => {
    return cy
        .window()
        .its('store')
        .then((store) => {
            store.dispatch(action, value)
        })
})

// Reads a value from the window
Cypress.Commands.add('readWindowValue', (key) => {
    return cy.window().its(key)
})

Cypress.Commands.add('activateFullscreen', () => {
    cy.readStoreValue('state.ui.fullscreenMode').should('be.false')
    cy.get('[data-cy="map"]').click('center')
    cy.readStoreValue('getters.isPhoneMode').then((isPhoneMode) => {
        if (isPhoneMode) {
            cy.waitUntilState((state) => state.ui.fullscreenMode)
        } else {
            cy.readStoreValue('state.ui.fullscreenMode').should('be.false')
        }
    })
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
 * @param aliasName {String} the name of the alias, so you can wait for it with
 *   `cy.wait('@aliasName')`
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
Cypress.Commands.add(
    'simulateEvent',
    { prevSubject: false },
    (map, type, x = 0, y = 0, opt_shiftKey = false, opt_pointerId = 0) => {
        cy.log(`simulating ${type} at [${x}, ${y}]`)

        const viewport = map.getViewport()

        // calculated in case body has top < 0 (test runner with small window)
        const event = {
            type,
            target: viewport.firstChild,
            clientX: viewport.clientLeft + x + viewport.clientWidth / 2,
            clientY: viewport.clientTop + y + viewport.clientHeight / 2,
            shiftKey: opt_shiftKey,
            preventDefault() {},
            pointerType: 'mouse',
            pointerId: opt_pointerId,
            isPrimary: true,
            button: 0,
        }

        const simulatedEvent = new MapBrowserEvent(type, map, event)
        map.handleMapBrowserEvent(simulatedEvent)
    }
)

Cypress.Commands.add('addProfileJsonFixture', (mockupData) => {
    if (Array.isArray(mockupData)) {
        cy.mockupBackendResponse('rest/services/profile.json**', mockupData, 'profile')
    } else {
        cy.intercept('rest/services/profile.json**', {
            fixture: 'service-alti/profile.fixture.json',
        }).as('profile')
    }
})
