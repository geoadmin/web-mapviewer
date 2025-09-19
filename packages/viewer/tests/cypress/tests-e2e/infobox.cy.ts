/// <reference types="cypress" />

import { LV95, WEBMERCATOR } from '@swissgeo/coordinates'
import type { MockFeature } from 'support/intercepts'

describe('The infobox', () => {
    const generateInfoboxTestsForMapSelector = (mapSelector: string): void => {
        it('is visible if features selected', () => {
            cy.get('[data-cy="highlighted-features"]').should('not.exist')

            cy.get(mapSelector).click()
            cy.waitUntilState(
                (_, getters) => {
                    return getters.selectedFeatures.length > 0
                },
                { timeout: 10000 }
            )

            cy.get('[data-cy="highlighted-features"]').should('be.visible')
        })
        it('can float or stick to the bottom', () => {
            // the option to have a floating tooltip require the width of the viewport to be
            // at least 400 pixels.
            cy.viewport(400, 800)
            cy.get(mapSelector).click()
            cy.waitUntilState((_, getters) => {
                return getters.selectedFeatures.length > 0
            })
            cy.readStoreValue('getters.isPhoneMode').then((isPhoneMode: boolean) => {
                if (isPhoneMode) {
                    cy.get('[data-cy="popover"]').should('not.exist')
                    cy.get('[data-cy="infobox"]').should('be.visible')

                    cy.get('[data-cy="infobox-minimize-maximize"]').click()
                    cy.get('[data-cy="infobox-content"]').should('not.exist')

                    cy.get('[data-cy="infobox-minimize-maximize"]').click()
                    cy.get('[data-cy="infobox-content"]').should('be.visible')

                    cy.get('[data-cy="infobox-toggle-floating"]').click()
                    cy.get('[data-cy="popover"]').should('be.visible')
                    cy.get('[data-cy="infobox"]').should('not.exist')

                    // we have to force the click, as in the mobile viewport the button can sometimes be under the header
                    cy.get('[data-cy="toggle-floating-off"]').click({ force: true })
                    cy.get('[data-cy="popover"]').should('not.exist')
                    cy.get('[data-cy="infobox"]').should('be.visible')
                } else {
                    cy.get('[data-cy="popover"]').should('be.visible')
                    cy.get('[data-cy="infobox"]').should('not.exist')

                    cy.get('[data-cy="toggle-floating-off"]').click()
                    cy.get('[data-cy="popover"]').should('not.exist')
                    cy.get('[data-cy="infobox"]').should('be.visible')
                    cy.get('[data-cy="infobox-minimize-maximize"]').click()
                    cy.get('[data-cy="infobox-content"]').should('not.exist')

                    cy.get('[data-cy="infobox-minimize-maximize"]').click()
                    cy.get('[data-cy="infobox-content"]').should('be.visible')

                    cy.get('[data-cy="infobox-toggle-floating"]').click()
                    cy.get('[data-cy="popover"]').should('be.visible')
                    cy.get('[data-cy="infobox"]').should('not.exist')
                }
            })
        })
    }

    const layer: string = 'test.wmts.layer'
    const feature: MockFeature = {
        geometry: { type: 'Point', coordinates: LV95.bounds.center },
        layerBodId: 'ch.babs.kulturgueter',
        bbox: [
            LV95.bounds.center[0] - 1000,
            LV95.bounds.center[1] - 1000,
            LV95.bounds.center[0] + 1000,
            LV95.bounds.center[1] + 1000,
        ],
        featureId: '1234',
        layerName: 'A nice test layer',
        type: 'Feature',
        id: '1234',
        properties: {
            link_title: 'This is a test feature',
            link_uri: 'http://localhost:8080/',
            link_2_title: null,
            link_2_uri: null,
            link_3_title: 'This is a test feature',
            link_3_uri: null,
            label: 'This is a test feature',
            x: 1234.0,
            y: 1234.0,
            lon: 1234.0,
            lat: 1234.0,
        },
    }

    beforeEach(() => {
        cy.intercept('**/MapServer/identify**', { results: [feature] })
        cy.intercept(`**/MapServer/${layer}/**geometryFormat**`, feature)
        cy.intercept('**/MapServer/**/htmlPopup**', {
            fixture: 'html-popup.fixture.html',
        })
    })
    context('OpenLayers map', () => {
        beforeEach(() => {
            cy.goToMapView({ queryParams: { layers: layer } })
        })
        generateInfoboxTestsForMapSelector('[data-cy="ol-map"]')
    })

    context('Changes the language of the infobox', () => {
        beforeEach(() => {
            cy.goToMapView({ queryParams: { layers: layer } })
            cy.intercept('**/MapServer/**/htmlPopup**&lang=de**', {
                fixture: 'html-popup-german.fixture.html',
            }).as('htmlPopupGerman')
        })
        it('changes the language of the infobox', () => {
            cy.get('[data-cy="ol-map"]').click()
            cy.waitUntilState((_, getters) => {
                return getters.selectedFeatures.length > 0
            })
            const htmlPopupCalls: number = 10
            cy.get('@htmlPopup.all').should('have.length', htmlPopupCalls)

            cy.clickOnLanguage('de')

            cy.closeMenuIfMobile()

            cy.wait(['@layerConfig', '@topics', '@topic-ech', '@featureDetail', '@htmlPopupGerman'])
            cy.get('@htmlPopup.all').should('have.length', htmlPopupCalls)
            cy.get('.htmlpopup-content')
                .should('be.visible')
                .should('contain', 'Beschreibung')
                .should('contain', 'Ich bin ein Testfenster')
                .should('contain', 'Stadt')
                .should('contain', 'Kanton')
                .should('contain', 'Mehr Informationen')
                .should('contain', 'Link zum Object')
        })
    })
    // since we've been serving fake tiles to Cesium, the location popup is broken as Cesium can't return proper coordinates
    // we need to fix this Cesium fake tile issue before reactivating this test context
    // TODO : BGDIINF_SB-3181
    context.skip('Cesium map', () => {
        beforeEach(() => {
            cy.goToMapView({
                queryParams: {
                    layers: layer,
                    '3d': true,
                    sr: WEBMERCATOR.epsgNumber,
                },
                withHash: true,
            })
            cy.waitUntilCesiumTilesLoaded()
        })
        // generateInfoboxTestsForMapSelector('[data-cy="cesium-map"]')
    })
    context('transition from 2D to 3D (and back to 2D)', () => {
        beforeEach(() => {
            cy.goToMapView({ queryParams: { layers: layer } })

            cy.get('[data-cy="ol-map"]').click()
            cy.waitUntilState((_, getters) => {
                return getters.selectedFeatures.length > 0
            })
            cy.get('[data-cy="highlighted-features"]').should('be.visible')
        })
        it('keeps the selected features when going 3D', () => {
            cy.get('[data-cy="3d-button"]').click()
            // waiting for 3D to be loaded
            cy.window().its('cesiumViewer').then(() => {
                cy.get('[data-cy="highlighted-features"]').should('be.visible')
            })
        })
        it('keeps the selected features when going back to 2D', () => {
            cy.get('[data-cy="3d-button"]').click()
            cy.window().its('cesiumViewer').then(() => {
                cy.get('[data-cy="3d-button"]').click()
                cy.get('[data-cy="highlighted-features"]').should('be.visible')
            })
        })
        it('verifies the "More Information" button in the infobox and the information page that is shown', () => {
            const infoboxFixture: string = 'infobox.fixture.html'
            cy.intercept('GET', 'https://api3.geo.admin.ch/**', {
                fixture: infoboxFixture,
            }).as('infobox')

            cy.get('[data-cy="highlighted-features"]').should('be.visible')
            cy.get('[data-cy="more-info-link"]')
                .should('exist')
                .should('contain', 'More info')
                .click({ force: true })

            cy.wait(['@routeChange', '@layerConfig', '@topics', '@topic-ech', '@infobox'])

            cy.origin('https://api3.geo.admin.ch', () => {
                cy.url().should((url) => {
                    expect(url).to.eq(
                        'https://api3.geo.admin.ch/rest/services/ech/MapServer/ch.bav.haltestellen-oev/8577026/extendedHtmlPopup'
                    )
                })
                cy.get('.chsdi-htmlpopup-container').should('be.visible')
                cy.get('.htmlpopup-header').should('be.visible').contains('Public transport stops')
                cy.get('.htmlpopup-content')
                    .should('be.visible')
                    .should('contain', 'Number')
                    .should('contain', '8577026')
                    .should('contain', 'Name')
                    .should('contain', 'Rubigen, Bahnhof')
                    .should('contain', 'Abreviation')
                    .should('contain', '-')
                    .should('contain', 'TO')
                    .should('contain', 'SVB')
                    .should('contain', 'Type')
                    .should('contain', 'Haltestelle')
                    .should('contain', 'Means of transport')
                    .should('contain', 'Bus')
                    .should('contain', 'Link to object')
            })
        })
    })
})