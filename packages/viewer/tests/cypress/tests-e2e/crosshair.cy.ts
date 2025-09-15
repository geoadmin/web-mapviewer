/// <reference types="cypress" />

import { DEFAULT_PROJECTION } from '@/config/map.config'
import { CrossHairs } from '@/store/modules/position.store'
import type { CoordinateSystem } from '@swissgeo/coordinates'
import type { Router, RouterHistory } from 'vue-router'

// Temporary until the store is migrated to pinia and typescript
interface PositionStore {
    displayedFormatId: string
    zoom: number | undefined
    rotation: number
    autoRotation: boolean
    hasOrientation: boolean
    center: number[] | undefined
    projection: CoordinateSystem
    crossHair: typeof CrossHairs | null
    crossHairPosition: number[] | null
    camera: CameraPosition | null
}
interface CameraPosition {
    x: number
    y: number
    z: number
    heading: number
    pitch: number
    roll: number
}

describe('Testing the crosshair URL param', () => {

    /**
     * Changes a URL parameter without reloading the app.
     *
     * Help when you want to change a value in the URL but don't want the whole app be reloaded from
     * scratch in the process.
     *
     * @param urlParamName URL param name (present or not in the URL, will be added or
     *   overwritten)
     * @param urlParamValue The new URL param value we want to have
     * @param amountOfExpectedStoreDispatches The number of dispatches this change in the URL
     *   is going to trigger. This function will then wait for this amount of dispatch in the store
     *   before letting the test go further
     */
    function changeUrlParam(urlParamName: string, urlParamValue: string | null, amountOfExpectedStoreDispatches = 1): void {
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

    context('At app startup', () => {
        it('does not add the crosshair by default', () => {
            cy.goToMapView()
            cy.readStoreValue('state.position').then((positionStore: PositionStore) => {
                expect(positionStore.crossHair).to.be.null
                expect(positionStore.crossHairPosition).to.be.null
            })
        })
        it('adds the crosshair at the center of the map if only the crosshair param is given', () => {
            cy.goToMapView({ queryParams: { crosshair: CrossHairs.point } })
            cy.readStoreValue('state.position').then((positionStore: PositionStore) => {
                expect(positionStore.crossHair).to.eq(CrossHairs.point)
                expect(positionStore.crossHairPosition).to.eql(positionStore.center)
            })
        })
        it('sets the crosshair at the given coordinate if provided in the URL (and not at map center)', () => {
            const crossHairPosition = DEFAULT_PROJECTION.bounds.center.map((value: number) => value + 1000)
            cy.goToMapView({
                queryParams: { crosshair: `${CrossHairs.bowl},${crossHairPosition.join(',')}` }
            })
            cy.readStoreValue('state.position').then((positionStore: PositionStore) => {
                expect(positionStore.crossHair).to.eq(CrossHairs.bowl)
                expect(positionStore.crossHairPosition).to.eql(crossHairPosition)
            })
        })
    })
    context('Changes of URL param value while the app has been loaded', () => {
        it('Changes the crosshair types correctly if changed after app load', () => {
            cy.goToMapView({ queryParams: { crosshair: CrossHairs.point } })
            cy.readStoreValue('state.position.crossHair').should('eq', CrossHairs.point)
            changeUrlParam('crosshair', CrossHairs.marker)
            cy.readStoreValue('state.position.crossHair').should('eq', CrossHairs.marker)
        })
        it('Changes the crosshair position if set after app reload', () => {
            cy.goToMapView({ queryParams: { crosshair: CrossHairs.cross } })
            cy.readStoreValue('state.position').then((positionStore: PositionStore) => {
                expect(positionStore.crossHair).to.eq(CrossHairs.cross)
                expect(positionStore.crossHairPosition).to.eql(positionStore.center)
            })

            const newCrossHairPosition = DEFAULT_PROJECTION.bounds.center.map(
                (value: number) => value - 12345
            )
            changeUrlParam(
                'crosshair',
                `${CrossHairs.cross},${newCrossHairPosition.join(',')}`,
                // a change of the crosshair param with position triggers two dispatches: setCrossHair and setCrossHairPosition
                2
            )
            cy.readStoreValue('state.position').then((positionStore: PositionStore) => {
                expect(positionStore.crossHair).to.eq(CrossHairs.cross)
                expect(positionStore.crossHairPosition).to.eql(newCrossHairPosition)
            })
        })
        it('removes the crosshair if the URL param is removed (or set to null)', () => {
            cy.goToMapView({ queryParams: { crosshair: CrossHairs.circle } })
            cy.readStoreValue('state.position').then((positionStore: PositionStore) => {
                expect(positionStore.crossHair).to.eq(CrossHairs.circle)
                expect(positionStore.crossHairPosition).to.eql(positionStore.center)
            })
            changeUrlParam('crosshair', null, 2)
            cy.readStoreValue('state.position').then((positionStore: PositionStore) => {
                expect(positionStore.crossHair).to.be.null
                expect(positionStore.crossHairPosition).to.be.null
            })
        })
    })
})
