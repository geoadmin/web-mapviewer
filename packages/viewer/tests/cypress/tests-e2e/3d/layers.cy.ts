import type { Viewer } from 'cesium'

import { LV95, WEBMERCATOR } from '@swissgeo/coordinates'

import { EditableFeatureTypes } from '@/api/features.api'
import { transformLayerIntoUrlString } from '@/router/storeSync/layersParamParser'

function expectLayerCountToBe(viewer: Viewer, layerCount: number) {
    const layers = viewer.scene.imageryLayers
    expect(layers.length).to.eq(
        layerCount,
        `Wrong layer count. Expected ${layerCount} but got ${layers.length}.`
    )
}

describe('Test of layer handling in 3D', () => {
    it('add layer from search bar', () => {
        cy.log('Search and add a WMTS layer through the search bar')
        const expectedWmtsLayerId = 'test.wmts.layer'
        cy.intercept('**/rest/services/ech/SearchServer*?type=layers*', {
            body: {
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
        }).as('search-wmts-layers')
        cy.intercept('**rest/services/ech/SearchServer*?type=locations*', {
            body: { results: [] },
        }).as('search-locations')
        cy.goToMapView({
            queryParams: {
                '3d': true,
            },
        })
        cy.waitUntilCesiumTilesLoaded()
        cy.openMenuIfMobile()
        cy.get('[data-cy="searchbar"]').as('searchBar').paste('test wmts')
        cy.wait(['@search-locations', '@search-wmts-layers'])
        cy.get('[data-cy="search-results-layers"] [data-cy="search-result-entry"]').first().click()
        cy.get('[data-cy="menu-button"]').click()
        cy.window()
            .its('cesiumViewer')
            .then((viewer) => {
                expectLayerCountToBe(viewer, 2)
                const wmtsLayer = viewer.scene.imageryLayers.get(1)
                expect(wmtsLayer.show).to.eq(true)
                expect(wmtsLayer.imageryProvider.url).to.have.string(
                    `1.0.0/${expectedWmtsLayerId}/default/current/3857/{z}/{x}/{y}.png`
                )
            })

        cy.log('Search and add a WMS layer through the search bar')
        const expectedWmsLayerId = 'test.wms.layer'
        cy.intercept('**rest/services/ech/SearchServer*?type=layers*', {
            body: {
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
        }).as('search-wms-layers')
        cy.get('@searchBar').clear()
        cy.get('@searchBar').paste('test wms')
        cy.wait(['@search-locations', '@search-wms-layers'])
        cy.get('[data-cy="search-results-layers"] [data-cy="search-result-entry"]').first().click()
        cy.window()
            .its('cesiumViewer')
            .then((viewer) => {
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
            queryParams: {
                '3d': true,
                layers: `${wmtsLayerIdWithout3DConfig},,0.5`,
            },
        })
        cy.waitUntilCesiumTilesLoaded()
        cy.window()
            .its('cesiumViewer')
            .then((viewer) => {
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
        const newSliderPosition = 0.3
        cy.get(`@opacitySlider-${wmtsLayerIdWithout3DConfig}`)
            .should('be.visible')
            .invoke('val', newSliderPosition)
            .trigger('input')
        cy.window()
            .its('cesiumViewer')
            .should((viewer) => {
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
        cy.window()
            .its('cesiumViewer')
            .should((viewer) => {
                expectLayerCountToBe(viewer, 3)
                const wmsLayer = viewer.scene.imageryLayers.get(2)
                expect(wmsLayer.imageryProvider.layers).to.have.string(wmsLayerIdWithout3DConfig)
            })
    })
    it('sets the timestamp of a layer when specified in the layers URL param', () => {
        const timeEnabledLayerId = 'test.timeenabled.wmts.layer'
        cy.fixture('layers.fixture.json').then((layersMetadata) => {
            const timedLayerMetadata = layersMetadata[timeEnabledLayerId]
            // TODO: refactor cypress.d.ts so it gives correct types
            // @ts-expect-error this is chainable, but cypress type definition says it's a string, so it's causing issues here.
            cy.getRandomTimestampFromSeries(timedLayerMetadata).then((randomTimestampFromLayer) => {
                cy.goToMapView({
                    queryParams: {
                        '3d': true,
                        layers: `${timeEnabledLayerId}@year=${randomTimestampFromLayer.substring(
                            0,
                            4
                        )}`,
                    },
                })
                cy.waitUntilCesiumTilesLoaded()
                cy.window()
                    .its('cesiumViewer')
                    .then((viewer) => {
                        expect(
                            viewer.scene.imageryLayers.get(1).imageryProvider.url
                        ).to.have.string(
                            `1.0.0/${timeEnabledLayerId}/default/${randomTimestampFromLayer}/3857/{z}/{x}/{y}.png`
                        )
                    })
            })
        })
    })
    it('reorders visible layers when corresponding buttons are pressed', () => {
        const firstLayerId = 'test.wms.layer'
        const secondLayerId = 'test.wmts.layer'
        cy.goToMapView({
            queryParams: {
                '3d': true,
                sr: WEBMERCATOR.epsgNumber,
                layers: `${firstLayerId};${secondLayerId}`,
            },
            withHash: true,
        }) // with hash, so that we can have external layer support
        cy.waitUntilCesiumTilesLoaded()
        cy.openMenuIfMobile()
        // lower the order of the first layer
        cy.openLayerSettings(firstLayerId)
        cy.get(`[data-cy^="button-raise-order-layer-${firstLayerId}-"]`)
            .should('be.visible')
            .click()
        // checking that the order has changed
        cy.window()
            .its('cesiumViewer')
            .then((viewer) => {
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
        cy.window()
            .its('cesiumViewer')
            .then((viewer) => {
                expect(viewer.scene.imageryLayers.get(1).imageryProvider.layers).to.eq(firstLayerId)
                expect(viewer.scene.imageryLayers.get(2).imageryProvider.url).to.have.string(
                    `1.0.0/${secondLayerId}/default/current/3857/{z}/{x}/{y}.png`
                )
            })
    })
    it('add GeoJson layer with opacity from URL param', () => {
        const geojsonlayerId = 'test.geojson.layer'
        cy.goToMapView({
            queryParams: {
                '3d': true,
                layers: `${geojsonlayerId},,0.5`,
            },
        })
        cy.wait(['@geojson-data', '@geojson-style'])
        cy.waitUntilCesiumTilesLoaded()
        cy.window()
            .its('cesiumViewer')
            .should((viewer) => {
                expect(viewer.dataSources.length).to.eq(1, 'should have 1 data source (GeoJSON)')
            })
    })
    it('removes a layer from the visible layers when the "remove" button is pressed', () => {
        const geojsonlayerId = 'test.geojson.layer'
        cy.goToMapView({
            queryParams: {
                '3d': true,
                layers: `${geojsonlayerId}`,
            },
        })
        cy.waitUntilCesiumTilesLoaded()
        cy.wait(['@geojson-data', '@geojson-style'])
        cy.window()
            .its('cesiumViewer')
            .should((viewer) => {
                expect(viewer.dataSources.length).to.eq(1)
            })
        cy.openMenuIfMobile()
        cy.get(`[data-cy^="button-remove-layer-${geojsonlayerId}-"]`).should('be.visible').click()
        cy.window()
            .its('cesiumViewer')
            .then((viewer) => {
                expect(viewer.dataSources.length).to.eq(0)
            })
    })
    it('uses the 3D configuration of a layer if one exists', () => {
        cy.goToMapView({
            queryParams: {
                '3d': true,
                layers: 'test.background.layer,,0.8',
            },
        })
        cy.waitUntilCesiumTilesLoaded()
        cy.window()
            .its('cesiumViewer')
            .then((viewer) => {
                const layer = viewer.scene.imageryLayers.get(1)
                // the opacity of the parent 2D layer must be applied to the 3D counterpart
                expect(layer?.alpha).to.eq(0.8)

                const provider = layer?.imageryProvider
                expect(provider?.url).to.contain('test.background.layer_3d')
            })
    })
    it('add KML layer from drawing', () => {
        cy.goToDrawing()
        cy.clickDrawingTool(EditableFeatureTypes.LinePolygon)
        cy.get('[data-cy="ol-map"]').click(100, 250)
        cy.get('[data-cy="ol-map"]').click(150, 250)
        cy.get('[data-cy="ol-map"]').dblclick(150, 280)

        cy.clickDrawingTool(EditableFeatureTypes.Marker)
        cy.get('[data-cy="ol-map"]').click()

        cy.get('[data-cy="drawing-style-feature-title"]').type('This is a title')
        cy.wait('@post-kml')
        cy.closeDrawingMode()
        cy.closeMenuIfMobile()
        cy.get('[data-cy="3d-button"]').click()
        cy.waitUntilCesiumTilesLoaded()
        cy.window()
            .its('cesiumViewer')
            .should((viewer) => {
                expect(viewer.dataSources.length).to.eq(1)
            })
    })

    it('Verify layer features in 2D and 3D', () => {
        cy.log('Go to 3D and add a WMS layer')
        const expectedWmsLayerId = 'test.wms.layer'
        cy.goToMapView({
            queryParams: {
                '3d': true,
                layers: expectedWmsLayerId,
            },
        })
        cy.waitUntilCesiumTilesLoaded()
        cy.window()
            .its('cesiumViewer')
            .then((viewer) => {
                expectLayerCountToBe(viewer, 2)
                const wmsLayer = viewer.scene.imageryLayers.get(1)
                expect(wmsLayer.show).to.eq(true)
                expect(wmsLayer.imageryProvider.layers).to.have.string(expectedWmsLayerId)
            })

        cy.log('Switching to 2D and checking that the layer is still visible')
        // deactivate 3D
        cy.get('[data-cy="3d-button"]').should('be.visible').click()
        cy.window()
            .its('map')
            .then((map) => {
                const layers = map.getLayers().getArray()
                expect(layers[1].getProperties().id).to.deep.equal(expectedWmsLayerId)

                // If the layer is not visible, it is usually because the extent is not correct
                expect(layers[1].getExtent()).to.deep.equal(LV95.bounds.flatten)
            })

        cy.log('Select features and check that they are visible in 3D and then also back in 2D')
        cy.get('[data-cy="ol-map"]').click(100, 250)
        cy.readStoreValue('getters.selectedFeatures').should('have.length', 10)

        cy.get('[data-cy="highlighted-features"]')
            .as('highlightedFeatures')
            .should('be.visible')
            .find('[data-cy="feature-item"]')
            .should('have.length', 10)

        // activate 3D
        cy.get('[data-cy="3d-button"]').should('be.visible').click()
        cy.waitUntilCesiumTilesLoaded()

        cy.window()
            .its('cesiumViewer')
            .then((viewer) => {
                expect(viewer.entities.values.length).to.eq(10)
            })
        cy.get('@highlightedFeatures')
            .should('be.visible')
            .find('[data-cy="feature-item"]')
            .should('have.length', 10)

        // deactivate 3D
        cy.get('[data-cy="3d-button"]').should('be.visible').click()
        cy.get('@highlightedFeatures')
            .should('be.visible')
            .find('[data-cy="feature-item"]')
            .should('have.length', 10)

        cy.log(
            'Switch to 3D and remove the layer and check that the selected features are not visible anymore'
        )

        // activate 3D
        cy.get('[data-cy="3d-button"]').should('be.visible').click()
        cy.waitUntilCesiumTilesLoaded()

        cy.openMenuIfMobile()

        cy.get(`[data-cy^="button-toggle-visibility-layer-${expectedWmsLayerId}-"]`).click()

        cy.closeMenuIfMobile()
        cy.readStoreValue('getters.selectedFeatures').should('have.length', 0)
        cy.get('@highlightedFeatures').should('not.exist')
        cy.window()
            .its('cesiumViewer')
            .then((viewer) => {
                expect(viewer.entities.values.length).to.eq(0)
            })
    })
    it('Verify a layer with EPSG:4326(WEBMERCATOR) bounding box in 2D and 3D', () => {
        cy.getExternalWmsMockConfig().then((layerObjects) => {

            expect(layerObjects[1]).to.not.be.undefined
            // we want to use only the second mock layer, but typescript can't know and be certain that
            // mockExternalWms2 = layerObjects[1] is not undefined. So we make a foreach on a slice, and
            // make an expectation for layerObjects[1] to be defined, just in case one day we have an issue
            // with the test data
            layerObjects.slice(1, 2).forEach((mockExternalWms2) => {
                expect(mockExternalWms2).not.to.be.undefined
                // @ts-expect-error: external wms has the visible attribute from abstract layer, but typescript can't see it explicitly
                mockExternalWms2.visible = true
                const layers = [mockExternalWms2].map((object) => transformLayerIntoUrlString(object, null, null)).join(';')
                cy.goToMapView({
                    queryParams: { '3d': true, layers },
                })
                cy.log('Go to 3D and add a WMS layer')
                // This layer extent got transformed from EPSG:4326 to EPSG:2056
                const layerExtentInLV95 = [2485071.58, 1075346.31, 2828515.82, 1299941.79]
                cy.waitUntilCesiumTilesLoaded()
                cy.window().its('cesiumViewer').then((viewer) => {
                    expectLayerCountToBe(viewer, 2)
                    const wmsLayer = viewer.scene.imageryLayers.get(1)
                    expect(wmsLayer.show).to.eq(true)
                    expect(wmsLayer.imageryProvider.layers).to.have.string(mockExternalWms2.id)
                })

                cy.log('Switching to 2D and checking that the layer is still visible')
                // deactivate 3D
                cy.get('[data-cy="3d-button"]').should('be.visible').click()
                cy.window().its('map').then((map) => {
                    const layers = map.getLayers().getArray()
                    expect(layers[1].getProperties().id).to.deep.equal(mockExternalWms2.id)
                    // If the layer is not visible, it is usually because the extent is not correct
                    expect(layers[1].getExtent()).to.deep.equal(layerExtentInLV95)
                })

                // activate 3D
                cy.get('[data-cy="3d-button"]').should('be.visible').click()
                cy.waitUntilCesiumTilesLoaded()

                cy.get('[data-cy="3d-button"]').should('be.visible').click()
                cy.window().its('map').then((map) => {
                    const layers = map.getLayers().getArray()
                    expect(layers[1].getProperties().id).to.deep.equal(mockExternalWms2.id)
                    // If the layer is not visible, it is usually because the extent is not correct
                    expect(layers[1].getExtent()).to.deep.equal(layerExtentInLV95)
                })
            })
        })
    })
})
