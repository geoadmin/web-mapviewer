import { createAPoint } from '../drawing.helper'

const drawingStyleMarkerButton = '[data-cy="drawing-style-marker-button"]'
const drawingStyleMarkerPopup = '[data-cy="drawing-style-marker-popup"]'
const drawingStyleMarkerShowAllIconsButton = '[data-cy="drawing-style-show-all-icons-button"]'
const drawingStyleMarkerIconSetSelector = '[data-cy="drawing-style-icon-set-button"]'

const drawingStyleTextButton = '[data-cy="drawing-style-text-button"]'
const drawingStyleTextPopup = '[data-cy="drawing-style-text-popup"]'

const drawingStyleColorBox = '[data-cy="drawing-style-color-select-box"]'
const drawingStyleSizeSelector = '[data-cy="drawing-style-size-selector"]'

describe('Drawing points', () => {
    it('toggles the marker symbol popup when clicking button', () => {
        createAPoint('marker', 0, -200, 915602.81, 6156527.960512564)

        // Opening symbol popup (should display default iconset)
        cy.get(drawingStyleMarkerButton).click()
        cy.get(drawingStyleMarkerPopup).should('be.visible')

        cy.wait('@iconsets')
        cy.wait('@iconset_default')

        // we reduce the number of symbols to speed up the test
        Array.from(Array(19).keys()).forEach(() =>
            cy
                .wait('@icon')
                .its('request.url')
                .should('include', 'v4/icons/sets/default/icons/')
                .should('include', '255,0,0.png')
        )

        // Select green color
        cy.get(
            `${drawingStyleMarkerPopup} ${drawingStyleColorBox} [data-cy="color-selector-green"]`
        ).click()
        cy.checkDrawnGeoJsonProperty('markerColor', '#008000')
        cy.checkDrawnGeoJsonProperty(
            'icon',
            'https://service-icons.bgdi-dev.swisstopo.cloud/v4/icons/sets/default/icons/bicycle-0,128,0.png'
        )
        Array.from(Array(19).keys()).forEach(() =>
            cy
                .wait('@icon')
                .its('request.url')
                .should('include', 'v4/icons/sets/default/icons/')
                .should('include', '0,128,0.png')
        )
        cy.wait('@modifyFile').then((interception) =>
            expect(interception.request.body).to.contain(
                '<Data name="icon"><value>https://service-icons.bgdi-dev.swisstopo.cloud/v4/icons/sets/default/icons/bicycle-0,128,0.png</value>'
            )
        )

        // Select another size
        cy.checkDrawnGeoJsonProperty('markerScale', 1)
        cy.get(`${drawingStyleMarkerPopup} ${drawingStyleSizeSelector}`).click()
        cy.get(
            `${drawingStyleMarkerPopup} [data-cy="drawing-style-size-selector-medium_size"]`
        ).click()
        cy.checkDrawnGeoJsonProperty('markerScale', 1.5)
        cy.wait('@modifyFile').then((interception) =>
            expect(interception.request.body).to.contain(
                '<Data name="markerScale"><value>1.5</value>'
            )
        )

        // Select babs iconset
        cy.get(drawingStyleMarkerIconSetSelector).click()
        cy.get('[data-cy=drawing-style-icon-set-selector-babs]').click()
        cy.wait('@iconset_babs')

        Array.from(Array(14).keys()).forEach(() =>
            cy
                .wait('@icon')
                .its('request.url')
                .should('include', 'v4/icons/sets/babs/icons/babs')
                .should('include', '.png')
        )
        cy.get(`${drawingStyleMarkerPopup} ${drawingStyleColorBox}`).should('not.exist')
        cy.get(`${drawingStyleMarkerPopup} ${drawingStyleMarkerShowAllIconsButton}`).click()
        cy.get(
            `${drawingStyleMarkerPopup} [data-cy="drawing-style-icon-selector-babs-100"]`
        ).click()
        cy.checkDrawnGeoJsonProperty(
            'icon',
            'https://service-icons.bgdi-dev.swisstopo.cloud/v4/icons/sets/babs/icons/babs-100.png'
        )
        cy.wait('@modifyFile').then((interception) =>
            expect(interception.request.body).to.contain(
                '<Data name="icon"><value>https://service-icons.bgdi-dev.swisstopo.cloud/v4/icons/sets/babs/icons/babs-100.png</value>'
            )
        )
    })

    describe('test text popup', () => {
        ;['marker', 'text'].forEach((kind) => {
            it(`toggles the ${kind} symbol popup when clicking button`, () => {
                createAPoint(kind, 0, -200, 915602.81, 6156527.960512564)

                // Opening text popup
                cy.get(drawingStyleTextButton).click()
                cy.get(drawingStyleTextPopup).should('be.visible')

                cy.get(`${drawingStyleTextPopup} ${drawingStyleSizeSelector}`).click()
                cy.get(
                    `${drawingStyleTextPopup} [data-cy="drawing-style-size-selector-medium_size"]`
                ).click()
                cy.checkDrawnGeoJsonProperty('textScale', 1.5)

                cy.get(
                    `${drawingStyleTextPopup} [data-cy="drawing-style-text-color-black"]`
                ).click()
                cy.checkDrawnGeoJsonProperty('color', '#000000')

                // Closing the popup
                cy.get(drawingStyleTextButton).click()
                cy.get(drawingStyleTextPopup).should('not.exist')

                // Opening again the popup
                cy.get(drawingStyleTextButton).click()
                cy.get(drawingStyleTextPopup).should('be.visible')
            })
        })
    })

    it('moves a marker', () => {
        createAPoint('marker')
        // Move it, the geojson geometry should move
        cy.dragDrawingMap(0, 0, 200, 140)
        cy.readDrawingFeatures('Point', (features) => {
            const coos = features[0].getGeometry().getCoordinates()
            expect(coos).to.eql(
                [1160201.300512564, 5740710.526641205],
                `bad: ${JSON.stringify(coos)}`
            )
        })

        cy.get('#text').type('This is a title')
        cy.checkDrawnGeoJsonProperty('text', 'This is a title')

        cy.get('#description').type('This is a description')
        cy.checkDrawnGeoJsonProperty('description', 'This is a description')

        cy.get('.btn-close').click()
        cy.readDrawnGeoJSON().then((geojson) => {
            const g0 = geojson.features[0].geometry
            expect(g0.type).to.equal('Point')
            const coos = g0.coordinates
            expect(coos).to.eql(
                [10.42226560905782, 45.7520927843664],
                `bad: ${JSON.stringify(coos)}`
            )
        })
    })

    it('creates a text', () => {
        createAPoint('text', 0, -200, 915602.81, 6156527.960512564)
    })
})
