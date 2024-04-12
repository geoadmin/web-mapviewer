/// <reference types="cypress" />

describe('Testing the time slider', () => {
    context('Time button in the map toolbox', () => {
        it('should not be visible if no time enable layer is active and visible', () => {
            cy.goToMapView()
            cy.get('[data-cy="time-slider-button"]').should('not.exist')
        })
        it('should be visible if a time enabled layer is visible', () => {
            cy.goToMapView({
                layers: 'test.timeenabled.wmts.layer@year=2019',
            })
            cy.get('[data-cy="time-slider-button"]').should('be.visible')
        })
        it('should show the time slider when clicked', () => {
            cy.goToMapView({
                layers: 'test.timeenabled.wmts.layer@year=2019',
            })
            cy.get('[data-cy="time-slider-button"]').click()
            cy.get('[data-cy="time-slider"]').should('be.visible')
        })
    })
    context('Time slider interactions', () => {
        function moveSlider(x) {
            cy.get('[data-cy="times-slider-cursor"]').trigger('mousedown', { which: 1 })
            cy.get('[data-cy="times-slider-cursor"]').trigger('mousemove', {
                screenX: Math.abs(x),
                screenY: 0,
            })
            cy.get('[data-cy="times-slider-cursor"]').trigger('mouseup', { force: true })
        }
        function extractDecimal(string) {
            return parseInt(string.match(/[\d.]+/g)[0])
        }
        const preSelectedYear = 2019
        beforeEach(() => {
            cy.goToMapView({
                layers: `test.timeenabled.wmts.layer@year=${preSelectedYear}`,
            })
            cy.get('[data-cy="time-slider-button"]').click()
        })
        it('should have the preselected year correctly set', () => {
            cy.get('[data-cy="time-slider-bar-cursor-year"]').should('have.value', preSelectedYear)
        })
        it('should move the timeslider with mouse drag and text input', () => {
            cy.log('the year changes if the user drags the tooltip on the left with the mouse')
            moveSlider(0)
            cy.get('[data-cy="time-slider-bar-cursor-year"]').should(
                'not.have.value',
                preSelectedYear
            )

            cy.log('Check time slider year cursor text input')
            cy.get('[data-cy="time-slider-bar-cursor-arrow"]')
                .invoke('attr', 'style')
                .then(($barCursorPosition) => {
                    cy.log($barCursorPosition)

                    cy.log('Time slider does not move with non number string')
                    cy.get('[data-cy="time-slider-bar-cursor-year"]').clear()
                    cy.get('[data-cy="time-slider-bar-cursor-year"]').type('asdfghjkl')
                    cy.get('[data-cy="time-slider-bar-cursor-arrow"]')
                        .invoke('attr', 'style')
                        .should('eq', $barCursorPosition)

                    cy.log('Time slider allows only four characters')
                    cy.get('[data-cy="time-slider-bar-cursor-year"]').should('have.value', 'asdf')

                    cy.log('Time slider does not move with out of bound year')
                    cy.get('[data-cy="time-slider-bar-cursor-year"]').clear()
                    cy.get('[data-cy="time-slider-bar-cursor-year"]').type('1191')
                    cy.get('[data-cy="time-slider-bar-cursor-arrow"]')
                        .invoke('attr', 'style')
                        .should('eq', $barCursorPosition)
                    cy.get('[data-cy="time-slider-bar-cursor-year"]').type('2525')
                    cy.get('[data-cy="time-slider-bar-cursor-arrow"]')
                        .invoke('attr', 'style')
                        .should('eq', $barCursorPosition)

                    cy.log('Time slider does not move with incomplete year')
                    cy.get('[data-cy="time-slider-bar-cursor-year"]').clear()
                    cy.get('[data-cy="time-slider-bar-cursor-year"]').type('200')
                    cy.get('[data-cy="time-slider-bar-cursor-arrow"]')
                        .invoke('attr', 'style')
                        .should('eq', $barCursorPosition)

                    cy.log('Time slider Bar moves when valid year entered')
                    cy.get('[data-cy="time-slider-bar-cursor-year"]').clear()
                    cy.get('[data-cy="time-slider-bar-cursor-year"]').type('2000')
                    cy.get('[data-cy="time-slider-bar-cursor-arrow"]')
                        .invoke('attr', 'style')
                        .then(extractDecimal)
                        .should('gt', extractDecimal($barCursorPosition))
                })
        })
    })
})
