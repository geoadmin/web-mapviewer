/// <reference types="cypress" />

const mapOverlaySelector = '[data-cy="map-overlay"]';
const menuButtonSelector = '[data-cy="menu-button"]';
const menuTraySelector = '[data-cy="menu-tray"]';

describe('Unit test functions for the header / search bar', () => {

    beforeEach(() => {
        cy.visit('/');
    })

    it('doesn\'t show the menu and overlay at app startup', () => {
        cy.get(mapOverlaySelector).should('be.hidden');
        cy.get(menuTraySelector).should('be.hidden');
    })

    it('shows the menu and the overlay when the menu button is pressed', () => {
        cy.get(menuButtonSelector).click();
        cy.get(mapOverlaySelector).should('be.visible');
        cy.get(menuTraySelector).should('be.visible');
    })

    it('hides the menu and the overlay if the menu button is clicked again', () => {
        cy.get(menuButtonSelector).click().click();
        cy.get(mapOverlaySelector).should('be.hidden');
        cy.get(menuTraySelector).should('be.hidden');
    })

    it('hides the menu and the overlay when the overlay is clicked', () => {
        cy.get(menuButtonSelector).click();
        cy.get(mapOverlaySelector).click().should('be.hidden');
        cy.get(menuTraySelector).should('be.hidden');
    })
})