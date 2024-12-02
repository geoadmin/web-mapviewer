/// <reference types="cypress" />

import { BREAKPOINT_PHONE_WIDTH, BREAKPOINT_TABLET } from '@/config/responsive.config'

const backdropSelector = '[data-cy="black-backdrop"]'
const menuButtonSelector = '[data-cy="menu-button"]'
const menuSettingsContentSelector = '[data-cy="menu-help-content"]'
const menuSettingsSectionSelector = '[data-cy="menu-help-section"] [data-cy="menu-section-header"]'

describe('Test functions for the header / search bar', () => {
    beforeEach(() => {
        cy.goToMapView()
    })
    const checkMenuValue = (value) => {
        cy.readStoreValue('getters.isMenuShown').should('eq', value)
    }

    const width = Cypress.config('viewportWidth')

    if (width < BREAKPOINT_PHONE_WIDTH) {
        it('Menu mobile functionalities', () => {
            checkMenuValue(false)

            cy.get(menuButtonSelector).click()
            checkMenuValue(true)

            cy.get(menuButtonSelector).click()
            checkMenuValue(false)

            cy.get(menuButtonSelector).click()
            checkMenuValue(true)
            cy.get(backdropSelector).click({ force: true })
            checkMenuValue(false)
        })
    }

    if (width >= BREAKPOINT_PHONE_WIDTH && width < BREAKPOINT_TABLET) {
        context('Menu on tablet', () => {
            it('should start closed', () => {
                cy.get('[data-cy="menu-tray"]').should('have.class', 'desktop-menu-closed')
            })
        })
    }

    if (width >= BREAKPOINT_TABLET) {
        context('Menu on Desktop', () => {
            it('should start open', () => {
                cy.get('[data-cy="menu-tray"]').should('not.have.class', 'desktop-menu-closed')
            })
        })
    }

    context('Settings Menu Section', () => {
        it('shows/hide the help on clicking on the help section', () => {
            if (width < BREAKPOINT_TABLET) {
                // mobile/tablet only
                cy.get(menuButtonSelector).click()
            }
            cy.get(menuSettingsContentSelector).should('be.hidden')
            cy.get(menuSettingsSectionSelector).click()
            cy.get(menuSettingsContentSelector).should('be.visible')
            cy.get(menuSettingsSectionSelector).click()
            cy.get(menuSettingsContentSelector).should('be.hidden')
        })
    })

    context('Click on Swiss flag / Confederation text (app reset)', () => {
        const clickOnLogo = () => {
            cy.get('[data-cy="menu-swiss-flag"]').click()
            // waiting for page reload
            cy.wait('@layers')
            cy.wait('@topics')
            cy.waitMapIsReady()
        }
        const clickOnConfederationText = () => {
            cy.get('[data-cy="menu-swiss-confederation-text"]').click()
            // waiting for page reload
            cy.wait('@layers')
            cy.wait('@topics')
            cy.waitMapIsReady()
        }
        const checkLangAndTopic = (expectedLang = 'en', expectedTopicId = 'ech') => {
            cy.readStoreValue('state.i18n.lang').should('eq', expectedLang)
            cy.readStoreValue('state.topics.current').then((currentTopic) => {
                expect(currentTopic).to.eq(expectedTopicId)
            })
        }
        const selectTopicStandardAndAddLayerFromTopicTree = () => {
            if (width < BREAKPOINT_TABLET) {
                // mobile/tablet only
                cy.get(menuButtonSelector).click()
            }
            cy.get('[data-cy="change-topic-button"]').click()
            cy.get('[data-cy="change-to-topic-test-topic-standard"]').click()
            cy.get('[data-cy="catalogue-tree-item-title-2"]').click()
            cy.get('[data-cy="catalogue-tree-item-title-5"]').click()
            cy.get('[data-cy="catalogue-tree-item-title-test.wms.layer"]').click()
            cy.readStoreValue('state.layers.activeLayers').should('have.length', 1)
        }
        it('Reload the app with current topic/lang when clicking on the swiss flag', () => {
            cy.goToMapView({
                lang: 'fr',
                topic: 'test-topic-standard',
            })
            clickOnLogo()
            // checking that topic and lang are still the same
            checkLangAndTopic('fr', 'test-topic-standard')
        })
        if (width >= BREAKPOINT_TABLET) {
            // desktop only
            it('reloads the app the same way as above when click on the confederation text', () => {
                cy.goToMapView({
                    lang: 'fr',
                    topic: 'test-topic-standard',
                })
                clickOnConfederationText()
                // checking that topic and lang are still the same
                checkLangAndTopic('fr', 'test-topic-standard')
            })
        }
        it("resets layers added to the default topic's layers when clicking on the logo", () => {
            cy.goToMapView()
            selectTopicStandardAndAddLayerFromTopicTree()
            // now clicking on the swiss flag, this should reload the page without the active layer
            // we just selected (so only the topic and lang must be carried over)
            clickOnLogo()
            checkLangAndTopic('en', 'test-topic-standard')
            cy.readStoreValue('state.layers.activeLayers').should('have.length', 0)
        })

        if (width >= BREAKPOINT_TABLET) {
            // desktop only
            it('reloads the app the same way as above when click on the confederation text', () => {
                cy.goToMapView()
                selectTopicStandardAndAddLayerFromTopicTree()
                clickOnConfederationText()
                checkLangAndTopic('en', 'test-topic-standard')
                cy.readStoreValue('state.layers.activeLayers').should('have.length', 0)
            })
            // This test is not working because clicking the news button crashes cypress
            // see https://github.com/cypress-io/cypress/issues/24084 for more information
            it('should show the news website when clicking on the News button', () => {
                cy.goToMapView()
                cy.get('[data-cy="header-cms-link"]').click()

                cy.url().should('equal', 'https://www.geo.admin.ch/en/#News')
            })
        }
    })
})
