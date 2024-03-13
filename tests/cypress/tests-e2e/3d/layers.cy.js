import { EditableFeatureTypes } from '@/api/features/EditableFeature.class'
import { WEBMERCATOR } from '@/utils/coordinates/coordinateSystems'

describe('Test of layer handling in 3D', () => {
    const visibleLayerIds = [
        'test.wms.layer',
        'test.wmts.layer',
        'test.timeenabled.wmts.layer',
        'test.geojson.layer',
    ]

    it('add layer from search bar', () => {
        const expectedLayerId = visibleLayerIds[1]
        cy.intercept(`**/1.0.0/${expectedLayerId}/default/**`, {
            statusCode: 200,
        }).as('get-wmts-layer')
        cy.mockupBackendResponse(
            '**rest/services/ech/SearchServer*?type=layers*',
            {
                results: [
                    {
                        id: 4321,
                        weight: 1,
                        attrs: {
                            label: '<b>Test layer</b>',
                            layer: expectedLayerId,
                        },
                    },
                ],
            },
            'search-layers'
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
        cy.get('[data-cy="searchbar"]').paste('test')
        cy.wait(['@search-locations', '@search-layers'])
        cy.get('[data-cy="search-result-entry-layer"]').first().click()
        cy.get('[data-cy="menu-button"]').click()
        cy.readWindowValue('cesiumViewer').then((viewer) => {
            const layers = viewer.scene.imageryLayers
            expect(layers.length).to.eq(
                2,
                'There should be the background layer + the layer added through the search'
            )
            expect(layers.get(1).show).to.eq(true)
            expect(layers.get(1).imageryProvider.url).to.have.string(
                `1.0.0/${expectedLayerId}/default/current/3857/{z}/{x}/{y}.png`
            )
        })
    })
    it('sets the opacity to the value defined in the layers URL param', () => {
        cy.goToMapView({
            '3d': true,
            layers: `${visibleLayerIds[0]},,0.5`,
        })
        cy.waitUntilCesiumTilesLoaded()
        cy.readWindowValue('cesiumViewer').then((viewer) => {
            const layers = viewer.scene.imageryLayers
            expect(layers.get(1).alpha).to.eq(0.5)
        })
    })
    it('sets the timestamp of a layer when specified in the layers URL param', () => {
        const timeEnabledLayerId = visibleLayerIds[2]
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
        const [firstLayerId, secondLayerId] = visibleLayerIds
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
        cy.get(`[data-cy="button-raise-order-layer-${firstLayerId}"]`).should('be.visible').click()
        // checking that the order has changed
        cy.readWindowValue('cesiumViewer').then((viewer) => {
            expect(viewer.scene.imageryLayers.get(1).imageryProvider.url).to.have.string(
                `1.0.0/${secondLayerId}/default/current/3857/{z}/{x}/{y}.png`
            )
            expect(viewer.scene.imageryLayers.get(2).imageryProvider.layers).to.eq(firstLayerId)
        })
        // using the other button
        cy.get(`[data-cy="button-lower-order-layer-${firstLayerId}"]`).should('be.visible').click()
        // re-checking the order that should be back to the starting values
        cy.readWindowValue('cesiumViewer').then((viewer) => {
            expect(viewer.scene.imageryLayers.get(1).imageryProvider.layers).to.eq(firstLayerId)
            expect(viewer.scene.imageryLayers.get(2).imageryProvider.url).to.have.string(
                `1.0.0/${secondLayerId}/default/current/3857/{z}/{x}/{y}.png`
            )
        })
    })
    it('add GeoJson layer with opacity from URL param', () => {
        cy.goToMapView({
            '3d': true,
            layers: `${visibleLayerIds[3]},,0.5`,
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
        cy.goToMapView({
            '3d': true,
            layers: `${visibleLayerIds[3]}`,
        })
        cy.waitUntilCesiumTilesLoaded()
        cy.wait(['@geojson-data', '@geojson-style'])
        cy.readWindowValue('cesiumViewer').then((viewer) => {
            expect(viewer.scene.primitives.length).to.eq(4) // labels + buildings + constructions + GeoJSON layer
        })
        cy.openMenuIfMobile()
        cy.get(`[data-cy="button-remove-layer-${visibleLayerIds[3]}"]`).should('be.visible').click()
        cy.readWindowValue('cesiumViewer').then((viewer) => {
            expect(viewer.scene.primitives.length).to.eq(3) // labels, constructions and buildings are still present
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
