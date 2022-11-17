/// <reference types="cypress" />

const scaleLineSelector = '[data-cy="scaleline"]'
const zoomSelector = '[data-cy="zoom-in"]'
const dezoomSelector = '[data-cy="zoom-out"]'

describe('Testing the footer content', () => {
    beforeEach(() => {
        cy.goToMapView()
    })
    context('Checking the scale line behave as expected', () => {
        it('Should not be visible on standard startup, as the zoom level is 7', () => {
            cy.get(scaleLineSelector).should('not.be.visible')
        })
        it('Should appear when we zoom a bit (zoom level 10)', () => {
            cy.get(zoomSelector).click().click().click()
            cy.get(scaleLineSelector).should('be.visible')
        })
        it('Should disappear again if we zoom out again after zooming', () => {
            cy.get(zoomSelector).click().click().click()
            cy.get(dezoomSelector).click().click().click()
            cy.get(scaleLineSelector).should('not.be.visible')
        })
    })
})
