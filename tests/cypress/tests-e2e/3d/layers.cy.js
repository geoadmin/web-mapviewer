import { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import { WEBMERCATOR } from '@/utils/coordinates/coordinateSystems'

function expectLayerCountToBe(viewer, layerCount) {
    const layers = viewer.scene.imageryLayers
    const layerUrls = []
    for (let i = 0; i < layers.length; i++) {
        layerUrls.push(layers.get(i).imageryProvider.url)
    }
    expect(layers.length).to.eq(
        layerCount,
        `Wrong layer count. Expected ${layerCount} but got ${layers.length}. Layers: \n${layerUrls.join('\n')}`
    )
}

describe('Test of layer handling in 3D', () => {
    it('add layer from search bar', () => {
        cy.log('Search and add a WMTS layer through the search bar')
        const expectedWmtsLayerId = 'test.wmts.layer'
        cy.mockupBackendResponse(
            '**rest/services/ech/SearchServer*?type=layers*',
            {
                results: [
                    {
                        id: 4321,
                        weight: 1,
                        attrs: {
                            label: '<b>Test WMTS layer</b>',
                            layer: expectedWmtsLayerId,
                        },
                    },
                ],
            },
            'search-wmts-layers'
        )
        cy.mockupBackendResponse(
            '**rest/services/ech/SearchServer*?type=locations*',
            { results: [] },
            'search-locations'
        )
        cy.goToMapView({
            '3d': true,
        })
        cy.waitUntilCesiumTilesLoaded()
        cy.openMenuIfMobile()
        cy.get('[data-cy="searchbar"]').as('searchBar').paste('test wmts')
        cy.wait(['@search-locations', '@search-wmts-layers'])
        cy.get('[data-cy="search-results-layers"] [data-cy="search-result-entry"]').first().click()
        cy.get('[data-cy="menu-button"]').click()
        cy.readWindowValue('cesiumViewer').then((viewer) => {
            expectLayerCountToBe(viewer, 2)
            const wmtsLayer = viewer.scene.imageryLayers.get(1)
            expect(wmtsLayer.show).to.eq(true)
            expect(wmtsLayer.imageryProvider.url).to.have.string(
                `1.0.0/${expectedWmtsLayerId}/default/current/3857/{z}/{x}/{y}.png`
            )
        })

        cy.log('Search and add a WMS layer through the search bar')
        const expectedWmsLayerId = 'test.wms.layer'
        cy.mockupBackendResponse(
            '**rest/services/ech/SearchServer*?type=layers*',
            {
                results: [
                    {
                        id: 5678,
                        weight: 1,
                        attrs: {
                            label: '<b>Test WMS layer</b>',
                            layer: expectedWmsLayerId,
                        },
                    },
                ],
            },
            'search-wms-layers'
        )
        cy.get('@searchBar').clear()
        cy.get('@searchBar').paste('test wms')
        cy.wait(['@search-locations', '@search-wms-layers'])
        cy.get('[data-cy="search-results-layers"] [data-cy="search-result-entry"]').first().click()
        cy.readWindowValue('cesiumViewer').then((viewer) => {
            expectLayerCountToBe(viewer, 3)
            const wmsLayer = viewer.scene.imageryLayers.get(2)
            expect(wmsLayer.show).to.eq(true)
            expect(wmsLayer.imageryProvider.layers).to.have.string(expectedWmsLayerId)
        })
    })
    it('sets the opacity to the value defined in the layers URL param or menu UI', () => {
        cy.log('checking a WMTS layer without 3D specific configuration')
        const wmtsLayerIdWithout3DConfig = 'test.timeenabled.wmts.layer'
        cy.goToMapView({
            '3d': true,
            layers: `${wmtsLayerIdWithout3DConfig},,0.5`,
        })
        cy.waitUntilCesiumTilesLoaded()
        cy.readWindowValue('cesiumViewer').then((viewer) => {
            const layers = viewer.scene.imageryLayers
            expect(layers.length).to.eq(
                2,
                'There should be the background layer + the WMTS layer added through the URL'
            )
            expect(layers.get(1).alpha).to.eq(
                0.5,
                'The opacity must come from the URL and not the default value from layers config'
            )
        })

        cy.log('Checking that using the menu also changes the opacity correctly')
        cy.openMenuIfMobile()
        cy.openLayerSettings(wmtsLayerIdWithout3DConfig)
        cy.get(`[data-cy^="slider-transparency-layer-${wmtsLayerIdWithout3DConfig}-"]`).as(
            `opacitySlider-${wmtsLayerIdWithout3DConfig}`
        )
        // couldn't find a better way to interact with the slider other than setting the value directly
        let newSliderPosition = 0.3
        cy.get(`@opacitySlider-${wmtsLayerIdWithout3DConfig}`)
            .should('be.visible')
            .invoke('val', newSliderPosition)
            .trigger('input')
        cy.readWindowValue('cesiumViewer').should((viewer) => {
            const layers = viewer.scene.imageryLayers
            expect(layers.get(1).alpha).to.eq(
                1.0 - newSliderPosition,
                'Changing the transparency in the menu must change the opacity of the 3D layer'
            )
        })

        cy.log('checking a WMS layer without 3D specific configuration')
        const wmsLayerIdWithout3DConfig = 'test.wms.layer'
        // closing the 3D menu section to have more room to manipulate the catalog section
        cy.get('[data-cy="menu-tray-3d-section"] > [data-cy="menu-section-header"]').click()
        cy.get('[data-cy="menu-topic-section"]').click()
        cy.get('[data-cy="catalogue-tree-item-2"]').click()
        cy.get('[data-cy="catalogue-tree-item-5"]').click()
        cy.get(`[data-cy="catalogue-add-layer-button-${wmsLayerIdWithout3DConfig}"]`).click()
        cy.readWindowValue('cesiumViewer').should((viewer) => {
            expectLayerCountToBe(viewer, 3)
            const wmsLayer = viewer.scene.imageryLayers.get(2)
            expect(wmsLayer.imageryProvider.layers).to.have.string(wmsLayerIdWithout3DConfig)
        })
    })
    it('sets the timestamp of a layer when specified in the layers URL param', () => {
        const timeEnabledLayerId = 'test.timeenabled.wmts.layer'
        cy.fixture('layers.fixture.json').then((layersMetadata) => {
            const timedLayerMetadata = layersMetadata[timeEnabledLayerId]
            cy.getRandomTimestampFromSeries(timedLayerMetadata).then((randomTimestampFromLayer) => {
                cy.goToMapView({
                    '3d': true,
                    layers: `${timeEnabledLayerId}@year=${randomTimestampFromLayer.substring(
                        0,
                        4
                    )}`,
                })
                cy.waitUntilCesiumTilesLoaded()
                cy.readWindowValue('cesiumViewer').then((viewer) => {
                    expect(viewer.scene.imageryLayers.get(1).imageryProvider.url).to.have.string(
                        `1.0.0/${timeEnabledLayerId}/default/${randomTimestampFromLayer}/3857/{z}/{x}/{y}.png`
                    )
                })
            })
        })
    })
    it('reorders visible layers when corresponding buttons are pressed', () => {
        const firstLayerId = 'test.wms.layer'
        const secondLayerId = 'test.wmts.layer'
        cy.goToMapView(
            {
                '3d': true,
                sr: WEBMERCATOR.epsgNumber,
                layers: `${firstLayerId};${secondLayerId}`,
            },
            true
        ) // with hash, so that we can have external layer support
        cy.waitUntilCesiumTilesLoaded()
        cy.openMenuIfMobile()
        // lower the order of the first layer
        cy.openLayerSettings(firstLayerId)
        cy.get(`[data-cy^="button-raise-order-layer-${firstLayerId}-"]`)
            .should('be.visible')
            .click()
        // checking that the order has changed
        cy.readWindowValue('cesiumViewer').then((viewer) => {
            expect(viewer.scene.imageryLayers.get(1).imageryProvider.url).to.have.string(
                `1.0.0/${secondLayerId}/default/current/3857/{z}/{x}/{y}.png`
            )
            expect(viewer.scene.imageryLayers.get(2).imageryProvider.layers).to.eq(firstLayerId)
        })
        // using the other button
        cy.get(`[data-cy^="button-lower-order-layer-${firstLayerId}-"]`)
            .should('be.visible')
            .click()
        // re-checking the order that should be back to the starting values
        cy.readWindowValue('cesiumViewer').then((viewer) => {
            expect(viewer.scene.imageryLayers.get(1).imageryProvider.layers).to.eq(firstLayerId)
            expect(viewer.scene.imageryLayers.get(2).imageryProvider.url).to.have.string(
                `1.0.0/${secondLayerId}/default/current/3857/{z}/{x}/{y}.png`
            )
        })
    })
    it('add GeoJson layer with opacity from URL param', () => {
        const geojsonlayerId = 'test.geojson.layer'
        cy.goToMapView({
            '3d': true,
            layers: `${geojsonlayerId},,0.5`,
        })
        cy.waitUntilCesiumTilesLoaded()
        cy.readWindowValue('cesiumViewer').then((viewer) => {
            expect(viewer.scene.primitives.length).to.eq(
                4,
                'should have 1 primitive (GeoJSON) on top of labels and buildings primitives'
            )
            // test layer added correctly
            const mainCollection = viewer.scene.primitives.get(0)
            expect(mainCollection.length).to.eq(
                1,
                'There should be 1 layers added to the main collection when a GeoJSON is added'
            )
            const layerCollection = mainCollection.get(0)
            expect(layerCollection.length).to.eq(
                2,
                'A GeoJSON is made of 2 internal layers in the collection'
            )
            // test opacity
            const billboard = layerCollection.get(0).get(0)
            expect(billboard.color.alpha).to.eq(0.5)
        })
    })
    it('removes a layer from the visible layers when the "remove" button is pressed', () => {
        const geojsonlayerId = 'test.geojson.layer'
        cy.goToMapView({
            '3d': true,
            layers: `${geojsonlayerId}`,
        })
        cy.waitUntilCesiumTilesLoaded()
        cy.wait(['@geojson-data', '@geojson-style'])
        cy.readWindowValue('cesiumViewer').then((viewer) => {
            expect(viewer.scene.primitives.length).to.eq(4) // labels + buildings + constructions + GeoJSON layer
        })
        cy.openMenuIfMobile()
        cy.get(`[data-cy^="button-remove-layer-${geojsonlayerId}-"]`).should('be.visible').click()
        cy.readWindowValue('cesiumViewer').then((viewer) => {
            expect(viewer.scene.primitives.length).to.eq(3) // labels, constructions and buildings are still present
        })
    })
    it('uses the 3D configuration of a layer if one exists', () => {
        cy.goToMapView({
            '3d': true,
            layers: 'test.background.layer,,0.8',
        })
        cy.waitUntilCesiumTilesLoaded()
        cy.readWindowValue('cesiumViewer').then((viewer) => {
            const layer = viewer.scene.imageryLayers.get(1)
            // the opacity of the parent 2D layer must be applied to the 3D counterpart
            expect(layer?.alpha).to.eq(0.8)

            const provider = layer?.imageryProvider
            expect(provider?.url).to.contain('test.background.layer_3d')
        })
    })

    // TODO: PB-284 This test is flaky and not always pass on the CI (but is working locally).
    // re-enable the test and modify it to test the feature selection instead of cesium internal
    it.skip('add KML layer from drawing', () => {
        cy.goToDrawing()
        cy.clickDrawingTool(EditableFeatureTypes.LINEPOLYGON)
        const olSelector = '.ol-viewport'
        // Create a line
        cy.get(olSelector).click(100, 200)
        cy.get(olSelector).click(150, 200)
        cy.get(olSelector).should('be.visible').dblclick(120, 240, { force: true })
        cy.clickDrawingTool(EditableFeatureTypes.MARKER)
        cy.readWindowValue('map').then((map) => {
            // Create a point
            cy.simulateEvent(map, 'pointermove', 0, 0)
            cy.simulateEvent(map, 'pointerdown', 0, 0)
            cy.simulateEvent(map, 'pointerup', 0, 0)
        })
        cy.get('[data-cy="drawing-style-feature-title"]').type('This is a title')
        cy.wait('@post-kml')
        cy.closeDrawingMode()
        cy.closeMenuIfMobile()
        cy.get('[data-cy="3d-button"]').click()
        cy.waitUntilCesiumTilesLoaded()
        cy.readWindowValue('cesiumViewer').then((viewer) => {
            // main collection
            cy.wrap(viewer.scene.primitives.get(0)).should('have.length', 1)
            // layer collection
            // should be 3 (line, icon, text) but ol-cesium creates additional empty collection
            cy.wrap(viewer.scene.primitives.get(0).get(0), { timeout: 10000 }).should(
                'have.length',
                4
            )
        })
    })
})
