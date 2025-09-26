/// <reference types="cypress" />

import { assertDefined } from "support/utils"

describe('Testing the embed view', () => {
    function checkUrlParams(urlToCheck: string, validationUrl: string): void {
        const href = new URLSearchParams(urlToCheck.replace('#map', ''))
        const validation = new URLSearchParams(validationUrl.replace('#map', ''))
        for (const key of validation.keys()) {
            expect(validation.get(key)).to.equal(href.get(key))
        }
    }
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
                checkUrlParams(
                    href,
                    `#/map?lang=en&center=2660013.5,1185172&z=2&bgLayer=test.background.layer2&topic=ech&layers=`
                )
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

        cy.readStoreValue('getters.visibleLayers').should((layers) => {
            expect(layers).to.be.an('Array').length(3)
            expect(layers[0].id).to.eq('test-1.wms.layer')
            expect(layers[0].opacity).to.eq(0.75)
            expect(layers[1].id).to.eq('test.wmts.layer')
            expect(layers[1].opacity).to.eq(0.5)
            expect(layers[2].id).to.eq('test.timeenabled.wmts.layer')
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
                checkUrlParams(
                    href,
                    `#/map?layers=test-1.wms.layer;test.wmts.layer,,0.5;test-2.wms.layer,f;test.timeenabled.wmts.layer&lang=en&center=2660013.5,1185172&z=2.333&bgLayer=test.background.layer2&topic=ech`
                )
            })
    })

    // Skipping because legacy mode is not seems not to be supported anymore entirely
    // the parameters layers_visibility, layers_opacity and layers_timestamp are not working in the test
    it.skip('Open in legacy embed mode and can jump to the non embed mode', () => {
        cy.log(`Open in legacy mode without parameters`)
        cy.goToEmbedView({
            legacy: true,
            queryParams: {
                zoom: 2,
            }
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
        cy.get('[data-cy="open-full-app-link-anchor"]')
            .should('have.attr', 'target', '_blank')
            .invoke('attr', 'href')
            .should((href) => {
                assertDefined(href)
                checkUrlParams(
                    href,
                    `#/map?lang=en&center=2660013.5,1185172&z=1&bgLayer=test.background.layer2&topic=ech&layers=`
                )
            })

        cy.log('Test mouse zoom scrolling')
        cy.location('hash').should('contain', 'z=1')
        cy.get('[data-cy="scaleline"]').should('contain', '50 km')
        cy.get('[data-cy="ol-map"]').realMouseWheel({ deltaY: -100 })
        cy.location('hash').should('contain', 'z=1.333')
        cy.get('[data-cy="scaleline"]').should('contain', '50 km')
        cy.get('[data-cy="ol-map"]').realMouseWheel({ deltaY: -300 })
        cy.location('hash').should('contain', 'z=2.333')
        cy.get('[data-cy="scaleline"]').should('contain', '20 km')

        cy.log('Test that location popup is deactivated')
        cy.get('[data-cy="ol-map"]').realClick({ button: 'right' })
        cy.get('[data-cy="location-popup"]').should('not.exist')

        cy.log('Test with non default legacy query parameters')
        cy.log('Test with a specific layer: test-1.wms.layer')
        cy.goToEmbedView({
            queryParams: {
                layers: 'test-1.wms.layer;test.wmts.layer;test-2.wms.layer;test.timeenabled.wmts.layer',
                layers_visibility: 'true,true,false,true', // currently not working
                layers_opacity: '0.75,0.5,1,1', // currently not working
                layers_timestamp: ',,,20160101', // currently not working
            },
            legacy: true,
        })

        cy.get('[data-cy="app-header"]').should('not.exist')
        cy.get('[data-cy="menu-tray"]').should('not.exist')

        cy.get('[data-cy="time-slider-button"]').should('not.exist')

        cy.get('[data-cy="scaleline"]').should('be.visible')

        cy.readStoreValue('getters.visibleLayers').should((layers) => {
            expect(layers).to.be.an('Array').length(3)
            expect(layers[0].id).to.eq('test-1.wms.layer')
            expect(layers[0].opacity).to.eq(0.75)
            expect(layers[1].id).to.eq('test.wmts.layer')
            expect(layers[1].opacity).to.eq(0.5)
            expect(layers[2].id).to.eq('test.timeenabled.wmts.layer')
            expect(layers[2].opacity).to.eq(1.0)
            expect(layers[2].timeConfig.currentTimeEntry.timestamp).to.eq('20160101')
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
                checkUrlParams(
                    href,
                    `#/map?lang=en&center=2660013.5,1185172&z=1&bgLayer=test.background.layer2&topic=ech&layers=test-1.wms.layer;test.wmts.layer,,0.5;test-2.wms.layer,f,1;test.timeenabled.wmts.layer@year=2016,,1`
                )
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