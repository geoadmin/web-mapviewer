/// <reference types="cypress" />

describe('Testing the time slider', () => {
    context('Time button in the map toolbox', () => {
        it('should not be visible if no time enable layer is active and visible', () => {
            cy.goToMapView()
            cy.get('[data-cy="time-slider-button"]').should('not.exist')
        })
        it('should be visible if a time enabled layer is visible', () => {
            cy.goToMapView('en', {
                layers: 'test.timeenabled.wmts.layer@year=2019',
            })
            cy.get('[data-cy="time-slider-button"]').should('be.visible')
        })
        it('should show the time slider when clicked', () => {
            cy.goToMapView('en', {
                layers: 'test.timeenabled.wmts.layer@year=2019',
            })
            cy.get('[data-cy="time-slider-button"]').click()
            cy.get('[data-cy="time-slider"]').should('be.visible')
        })
    })
    context('Time slider interactions', () => {
        function moveSlider(x) {
            cy.get('[data-cy="times-slider-cursor"]').realSwipe(x > 0 ? 'toRight' : 'toLeft', {
                length: Math.abs(x),
            })
        }
        const preSelectedYear = 2019
        beforeEach(() => {
            cy.goToMapView('en', {
                layers: `test.timeenabled.wmts.layer@year=${preSelectedYear}`,
            })
            cy.get('[data-cy="time-slider-button"]').click()
        })
        it('should have the preselected year correctly set', () => {
            cy.get('[data-cy="time-slider-current-year"]').should('contain', preSelectedYear)
        })
        it('should change the year if the user drags the tooltip on the right with the mouse', () => {
            moveSlider(200)
            cy.get('[data-cy="time-slider-current-year"]').should('not.contain', preSelectedYear)
        })
    })
})
