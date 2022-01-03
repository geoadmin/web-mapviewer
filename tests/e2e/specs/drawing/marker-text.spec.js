import { MapBrowserEvent } from 'ol'

import { SMALL, MEDIUM, LARGE } from '../../../../src/modules/drawing/lib/drawingStyleSizes'
import { RED, GREEN, BLACK } from '../../../../src/modules/drawing/lib/drawingStyleColor'
import { MAP_CENTER } from '../../../../src/config'

const drawingStyleTitle = '[data-cy="drawing-style-feature-title"]'
const drawingStyleDescription = '[data-cy="drawing-style-feature-description"]'

const drawingStyleMarkerButton = '[data-cy="drawing-style-marker-button"]'
const drawingStyleMarkerPopup = '[data-cy="drawing-style-marker-popup"]'
const drawingStyleMarkerShowAllIconsButton = '[data-cy="drawing-style-show-all-icons-button"]'
const drawingStyleMarkerIconSetSelector = '[data-cy="drawing-style-icon-set-button"]'

const drawingStyleTextButton = '[data-cy="drawing-style-text-button"]'
const drawingStyleTextPopup = '[data-cy="drawing-style-text-popup"]'

const drawingStyleColorBox = '[data-cy="drawing-style-color-select-box"]'
const drawingStyleSizeSelector = '[data-cy="drawing-style-size-selector"]'

const createAPoint = (kind, x = 0, y = 0, xx = MAP_CENTER[0], yy = MAP_CENTER[1]) => {
    cy.goToDrawing()
    cy.clickDrawingTool(kind)
    cy.readWindowValue('drawingMap').then((map) => {
        // Create a point, a geojson will appear in the store
        simulateEvent(map, 'pointermove', x, y)
        simulateEvent(map, 'pointerdown', x, y)
        simulateEvent(map, 'pointerup', x, y)
        cy.readDrawingFeatures('Point', (features) => {
            const coos = features[0].getGeometry().getCoordinates()
            expect(coos).to.eql([xx, yy], `bad: ${JSON.stringify(coos)}`)
        })
        cy.wait('@post-kml').then((interception) =>
            cy.checkKMLRequest(interception, ['Placemark'], true)
        )
    })
}

/**
 * This function has been taken from the OL draw spec. Simulates a browser event on the map
 * viewport. The client x/y location will be adjusted as if the map were centered at 0,0.
 *
 * @param {string} type Event type.
 * @param {number} x Horizontal offset from map center.
 * @param {number} y Vertical offset from map center.
 * @param {boolean} [opt_shiftKey] Shift key is pressed.
 * @param {number} [opt_pointerId] Pointer id.
 * @returns {MapBrowserEvent} The simulated event.
 */
const simulateEvent = (map, type, x, y, opt_shiftKey, opt_pointerId = 0) => {
    cy.log(`simulating ${type} at [${x}, ${y}]`)

    var viewport = map.getViewport()

    // calculated in case body has top < 0 (test runner with small window)
    const shiftKey = opt_shiftKey !== undefined ? opt_shiftKey : false
    const event = {}
    event.type = type
    event.target = viewport.firstChild
    event.clientX = viewport.clientLeft + x + viewport.clientWidth / 2
    event.clientY = viewport.clientTop + y + viewport.clientHeight / 2
    event.shiftKey = shiftKey
    event.preventDefault = function () {}
    event.pointerType = 'mouse'
    event.pointerId = opt_pointerId
    event.isPrimary = true
    event.button = 0
    // @ts-ignore
    const simulatedEvent = new MapBrowserEvent(type, map, event)
    map.handleMapBrowserEvent(simulatedEvent)
    return simulatedEvent
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
    cy.checkDrawnGeoJsonPropertyContains('icon', `-${color.rgbString}.png`)
}

/** @param {DrawingStyleSize} size */
const changeIconSize = (size) => {
    cy.get(`${drawingStyleMarkerPopup} ${drawingStyleSizeSelector}`).click()
    cy.get(
        `${drawingStyleMarkerPopup} [data-cy="drawing-style-size-selector-${size.label}"]`
    ).click()
}

describe('Drawing marker/points', () => {
    context('simple interaction with a marker', () => {
        it('toggles the marker symbol popup when clicking button', () => {
            createMarkerAndOpenIconStylePopup()
            cy.get(drawingStyleMarkerPopup).should('be.visible')
        })
        it('can move a marker by drag&dropping', () => {
            createAPoint('marker')
            // Move it, the geojson geometry should move
            cy.readWindowValue('drawingMap').then((map) => {
                simulateEvent(map, 'pointerdown', 0, 0)
                simulateEvent(map, 'pointermove', 200, 140)
                simulateEvent(map, 'pointerdrag', 200, 140)
                simulateEvent(map, 'pointerup', 200, 140)
            })
            cy.readDrawingFeatures('Point', (features) => {
                const coos = features[0].getGeometry().getCoordinates()
                expect(coos).to.eql(
                    [1160201.300512564, 5740710.526641205],
                    `bad: ${JSON.stringify(coos)}`
                )
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
                const body = interception.request.body
                let icon = body.substr(body.indexOf('<Data name="icon">'))
                icon = icon.substr(0, icon.indexOf('</Data>'))
                expect(icon).to.contain(expectedIconUrl)
            })
        }

        context('color change', () => {
            beforeEach(() => {
                cy.intercept(`**/api/icons/sets/default/icons/**${GREEN.rgbString}.png`, {
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
            it('Changes the marker icon when a new one is selected in the icon selector', () => {
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
                    cy.checkDrawnGeoJsonPropertyContains(
                        'icon',
                        `api/icons/sets/default/icons/${fourthIcon.name}`
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
})
