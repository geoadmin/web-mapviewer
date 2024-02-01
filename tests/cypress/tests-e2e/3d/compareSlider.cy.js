/// <reference types="cypress" />
import { WEBMERCATOR } from '@/utils/coordinates/coordinateSystems'

describe('The compare Slider and the menu elements should not be available in 3d', () => {
    context('compare slider non availability in 3d', () => {
        it('does not shows up with layers, a compare slider parameter set, but in 3d', () => {
            cy.goToMapView(
                {
                    layers: ['test-1.wms.layer', 'test-2.wms.layer,,'].join(';'),
                    compare_ratio: '0.4',
                    '3d': true,
                    sr: WEBMERCATOR.epsgNumber,
                },
                true
            )
            cy.get('[data-cy="compare_slider"]').should('not.exist')

            cy.readStoreValue('state.ui.compareRatio').then((compareRatio) => {
                expect(compareRatio).to.eq(-0.5)
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
            cy.clickOnMenuButtonIfMobile()
            cy.get('[data-cy="menu-tray-tool-section"]').click()
            cy.get('[data-cy="menu-advanced-tools-Compare"]').should('be.visible')
            cy.clickOnMenuButtonIfMobile()

            cy.get('[data-cy="3d-button"]').click()

            cy.clickOnMenuButtonIfMobile()

            cy.get('[data-cy="menu-advanced-tools-Compare"]').should('not.exist')
        })

})
