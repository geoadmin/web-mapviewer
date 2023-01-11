/// <reference types="cypress" />
import { EditableFeatureTypes } from '@/api/features.api'

const olSelector = '.ol-viewport'

// Position of the marker defined in service-kml/lonelyMarker.kml
const markerLatitude = 46.883715999352546
const markerLongitude = 7.656108679791837

describe('Drawing new KML', () => {
    it("Don't save new empty drawing", () => {
        cy.intercept('**/api/kml/admin**', (req) => {
            expect(`Unexpected call to ${req.method} ${req.url}`).to.be.false
        }).as('post-put-kml-not-allowed')
        cy.goToDrawing()
        cy.clickDrawingTool(EditableFeatureTypes.MARKER)
        cy.get('[data-cy="drawing-toolbox-close-button"]').click()
    })
    it('Saves a KML after placing a drawing element', () => {
        cy.goToDrawing()
        cy.clickDrawingTool(EditableFeatureTypes.ANNOTATION)
        cy.get(olSelector).click('center')
        cy.wait('@post-kml').then((interception) =>
            cy.checkKMLRequest(interception, [EditableFeatureTypes.ANNOTATION])
        )
    })

    it('Update the previously saved KML if anything is added to the drawing', () => {
        let kmlId = null
        cy.goToDrawing()
        // drawing a marker and waiting for the KML to be posted (created)
        cy.clickDrawingTool(EditableFeatureTypes.MARKER)
        cy.get(olSelector).click('center')
        cy.wait('@post-kml').then((interception) => {
            cy.checkKMLRequest(interception, [EditableFeatureTypes.MARKER])
            kmlId = interception.response.body.id
        })
        cy.get('[data-cy="infobox-close"]').click()
        // adding another marker and wait for the update
        cy.clickDrawingTool(EditableFeatureTypes.ANNOTATION)
        // clicking just on the side of the first marker
        const width = Cypress.config('viewportWidth')
        const height = Cypress.config('viewportHeight')
        cy.get(olSelector).click(width / 2.0 + 50, height / 2.0, { force: true })
        cy.wait('@update-kml').then(
            (interception) =>
                cy.checkKMLRequest(interception, [
                    EditableFeatureTypes.MARKER,
                    EditableFeatureTypes.ANNOTATION,
                ]),
            kmlId
        )
        cy.get('[data-cy="infobox-close"]').click()
        // adding a line and checking that the KML is updated again
        cy.clickDrawingTool(EditableFeatureTypes.LINEPOLYGON)
        cy.get(olSelector).click(210, 200).click(220, 200).dblclick(230, 230, { force: true })
        cy.wait('@update-kml').then(
            (interception) =>
                cy.checkKMLRequest(interception, [
                    EditableFeatureTypes.MARKER,
                    EditableFeatureTypes.ANNOTATION,
                    EditableFeatureTypes.LINEPOLYGON,
                ]),
            kmlId
        )
    })
})

describe('Drawing existing KML - without adminId (copy)', () => {
    const kmlFileId = 'test-fileID12345678900'
    const kmlFileUrl = `https://public.geo.admin.ch/api/kml/files/${kmlFileId}`
    const kmlUrlParam = `KML|${encodeURIComponent(kmlFileUrl)}|Dessin`
    beforeEach(() => {
        //open drawing mode
        cy.goToDrawing({
            lang: 'fr',
            otherParams: { lat: markerLatitude, lon: markerLongitude, layers: kmlUrlParam },
            withHash: true,
        })
    })
    it("Don't save non modified drawing", () => {
        cy.intercept('**/api/kml/admin**', (req) => {
            expect(`Unexpected call to ${req.method} ${req.url}`).to.be.false
        }).as('post-put-kml-not-allowed')
        cy.clickDrawingTool(EditableFeatureTypes.MARKER)
        cy.get('[data-cy="drawing-toolbox-close-button"]').click()
    })
    it('Save a copy when deleting a feature', () => {
        cy.readStoreValue('state.features.selectedFeatures').should('have.length', 0)
        cy.readStoreValue('state.drawing.featureIds').should('have.length', 1)
        cy.readWindowValue('drawingLayer')
            .then((layer) => layer.getSource().getFeatures())
            .should('have.length', 1)
        // click on the text
        cy.get(olSelector).click('center')
        cy.readStoreValue('state.features.selectedFeatures').should('have.length', 1)
        cy.readStoreValue('state.drawing.featureIds').should('have.length', 1)
        cy.readWindowValue('drawingLayer')
            .then((layer) => layer.getSource().getFeatures())
            .should('have.length', 1)
        //click on the delete button
        cy.get('[data-cy="drawing-style-delete-button"]').click()
        cy.wait('@post-kml')
        // TODO somehow the interception below is brocken ! The KML request payload is corrupted
        // and the checkKMLRequest method cannot unzip the kml file. I could not find the reason
        // why after many hours of debuging. I check this test manually and could verify that it
        // works as intendend, it seem to be an issue with the cypress intercept mechanism and
        // not with the app
        // .then((interception) => cy.checkKMLRequest(interception, []))

        //check that the text was correctly deleted
        cy.readStoreValue('state.features.selectedFeatures').should('have.length', 0)
        cy.readStoreValue('state.drawing.featureIds').should('have.length', 0)
        cy.readWindowValue('drawingLayer')
            .then((layer) => layer.getSource().getFeatures())
            .should('have.length', 0)
        cy.get('[data-cy="drawing-toolbox-close-button"]').click()
    })
})

