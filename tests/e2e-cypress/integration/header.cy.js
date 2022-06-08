/// <reference types="cypress" />

import { BREAKPOINT_PHONE_WIDTH, BREAKPOINT_TABLET } from '@/config'

const backdropSelector = '[data-cy="black-backdrop"]'
const menuButtonSelector = '[data-cy="menu-button"]'
const menuSettingsContentSelector = '[data-cy="menu-settings-content"]'
const menuSettingsSectionSelector =
    '[data-cy="menu-settings-section"] [data-cy="menu-section-header"]'

describe('Test functions for the header / search bar', () => {
    beforeEach(() => {
        cy.goToMapView()
    })
    const checkMenuTrayValue = (value) => {
        cy.readStoreValue('state.ui.showMenuTray').should('eq', value)
    }

    const width = Cypress.config('viewportWidth')

    if (width < BREAKPOINT_PHONE_WIDTH) {
        context('Menu mobile functionalities', () => {
            it("doesn't show the menu at app startup", () => {
                checkMenuTrayValue(false)
            })
            it('shows the menu when the menu button is pressed', () => {
                cy.get(menuButtonSelector).click()
                checkMenuTrayValue(true)
            })
            it('hides the menu if the menu button is clicked again', () => {
                cy.get(menuButtonSelector).click().click()
                checkMenuTrayValue(false)
            })
            it('hides the menu when the backdrop is clicked', () => {
                cy.get(menuButtonSelector).click()
                cy.get(backdropSelector).click()
                checkMenuTrayValue(false)
            })
        })
    }

    if (width >= BREAKPOINT_PHONE_WIDTH && width < BREAKPOINT_TABLET) {
        context('Menu on tablet', () => {
            it('should start closed', () => {
                cy.get('[data-cy="menu-tray"]').should('have.class', 'desktop-menu-closed')
            })
        })
    }

    if (width > BREAKPOINT_TABLET) {
        context('Menu on Desktop', () => {
            it('should start open', () => {
                cy.get('[data-cy="menu-tray"]').should('not.have.class', 'desktop-menu-closed')
            })
        })
    }

    context('Settings Menu Section', () => {
        it('does not show the settings sections on opening the menu', () => {
            if (width < BREAKPOINT_TABLET) {
                // mobile/tablet only
                cy.get(menuButtonSelector).click()
            }
            cy.get(menuSettingsContentSelector).should('be.hidden')
        })

        it('shows the settings on clicking on the settings section', () => {
            if (width < BREAKPOINT_TABLET) {
                // mobile/tablet only
                cy.get(menuButtonSelector).click()
            }
            cy.get(menuSettingsSectionSelector).click()
            cy.get(menuSettingsContentSelector).should('be.visible')
        })

        it('hides the settings section if clicked again', () => {
            if (width < BREAKPOINT_TABLET) {
                // mobile/tablet only
                cy.get(menuButtonSelector).click()
            }
            cy.get(menuSettingsSectionSelector).click().click()
            cy.get(menuSettingsContentSelector).should('be.hidden')
        })
    })

    context('Click on Swiss flag / Confederation text (app reset)', () => {
        const clickOnLogo = () => {
            cy.get('[data-cy="menu-swiss-flag"]').click()
            // waiting for page reload
            cy.wait('@layers')
            cy.wait('@topics')
        }
        const clickOnConfederationText = () => {
            cy.get('[data-cy="menu-swiss-confederation-text"]').click()
            // waiting for page reload
            cy.wait('@layers')
            cy.wait('@topics')
        }
        const checkLangAndTopic = (expectedLang = 'en', expectedTopicId = 'ech') => {
            cy.readStoreValue('state.i18n.lang').should('eq', expectedLang)
            cy.readStoreValue('state.topics.current').then((currentTopic) => {
                expect(currentTopic).to.not.be.undefined
                expect(currentTopic.id).to.eq(expectedTopicId)
            })
        }
        const selectTopicStandardAndAddLayerFromTopicTree = () => {
            if (width < BREAKPOINT_TABLET) {
                // mobile/tablet only
                cy.get(menuButtonSelector).click()
            }
            cy.get('[data-cy="change-topic-button"]').click()
            cy.get('[data-cy="change-to-topic-test-topic-standard"]').click()
            cy.get('[data-cy="topic-tree-item-2"]').click()
            cy.get('[data-cy="topic-tree-item-5"]').click()
            cy.get('[data-cy="topic-tree-item-test.wms.layer"]').click()
            cy.readStoreValue('state.layers.activeLayers').should('have.length', 1)
        }
        it('Reload the app with current topic/lang when clicking on the swiss flag', () => {
            cy.goToMapView('fr', {
                topic: 'test-topic-standard',
            })
            clickOnLogo()
            // checking that topic and lang are still the same
            checkLangAndTopic('fr', 'test-topic-standard')
        })
        if (width > BREAKPOINT_TABLET) {
            // desktop only
            it('reloads the app the same way as above when click on the confederation text', () => {
                cy.goToMapView('fr', {
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
        if (width > BREAKPOINT_TABLET) {
            // desktop only
            it('reloads the app the same way as above when click on the confederation text', () => {
                cy.goToMapView()
                selectTopicStandardAndAddLayerFromTopicTree()
                clickOnConfederationText()
                checkLangAndTopic('en', 'test-topic-standard')
                cy.readStoreValue('state.layers.activeLayers').should('have.length', 0)
            })
        }
    })
})
