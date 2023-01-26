/// <reference types="cypress" />

import { EditableFeatureTypes } from '@/api/features.api'
import { MAP_CENTER } from '@/config'
import { BLACK, GREEN, LARGE, MEDIUM, RED, SMALL } from '@/utils/featureStyleUtils'

const drawingStyleMarkerPopup = '[data-cy="drawing-style-marker-popup"]'
const drawingStyleMarkerShowAllIconsButton = '[data-cy="drawing-style-show-all-icons-button"]'
const drawingStyleMarkerIconSetSelector =
    '[data-cy="drawing-style-icon-set-button"] [data-cy="dropdown-main-button"]'

const drawingStyleTextButton = '[data-cy="drawing-style-text-button"]'
const drawingStyleTextPopup = '[data-cy="drawing-style-text-popup"]'

const drawingStyleColorBox = '[data-cy="drawing-style-color-select-box"]'
const drawingStyleSizeSelector = '[data-cy="drawing-style-size-selector"]'

const createAPoint = (kind, x = 0, y = 0, xx = MAP_CENTER[0], yy = MAP_CENTER[1]) => {
    let kmlId
    cy.clickDrawingTool(kind)
    cy.readWindowValue('map').then((map) => {
        // Create a point, a geojson will appear in the store
        cy.simulateEvent(map, 'pointermove', x, y)
        cy.simulateEvent(map, 'pointerdown', x, y)
        cy.simulateEvent(map, 'pointerup', x, y)
        cy.readDrawingFeatures('Point', (features) => {
            const coos = features[0].getGeometry().getCoordinates()
            expect(coos[0]).to.be.closeTo(xx, 0.1, `bad: ${JSON.stringify(coos)}`)
            expect(coos[1]).to.be.closeTo(yy, 0.1, `bad: ${JSON.stringify(coos)}`)
        })
        cy.wait('@post-kml').then((interception) => {
            cy.checkKMLRequest(interception, ['Placemark'])
            kmlId = interception.response.body.id
        })
    })
    return kmlId
}

const createMarkerAndOpenIconStylePopup = () => {
    const kmlId = createAPoint(
        EditableFeatureTypes.MARKER,
        0,
        -200,
        MAP_CENTER[0],
        6156527.960512564
    )
    cy.wait('@icon-sets')
    cy.wait('@icon-set-default')
    cy.get('[data-cy="drawing-style-marker-button"]').click()
    return kmlId
}

/** @param {FeatureStyleColor} color */
const clickOnAColor = (color) => {
    cy.get(
        `${drawingStyleMarkerPopup} ${drawingStyleColorBox} [data-cy="color-selector-${color.name}"]`
    ).click()
    cy.checkDrawnGeoJsonProperty('iconUrl', `-${color.rgbString}.png`, true)
}

/** @param {String} size Translated in english */
const changeIconSize = (size) => {
    cy.get(
        `${drawingStyleMarkerPopup} ${drawingStyleSizeSelector} [data-cy="dropdown-main-button"]`
    )
        .should('be.visible')
        .click({ force: true })
    cy.get(
        `${drawingStyleMarkerPopup} ${drawingStyleSizeSelector} [data-cy="dropdown-item-${size}"]`
    ).click()
}

const getCyDropdownItemIconSetName = (name) => {
    let translatedName
    switch (name) {
        case 'default':
            translatedName = 'default'
            break
        case 'babs':
            translatedName = 'civil symbols'
            break
    }
    return `[data-cy="dropdown-item-${translatedName}"]`
}