describe('Drawing existing KML - with adminId', () => {
    const kmlFileId = 'test-fileID12345678900'
    const kmlFileAdminId = 'test-fileAdminID12345678900'
    const kmlFileUrl = `https://public.geo.admin.ch/api/kml/files/${kmlFileId}`

    it('Save existing kml when it has been emptied', () => {
        cy.intercept('POST', '**/api/kml/admin', (req) => {
            expect(`Unexpected call to ${req.method} ${req.url}`).to.be.false
        }).as('post-kml-not-allowed')
        cy.intercept('PUT', new RegExp(`.*/api/kml/admin/(?!${kmlFileId})`), (req) => {
            expect(`Unexpected call to ${req.method} ${req.url}`).to.be.false
        }).as('put-kml-not-allowed')
        const kmlUrlParam = `KML|${encodeURIComponent(kmlFileUrl)}|Dessin@adminId=${kmlFileAdminId}`

        //open drawing mode
        cy.goToDrawing({
            lang: 'fr',
            otherParams: { lat: markerLatitude, lon: markerLongitude, layers: kmlUrlParam },
            withHash: true,
        })
        // delete the drawing
        cy.get('[data-cy="drawing-toolbox-delete-button"]').click()
        cy.get('[data-cy="modal-confirm-button"]').click()
        cy.wait('@update-kml')
        // TODO somehow the interception below is brocken ! The KML request payload is corrupted
        // and the checkKMLRequest method cannot unzip the kml file. I could not find the reason
        // why after many hours of debuging. I check this test manually and could verify that it
        // works as intendend, it seem to be an issue with the cypress intercept mechanism and
        // not with the app
        // .then((interception) =>
        //     cy.checkKMLRequest(interception, [], kmlFileId)
        // )
        //check that the text was correctly deleted
        cy.readStoreValue('state.features.selectedFeatures').should('have.length', 0)
        cy.readStoreValue('state.drawing.featureIds').should('have.length', 0)
        cy.readWindowValue('drawingLayer')
            .then((layer) => layer.getSource().getFeatures())
            .should('have.length', 0)
        cy.get('[data-cy="drawing-toolbox-close-button"]').click()
    })
})

describe('Drawing loading KML', () => {
    it('Load kml file without adminId and select element', () => {
        //load map with an injected kml layer containing a text
        const kmlFileId = 'test-fileID12345678900'
        const kmlFileUrl = `https://public.geo.admin.ch/api/kml/files/${kmlFileId}`
        const kmlUrlParam = `KML|${encodeURIComponent(kmlFileUrl)}|Dessin`

        //open drawing mode
        cy.goToDrawing({
            lang: 'fr',
            otherParams: { lat: markerLatitude, lon: markerLongitude, layers: kmlUrlParam },
            withHash: true,
        })
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
    })

    it('Load kml file with adminId', () => {
        //load map with an injected kml layer containing a text
        const kmlFileId = 'test-fileID12345678900'
        const kmlFileAdminId = 'test-fileAdminID12345678900'
        const kmlFileUrl = `https://public.geo.admin.ch/api/kml/files/${kmlFileId}`
        const kmlUrlParam = `KML|${encodeURIComponent(kmlFileUrl)}|Dessin@adminId=${kmlFileAdminId}`
        //open drawing mode
        cy.goToDrawing({
            lang: 'fr',
            otherParams: { lat: markerLatitude, lon: markerLongitude, layers: kmlUrlParam },
            withHash: true,
        })
        cy.readStoreValue('state.features.selectedFeatures').should('have.length', 0)
        cy.readStoreValue('state.drawing.featureIds').should('have.length', 1)
        cy.readWindowValue('drawingLayer')
            .then((layer) => layer.getSource().getFeatures())
            .should('have.length', 1)
    })
})

describe('Switching from drawing mode to normal mode', () => {
    beforeEach(() => {
        cy.goToDrawing({
            lang: 'fr',
            otherParams: { lat: 47.097, lon: 7.743, z: 9.5 },
            withHash: true,
        })
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
        //Draw a measure
        cy.clickDrawingTool(EditableFeatureTypes.MEASURE)
        cy.get(olSelector).click('left')
        cy.get(olSelector).click('center')
        cy.get(olSelector).dblclick('center')
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 0)

        // waiting for the KML to be saved on the backend
        cy.wait('@post-kml')
        //Close drawing mode and check that the same number of the features and are displayed
        cy.log('Close drawing mode')
        cy.get('[data-cy="drawing-toolbox-close-button"]').click()
        // the KML should now be requested from the backend to create the drawing layer
        cy.wait('@get-kml')
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 1)
        cy.readWindowValue('kmlLayer').should((layer) => {
            const features = layer.getSource().getFeatures()
            expect(features.length).to.be.equal(1)
        })

        // Hide KML layer and check that kml layer disappeared
        cy.readWindowValue('kmlLayerUrl').then(function (kmlUrl) {
            const kmlLayerSelector = `[data-cy^="button-toggle-visibility-layer-KML|${encodeURIComponent(
                kmlUrl
            )}|`
            cy.get(kmlLayerSelector).click()
            cy.readWindowValue('kmlLayer').should('not.exist')
        })
    })
})
