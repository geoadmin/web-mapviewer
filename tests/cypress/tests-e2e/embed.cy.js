/// <reference types="cypress" />

describe('Testing the embed view', () => {
    it('Open in embed mode and can jump to the non embed mode', () => {
        cy.goToEmbedView()

        cy.log(`Check that the menu and the header are not displayed`)

        cy.get('[data-cy="app-header"]').should('not.exist')
        cy.get('[data-cy="menu-tray"]').should('not.exist')
        cy.get('[data-cy="mouse-position-select"]').should('not.exist')
        cy.get('[data-cy="mouse-position"]').should('not.exist')

        cy.get('[data-cy="zoom-in"]').should('be.visible')
        cy.get('[data-cy="zoom-out"]').should('be.visible')
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
            .should(
                'have.attr',
                'href',
                `#/map?lang=en&center=2660000,1190000&layers=&z=1&bgLayer=test.background.layer2&topic=ech`
            )
            .should('have.attr', 'target', '_blank')

        cy.log('Test mouse zoom scrolling')
        cy.location('hash').should('contain', 'z=1')
        cy.get('[data-cy="scaleline"]').should('contain', '50 km')
        cy.get('[data-cy="ol-map"]').realMouseWheel({ deltaY: -200 })
        cy.location('hash').should('contain', 'z=1.667')
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
            .should(
                'have.attr',
                'href',
                `#/map?layers=test-1.wms.layer;test.wmts.layer,,0.5;test-2.wms.layer,f;test.timeenabled.wmts.layer&lang=en&center=2660000,1190000&z=1.667&bgLayer=test.background.layer2&topic=ech`
            )
            .should('have.attr', 'target', '_blank')
    })
    it('Open in legacy embed mode and can jump to the non embed mode', () => {
        cy.log(`Open in legacy mode without parameters`)
        cy.goToEmbedView({ legacy: true })

        cy.log(`Check that the menu and the header are not displayed`)

        cy.get('[data-cy="app-header"]').should('not.exist')
        cy.get('[data-cy="menu-tray"]').should('not.exist')
        cy.get('[data-cy="mouse-position-select"]').should('not.exist')
        cy.get('[data-cy="mouse-position"]').should('not.exist')

        cy.get('[data-cy="zoom-in"]').should('be.visible')
        cy.get('[data-cy="zoom-out"]').should('be.visible')
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
            .should(
                'have.attr',
                'href',
                `#/map?lang=en&center=2660000,1190000&layers=&z=1&bgLayer=test.background.layer2&topic=ech`
            )
            .should('have.attr', 'target', '_blank')

        cy.log('Test mouse zoom scrolling')
        cy.location('hash').should('contain', 'z=1')
        cy.get('[data-cy="scaleline"]').should('contain', '50 km')
        cy.get('[data-cy="ol-map"]').realMouseWheel({ deltaY: -200 })
        cy.location('hash').should('contain', 'z=1.667')
        cy.get('[data-cy="scaleline"]').should('contain', '20 km')

        cy.log('Test that location popup is deactivated')
        cy.get('[data-cy="ol-map"]').realClick({ button: 'right' })
        cy.get('[data-cy="location-popup"]').should('not.exist')

        cy.log('Test with non default legacy query parameters')
        cy.log('Test with a specific layer: test-1.wms.layer')
        cy.goToEmbedView({
            queryParams: {
                layers: 'test-1.wms.layer,test.wmts.layer,test-2.wms.layer,test.timeenabled.wmts.layer',
                layers_visibility: 'true,true,false,true',
                layers_opacity: '0.75,0.5,1,1',
                layers_timestamp: ',,,20160101',
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
            .should(
                'have.attr',
                'href',
                `#/map?lang=en&center=2660000,1190000&layers=test-1.wms.layer;test.wmts.layer,,0.5;test-2.wms.layer,f,1;test.timeenabled.wmts.layer@year=2016,,1&z=1&bgLayer=test.background.layer2&topic=ech`
            )
            .should('have.attr', 'target', '_blank')
    })
})
