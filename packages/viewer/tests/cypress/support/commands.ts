import 'cypress-real-events'
import 'cypress-wait-until'
import '@4tw/cypress-drag-drop'
import type { GeoAdminLayer } from '@swissgeo/layers'
import type { Layer as OLLayer } from 'ol/layer'
import type { Pinia } from 'pinia'

import { registerProj4, WEBMERCATOR } from '@swissgeo/coordinates'
import { randomIntBetween } from '@swissgeo/numbers'
import proj4 from 'proj4'

import useAppStore from '@/store/modules/app'
import useLayersStore from '@/store/modules/layers'
import useTopicsStore from '@/store/modules/topics'
import useUIStore from '@/store/modules/ui'

import type { InterceptCallback } from './intercepts'

import { getDefaultFixturesAndIntercepts } from './intercepts'
import { isMobile } from './utils'

registerProj4(proj4)

// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

interface GeolocationMockupOptions {
    latitude: number
    longitude: number
    errorCode?: number
}

export interface GoToViewOptions {
    /** URL parameters */
    queryParams?: Record<string, string | number | boolean>
    /** Whether to use the new URL format (that has a hash) */
    withHash?: boolean
    /** Latitude and Longitude of faked geolocation */
    geolocationMockupOptions?: GeolocationMockupOptions
    /** Overrides for default interceptions to the backend. */
    fixturesAndIntercepts?: Record<string, InterceptCallback>
    /** Whether to use the legacy (vue-router) view */
    legacy?: boolean
}

/**
 * Geolocation mockup
 *
 * @param win - A reference to the window object.
 * @param options Configuration object for the mock geolocation.
 * @param options.latitude The latitude to use for the mock position. Default is `47`
 * @param options.longitude The longitude to use for the mock position. Default is `7`
 * @param options.errorCode The error code to simulate, if any.
 * @see https://github.com/cypress-io/cypress/issues/2671
 */
function mockGeolocation(win: Cypress.AUTWindow, options?: GeolocationMockupOptions): void {
    const { latitude = 47, longitude = 7, errorCode } = options ?? {}

    if (errorCode) {
        const error = { code: errorCode, message: 'Error' }

        cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((_, errorCallback) => {
            errorCallback(error)
        })

        cy.stub(win.navigator.geolocation, 'watchPosition').callsFake((_, errorCallback) => {
            errorCallback(error)
        })
    } else {
        // We set accuracy here to mimic a real geolocation API response
        const coords = { latitude, longitude, accuracy: 100 }
        // eslint-disable-next-line no-unused-vars
        const handler: (callback: (...args: unknown[]) => unknown) => void = (callback) =>
            callback({ coords })
        cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake(handler)
        cy.stub(win.navigator.geolocation, 'watchPosition').callsFake(handler)
    }
}

