import { OLDEST_YEAR, YOUNGEST_YEAR } from '@/config'

/// <reference types="cypress" />
describe('Cypress tests covering the time slider, its functionalities and its URL parameter', () => {
    context('checking the time slider behavior, both on startup and during use', () => {
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
        const standard_layer = 'test.wmts.layer'
        const timestamps = {}
        const time_layer_std = 'test.timeenabled.wmts.layer' // years 2021 - 2015

        timestamps[time_layer_std] = [
            '20210101',
            '20200101',
            '20190101',
            '20180101',
            '20170101',
            '20160101',
            '20150101',
        ]
        const time_layer_odd = 'test.timeenabled.wmts.layer.2' // odd years 2023 - 2009
        timestamps[time_layer_odd] = [
            '20230101',
            '20210101',
            '20190101',
            '20170101',
            '20150101',
            '20130101',
            '20110101',
            '20090101',
        ]
        const time_layer_with_all = 'test.timeenabled.wmts.layer.3' // years = all (9999), 2010 2009
        timestamps[time_layer_with_all] = ['99990101', '20100101', '20090101']
        // those three classes are supposed to be mutually exclusive
        function isPrimaryBtn(classList) {
            return (
                classList.includes('btn-primary') &&
                !classList.includes('btn-light') &&
                !classList.includes('btn-outline-primary')
            )
        }
        function isPrimaryOutlineBtn(classList) {
            return (
                classList.includes('btn-outline-primary') &&
                !classList.includes('btn-light') &&
                !classList.includes('btn-primary')
            )
        }
        function isLightBtn(classList) {
            return (
                classList.includes('btn-light') &&
                !classList.includes('btn-primary') &&
                !classList.includes('btn-outline-primary')
            )
        }
        it('checks that the time slider is functional and behave correctly', () => {
            // ---------------------- TEST 1 ------------------------------------------------------------------------------
            cy.log('Test 1 : Invisible time layer given. time slider button should not appear')
            cy.goToMapView({
                layers: `${time_layer_std},f`,
            })
            cy.get('[data-cy="time-slider-button"]').should('not.exist')

            // ---------------------- TEST 2 ------------------------------------------------------------------------------
            cy.log('Test 2: visible non time enabled Layer, the button should not be visible')
            cy.goToMapView({
                layers: standard_layer,
            })
            cy.get('[data-cy="time-slider-button"]').should('not.exist')

            // ---------------------- TEST 3 ------------------------------------------------------------------------------
            cy.log('Test 3 to 7 uses the same goToMapView call')
            cy.log('Test 3: With a visible time enabled Layer, the button should be visible')
            cy.goToMapView({
                layers: `${time_layer_std}@year=${preSelectedYear}`,
            })
            cy.get('[data-cy="time-slider-button"]').should('be.visible')
            // ---------------------- TEST 4 ------------------------------------------------------------------------------
            cy.log(
                'Test 4: when clicking on the time slider button, the time slider should show up. at the correct year'
            )
            cy.get('[data-cy="time-slider-button"]').click()
            cy.get('[data-cy="time-slider"]').should('be.visible')
            cy.get('[data-cy="time-slider-current-year"]').should('contain', preSelectedYear)

            // ---------------------- TEST 5 ------------------------------------------------------------------------------
            cy.log(
                'Test 5: when moving the time slider, we no longer have the same year as in the beginning'
            )
            const newYear = 2020
            moveSlider(200)
            cy.get('[data-cy="time-slider-current-year"]').should('contain', newYear)

            // ---------------------- TEST 6 --------------------------------------------------------------------------
            cy.log(
                'Test 6: when removing the time slider, the time years in the time selector go back to their previous values'
            )
            cy.get('[data-cy="time-slider-button"]').click()
            cy.openMenuIfMobile()

            cy.get(`[data-cy="time-selector-${time_layer_std}-0"]`).should(
                'contain',
                preSelectedYear
            )
            cy.closeMenuIfMobile()

            // ---------------------- TEST 7 --------------------------------------------------------------------------
            cy.log(
                'Test 7: when bringing back a previously active time slider, the year has been preserved'
            )
            cy.get('[data-cy="time-slider-button"]').click()
            cy.openMenuIfMobile()

            cy.get('[data-cy="time-slider-current-year"]').should('contain', newYear)
            cy.get(`[data-cy="time-selector-${time_layer_std}-0"]`).should('contain', newYear)
            cy.closeMenuIfMobile()

            // ---------------------- TEST 8 ------------------------------------------------------------------------------
            cy.log(
                'Test 8: With a visible time Layer and a TS parameter, the Time slider should appear at the correct year'
            )

            cy.goToMapView({
                layers: `${time_layer_std}@year=2019,f,;${time_layer_odd}@year=2009;${time_layer_with_all}@year=2009`,
                timeSlider: 2013,
            })
            cy.get('[data-cy="time-slider-current-year"]').should('contain', 2013)
            // ---------------------- TEST 9 ------------------------------------------------------------------------------
            cy.log('Test 9: shows that the CSS is correct for all time enable layers')
            cy.log(' time selector years shown ')
            cy.openMenuIfMobile()
            cy.get(`[data-cy="time-selector-${time_layer_std}-0"]`).should('contain', 2019)
            cy.get(`[data-cy="time-selector-${time_layer_odd}-1"]`).should('contain', 2013)
            cy.get(`[data-cy="time-selector-${time_layer_with_all}-2"]`).should('contain', '-')
            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
            cy.log(`${time_layer_std} : CSS of time selectors on an invisible layer`)
            cy.get(`[data-cy="time-selector-${time_layer_std}-0"]`).click()
            timestamps[time_layer_std].forEach((timestamp) => {
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
                `${time_layer_odd} : CSS of time selectors on a layer with data on the preview Year selected`
            )
            cy.get(`[data-cy="time-selector-${time_layer_odd}-1"]`).click()
            timestamps[time_layer_odd].forEach((timestamp) => {
                cy.get(`[data-cy="time-select-${timestamp}"]`).should('satisfy', (element) => {
                    const classList = Array.from(element[0].classList)
                    // in the odd layer, the year is set to 2009 and the time slider to 2013:
                    // it should show 2013 as primary, 2009 as outline and everything else
                    // should be a light button
                    if (timestamp === '20130101') {
                        return isPrimaryBtn(classList)
                    } else {
                        return timestamp === '20090101'
                            ? isPrimaryOutlineBtn(classList)
                            : isLightBtn(classList)
                    }
                })
            })
            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
            cy.get(`[data-cy="time-selector-${time_layer_with_all}-2"]`).click()
            timestamps[time_layer_with_all].forEach((timestamp) => {
                cy.get(`[data-cy="time-select-${timestamp}"]`).should('satisfy', (element) => {
                    const classList = Array.from(element[0].classList)
                    // in the 'all' layer, the time slider is over a non existing value,
                    // which means there is no primary button, and that the base value of
                    // the layer (2009) should be an outline. Everything else should be
                    // a light button

                    return timestamp === '20090101'
                        ? isPrimaryOutlineBtn(classList)
                        : isLightBtn(classList)
                })
            })
            cy.closeMenuIfMobile()
            // ---------------------- TEST 10 -----------------------------------------------------------------------------
            cy.log(
                'Test 10: When using the timeSlider with multiple layers, if there is data common to all layers, the time slider goes to the youngest year in common'
            )
            cy.get('[data-cy="menu-swiss-flag"').click()
            cy.goToMapView({ layers: `${time_layer_std};${time_layer_odd}` })
            cy.get('[data-cy="time-slider-button"]').click()
            cy.get('[data-cy="time-slider-current-year"]').should('contain', 2021)
            cy.url().should((url) => url.includes('timeSlider=2021'))
            // ---------------------- TEST 11 -----------------------------------------------------------------------------
            cy.log(
                'Test 11: invisible time layer and timeSlider as parameter : time slider button should not appear and the parameter should not be in URL'
            )

            cy.get('[data-cy="menu-swiss-flag"').click()
            cy.goToMapView({
                layers: `${time_layer_std},f`,
                timeSlider: 2003,
            })
            cy.get('[data-cy="time-slider-button"]').should('not.exist')
            cy.url().should((url) => !url.includes('timeSlider='))

            // ---------------------- TEST 12 -----------------------------------------------------------------------------

            cy.log(
                'Test 12: When using the timeSlider with multiple layers, if there are no data common to all layers, the time slider should be set to the youngest year with data'
            )

            cy.get('[data-cy="menu-swiss-flag"').click()
            cy.goToMapView({ layers: `${time_layer_std};${time_layer_odd};${time_layer_with_all}` })
            cy.get('[data-cy="time-slider-button"]').click()
            cy.get('[data-cy="time-slider-current-year"]').should('contain', 2023)
            cy.url().should((url) => url.includes('timeSlider=2023'))

            // ---------------------- TEST 13 -----------------------------------------------------------------------------
            cy.log(
                'Test 13: When using a wrong Time Slider Parameter, the time slider should not appear and the url should not show the parameter'
            )

            cy.get('[data-cy="menu-swiss-flag"').click()
            cy.goToMapView({ layers: time_layer_std, timeSlider: OLDEST_YEAR - 1250 })
            cy.get('[data-cy="time-slider-current-year"]').should('not.exist')
            cy.url().should((url) => !url.includes('timeSlider='))

            cy.get('[data-cy="menu-swiss-flag"').click()
            cy.goToMapView({ layers: time_layer_std, timeSlider: YOUNGEST_YEAR + 1250 })
            cy.get('[data-cy="time-slider-current-year"]').should('not.exist')
            cy.url().should((url) => !url.includes('timeSlider='))

            cy.get('[data-cy="menu-swiss-flag"').click()
            cy.goToMapView({ layers: time_layer_std, timeSlider: 'aCompletelyInvalidValue' })
            cy.get('[data-cy="time-slider-current-year"]').should('not.exist')
            cy.url().should((url) => !url.includes('timeSlider='))

            // ---------------------- TEST 14 -----------------------------------------------------------------------------
            cy.log(
                'Test 14: When having a duplicate layer, when one is invisible, they both still behave as expected'
            )
            cy.goToMapView({ layers: `${time_layer_std}@year=2019`, timeSlider: 2017 })
            cy.openMenuIfMobile()
            cy.get(`[data-cy="button-open-visible-layer-settings-${time_layer_std}-0"]`).click()
            cy.get(`[data-cy="button-duplicate-layer-${time_layer_std}-0"]`).click()
            cy.get(`[data-cy="button-toggle-visibility-layer-${time_layer_std}-0"]`).click()
            cy.get(`[data-cy="time-selector-${time_layer_std}-0"]`).should('contain', 2019)
            cy.get(`[data-cy="time-selector-${time_layer_std}-1"]`).should('contain', 2017)

            it('should move the timeslider with mouse drag and text input', () => {
                cy.goToMapView({
                    layers: `test.timeenabled.wmts.layer@year=${preSelectedYear}`,
                })
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
                        cy.get('[data-cy="time-slider-bar-cursor-year"]').should(
                            'have.value',
                            '6543'
                        )

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
})
