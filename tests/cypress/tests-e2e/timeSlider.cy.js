import { DEFAULT_OLDEST_YEAR, DEFAULT_YOUNGEST_YEAR } from '@/config/time.config'

/// <reference types="cypress" />
describe('Cypress tests covering the time slider, its functionalities and its URL parameter', () => {
    context('checking the time slider behavior, both on startup and during use', () => {
        function moveSlider(x) {
            cy.get('[data-cy="time-slider-bar-cursor-grab"]').trigger('mousedown', { which: 1 })
            cy.get('[data-cy="time-slider-bar-cursor-grab"]').trigger('mousemove', {
                screenX: Math.abs(x),
                screenY: 0,
            })
            cy.get('[data-cy="time-slider-bar-cursor-grab"]').trigger('mouseup', { force: true })
        }
        function extractDecimal(string) {
            return parseInt(string.match(/[\d.]+/g)[0])
        }
        const preSelectedYear = 2019
        const standard_layer = 'test.wmts.layer'
        const timedLayerId = 'test.timeenabled.wmts.layer' // years 1800, 2021...2015, 2050
        const timedLayerIdWithOddYear = 'test.timeenabled.wmts.layer.2' // odd years 2023 to 2009
        const timedLayerIdWithAllYear = 'test.timeenabled.wmts.layer.3' // years = all (9999), 2010 and 2009
        // those three classes are supposed to be mutually exclusive
        function isPrimaryBtn(classList) {
            return (
                classList.includes('btn-primary') &&
                !classList.includes('btn-light') &&
                !classList.includes('btn-outline-primary')
            )
        }
        function isLightBtn(classList) {
            return (
                classList.includes('btn-light') &&
                !classList.includes('btn-primary') &&
                !classList.includes('btn-outline-primary')
            )
        }
        it('checks that the time slider is functional and behave correctly part 1', () => {
            cy.viewport(1920, 1080)
            //----------------------------------------------------------------------------------------------------
            cy.log(': Invisible time layer given. time slider button should not appear')
            cy.goToMapView({
                layers: `${timedLayerId},f`,
            })
            cy.get('[data-cy="time-slider-button"]').should('not.exist')

            // ----------------------------------------------------------------------------------------------------
            cy.log('visible non time enabled Layer, the button should not be visible')
            cy.goToMapView({
                layers: standard_layer,
            })
            cy.get('[data-cy="time-slider-button"]').should('not.exist')

            // ----------------------------------------------------------------------------------------------------
            cy.log('The following few tests use the same goToMapView call')
            cy.log('With a visible time enabled Layer, the button should be visible')
            cy.goToMapView({
                layers: `${timedLayerId}@year=${preSelectedYear}`,
            })
            cy.get('[data-cy="time-slider-button"]').should('be.visible')
            // ----------------------------------------------------------------------------------------------------
            cy.log(
                'when clicking on the time slider button, the time slider should show up. at the correct year'
            )
            cy.get('[data-cy="time-slider-button"]').click()
            cy.get('[data-cy="time-slider"]').should('be.visible')
            cy.get('[data-cy="time-slider-bar-cursor-year"]').should(
                'have.value',
                `${preSelectedYear}`
            )

            // ------------------------------------------------------------------------------------------------
            cy.log(
                'when removing the time slider, the time years in the time selector go back to their previous values'
            )
            cy.get('[data-cy="time-slider-button"]').click()
            cy.openMenuIfMobile()

            cy.get(`[data-cy="time-selector-${timedLayerId}-0"]`).should('contain', preSelectedYear)

            // ----------------------------------------------------------------------------------------------------
            cy.log(
                'when moving the time slider, we no longer have the same year as in the beginning'
            )
            cy.get('[data-cy="time-slider-button"]').click()

            const newYear = 2020
            moveSlider(1920)
            cy.get('[data-cy="time-slider-bar-cursor-year"]').should('have.value', `${newYear}`)
            // ----------------------------------------------------------------------------------------------------
            cy.log(
                'When removing the time slider after altering it, the new year should be present in the layers'
            )

            // proper way would be to use cy.tick, but I can't get it to work
            // it somehow gets into a race condition and the rendering isn't updated
            // after the debouncing is done
            // eslint-disable-next-line cypress/no-unnecessary-waiting
            cy.wait(1000)
            cy.get('[data-cy="time-slider-button"]').click()
            cy.openMenuIfMobile()

            cy.get(`[data-cy="time-selector-${timedLayerId}-0"]`).should('contain', newYear)

            // ------------------------------------------------------------------------------------------------
            cy.log(
                'when bringing back a previously active time slider, the year has been preserved'
            )
            cy.get('[data-cy="time-slider-button"]').click()
            cy.openMenuIfMobile()

            cy.get('[data-cy="time-slider-bar-cursor-year"]').should('have.value', `${newYear}`)
            cy.get(`[data-cy="time-selector-${timedLayerId}-0"]`).should('contain', newYear)

            // ------------------------------------------------------------------------------------------------
            cy.log('When clicking on the time slider bar, we should go to that year')
            cy.get(`[data-cy="time-slider-bar-${preSelectedYear}"]`).click({ force: true })
            cy.openMenuIfMobile()

            cy.get('[data-cy="time-slider-bar-cursor-year"]').should(
                'have.value',
                `${preSelectedYear}`
            )
            cy.get(`[data-cy="time-selector-${timedLayerId}-0"]`).should('contain', preSelectedYear)

            // ------------------------------------------------------------------------------------------------
            cy.log('Afterwards, the changes in the year should also be kept in the layers')
            cy.log(
                'When removing the time slider after altering it, the new year should be present in the layers'
            )
            cy.get('[data-cy="time-slider-button"]').click()
            cy.openMenuIfMobile()

            cy.get(`[data-cy="time-selector-${timedLayerId}-0"]`).should('contain', preSelectedYear)
        })
        it('checks that the time slider is functional and behave correctly with the timeSlider param at startup', () => {
            // ----------------------------------------------------------------------------------------------------
            cy.log(
                'With a visible time Layer and a TS parameter, the Time slider should appear at the correct year'
            )

            cy.goToMapView({
                layers: `${timedLayerId}@year=2019,f,;${timedLayerIdWithOddYear}@year=2009;${timedLayerIdWithAllYear}@year=2009`,
                timeSlider: 2013,
            })
            cy.get('[data-cy="time-slider-bar-cursor-year"]')
                .as('timeSliderYearCursor')
                .should('have.value', '2013')
            // ----------------------------------------------------------------------------------------------------
            cy.log('shows that the CSS is correct for all time enable layers')
            cy.log(' time selector years shown ')
            cy.openMenuIfMobile()
            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
            cy.get(`[data-cy="time-selector-${timedLayerId}-0"]`).should('contain', 2019)
            cy.log(`${timedLayerId} : CSS of time selectors on an invisible layer`)
            cy.get(`[data-cy="time-selector-${timedLayerId}-0"]`).click()
            cy.fixture('layers.fixture').then((layers) => {
                const timedLayerConfig = layers[timedLayerId]
                timedLayerConfig.timestamps.forEach((timestamp) => {
                    cy.get(`[data-cy="time-select-${timestamp}"]`).should('satisfy', (element) => {
                        const classList = Array.from(element[0].classList)
                        // in the invisible layer, the year is set to 2019 : it should still be 2019 and everything else
                        // should be a light button
                        return timestamp === '20190101'
                            ? isPrimaryBtn(classList)
                            : isLightBtn(classList)
                    })
                })

                // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                cy.log(
                    `${timedLayerIdWithOddYear} : CSS of time selectors on a layer with data on the preview Year selected`
                )
                cy.get(`[data-cy="time-selector-${timedLayerIdWithOddYear}-1"]`).should(
                    'contain',
                    2013
                )
                cy.get(`[data-cy="time-selector-${timedLayerIdWithOddYear}-1"]`).click()
                const oddTimestampLayer = layers[timedLayerIdWithOddYear]
                oddTimestampLayer.timestamps.forEach((timestamp) => {
                    cy.get(`[data-cy="time-select-${timestamp}"]`).should('satisfy', (element) => {
                        const classList = Array.from(element[0].classList)
                        // in the odd layer, the year is set to 2009 and the time slider to 2013:
                        // it should show 2013 as primary, 2009 as outline and everything else
                        // should be a light button
                        if (timestamp === '20130101') {
                            return isPrimaryBtn(classList)
                        } else {
                            return isLightBtn(classList)
                        }
                    })
                })
                // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                cy.get(`[data-cy="time-selector-${timedLayerIdWithAllYear}-2"]`).should(
                    'contain',
                    '-'
                )
                cy.get(`[data-cy="time-selector-${timedLayerIdWithAllYear}-2"]`).click()
                const allYearLayer = layers[timedLayerIdWithAllYear]
                allYearLayer.timestamps.forEach((timestamp) => {
                    cy.get(`[data-cy="time-select-${timestamp}"]`).should('satisfy', (element) => {
                        const classList = Array.from(element[0].classList)
                        return isLightBtn(classList)
                    })
                })
            })
            // ---------------------------------------------------------------------------------------------------
            cy.log(
                'If there is data common to all layers, the time slider goes to the youngest year in common'
            )
            cy.get('[data-cy="menu-swiss-flag"]').as('swissFlag').click()
            cy.goToMapView({ layers: `${timedLayerId};${timedLayerIdWithOddYear}` })
            cy.get('[data-cy="time-slider-button"]').as('timeSliderButton').click()
            cy.get('@timeSliderYearCursor').should('have.value', '2021')
            cy.url().should((url) => url.includes('timeSlider=2021'))
            // ---------------------------------------------------------------------------------------------------
            cy.log(
                'invisible time layer and timeSlider as parameter : time slider button should not appear and the parameter should not be in URL'
            )

            cy.get('@swissFlag').click()
            cy.goToMapView({
                layers: `${timedLayerId},f`,
                timeSlider: 2003,
            })
            cy.get('@timeSliderButton').should('not.exist')
            cy.url().should((url) => !url.includes('timeSlider='))

            // ---------------------------------------------------------------------------------------------------

            cy.log(
                'If there are no data common to all layers, the time slider should be set to the youngest year with data'
            )

            cy.get('@swissFlag').click()
            cy.goToMapView({
                layers: `${timedLayerId};${timedLayerIdWithOddYear};${timedLayerIdWithAllYear}`,
            })
            cy.get('@timeSliderButton').click()

            cy.fixture('layers.fixture').then((layers) => {
                const layerConfig = layers[timedLayerId]
                const youngestYearInConfig = layerConfig.timestamps[0].substring(0, 4)
                const oldestYearInConfig = layerConfig.timestamps[
                    layerConfig.timestamps.length - 1
                ].substring(0, 4)
                cy.get('@timeSliderYearCursor').should('have.value', youngestYearInConfig)
                cy.url().should((url) => url.includes(`timeSlider=${youngestYearInConfig}`))

                cy.log('Time slider should incorporate years older than default if present in data')
                cy.get('[data-cy="time-slider-dropdown-input"]').click()
                cy.get(`[data-cy="time-slider-dropdown-entry-${oldestYearInConfig}"]`).should(
                    'exist'
                )

                cy.log(
                    'Loading the app with a time slider value present in config but outside of default range should work without raising errors'
                )
                cy.get('@swissFlag').click()
                cy.goToMapView({ layers: timedLayerId, timeSlider: oldestYearInConfig })
                cy.get('@timeSliderYearCursor').should('have.value', oldestYearInConfig)
                cy.url().should((url) => !url.includes('timeSlider='))

                cy.get('@swissFlag').click()
                cy.goToMapView({ layers: timedLayerId, timeSlider: youngestYearInConfig })
                cy.get('@timeSliderYearCursor').should('have.value', youngestYearInConfig)
                cy.url().should((url) => !url.includes('timeSlider='))
            })

            // ---------------------------------------------------------------------------------------------------
            cy.log('The time slider should not appear and the url should not show the parameter')

            cy.get('@swissFlag').click()
            cy.goToMapView({ layers: timedLayerId, timeSlider: DEFAULT_OLDEST_YEAR - 1250 })
            cy.get('@timeSliderYearCursor').should('not.exist')
            cy.url().should((url) => !url.includes('timeSlider='))

            cy.goToMapView({ layers: timedLayerId, timeSlider: DEFAULT_YOUNGEST_YEAR + 1250 })
            cy.get('@timeSliderYearCursor').should('not.exist')
            cy.url().should((url) => !url.includes('timeSlider='))

            cy.goToMapView({ layers: timedLayerId, timeSlider: 'aCompletelyInvalidValue' })
            cy.get('@timeSliderYearCursor').should('not.exist')
            cy.url().should((url) => !url.includes('timeSlider='))

            // ---------------------------------------------------------------------------------------------------
            cy.log(
                'When having a duplicate layer, when one is invisible, they both still behave as expected'
            )
        })

        it('behaves correctly when years are being entered in the input', () => {
            cy.viewport(1920, 1080)
            cy.goToMapView({ layers: `${timedLayerId}@year=2019`, timeSlider: 2017 })
            cy.get(`[data-cy="button-open-visible-layer-settings-${timedLayerId}-0"]`).click()
            cy.get(`[data-cy="button-duplicate-layer-${timedLayerId}-0"]`).click()
            cy.get(`[data-cy="button-toggle-visibility-layer-${timedLayerId}-0"]`).click()
            cy.get(`[data-cy="time-selector-${timedLayerId}-0"]`).should('contain', 2017)
            cy.get(`[data-cy="time-selector-${timedLayerId}-1"]`).should('contain', 2017)

            // ---------------------------------------------------------------------------------------------------
            cy.log('Check time slider year cursor text input')

            cy.get('[data-cy="time-slider-bar-cursor-arrow"]')
                .invoke('attr', 'style')
                .then(($barCursorPosition) => {
                    cy.log($barCursorPosition)

                    cy.log('Time slider does not accept non number characters')
                    cy.get('[data-cy="time-slider-bar-cursor-year"]').clear()
                    cy.get('[data-cy="time-slider-bar-cursor-year"]').type('asdf')
                    cy.get('[data-cy="time-slider-bar-cursor-arrow"]')
                        .invoke('attr', 'style')
                        .should('eq', $barCursorPosition)
                    cy.get('[data-cy="time-slider-bar-cursor-year"]').should('have.value', '')

                    cy.log('Time slider does not move with out of bound year')
                    cy.get('[data-cy="time-slider-bar-cursor-year"]').clear()
                    cy.get('[data-cy="time-slider-bar-cursor-year"]').type('1191')
                    cy.get('[data-cy="time-slider-bar-cursor-arrow"]')
                        .invoke('attr', 'style')
                        .should('eq', $barCursorPosition)
                    cy.get('[data-cy="time-slider-bar-cursor-year"]').clear()
                    cy.get('[data-cy="time-slider-bar-cursor-year"]').type('654321')
                    cy.get('[data-cy="time-slider-bar-cursor-arrow"]')
                        .invoke('attr', 'style')
                        .should('eq', $barCursorPosition)
                    cy.log('Time slider is limited to four characters')
                    cy.get('[data-cy="time-slider-bar-cursor-year"]').should('have.value', '6543')

                    cy.log('Time slider does not move with incomplete year')
                    cy.get('[data-cy="time-slider-bar-cursor-year"]').clear()
                    cy.get('[data-cy="time-slider-bar-cursor-year"]').type('200')
                    cy.get('[data-cy="time-slider-bar-cursor-arrow"]')
                        .invoke('attr', 'style')
                        .should('eq', $barCursorPosition)

                    cy.log('Time slider Bar moves when valid year entered')
                    cy.get('[data-cy="time-slider-bar-cursor-year"]').clear()
                    cy.get('[data-cy="time-slider-bar-cursor-year"]').type('2000')

                    // proper way would be to use cy.tick, but I can't get it to work
                    // it somehow gets into a race condition and the rendering isn't updated
                    // after the debouncing is done
                    // eslint-disable-next-line cypress/no-unnecessary-waiting
                    cy.wait(750)

                    cy.get('[data-cy="time-slider-bar-cursor-arrow"]')
                        .invoke('attr', 'style')
                        .then(extractDecimal)
                        .should('lt', extractDecimal($barCursorPosition))
                })
        })

        it('checks that the timeslider dropdown is functional and behaves correctly', () => {
            // ----------------------------------------------------------------------------------------------------
            cy.log('Going to the map, the dropdown appears')
            cy.goToMapView({
                layers: `${timedLayerId}@year=${preSelectedYear}`,
                timeSlider: preSelectedYear,
            })
            cy.get('[data-cy="time-slider-bar"]').should('not.be.visible')
            cy.get('[data-cy="time-slider-dropdown"]').should('be.visible')

            cy.log('When resizing the viewport to lg screens, the slider should appear')
            cy.viewport(1920, 1080)
            cy.get('[data-cy="time-slider-bar"]').should('be.visible')
            cy.get('[data-cy="time-slider-dropdown"]').should('not.be.visible')

            cy.log('When resizing the viewport to sm screens, the dropdown should appear')
            cy.viewport(620, 568)
            cy.get('[data-cy="time-slider-bar"]').should('not.be.visible')
            cy.get('[data-cy="time-slider-dropdown"]').should('be.visible')

            cy.get('[data-cy="time-slider-dropdown-input"]').type('1999{downArrow}{enter}')

            cy.log(
                'When resizing back to lg screens, the chosen year from the dropdown should be correct in the time slider'
            )
            cy.viewport(1920, 1080)
            cy.get('[data-cy="time-slider-bar-cursor-year"]').should('have.value', 1999)
        })
    })
})
