/// <reference types="cypress" />

import { moveTimeSlider } from '@/../tests/cypress/tests-e2e/utils'

describe('Open Time and Compare Slider together', () => {
    context('Open Time and Compare Slider together', () => {
        const preSelectedYear = 2019
        const timedLayerId = 'test.timeenabled.wmts.layer' // years 1800, 2021...2015, 2050
        const testLayer1 = 'test-1.wms.layer'
        const testLayer2 = 'test-2.wms.layer'
        const initialRatio = 0.5

        function checkTimeSlider(active, selectedYear = null) {
            // Check the store
            cy.readStoreValue('state.ui.isTimeSliderActive').should('be.equal', active)

            // Checking the UI
            if (active) {
                cy.get('[data-cy="time-slider"]').should('be.visible')
                if (selectedYear) {
                    cy.get('[data-cy="time-slider-bar-cursor-year"]').should(
                        'have.value',
                        `${selectedYear}`
                    )
                }
            } else {
                cy.get('[data-cy="time-slider"]').should('not.exist')
            }
        }

        function checkCompareSlider(active, ratio = null, hasVisibleLayers = true) {
            // Check the store
            cy.readStoreValue('state.ui.isCompareSliderActive').should('be.equal', active)

            // Checking the UI
            if (active && hasVisibleLayers) {
                if (!ratio) {
                    cy.readStoreValue('state.ui.compareRatio').should('be.null')
                } else {
                    cy.readStoreValue('state.ui.compareRatio').should('be.equal', ratio)
                }
            } else {
                cy.get('[data-cy="compareSlider"]').should('not.exist')
            }
        }

        function toggleTimeSlider() {
            cy.get('[data-cy="time-slider-button"]').should('be.visible').click()
        }

        function toggleCompareSlider() {
            cy.get('[data-cy="menu-advanced-tools-compare"]').should('be.visible').click()
        }

        function toggleLayerVisibility(layerId) {
            cy.get(`[data-cy^="button-toggle-visibility-layer-${layerId}-"]`)
                .should('be.visible')
                .click()
        }

        function removeLayer(layerId) {
            cy.get(`[data-cy^="button-remove-layer-${layerId}-"]`).should('be.visible').click()
        }

        it('Open Time and Compare Slider together', () => {
            cy.viewport(1920, 1080)

            cy.goToMapView({
                layers: [`${timedLayerId}@year=${preSelectedYear}`, testLayer1, testLayer2].join(
                    ';'
                ),
            })

            // Initial state, no slider should be active
            checkTimeSlider(false)
            checkCompareSlider(false)

            toggleTimeSlider() // Open time slider
            checkTimeSlider(true, preSelectedYear)
            checkCompareSlider(false)

            cy.log('Open compare slider, see if time slider is still active')
            cy.get('[data-cy="menu-tray-tool-section"]').should('be.visible').click()
            toggleCompareSlider() // Open compare slider
            checkCompareSlider(true, initialRatio)
            checkTimeSlider(true, preSelectedYear)

            cy.log('Close compare slider, see if time slider is still active')
            toggleCompareSlider() // Close compare slider
            checkCompareSlider(false)
            checkTimeSlider(true, preSelectedYear)

            toggleCompareSlider() // Open compare slider
            checkCompareSlider(true, initialRatio)
            checkTimeSlider(true, preSelectedYear)

            cy.log('Hide timed layer, see if time slider is still active')
            cy.get('[data-cy="menu-active-layers"]').should('be.visible').click()

            toggleLayerVisibility(timedLayerId) // Hide timed layer
            checkCompareSlider(true, initialRatio)
            checkTimeSlider(false)

            toggleLayerVisibility(timedLayerId) // Show timed layer again
            // Time slider will be inactive
            checkCompareSlider(true, initialRatio)
            checkTimeSlider(false)

            toggleTimeSlider() // Open time slider again
            checkCompareSlider(true, initialRatio)
            checkTimeSlider(true, preSelectedYear)

            cy.log('Hide layers, see if time and compare slider is still active')
            toggleLayerVisibility(testLayer2)
            checkCompareSlider(true, initialRatio)
            checkTimeSlider(true, preSelectedYear)

            toggleLayerVisibility(testLayer1)
            checkCompareSlider(true, initialRatio)
            checkTimeSlider(true, preSelectedYear)

            toggleLayerVisibility(timedLayerId)
            // Time slider will still be active, but there is no active layer anymore
            checkCompareSlider(true, initialRatio, false)
            checkTimeSlider(false)

            toggleLayerVisibility(testLayer2)
            checkCompareSlider(true, initialRatio)
            checkTimeSlider(false)

            toggleLayerVisibility(testLayer1)
            checkCompareSlider(true, initialRatio)
            checkTimeSlider(false)

            toggleLayerVisibility(timedLayerId)
            checkCompareSlider(true, initialRatio)
            checkTimeSlider(false)

            toggleTimeSlider() // Open time slider again
            checkCompareSlider(true, initialRatio)

            cy.log('Move the time slider')
            const newSelectedYear = 2020
            moveTimeSlider(newSelectedYear)
            checkTimeSlider(true, newSelectedYear)
            checkCompareSlider(true, initialRatio)

            toggleTimeSlider() // Close time slider
            checkCompareSlider(true, initialRatio)
            checkTimeSlider(false)

            toggleTimeSlider() // Open time slider again
            checkCompareSlider(true, initialRatio)
            checkTimeSlider(true, newSelectedYear) // Keep the selected year
        })

        it('testing sliders behaviour when layers are removed', () => {
            cy.viewport(1920, 1080)

            cy.goToMapView({
                layers: [`${timedLayerId}@year=${preSelectedYear}`, testLayer1, testLayer2].join(
                    ';'
                ),
            })

            // Initial state, no slider should be active
            checkTimeSlider(false)
            checkCompareSlider(false)

            toggleTimeSlider() // Open time slider
            checkTimeSlider(true, preSelectedYear)
            checkCompareSlider(false)

            cy.log('Open compare slider, see if time slider is still active')
            cy.get('[data-cy="menu-tray-tool-section"]').should('be.visible').click()
            toggleCompareSlider() // Open compare slider
            checkCompareSlider(true, initialRatio)
            checkTimeSlider(true, preSelectedYear)

            // Open the active layers menu
            cy.get(`[data-cy="menu-active-layers"]`).should('be.visible').click()

            removeLayer(testLayer1)
            checkCompareSlider(true, initialRatio)
            checkTimeSlider(true, preSelectedYear)

            removeLayer(timedLayerId)
            checkCompareSlider(true, initialRatio)
            checkTimeSlider(false)

            removeLayer(testLayer2)
            checkCompareSlider(true, initialRatio, false)
            checkTimeSlider(false)
        })
    })
})
