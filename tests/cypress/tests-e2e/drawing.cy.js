/// <reference types="cypress" />

import { recurse } from 'cypress-recurse'
import proj4 from 'proj4'
import {
    addIconFixtureAndIntercept,
    addLegacyIconFixtureAndIntercept,
    checkKMLRequest,
    getKmlAdminIdFromRequest,
    kmlMetadataTemplate,
} from 'tests/cypress/support/drawing'

import { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import { DEFAULT_ICON_URL_PARAMS } from '@/api/icon.api'
import LayerTypes from '@/api/layers/LayerTypes.enum'
import { API_SERVICE_KML_BASE_URL, DEFAULT_PROJECTION } from '@/config'
import { LV95, WGS84 } from '@/utils/coordinates/coordinateSystems'
import {
    allStylingColors,
    allStylingSizes,
    BLACK,
    GREEN,
    LARGE,
    RED,
    SMALL,
} from '@/utils/featureStyleUtils'
import { LEGACY_ICON_XML_SCALE_FACTOR } from '@/utils/kmlUtils'
import { randomIntBetween } from '@/utils/numberUtils'

const isNonEmptyArray = (value) => {
    return Array.isArray(value) && value.length > 0
}

// KML Styling color, see https://developers.google.com/kml/documentation/kmlreference#colorstyle
// format is aabbggrr where aa=alpha (00 to ff); bb=blue (00 to ff); gg=green (00 to ff); rr=red (00 to ff)
// NOTE: alpha is for opacity
const KML_STYLE_RED = 'ff0000ff'
const KML_STYLE_BLACK = 'ff000000'

const DEFAULT_ICON_URL_SCALE = `${DEFAULT_ICON_URL_PARAMS.scale}x`

describe('Drawing module tests', () => {
    context('Drawing mode/tools', () => {
        function testTitleEdit() {
            const title = `This is a random title ${randomIntBetween(1000, 9999)}`
            cy.get('[data-cy="drawing-style-feature-title"]').clear()
            cy.get('[data-cy="drawing-style-feature-title"]').type(title)
            cy.get('[data-cy="drawing-style-feature-title"]').should('have.value', title)
            cy.wait('@update-kml')
                .its('request')
                .should((request) =>
                    checkKMLRequest(request, [new RegExp(`<name>${title}</name>`)])
                )
            cy.readStoreValue('getters.selectedFeatures[0].title').should('eq', title)
        }

        beforeEach(() => {
            cy.goToDrawing()
        })
        it('can create marker/icons and edit them', () => {
            cy.log('it should load all icon sets as soon as we enter the drawing module')
            cy.wait('@icon-sets')
            cy.wait('@icon-set-default')

            const markerCoordinate = LV95.getBoundsAs(DEFAULT_PROJECTION).center

            cy.clickDrawingTool(EditableFeatureTypes.MARKER)
            cy.clickOlMapAtCoordinate(markerCoordinate)
            cy.wait('@post-kml')

            cy.log(
                'it should show the default icon set by default with the red color in the icon style popup'
            )
            cy.wait('@icon-default')
                .its('request.url')
                .should('include', '/api/icons/sets/default/icons/')
                .should('include', `${RED.rgbString}.png`)

            cy.log('clicking on the "Edit icon" button')
            cy.get('[data-cy="drawing-style-marker-button"]:visible').click()

            cy.log('opening up the icon set selector')
            cy.get(
                '[data-cy="drawing-style-icon-set-button"] [data-cy="dropdown-main-button"]:visible'
            ).click()

            cy.log("the list of icon sets should contain all backend's possibilities")
            cy.get(`[data-cy="dropdown-item-default"]`).should('be.visible')
            cy.get(`[data-cy="dropdown-item-babs"]`).should('be.visible')

            cy.log('selecting babs icon set')
            cy.get('[data-cy="dropdown-item-babs"]').click()
            cy.log('all icons in the selector must swap to the newly selected icon set')
            cy.wait('@icon-set-babs')
            cy.wait('@icon-babs')
            cy.log('as babs icon set is not colorable, the color box should have disappeared')
            cy.get(
                '[data-cy="drawing-style-marker-popup"] [data-cy="drawing-style-color-select-box"]'
            ).should('not.exist')
            cy.log('going back to the default icon set')
            cy.get(
                '[data-cy="drawing-style-icon-set-button"] [data-cy="dropdown-main-button"]:visible'
            ).click()
            cy.get('[data-cy="dropdown-item-default"]:visible').click()
            cy.get('[data-cy="dropdown-item-default"]').should('not.be.visible')
            cy.log('color selector should be back')
            cy.get(
                '[data-cy="drawing-style-marker-popup"] [data-cy="drawing-style-color-select-box"]'
            ).should('be.visible')

            cy.log("changing icon list's color to green")
            cy.get(
                `[data-cy="drawing-style-marker-popup"] [data-cy="drawing-style-color-select-box"] [data-cy="color-selector-${GREEN.name}"]:visible`
            ).click()
            cy.log('it should load all icons with the green color')
            cy.waitOnAllIconsDefaultGreen()

            cy.log('the color of the marker already placed on the map must switch to green')
            cy.wait('@update-kml')
                .its('request')
                .should((request) => {
                    checkKMLRequest(request, [
                        new RegExp(
                            `<href>https?://.*/api/icons/sets/default/icons/001-marker@${DEFAULT_ICON_URL_SCALE}-${GREEN.rgbString}.png</href>`
                        ),
                    ])
                })

            cy.log('opening up the icon size selector')
            cy.get(
                '[data-cy="drawing-style-marker-popup"] [data-cy="drawing-style-size-selector"] [data-cy="dropdown-main-button"]:visible'
            ).click()
            cy.log('all sizes should be represented')
            allStylingSizes.forEach((size) => {
                cy.get(
                    `[data-cy="drawing-style-marker-popup"] [data-cy="drawing-style-size-selector"] [data-cy="dropdown-item-${size.label}"]`
                ).should('be.visible')
            })
            cy.log('selecting large size')
            cy.get(
                `[data-cy="drawing-style-marker-popup"] [data-cy="drawing-style-size-selector"] [data-cy="dropdown-item-${LARGE.label}"]`
            ).click()
            cy.log('the existing icon on the map must be updated to large and green')
            cy.wait('@update-kml')
                .its('request')
                .should((request) => {
                    checkKMLRequest(request, [
                        new RegExp(
                            `<IconStyle><scale>${LARGE.iconScale * LEGACY_ICON_XML_SCALE_FACTOR}</scale>`
                        ),
                        new RegExp(`<Icon>.*?<gx:w>48</gx:w>.*?</Icon>`),
                        new RegExp(`<Icon>.*?<gx:h>48</gx:h>.*?</Icon>`),
                        new RegExp(
                            `<href>https?://.*/api/icons/sets/default/icons/001-marker@${DEFAULT_ICON_URL_SCALE}-${GREEN.rgbString}.png</href>`
                        ),
                    ])
                })

            cy.log('opening up all icons of the current sets so that we may choose a new one')
            cy.get(
                '[data-cy="drawing-style-marker-popup"] [data-cy="drawing-style-toggle-all-icons-button"]:visible'
            ).click()
            cy.log('picking up the 4th icon of the set')
            cy.fixture('service-icons/set-default.fixture.json').then((defaultIconSet) => {
                const fourthIcon = defaultIconSet.items[3]
                cy.get(
                    `[data-cy="drawing-style-marker-popup"] [data-cy="drawing-style-icon-selector-${fourthIcon.name}"]`
                ).click({ force: true })
                cy.log('the KML must be updated with the newly selected icon')
                cy.wait('@update-kml')
                    .its('request')
                    .should((request) => {
                        checkKMLRequest(request, [
                            new RegExp(
                                `<IconStyle><scale>${LARGE.iconScale * LEGACY_ICON_XML_SCALE_FACTOR}</scale>`
                            ),
                            new RegExp(`<Icon>.*?<gx:w>48</gx:w>.*?</Icon>`),
                            new RegExp(`<Icon>.*?<gx:h>48</gx:h>.*?</Icon>`),
                            new RegExp(
                                `<href>https?://.*/api/icons/sets/default/icons/004-placeholder@${DEFAULT_ICON_URL_SCALE}-${GREEN.rgbString}.png</href>`
                            ),
                        ])
                    })
            })
            cy.log('closing the icons')
            cy.get(
                '[data-cy="drawing-style-marker-popup"] [data-cy="drawing-style-toggle-all-icons-button"]'
            ).click({ force: true })
            cy.log('closing the icon style popup')
            cy.get('[data-cy="drawing-style-popover"] [data-cy="close-popover-button"]').click({
                force: true,
            })

            cy.log('changing/editing the title of this marker')
            testTitleEdit()

            cy.log('changing/editing the description of this marker')
            const description = 'A description for this marker'
            cy.get('[data-cy="drawing-style-feature-description"]').type(description)
            cy.get('[data-cy="drawing-style-feature-description"]').should(
                'have.value',
                description
            )
            cy.wait('@update-kml')
                .its('request')
                .should((request) =>
                    checkKMLRequest(request, [
                        new RegExp(`<description>${description}</description>`),
                    ])
                )
            cy.readStoreValue('getters.selectedFeatures[0].description').should('eq', description)

            cy.log('moving the marker by drag&drop on the map')
            const moveInPixel = {
                x: 40,
                y: -50,
            }
            cy.get('[data-cy="ol-map"]').then((olMapElement) => {
                const mapSize = {
                    height: olMapElement.height(),
                    width: olMapElement.width(),
                }
                /** Pixel at the center of the map, relative to the map top-left corner */
                const pixelMapCenterInMapViewport = {
                    x: mapSize.width / 2.0,
                    y: mapSize.height / 2.0,
                }
                const endingPixel = {
                    x: pixelMapCenterInMapViewport.x + moveInPixel.x,
                    y: pixelMapCenterInMapViewport.y + moveInPixel.y,
                }
                cy.log('Move/drag the marker, the drawing must be updated with the new position')
                cy.log('moving marker from pixel', pixelMapCenterInMapViewport, 'to', endingPixel)

                cy.get('[data-cy="ol-map"]').realMouseDown(pixelMapCenterInMapViewport)
                cy.get('[data-cy="ol-map"]').realMouseMove(moveInPixel.x, moveInPixel.y, {
                    position: 'center',
                })
                cy.get('[data-cy="ol-map"]').realMouseUp(endingPixel)

                cy.wait('@update-kml')
            })
        })
        it('can create annotation/text and edit them', () => {
            const firstAnnotationCoordinate = LV95.getBoundsAs(DEFAULT_PROJECTION).center

            cy.clickDrawingTool(EditableFeatureTypes.ANNOTATION)
            cy.clickOlMapAtCoordinate(firstAnnotationCoordinate)
            cy.wait('@post-kml')
                .its('request')
                .should((request) => {
                    checkKMLRequest(request, [
                        new RegExp(
                            `<LabelStyle><color>${KML_STYLE_RED}</color><scale>1.5</scale></LabelStyle>`
                        ),
                        // there should be a default title
                        new RegExp('<name>New text</name>'),
                    ])
                })

            testTitleEdit()

            // Opening text style edit popup
            cy.get('[data-cy="drawing-style-text-button"]').click()
            cy.get('[data-cy="drawing-style-text-popup"]').should('be.visible')

            // all available colors must have a dedicated element/button
            allStylingColors.forEach((color) => {
                cy.get(`[data-cy="drawing-style-text-color-${color.name}"]`).should('be.visible')
            })
            // when clicking on another color, the text color in the KML must change
            cy.get(`[data-cy="drawing-style-text-color-${BLACK.name}"]`)
                .should('be.visible')
                .click()
            cy.wait('@update-kml')
                .its('request')
                .should((request) => {
                    checkKMLRequest(request, [
                        new RegExp(
                            `<LabelStyle><color>${KML_STYLE_BLACK}</color><scale>1.5</scale></LabelStyle>`
                        ),
                    ])
                })

            cy.get(
                '[data-cy="drawing-style-text-popup"] [data-cy="drawing-style-size-selector"] [data-cy="dropdown-main-button"]'
            ).click({
                // clicking in this popup is flaky (Cypress considers there's something else on top), so we force the click
                force: true,
            })
            // checking that all (text) sizes are represented in the size selector
            allStylingSizes.forEach((size) => {
                cy.get(
                    `[data-cy="drawing-style-text-popup"] [data-cy="drawing-style-size-selector"] [data-cy="dropdown-item-${size.label}"]`
                ).should('exist')
            })
            // selecting "very small" size
            cy.get(
                `[data-cy="drawing-style-text-popup"] [data-cy="drawing-style-size-selector"] [data-cy="dropdown-item-${SMALL.label}"]`
            ).click({
                // clicking in this popup is flaky (Cypress considers there's something else on top), so we force the click
                force: true,
            })
            cy.wait('@update-kml')
                .its('request')
                .should((request) => {
                    checkKMLRequest(request, [
                        new RegExp(`<LabelStyle><color>${KML_STYLE_BLACK}</color></LabelStyle>`),
                    ])
                })
            cy.get('[data-cy="drawing-style-popover"] [data-cy="close-popover-button"]').click({
                // clicking on this button is flaky (Cypress considers there's something else on top), so we force the click
                force: true,
            })
            cy.get('[data-cy="infobox-close"]').click()
        })
        it('can create line/polygons and edit them', () => {
            const firstPointCoordinate = LV95.getBoundsAs(DEFAULT_PROJECTION).center
            const secondPointCoordinate = [
                firstPointCoordinate[0] + 20000 /* m */,
                firstPointCoordinate[1],
            ]
            const thirdPointCoordinate = [
                secondPointCoordinate[0],
                secondPointCoordinate[1] + 20000 /* m */,
            ]

            cy.clickDrawingTool(EditableFeatureTypes.LINEPOLYGON)
            cy.clickOlMapAtCoordinate(firstPointCoordinate, { behavior: 'in-place' })
            cy.clickOlMapAtCoordinate(secondPointCoordinate, { behavior: 'in-place' })
            cy.clickOlMapAtCoordinate(thirdPointCoordinate, { behavior: 'in-place' })

            // checking that we can delete the last point by either clicking the button or using right-click
            cy.get('[data-cy="drawing-delete-last-point-button"]').click()
            cy.clickOlMapAtCoordinate(thirdPointCoordinate, { behavior: 'in-place' })

            cy.get('[data-cy="ol-map"]').rightclick()
            cy.clickOlMapAtCoordinate(thirdPointCoordinate, { behavior: 'in-place' })

            // should create a polygon by re-clicking the first point
            cy.clickOlMapAtCoordinate(firstPointCoordinate, { behavior: 'in-place' })

            let kmlId = null
            cy.wait('@post-kml').then((interception) => {
                cy.wrap(interception)
                    .its('request')
                    .should((request) =>
                        checkKMLRequest(request, [
                            new RegExp(
                                `<Data name="type"><value>${EditableFeatureTypes.LINEPOLYGON.toLowerCase()}</value></Data>`
                            ),
                            new RegExp(
                                `<Style><LineStyle><color>${KML_STYLE_RED}</color><width>3</width></LineStyle><PolyStyle><color>66${KML_STYLE_RED.slice(
                                    2
                                )}</color></PolyStyle></Style>`
                            ),
                        ])
                    )
                kmlId = interception.response.body.id
            })
            cy.get('[data-cy="feature-style-edit-coordinate-copy-button"]').should('not.exist')
            cy.readWindowValue('drawingLayer')
                .then((drawingLayer) => drawingLayer.getSource().getFeatures())
                .should((features) => {
                    expect(features).to.have.length(1)
                    const [polygon] = features
                    expect(polygon.getGeometry().getCoordinates().length).to.eq(1)
                    // OpenLayers wraps a polygon's coordinate in an array (so that it may have multiple "facets")
                    const [polygonCoordinates] = polygon.getGeometry().getCoordinates()
                    expect(polygonCoordinates).to.be.an('Array').lengthOf(4)
                })

            // Changing the color of the polygon and checking that the KMl was updated accordingly
            cy.get('[data-cy="drawing-style-line-button"]').click()
            cy.get(
                `[data-cy="drawing-style-line-popup"] [data-cy="color-selector-${BLACK.name}"]`
            ).click({
                // clicking in this popup is flaky (Cypress considers there's something else on top), so we force the click
                force: true,
            })
            cy.wait('@update-kml')
                .its('request')
                .should((request) =>
                    checkKMLRequest(
                        request,
                        [
                            new RegExp(
                                `<Style><LineStyle><color>${KML_STYLE_BLACK}</color><width>3</width></LineStyle><PolyStyle><color>66${KML_STYLE_BLACK.slice(
                                    2
                                )}</color></PolyStyle></Style>`
                            ),
                        ],
                        kmlId
                    )
                )

            // Now creating a line, and finishing it by double-clicking the same spot
            cy.get('[data-cy="close-popover-button"]').click({
                // clicking in this popup is flaky (Cypress considers there's something else on top), so we force the click
                force: true,
            })
            cy.get('[data-cy="infobox-close"]').click()
            cy.clickDrawingTool(EditableFeatureTypes.LINEPOLYGON)
            const lineLength = 13500 // meters
            const lineFirstCoordinate = [firstPointCoordinate[0] - 30000, firstPointCoordinate[1]]
            const lineSecondCoordinate = [
                lineFirstCoordinate[0],
                lineFirstCoordinate[1] + lineLength,
            ]
            cy.clickOlMapAtCoordinate(lineFirstCoordinate, { behavior: 'in-place' })
            cy.clickOlMapAtCoordinate(lineSecondCoordinate, {
                doubleClick: true,
                behavior: 'in-place',
            })
            cy.wait('@update-kml')
            cy.readWindowValue('drawingLayer')
                .then((drawingLayer) => drawingLayer.getSource().getFeatures())
                .should((features) => {
                    expect(features).to.have.length(2)
                    const line = features[1]
                    expect(line.getGeometry().getCoordinates().length).to.eq(2)
                })
        })
    })
    context('KML management', () => {
        it('deletes the drawing when confirming the delete modal', () => {
            cy.goToDrawing()
            cy.clickDrawingTool(EditableFeatureTypes.ANNOTATION)
            cy.get('[data-cy="ol-map"]').click()
            cy.wait('@post-kml')

            cy.get('[data-cy="drawing-toolbox-delete-button"]').click()
            cy.get('[data-cy="modal-confirm-button"]').click()
            cy.readWindowValue('drawingLayer')
                .then((drawingLayer) => drawingLayer.getSource().getFeatures())
                .should((features) => {
                    expect(features).to.have.length(0)
                })
            cy.get('[data-cy="drawing-toolbox-delete-button"]').should('have.attr', 'disabled')
            cy.get(
                '[data-cy="drawing-toolbox-export-button"] [data-cy="dropdown-toggle-button"]'
            ).should('have.attr', 'disabled')
            cy.get(
                '[data-cy="drawing-toolbox-export-button"] [data-cy="dropdown-main-button"]'
            ).should('have.attr', 'disabled')
            cy.get('[data-cy="drawing-toolbox-share-button"]').should('have.attr', 'disabled')
        })
        it('manages the KML layer in the layer list / URL params correctly', () => {
            cy.goToDrawing()
            cy.clickDrawingTool(EditableFeatureTypes.MARKER)
            cy.get('[data-cy="ol-map"]').click()
            cy.wait('@post-kml')

            // checks that it adds the kml file ID in the URL while in drawing mode
            cy.url().should('match', /layers=[^;&]*KML|[^|,f1]+/)
            // checks that it doesn't add adminId to the url
            cy.url().should('not.contain', 'adminId')

            cy.closeDrawingMode()
            cy.readStoreValue('state.layers.activeLayers').should((layers) => {
                expect(layers).to.be.an('Array').lengthOf(1)
                const [drawingLayer] = layers
                expect(drawingLayer.type).to.eq(LayerTypes.KML)
                expect(drawingLayer.visible).to.be.true
            })
            // checks that it clears the drawing when the drawing layer is removed
            cy.get(`[data-cy^="button-remove-layer-"]`).click()
            cy.readStoreValue('state.layers.activeLayers').should((layers) => {
                expect(layers).to.be.an('Array').lengthOf(0)
            })
            cy.readWindowValue('drawingLayer').should('not.exist')
        })
        it('keeps the KML after a page reload, and creates a copy if it is then edited', () => {
            cy.goToDrawing()
            cy.log('Create a simple drawing with a marker')
            cy.clickDrawingTool(EditableFeatureTypes.MARKER)
            cy.get('[data-cy="ol-map"]').click()

            cy.wait('@post-kml').then((interception) => {
                const kmlId = interception.response.body.id

                cy.closeDrawingMode()
                cy.wait('@update-kml')

                cy.log(`Check that the drawings has been added to the active layers: ${kmlId}`)
                cy.get(
                    `[data-cy^="active-layer-name-https://sys-public.dev.bgdi.ch/api/kml/files/${kmlId}-"]`
                )
                    .should('be.visible')
                    .contains('Drawing')
                cy.waitUntilState((state) => {
                    return state.layers.activeLayers.find(
                        (layer) => layer.type === LayerTypes.KML && layer.fileId === kmlId
                    )
                })

                cy.log('Reload the page')
                cy.reload()
                cy.waitMapIsReady()
                cy.wait('@get-kml')
                cy.openMenuIfMobile()

                cy.log(`Check that the KML file ${kmlId} is present on the active layer list`)
                cy.get(
                    `[data-cy^="active-layer-name-https://sys-public.dev.bgdi.ch/api/kml/files/${kmlId}-"]`
                )
                    .should('be.visible')
                    .contains('Drawing')
                cy.waitUntilState((state) => {
                    return state.layers.activeLayers.find(
                        (layer) => layer.type === LayerTypes.KML && layer.fileId === kmlId
                    )
                })

                cy.log('Open and close the drawing mode and check that the KML is not altered')
                // checking that the KML is correctly loaded in the drawing module, even though it doesn't carry an adminId
                cy.get('[data-cy="menu-tray-drawing-section"]').should('be.visible').click()

                // if closing the drawing module without changing anything, no copy must be made
                cy.closeDrawingMode()
                cy.get(
                    `[data-cy^="active-layer-name-https://sys-public.dev.bgdi.ch/api/kml/files/${kmlId}-"]`
                )
                    .should('be.visible')
                    .contains('Drawing')
                cy.readStoreValue('getters.activeKmlLayer').should((activeKmlLayer) => {
                    expect(activeKmlLayer).to.haveOwnProperty('fileId')
                    expect(activeKmlLayer.fileId).to.eq(kmlId)
                })

                cy.log('Open again the drawing mode and edit the kml')
                // re-opening the drawing module
                cy.get('[data-cy="menu-tray-drawing-section"]').should('be.visible').click()

                cy.log('deleting all features (clearing/emptying the KML)')
                // deleting all features (clearing/emptying the KML)
                cy.get('[data-cy="drawing-toolbox-delete-button"]').click()
                cy.get('[data-cy="modal-confirm-button"]').click()
                // checking that it creates a copy of the KML, and doesn't edit/clear the existing one (no adminId)

                cy.log('Check that a new kml has been saved')
                cy.wait('@post-kml').then((interception) => {
                    const newKmlId = interception.response.body.id
                    expect(newKmlId).to.not.eq(kmlId)

                    // there should be only one KML layer left in the layers, and it's the one just saved
                    cy.window()
                        .its('store.getters.activeKmlLayer')
                        .should('have.property', 'fileId', newKmlId)

                    cy.log(`Check that adding a new feature update the new kml ${newKmlId}`)
                    // Add another feature and checking that we do not create subsequent copies (we now have the adminId for this KML)
                    cy.clickDrawingTool(EditableFeatureTypes.ANNOTATION)
                    cy.get('[data-cy="ol-map"]').click('center')
                    cy.wait('@update-kml').its('response.body.id').should('eq', newKmlId)

                    cy.log('Check the active layer list making sure that there is only the new')
                    cy.closeDrawingMode()

                    cy.log(
                        `Check that the old kml has been removed from the active layer and that the new one has been added`
                    )
                    cy.get(
                        `[data-cy^="active-layer-name-https://sys-public.dev.bgdi.ch/api/kml/files/${kmlId}-"]`
                    ).should('not.exist')
                    cy.get(
                        `[data-cy^="active-layer-name-https://sys-public.dev.bgdi.ch/api/kml/files/${newKmlId}-"]`
                    )
                        .should('be.visible')
                        .contains('Drawing')
                })
            })
        })
        it('manages the KML layer correctly if it comes attached with an adminId at startup', () => {
            // Position of the marker defined in service-kml/lonelyMarker.kml
            const markerLatitude = 46.883715999352546
            const markerLongitude = 7.656108679791837
            const center = proj4(WGS84.epsg, DEFAULT_PROJECTION.epsg, [
                markerLongitude,
                markerLatitude,
            ])

            // load map with an injected kml layer containing a text
            const kmlFileId = 'test-fileID12345678900'
            const kmlFileAdminId = 'test-fileAdminID12345678900'
            const kmlFileUrl = `${API_SERVICE_KML_BASE_URL}api/kml/files/${kmlFileId}`
            const kmlUrlParam = `KML|${kmlFileUrl}|Dessin@adminId=${kmlFileAdminId}`

            // opening up the app and centering it directly on the single marker feature from the fixture
            cy.goToDrawing({ layers: kmlUrlParam, center: center.join(',') }, true)

            // the app must open the drawing module at startup whenever an adminId is found in the URL
            cy.readStoreValue('state.ui.showDrawingOverlay').should('be.true')

            // checking that the KML was correctly loaded
            cy.readStoreValue('getters.selectedFeatures').should('have.length', 0)
            cy.readWindowValue('drawingLayer')
                .then((layer) => layer.getSource().getFeatures())
                .should('have.length', 1)
            // clicking on the single feature of the fixture
            cy.get('[data-cy="ol-map"]').click('center')
            cy.readStoreValue('getters.selectedFeatures').should('have.length', 1)
            cy.readWindowValue('drawingLayer')
                .then((layer) => layer.getSource().getFeatures())
                .should('have.length', 1)

            // creating another feature
            cy.clickDrawingTool(EditableFeatureTypes.MARKER)
            cy.get('[data-cy="ol-map"]').click(200, 100)

            // checking that it updates the existing KML, and not creating a new copy of it
            cy.wait('@update-kml').its('response.body.id').should('eq', kmlFileId)
        })
        it('manages the KML layer correctly if it comes attached with an adminId at startup from a legacy URL', () => {
            // Position of the marker defined in service-kml/legacy-mf-geoadmin3.kml
            const markerLatitude = 46.80250110087888
            const markerLongitude = 7.248686789953856
            const center = proj4(WGS84.epsg, DEFAULT_PROJECTION.epsg, [
                markerLongitude,
                markerLatitude,
            ])

            // load map with an injected kml layer containing a text
            const kmlFileId = 'test-fileID12345678900'
            const kmlFileAdminId = 'test-fileAdminID12345678900'
            const kmlFileUrl = `${API_SERVICE_KML_BASE_URL}api/kml/files/${kmlFileId}`
            const kmlAdminUrl = `${API_SERVICE_KML_BASE_URL}api/kml/admin/${kmlFileId}`
            const kmlMetadata = {
                admin_id: kmlFileAdminId,
                author: 'mf-geoadmin3',
                author_version: '0.0.0',
                created: '2024-02-01T06:37:28.788+00:00',
                empty: false,
                id: kmlFileId,
                links: {
                    kml: kmlFileUrl,
                    self: kmlAdminUrl,
                },
                success: true,
                updated: '2024-02-01T13:52:10.988+00:00',
            }

            addIconFixtureAndIntercept()
            addLegacyIconFixtureAndIntercept()
            cy.intercept('GET', `**/api/kml/admin?admin_id=*`, {
                body: kmlMetadata,
                statusCode: 200,
            }).as('get-kml-metadata-by-admin-id')
            cy.intercept('GET', kmlAdminUrl, {
                body: kmlMetadata,
                statusCode: 200,
            }).as('get-kml-metadata')
            cy.intercept('PUT', kmlAdminUrl, async (req) => {
                const adminId = await getKmlAdminIdFromRequest(req)
                req.reply(kmlMetadataTemplate({ id: req.url.split('/').pop(), adminId: adminId }))
            }).as('update-kml')
            cy.intercept('GET', kmlFileUrl, {
                statusCode: 200,
                fixture: 'service-kml/legacy-mf-geoadmin3.kml',
            }).as('get-legacy-kml')

            // opening up the app and centering it directly on the single marker feature from the fixture
            cy.goToMapView({ adminId: kmlFileAdminId, E: center[0], N: center[1] }, false)
            cy.wait('@get-kml-metadata-by-admin-id')
            cy.wait('@get-legacy-kml')
            cy.waitUntilState((state) => state.drawing.iconSets.length > 0)

            // the app must open the drawing module at startup whenever an adminId is found in the URL
            cy.readStoreValue('state.ui.showDrawingOverlay').should('be.true')

            // checking that the KML was correctly loaded
            cy.readStoreValue('getters.selectedFeatures').should('have.length', 0)
            cy.readWindowValue('drawingLayer')
                .then((layer) => layer.getSource().getFeatures())
                .should('have.length', 3)

            // clicking on the single feature of the fixture
            cy.log('Test clicking on the square feature in center should select it')
            cy.get('[data-cy="ol-map"]').click('center')
            cy.readStoreValue('getters.selectedFeatures').should('have.length', 1)
            cy.readWindowValue('drawingLayer')
                .then((layer) => layer.getSource().getFeatures())
                .should('have.length', 3)

            cy.log('The selected icon should have its icon selected in the icon list')
            cy.get('[data-cy="drawing-style-marker-button"]').should('be.visible').click()
            cy.get('[data-cy="drawing-style-toggle-all-icons-button"]').should('be.visible').click()
            cy.get(`[data-cy="drawing-style-icon-selector-003-square"]`).should(
                'have.class',
                'btn-primary'
            )

            // creating another feature
            cy.log('Test creating a new feature')
            cy.clickDrawingTool(EditableFeatureTypes.MARKER)
            cy.get('[data-cy="ol-map"]').click(200, 100)

            // checking that it updates the existing KML, and not creating a new copy of it
            cy.wait('@update-kml').its('response.body.id').should('eq', kmlFileId)
        })
    })
    context('others', () => {
        it("doesn't save an empty drawing (if not modified)", () => {
            cy.intercept('**/api/kml/admin**', (req) => {
                expect(`Unexpected call to ${req.method} ${req.url}`).to.be.false
            }).as('post-put-kml-not-allowed')
            cy.goToDrawing()
            cy.clickDrawingTool(EditableFeatureTypes.MARKER)
            cy.closeDrawingMode()
        })
        it('can export the drawing/profile in multiple formats', () => {
            const downloadsFolder = Cypress.config('downloadsFolder')
            const checkFiles = (extension, callback) => {
                recurse(
                    () => cy.task('findFiles', { folderName: downloadsFolder, extension }),
                    isNonEmptyArray,
                    { delay: 100 }
                ).then((files) => {
                    const fileName = `${downloadsFolder}/${files[files.length - 1]}`
                    expect(fileName).to.contains(`map.geo.admin.ch_${extension.toUpperCase()}_`)
                    cy.readFile(fileName).should('have.length.gt', 50).then(callback)
                })
            }

            cy.goToDrawing()

            cy.clickDrawingTool(EditableFeatureTypes.LINEPOLYGON)
            cy.get('[data-cy="ol-map"]').click(100, 200)
            cy.get('[data-cy="ol-map"]').click(150, 200)
            cy.get('[data-cy="ol-map"]').click(150, 230)
            // clicking on the same spot as the first, it should close the polygon
            cy.get('[data-cy="ol-map"]').click(100, 200)

            cy.wait('@post-kml')

            // Checking that it can export the profile as CSV
            cy.wait('@profile')
            // triggering a CSV download
            cy.get('[data-cy="profile-popup-csv-download-button"]').click()
            // check CSV content
            cy.fixture('service-alti/profile.fixture.csv').then((mockCsv) => {
                checkFiles('csv', (content) => {
                    // just in case we are testing from windows we replace all \r\n by \n
                    const agnosticContent = content.replaceAll('\r', '')
                    const agnosticMockCsv = mockCsv.replaceAll('\r', '')
                    expect(agnosticContent).to.be.equal(agnosticMockCsv)
                })
            })

            // it exports KML when clicking on the export button (without choosing format)
            cy.get(
                '[data-cy="drawing-toolbox-export-button"] [data-cy="dropdown-main-button"]'
            ).click()
            checkFiles('kml', (content) => {
                expect(content).to.contains(
                    `<ExtendedData><Data name="type"><value>${EditableFeatureTypes.LINEPOLYGON.toLocaleLowerCase()}</value></Data></ExtendedData>`,
                    `Feature type LINEPOLYGON not found in KML, there might be a missing feature`
                )
            })
            cy.task('clearFolder', downloadsFolder)

            // same if we choose exports KML file through the "choose format" export menu
            cy.get(
                '[data-cy="drawing-toolbox-export-button"] [data-cy="dropdown-toggle-button"]'
            ).click()
            cy.get(
                '[data-cy="drawing-toolbox-export-button"] [data-cy="dropdown-item-kml"]'
            ).click()
            checkFiles('kml', (content) => {
                expect(content).to.contains(
                    `<ExtendedData><Data name="type"><value>${EditableFeatureTypes.LINEPOLYGON.toLocaleLowerCase()}</value></Data></ExtendedData>`,
                    `Feature type LINEPOLYGON not found in KML, there might be a missing feature`
                )
            })
            cy.task('clearFolder', downloadsFolder)

            // it exports a GPX if chosen in the dropdown
            cy.get(
                '[data-cy="drawing-toolbox-export-button"] [data-cy="dropdown-toggle-button"]'
            ).click()
            cy.get(
                '[data-cy="drawing-toolbox-export-button"] [data-cy="dropdown-item-gpx"]'
            ).click()
            checkFiles('gpx', (content) => {
                // 1 <rte> (routes), for the single LINEPOLYGON
                expect(content).to.match(/<gpx.*<rte>.*<\/rte>.*<\/gpx>/)
            })

            cy.task('clearFolder', downloadsFolder)
        })
        it('generates short links when sharing a drawing', () => {
            const publicShortlink = 'https://s.geo.admin.ch/public-shortlink'
            const adminshortlink = 'https://s.geo.admin.ch/admin-shortlink'

            let adminId = null
            let kmlId = null

            cy.goToDrawing()

            cy.clickDrawingTool(EditableFeatureTypes.MARKER)
            cy.get('[data-cy="ol-map"]').click()
            cy.wait('@post-kml').then((intercept) => {
                adminId = intercept.response.body.admin_id
                kmlId = intercept.response.body.id
            })

            const regexInterceptServiceShortLink =
                /^https?:\/\/(sys-s\.\w+\.bgdi\.ch|s\.geo\.admin\.ch)\//
            // creating the necessary intercepts for service-shortlink
            cy.intercept('POST', regexInterceptServiceShortLink, (req) => {
                expect(req.body).to.haveOwnProperty('url')
                expect(req.body.url).to.contain(`/${kmlId}`)
                if (req.body.url.includes(`@adminId=`)) {
                    req.reply({ statusCode: 201, body: { shorturl: adminshortlink } })
                } else {
                    req.reply({ statusCode: 201, body: { shorturl: publicShortlink } })
                }
            }).as('shortLink')

            // opening the share prompt/modal
            cy.get('[data-cy="drawing-toolbox-share-button"]').click()
            // we expect 2 links to be generated (one with and one without adminId)
            cy.wait('@shortLink')
            cy.wait('@shortLink')

            // Check that the copied URL is the shortened one
            cy.get('[data-cy="drawing-share-normal-link"]').focus()
            cy.get('[data-cy="drawing-share-normal-link"]').realClick()
            cy.window().then((win) => {
                cy.wrap(win.navigator.clipboard.readText()).should((clipboardText) => {
                    expect(clipboardText).to.be.equal(
                        publicShortlink,
                        `Share link is not a public shortlink`
                    )
                })
            })

            // Same check, but with the other input (that should contain the adminId)
            cy.get('[data-cy="drawing-share-admin-link"]').focus()
            cy.get('[data-cy="drawing-share-admin-link"]').realClick()
            cy.window().then((win) => {
                cy.wrap(win.navigator.clipboard.readText()).should((clipboardText) => {
                    expect(clipboardText).to.be.equal(
                        adminshortlink,
                        `Share link is not an admin shortlink`
                    )
                })
            })
            // closing the share modal/popup
            cy.get('[data-cy="modal-close-button"]').click()

            // testing the same thing, but by responding HTTP500 with service-shortlink
            // it should fall back to give users normal links (un-shortened)
            cy.intercept('POST', regexInterceptServiceShortLink, { statusCode: 500 })

            // opening the share prompt/modal once again
            cy.get('[data-cy="drawing-toolbox-share-button"]').click()

            cy.get('[data-cy="drawing-share-normal-link"]').focus()
            cy.get('[data-cy="drawing-share-normal-link"]').realClick()
            // checking that the ID present in the "normal" link matches the public file ID (and not the admin ID)
            cy.window().then((win) => {
                cy.wrap(win.navigator.clipboard.readText()).should((clipboardText) => {
                    expect(clipboardText).to.contain(`/${kmlId}`)
                    expect(clipboardText).to.not.contain(`@adminId`)
                })
            })
            // checking that the "Edit later" link contains the adminId
            cy.get('[data-cy="drawing-share-admin-link"]').focus()
            cy.get('[data-cy="drawing-share-admin-link"]').realClick()
            cy.window().then((win) => {
                cy.wrap(win.navigator.clipboard.readText()).should((clipboardText) => {
                    expect(clipboardText).to.contain(`/${kmlId}`)
                    expect(clipboardText).to.contain(`@adminId=${adminId}`)
                })
            })
        })
        it('shows a profile of a line/measure coming from service-alti data', () => {
            const profileIntercept = '**/rest/services/profile.json**'

            const profileThirdCoordinate = LV95.getBoundsAs(DEFAULT_PROJECTION).center
            const profileSecondCoordinate = [
                profileThirdCoordinate[0],
                profileThirdCoordinate[1] + 45000,
            ]
            const profileFirstCoordinate = [
                profileSecondCoordinate[0] + 30000,
                profileSecondCoordinate[1],
            ]

            cy.goToDrawing()

            // returning an empty profile as a start
            cy.intercept(profileIntercept, []).as('empty-profile')

            cy.clickDrawingTool(EditableFeatureTypes.MEASURE)
            cy.clickOlMapAtCoordinate(profileFirstCoordinate)
            cy.clickOlMapAtCoordinate(profileSecondCoordinate)
            cy.clickOlMapAtCoordinate(profileThirdCoordinate, { doubleClick: true })
            cy.wait('@empty-profile')

            // the profile info container shouldn't show up if there's no data for this profile
            cy.get('[data-cy="profile-popup-info-container"]').should('not.exist')

            // deleting feature
            cy.get('[data-cy="drawing-style-delete-button"]').click()
            cy.get('[data-cy="profile-popup-content"]').should('not.exist')
            cy.get('[data-cy="drawing-style-popup"]').should('not.exist')

            // returning an empty profile as a start
            cy.intercept(profileIntercept, {
                fixture: 'service-alti/profile.fixture.json',
            }).as('profile')

            cy.clickDrawingTool(EditableFeatureTypes.LINEPOLYGON)
            cy.clickOlMapAtCoordinate(profileFirstCoordinate)
            cy.clickOlMapAtCoordinate(profileSecondCoordinate)
            cy.clickOlMapAtCoordinate(profileThirdCoordinate, { doubleClick: true })
            cy.wait('@profile')

            // checking all the information found in the info container
            Object.entries({
                profile_elevation_difference: '0.00m',
                profile_elevation_down: '0.10m',
                profile_elevation_up: '0.10m',
                profile_poi_down: "1'342m",
                profile_poi_up: "1'342m",
                profile_distance: '4.50m',
                profile_slope_distance: '4.51m',
            }).forEach(([key, value]) => {
                cy.get(`[data-cy="profile-popup-info-${key}"]`).should('contain.text', value)
            })
            cy.get('[data-cy="profile-graph"]').trigger('mouseenter')
            cy.get('[data-cy="profile-graph"]').trigger('mousemove', 'center')
            cy.get('[data-cy="profile-popup-tooltip"] .distance').should('contain.text', '2.5 m')
            cy.get('[data-cy="profile-popup-tooltip"] .elevation').should(
                'contain.text',
                '1341.8 m'
            )
            cy.get('[data-cy="profile-graph"]').trigger('mouseleave')

            // clicking on the header of the profile container
            cy.get('[data-cy="infobox-minimize-maximize"]').click()
            cy.get('[data-cy="infobox-header"]').should('be.visible')
            // it should hide the content (only the header stays visible)
            cy.get('[data-cy="infobox-content"]').should('not.be.visible')

            // click once again on the header
            cy.get('[data-cy="infobox-minimize-maximize"]').click()
            cy.get('[data-cy="infobox-header"]').should('be.visible')
            // the content should now be visible again
            cy.get('[data-cy="infobox-content"]').should('be.visible')

            // clicking the X button of the popup
            cy.get('[data-cy="infobox-close"]').click()
            // it is now closed
            cy.get('[data-cy="infobox"]').should('not.exist')

            // re-opening
            cy.window()
                .its('map')
                .invoke('getPixelFromCoordinate', profileThirdCoordinate)
                .as('profileEndingPixel')
            cy.get('@profileEndingPixel').then((pixel) => {
                cy.get('[data-cy="ol-map"]').click(pixel[0], pixel[1])
            })
            cy.get('[data-cy="infobox"]').should('be.visible')

            // clicking on the X button again, but this time with the content being hidden (clicking first on the header)
            cy.get('[data-cy="infobox-minimize-maximize"]').click()
            cy.get('[data-cy="infobox-close"]').click()
            cy.get('[data-cy="infobox"]').should('not.exist')
        })
        it('can switch from floating edit popup to back at bottom', () => {
            cy.goToDrawing()
            // to avoid overlaping with the map footer and the floating tooltip, increase the vertical size.
            cy.viewport(320, 1024)

            cy.wait('@icon-sets')
            cy.wait('@icon-set-default')
            const testEditPopupFloatingToggle = () => {
                cy.get('[data-cy="infobox"] [data-cy="drawing-style-popup"]').should('be.visible')
                cy.get('[data-cy="popover"] [data-cy="drawing-style-popup"]').should('not.exist')

                cy.get('[data-cy="infobox-toggle-floating"]').click()

                // checking that the edit form is still present but now in the floating popup
                cy.get('[data-cy="infobox"] [data-cy="drawing-style-popup"]').should('not.exist')
                cy.get('[data-cy="popover"] [data-cy="drawing-style-popup"]').should('be.visible')

                cy.get('[data-cy="toggle-floating-off"]').click()

                // on mobile the delete button is a bit hidden behind the background wheel, so we force the click
                cy.get('[data-cy="drawing-style-delete-button"]').click({ force: true })
                cy.get('[data-cy="infobox"] [data-cy="drawing-style-popup"]').should('not.exist')
                cy.get('[data-cy="popover"] [data-cy="drawing-style-popup"]').should('not.exist')
            }

            cy.clickDrawingTool(EditableFeatureTypes.MARKER)
            cy.get('[data-cy="ol-map"]').click()
            testEditPopupFloatingToggle()

            // same test, but this time with a line
            // (the placement of the popup is a bit trickier and different from a single coordinate marker)
            cy.clickDrawingTool(EditableFeatureTypes.LINEPOLYGON)
            cy.get('[data-cy="ol-map"]').click(20, 20)
            cy.get('[data-cy="ol-map"]').click(40, 60)
            // finishing the line by click the same spot twice
            cy.get('[data-cy="ol-map"]').dblclick('center')
            testEditPopupFloatingToggle()

            cy.log('Infobox closes when drawing tool is selected')
            cy.clickDrawingTool(EditableFeatureTypes.ANNOTATION)
            cy.get('[data-cy="ol-map"]').click()
            cy.get('[data-cy="infobox"] [data-cy="drawing-style-popup"]').should('be.visible')
            cy.get('[data-cy="popover"] [data-cy="drawing-style-popup"]').should('not.exist')
            cy.clickDrawingTool(EditableFeatureTypes.ANNOTATION)
            cy.get('[data-cy="infobox"] [data-cy="drawing-style-popup"]').should('not.exist')
            cy.get('[data-cy="popover"] [data-cy="drawing-style-popup"]').should('not.exist')

            cy.log('Popover closes when drawing tool is selected')
            cy.get('[data-cy="ol-map"]').click()
            cy.get('[data-cy="infobox-toggle-floating"]').click()
            cy.get('[data-cy="infobox"] [data-cy="drawing-style-popup"]').should('not.exist')
            cy.get('[data-cy="popover"] [data-cy="drawing-style-popup"]').should('be.visible')
            cy.clickDrawingTool(EditableFeatureTypes.ANNOTATION)
            cy.get('[data-cy="infobox"] [data-cy="drawing-style-popup"]').should('not.exist')
            cy.get('[data-cy="popover"] [data-cy="drawing-style-popup"]').should('not.exist')
        })
        // too many issues with the CI not having the same behaviour with the clipboard management as the local non-headless run, skipping for the time being
        it('can copy coordinate from marker and text/annotation features (in and out of drawing mode)', () => {
            /**
             * @param {String} name Feature "name" so that it can be selected in the DOM
             * @param {[Number, Number]} coordinate Coordinate expected to be displayed/copied, will
             *   tolerate a 1m margin
             */
            function readCoordinateClipboard(name, coordinate) {
                cy.log('Reading clipboard for selector', name)
                // we start by clearing the clipboard (no spill over with previous tests)
                cy.window()
                    .its('navigator.clipboard')
                    .then((clipboard) => clipboard.writeText(''))
                cy.get(`[data-cy="${name}-button"]`).focus()
                cy.get(`[data-cy="${name}-button"]`).realClick()
                cy.get(`[data-cy="${name}-icon"]`).should('have.class', 'fa-check')
                cy.readStoreValue('getters.resolution').then((currentMapResolution) => {
                    cy.window()
                        .its('navigator.clipboard')
                        .then((clipboard) => clipboard.readText())
                        .should((clipboardText) => {
                            const clipboardCoordinate = clipboardText
                                .replaceAll("'", '')
                                .split(', ')
                                .map(parseFloat)
                            expect(clipboardCoordinate).to.be.an('Array').lengthOf(2)
                            // we allow 1 pixel of error (if the calculated pixel for a coordinate not a rounded value we might have
                            // some error involved with the real coordinate being chosen)
                            expect(clipboardCoordinate[0]).to.approximately(
                                coordinate[0],
                                currentMapResolution
                            )
                            expect(clipboardCoordinate[1]).to.approximately(
                                coordinate[1],
                                currentMapResolution
                            )
                        })
                })
            }
            const markerCoordinate = LV95.getBoundsAs(DEFAULT_PROJECTION).center
            const annotationCoordinate = [markerCoordinate[0], markerCoordinate[1] + 30000]

            cy.goToDrawing()

            cy.log('Coordinates for marker can be copied in drawing mode')
            cy.clickDrawingTool(EditableFeatureTypes.MARKER)
            cy.clickOlMapAtCoordinate(markerCoordinate)
            cy.wait('@post-kml')
            readCoordinateClipboard('feature-style-edit-coordinate-copy', markerCoordinate)

            cy.log('Coordinates for annotation can be copied while in drawing mode')
            cy.clickDrawingTool(EditableFeatureTypes.ANNOTATION)
            cy.clickOlMapAtCoordinate(annotationCoordinate)
            cy.wait('@update-kml')
            readCoordinateClipboard('feature-style-edit-coordinate-copy', annotationCoordinate)

            cy.closeDrawingMode()
            cy.closeMenuIfMobile()

            cy.log('Coordinates for marker can be copied while not in drawing mode')
            cy.clickOlMapAtCoordinate(markerCoordinate)
            readCoordinateClipboard('feature-detail-coordinate-copy', markerCoordinate)
            cy.get('[data-cy="infobox-close"]').click()

            cy.log('Coordinates for annotation can be copied while not in drawing mode')
            cy.clickOlMapAtCoordinate(annotationCoordinate)
            readCoordinateClipboard('feature-detail-coordinate-copy', annotationCoordinate)

            cy.log('Coordinates in tooltip are updated when selecting another feature')
            cy.clickOlMapAtCoordinate(markerCoordinate)
            readCoordinateClipboard('feature-detail-coordinate-copy', markerCoordinate)
        })
        it('can generate and display media links', () => {
            cy.goToDrawing()

            const valid_url = 'http:dummy'
            const valid_whitelisted_url = 'https://map.geo.admin.ch'
            const invalid_url = 'invalidurl'
            const media_description = 'description'

            const mapCenter = LV95.getBoundsAs(DEFAULT_PROJECTION).center

            const xDeltaBetweenFeatures = 20000
            const featureWithHyperlinkCoordinate = [mapCenter[0] - 60000, mapCenter[1]]
            const featureHyperLinkWithoutDescriptionCoordinate = [
                featureWithHyperlinkCoordinate[0] + xDeltaBetweenFeatures,
                featureWithHyperlinkCoordinate[1],
            ]
            const featureWithImageCoordinate = [
                featureHyperLinkWithoutDescriptionCoordinate[0] + xDeltaBetweenFeatures,
                featureHyperLinkWithoutDescriptionCoordinate[1],
            ]
            const featureWithVideoCoordinate = [
                featureWithImageCoordinate[0] + xDeltaBetweenFeatures,
                featureWithImageCoordinate[1],
            ]
            const featureWithExternalIFrameCoordinate = [
                featureWithVideoCoordinate[0] + xDeltaBetweenFeatures,
                featureWithVideoCoordinate[1],
            ]
            const featureWithWhitelistedIFrameCoordinate = [
                featureWithExternalIFrameCoordinate[0] + xDeltaBetweenFeatures,
                featureWithExternalIFrameCoordinate[1],
            ]

            cy.clickDrawingTool(EditableFeatureTypes.MARKER)
            cy.clickOlMapAtCoordinate(featureWithHyperlinkCoordinate)
            cy.wait('@post-kml')

            cy.log('Open hyperlink popup')
            cy.get('[data-cy="drawing-style-link-button"]').click()

            cy.log('Button should be disabled if url empty')
            cy.get('[data-cy="drawing-style-media-generate-button"]').should('be.disabled')
            cy.get('[data-cy="invalid-feedback-error"]').should('not.exist')
            cy.get('[data-cy="drawing-style-media-empty-description-error"]').should('not.exist')

            cy.log('Button should be disabled if url invalid')
            cy.get('[data-cy="drawing-style-media-url-input"] [data-cy="text-input"]').type(
                invalid_url
            )
            cy.get('[data-cy="drawing-style-media-generate-button"]').should('be.disabled')
            cy.get('[data-cy="invalid-feedback-error"]').should('be.visible')
            cy.get('[data-cy="drawing-style-media-empty-description-error"]').should('not.exist')

            cy.log('Generate hyperlink')
            cy.get('[data-cy="text-input-clear"]').click()
            cy.get('[data-cy="drawing-style-media-url-input"] [data-cy="text-input"]').type(
                valid_url
            )
            cy.get('[data-cy="drawing-style-media-description-input"] [data-cy="text-input"]').type(
                media_description,
                { force: true }
            )
            cy.get('[data-cy="drawing-style-media-generate-button"]').should('be.enabled')
            cy.get('[data-cy="drawing-style-media-generate-button"]').click()
            cy.get('[data-cy="drawing-style-feature-description"]').should(
                'have.value',
                `<a target="_blank" href="${valid_url}">${media_description}</a>`
            )
            cy.wait('@update-kml')
            cy.readStoreValue('getters.activeKmlLayer').should((activeKmlLayer) => {
                expect(activeKmlLayer).to.have.property('kmlData')
                expect(activeKmlLayer.kmlData).to.contain(
                    `a target="_blank" href="${valid_url}"&gt;${media_description}`
                )
            })
            cy.get('[data-cy="infobox-close"]').click()

            cy.log('Entering no description should use link as description')
            cy.clickDrawingTool(EditableFeatureTypes.MARKER)
            cy.clickOlMapAtCoordinate(featureHyperLinkWithoutDescriptionCoordinate)
            cy.wait('@update-kml')

            cy.get('[data-cy="drawing-style-link-button"]').click()
            cy.get('[data-cy="drawing-style-media-url-input"]').type(valid_url)
            cy.get('[data-cy="drawing-style-media-generate-button"]').click()
            cy.get('[data-cy="drawing-style-feature-description"]').should(
                'have.value',
                `<a target="_blank" href="${valid_url}">${valid_url}</a>`
            )
            cy.readStoreValue('getters.activeKmlLayer').should((activeKmlLayer) => {
                expect(activeKmlLayer).to.have.property('kmlData')
                expect(activeKmlLayer.kmlData).to.contain(`a target="_blank" href="${valid_url}"`)
            })
            cy.get('[data-cy="infobox-close"]').click()

            cy.log('Open image embed popup')
            cy.clickDrawingTool(EditableFeatureTypes.MARKER)
            cy.clickOlMapAtCoordinate(featureWithImageCoordinate)
            cy.wait('@update-kml')

            cy.get('[data-cy="drawing-style-image-button"]').click()
            cy.get('[data-cy="drawing-style-media-generate-button"]').should('be.disabled')
            cy.get('[data-cy="drawing-style-media-url-input"]').type(valid_url)
            cy.get('[data-cy="drawing-style-media-generate-button"]').should('be.enabled')

            cy.log('Generate image link')
            cy.get('[data-cy="drawing-style-media-generate-button"]').click()
            cy.get('[data-cy="drawing-style-feature-description"]').should(
                'have.value',
                `<image src="${valid_url}" style="max-height:200px;"/>`
            )
            cy.wait('@update-kml')
            cy.readStoreValue('getters.activeKmlLayer').should((activeKmlLayer) => {
                expect(activeKmlLayer).to.have.property('kmlData')
                expect(activeKmlLayer.kmlData).to.contain(`image src="${valid_url}"`)
            })
            cy.get('[data-cy="infobox-close"]').click()

            cy.log('Open video embed popup')
            cy.clickDrawingTool(EditableFeatureTypes.MARKER)
            cy.clickOlMapAtCoordinate(featureWithVideoCoordinate)
            cy.wait('@update-kml')

            cy.get('[data-cy="drawing-style-video-button"]').click()
            cy.get('[data-cy="drawing-style-media-generate-button"]').should('be.disabled')
            cy.get('[data-cy="drawing-style-media-url-input"]').type(valid_url)
            cy.get('[data-cy="drawing-style-media-generate-button"]').should('be.enabled')

            cy.log('Generate video link')
            cy.get('[data-cy="drawing-style-media-generate-button"]').click()
            cy.get('[data-cy="drawing-style-feature-description"]').should(
                'have.value',
                `<iframe src="${valid_url}" height="200" width="auto"></iframe>`
            )
            cy.wait('@update-kml')
            cy.readStoreValue('getters.activeKmlLayer').should((activeKmlLayer) => {
                expect(activeKmlLayer).to.have.property('kmlData')
                expect(activeKmlLayer.kmlData).to.contain(`iframe src="${valid_url}"`)
            })
            cy.get('[data-cy="infobox-close"]').click()

            cy.clickDrawingTool(EditableFeatureTypes.MARKER)
            cy.clickOlMapAtCoordinate(featureWithExternalIFrameCoordinate)
            cy.wait('@update-kml')

            cy.get('[data-cy="drawing-style-video-button"]').click()
            cy.get('[data-cy="drawing-style-media-url-input"]').type(valid_url)
            cy.get('[data-cy="drawing-style-media-generate-button"]').click()
            cy.wait('@update-kml')
            cy.readStoreValue('getters.activeKmlLayer').should((activeKmlLayer) => {
                expect(activeKmlLayer).to.have.property('kmlData')
                expect(activeKmlLayer.kmlData).to.contain(`iframe src="${valid_url}"`)
            })
            cy.get('[data-cy="infobox-close"]').click()

            cy.clickDrawingTool(EditableFeatureTypes.MARKER)
            cy.clickOlMapAtCoordinate(featureWithWhitelistedIFrameCoordinate)
            cy.wait('@update-kml')

            cy.get('[data-cy="drawing-style-video-button"]').click()
            cy.get('[data-cy="drawing-style-media-url-input"]').type(valid_whitelisted_url)
            cy.get('[data-cy="drawing-style-media-generate-button"]').click()
            cy.wait('@update-kml')
            cy.readStoreValue('getters.activeKmlLayer').should((activeKmlLayer) => {
                expect(activeKmlLayer).to.have.property('kmlData')
                expect(activeKmlLayer.kmlData).to.contain(`iframe src="${valid_whitelisted_url}"`)
            })
            cy.get('[data-cy="infobox-close"]').click()

            cy.closeDrawingMode()
            cy.closeMenuIfMobile()
            cy.wait('@update-kml')

            cy.log('Hyperlink exists after sanitize')
            cy.mockupBackendResponse('**http:dummy*', {}, 'dummy')

            cy.clickOlMapAtCoordinate(featureWithHyperlinkCoordinate)
            cy.get('[data-cy="feature-detail-media-disclaimer"]').should('not.exist')
            cy.get('[data-cy="feature-detail-description-content"]')
                .find('a')
                .invoke('attr', 'href')
                .should('eq', `${valid_url}`)

            cy.log('blank attribute is not removed by sanitize')
            cy.get('[data-cy="feature-detail-description-content"]')
                .find('a')
                .invoke('attr', 'target')
                .should('eq', '_blank')

            cy.log('noopener attribute exists due to _blank')
            cy.get('[data-cy="feature-detail-description-content"]')
                .find('a')
                .invoke('attr', 'rel')
                .should('eq', 'noopener')
            cy.get('[data-cy="infobox-close"]').click()

            cy.log('Image link exists after sanitize')
            cy.mockupBackendResponse('**http:dummy*', {}, 'dummy')

            cy.clickOlMapAtCoordinate(featureWithImageCoordinate)
            cy.get('[data-cy="feature-detail-media-disclaimer"]').should('not.exist')
            cy.get('[data-cy="feature-detail-description-content"]')
                .find('img')
                .invoke('attr', 'src')
                .should('eq', `${valid_url}`)
            cy.get('[data-cy="infobox-close"]').click()

            cy.log('Video link has disclaimer')
            cy.mockupBackendResponse('**http:dummy*', {}, 'dummy')
            cy.clickOlMapAtCoordinate(featureWithVideoCoordinate)
            cy.get('[data-cy="feature-detail-media-disclaimer-opened"]').should('be.visible')
            cy.get('[data-cy="feature-detail-media-disclaimer-closed"]').should('not.exist')

            cy.log('Disclaimer provides more information on click')
            cy.get('[data-cy="feature-detail-media-disclaimer-opened-info"]').click()
            cy.get('[data-cy="modal-with-backdrop"]').should('exist')
            cy.get('[data-cy="modal-close-button"]').click()
            cy.get('[data-cy="modal-with-backdrop"]').should('not.exist')

            cy.log('Video link exists after sanitize')
            cy.get('[data-cy="feature-detail-description-content"]')
                .find('iframe')
                .invoke('attr', 'src')
                .should('eq', `${valid_url}`)

            cy.log('Closing disclaimer')
            cy.get('[data-cy="feature-detail-media-disclaimer-close"]').click({
                scrollBehavior: 'center',
            })
            cy.get('[data-cy="feature-detail-media-disclaimer-opened"]').should('not.exist')
            cy.get('[data-cy="feature-detail-media-disclaimer-closed"]').should('be.visible')

            cy.log('Closed Disclaimer provides more information on click')
            cy.get('[data-cy="feature-detail-media-disclaimer-closed-info"]').click()
            cy.get('[data-cy="modal-with-backdrop"]').should('exist')
            cy.get('[data-cy="modal-close-button"]').click()
            cy.get('[data-cy="modal-with-backdrop"]').should('not.exist')

            cy.log('Closing disclaimer persists when selecting different marker')
            cy.mockupBackendResponse('**http:dummy*', {}, 'dummy')
            cy.clickOlMapAtCoordinate(featureWithExternalIFrameCoordinate)
            cy.get('[data-cy="feature-detail-media-disclaimer-opened"]').should('not.exist')
            cy.get('[data-cy="feature-detail-media-disclaimer-closed"]').should('be.visible')
            cy.get('[data-cy="infobox-close"]').click()

            cy.log('Disclaimer should not appear when host is whitelisted')
            cy.mockupBackendResponse('**map.geo.admin.ch*', {}, 'map-geo-admin')
            cy.clickOlMapAtCoordinate(featureWithWhitelistedIFrameCoordinate)
            cy.get('[data-cy="feature-detail-media-disclaimer"]').should('not.exist')
        })
    })
})
