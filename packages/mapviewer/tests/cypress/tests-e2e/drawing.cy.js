/// <reference types="cypress" />

import { recurse } from 'cypress-recurse'
import { randomIntBetween } from 'geoadmin/numbers'
import { LV95, registerProj4, WGS84 } from 'geoadmin/proj'
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
import { getServiceKmlBaseUrl } from '@/config/baseUrl.config'
import { DEFAULT_PROJECTION } from '@/config/map.config'
import { LV95Format } from '@/utils/coordinates/coordinateFormat'
import {
    allStylingColors,
    allStylingSizes,
    BLACK,
    GREEN,
    LARGE,
    RED,
    SMALL,
} from '@/utils/featureStyleUtils'
import { EMPTY_KML_DATA, LEGACY_ICON_XML_SCALE_FACTOR } from '@/utils/kmlUtils'

registerProj4(proj4)

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
        function readCoordinateClipboard(name, coordinate) {
            cy.log(name)
            cy.get(`[data-cy="${name}-button"]`).click()
            cy.readClipboardValue().should((clipboardText) => {
                expect(clipboardText).to.be.equal(coordinate)
            })
        }
        function waitForKmlUpdate(regexExpression) {
            cy.get('@update-kml')
                .its('request')
                .should((request) => checkKMLRequest(request, [new RegExp(`${regexExpression}`)]))
        }

        function addDecription(description) {
            cy.get('[data-cy="drawing-style-feature-description"]').type(description)
            cy.get('[data-cy="drawing-style-feature-description"]').should(
                'have.value',
                description
            )
            cy.wait('@update-kml').then(() => {
                cy.readStoreValue('getters.selectedFeatures[0].description').should(
                    'eq',
                    description
                )
            })
        }

        // we use the description to identify the feature and check its
        // geometry type, number of points and type (measure or linepolygon)
        function checkDrawnFeature(description, numberOfPoints, featureType, type) {
            cy.readWindowValue('drawingLayer')
                .then((drawingLayer) => drawingLayer.getSource().getFeatures())
                .should((features) => {
                    const matchingFeature = features.find(
                        (feature) => feature.get('description') === description
                    )
                    expect(matchingFeature).to.not.be.undefined
                    expect(matchingFeature.getGeometry().getType()).to.eq(featureType)
                    expect(matchingFeature.get('type')).to.eq(type.toLowerCase())
                    if (featureType === 'LineString') {
                        const lineStringCoordinates = matchingFeature.getGeometry().getCoordinates()
                        expect(lineStringCoordinates).to.be.an('Array').lengthOf(numberOfPoints)
                    } else if (featureType === 'Polygon') {
                        const polygonCoordinates = matchingFeature.getGeometry().getCoordinates()
                        expect(polygonCoordinates).to.be.an('Array').lengthOf(1)
                        expect(polygonCoordinates[0]).to.be.an('Array').lengthOf(numberOfPoints)
                    }
                })
        }

        beforeEach(() => {
            cy.goToDrawing()
        })
        it('can create marker/icons and edit them', () => {
            // it should load all icon sets as soon as we enter the drawing module
            cy.wait('@icon-sets')
            cy.wait('@icon-set-default')

            cy.clickDrawingTool(EditableFeatureTypes.MARKER)
            cy.get('[data-cy="ol-map"]:visible').click()

            cy.wait('@post-kml').then((interception) => {
                const kmlId = `${getServiceKmlBaseUrl()}api/kml/files/${interception.response.body.id}`
                const bgLayer = 'test.background.layer2'

                // it should show the default icon set by default with the red color in the icon style popup
                cy.wait('@icon-default')
                    .its('request.url')
                    .should('include', '/api/icons/sets/default/icons/')
                    .should('include', `${RED.rgbString}.png`)

                // clicking on the "Edit icon" button
                cy.get('[data-cy="drawing-style-marker-button"]:visible').click()
                // opening up the icon set selector
                cy.get(
                    '[data-cy="drawing-style-icon-set-button"] [data-cy="dropdown-main-button"]:visible'
                ).click()
                // the list of icon sets should contain all backend's possibilities
                cy.get(`[data-cy="dropdown-item-default"]`).should('be.visible')
                cy.get(`[data-cy="dropdown-item-babs"]`).should('be.visible')

                // selecting babs icon set
                cy.get('[data-cy="dropdown-item-babs"]').click()
                // all icons in the selector must swap to the newly selected icon set
                cy.wait('@icon-set-babs')
                cy.wait('@icon-babs')
                // as babs icon set is not colorable, the color box should have disappeared
                cy.get(
                    '[data-cy="drawing-style-marker-popup"] [data-cy="drawing-style-color-select-box"]'
                ).should('not.exist')
                // babs icon should have a tippy describing the icon
                cy.get('[data-cy="drawing-style-icon-selector-babs-1"]').realHover()
                // going back to the default icon set
                cy.get(
                    '[data-cy="drawing-style-icon-set-button"] [data-cy="dropdown-main-button"]:visible'
                ).click()
                cy.get('[data-cy="dropdown-item-default"]:visible').click()
                cy.get('[data-cy="dropdown-item-default"]').should('not.be.visible')
                // color selector should be back
                cy.get(
                    '[data-cy="drawing-style-marker-popup"] [data-cy="drawing-style-color-select-box"]'
                ).should('be.visible')

                // changing icon list's color to green
                cy.get(
                    `[data-cy="drawing-style-marker-popup"] [data-cy="drawing-style-color-select-box"] [data-cy="color-selector-${GREEN.name}"]:visible`
                ).click()
                // it should load all icons with the green color
                cy.wait('@icon-default-green')

                // the color of the marker already placed on the map must switch to green
                cy.wait('@update-kml')
                    .its('request')
                    .should((request) => {
                        checkKMLRequest(request, [
                            new RegExp(
                                `<href>https?://.*/api/icons/sets/default/icons/001-marker@${DEFAULT_ICON_URL_SCALE}-${GREEN.rgbString}.png</href>`
                            ),
                        ])
                    })

                // opening up the icon size selector
                cy.get(
                    '[data-cy="drawing-style-marker-popup"] [data-cy="drawing-style-size-selector"] [data-cy="dropdown-main-button"]:visible'
                ).click()
                // all sizes should be represented
                allStylingSizes.forEach((size) => {
                    cy.get(
                        `[data-cy="drawing-style-marker-popup"] [data-cy="drawing-style-size-selector"] [data-cy="dropdown-item-${size.label}"]`
                    ).should('be.visible')
                })
                // selecting large size
                cy.get(
                    `[data-cy="drawing-style-marker-popup"] [data-cy="drawing-style-size-selector"] [data-cy="dropdown-item-${LARGE.label}"]`
                ).click()
                // the existing icon on the map must be updated to large and green
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

                // opening up all icons of the current sets so that we may choose a new one
                cy.get(
                    '[data-cy="drawing-style-marker-popup"] [data-cy="drawing-style-toggle-all-icons-button"]:visible'
                ).click()
                // picking up the 4th icon of the set
                cy.fixture('service-icons/set-default.fixture.json').then((defaultIconSet) => {
                    const fourthIcon = defaultIconSet.items[3]
                    cy.get(
                        `[data-cy="drawing-style-marker-popup"] [data-cy="drawing-style-icon-selector-${fourthIcon.name}"]:visible`
                    ).click()
                    // the KML must be updated with the newly selected icon
                    cy.wait('@update-kml')
                        .its('request')
                        .should((request) =>
                            checkKMLRequest(request, [
                                new RegExp(
                                    `<href>https?://.*/api/icons/sets/default/icons/${fourthIcon.name}@${DEFAULT_ICON_URL_SCALE}-${GREEN.rgbString}.png</href>`
                                ),
                            ])
                        )
                })
                // closing the icons
                cy.get(
                    '[data-cy="drawing-style-marker-popup"] [data-cy="drawing-style-toggle-all-icons-button"]:visible'
                ).click()
                // closing the icon style popup
                cy.get(
                    '[data-cy="drawing-style-popover"] [data-cy="close-popover-button"]:visible'
                ).click()

                // changing/editing the title of this marker
                testTitleEdit()

                // changing text placement
                cy.log('Test text placement and offset')
                cy.get('[data-cy="drawing-style-text-button"]').click()
                cy.get('[data-cy="drawing-style-placement-selector-top-left"]').click()
                cy.readStoreValue('getters.selectedFeatures[0].textPlacement').should(
                    'eq',
                    'top-left'
                )
                cy.readStoreValue('getters.selectedFeatures[0].textOffset').then((offset) => {
                    cy.wrap(offset[0]).should('be.lessThan', 0)
                    cy.wrap(offset[1]).should('be.lessThan', 0)
                })
                cy.wait('@update-kml')
                    .its('request')
                    .should((request) =>
                        checkKMLRequest(request, [
                            new RegExp(
                                `<Data name="textOffset"><value>` +
                                    `(-?\\d+\\.\\d+),(-?\\d+\\.\\d+)` + // Test if both values are floats
                                    `</value></Data>`
                            ),
                        ])
                    )

                cy.viewport(320, 600)
                cy.get(
                    '[data-cy="drawing-style-popover"] [data-cy="close-popover-button"]:visible'
                ).click()
                cy.get('[data-cy="drawing-style-text-popup"]').should('not.exist')
                cy.viewport(320, 568)

                // changing/editing the description of this marker
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
                cy.readStoreValue('getters.selectedFeatures[0].description').should(
                    'eq',
                    description
                )

                cy.log('Moving the marker by drag&drop on the map')
                cy.get('[data-cy="ol-map"]').then(($olMap) => {
                    const startingPixel = [$olMap.outerWidth() / 2.0, $olMap.outerHeight() / 2.0]
                    const moveInPixel = {
                        x: 40,
                        y: -50,
                    }
                    const endingPixel = [
                        startingPixel[0] + moveInPixel.x,
                        startingPixel[1] + moveInPixel.y,
                    ]

                    // Move it, the geojson geometry should move
                    cy.readWindowValue('map').then((map) => {
                        const coordinateStartingPixel = map.getCoordinateFromPixel(startingPixel)
                        const coordinateEndingPixel = map.getCoordinateFromPixel(endingPixel)

                        cy.log(
                            'Starting pixel is',
                            startingPixel,
                            'meaning coordinates',
                            coordinateStartingPixel
                        )
                        cy.log(
                            'Ending pixel is',
                            endingPixel,
                            'meaning coordinates',
                            coordinateEndingPixel
                        )

                        // attributions can get in the way on mobile viewport, minimizing the feature detail
                        // to have more screen space to move the feature
                        cy.get('[data-cy="infobox-minimize-maximize"]').click()

                        cy.simulateEvent(map, 'pointerdown', 0, 0)
                        cy.simulateEvent(map, 'pointerdrag', moveInPixel.x, moveInPixel.y)
                        cy.simulateEvent(map, 'pointerup', moveInPixel.x, moveInPixel.y)

                        cy.wait('@update-kml')

                        // FIXME: to many issues on the CI with clipboard coordinate copy, looks like a height delta, disabling tests with clipboard
                        // // re-maximizing the feature detail to be able to read the coordinates
                        // cy.get('[data-cy="infobox-minimize-maximize"]').click()
                        // // checking that coordinates in feature detail have also been updated after the move
                        // readCoordinateClipboard(
                        //     'feature-style-edit-coordinate-copy',
                        //     LV95Format.format(coordinateEndingPixel, LV95)
                        // )
                        //
                        // cy.log('Coordinates for marker can be copied in drawing mode')
                        // cy.clickDrawingTool(EditableFeatureTypes.MARKER)
                        // cy.get('[data-cy="ol-map"]').click(endingPixel[0], endingPixel[1])
                        // waitForKmlUpdate(`(ExtendedData.*){4}`)
                        // readCoordinateClipboard(
                        //     'feature-style-edit-coordinate-copy',
                        //     LV95Format.format(coordinateEndingPixel, LV95)
                        // )
                        //
                        // cy.log('Coordinates for marker can be copied while not in drawing mode')
                        // cy.closeDrawingMode()
                        // cy.closeMenuIfMobile()
                        // waitForKmlUpdate(`(ExtendedData.*){4}`)
                        // cy.checkOlLayer([bgLayer, kmlId])
                        //
                        // cy.get('[data-cy="ol-map"]').click(endingPixel[0], endingPixel[1])
                        // readCoordinateClipboard(
                        //     'feature-detail-coordinate-copy',
                        //     LV95Format.format(coordinateEndingPixel, LV95)
                        // )
                        // cy.log('Coordinates for marker are updated when selecting new marker')
                        // cy.get('[data-cy="ol-map"]').click(200, 234)
                        // // OL waits 250ms before deciding a click is a single click (and then start the event chain)
                        // // and as we do not have a layer that will fire identify features to wait on, we have to resort
                        // // to wait arbitrarily 250ms
                        // // eslint-disable-next-line cypress/no-unnecessary-waiting
                        // cy.wait(250)
                        // readCoordinateClipboard(
                        //     'feature-detail-coordinate-copy',
                        //     LV95Format.format(map.getCoordinateFromPixel([200, 234]), LV95)
                        // )
                    })
                })

                cy.log('Can generate and display media links')
                cy.openDrawingMode()
                const valid_url = 'http:dummy'
                const valid_whitelisted_url = 'https://map.geo.admin.ch'
                const invalid_url = 'invalidurl'
                const media_description = 'description'

                cy.clickDrawingTool(EditableFeatureTypes.MARKER)
                cy.get('[data-cy="ol-map"]').click(20, 260)

                cy.log('Open hyperlink popup')
                cy.get('[data-cy="drawing-style-link-button"]').click()

                cy.log('Button should be disabled if url empty')
                cy.get(
                    '[data-cy="drawing-style-media-url"] [data-cy="text-input-invalid-feedback"]'
                ).should('not.be.visible')

                cy.log('Button should be disabled if url invalid')
                cy.get('[data-cy="drawing-style-media-url"] [data-cy="text-input"]').type(
                    invalid_url
                )
                cy.get('[data-cy="drawing-style-media-generate-button"]:visible').click()
                cy.get(
                    '[data-cy="drawing-style-media-url"] [data-cy="text-input-invalid-feedback"]'
                ).should('be.visible')

                cy.log('Generate hyperlink')
                cy.get('[data-cy="drawing-style-media-url"] [data-cy="text-input-clear"]').click()
                cy.get('[data-cy="drawing-style-media-url"] [data-cy="text-input"]').type(valid_url)
                cy.get('[data-cy="drawing-style-media-description"] [data-cy="text-input"]').type(
                    media_description
                )
                cy.get('[data-cy="drawing-style-media-generate-button"]').should('be.enabled')
                cy.get('[data-cy="drawing-style-media-generate-button"]').click()
                cy.get('[data-cy="drawing-style-feature-description"]').should(
                    'have.value',
                    `<a target="_blank" href="${valid_url}">${media_description}</a>`
                )
                waitForKmlUpdate(`href="${valid_url}".*`)
                cy.get('[data-cy="infobox-close"]').click()

                cy.log('Entering no description should use link as description')
                cy.clickDrawingTool(EditableFeatureTypes.MARKER)
                cy.get('[data-cy="ol-map"]').click(60, 260)
                cy.get('[data-cy="drawing-style-link-button"]').click()
                cy.get('[data-cy="drawing-style-media-url"] [data-cy="text-input"]').type(valid_url)
                cy.get('[data-cy="drawing-style-media-generate-button"]').click()
                cy.get('[data-cy="drawing-style-feature-description"]').should(
                    'have.value',
                    `<a target="_blank" href="${valid_url}">${valid_url}</a>`
                )
                waitForKmlUpdate(`(${valid_url}.*){3}`)
                cy.get('[data-cy="infobox-close"]').click()

                cy.log('Open image embed popup')
                cy.clickDrawingTool(EditableFeatureTypes.MARKER)
                cy.get('[data-cy="ol-map"]').click(100, 260)
                cy.get('[data-cy="drawing-style-image-button"]').click()
                cy.get('[data-cy="drawing-style-media-url"] [data-cy="text-input"]').type(valid_url)
                cy.get('[data-cy="drawing-style-media-generate-button"]').should('be.enabled')

                cy.log('Generate image link')
                cy.get('[data-cy="drawing-style-media-generate-button"]').click()
                cy.get('[data-cy="drawing-style-feature-description"]').should(
                    'have.value',
                    `<image src="${valid_url}" style="max-height:200px;"/>`
                )
                waitForKmlUpdate(`image src="${valid_url}".*`)
                cy.get('[data-cy="infobox-close"]').click()

                cy.log('Open video embed popup')
                cy.clickDrawingTool(EditableFeatureTypes.MARKER)
                cy.get('[data-cy="ol-map"]').click(140, 260)
                cy.get('[data-cy="drawing-style-video-button"]').click()
                cy.get('[data-cy="drawing-style-media-url"] [data-cy="text-input"]').type(valid_url)
                cy.get('[data-cy="drawing-style-media-generate-button"]').should('be.enabled')

                cy.log('Generate video link')
                cy.get('[data-cy="drawing-style-media-generate-button"]').click()
                cy.get('[data-cy="drawing-style-feature-description"]').should(
                    'have.value',
                    `<iframe src="${valid_url}" height="200" width="auto"></iframe>`
                )
                waitForKmlUpdate(`iframe src="${valid_url}".*`)
                cy.get('[data-cy="infobox-close"]').click()

                cy.clickDrawingTool(EditableFeatureTypes.MARKER)
                cy.get('[data-cy="ol-map"]').click(160, 220)
                cy.get('[data-cy="drawing-style-video-button"]').click()
                cy.get('[data-cy="drawing-style-media-url"] [data-cy="text-input"]').type(valid_url)
                cy.get('[data-cy="drawing-style-media-generate-button"]').click()
                waitForKmlUpdate(`(iframe src="${valid_url}".*){2}`)
                cy.get('[data-cy="infobox-close"]').click()

                cy.clickDrawingTool(EditableFeatureTypes.MARKER)
                cy.get('[data-cy="ol-map"]').click(220, 260)
                cy.get('[data-cy="drawing-style-video-button"]').click()
                cy.get('[data-cy="drawing-style-media-url"] [data-cy="text-input"]').type(
                    valid_whitelisted_url
                )
                cy.get('[data-cy="drawing-style-media-generate-button"]').click()
                waitForKmlUpdate(`iframe src="${valid_whitelisted_url}"`)
                cy.get('[data-cy="infobox-close"]').click()

                cy.closeDrawingMode()
                cy.closeMenuIfMobile()
                waitForKmlUpdate(`(ExtendedData.*){16}`)
                cy.checkOlLayer([bgLayer, kmlId])

                cy.log('Hyperlink exists after sanitize')
                cy.mockupBackendResponse('**http:dummy*', {}, 'dummy')
                cy.get('[data-cy="ol-map"]').click(20, 260)
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
                cy.get('[data-cy="ol-map"]').click(100, 260)
                cy.get('[data-cy="feature-detail-media-disclaimer"]').should('not.exist')
                cy.get('[data-cy="feature-detail-description-content"]')
                    .find('img')
                    .invoke('attr', 'src')
                    .should('eq', `${valid_url}`)

                cy.log('Video link has disclaimer')
                cy.mockupBackendResponse('**http:dummy*', {}, 'dummy')
                cy.get('[data-cy="ol-map"]').click(160, 220)
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
                cy.get('[data-cy="ol-map"]').click(160, 220)
                cy.get('[data-cy="feature-detail-media-disclaimer-opened"]').should('not.exist')
                cy.get('[data-cy="feature-detail-media-disclaimer-closed"]').should('be.visible')
                cy.get('[data-cy="infobox-close"]').click()

                cy.log('Disclaimer should not appear when host is whitelisted')
                cy.mockupBackendResponse('**map.geo.admin.ch*', {}, 'map-geo-admin')
                cy.get('[data-cy="ol-map"]').click(220, 260)
                cy.get('[data-cy="feature-detail-media-disclaimer"]').should('not.exist')
            })
        })
        it('can create annotation/text and edit them', () => {
            cy.clickDrawingTool(EditableFeatureTypes.ANNOTATION)
            cy.get('[data-cy="ol-map"]').click()
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
            cy.get('[data-cy="drawing-style-placement-selector-top-left"]').should('not.exist')
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
            ).click({ force: true })
            // checking that all (text) sizes are represented in the size selector
            allStylingSizes.forEach((size) => {
                cy.get(
                    `[data-cy="drawing-style-text-popup"] [data-cy="drawing-style-size-selector"] [data-cy="dropdown-item-${size.label}"]`
                ).should('exist')
            })
            // selecting "very small" size
            cy.get(
                `[data-cy="drawing-style-text-popup"] [data-cy="drawing-style-size-selector"] [data-cy="dropdown-item-${SMALL.label}"]`
            ).click({ force: true })
            cy.wait('@update-kml')
                .its('request')
                .should((request) => {
                    checkKMLRequest(request, [
                        new RegExp(`<LabelStyle><color>${KML_STYLE_BLACK}</color></LabelStyle>`),
                    ])
                })

            cy.log('Coordinates for annotation can be copied while in drawing mode')
            cy.clickDrawingTool(EditableFeatureTypes.ANNOTATION)
            cy.get('[data-cy="ol-map"]').click(160, 200)
            cy.wait('@update-kml')
            readCoordinateClipboard(
                'feature-style-edit-coordinate-copy',
                "2'660'013.50, 1'227'172.00"
            )
            cy.log('Coordinates for annotation can be copied while not in drawing mode')
            cy.closeDrawingMode()
            cy.closeMenuIfMobile()
            cy.get('[data-cy="ol-map"]').click(160, 200)
            readCoordinateClipboard('feature-detail-coordinate-copy', "2'660'013.50, 1'227'172.00")
            cy.log('Coordinates for annotation are updated when selecting new marker')
            cy.get('[data-cy="ol-map"]').click('center')
            // OL waits 250ms before deciding a click is a single click (and then start the event chain)
            // and as we do not have a layer that will fire identify features to wait on, we have to resort
            // to wait arbitrarily 250ms
            // eslint-disable-next-line cypress/no-unnecessary-waiting
            cy.wait(250)
            readCoordinateClipboard('feature-detail-coordinate-copy', "2'660'013.50, 1'185'172.00")
        })

        it('can create line / measurement, extend it, and delete the last node by right click / button, and make a polygon', () => {
            cy.viewport(1920, 1080)
            cy.clickDrawingTool(EditableFeatureTypes.LINEPOLYGON)

            const lineCoordinates = [
                [500, 500],
                [550, 550],
                [600, 600],
                [700, 600],
                [800, 600],
                [800, 400],
                [900, 400],
                [1000, 400],
            ]
            lineCoordinates.forEach((coordinate) => {
                cy.get('[data-cy="ol-map"]').click(...coordinate)
            })
            // should create a line by re-clicking the last point
            cy.get('[data-cy="ol-map"]').click(...lineCoordinates.at(lineCoordinates.length - 1))
            const firstFeatureDescription = 'first feature'
            addDecription(firstFeatureDescription)

            checkDrawnFeature(
                firstFeatureDescription,
                8,
                'LineString',
                EditableFeatureTypes.LINEPOLYGON
            )

            // Extend from the last node of line
            cy.get('[data-cy="extend-from-last-node-button"]').click()
            cy.get('[data-cy="ol-map"]').click(1100, 450)
            // finish extending the line by clicking the last point
            cy.get('[data-cy="ol-map"]').click(1100, 450)
            checkDrawnFeature(
                firstFeatureDescription,
                9,
                'LineString',
                EditableFeatureTypes.LINEPOLYGON
            )

            // Extend from the first node of line
            cy.get('[data-cy="extend-from-first-node-button"]').click()
            cy.get('[data-cy="ol-map"]').click(500, 250)
            cy.get('[data-cy="ol-map"]').click(600, 250)
            // finish extending the line by clicking the last point
            cy.get('[data-cy="ol-map"]').click(600, 250)
            checkDrawnFeature(
                firstFeatureDescription,
                11,
                'LineString',
                EditableFeatureTypes.LINEPOLYGON
            )

            // Delete the last node by right click
            cy.get('[data-cy="ol-map"]').rightclick()
            checkDrawnFeature(
                firstFeatureDescription,
                10,
                'LineString',
                EditableFeatureTypes.LINEPOLYGON
            )

            // Delete the last node by clicking the delete button
            cy.get('[data-cy="drawing-delete-last-point-button"]').click()
            checkDrawnFeature(
                firstFeatureDescription,
                9,
                'LineString',
                EditableFeatureTypes.LINEPOLYGON
            )

            // Extend to make a polygon
            cy.get('[data-cy="extend-from-last-node-button"]').click()
            cy.get('[data-cy="ol-map"]').click(750, 350)
            // Click the first node to finish the polygon
            cy.get('[data-cy="ol-map"]').click(600, 250)
            checkDrawnFeature(
                firstFeatureDescription,
                11,
                'Polygon',
                EditableFeatureTypes.LINEPOLYGON
            )
            // No extend button for polygon
            cy.get('[data-cy="drawing-delete-first-point-button"]').should('not.exist')
            cy.get('[data-cy="drawing-delete-last-point-button"]').should('not.exist')

            // Create measurement line
            cy.clickDrawingTool(EditableFeatureTypes.MEASURE)

            const measurementCoordinates = [
                [1000, 500],
                [1050, 550],
                [1100, 600],
                [1200, 600],
                [1250, 600],
                [1250, 400],
                [1300, 400],
                [1400, 400],
            ]
            measurementCoordinates.forEach((coordinate) => {
                cy.get('[data-cy="ol-map"]').click(...coordinate)
            })
            // should create a line by re-clicking the last point
            cy.get('[data-cy="ol-map"]').click(
                ...measurementCoordinates.at(measurementCoordinates.length - 1)
            )
            const secondFeatureDescription = 'second feature'
            addDecription(secondFeatureDescription)

            checkDrawnFeature(
                secondFeatureDescription,
                8,
                'LineString',
                EditableFeatureTypes.MEASURE
            )

            // Extend from the last node of line
            cy.get('[data-cy="extend-from-last-node-button"]').click()
            cy.get('[data-cy="ol-map"]').click(1400, 450)
            // finish extending the line by clicking the last point
            cy.get('[data-cy="ol-map"]').click(1400, 450)
            checkDrawnFeature(
                secondFeatureDescription,
                9,
                'LineString',
                EditableFeatureTypes.MEASURE
            )

            // check if the first feature still there
            checkDrawnFeature(
                firstFeatureDescription,
                11,
                'Polygon',
                EditableFeatureTypes.LINEPOLYGON
            )
        })
        it('can create line/polygons and edit them', () => {
            cy.clickDrawingTool(EditableFeatureTypes.LINEPOLYGON)
            cy.get('[data-cy="ol-map"]').click(100, 250)
            cy.get('[data-cy="ol-map"]').click(150, 250)
            cy.get('[data-cy="ol-map"]').click(150, 280)

            // checking that we can delete the last point by either clicking the button or using right-click
            cy.get('[data-cy="drawing-delete-last-point-button"]').click()
            cy.get('[data-cy="ol-map"]').click(150, 280)

            cy.get('[data-cy="ol-map"]').rightclick()
            cy.get('[data-cy="ol-map"]').click(150, 280)

            // should create a polygon by re-clicking the first point
            cy.get('[data-cy="ol-map"]').click(100, 250)

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

            // close the drawing mode to close the popover else it is not possible to close it since the drawing header is overlapping the popover
            cy.closeDrawingMode()
            cy.get('[data-cy="menu-tray-drawing-section"]').should('be.visible').click()
            // Now creating a line, and finishing it by double-clicking the same spot
            cy.clickDrawingTool(EditableFeatureTypes.LINEPOLYGON)
            cy.get('[data-cy="ol-map"]').click(120, 270)
            cy.get('[data-cy="ol-map"]').dblclick(120, 290)
            cy.wait('@update-kml')
            cy.readWindowValue('drawingLayer')
                .then((drawingLayer) => drawingLayer.getSource().getFeatures())
                .should((features) => {
                    expect(features).to.have.length(2)
                    const line = features[1]
                    expect(line.getGeometry().getCoordinates().length).to.eq(2)
                })

            cy.goToMapView(
                {
                    zoom: 6,
                },
                false
            )

            cy.log('Feature Area Info should be in meters below unit threshold')
            cy.goToDrawing()
            cy.clickDrawingTool(EditableFeatureTypes.LINEPOLYGON)

            cy.get('[data-cy="ol-map"]').click(140, 360)
            cy.get('[data-cy="ol-map"]').click(150, 360)
            cy.get('[data-cy="ol-map"]').click(150, 380)
            cy.get('[data-cy="ol-map"]').click(140, 360)
            cy.get('[data-cy="feature-area-information"]')
                .should('be.visible')
                .contains('9999.8 m2')

            cy.log('Feature Area Info should be in kilometers above unit threshold')
            cy.clickDrawingTool(EditableFeatureTypes.LINEPOLYGON)

            cy.get('[data-cy="ol-map"]').click(200, 250)
            cy.get('[data-cy="ol-map"]').click(250, 250)
            cy.get('[data-cy="ol-map"]').click(150, 300)
            cy.get('[data-cy="ol-map"]').click(200, 250)

            cy.get('[data-cy="feature-area-information"]')
                .should('be.visible')
                .contains('0.125 km2')
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
            const warningTitle = `Warning, you have not copied/saved the link enabling you to edit your drawing at a later date. You risk not being able to edit your drawing if you reload or close the page.`
            cy.goToDrawing()
            cy.clickDrawingTool(EditableFeatureTypes.MARKER)
            cy.get('[data-cy="ol-map"]').click()
            cy.wait(['@post-kml', '@layers', '@topics', '@topic-ech', '@routeChange'])

            // checks that it adds the kml file ID in the URL while in drawing mode
            cy.url().should('match', /layers=[^;&]*KML|[^|,f1]+/)
            // checks that it doesn't add adminId to the url
            cy.url().should('not.contain', 'adminId')

            cy.closeDrawingMode(false)

            cy.log('check if clicking close that it opens the warning again')
            cy.get('[data-cy="drawing-not-shared-admin-warning"]')
                .should('be.visible')
                .contains(warningTitle)
            cy.get('[data-cy="modal-close-button"]').click()

            cy.closeDrawingMode(false)

            cy.get('[data-cy="drawing-not-shared-admin-warning"]')
                .should('be.visible')
                .contains(warningTitle)

            cy.log(
                'check if clicking close that the drawing is still not saved but now the drawing mode is closed'
            )
            cy.get('[data-cy="drawing-share-admin-close"]').click()

            cy.get(
                '[data-cy="menu-tray-drawing-section"] > [data-cy="menu-section-header"]'
            ).click()

            cy.closeDrawingMode(false)

            cy.get('[data-cy="drawing-not-shared-admin-warning"]')
                .should('be.visible')
                .contains(warningTitle)
            cy.get('[data-cy="drawing-share-admin-link"]').click()
            cy.get('[data-cy="drawing-share-admin-close"]').click()

            cy.log(
                'check that now that the drawing edit link is copied and the warning is not shown anymore'
            )
            cy.get(
                '[data-cy="menu-tray-drawing-section"] > [data-cy="menu-section-header"]'
            ).click()
            cy.closeDrawingMode()

            cy.log(
                'check that the warning shows after deleting the drawing and drawing something new'
            )
            cy.get(
                '[data-cy="menu-tray-drawing-section"] > [data-cy="menu-section-header"]'
            ).click()
            cy.get('[data-cy="drawing-toolbox-delete-button"]').click()
            cy.get('[data-cy="modal-confirm-button"]').click()
            cy.clickDrawingTool(EditableFeatureTypes.MARKER)
            cy.get('[data-cy="ol-map"]').click()
            cy.closeDrawingMode(false)
            cy.get('[data-cy="drawing-not-shared-admin-warning"]')
                .should('be.visible')
                .contains(warningTitle)
            cy.get('[data-cy="drawing-share-admin-link"]').click()
            cy.get('[data-cy="drawing-share-admin-close"]').click()

            cy.readStoreValue('state.layers.activeLayers').should((layers) => {
                expect(layers).to.be.an('Array').lengthOf(1)
                const [drawingLayer] = layers
                expect(drawingLayer.type).to.eq(LayerTypes.KML)
                expect(drawingLayer.visible).to.be.true
            })

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
                    `[data-cy^="active-layer-name-${getServiceKmlBaseUrl()}api/kml/files/${kmlId}-"]`
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
                cy.wait(['@head-kml', '@get-kml'])
                cy.openMenuIfMobile()

                cy.log(`Check that the KML file ${kmlId} is present on the active layer list`)
                cy.get(
                    `[data-cy^="active-layer-name-${getServiceKmlBaseUrl()}api/kml/files/${kmlId}-"]`
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
                    `[data-cy^="active-layer-name-${getServiceKmlBaseUrl()}api/kml/files/${kmlId}-"]`
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

                    // The just cleared KML should not be in the active layer list anymore
                    cy.window().its('store.getters.activeKmlLayer').should('be.null')

                    cy.log(`Check that adding a new feature update the new kml ${newKmlId}`)
                    // Add another feature and checking that we do not create subsequent copies (we now have the adminId for this KML)
                    cy.clickDrawingTool(EditableFeatureTypes.ANNOTATION)
                    cy.get('[data-cy="ol-map"]').click('center')
                    cy.wait('@post-kml').then((interception2) => {
                        const newNewKmlId = interception2.response.body.id

                        cy.log('Check the active layer list making sure that there is only the new')
                        cy.closeDrawingMode()

                        cy.log(
                            `Check that the old kml has been removed from the active layer and that the new one has been added`
                        )
                        cy.get(
                            `[data-cy^="active-layer-name-${getServiceKmlBaseUrl()}api/kml/files/${kmlId}-"]`
                        ).should('not.exist')
                        cy.get(
                            `[data-cy^="active-layer-name-${getServiceKmlBaseUrl()}api/kml/files/${newNewKmlId}-"]`
                        )
                            .should('be.visible')
                            .contains('Drawing')
                    })
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
            const kmlFileUrl = `${getServiceKmlBaseUrl()}api/kml/files/${kmlFileId}`
            const kmlUrlParam = `KML|${kmlFileUrl}@adminId=${kmlFileAdminId}`

            // opening up the app and centering it directly on the single marker feature from the fixture
            cy.goToDrawing({ layers: kmlUrlParam, center: center.join(',') }, true)

            // the app must open the drawing module at startup whenever an adminId is found in the URL
            cy.readStoreValue('state.drawing.drawingOverlay.show').should('be.true')

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
            cy.get('[data-cy="ol-map"]').click(200, 200)

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
            const kmlFileUrl = `${getServiceKmlBaseUrl()}api/kml/files/${kmlFileId}`
            const kmlAdminUrl = `${getServiceKmlBaseUrl()}api/kml/admin/${kmlFileId}`
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
            cy.intercept('HEAD', kmlFileUrl, {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/vnd.google-earth.kml+xml',
                },
            }).as('head-legacy-kml')
            cy.intercept('GET', kmlFileUrl, {
                statusCode: 200,
                fixture: 'service-kml/legacy-mf-geoadmin3.kml',
            }).as('get-legacy-kml')

            // opening up the app and centering it directly on the single marker feature from the fixture
            cy.goToMapView({ adminId: kmlFileAdminId, E: center[0], N: center[1] }, false)
            cy.wait([
                '@get-kml-metadata-by-admin-id',
                // as we come from outside any import tool, all file parser will be tried consecutively, and each of them
                // will try to get a HEAD response. As it starts with KMZ, there will be two HEAD request (one for KMZ parser on for KML)
                '@head-legacy-kml',
                '@head-legacy-kml',
                '@get-legacy-kml',
            ])
            cy.waitUntilState((state) => state.drawing.iconSets.length > 0)

            // the app must open the drawing module at startup whenever an adminId is found in the URL
            cy.readStoreValue('state.drawing.drawingOverlay.show').should('be.true')

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
            cy.get('[data-cy="ol-map"]').click(200, 200)

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
            cy.get('[data-cy="ol-map"]').click(140, 360)
            cy.get('[data-cy="ol-map"]').click(150, 360)
            cy.get('[data-cy="ol-map"]').click(150, 380)
            // clicking on the same spot as the first, it should close the polygon
            cy.get('[data-cy="ol-map"]').click(140, 360)

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
            cy.closeDrawingMode()
            cy.get('[data-cy="menu-tray-drawing-section"]').should('be.visible').click()
            // it changes the name of the KML file
            cy.log('Check that the KML file can be renamed')
            const newKmlName = 'new kml name'
            cy.get('[data-cy="drawing-toolbox-file-name-input"]').clear()
            cy.get('[data-cy="drawing-toolbox-file-name-input"]').type(newKmlName)
            cy.wait('@update-kml')
            cy.wait('@update-kml')
            // it exports KML when clicking on the export button (without choosing format)
            cy.get(
                '[data-cy="drawing-toolbox-export-button"] [data-cy="dropdown-main-button"]'
            ).click()
            checkFiles('kml', (content) => {
                expect(content).to.contains(`<Document><name>${newKmlName}</name>`)
                expect(content).to.contains(
                    `<ExtendedData><Data name="type"><value>${EditableFeatureTypes.LINEPOLYGON.toLocaleLowerCase()}</value></Data></ExtendedData>`,
                    `Feature type LINEPOLYGON not found in KML, there might be a missing feature`
                )
            })
            cy.task('clearFolder', downloadsFolder)
            // it changes the name of the KML file with sanitization
            cy.log('Check that the KML file can be renamed with sanitization')
            const newDirtyKmlName = `${newKmlName}<`
            const newDirtyKmlNameSanitized = `${newKmlName}&lt;`
            cy.get('[data-cy="drawing-toolbox-file-name-input"]').clear()
            cy.get('[data-cy="drawing-toolbox-file-name-input"]').type(newDirtyKmlName)
            cy.wait('@update-kml')

            // it exports KML when clicking on the export button (without choosing format)
            cy.get(
                '[data-cy="drawing-toolbox-export-button"] [data-cy="dropdown-main-button"]'
            ).click()
            checkFiles('kml', (content) => {
                expect(content).to.contains(`<Document><name>${newDirtyKmlNameSanitized}</name>`)
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
            cy.readClipboardValue().should((clipboardText) => {
                expect(clipboardText).to.be.equal(
                    publicShortlink,
                    `Share link is not a public shortlink`
                )
            })

            // Same check, but with the other input (that should contain the adminId)
            cy.get('[data-cy="drawing-share-admin-link"]').focus()
            cy.get('[data-cy="drawing-share-admin-link"]').realClick()
            cy.readClipboardValue().should((clipboardText) => {
                expect(clipboardText).to.be.equal(
                    adminshortlink,
                    `Share link is not an admin shortlink`
                )
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
            cy.readClipboardValue().should((clipboardText) => {
                expect(clipboardText).to.contain(
                    `KML%7C${getServiceKmlBaseUrl()}api/kml/files/${kmlId}`
                )
                expect(clipboardText).to.not.contain(`@adminId`)
            })
            // checking that the "Edit later" link contains the adminId
            cy.get('[data-cy="drawing-share-admin-link"]').focus()
            cy.get('[data-cy="drawing-share-admin-link"]').realClick()
            cy.readClipboardValue().should((clipboardText) => {
                expect(clipboardText).to.contain(
                    `KML%7C${getServiceKmlBaseUrl()}api/kml/files/${kmlId}`
                )
                expect(clipboardText).to.contain(`@adminId=${adminId}`)
            })
        })
        it('shows a profile of a line/measure coming from service-alti data', () => {
            const profileIntercept = '**/rest/services/profile.json**'

            // as we want to edit the measure line while having the profile shown up, we need a bit of vertical space
            // (the map is entirely covered by the profile + tooltip otherwise)
            cy.viewport(320, 800)

            cy.goToDrawing()

            // returning an empty profile as a start
            cy.intercept(profileIntercept, []).as('empty-profile')

            cy.clickDrawingTool(EditableFeatureTypes.MEASURE)
            cy.get('[data-cy="ol-map"]').click(100, 240)
            cy.get('[data-cy="ol-map"]').click(150, 250)
            cy.get('[data-cy="ol-map"]').dblclick(120, 260)
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
            cy.get('[data-cy="ol-map"]').click(100, 240)
            cy.get('[data-cy="ol-map"]').click(150, 250)
            cy.get('[data-cy="ol-map"]').click(190, 250)
            cy.get('[data-cy="ol-map"]').dblclick(120, 270)
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

            cy.log('check that profile gets updated when feature is modified by removing a point')
            // for mobile double click and on desktop right click
            cy.get('[data-cy="ol-map"]').dblclick(190, 250)
            cy.wait('@profile')
            cy.get('[data-cy="ol-map"]').rightclick(150, 250)
            cy.wait('@profile')

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

            // close the drawing mode to close the popover else it is not possible to close it since the drawing header is overlapping the popover
            cy.closeDrawingMode()
            cy.get('[data-cy="menu-tray-drawing-section"]').should('be.visible').click()

            cy.clickDrawingTool(EditableFeatureTypes.MARKER)
            cy.get('[data-cy="ol-map"]').click(200, 290)
            // open info box
            cy.get('[data-cy="ol-map"]').click(200, 290)
            cy.get('[data-cy="infobox"]').should('be.visible')
            // // re-opening
            cy.get('[data-cy="ol-map"]').click(200, 290)
            cy.get('[data-cy="infobox"]').should('be.visible')

            // clicking on the X button again, but this time with the content being hidden (clicking first on the header)
            cy.get('[data-cy="infobox-minimize-maximize"]').click()
            cy.get('[data-cy="infobox-close"]').click()
            cy.get('[data-cy="infobox"]').should('not.exist')
        })
        it('can switch from floating edit popup to back at bottom', () => {
            cy.goToDrawing()
            // to avoid overlaping with the map footer and the floating tooltip, increase the vertical size.
            // if the width of the viewport is less than 400px, we can't switch the edit popup position.
            cy.viewport(400, 1024)

            cy.wait('@icon-sets')
            cy.wait('@icon-set-default')
            const testEditPopupFloatingToggle = () => {
                cy.get('[data-cy="infobox"] [data-cy="drawing-style-popup"]').should('be.visible')
                cy.get('[data-cy="popover"] [data-cy="drawing-style-popup"]').should('not.exist')

                cy.get('[data-cy="infobox-toggle-floating"]').click({ force: true })

                // checking that the edit form is still present but now in the floating popup
                cy.get('[data-cy="infobox"] [data-cy="drawing-style-popup"]').should('not.exist')
                cy.get('[data-cy="popover"] [data-cy="drawing-style-popup"]').should('be.visible')

                cy.get('[data-cy="toggle-floating-off"]').click()

                // on mobile the delete button is a bit hidden behind the background wheel, so we force the click
                cy.get('[data-cy="drawing-style-delete-button"]').click({ force: true })
                cy.wait('@update-kml')
                cy.get('[data-cy="infobox"] [data-cy="drawing-style-popup"]').should('not.exist')
                cy.get('[data-cy="popover"] [data-cy="drawing-style-popup"]').should('not.exist')
            }

            cy.log('Testing a floating tooltiop with a marker')
            cy.clickDrawingTool(EditableFeatureTypes.MARKER)
            cy.get('[data-cy="ol-map"]').click()
            cy.wait('@post-kml')
            testEditPopupFloatingToggle()

            // same test, but this time with a line
            // (the placement of the popup is a bit trickier and different from a single coordinate marker)
            cy.log('Testing a floating tooltiop with a line')
            cy.clickDrawingTool(EditableFeatureTypes.LINEPOLYGON)
            cy.get('[data-cy="ol-map"]').click(120, 240)
            cy.get('[data-cy="ol-map"]').click(150, 250)
            cy.get('[data-cy="ol-map"]').click(150, 260)
            // finishing the line by click the same spot
            cy.get('[data-cy="ol-map"]').click(150, 260)
            cy.wait('@update-kml')
            testEditPopupFloatingToggle()

            cy.log('Infobox closes when drawing tool is selected')
            cy.clickDrawingTool(EditableFeatureTypes.ANNOTATION)
            cy.get('[data-cy="ol-map"]').click()
            cy.wait('@update-kml')
            cy.get('[data-cy="infobox"] [data-cy="drawing-style-popup"]').should('be.visible')
            cy.get('[data-cy="popover"] [data-cy="drawing-style-popup"]').should('not.exist')
            cy.clickDrawingTool(EditableFeatureTypes.ANNOTATION)
            cy.get('[data-cy="infobox"] [data-cy="drawing-style-popup"]').should('not.exist')
            cy.get('[data-cy="popover"] [data-cy="drawing-style-popup"]').should('not.exist')

            cy.log('Popover closes when drawing tool is selected')
            cy.get('[data-cy="ol-map"]').click()
            cy.wait('@update-kml')
            cy.get('[data-cy="infobox-toggle-floating"]').click()
            cy.get('[data-cy="infobox"] [data-cy="drawing-style-popup"]').should('not.exist')
            cy.get('[data-cy="popover"] [data-cy="drawing-style-popup"]').should('be.visible')
            cy.clickDrawingTool(EditableFeatureTypes.ANNOTATION)
            cy.get('[data-cy="infobox"] [data-cy="drawing-style-popup"]').should('not.exist')
            cy.get('[data-cy="popover"] [data-cy="drawing-style-popup"]').should('not.exist')
        })
    })

    it('receives an empty KML and can use drawing mode', () => {
        function verifyActiveKmlLayerEmptyWithError() {
            cy.window()
                .its('store.getters.activeKmlLayer')
                .then((layer) => {
                    expect(layer.fileId).to.eq(fileId)
                    expect(layer.name).to.eq('KML')
                    expect(layer.hasError).to.be.true
                    expect(layer.kmlData).to.be.null
                    expect(layer.errorMessages).not.to.be.undefined
                    expect(layer.errorMessages).not.to.be.undefined
                    expect(layer.errorMessages.size).to.eq(1)
                    expect(layer.errorMessages.values().next().value.msg).to.eq(
                        'kml_gpx_file_empty'
                    )
                })
        }
        cy.intercept('GET', `**/api/kml/files/**`, (req) => {
            const headers = { 'Cache-Control': 'no-cache' }
            req.reply(EMPTY_KML_DATA, headers)
        }).as('get-empty-kml')

        cy.intercept('POST', `**/api/kml/admin**`).as('post-new-kml')

        const fileId = 'zBnMZymwTLSNg__5f8yv6g'
        // load map with an injected kml layer containing an empty KML
        cy.goToMapView({
            layers: [`KML|https://sys-public.dev.bgdi.ch/api/kml/files/${fileId}`].join(';'),
        })

        cy.wait('@get-empty-kml')
        // there should be only one KML layer left in the layers, and it's the one just saved
        verifyActiveKmlLayerEmptyWithError()

        cy.openMenuIfMobile()

        cy.get('[data-cy="button-has-error"]').should('be.visible')

        cy.openDrawingMode()

        cy.get('[data-cy="drawing-toolbox-file-name-input"]', { timeout: 15000 }).should(
            'be.visible'
        )
        cy.closeDrawingMode()

        // saving the drawing without drawing anything should not change the empty KML layer
        verifyActiveKmlLayerEmptyWithError()

        cy.openDrawingMode()

        cy.get('[data-cy="drawing-toolbox-file-name-input"]', { timeout: 15000 }).should(
            'be.visible'
        )
        cy.clickDrawingTool(EditableFeatureTypes.MARKER)
        cy.get('[data-cy="ol-map"]').click(120, 240)
        cy.closeDrawingMode()
        cy.wait('@post-new-kml')
        // drawing a marker should create a new KML layer and overwrite the empty one
        cy.window()
            .its('store.getters.activeKmlLayer')
            .then((layer) => {
                expect(layer.fileId).not.to.eq(fileId)
                expect(layer.name).to.eq('Drawing')
                expect(layer.hasError).to.be.false
                expect(layer.kmlData).not.to.be.null
                expect(layer.errorMessages.size).to.eq(0)
            })
    })
})
