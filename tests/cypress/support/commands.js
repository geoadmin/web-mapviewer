import 'cypress-real-events'
import 'cypress-wait-until'
import '@4tw/cypress-drag-drop'

import { MapBrowserEvent } from 'ol'

import { FAKE_URL_CALLED_AFTER_ROUTE_CHANGE } from '@/router/storeSync/storeSync.routerPlugin'
import { WEBMERCATOR } from '@/utils/coordinates/coordinateSystems'
import { randomIntBetween } from '@/utils/numberUtils'

import { isMobile } from './utils'

// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

const addVueRouterIntercept = () => {
    cy.intercept(FAKE_URL_CALLED_AFTER_ROUTE_CHANGE, {
        statusCode: 200,
    }).as('routeChange')
}

const addLayerTileFixture = () => {
    // catching WMTS type URLs in web mercator and lv95
    cy.intercept(/1.0.0\/.*\/.*\/.*\/(21781|2056|3857|4326)\/\d+\/\d+\/\d+.jpe?g/, {
        fixture: '256.jpeg',
    }).as('jpeg-tiles')
    cy.intercept(/1.0.0\/.*\/.*\/.*\/(21781|2056|3857|4326)\/\d+\/\d+\/\d+.png/, {
        fixture: '256.png',
    }).as('png-tiles')
}

