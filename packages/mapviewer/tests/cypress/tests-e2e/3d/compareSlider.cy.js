/// <reference types="cypress" />
import { WEBMERCATOR } from '@geoadmin/coordinates'

describe('The compare Slider and the menu elements should not be available in 3d', () => {
    context('compare slider non availability in 3d', () => {
        it('does not shows up with layers, a compare slider parameter set, but in 3d', () => {
            cy.goToMapView(
                {
                    layers: ['test-1.wms.layer', 'test-2.wms.layer,,'].join(';'),
                    compareRatio: '0.4',
                    '3d': true,
                    sr: WEBMERCATOR.epsgNumber,
                },
                true
            )
            cy.get('[data-cy="compareSlider"]').should('not.exist')

            cy.readStoreValue('state.ui.compareRatio').then((compareRatio) => {
                expect(compareRatio).to.eq(0.4)
            })
        })
    })
    context('Compare menu component with 3d', () => {
        it('disappears when it is available in 2d and we swith to 3d', () => {
            cy.goToMapView(
                {
                    sr: WEBMERCATOR.epsgNumber,
                },
                true
            )
            cy.openMenuIfMobile()
            cy.get('[data-cy="menu-tray-tool-section"]').click()
            cy.get('[data-cy="menu-advanced-tools-compare"]').should('be.visible')
            cy.closeMenuIfMobile()

            cy.get('[data-cy="3d-button"]').click()

            cy.openMenuIfMobile()

            cy.get('[data-cy="menu-advanced-tools-compare"]').should('not.exist')
        })
    })
})
