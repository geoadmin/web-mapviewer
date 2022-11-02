/// <reference types="cypress" />
import { EditableFeatureTypes } from '@/api/features.api'
import { getKmlFromRequest } from 'tests/e2e-cypress/support/drawing'

const olSelector = '.ol-viewport'

// Position of the marker defined in service-kml/lonelyMarker.kml
const markerLatitude = 46.883715999352546
const markerLongitude = 7.656108679791837

describe('Drawing saving KML', () => {
    beforeEach(() => {
        cy.goToDrawing()
    })

    it('saves a KML on draw end', () => {
        cy.clickDrawingTool(EditableFeatureTypes.MARKER)
        cy.get(olSelector).click('center')
        cy.wait('@post-kml').then((interception) =>
            cy.checkKMLRequest(interception, [EditableFeatureTypes.MARKER], true)
        )
        cy.readStoreValue('state.drawing.drawingKmlIds').then((ids) => {
            expect(ids.adminId).to.eq('1234_adminId')
            expect(ids.fileId).to.eq('1234_fileId')
        })
    })
    it('update the previously saved KML if anything is added to the drawing', () => {
        // drawing a marker and waiting for the KML to be posted (created)
        cy.clickDrawingTool(EditableFeatureTypes.MARKER)
        cy.get(olSelector).click('center')
        cy.wait('@post-kml')
        cy.get('[data-cy="infobox-close"]').click()
        // adding another marker and wait for the update
        cy.clickDrawingTool(EditableFeatureTypes.MARKER)
        // clicking just on the side of the first marker
        const width = Cypress.config('viewportWidth')
        const height = Cypress.config('viewportHeight')
        cy.get(olSelector).click(width / 2.0 + 50, height / 2.0, { force: true })
        cy.wait('@update-kml').then((interception) =>
            cy.checkKMLRequest(interception, [EditableFeatureTypes.MARKER])
        )
        cy.get('[data-cy="infobox-close"]').click()
        // adding a line and checking that the KML is updated again
        cy.clickDrawingTool(EditableFeatureTypes.LINEPOLYGON)
        cy.get(olSelector).click(210, 200).click(220, 200).dblclick(230, 230, { force: true })
        cy.wait('@update-kml').then((interception) =>
            cy.checkKMLRequest(interception, [
                EditableFeatureTypes.MARKER,
                EditableFeatureTypes.LINEPOLYGON,
            ])
        )
        // verifying that we still have the same KML file/admin ID from the backend
        cy.readStoreValue('state.drawing.drawingKmlIds').then((ids) => {
            expect(ids.adminId).to.eq('1234_adminId')
            expect(ids.fileId).to.eq('1234_fileId')
        })
    })
})

describe('Drawing loading KML', () => {
    it('load kml file, open drawing mode and try to delete a feature', () => {
        //load map with an injected kml layer containing a text
        const kmlFileId = 'test-fileID12345678900'
        const kmlUrlParam = `KML|https://sys-public.dev.bgdi.ch/api/kml/files/${kmlFileId}|Dessin`
        cy.intercept(`**/api/kml/files/${kmlFileId}`, {
            fixture: 'service-kml/lonelyMarker.kml',
        }).as('initialKmlFile')
        //open drawing mode
        cy.goToDrawing(
            'fr',
            { lat: markerLatitude, lon: markerLongitude, layers: kmlUrlParam },
            true
        )
        cy.readStoreValue('state.features.selectedFeatures').should('have.length', 0)
        cy.readStoreValue('state.drawing.featureIds').should('have.length', 1)
        cy.readWindowValue('drawingLayer')
            .then((layer) => layer.getSource().getFeatures())
            .should('have.length', 1)
        //click on the text
        cy.get(olSelector).click('center')
        cy.readStoreValue('state.features.selectedFeatures').should('have.length', 1)
        cy.readStoreValue('state.drawing.featureIds').should('have.length', 1)
        cy.readWindowValue('drawingLayer')
            .then((layer) => layer.getSource().getFeatures())
            .should('have.length', 1)
        //click on the delete button
        cy.get('[data-cy="drawing-style-delete-button"]').click()
        //ckeck that the text was correctly deleted
        cy.readStoreValue('state.features.selectedFeatures').should('have.length', 0)
        cy.readStoreValue('state.drawing.featureIds').should('have.length', 0)
        cy.readWindowValue('drawingLayer')
            .then((layer) => layer.getSource().getFeatures())
            .should('have.length', 0)
    })
})

const language = 'fr'
let serverKml = '<kml></kml>'

const addKmlInterceptAndReinject = () => {
    cy.intercept(
        {
            method: 'POST',
            url: '**/api/kml/admin',
        },
        async (req) => {
            serverKml = await getKmlFromRequest(req)
            req.reply({
                statusCode: 201,
                fixture: 'service-kml/create-file.fixture.json',
            })
        }
    ).as('post-kml')
    cy.intercept(
        {
            method: 'PUT',
            url: '**/api/kml/admin/**',
        },
        async (req) => {
            serverKml = await getKmlFromRequest(req)
            req.reply({
                statusCode: 200,
                fixture: 'service-kml/update-file.fixture.json',
            })
        }
    ).as('update-kml')
    // intercepting now the call to the file itself
    cy.fixture('service-kml/create-file.fixture.json').then((fileFixture) => {
        cy.intercept(`**/api/kml/files/${fileFixture.id}`, function (req) {
            req.reply({
                statusCode: 200,
                body: serverKml,
            })
        }).as('get-kml')
    })
}

describe('Switching from drawing mode to normal mode', () => {
    beforeEach(() => {
        serverKml = '<kml></kml>'
        cy.goToDrawing(language, { lat: 47.097, lon: 7.743, z: 9.5 }, true)
    })

    /**
     * This test verifies multiple things that the kml layer is saved before it is loaded when
     * closing the drawing immediately after drawing
     */
    it('Check correct passover from drawingLayer to kmlLayer when closing drawing', () => {
        //Open drawing mode
        cy.readWindowValue('drawingLayer')
            .then((layer) => layer.getSource().getFeatures())
            .should('have.length', 0)
        addKmlInterceptAndReinject()
        //Draw a measure
        cy.clickDrawingTool(EditableFeatureTypes.MEASURE)
        cy.get(olSelector).click('left')
        cy.get(olSelector).click('center')
        cy.get(olSelector).dblclick('center')
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 0)

        //Close drawing mode and check that the same number of the features and are displayed
        cy.log('Close drawing mode')
        cy.get('[data-cy="drawing-toolbox-close-button"]').click()
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 1)
        cy.readWindowValue('kmlLayer').should((layer) => {
            const features = layer.getSource().getFeatures()
            expect(features.length).to.be.equal(1)
        })

        //Hide KML layer and check that kml layer disappeared
        cy.readWindowValue('kmlLayerUrl').then(function (kmlUrl) {
            const kmlLayerSelector = `[data-cy^="button-toggle-visibility-layer-KML|${kmlUrl}|`
            cy.get(kmlLayerSelector).click()
            cy.readWindowValue('kmlLayer').should('not.exist')
        })
    })
})