const addWmsLayerFixture = () => {
    // catching WMS type URLs
    cy.intercept(
        {
            method: 'GET',
            hostname: /(wms\d*\.geo\.admin\.ch|sys-wms\d*\.\w+\.bgdi\.ch)/,
            query: {
                SERVICE: 'WMS',
                REQUEST: 'GetMap',
                FORMAT: 'image/png',
            },
        },
        { fixture: 'wms-geo-admin.png' }
    ).as('wms-png')
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

const addGeoJsonIntercept = () => {
    cy.intercept('**/test.geojson.layer.json', {
        fixture: 'geojson.fixture.json',
    }).as('geojson-data')
    cy.intercept('**/vectorStyles/**', {
        fixture: 'geojson-style.fixture.json',
    }).as('geojson-style')
}

const addHtmlPopupIntercepts = () => {
    cy.intercept('**/MapServer/**/htmlPopup**', {
        fixture: 'html-popup.fixture.html',
    }).as('htmlPopup')
}

export function getDefaultFixturesAndIntercepts() {
    return {
        addVueRouterIntercept,
        addLayerTileFixture,
        addWmsLayerFixture,
        addLayerFixtureAndIntercept,
        addTopicFixtureAndIntercept,
        addCatalogFixtureAndIntercept,
        addHeightFixtureAndIntercept,
        addWhat3WordFixtureAndIntercept,
        addIconsSetIntercept,
        addDefaultIconsFixtureAndIntercept,
        addSecondIconsFixtureAndIntercept,
        addGeoJsonIntercept,
        addHtmlPopupIntercepts,
    }
}

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

/**
 * Command that visits the main view and waits for the map to be shown (for the app to be ready) All
 * parameters are optional. They can either be passed in order or inside a wrapper object.
 *
 * @param {Object} queryParams URL parameters
 * @param {Boolean} withHash Whether or not to use the new URL format (that has a hash)
 * @param {Object} geolocationMockupOptions Latitude and Longitude of faked geolocation
 * @param {Object} fixturesAndIntercepts Contains functions that overwrite the default interceptions
 *   to the backend.
 */
Cypress.Commands.add(
    'goToMapView',
    (
        queryParams = {},
        withHash = true,
        geolocationMockupOptions = { latitude: 47, longitude: 7 },
        fixturesAndIntercepts = {}
    ) => {
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

        if (!('lang' in queryParams)) {
            queryParams.lang = 'en'
        }
        if (!('center' in queryParams) && !('3d' in queryParams)) {
            // "old" MAP_CENTER constant re-projected in LV95
            queryParams.center = '2660013.5,1185172'
        } else if ('3d' in queryParams && !('sr' in queryParams)) {
            queryParams.sr = WEBMERCATOR.epsgNumber
        }
        let flattenedQueryParams = ''
        Object.entries(queryParams).forEach(([key, value]) => {
            if (typeof value === Boolean && value === true) {
                // for true boolean param, only the key is required
                flattenedQueryParams += `${key}&`
            } else {
                flattenedQueryParams += `${key}=${encodeURIComponent(value)}&`
            }
        })
        // removing trailing &
        flattenedQueryParams = flattenedQueryParams.slice(0, -1)
        flattenedQueryParams = flattenedQueryParams.length ? `?${flattenedQueryParams}` : ''

        cy.visit(`/${withHash ? '#/map' : ''}${flattenedQueryParams}`, {
            onBeforeLoad: (win) => mockGeolocation(win, geolocationMockupOptions),
        })

        // In the legacy URL, 3d is not found. We check if the map in 3d or not by checking the pitch, heading, and elevation
        const isLegacy3d =
            'pitch' in queryParams || 'heading' in queryParams || 'elevation' in queryParams
        const is3d = '3d' in queryParams && queryParams['3d'] === true

        // waiting for the app to load and layers to be configured.
        cy.waitMapIsReady({ olMap: !(is3d || isLegacy3d) })
        cy.waitAllLayersLoaded({ queryParams, legacy: !withHash })

        if (is3d || isLegacy3d) {
            cy.get('[data-cy="cesium-map"]').should('be.visible')
        } else {
            cy.get('[data-cy="ol-map"]', { timeout: 10000 }).should('be.visible')
        }
    }
)

/**
 * Command that visits the embed view and waits for the map to be shown (for the app to be ready)
 * All parameters are optional. They can either be passed in order or inside a wrapper object.
 *
 * @param {Object} queryParams URL parameters
 * @param {Boolean} legacy Whether or not to use the new URL format (that has a hash)
 * @param {Object} geolocationMockupOptions Latitude and Longitude of faked geolocation
 * @param {Object} fixturesAndIntercepts Contains functions that overwrite the default interceptions
 *   to the backend.
 */
Cypress.Commands.add(
    'goToEmbedView',
    ({
        queryParams = {},
        legacy = false,
        geolocationMockupOptions = { latitude: 47, longitude: 7 },
        fixturesAndIntercepts = {},
    } = {}) => {
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

        let flattenedQueryParams = ''
        Object.entries(queryParams).forEach(([key, value]) => {
            if (typeof value === Boolean && value === true) {
                // for true boolean param, only the key is required
                flattenedQueryParams += `${key}&`
            } else {
                flattenedQueryParams += `${key}=${encodeURIComponent(value)}&`
            }
        })
        // removing trailing &
        flattenedQueryParams = flattenedQueryParams.slice(0, -1)
        if (flattenedQueryParams.length) {
            flattenedQueryParams = legacy ? `&${flattenedQueryParams}` : `?${flattenedQueryParams}`
        }

        cy.visit(
            legacy ? `?legacyEmbed${flattenedQueryParams}` : `/#/embed${flattenedQueryParams}`,
            {
                onBeforeLoad: (win) => mockGeolocation(win, geolocationMockupOptions),
            }
        )

        // In the legacy URL, 3d is not found. We check if the map in 3d or not by checking the pitch, heading, and elevation
        const isLegacy3d =
            'pitch' in queryParams || 'heading' in queryParams || 'elevation' in queryParams
        const is3d = '3d' in queryParams && queryParams['3d'] === true

        // waiting for the app to load and layers to be configured.
        cy.waitMapIsReady({ olMap: !(is3d || isLegacy3d) })
        cy.waitAllLayersLoaded({ queryParams, legacy })

        cy.get('[data-cy="ol-map"]', { timeout: 10000 }).should('be.visible')
    }
)

/**
 * Wait until the map has been rendered and is ready. This is useful and needed during the
 * application startup phase and also after changing views that might disable click on the map like
 * for example the drawing mode
 */
Cypress.Commands.add('waitMapIsReady', ({ timeout = 20000, olMap = true } = {}) => {
    cy.waitUntilState((state) => state.app.isMapReady, { timeout: timeout })
    // We also need to wait for the pointer event to be set
    if (olMap) {
        cy.window().its('mapPointerEventReady', { timeout: timeout }).should('be.true')
    }
})

Cypress.Commands.add('waitAllLayersLoaded', ({ queryParams = {}, legacy = false } = {}) => {
    cy.waitUntilState(
        (state, getters) => {
            const active = state.layers.activeLayers.length
            // The required layers can be set via topic or manually.
            const targetTopic = getters.currentTopic?.layersToActivate.length
            let target = targetTopic
            if ('layers' in queryParams) {
                target = legacy
                    ? queryParams.layers.split(',').length // Legacy layers separates layers with `,`
                    : queryParams.layers.split(';').length
            }
            if (legacy && 'adminId' in queryParams) {
                // In legacy drawing with adminId the layer is not added to the layers parameter
                target += 1
            }
            // When handling a legacy parameter, the {bod Layer Id} parameter,
            // which has been reworked into the 'features' layer attribute might add extra
            // layers, thus the need to check if those extra layers have been added
            if (legacy) {
                const layersConfig = state.layers.config
                target += Object.keys(queryParams)
                    .filter((key) => layersConfig.find((layer) => layer.id === key)) // this removes all parameters that are not layers ids
                    .filter((key) => !queryParams.layers?.split(',').includes(key)).length // we removes all layers that are in the query params
                // filter out standard params, legacy specific params, non layers config
            }
            return active === target
        },
        {
            timeout: 15000,
            customMessage: 'all layers have been loaded',
            errorMsg: 'Timeout waiting for all layers to be loaded',
        }
    )
})

/**
 * Changes a URL parameter without reloading the app.
 *
 * Help when you want to change a value in the URL but don't want the whole app be reloaded from
 * scratch in the process.
 *
 * @param {string} urlParamName URL param name (present or not in the URL, will be added or
 *   overwritten)
 * @param {string} urlParamValue The new URL param value we want to have
 * @param {number} amountOfExpectedStoreDispatches The number of dispatches this change in the URL
 *   is going to trigger. This function will then wait for this amount of dispatch in the store
 *   before letting the test go further
 */
Cypress.Commands.add(
    'changeUrlParam',
    (urlParamName, urlParamValue, amountOfExpectedStoreDispatches = 1) => {
        cy.window()
            .its('vueRouterHistory')
            .then((vueRouterHistory) => {
                // the router location will everything behind the hash sign, meaning /map?param1=...&param2=...
                const queryPart = vueRouterHistory.location.split('?')[1]
                const query = new URLSearchParams(queryPart)
                if (urlParamValue) {
                    query.set(urlParamName, urlParamValue)
                } else {
                    query.delete(urlParamName)
                }

                // We have to do the toString by hand, as if we use the standard toString all param value
                // will be encoded. And so comas will be URL encoded instead of left untouched, meaning layers, camera and
                // other params that use the coma to split values will not work.
                const unencodedQuery = Array.from(query.entries())
                    .map(([key, value]) => `${key}=${value}`)
                    .reduce((param1, param2) => `${param1}${param2}&`, '?')
                    // removing the trailing & resulting of the reduction above
                    .slice(0, -1)
                // regenerating the complete router location
                const newLocation = `${vueRouterHistory.location.split('?')[0]}${unencodedQuery}`
                cy.log('router location changed from', vueRouterHistory.location, 'to', newLocation)
                cy.window()
                    .its('vueRouter')
                    .then((vueRouter) => {
                        vueRouter.push(newLocation)
                        for (let i = 0; i < amountOfExpectedStoreDispatches; i++) {
                            cy.wait('@routeChange')
                        }
                    })
            })
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
    if (isMobile()) {
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
Cypress.Commands.add('waitUntilState', (predicate, options = {}) => {
    cy.waitUntil(
        () =>
            cy.window({ log: false }).then((win) => predicate(win.store.state, win.store.getters)),
        Object.assign(
            {
                errorMsg:
                    '"waitUntilState" failed, as the following predicate stayed false: ' +
                    predicate.toString(),
                customMessage: `predicate ${predicate.toString()} is true`,
            },
            options
        )
    )
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

        cy.get($element).click()
        cy.get($element).then(() => {
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

/**
 * @typedef MapEvent
 * @param {string} type Event type.
 * @param {number} x Horizontal offset from map center.
 * @param {number} y Vertical offset from map center.
 * @param {boolean} [opt_shiftKey] Shift key is pressed.
 */

/**
 * This function has been taken from the OL draw spec. Simulates a browser event on the map
 * viewport. The client x/y location will be adjusted as if the map were centered at 0,0.
 *
 * @param {MapEvent[]} events Events to be fired on the map.
 */
Cypress.Commands.add('simulateEventsOnMap', { prevSubject: false }, (events) => {
    cy.readWindowValue('map').then((map) => {
        const viewport = map.getViewport()

        events.forEach((event) => {
            const { type = 'click', x = 0, y = 0, opt_shiftKey = false } = event

            const eventLocation = {
                x: viewport.clientLeft + x + viewport.clientWidth / 2,
                y: viewport.clientTop + y + viewport.clientHeight / 2,
            }
            cy.log(
                `simulating ${type} on map at [${x}, ${y}] relative to center, meaning [${eventLocation.x}, ${eventLocation.y}]`
            )

            const simulatedEvent = new MapBrowserEvent(type, map, {
                type,
                target: viewport.firstChild,
                clientX: eventLocation.x,
                clientY: eventLocation.y,
                shiftKey: opt_shiftKey,
                preventDefault() {},
                pointerType: 'mouse',
                pointerId: 0,
                isPrimary: true,
                isTrusted: true,
                button: 0,
            })
            map.handleMapBrowserEvent(simulatedEvent)
        })
    })
})

Cypress.Commands.add('addProfileJsonFixture', (mockupData) => {
    if (Array.isArray(mockupData)) {
        cy.mockupBackendResponse('rest/services/profile.json**', mockupData, 'profile')
    } else {
        cy.intercept('rest/services/profile.json**', {
            fixture: 'service-alti/profile.fixture.json',
        }).as('profile')
    }
})

Cypress.Commands.add('waitUntilCesiumTilesLoaded', () => {
    cy.window().its('cesiumIsReady').should('be.true')
})

Cypress.Commands.add('openMenuIfMobile', () => {
    if (isMobile()) {
        cy.readStoreValue('state.ui.showMenu').then((isMenuCurrentlyOpen) => {
            if (!isMenuCurrentlyOpen) {
                cy.get('[data-cy="menu-button"]:visible').click()
            }
            // waiting on the animation to finish by grabbing the content of the menu and assessing its visibility
            cy.get('[data-cy="menu-tray-inner"]').should('be.visible')
        })
    }
})

Cypress.Commands.add('closeMenuIfMobile', () => {
    if (isMobile()) {
        cy.readStoreValue('state.ui.showMenu').then((isMenuCurrentlyOpen) => {
            if (isMenuCurrentlyOpen) {
                cy.get('[data-cy="menu-button"]').click()
            }
            // waiting on the animation to finish by grabbing the content of the menu and assessing its (in)visibility
            cy.get('[data-cy="menu-tray"]').should('not.be.visible')
        })
    }
})

/**
 * Returns a timestamp from the layer's config that is different from the default behaviour
 *
 * @param {Object} layer A layer's metadata, that usually come from the fixture layers.fixture.json
 * @returns {String} One of the layer's timestamp, different from the default one (not equal to
 *   `timeBehaviour`)
 */
Cypress.Commands.add('getRandomTimestampFromSeries', (layer) => {
    expect(layer).to.be.an('Object')
    expect(layer).to.haveOwnProperty('timeBehaviour')
    expect(layer).to.haveOwnProperty('timestamps')
    expect(layer.timestamps).to.be.an('Array')
    expect(layer.timestamps.length).to.be.greaterThan(1)
    const defaultTimestamp = layer.timeBehaviour
    let randomTimestampFromLayer = defaultTimestamp
    do {
        randomTimestampFromLayer =
            layer.timestamps[randomIntBetween(0, layer.timestamps.length - 1)]
    } while (randomTimestampFromLayer === defaultTimestamp)
    return randomTimestampFromLayer
})

Cypress.Commands.add('openLayerSettings', (layerId) => {
    cy.get(`[data-cy^="div-layer-settings-${layerId}-"]`).should('be.hidden')
    cy.get(`[data-cy^="button-open-visible-layer-settings-${layerId}-"]`)
        .should('be.visible')
        .click()
    cy.get(`[data-cy^="div-layer-settings-${layerId}-"]`).should('be.visible')
})

Cypress.Commands.add(
    'skipTestsIf',
    /**
     * Will skip this test (or all tests if this is run inside a context/describe) when the
     * condition is true.
     *
     * @param {Boolean} condition
     * @param {String} message A message to cy.log in case tests are skipped
     */
    (condition, message) => {
        if (condition) {
            if (message) {
                cy.log(message)
            }
            const mochaContext = cy.state('runnable').ctx
            mochaContext?.skip()
        }
    }
)

function parseCheckLayerArgs(args) {
    let layers = []
    if (typeof args === 'string' || args instanceof String) {
        layers.push({ id: args, visible: true, opacity: 1 })
    } else if (args instanceof Array) {
        layers = args.slice()
    } else if (args instanceof Object) {
        layers.push(Object.assign({}, args))
    } else {
        throw new Error(`Invalid check layer argument: ${args}`)
    }

    // validate the layers arguments
    layers = layers.map((l) => {
        if (typeof l === 'string' || l instanceof String) {
            return { id: l, visible: true, opacity: 1 }
        } else {
            if (!l.id) {
                throw new Error(`Invalid layer object ${l}: don't have an id`)
            }
            // if layer is missing either keys visible or opacity, we set some default values
            if (!Object.keys(l).some((key) => key === 'visible')) {
                l.visible = true
            }
            if (!Object.keys(l).some((key) => key === 'opacity')) {
                l.opacity = 1
            }
            return l
        }
    })
    const visibleLayers = layers.filter((l) => l.visible)
    const invisibleLayers = layers.filter((l) => !l.visible)

    return {
        visibleLayers,
        invisibleLayers,
        layers,
    }
}

/**
 * Check if the layer(s) have been successfully added and rendered on Open Layer Map.
 *
 * It also checks that the layer are at the correct zIndex
 *
 * NOTE: don't forget to add the background layer in the layer list
 *
 * @param {String
 *     | { id: String; opacity?: Number; visible?: Boolean }
 *     | [String]
 *     | [{ id: String }]
 *     | [{ id: String; opacity?: Number; visible?: Boolean }]} args
 *   Layer(s) to check
 */
Cypress.Commands.add('checkOlLayer', (args = null) => {
    const { layers, visibleLayers, invisibleLayers } = parseCheckLayerArgs(args)

    cy.window().its('map').invoke('getAllLayers').as('olLayers')

    cy.get('@olLayers').then((olLayers) => {
        const layerIds = layers.map((l) => l.id).join(',')
        const olLayerIds = olLayers
            .toSorted((a, b) => a.get('zIndex') - b.get('zIndex'))
            .map((l) => `[${l.get('zIndex')}]:${l.get('id')}`)
            .join(',')
        cy.log(`Check if layers [${layerIds}] are set correctly in openlayer [${olLayerIds}]`)
    })

    // Here in order to have the cy.log() working as expected we need to do the loop outside the
    // cy.get('@olLayers')
    visibleLayers.forEach((layer, index) => {
        cy.get('@olLayers').then((olLayers) => {
            cy.log(
                `Check that visible layer ${layer.id} at zIndex ${index} is set correctly in openlayer`
            )
            const olLayer = olLayers.find(
                (l) => l.get('id') === layer.id && l.get('zIndex') === index
            )
            expect(olLayer, `[${layer.id}] layer at index ${index} not found`).not.to.be.null
            expect(olLayer, `[${layer.id}] layer at index ${index} not found`).not.to.be.undefined
            expect(olLayer.getVisible(), `[${layer.id}] layer.visible`).to.be.equal(layer.visible)
            expect(olLayer.getOpacity(), `[${layer.id}] layer.opacity`).to.be.equal(layer.opacity)
            // The rendered flag is set asynchronously therefore we need to do some retry here
            cy.waitUntil(() => olLayer.rendered, {
                description: `[${layer.id}] waitUntil layer.rendered`,
                errorMsg: `[${layer.id}] layer.rendered is not true`,
            })
        })
    })
    invisibleLayers.forEach((layer) => {
        cy.get('@olLayers').then((olLayers) => {
            cy.log(`Check that invisible layer ${layer.id} is not set in openlayer`)
            expect(
                olLayers.find((l) => l.get('id') === layer.id),
                `[${layer.id}] layer found`
            ).to.be.undefined
        })
    })
})

Cypress.Commands.add('checkCesiumLayer', (args = null) => {
    const { layers, visibleLayers } = parseCheckLayerArgs(args)

    cy.window().its('cesiumViewer.scene.imageryLayers').as('cesiumImageryLayers')
    cy.get('@cesiumImageryLayers').then((imageryLayers) => {
        const layerIds = layers.map((l) => l.id)
        const cesiumLayerIds = layerIds
            .map((id, index) => `[${index}]:${imageryLayers.get(index)?.id}`)
            .join(',')
        cy.log(
            `Check if layers [${layerIds.join(',')}] are set correctly in Cesium [${cesiumLayerIds}]`
        )
    })

    // Here in order to have the cy.log() working as expected we need to do the loop outside the
    // cy.get('@cesiumImageryLayers')
    visibleLayers.forEach((layer, index) => {
        cy.get('@cesiumImageryLayers').then((imageryLayers) => {
            cy.log(
                `Check that visible layer ${layer.id} at zIndex ${index} is set correctly in Cesium`
            )
            const cesiumlayer = imageryLayers.get(index)
            expect(cesiumlayer, `[${layer.id}] layer at index ${index} not found`).not.to.be.null
            expect(cesiumlayer, `[${layer.id}] layer at index ${index} not found`).not.to.be
                .undefined
            expect(cesiumlayer.show, `[${layer.id}] layer.visible`).to.be.equal(layer.visible)
            expect(cesiumlayer.alpha, `[${layer.id}] layer.opacity`).to.be.equal(layer.opacity)
            // The rendered flag is set asynchronously therefore we need to do some retry here
            cy.waitUntil(() => cesiumlayer.ready, {
                description: `[${layer.id}] waitUntil layer.ready`,
                errorMsg: `[${layer.id}] layer.ready is not true`,
            })
        })
    })
})

/**
 * @property {[Number, Number]} coordinate
 * @property {'auto-center' | 'in-place'} [behavior='auto-center'] Default is `'auto-center'`
 */
Cypress.Commands.add('clickOlMapAtCoordinate', (coordinate, options = {}) => {
    const { doubleClick = false, behavior = 'auto-center' } = options
    if (behavior === 'auto-center') {
        cy.changeUrlParam('center', coordinate.join(','))
        cy.log('Clicking at coordinate', coordinate, 'on map center with options', options)
        if (doubleClick) {
            cy.get('[data-cy="ol-map"]:visible').dblclick('center', { ...options })
        } else {
            cy.get('[data-cy="ol-map"]:visible').click('center', { ...options })
        }
    } else {
        cy.readWindowValue('map').then((map) => {
            const pixel = map.getPixelFromCoordinate(coordinate).map(Math.floor)
            if (pixel.some((value) => value < 0)) {
                cy.log(
                    'Error, coordinate',
                    coordinate,
                    ' are outside current map viewport (',
                    pixel,
                    '), cannot click on these coordinate'
                )
                cy.wrap(false).should('be.true')
            } else {
                cy.log(
                    'Clicking at coordinate',
                    coordinate,
                    'on pixel',
                    pixel,
                    'with options',
                    options
                )
                if (doubleClick) {
                    cy.get('[data-cy="ol-map"]:visible').dblclick(pixel[0], pixel[1], {
                        ...options,
                    })
                } else {
                    cy.get('[data-cy="ol-map"]:visible').click(pixel[0], pixel[1], { ...options })
                }
            }
        })
    }
})
