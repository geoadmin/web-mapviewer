import { createAPoint } from '../drawing.helper'

describe('Drawing points', () => {
    it('toggles the marker symbol popup when clicking button', () => {
        createAPoint('marker', 0, -200, 915602.81, 6156527.960512564)

        // Opening symbol popup (should display default iconset)
        cy.get('.marker-style').click()
        cy.get('.marker-style-popup').should('be.visible')

        cy.wait('@iconsets')
        cy.wait('@iconset_default')

        // we reduce the number of symbols to speed up the test
        Array.from(Array(19).keys()).forEach(() =>
            cy
                .wait('@icon')
                .its('request.url')
                .should('include', 'v4/iconsets/default/icon/')
                .should('include', '255,0,0.png')
        )

        // Check default color
        cy.checkDrawnGeoJsonProperty('markerColor', '#ff0000')
        cy.get('.marker-style-popup .color-select-box > .selected > div').should(
            'have.css',
            'backgroundColor',
            'rgb(255, 0, 0)'
        )

        // Select green color
        cy.get('.marker-style-popup .color-select-box > :nth-child(4) > div').click()
        cy.checkDrawnGeoJsonProperty('markerColor', '#008000')
        cy.checkDrawnGeoJsonProperty(
            'icon',
            'https://service-icons.bgdi-dev.swisstopo.cloud/v4/iconsets/default/icon/bicycle-0,128,0.png'
        )
        cy.get('.marker-style-popup .color-select-box > .selected > div').should(
            'have.css',
            'backgroundColor',
            'rgb(0, 128, 0)'
        )
        Array.from(Array(19).keys()).forEach(() =>
            cy
                .wait('@icon')
                .its('request.url')
                .should('include', 'v4/iconsets/default/icon/')
                .should('include', '0,128,0.png')
        )
        cy.wait('@modifyFile').then((interception) =>
            expect(interception.request.body).to.contain(
                '<Data name="icon"><value>https://service-icons.bgdi-dev.swisstopo.cloud/v4/iconsets/default/icon/bicycle-0,128,0.png</value>'
            )
        )

        // Select another size
        cy.checkDrawnGeoJsonProperty('markerScale', 1)
        cy.get('.marker-style-popup [data-cy="size-button"]').click()
        cy.get('.marker-style-popup [data-cy="size-choices"] > :nth-child(2)').click()
        cy.checkDrawnGeoJsonProperty('markerScale', 1.5)
        cy.wait('@modifyFile').then((interception) =>
            expect(interception.request.body).to.contain(
                '<Data name="markerScale"><value>1.5</value>'
            )
        )

        // Select babs iconset
        cy.get('[data-cy=symbols-button]').click()
        cy.get('[data-cy=symbols-choices] > :nth-child(1)').click()
        cy.wait('@iconset_babs')

        Array.from(Array(14).keys()).forEach(() =>
            cy
                .wait('@icon')
                .its('request.url')
                .should('include', 'v4/iconsets/babs/icon/babs-')
                .should('include', '.png')
        )
        cy.get('.marker-style-popup .color-select-box').should('not.exist')
        cy.get('.marker-style-popup .marker-icon-select-box :nth-child(4) > img').click()
        cy.checkDrawnGeoJsonProperty(
            'icon',
            'https://service-icons.bgdi-dev.swisstopo.cloud/v4/iconsets/babs/icon/babs-100.png'
        )
        cy.wait('@modifyFile').then((interception) =>
            expect(interception.request.body).to.contain(
                '<Data name="icon"><value>https://service-icons.bgdi-dev.swisstopo.cloud/v4/iconsets/babs/icon/babs-100.png</value>'
            )
        )
    })

    describe('test text popup', () => {
        ;['marker', 'text'].forEach((kind) => {
            it(`toggles the ${kind} symbol popup when clicking button`, () => {
                createAPoint(kind, 0, -200, 915602.81, 6156527.960512564)

                // Opening text popup
                cy.get('.text-style').click()
                cy.get('.text-style-popup').should('be.visible')

                cy.get('.text-style-popup [data-cy=size-button]').click()
                cy.get('.text-style-popup [data-cy=size-choices] > a:nth-child(2)').click()
                cy.checkDrawnGeoJsonProperty('textScale', 1.5)

                cy.get('.text-style-popup .color-select-box > div:nth-child(1)').click()
                cy.checkDrawnGeoJsonProperty('color', '#000000')

                // Closing the popup
                cy.get('.text-style').click()
                cy.get('.text-style-popup').should('not.exist')

                // Opening again the popup
                cy.get('.text-style').click()
                cy.get('.text-style-popup').should('be.visible')
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
