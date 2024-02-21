/// <reference types="cypress" />

import { DEFAULT_PROJECTION } from '@/config'
import { CrossHairs } from '@/store/modules/position.store'

describe('Testing the crosshair URL param', () => {
    context('At app startup', () => {
        it('does not add the crosshair by default', () => {
            cy.goToMapView()
            cy.readStoreValue('state.position').then((positionStore) => {
                expect(positionStore.crossHair).to.be.null
                expect(positionStore.crossHairPosition).to.be.null
            })
        })
        it('adds the crosshair at the center of the map if only the crosshair param is given', () => {
            cy.goToMapView({
                crosshair: CrossHairs.point,
            })
            cy.readStoreValue('state.position').then((positionStore) => {
                expect(positionStore.crossHair).to.eq(CrossHairs.point)
                expect(positionStore.crossHairPosition).to.eql(positionStore.center)
            })
        })
        it('sets the crosshair at the given coordinate if provided in the URL (and not at map center)', () => {
            const crossHairPosition = DEFAULT_PROJECTION.bounds.center.map((value) => value + 1000)
            cy.goToMapView({
                crosshair: `${CrossHairs.bowl},${crossHairPosition.join(',')}`,
            })
            cy.readStoreValue('state.position').then((positionStore) => {
                expect(positionStore.crossHair).to.eq(CrossHairs.bowl)
                expect(positionStore.crossHairPosition).to.eql(crossHairPosition)
            })
        })
    })
    context('Changes of URL param value while the app has been loaded', () => {
        it('Changes the crosshair types correctly if changed after app load', () => {
            cy.goToMapView({
                crosshair: CrossHairs.point,
            })
            cy.readStoreValue('state.position.crossHair').should('eq', CrossHairs.point)
            cy.changeUrlParam('crosshair', CrossHairs.marker)
            cy.readStoreValue('state.position.crossHair').should('eq', CrossHairs.marker)
        })
        it('Changes the crosshair position if set after app reload', () => {
            cy.goToMapView({
                crosshair: CrossHairs.cross,
            })
            cy.readStoreValue('state.position').then((positionStore) => {
                expect(positionStore.crossHair).to.eq(CrossHairs.cross)
                expect(positionStore.crossHairPosition).to.eql(positionStore.center)
            })

            const newCrossHairPosition = DEFAULT_PROJECTION.bounds.center.map(
                (value) => value - 12345
            )
            cy.changeUrlParam(
                'crosshair',
                `${CrossHairs.cross},${newCrossHairPosition.join(',')}`,
                // a change of the crosshair param with position triggers two dispatches: setCrossHair and setCrossHairPosition
                2
            )
            cy.readStoreValue('state.position').then((positionStore) => {
                expect(positionStore.crossHair).to.eq(CrossHairs.cross)
                expect(positionStore.crossHairPosition).to.eql(newCrossHairPosition)
            })
        })
        it('removes the crosshair if the URL param is removed (or set to null)', () => {
            cy.goToMapView({
                crosshair: CrossHairs.circle,
            })
            cy.readStoreValue('state.position').then((positionStore) => {
                expect(positionStore.crossHair).to.eq(CrossHairs.circle)
                expect(positionStore.crossHairPosition).to.eql(positionStore.center)
            })
            cy.changeUrlParam('crosshair', null, 2)
            cy.readStoreValue('state.position').then((positionStore) => {
                expect(positionStore.crossHair).to.be.null
                expect(positionStore.crossHairPosition).to.be.null
            })
        })
    })
})
