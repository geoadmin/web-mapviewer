/// <reference types="cypress" />

import { forEachTestViewport } from '../support'
import features from '../fixtures/features.fixture.json'

function longClickOnMap() {
    cy.readWindowValue('map').then((map) => {
        cy.simulateEvent(map, 'pointerdown')
        cy.wait(500) // eslint-disable-line
        cy.simulateEvent(map, 'pointerup')
        cy.simulateEvent(map, 'singleclick')
    })
}

describe('The infobox', () => {
    forEachTestViewport((viewport, isMobile, isTablet, dimensions) => {
        context(
            `viewport: ${viewport}`,
            {
                viewportWidth: dimensions.width,
                viewportHeight: dimensions.height,
            },
            () => {
                beforeEach(() => {
                    const layer = 'test.wmts.layer'
                    cy.intercept('**/MapServer/identify**', features)
                    cy.intercept('**/MapServer/**/htmlPopup**', htmlPopup)
                    cy.intercept(`**/MapServer/${layer}/**geometryFormat**`, features.results[0])
                    cy.goToMapView('en', { layers: layer })
                })
                it.only('is visible if features selected', () => {
                    cy.get('[data-cy="highlighted-features"]').should('not.exist')

                    longClickOnMap()
                    cy.waitUntilState((state) => {
                        return state.feature.selectedFeatures.length > 0
                    })

                    cy.get('[data-cy="highlighted-features"]').should('be.visible')
                })
                it('can float or stick to the bottom', () => {
                    longClickOnMap()
                    cy.waitUntilState((state) => {
                        return state.feature.selectedFeatures.length > 0
                    })

                    cy.get('[data-cy="popover"]').should('be.visible')
                    cy.get('[data-cy="tooltip"]').should('not.exist')

                    cy.get('[data-cy="toggle-floating-off"]').click()
                    cy.get('[data-cy="popover"]').should('not.exist')
                    cy.get('[data-cy="tooltip"]').should('be.visible')

                    cy.get('[data-cy="toggle-floating-on"]').click()
                    cy.get('[data-cy="popover"]').should('be.visible')
                    cy.get('[data-cy="tooltip"]').should('not.exist')
                })
                it('sets its height dynamically if at the bottom', () => {
                    longClickOnMap()
                    cy.waitUntilState((state) => {
                        return state.feature.selectedFeatures.length > 0
                    })

                    cy.get('[data-cy="toggle-floating-off"]').click()
                    cy.get('[data-cy="tooltip-content"]').then(($element) => {
                        const maxHeight = $element
                            .children()
                            .toArray()
                            .map((child) => child.offsetHeight)
                            .reduce((max, child) => Math.max(max, child), 0)

                        expect($element.height()).to.be.equal(maxHeight)
                    })
                })
            }
        )
    })
})

var htmlPopup = `
<div class="chbabskulturgueter htmlpopup-container">
    <div class="htmlpopup-header">
        <span>Protection of cultural property inventory with objects of national importance</span> (Federal Office for Civil Protection)
    </div>
    <div class="htmlpopup-content">
        <table>
            <tr><td class="cell-left">Description</td>  <td>Schweizerisches Literaturarchiv</td></tr>
            <tr><td class="cell-left">Y-Coordinate</td> <td>2600847</td></tr>
            <tr><td class="cell-left">X-Coordinate</td> <td>1198903</td></tr>
            <tr><td class="cell-left">City</td>         <td>Bern</td></tr>
            <tr><td class="cell-left">Canton</td>       <td>BE</td></tr>
            <tr>
                <td class="cell-left"></td>
                <td>
                    <a href="#">
                        More info&nbsp;<img src="//mf-chsdi3.int.bgdi.ch/1639471066/static/images/ico_extern.gif" />
                    </a>
                </td>
            </tr>
            <tr>
                <td class="cell-left"></td>
                <td><a href="#">Link to object</a></td>
            </tr>
        </table>
    </div>
</div>
`
