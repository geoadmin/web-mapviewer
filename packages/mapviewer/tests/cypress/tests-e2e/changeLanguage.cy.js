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
            .should((text) => {
                expect(text).to.be.equal(lang.toUpperCase())
            })
    } else {
        cy.get('[data-cy="menu-lang-selector"]')
            .find('button')
            .each((button) => {
                // Get the text of each button
                cy.wrap(button)
                    .invoke('text')
                    .then((text) => {
                        // Check if the text is the current language
                        if (text.trim() === lang.toUpperCase()) {
                            // The text should be bold (primary) if it is the current language
                            cy.wrap(button).should('have.class', 'text-primary')
                        } else {
                            // The text should be black if it is not the current language
                            cy.wrap(button).should('have.class', 'text-black')
                        }
                    })
            })
    }
    // Check the translation of the menu button (in english: close)
    const closeTranslationsMobile = {
        de: 'Schliessen',
        fr: 'Fermer',
        it: 'Chiudere',
        rm: 'Serrar',
        en: 'Close',
    }
    const closeTranslationsDesktop = {
        de: 'Menü schliessen',
        fr: 'Fermer menu',
        it: 'Chiudere menu',
        rm: 'Serrar menu',
        en: 'Close menu',
    }
    if (isMobile()) {
        cy.get('[data-cy="menu-button"]')
            .invoke('text')
            .should('contain', closeTranslationsMobile[lang])
    } else {
        cy.get('[data-cy="menu-button"]')
            .invoke('text')
            .should('contain', closeTranslationsDesktop[lang])
    }
}

describe('Change language', () => {
    context('in mobile view', () => {
        it('should change the language', () => {
            cy.goToMapView()
            expect(isMobile()).to.be.true

            checkLanguage('en') // Initial language is 'en'

            // Check for all available languages
            const availableLanguages = ['de', 'fr', 'it', 'rm', 'en']

            availableLanguages.forEach((lang) => {
                cy.clickOnLanguage(lang)
                checkLanguage(lang)
            })
        })
    })
    context(
        'in desktop view',
        {
            viewportWidth: 1920,
            viewportHeight: 1080,
        },
        () => {
            it('should change the language', () => {
                cy.goToMapView()
                expect(isMobile()).to.be.false

                checkLanguage('en') // Initial language is 'en'

                // Check for all available languages
                const availableLanguages = ['de', 'fr', 'it', 'rm', 'en']

                availableLanguages.forEach((lang) => {
                    cy.clickOnLanguage(lang)
                    checkLanguage(lang)
                })
            })
        }
    )
})
