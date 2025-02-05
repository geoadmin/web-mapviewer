import 'cypress-real-events'
import 'cypress-wait-until'
import '@4tw/cypress-drag-drop'
import { isNumber, randomIntBetween } from 'geoadmin/numbers'
import { LV95, registerProj4, WEBMERCATOR, WGS84 } from 'geoadmin/proj'
import { MapBrowserEvent } from 'ol'
import proj4 from 'proj4'

import { FAKE_URL_CALLED_AFTER_ROUTE_CHANGE } from '@/router/storeSync/storeSync.routerPlugin'

import { getDefaultFixturesAndIntercepts } from './intercepts'
import { isMobile } from './utils'

registerProj4(proj4)

// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/**
 * Geolocation mockup
 *
 * @param {Cypress.AUTWindow} win - A reference to the window object.
 * @param {Object} options - Configuration object for the mock geolocation.
 * @param {number} [options.latitude=47] - The latitude to use for the mock position. Default is
 *   `47`
 * @param {number} [options.longitude=7] - The longitude to use for the mock position. Default is
 *   `7`
 * @param {number} [options.errorCode=null] - The error code to simulate, if any. Default is `null`
 * @see https://github.com/cypress-io/cypress/issues/2671
 */
const mockGeolocation = (win, options) => {
    const { latitude = 47, longitude = 7, errorCode = null } = options

    if (errorCode) {
        const error = { code: errorCode, message: 'Error' }

        cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((_, errorCallback) => {
            errorCallback(error)
        })

        cy.stub(win.navigator.geolocation, 'watchPosition').callsFake((_, errorCallback) => {
            errorCallback(error)
        })
    } else {
        const coords = { latitude, longitude }
        const handler = (callback) => callback({ coords })
        cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake(handler)
        cy.stub(win.navigator.geolocation, 'watchPosition').callsFake(handler)
    }
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
        geolocationMockupOptions = { latitude: 47, longitude: 7, errorCode: null },
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
        if (
            !['lat', 'lon', 'x', 'y', 'center', '3d'].some((unwantedKey) =>
                Object.keys(queryParams).includes(unwantedKey)
            )
        ) {
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

/**
 * Click on the map at the given coordinates
 *
 * @param {string} selector The selector of the element
 * @param {Number} x X coordinate
 * @param {Number} y Y coordinate
 * @param {Number} button Mouse button to use
 * @see https://docs.cypress.io/api/commands/trigger#Trigger-a-mousedown-from-a-specific-mouse-button
 */
Cypress.Commands.add('dragMouse', (selector, x, y, button = 0) => {
    cy.get(selector).trigger('mousedown', { button })
    cy.get(selector).trigger('mousemove', { button, clientX: 0, clientY: 0 }) // this is needed to make the drag work
    cy.get(selector).trigger('mousemove', { button, clientX: x, clientY: y })
    cy.get(selector).trigger('mouseup', { button })
})

/**
 * Resize an element by dragging the bottom right corner If using the startXY coordinates, the
 * startPosition should be undefined and the same for endXY X and Y coordinates are relative to the
 * top left corner of the element
 *
 * @param {Object} options - Options for resizing.
 * @param {string} options.selector - The selector of the element.
 * @param {string} options.startPosition - The start position for dragging.
 * @param {string} options.endPosition - The end position for dragging.
 * @param {Object} options.startXY - The start coordinates for dragging.
 * @param {Object} options.endXY - The end coordinates for dragging.
 * @param {string} options.button - Mouse button to use.
 * @see https://github.com/dmtrKovalenko/cypress-real-events?tab=readme-ov-file#cyrealmousedown
 * @see https://github.com/dmtrKovalenko/cypress-real-events/blob/main/src/commands/mouseDown.ts
 */
Cypress.Commands.add(
    'resizeElement',
    ({
        selector = '',
        startPosition = 'bottomRight',
        endPosition = undefined,
        startXY = undefined,
        endXY = { x: 100, y: 100 },
        button = 'left',
    } = {}) => {
        cy.get(selector).realMouseDown({
            button,
            ...(startXY ? { x: startXY.x, y: startXY.y } : { position: startPosition }),
        })
        cy.get(selector).realMouseDown({
            button,
            ...(endPosition ? { position: endPosition } : { x: endXY.x, y: endXY.y }),
        })
        cy.get(selector).realMouseUp({ button })
    }
)

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
                Cypress.log({
                    nane: 'changeUrlParam',
                    message: `router location changed from ${vueRouterHistory.location} to ${newLocation}`,
                    consoleProps() {
                        return {
                            oldLocation: vueRouterHistory.location,
                            newLocation,
                        }
                    },
                })
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
    if (isMobile()) {
        cy.readStoreValue('state.ui.showMenu').then((isMenuCurrentlyOpen) => {
            if (!isMenuCurrentlyOpen) {
                cy.get('[data-cy="menu-button"]').click()
            }
        })
        cy.get('[data-cy="mobile-lang-selector"]').select(lang)
    } else {
        // desktop
        cy.get(`[data-cy="menu-lang-${lang}"]`).click()
    }
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
    return cy.window({ timeout: 15000 }).its(key)
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

// Reads a value from clipboard
Cypress.Commands.add('readClipboardValue', () => {
    // checking first that we have browser permissions to read the clipboard
    cy.window()
        .its('navigator.permissions')
        .then((permissions) => permissions.query({ name: 'clipboard-read' }))
        .its('state')
        .should('eq', 'granted')
    return cy
        .window()
        .its('navigator.clipboard')
        .then((clip) => cy.wrap(clip.readText()))
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
        Cypress.log({
            name: 'simulateEvent',
            message: `simulating ${type} at [${x}, ${y}]`,
            consoleProps() {
                return {
                    type,
                    x,
                    y,
                    opt_shiftKey,
                    opt_pointerId,
                }
            },
        })

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

Cypress.Commands.add('waitUntilCesiumTilesLoaded', () => {
    cy.wait(
        [
            '@cesiumTerrainConfig',
            '@cesiumTerrainTile',
            '@cesiumTerrainTile',
            '@cesiumTileset',
            '@cesiumTileset',
            '@cesiumTile',
            '@cesiumTile',
        ],
        // the timeout is increased to allow to run the test locally on
        // which cesium is much slower
        { timeout: 20000 }
    )
})

Cypress.Commands.add('openMenuIfMobile', () => {
    if (isMobile()) {
        cy.readStoreValue('state.ui.showMenu').then((isMenuCurrentlyOpen) => {
            if (!isMenuCurrentlyOpen) {
                cy.get('[data-cy="menu-button"]').click()
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
     * @param {String} message A message to log in case tests are skipped
     */
    (condition, message) => {
        if (condition) {
            if (message) {
                Cypress.log({
                    name: 'skipTestsIf',
                    message,
                })
            }
            const mochaContext = cy.state('runnable').ctx
            mochaContext?.skip()
        }
    }
)

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
    let layers = []
    if (typeof args === 'string' || args instanceof String) {
        layers.push({ id: args, visible: true, opacity: 1 })
    } else if (args instanceof Array) {
        layers = args.slice()
    } else if (args instanceof Object) {
        layers.push(Object.assign({}, args))
    } else {
        throw new Error(`Invalid checkOlLayer argument: ${args}`)
    }

    // validate the layers arguments
    layers = layers.map((l) => {
        if (typeof l === 'string' || l instanceof String) {
            return { id: l, visible: true, opacity: 1 }
        } else {
            if (!l.id) {
                throw new Error(`Invalid layer object ${l}: don't have an id`)
            }
            if (l.visible === undefined) {
                l.visible = true
            }
            if (l.opacity === undefined) {
                l.opacity = 1
            }
            return l
        }
    })
    const visibleLayers = layers.filter((l) => l.visible)
    const invisibleLayers = layers.filter((l) => !l.visible)

    cy.window().its('map').invoke('getAllLayers').as('olLayers')

    cy.get('@olLayers').then((olLayers) => {
        const layerIds = layers.map((l) => l.id).join(',')
        const olLayerIds = olLayers
            .toSorted((a, b) => a.get('zIndex') - b.get('zIndex'))
            .map((l) => `[${l.get('zIndex')}]:${l.get('id')}`)
            .join(',')
        Cypress.log({
            name: 'checkOlLayer',
            message: `Check if layers [${layerIds}] are set correctly in OpenLayers [${olLayerIds}]`,
            consoleProps: () => ({
                layers,
            }),
        })

        visibleLayers.forEach((layer, index) => {
            Cypress.log({
                name: 'checkOlLayer',
                message: `Check that visible layer ${layer.id} at zIndex ${index} is set correctly in OpenLayers`,
                consoleProps: () => ({
                    layer,
                    index,
                }),
            })
            const olLayer = olLayers.find(
                (l) => l.get('id') === layer.id && l.get('zIndex') === index
            )
            expect(olLayer, `[${layer.id}] layer at index ${index} not found`).not.to.be.null
            expect(olLayer, `[${layer.id}] layer at index ${index} not found`).not.to.be.undefined
            expect(olLayer.getVisible(), `[${layer.id}] layer.visible`).to.be.equal(layer.visible)
            expect(olLayer.getOpacity(), `[${layer.id}] layer.opacity`).to.be.equal(layer.opacity)
            // The rendered flag is set asynchronously; therefore, we need to do some retry here
            cy.waitUntil(() => olLayer.rendered, {
                description: `[${layer.id}] waitUntil layer.rendered`,
                errorMsg: `[${layer.id}] layer.rendered is not true`,
            })
        })
        invisibleLayers.forEach((layer) => {
            cy.get('@olLayers').then((olLayers) => {
                Cypress.log({
                    name: 'checkOlLayer',
                    message: `Check that invisible layer ${layer.id} is not set in openlayer`,
                    consoleProps: () => ({
                        layer,
                    }),
                })
                expect(
                    olLayers.find((l) => l.get('id') === layer.id),
                    `[${layer.id}] layer found`
                ).to.be.undefined
            })
        })
    })
})
