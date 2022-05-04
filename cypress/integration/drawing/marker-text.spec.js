/// <reference types="cypress" />

import { SMALL, MEDIUM, LARGE } from '@/modules/drawing/lib/drawingStyleSizes'
import { RED, GREEN, BLACK } from '@/modules/drawing/lib/drawingStyleColor'
import { BREAKPOINT_PHONE_WIDTH, MAP_CENTER } from '@/config'

const drawingStyleTitle = '[data-cy="drawing-style-feature-title"]'
const drawingStyleDescription = '[data-cy="drawing-style-feature-description"]'

const drawingStyleMarkerButton = '[data-cy="drawing-style-marker-button"]'
const drawingStyleMarkerPopup = '[data-cy="drawing-style-marker-popup"]'
// const drawingStyleMarkerShowAllIconsButton = '[data-cy="drawing-style-show-all-icons-button"]'
const drawingStyleMarkerIconSetSelector = '[data-cy="drawing-style-icon-set-button"]'

const drawingStyleTextButton = '[data-cy="drawing-style-text-button"]'
const drawingStyleTextPopup = '[data-cy="drawing-style-text-popup"]'

const drawingStyleColorBox = '[data-cy="drawing-style-color-select-box"]'
const drawingStyleSizeSelector = '[data-cy="drawing-style-size-selector"]'

const createAPoint = (kind, x = 0, y = 0, xx = MAP_CENTER[0], yy = MAP_CENTER[1]) => {
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
        cy.wait('@post-kml').then((interception) =>
            cy.checkKMLRequest(interception, ['Placemark'], true)
        )
    })
}

const createMarkerAndOpenIconStylePopup = () => {
    createAPoint('marker', 0, -200, MAP_CENTER[0], 6156527.960512564)
    cy.wait('@iconSets')
    cy.wait('@iconSet-default')
    cy.get(drawingStyleMarkerButton).click()
}

/** @param {DrawingStyleColor} color */
const clickOnAColor = (color) => {
    cy.get(
        `${drawingStyleMarkerPopup} ${drawingStyleColorBox} [data-cy="color-selector-${color.name}"]`
    ).click()
    cy.checkDrawnGeoJsonProperty('icon', `-${color.rgbString}.png`, true)
}

/** @param {DrawingStyleSize} size */
const changeIconSize = (size) => {
    cy.get(`${drawingStyleMarkerPopup} ${drawingStyleSizeSelector}`).click()
    cy.get(
        `${drawingStyleMarkerPopup} [data-cy="drawing-style-size-selector-${size.label}"]`
    ).click()
}