describe('Drawing marker/points', () => {
    beforeEach(() => {
        cy.intercept(`**/api/icons/sets/default/icons/**${GREEN.rgbString}.png`, {
            fixture: 'service-icons/placeholder.png',
        }).as('icon-default-green')
        cy.goToDrawing()
    })
    it('Re-requests all icons from an icon sets with the new color whenever the color changed', () => {
        createMarkerAndOpenIconStylePopup()
        clickOnAColor(GREEN)
        cy.wait('@icon-default-green')
    })
    context('simple interaction with a marker', () => {
        it('toggles the marker symbol popup when clicking button', () => {
            createMarkerAndOpenIconStylePopup()
            cy.get(drawingStyleMarkerPopup).should('be.visible')
        })
        it('can move a marker by drag&dropping', () => {
            createAPoint(EditableFeatureTypes.MARKER)
            // Move it, the geojson geometry should move
            cy.readWindowValue('map').then((map) => {
                cy.simulateEvent(map, 'pointerdown', 0, 0)
                cy.simulateEvent(map, 'pointermove', 200, 140)
                cy.simulateEvent(map, 'pointerdrag', 200, 140)
                cy.simulateEvent(map, 'pointerup', 200, 140)
            })
            cy.readDrawingFeatures('Point', (features) => {
                const coos = features[0].getGeometry().getCoordinates()
                expect(coos[0]).to.be.closeTo(1160201.3, 0.1, `bad: ${JSON.stringify(coos)}`)
                expect(coos[1]).to.be.closeTo(5740710.53, 0.1, `bad: ${JSON.stringify(coos)}`)
            })
        })
        it('changes the title of a marker', () => {
            createAPoint(EditableFeatureTypes.MARKER)
            cy.get('[data-cy="drawing-style-feature-title"]').type('This is a title')
            cy.checkDrawnGeoJsonProperty('title', 'This is a title')
        })
        it('changes the description of a marker', () => {
            createAPoint(EditableFeatureTypes.MARKER)
            cy.get('[data-cy="drawing-style-feature-description"]').type('This is a description')
            cy.checkDrawnGeoJsonProperty('description', 'This is a description')
        })
    })

    context('marker styling popup', () => {
        context('color change', () => {
            beforeEach(() => {
                cy.intercept(`**/v4/icons/sets/default/icons/**${GREEN.rgbString}.png`, {
                    fixture: 'service-icons/placeholder.png',
                }).as('icon-default-green')
            })
            it('Re-requests all icons from an icon sets with the new color whenever the color changed', () => {
                createMarkerAndOpenIconStylePopup()
                clickOnAColor(GREEN)
                cy.wait('@icon-default-green')
            })
            it('Modify the KML file whenever the color of the icon changes', () => {
                const kmlId = createMarkerAndOpenIconStylePopup()
                clickOnAColor(GREEN)
                cy.wait('@update-kml').then((interception) => {
                    cy.checkKMLRequest(interception, [/"fillColor":{[^}]*"name":"green"/], kmlId)
                })
            })
        })

        context('size change', () => {
            beforeEach(() => {
                const fixture = 'service-icons/placeholder.png'
                cy.intercept(`**/icons/**@${LARGE.iconScale}x-${RED.rgbString}.png`, {
                    fixture,
                }).as('large-icon')

                cy.intercept(`**/icons/**@${SMALL.iconScale}x-${RED.rgbString}.png`, {
                    fixture,
                }).as('small-icon')
            })
            it('uses medium as its default size', () => {
                createMarkerAndOpenIconStylePopup()
                cy.wait('@icon-default')
            })
            it('changes the GeoJSON size when changed on the UI', () => {
                createMarkerAndOpenIconStylePopup()
                changeIconSize('large')
                cy.wait('@large-icon')
            })
            it('Updates the KML with the new icon size whenever it changes in the UI', () => {
                const kmlId = createMarkerAndOpenIconStylePopup()
                changeIconSize('small')
                cy.wait('@small-icon')
                cy.wait('@update-kml').then((interception) => {
                    cy.checkKMLRequest(
                        interception,
                        [
                            /"iconSize":{[^}]*"label":"small_size"/,
                            /"fillColor":{[^}]*"fill":"#ff0000"/,
                        ],
                        kmlId
                    )
                })
            })
        })

        context('icon change', () => {
            it('Shows the default icon set by default with the red color in the icon style popup', () => {
                createMarkerAndOpenIconStylePopup()
                cy.wait('@icon-default')
                    .its('request.url')
                    .should('include', '/api/icons/sets/default/icons/')
                    .should('include', `${RED.rgbString}.png`)
            })
            it('Shows all available icon sets in the selector', () => {
                createMarkerAndOpenIconStylePopup()
                cy.get(drawingStyleMarkerIconSetSelector)
                    .should('be.visible')
                    .click({ force: true })
                cy.fixture('service-icons/sets.fixture.json').then((iconSets) => {
                    iconSets.items.forEach((iconSet) => {
                        cy.get(getCyDropdownItemIconSetName(iconSet.name)).should('be.visible')
                    })
                })
            })
            it('Changes the icon selector box content when the icon set changes', () => {
                createMarkerAndOpenIconStylePopup()
                cy.get(drawingStyleMarkerIconSetSelector)
                    .should('be.visible')
                    .click({ force: true })
                cy.get('[data-cy="dropdown-item-civil symbols"]').click()
                cy.wait('@icon-set-babs')
                cy.wait('@icon-babs')
                    .its('request.url')
                    .should('include', '/api/icons/sets/babs/icons/')
                    .should('include', '.png')
                // as babs icon set is not colorable, the color box should have disappeared
                cy.get(`${drawingStyleMarkerPopup} ${drawingStyleColorBox}`).should('not.exist')
            })
            it('Changes the marker icon when a new one is selected in the icon selector', () => {
                const kmlId = createMarkerAndOpenIconStylePopup()
                cy.get(drawingStyleMarkerIconSetSelector)
                    .should('be.visible')
                    .click({ force: true })
                // showing all icons of this sets so that we may choose a new one
                cy.get(`${drawingStyleMarkerPopup} ${drawingStyleMarkerShowAllIconsButton}`).click()
                cy.fixture('service-icons/set-default.fixture.json').then((defaultIconSet) => {
                    // picking up the 4th icon of the set
                    const fourthIcon = defaultIconSet.items[3]
                    cy.get(
                        `${drawingStyleMarkerPopup} [data-cy="drawing-style-icon-selector-${fourthIcon.name}"]`
                    )
                        .should('be.visible')
                        .click({ force: true })
                    cy.checkDrawnGeoJsonProperty('icon.name', fourthIcon.name, true)
                    cy.wait('@update-kml').then((interception) =>
                        cy.checkKMLRequest(
                            interception,
                            [new RegExp(`"icon":{[^}]*"name":"${fourthIcon.name}"`)],
                            kmlId
                        )
                    )
                })
            })
        })
    })

    context('text styling popup', () => {
        it('creates a text', () => {
            createAPoint(EditableFeatureTypes.ANNOTATION, 0, -200, MAP_CENTER[0], 6156527.960512564)
        })
        ;[EditableFeatureTypes.MARKER, EditableFeatureTypes.ANNOTATION].forEach((drawingMode) => {
            it(`shows the ${drawingMode} styling popup when drawing given feature`, () => {
                createAPoint(drawingMode, 0, -200, MAP_CENTER[0], 6156527.960512564)

                // Opening text popup
                cy.get(drawingStyleTextButton).click()
                cy.get(drawingStyleTextPopup).should('be.visible')

                cy.get(
                    `${drawingStyleTextPopup} ${drawingStyleSizeSelector} [data-cy="dropdown-main-button"]`
                ).click({ force: true })
                cy.get(
                    `${drawingStyleTextPopup} ${drawingStyleSizeSelector} [data-cy="dropdown-item-medium"]`
                ).click({ force: true })
                cy.checkDrawnGeoJsonProperty('iconSize.textScale', MEDIUM.textScale)

                cy.get(
                    `${drawingStyleTextPopup} [data-cy="drawing-style-text-color-${BLACK.name}"]`
                ).click({ force: true })
                cy.checkDrawnGeoJsonProperty('textColor.fill', BLACK.fill)

                // Closing the popup
                cy.get(drawingStyleTextButton).click()
                cy.get(drawingStyleTextPopup).should('not.exist')

                // Opening again the popup
                cy.get(drawingStyleTextButton).click()
                cy.get(drawingStyleTextPopup).should('be.visible')
            })
        })
    })
})
