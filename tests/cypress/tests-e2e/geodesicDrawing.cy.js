import { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import { extractOlFeatureCoordinates } from '@/api/features/features.api.js'
import { WEBMERCATOR } from '@/utils/coordinates/coordinateSystems'
import { wrapXCoordinates } from '@/utils/coordinates/coordinateUtils'
import { HALFSIZE_WEBMERCATOR } from '@/utils/geodesicManager'

const olSelector = '.ol-viewport'

const acceptableDelta = 0.01

function moveMapPos(newCenter) {
    cy.writeStoreValue('setCenter', { center: newCenter, source: 'Cypress geodesic tests' })
    /* In headed mode, the tests work perfectly fine even without these waits. In headless mode
    hovewer, they are needed, as else, the mouse click event following may not be registered
    correctly by the Draw and Modify interactions. The reasons for that are still unclear. */
    const attempt = cy.state('runnable')._currentRetry // from 0 to 5
    cy.wait(Math.min(750 + 500 * attempt, 1250))

    cy.waitUntil(
        () =>
            cy.window().then((win) => {
                const mapCenter = win.map.getView().getCenter()
                return mapCenter[0] === newCenter[0] && mapCenter[1] === newCenter[1]
            }),
        {
            errorMsg: () =>
                'The maps position is: ' +
                cy.state('window').map.getView().getCenter() +
                ' but the requested position was: ' +
                newCenter,
        }
    )
}

function drawFeature(coords, type = EditableFeatureTypes.MEASURE) {
    cy.readWindowValue('drawingLayer')
        .then((layer) => layer.getSource().getFeatures())
        .should('have.length', 0)
    //Draw a feature
    cy.clickDrawingTool(type)
    for (let coord of coords.slice(0, -1)) {
        moveMapPos(coord)
        cy.get(olSelector).click('center')
    }
    moveMapPos(coords[coords.length - 1])
    cy.get(olSelector).dblclick('center')
}

function offsetX(coords, offset) {
    if (Array.isArray(coords[0])) {
        return coords.map((coord) => offsetX(coord, offset))
    }
    return [coords[0] + offset, coords[1]]
}

function checkCoordsEqual(coords1, coords2) {
    expect(
        coords1,
        'Expected the feature to be made of ' + coords2.length + ' points.'
    ).to.have.length(coords2.length)
    const log = coords1.toString() + ' and ' + coords2.toString() + ' should be equal.'
    coords1.forEach((coord, i) => {
        expect(coord, 'A coord should contain exactly two values (x and y coord)').to.have.length(2)
        expect(coords2[i], 'A coord should contain exactly two values').to.have.length(2)
        expect(coord[0], 'X coords differ. ' + log).to.be.closeTo(coords2[i][0], acceptableDelta)
        expect(coord[1], 'Y coords differ. ' + log).to.be.closeTo(coords2[i][1], acceptableDelta)
    })
}

function checkFeatureSelected(featureCoords) {
    cy.waitUntilState((state) => state.features.selectedFeatures.length === 1)
    // May need to be reactivated if the headless tests still fail
    // cy.wait(500)
    cy.readWindowValue('drawingLayer').should((layer) => {
        const features = layer.getSource().getFeatures()
        expect(features, 'Expected the drawing layer to contain exactly one feat').to.have.length(1)
        const coords = extractOlFeatureCoordinates(features[0])
        checkCoordsEqual(coords, featureCoords)
    })
    cy.readStoreValue('state.features.selectedFeatures').then((features) => {
        expect(features, 'Expected exactly one feature to be selected').to.have.length(1)
        checkCoordsEqual(features[0].coordinates, featureCoords)
    })
}

function checkFeatureUnselected() {
    cy.waitUntilState((state) => state.features.selectedFeatures.length === 0)
}

const generateTest = (drawOffset, selectOffset, x, locDesc, test) => {
    let desc = `draw in [${-180 + drawOffset * 360}, ${180 + drawOffset * 360}], `
    desc += `select in [${-180 + selectOffset * 360}, ${180 + selectOffset * 360}] `
    desc += 'at ca. 47° '
    desc += locDesc
    it(desc, () => {
        test(drawOffset * 2 * HALFSIZE_WEBMERCATOR, selectOffset * 2 * HALFSIZE_WEBMERCATOR, x)
    })
}
const generateTestsInPacific = (testFunc) => {
    const atDateTimeLimit = HALFSIZE_WEBMERCATOR
    const pacificDesc7525 = '75% on the west, 25% on the east of the datetime limit'
    const pacificDesc2575 = '25% on the west, 75% on the east of the datetime limit'
    /*Checking that if a feature is drawn at the datetime limit, it is editable on both sides
    of the datetime limit*/
    generateTest(0, 0, atDateTimeLimit - 750000, pacificDesc7525, testFunc)
    generateTest(0, 0, atDateTimeLimit - 250000, pacificDesc2575, testFunc)
}

// The modify interaction custom-made (from OL code) is not up-to-date with OL code anymore
// we will de-activate the geodesic drawing for the time being (no need for it until we do
// a worldwide coverage, and even then we have to assess if we want it or not)
describe.skip('Correct handling of geodesic geometries', () => {
    beforeEach(() => {
        cy.goToDrawing({ z: 10, sr: 3857 }, true)
    })
    context(
        'Check that the modify and select interactions are aware that the linestring geometry is geodesic',
        () => {
            const testFunc = (drawOffset, selectOffset, x, type = EditableFeatureTypes.MEASURE) => {
                const y = 5976445
                const lineToDraw = [
                    [x, y],
                    [x + 1000000, y],
                ]
                drawFeature(offsetX(lineToDraw, drawOffset), type)
                /* If x + 1'000'000 crossed the 180° meridian, we want to normalize this coordinate
                now, as we store the coordinates in their normalized form (We didn't normalize it
                before drawing as we want to simulate a normal user that draws across the datetime
                limit)*/
                const lineDrawn = wrapXCoordinates(lineToDraw, WEBMERCATOR)
                checkFeatureSelected(lineDrawn)

                const centerOfLinearLine = offsetX([x + 500000, y], selectOffset)
                // Result calculated with geographiclib-geodesic
                const centerOfGeodesicLine = offsetX([x + 500000, 5990896.895875603], selectOffset)
                const drawnLineWithCenterPoint = [
                    lineDrawn[0],
                    wrapXCoordinates(centerOfGeodesicLine, WEBMERCATOR),
                    lineDrawn[1],
                ]
                // As the line is not linear, clicking where the linear line passes should not trigger the
                // select interaction (tests the select interaction)
                moveMapPos(centerOfLinearLine)
                // hiding/minimizing the infobox, otherwise a click to the center of the map is blocked
                // by the very long attribution string (with VT multiple attributions)
                cy.get('[data-cy="infobox-minimize-maximize"]').click()
                cy.get(olSelector).click('center')
                checkFeatureUnselected()

                // Clicking where the geodesic line passes should select the feature (this tests that the
                // select interaction is aware that the feature is geodesic)
                moveMapPos(centerOfGeodesicLine)
                cy.get(olSelector).click('center')
                checkFeatureSelected(lineDrawn)

                // hiding/minimizing the infobox, otherwise a click to the center of the map is blocked
                // by the very long attribution string (with VT multiple attributions)
                cy.get('[data-cy="infobox-minimize-maximize"]').click()
                cy.get(olSelector).click('center')
                // opening the infobox again
                cy.get('[data-cy="infobox-minimize-maximize"]').click()
                /* As explained in geodesicManager.js, the maximal discrepancy should be about 2.1cm for
            a line at 47° less than 1000km long. But as 1 equatorial meter < 1 meter at 47°, we are a
            bit more tolerant and allow 0.04 equatorial meters */
                checkFeatureSelected(drawnLineWithCenterPoint)

                // As the line is not linear, clicking where the linear line passes should not create a new
                // point when the line is already selected (tests the modify interaction)
                moveMapPos(offsetX(centerOfLinearLine, selectOffset))
                // hiding/minimizing the infobox, otherwise a click to the center of the map is blocked
                // by the very long attribution string (with VT multiple attributions)
                cy.get('[data-cy="infobox-minimize-maximize"]').click()
                cy.get(olSelector).click('center')
                checkFeatureUnselected()
            }
            // Check the measure feature
            const x = 773900
            const locDesc = 'in switzerland (measure feature)'
            // main test case (draw in switzerland)
            context('Drawing in Switzerland', () => {
                generateTest(0, 0, x, locDesc, testFunc)
                // edge cases (draw in switzerland and select the feature in switzerland, but rotated by 360°)
                generateTest(1, 0, x, locDesc, testFunc)
                generateTest(0, 1, x, locDesc, testFunc)
            })
            context('Drawing in the Pacific', () => {
                generateTestsInPacific(testFunc)
            })
            /* As the underlying code is the same, all the tests should run exactly the same
            for the line feature. So here we run only one test for the line feature to be
            sure that the geodesic drawing is also enabled for them. */
            it('Check that the line feature is also geodesic', () => {
                // To avoid repositioning of the map when selecting the line
                cy.readStoreValue('state.ui.floatingTooltip').then(
                    (tooltip) => tooltip && cy.writeStoreValue('toggleFloatingTooltip')
                )
                testFunc(0, 0, 773900, EditableFeatureTypes.LINEPOLYGON)
            })
        }
    )

    context(
        'Check that the modify and select interactions are aware that the polygon geometry is geodesic',
        () => {
            const testFunc = (drawOffset, selectOffset, x, type = EditableFeatureTypes.MEASURE) => {
                /* To understand what this function does, please check the comments in the other
                test function (I didn't want to duplicate these comments) */
                const y = 5976445
                const centerOfGeodesicLineY = 5990896.895875603
                const lineToDraw = [
                    [x, y],
                    [x + 1000000, y],
                    [x + 1100000, y + 1000000],
                    [x + 100000, y + 100000],
                    [x, y],
                ]
                drawFeature(offsetX(lineToDraw, drawOffset), type)
                const lineDrawn = wrapXCoordinates(lineToDraw, WEBMERCATOR)
                checkFeatureSelected(lineDrawn)

                const inLinearPolygon = [
                    x + 500000 + selectOffset,
                    (centerOfGeodesicLineY - y) / 2 + y,
                ]
                const inGeodesicPolygon = [x + 500000 + selectOffset, centerOfGeodesicLineY + 50000]

                moveMapPos(inLinearPolygon)
                // hiding/minimizing the infobox, otherwise a click to the center of the map is blocked
                // by the very long attribution string (with VT multiple attributions)
                cy.get('[data-cy="infobox-minimize-maximize"]').click()
                cy.get(olSelector).click('center')
                checkFeatureUnselected()

                moveMapPos(inGeodesicPolygon)
                cy.get(olSelector).click('center')
                checkFeatureSelected(lineDrawn)

                /* Checking deleting a point. This checks that the extent of the feature is
                calculated with enough tolerance to accommodate possible imprecisions in the
                calculations. */
                moveMapPos(lineToDraw[2])
                // hiding/minimizing the infobox, otherwise a click to the center of the map is blocked
                // by the very long attribution string (with VT multiple attributions)
                cy.get('[data-cy="infobox-minimize-maximize"]').click()
                cy.get(olSelector).click('center')
                checkFeatureSelected([lineDrawn[0], lineDrawn[1], lineDrawn[3], lineDrawn[4]])
            }
            const x = 773900
            const locDesc = 'in switzerland (measure feature)'
            context('Drawing in Switzerland', () => {
                //main test case (draw in switzerland)
                generateTest(0, 0, x, locDesc, testFunc)
                //edge cases (draw in switzerland and select the feature in switzerland, but rotated by 360°)
                generateTest(-1, 0, x, locDesc, testFunc)
                generateTest(0, -1, x, locDesc, testFunc)
            })
            context('Drawing in the Pacific', () => {
                generateTestsInPacific(testFunc)
            })
            it('Check that the line feature is also geodesic', () => {
                cy.readStoreValue('state.ui.floatingTooltip').then(
                    (tooltip) => tooltip && cy.writeStoreValue('toggleFloatingTooltip')
                )
                testFunc(0, 0, 773900, EditableFeatureTypes.LINEPOLYGON)
            })
        }
    )
})
