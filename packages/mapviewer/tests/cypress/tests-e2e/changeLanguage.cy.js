/// <reference types="cypress" />

import { isMobile } from 'tests/cypress/support/utils'

function checkLanguage(lang) {
    // Check language in store
    cy.readStoreValue('state.i18n.lang').should('eq', lang)

    // Check UI
    if (isMobile()) {
        cy.readStoreValue('state.ui.showMenu').then((isMenuCurrentlyOpen) => {
            if (!isMenuCurrentlyOpen) {
                cy.get('[data-cy="menu-button"]').click()
            }
        })
        cy.get('[data-cy="mobile-lang-selector"]').should('exist')
        cy.get('[data-cy="mobile-lang-selector"]')
            .find('option:selected') // it's a select element
            .invoke('text')
            .then((text) => {
                expect(text).to.be.equal(lang.toUpperCase())
            })
    } else {
        //  TODO: Implement this test
    }
    // Check the translation of the menu button (in english: close)
    const closeTranslations = {
        de: 'Schliessen',
        fr: 'Fermer',
        it: 'Chiudere',
        rm: 'Serrar',
        en: 'Close',
    }
    cy.get('[data-cy="menu-button"]').invoke('text').should('eq', closeTranslations[lang])
}

describe('Change language', () => {
    context('in mobile view', () => {
        it('should change the language', () => {
            cy.goToMapView()
            cy.readStoreValue('state.ui.isCompareSliderActive').should('be.equal', false)
            checkLanguage('en') // Initial language is 'en'

            // Check for all available languages
            const availableLanguages = ['de', 'fr', 'it', 'rm', 'en']

            availableLanguages.forEach((lang) => {
                cy.clickOnLanguage(lang)
                checkLanguage(lang)
            })
        })
        it('Open with language parameter set', () => {
            // Open the app with a language parameter set
        })
    })
    context('in desktop view', () => {
        // TODO: Implement this test
    })
})