describe('Drawing marker/points', () => {
    beforeEach(() => {
        cy.intercept(`**/api/icons/sets/default/icons/**${GREEN.rgbString}.png`, {
            fixture: 'service-icons/placeholder.png',
        }).as('icon-default-green')
        cy.goToDrawing()
    })
    // see : https://jira.swisstopo.ch/browse/BGDIINF_SB-2182
    // it('Re-requests all icons from an icon sets with the new color whenever the color changed', () => {
    //     createMarkerAndOpenIconStylePopup()
    //     clickOnAColor(GREEN)
    //     cy.wait('@icon-default-green')
    // })
    context('simple interaction with a marker', () => {
        it('toggles the marker symbol popup when clicking button', () => {
            createMarkerAndOpenIconStylePopup()
            cy.get(drawingStyleMarkerPopup).should('be.visible')
        })
        it('can move a marker by drag&dropping', () => {
            createAPoint('marker')
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
            createAPoint('marker')
            cy.get(drawingStyleTitle).type('This is a title')
            cy.checkDrawnGeoJsonProperty('text', 'This is a title')
        })
        it('changes the description of a marker', () => {
            createAPoint('marker')
            cy.get(drawingStyleDescription).type('This is a description')
            cy.checkDrawnGeoJsonProperty('description', 'This is a description')
        })
    })

    context('marker styling popup', () => {
        const checkIconInKml = (expectedIconUrl) => {
            cy.wait('@update-kml').then((interception) => {
                cy.checkKMLRequest(interception, [
                    new RegExp(`<Data name="icon">.+?${expectedIconUrl}.+?<\\/Data>`),
                ])
            })
        }

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
                createMarkerAndOpenIconStylePopup()
                clickOnAColor(GREEN)
                checkIconInKml(`-${GREEN.rgbString}.png`)
            })
        })

        context('size change', () => {
            beforeEach(() => {
                cy.intercept(`**/icons/**@${LARGE.iconScale}x-${RED.rgbString}.png`, {
                    fixture: 'service-icons/placeholder.png',
                }).as('large-icon')

                cy.intercept(`**/icons/**@${SMALL.iconScale}x-${RED.rgbString}.png`, {
                    fixture: 'service-icons/placeholder.png',
                }).as('small-icon')
            })
            it('uses medium as its default size', () => {
                createMarkerAndOpenIconStylePopup()
                cy.wait('@icon-default')
            })
            it('changes the GeoJSON size when changed on the UI', () => {
                createMarkerAndOpenIconStylePopup()
                changeIconSize(LARGE)
                cy.wait('@large-icon')
            })
            it('Updates the KML with the new icon size whenever it changes in the UI', () => {
                createMarkerAndOpenIconStylePopup()
                changeIconSize(SMALL)
                cy.wait('@small-icon')
                checkIconInKml(`@${SMALL.iconScale}x-${RED.rgbString}`)
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
                cy.get(drawingStyleMarkerIconSetSelector).click()
                cy.fixture('service-icons/sets.fixture.json').then((iconSets) => {
                    iconSets.items.forEach((iconSet) => {
                        cy.get(
                            `[data-cy="drawing-style-icon-set-selector-${iconSet.name}"]`
                        ).should('be.visible')
                    })
                })
            })
            it('Changes the icon selector box content when the icon set changes', () => {
                createMarkerAndOpenIconStylePopup()
                cy.get(drawingStyleMarkerIconSetSelector).click()
                cy.get('[data-cy="drawing-style-icon-set-selector-second"]').click()
                cy.wait('@iconSet-second')
                cy.wait('@icon-second')
                    .its('request.url')
                    .should('include', '/api/icons/sets/second/icons/')
                    .should('include', '.png')
                // as second icon set is not colorable, the color box should have disappeared
                cy.get(`${drawingStyleMarkerPopup} ${drawingStyleColorBox}`).should('not.exist')
            })
            // see : https://jira.swisstopo.ch/browse/BGDIINF_SB-2182
            it.skip('Changes the marker icon when a new one is selected in the icon selector', () => {
                createMarkerAndOpenIconStylePopup()
                cy.get(drawingStyleMarkerIconSetSelector).click()
                // showing all icons of this sets so that we may choose a new one
                cy.get(`${drawingStyleMarkerPopup} ${drawingStyleMarkerShowAllIconsButton}`).click()
                cy.fixture('service-icons/set-default.fixture.json').then((defaultIconSet) => {
                    // picking up the 4th icon of the set
                    const fourthIcon = defaultIconSet.items[3]
                    cy.get(
                        `${drawingStyleMarkerPopup} [data-cy="drawing-style-icon-selector-${fourthIcon.name}"]`
                    ).click()
                    cy.checkDrawnGeoJsonProperty(
                        'icon',
                        `api/icons/sets/default/icons/${fourthIcon.name}`,
                        true
                    )
                    cy.wait('@update-kml').then((interception) =>
                        expect(interception.request.body).to.match(
                            RegExp(
                                `<Data name="icon"><value>.*api/icons/sets/default/icons/${fourthIcon.name}.*</value>`
                            )
                        )
                    )
                })
            })
        })
    })

    const width = Cypress.config('viewportWidth')
    // TODO : fix text styling for mobile
    if (width > BREAKPOINT_PHONE_WIDTH) {
        context('text styling popup', () => {
            it('creates a text', () => {
                createAPoint('text', 0, -200, MAP_CENTER[0], 6156527.960512564)
            })
            ;['marker', 'text'].forEach((drawingMode) => {
                it(`shows the ${drawingMode} styling popup when drawing given feature`, () => {
                    createAPoint(drawingMode, 0, -200, MAP_CENTER[0], 6156527.960512564)

                    // Opening text popup
                    cy.get(drawingStyleTextButton).click()
                    cy.get(drawingStyleTextPopup).should('be.visible')

                    cy.get(`${drawingStyleTextPopup} ${drawingStyleSizeSelector}`).click()
                    cy.get(
                        `${drawingStyleTextPopup} [data-cy="drawing-style-size-selector-${MEDIUM.label}"]`
                    ).click()
                    cy.checkDrawnGeoJsonProperty('textScale', MEDIUM.textScale)

                    cy.get(
                        `${drawingStyleTextPopup} [data-cy="drawing-style-text-color-${BLACK.name}"]`
                    ).click()
                    cy.checkDrawnGeoJsonProperty('color', BLACK.fill)

                    // Closing the popup
                    cy.get(drawingStyleTextButton).click()
                    cy.get(drawingStyleTextPopup).should('not.exist')

                    // Opening again the popup
                    cy.get(drawingStyleTextButton).click()
                    cy.get(drawingStyleTextPopup).should('be.visible')
                })
            })
        })
    }
})
