/// <reference types="cypress" />

import { assertDefined, checkUrlParams } from 'support/utils'

import useLayersStore from '@/store/modules/layers'

describe('Testing the embed view', () => {
    it('Open in embed mode and can jump to the non embed mode', () => {
        cy.goToEmbedView({
            queryParams: { z: 2 },
        })

        cy.log(`Check that the menu and the header are not displayed`)

        cy.get('[data-cy="app-header"]').should('not.exist')
        cy.get('[data-cy="menu-tray"]').should('not.exist')
        cy.get('[data-cy="mouse-position-select"]').should('not.exist')
        cy.get('[data-cy="mouse-position"]').should('not.exist')

        cy.get('[data-cy="3d-button"]').should('be.visible')

        cy.get('[data-cy="geolocation-button"]').should('not.exist')
        cy.get('[data-cy="toolbox-fullscreen-button"]').should('not.exist')
        cy.get('[data-cy="time-slider-button"]').should('not.exist')

        cy.get('[data-cy="app-version"]').should('not.exist')
        cy.get('[data-cy^=app-copyright-]').should('not.exist')

        cy.get('[data-cy="background-selector-open-wheel-button"]').should('not.exist')

        cy.log(`Check for the scale line and copyright presence`)
        cy.get('[data-cy="scaleline"]').should('be.visible')
        cy.get('[data-cy="layers-copyrights"]').should('be.visible')

        cy.log(`Check the link url`)
        cy.get('[data-cy="open-full-app-link"]').should('be.visible').should('contain', 'View on ')
        cy.get('[data-cy="open-full-app-link-anchor"]', { timeout: 20000 })
            .should('have.attr', 'target', '_blank')
            .invoke('attr', 'href')
            .should((href) => {
                assertDefined(href)
                checkUrlParams(href, {
                    lang: 'en',
                    center: '2660013.5,1185172',
                    z: '2',
                    bgLayer: 'test.background.layer2',
                    topic: 'ech',
                })
            })
        cy.log('Test mouse zoom scrolling')
        cy.location('hash').should('contain', 'z=2')
        cy.get('[data-cy="scaleline"]').should('contain', '50 km')
        cy.get('[data-cy="ol-map"]').realMouseWheel({ deltaY: -100 })
        cy.location('hash').should('contain', 'z=2.333')
        cy.get('[data-cy="scaleline"]').should('contain', '20 km')

        cy.log('Test that location popup is deactivated')
        cy.get('[data-cy="ol-map"]').realClick({ button: 'right' })
        cy.get('[data-cy="location-popup"]').should('not.exist')

        cy.log('Test with non default query parameters')
        cy.log('Test with a specific layer: test-1.wms.layer')
        cy.goToEmbedView({
            queryParams: {
                layers: 'test-1.wms.layer;test.wmts.layer,,0.5;test-2.wms.layer,f;test.timeenabled.wmts.layer',
            },
        })

        cy.get('[data-cy="app-header"]').should('not.exist')
        cy.get('[data-cy="menu-tray"]').should('not.exist')

        cy.get('[data-cy="time-slider-button"]').should('not.exist')

        cy.get('[data-cy="scaleline"]').should('be.visible')

        cy.getPinia().then((pinia) => {
            const layersStore = useLayersStore(pinia)
            const layers = layersStore.visibleLayers
            expect(layers).to.be.an('Array').length(3)
            expect(layers[0]?.id).to.eq('test-1.wms.layer')
            expect(layers[0]?.opacity).to.eq(0.75)
            expect(layers[1]?.id).to.eq('test.wmts.layer')
            expect(layers[1]?.opacity).to.eq(0.5)
            expect(layers[2]?.id).to.eq('test.timeenabled.wmts.layer')
        })

        cy.log(`Check attributions of visible layers`)
        cy.get('[data-cy="layer-copyright-attribution.test-1.wms.layer"]').should('be.visible')
        cy.get('[data-cy="layer-copyright-attribution.test.wmts.layer"]').should('be.visible')
        cy.get('[data-cy="layer-copyright-attribution.timeenabled.wmts.layer"]').should(
            'be.visible'
        )

        cy.log(`Check attribution of non visible layers, they should not exists`)
        cy.get('[data-cy="layer-copyright-attribution.test-2.wms.layer"]').should('not.exist')

        cy.log(`Check the link url`)
        cy.get('[data-cy="open-full-app-link"]').should('be.visible').should('contain', 'View on ')
        cy.get('[data-cy="open-full-app-link-anchor"]')
            .should('have.attr', 'target', '_blank')
            .invoke('attr', 'href')
            .should((href) => {
                assertDefined(href)
                checkUrlParams(href, {
                    layers: 'test-1.wms.layer;test.wmts.layer,,0.5;test-2.wms.layer,f;test.timeenabled.wmts.layer',
                    lang: 'en',
                    center: '2660013.5,1185172',
                    z: '2.333',
                    bgLayer: 'test.background.layer2',
                    topic: 'ech',
                })
            })
    })

    it('Open in embed mode with ctrl scrolling', () => {
        cy.goToEmbedView({
            queryParams: { z: 2, nosimplezoom: true },
        })

        cy.log('Test that mouse zoom scrolling fails without pressing ctrl')

        cy.get('[data-cy="ol-map"]').trigger('wheel', {
            deltaY: -100,
            ctrlKey: false,
            bubbles: true, // needed to make sure the listener is triggered
        })

        cy.location('hash').should('contain', 'z=2')

        cy.log('Test that mouse zoom scrolling works with pressing ctrl')

        cy.get('[data-cy="ol-map"]').trigger('wheel', {
            deltaY: -100,
            ctrlKey: true,
            bubbles: true,
        })

        cy.location('hash').should('satisfy', (hash: string) => {
            const match = hash.match(/z=(\d+(?:\.\d+)?)/)
            assertDefined(match)
            assertDefined(match[1])
            return match && parseFloat(match[1]) > 2
        })
    })

    it('Open without the UI in embed mode when asked to', () => {
        cy.goToEmbedView({
            queryParams: { z: 2, hideEmbedUI: true },
        })
        cy.get('[data-cy="zoom-in"]').should('not.exist')
        cy.get('[data-cy="zoom-out"]').should('not.exist')
        cy.get('[data-cy="3d-button"]').should('not.exist')
        cy.get('[data-cy="open-full-app-link"]').should('not.exist')
    })
})
