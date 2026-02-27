/// <reference types="cypress" />

import { changeUrlParam } from 'support/utils'

import { DEFAULT_PROJECTION } from '@/config'
import usePositionStore from '@/store/modules/position'

describe('Testing the crosshair URL param', () => {
    context('At app startup', () => {
        it('does not add the crosshair by default', () => {
            cy.goToMapView()
            cy.getPinia().then((pinia) => {
                const positionStore = usePositionStore(pinia)
                expect(positionStore.crossHair).to.be.undefined
                expect(positionStore.crossHairPosition).to.be.undefined
            })
        })
        it('adds the crosshair at the center of the map if only the crosshair param is given', () => {
            cy.goToMapView({ queryParams: { crosshair: 'point' } })
            cy.getPinia().then((pinia) => {
                const positionStore = usePositionStore(pinia)
                expect(positionStore.crossHair).to.eq('point')
                expect(positionStore.crossHairPosition).to.eql(positionStore.center)
            })
        })
        it('sets the crosshair at the given coordinate if provided in the URL (and not at map center)', () => {
            const crossHairPosition = DEFAULT_PROJECTION.bounds.center.map(
                (value: number) => value + 1000
            )
            cy.goToMapView({
                queryParams: { crosshair: `${'bowl'},${crossHairPosition.join(',')}` },
            })
            cy.getPinia().then((pinia) => {
                const positionStore = usePositionStore(pinia)
                expect(positionStore.crossHair).to.eq('bowl')
                expect(positionStore.crossHairPosition).to.eql(crossHairPosition)
            })
        })
    })
    context('Changes of URL param value while the app has been loaded', () => {
        it('Changes the crosshair types correctly if changed after app load', () => {
            cy.goToMapView({ queryParams: { crosshair: 'point' } })
            cy.getPinia().then((pinia) => {
                const positionStore = usePositionStore(pinia)
                cy.wrap(positionStore.crossHair).should('eq', 'point')
            })
            changeUrlParam('crosshair', 'marker')
            cy.getPinia().then((pinia) => {
                const positionStore = usePositionStore(pinia)
                cy.wrap(positionStore.crossHair).should('eq', 'marker')
            })
        })
        it('Changes the crosshair position if set after app reload', () => {
            cy.goToMapView({ queryParams: { crosshair: 'cross' } })
            cy.getPinia().then((pinia) => {
                const positionStore = usePositionStore(pinia)
                expect(positionStore.crossHair).to.eq('cross')
                expect(positionStore.crossHairPosition).to.eql(positionStore.center)
            })

            const newCrossHairPosition = DEFAULT_PROJECTION.bounds.center.map(
                (value: number) => value - 12345
            )
            changeUrlParam(
                'crosshair',
                `${'cross'},${newCrossHairPosition.join(',')}`,
                // a change of the crosshair param with position triggers two dispatches: setCrossHair and setCrossHairPosition
                2
            )
            cy.getPinia().then((pinia) => {
                const positionStore = usePositionStore(pinia)
                expect(positionStore.crossHair).to.eq('cross')
                expect(positionStore.crossHairPosition).to.eql(newCrossHairPosition)
            })
        })
        it('removes the crosshair if the URL param is removed (or set to undefined)', () => {
            cy.goToMapView({ queryParams: { crosshair: 'circle' } })
            cy.getPinia().then((pinia) => {
                const positionStore = usePositionStore(pinia)
                expect(positionStore.crossHair).to.eq('circle')
                expect(positionStore.crossHairPosition).to.eql(positionStore.center)
            })
            changeUrlParam('crosshair', undefined, 2)
            cy.getPinia().then((pinia) => {
                const positionStore = usePositionStore(pinia)
                expect(positionStore.crossHair).to.be.undefined
                expect(positionStore.crossHairPosition).to.be.undefined
            })
        })
    })
})