function waitAllLayersLoaded(options?: {
    queryParams?: Record<string, unknown>
    legacy?: boolean
}) {
    const { queryParams = {}, legacy = false } = options ?? {}
    cy.waitUntilState(
        (pinia: Pinia) => {
            const layersStore = useLayersStore(pinia)
            const topicsStore = useTopicsStore(pinia)
            const active = layersStore.activeLayers.length
            // The required layers can be set via topic or manually.
            const targetTopic = topicsStore.currentTopic?.layersToActivate.length
            let target: number = targetTopic ?? 0
            if ('layers' in queryParams) {
                const layers: string = queryParams.layers as string
                target = layers.split(legacy ? ',' : ';').length
            }
            if (legacy && 'adminId' in queryParams) {
                // In legacy drawing with adminId the layer is not added to the layers parameter
                target += 1
            }
            // When handling a legacy parameter, the {bod Layer Id} parameter,
            // which has been reworked into the 'features' layer attribute might add extra
            // layers, thus the need to check if those extra layers have been added
            if (legacy && 'layers' in queryParams) {
                const layers: string = queryParams.layers as string
                const layersConfig = layersStore.config
                target += Object.keys(queryParams)
                    .filter((key) => layersConfig.find((layer: GeoAdminLayer) => layer.id === key)) // this removes all parameters that are not layers ids
                    .filter((key) => !layers.split(',').includes(key)).length // we removes all layers that are in the query params
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
    // no explicit index as the waitUntilState will print an index message
}

function goToView(view: 'embed' | 'map', options?: GoToViewOptions): void {
    const {
        queryParams = {},
        withHash = true,
        geolocationMockupOptions = { latitude: 47, longitude: 7 },
        fixturesAndIntercepts = {},
        legacy = !withHash,
    } = options ?? {}
    // Intercepts passed as parameters to "fixturesAndIntercepts" will overwrite the correspondent
    // default intercept.
    const defIntercepts = getDefaultFixturesAndIntercepts()
    const intercepts = fixturesAndIntercepts
    for (const intercept in defIntercepts) {
        let interceptCallback: InterceptCallback = defIntercepts[intercept]!
        if (intercept in intercepts) {
            interceptCallback = intercepts[intercept]!
        }
        interceptCallback()
    }

    if (!('lang' in queryParams)) {
        queryParams.lang = 'en'
    }

    if (
        !['lat', 'lon', 'x', 'y', 'center', '3d', 'swisssearch'].some((unwantedKey) =>
            Object.keys(queryParams).includes(unwantedKey)
        )
    ) {
        // "old" MAP_CENTER constant re-projected in LV95
        queryParams.center = '2660013.5,1185172'
    } else if ('3d' in queryParams && !('sr' in queryParams)) {
        queryParams.sr = WEBMERCATOR.epsgNumber
    }
    let flattenedQueryParams: string = ''
    Object.entries(queryParams).forEach(([key, value]) => {
        if (typeof value === 'boolean') {
            if (value) {
                // for true boolean param, only the key is required
                flattenedQueryParams += `${key}&`
            }
        } else {
            flattenedQueryParams += `${key}=${encodeURIComponent(`${value}`)}&`
        }
    })
    // removing trailing &
    flattenedQueryParams = flattenedQueryParams.slice(0, -1)
    flattenedQueryParams = flattenedQueryParams.length ? `?${flattenedQueryParams}` : ''

    // Granting permission to use the clipboard (Chrome doesn't allow by default on the CI)
    // see https://github.com/cypress-io/cypress/issues/8957#issuecomment-1598395348
    cy.wrap(
        Cypress.automation('remote:debugger:protocol', {
            command: 'Browser.grantPermissions',
            params: {
                permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'],
                origin: window.location.origin,
            },
        })
    )
    // this is only required once (it will stay between test cases)
    if (!hasForwardedPostMessage) {
        // Forwarding postMessage events that Cypress normally blocks, so that we may listen to
        // our own gaMapReady event
        cy.window().then((win) => {
            win.top?.addEventListener('message', (e) => {
                // Some tests are using different cy.origin (like when loading a feature detail from the backend).
                // In these cases forwarding PostMessage events will result in errors
                // being thrown, because of some CORS reasons.
                // So for Cypress not to fail tests on uncaught error, we wrap the forwarding in a try...catch block
                try {
                    win.postMessage({ ...e.data }, '*')
                } catch (error) {
                    cy.log('[PostMessage] could not forward postMessage event', error)
                }
            })
        })
        hasForwardedPostMessage = true
    }
    let routerView: string = view
    if (legacy) {
        routerView = 'legacy'
        if (view === 'embed') {
            routerView += '-embed'
        }
    }
    cy.visit(`/${withHash ? `#/${routerView}` : ''}${flattenedQueryParams}`, {
        onBeforeLoad: (win) => {
            // initializing the spy every time the app is loaded
            const mapReadyEvent = cy.spy().as('mapReadyEvent')
            // hooking ourselves into the PostMessage API generated by our app
            win.addEventListener('message', (event) => {
                if (event?.data?.type === 'gaMapReady') {
                    mapReadyEvent(event)
                }
            })
            mockGeolocation(win, geolocationMockupOptions)
        },
    })

    cy.get('@mapReadyEvent').should('have.been.calledOnce')
    // In the legacy URL, 3d is not found. We check if the map in 3d or not by checking the pitch, heading, and elevation
    const isLegacy3d =
        'pitch' in queryParams || 'heading' in queryParams || 'elevation' in queryParams
    const is3d = '3d' in queryParams && queryParams['3d'] === true

    // waiting for the app to load and layers to be configured.
    const isDrawingActive =
        (legacy && 'adminId' in queryParams) ||
        (queryParams.layers?.toString().includes('adminId=') ?? false)
    cy.waitMapIsReady({
        olMap: !(is3d || isLegacy3d),
        expectPointerReady: !isDrawingActive,
    })
    waitAllLayersLoaded({ queryParams, legacy })

    if (is3d || isLegacy3d) {
        cy.get('[data-cy="cesium-map"]').should('be.visible')
    } else {
        cy.get('[data-cy="ol-map"]', { timeout: 10000 }).should('be.visible')
    }

    cy.log(`cmd: go to ${view} view successful`)
}

let hasForwardedPostMessage = false

Cypress.Commands.add('goToMapView', (options) => {
    goToView('map', options)
})

Cypress.Commands.add('goToEmbedView', (options) => {
    goToView('embed', options)
})

Cypress.Commands.add(
    'waitMapIsReady',
    ({ timeout = 20000, olMap = true, expectPointerReady = true } = {}) => {
        cy.waitUntilState(
            (pinia: Pinia) => {
                const appStore = useAppStore(pinia)
                return appStore.isMapReady
            },
            { timeout: timeout }
        )
        // We also need to wait for the pointer event to be set
        if (olMap) {
            cy.window()
                .its('mapPointerEventReady', { timeout: timeout })
                .should('eq', expectPointerReady)
        }
        cy.log('cmd: waitMapIsReady successful')
    }
)

Cypress.Commands.add('clickOnLanguage', (lang) => {
    if (isMobile()) {
        cy.getPinia().then((pinia) => {
            const uiStore = useUIStore(pinia)
            if (!uiStore.showMenu) {
                cy.get('[data-cy="menu-button"]').click()
            }
        })
        cy.get('[data-cy="mobile-lang-selector"]').select(lang)
    } else {
        // desktop
        cy.get(`[data-cy="menu-lang-${lang}"]`).click()
    }
    cy.log('cmd: clickOnLanguage successful')
})

Cypress.Commands.add('waitUntilState', (predicate: (_pinia: Pinia) => boolean, options) => {
    cy.waitUntil(
        () =>
            cy.window({ log: false }).then((win: Cypress.AUTWindow) => {
                if (!win.store) {
                    return false
                }
                return predicate(win.store)
            }),
        Object.assign(
            {
                errorMsg:
                    '"waitUntilState" failed, as the following predicate stayed false: ' +
                    predicate.toString(),
                customMessage: `predicate ${predicate.toString()} is true`,
            },
            options ?? {}
        )
    )

    // no cy.index command as the waitUntil will already print a message
})

Cypress.Commands.add('getPinia', () => {
    return cy.window().then((win) => {
        return win.store
    })
})

// from https://github.com/cypress-io/cypress/issues/1123#issuecomment-672640129
Cypress.Commands.add(
    'paste',
    {
        prevSubject: 'element',
    },
    ($element, text) => {
        const subString = text.substring(0, text.length - 1)
        const lastChar = text.slice(-1)

        $element.text(subString)
        $element.val(subString)
        return cy.wrap($element).type(lastChar)
    }
)

Cypress.Commands.add('readClipboardValue', () => {
    // checking first that we have browser permissions to read the clipboard
    cy.window()
        .its('navigator.permissions')
        .then((permissions) => permissions.query({ name: 'clipboard-read' }))
        .its('state')
        .should('eq', 'granted')
    // ensure the document is focused; clipboard.readText requires a focused document
    // if not focused, click on the body to force focus (works in headless and headed runs)
    cy.document().then((doc) => {
        if (!doc.hasFocus()) {
            // click at 0,0 to avoid moving the mouse location used by tests
            cy.get('body').click(0, 0, { force: true })
        }
    })
    return cy
        .window()
        .its('navigator.clipboard')
        .then((clip) => cy.wrap(clip.readText()))
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

    cy.log('cmd: waitUntilCesiumTilesLoaded successful')
})

Cypress.Commands.add('openMenuIfMobile', () => {
    cy.log(`cmd: openMenuIfMobile entered, isMobile: ${isMobile()}`)
    if (isMobile()) {
        cy.getPinia().then((pinia) => {
            const uiStore = useUIStore(pinia)
            if (!uiStore.isMenuTrayShown) {
                cy.get('[data-cy="menu-button"]').click()
            }
            cy.get('[data-cy="menu-tray-inner"]').should('be.visible')
        })
    }
    cy.log('cmd: openMenuIfMobile successful')
})

Cypress.Commands.add('closeMenuIfMobile', () => {
    cy.log(`cmd: closeMenuIfMobile entered, isMobile: ${isMobile()}`)
    if (isMobile()) {
        cy.getPinia().then((pinia) => {
            const uiStore = useUIStore(pinia)
            if (uiStore.isMenuTrayShown) {
                cy.get('[data-cy="menu-button"]').click()
            }
            cy.get('[data-cy="menu-tray-inner"]').should('not.be.visible')
        })
    }
    cy.log('cmd: closeMenuIfMobile successful')
})

Cypress.Commands.add('getRandomTimestampFromSeries', (layer) => {
    expect(layer).to.be.an('Object')
    expect(layer).to.haveOwnProperty('timeBehaviour')
    expect(layer).to.haveOwnProperty('timestamps')
    expect(layer.timestamps).to.be.an('Array')
    expect(layer.timestamps!.length).to.be.greaterThan(1)
    const defaultTimestamp = layer.timeBehaviour
    let randomTimestampFromLayer = defaultTimestamp
    do {
        randomTimestampFromLayer =
            layer.timestamps![randomIntBetween(0, layer.timestamps!.length - 1)]
    } while (randomTimestampFromLayer === defaultTimestamp)
    return cy.wrap(randomTimestampFromLayer)
})

Cypress.Commands.add('openLayerSettings', (layerId) => {
    cy.get(`[data-cy^="div-layer-settings-${layerId}-"]`).should('not.exist')
    cy.get(`[data-cy^="button-open-visible-layer-settings-${layerId}-"]:visible`).click({
        force: true,
    })

    cy.get(`[data-cy^="button-open-visible-layer-settings-${layerId}-"]`)
        // move the mouse out of the way, otherwise the tooltip of the text-truncate
        // is still active and might cover something
        .trigger('mousemove', -15, -15, { force: true })
    cy.get(`[data-cy^="div-layer-settings-${layerId}-"]`).should('be.visible')

    cy.log('cmd: openLayerSettings successful')
})

export interface PartialLayer {
    id: string
    opacity?: number
    isVisible?: boolean
}

Cypress.Commands.add('checkOlLayer', (args) => {
    let layers: PartialLayer[] = []
    if (!args) {
        throw new Error(`Invalid checkOlLayer argument: ${args}`)
    }
    if (Array.isArray(args)) {
        layers = args.slice().map((arg) => {
            if (typeof arg === 'string') {
                return { id: arg, visible: true, opacity: 1 }
            } else {
                return arg
            }
        })
    } else if (typeof args === 'string') {
        layers.push({ id: args, isVisible: true, opacity: 1 })
    } else {
        layers.push(Cypress._.cloneDeep(args))
    }
    layers = layers.map((l) => {
        if (!l.id) {
            throw new Error(`Invalid layer object ${JSON.stringify(l)}: don't have an id`)
        }
        if (l.isVisible === undefined) {
            l.isVisible = true
        }
        if (l.opacity === undefined) {
            l.opacity = 1
        }
        return l
    })
    const visibleLayers: PartialLayer[] = layers.filter((l) => l.isVisible)
    const invisibleLayers: PartialLayer[] = layers.filter((l) => !l.isVisible)
    cy.window()
        .its('map')
        .invoke('getAllLayers')
        .then((olLayers: OLLayer[]) => {
            const layerIds = layers.map((l) => l.id).join(',')
            const olLayerIds = olLayers
                .toSorted((a: OLLayer, b: OLLayer) => a.get('zIndex') - b.get('zIndex'))
                .map((l: OLLayer) => `[${l.get('zIndex')}]:${l.get('id')}`)
                .join(',')
            Cypress.log({
                name: 'checkOlLayer',
                message: `Check if layers [${layerIds}] are set correctly in OpenLayers [${olLayerIds}]`,
                consoleProps: () => ({
                    layers,
                }),
            })
            visibleLayers.forEach((layer: PartialLayer, index: number) => {
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
                expect(olLayer, `[${layer.id}] layer at index ${index} not found`).not.to.be
                    .undefined
                expect(olLayer!.getVisible(), `[${layer.id}] layer.isVisible`).to.be.equal(
                    layer.isVisible
                )
                expect(olLayer!.getOpacity(), `[${layer.id}] layer.opacity`).to.be.equal(
                    layer.opacity
                )
                // The rendered flag is set asynchronously; therefore, we need to do some retry here
                // Also, the rendered flag is protected, so we're checking if it is set with a getRenderSource().getState()
                // function, which returns false as long as either there is no renderer, or the rendered
                // flag is false
                cy.waitUntil(
                    () => {
                        return olLayer?.getRenderSource()?.getState() === 'ready'
                    },
                    {
                        description: `[${layer.id}] waitUntil layer.rendered`,
                        errorMsg: `[${layer.id}] layer.rendered is not true`,
                    }
                )
            })
            invisibleLayers.forEach((layer) => {
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
    cy.log('cmd: checkOlLayer successful')
})
