import { EditableFeatureTypes } from '@/api/features.api'
import i18n from '@/modules/i18n'
import pako from 'pako'

const olSelector = '.ol-viewport'
const language = 'fr'

const latitude = 47.097
const longitude = 7.743
const zoom = 9.5

let serverKml = '<kml></kml>'

const getKmlFromRequest = async (req) => {
    const formData = await new Response(req.body, { headers: req.headers }).formData()
    const kmlBlob = await formData.get('kml').arrayBuffer()
    return new TextDecoder().decode(pako.ungzip(kmlBlob))
}

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

describe('Measure Overlays handling', () => {
    beforeEach(() => {
        serverKml = '<kml></kml>'
        i18n.global.locale = language
    })
    it('draw measure, abort, and check that there are no overlays left', () => {
        //Open drawing mode
        cy.goToDrawing(language, { lat: latitude, lon: longitude, z: zoom }, true)
        cy.readWindowValue('map').then((map) => {
            const nbOverlaysAtBeginning = map.getOverlays().getLength()
            cy.readWindowValue('drawingLayer')
                .then((layer) => layer.getSource().getFeatures())
                .should('have.length', 0)
            //Start drawing a measure
            cy.clickDrawingTool(EditableFeatureTypes.MEASURE)
            cy.get(olSelector).click('left')
            cy.get(olSelector).click('center')
            //Overlays should be visible
            cy.readWindowValue('map')
                .then((map) => map.getOverlays().getLength())
                .should('be.greaterThan', nbOverlaysAtBeginning)
            //Cancel drawing
            cy.clickDrawingTool(EditableFeatureTypes.MEASURE, true)
            //Overlays should have disappeared
            cy.readWindowValue('map')
                .then((map) => map.getOverlays().getLength())
                .should('be.at.most', nbOverlaysAtBeginning)
            cy.readWindowValue('drawingLayer')
                .then((layer) => layer.getSource().getFeatures())
                .should('have.length', 0)
        })
    })

    /**
     * This test verifies multiple things:
     *
     * - That the kml layer is saved before it is loaded when closing the drawing immediately after drawing
     * - That the measureManager of the drawingLayer correctly removes all overlays and that the
     *   measureManager of the kml layer correctly takes over
     */
    it('Check correct passover from drawingLayer to kmlLayer when closing drawing', () => {
        //Open drawing mode
        cy.goToDrawing(language, { lat: latitude, lon: longitude, z: zoom }, true)
        cy.readWindowValue('map')
            .then((map) => map.getOverlays().getLength())
            .as('nbOverlaysBeforeDrawing')
        cy.readWindowValue('drawingLayer')
            .then((layer) => layer.getSource().getFeatures())
            .should('have.length', 0)
        addKmlInterceptAndReinject()
        //Draw a measure
        cy.clickDrawingTool(EditableFeatureTypes.MEASURE)
        cy.get(olSelector).click('left')
        cy.get(olSelector).click('center')
        cy.get(olSelector).dblclick('center')

        //Overlays should be visible
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 0)
        cy.readWindowValue('map')
            .then((map) => map.getOverlays().getLength())
            .as('nbOverlaysAfterDrawing')
            .should(function (nb) {
                expect(nb).to.be.greaterThan(this.nbOverlaysBeforeDrawing)
            })
            .then(function (nb) {
                cy.wrap(nb - this.nbOverlaysBeforeDrawing).as('nbOverlaysDrawn')
            })

        //Close drawing mode and check that the same number of the features and Overlays are
        //displayed
        cy.log('Close drawing mode')
        cy.get('[data-cy="drawing-toolbox-close-button"]').click()
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 1)
        cy.readWindowValue('map').should(function (map) {
            const length = map.getOverlays().getLength()
            expect(length).to.be.equal(this.nbOverlaysDrawn + this.nbOverlaysAtBeginning)
        })
        cy.readWindowValue('kmlLayer').should((layer) => {
            const features = layer.getSource().getFeatures()
            expect(features.length).to.be.equal(1)
        })

        //Hide KML layer and check that kml layer and overlays disappeared
        cy.fixture('service-kml/create-file.fixture.json').as('fileFixture')
        cy.readWindowValue('kmlLayer').then(function (layer) {
            const kmlUrl = layer.getSource().getUrl()
            const kmlLayerSelector =
                `[data-cy="button-toggle-visibility-` +
                `layer-KML|${kmlUrl}|${i18n.global.t('draw_layer_label')}` +
                `@adminId=${this.fileFixture.admin_id}"]`
            cy.get(kmlLayerSelector).click()
            cy.readWindowValue('map').should(function (map) {
                const length = map.getOverlays().getLength()
                expect(length).to.be.eq(this.nbOverlaysAtBeginning)
            })
            cy.readWindowValue('kmlLayer').should('not.exist')
        })
    })
})
