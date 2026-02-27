import type { SingleCoordinate } from '@swissgeo/coordinates'
import type { Router, RouterHistory } from 'vue-router'

import { BREAKPOINT_TABLET } from '@swissgeo/staging-config/constants'

import useUIStore from '@/store/modules/ui'

export function isMobile(): boolean {
    return Cypress.config('viewportWidth') < BREAKPOINT_TABLET
}

export function assertDefined<T>(value: T | undefined | null): asserts value is NonNullable<T> {
    if (value === undefined || value === null) {
        const received = value === null ? 'null' : 'undefined'
        throw new Error(`Expected value to be defined, but got: ${received}`)
    }
}
/**
 * Changes a URL parameter without reloading the app.
 *
 * Help when you want to change a value in the URL but don't want the whole app be reloaded from
 * scratch in the process.
 *
 * @param urlParamName URL param name (present or not in the URL, will be added or overwritten)
 * @param urlParamValue The new URL param value we want to have
 * @param amountOfExpectedStoreDispatches The number of dispatches this change in the URL is going
 *   to trigger. This function will then wait for this amount of dispatch in the store before
 *   letting the test go further
 */
export function changeUrlParam(
    urlParamName: string,
    urlParamValue: string | undefined,
    amountOfExpectedStoreDispatches = 1
): void {
    cy.window()
        .its('vueRouterHistory')
        .then((vueRouterHistory: RouterHistory) => {
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
            const unencodedQuery = Array.from(query)
                .map(([key, value]: [string, string]) => `${key}=${value}`)
                .reduce((param1, param2) => `${param1}${param2}&`, '?')
                // removing the trailing & resulting of the reduction above
                .slice(0, -1)
            // regenerating the complete router location
            const newLocation = `${vueRouterHistory.location.split('?')[0]}${unencodedQuery}`
            Cypress.log({
                name: 'changeUrlParam',
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
                .then(async (vueRouter: Router) => {
                    await vueRouter.push(newLocation)
                    for (let i = 0; i < amountOfExpectedStoreDispatches; i++) {
                        cy.wait('@routeChange')
                    }
                })
        })
}

export function moveTimeSlider(x: number) {
    cy.get('[data-cy="time-slider-bar-cursor-grab"]').trigger('mousedown', { button: 0 })
    cy.get('[data-cy="time-slider-bar-cursor-grab"]').trigger('mousemove', {
        screenX: Math.abs(x),
        screenY: 0,
    })
    cy.get('[data-cy="time-slider-bar-cursor-grab"]').trigger('mouseup', { force: true })
}

export function getGeolocationButtonAndClickIt() {
    const geolocationButtonSelector = '[data-cy="geolocation-button"]'
    cy.get(geolocationButtonSelector).should('be.visible').click()
}

export function testErrorMessage(message: string) {
    const geolocationButtonSelector = '[data-cy="geolocation-button"]'
    // move the mouse away from the button because the tooltip covers the
    // error message
    cy.get(geolocationButtonSelector).trigger('mousemove', { clientX: 0, clientY: 0, force: true }) // Check error in store

    // Wait for the error to appear in the store (geolocation callbacks are async)
    cy.waitUntil(
        () => {
            return cy.getPinia().then((pinia) => {
                const uiStore = useUIStore(pinia)
                return uiStore.errors.size > 0
            })
        },
        {
            timeout: 5000,
            errorMsg: `Expected error "${message}" to appear in store within 5 seconds`,
        }
    )

    // Check error in store
    cy.getPinia().then((pinia) => {
        const uiStore = useUIStore(pinia)
        expect(uiStore.errors).to.be.a('Set')
        // Make sure this is the only error (we don't want to test other errors)
        expect(uiStore.errors.size).to.eq(1)

        const error = uiStore.errors.values().next().value
        expect(error).to.be.an('Object')
        expect(error.msg).to.eq(message)
    })
    // Check error in UI
    cy.get('[data-cy="error-window"]').should('be.visible')
    cy.get('[data-cy="error-window-close"]').should('be.visible').click() // close the error window
}

export function checkPosition(
    position: SingleCoordinate | undefined,
    expectedX: number,
    expectedY: number
) {
    expect(position).to.be.an('Array')
    expect(position.length).to.eq(2)
    expect(position[0]).to.approximately(expectedX, 0.1)
    expect(position[1]).to.approximately(expectedY, 0.1)
}

export function checkUrlParams(
    urlToCheck: string,
    expectedParams: Record<string, string>,
    expectedAbsentParams: string[] = []
): void {
    expect(urlToCheck).to.contain('#/map?')
    const receivedParams = new URLSearchParams(
        urlToCheck.substring(urlToCheck.indexOf('#/map?') + 6)
    )
    for (const [key, value] of Object.entries(expectedParams)) {
        expect(value).to.equal(
            receivedParams.get(key),
            `Wrong value for key ${key}\nexpected: ${value}\nreceived: ${receivedParams.get(key)}`
        )
    }
    for (const key of expectedAbsentParams) {
        expect(receivedParams.get(key)).to.be.null
    }
}
