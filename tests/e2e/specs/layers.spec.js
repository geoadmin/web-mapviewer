describe('Test of layer handling', () => {
    context('Layer in URL at app startup', () => {
        it('starts without any visible layer added opening the app without layers URL param', () => {
            cy.goToMapView()
            cy.readStoreValue('getters.visibleLayers').should('be.empty')
        })
        it('adds a layer to the map when the app is opened through a URL with a layer in it', () => {
            cy.goToMapView('en', {
                layers: 'test.wms.layer;test.wmts.layer',
            })
            cy.readStoreValue('getters.visibleLayers').then((layers) => {
                expect(layers).to.be.an('Array')
                expect(layers.length).to.eq(2)
                expect(layers[0]).to.be.an('Object')
                expect(layers[0].id).to.eq('test.wms.layer')
                expect(layers[1]).to.be.an('Object')
                expect(layers[1].id).to.eq('test.wmts.layer')
            })
        })
        it('adds a layer to active layers without showing it if the URL sets visibility to false', () => {
            cy.goToMapView('en', {
                layers: 'test.wms.layer,f;test.wmts.layer',
            })
            cy.readStoreValue('getters.visibleLayers').then((layers) => {
                expect(layers).to.be.an('Array').length(1)
                const [wmtsLayer] = layers
                expect(wmtsLayer).to.be.an('Object').to.haveOwnProperty('id')
                expect(wmtsLayer.id).to.eq('test.wmts.layer')
            })
            cy.readStoreValue('state.layers.activeLayers').then((layers) => {
                expect(layers).to.be.an('Array').length(2)
                const [wmsLayer, wmtsLayer] = layers
                expect(wmsLayer).to.be.an('Object').to.haveOwnProperty('id')
                expect(wmsLayer.id).to.eq('test.wms.layer')
                expect(wmtsLayer).to.be.an('Object').to.haveOwnProperty('id')
                expect(wmtsLayer.id).to.eq('test.wmts.layer')
            })
        })
        it('sets the opacity to the value defined in the layers URL param', () => {
            cy.goToMapView('en', {
                layers: 'test.wmts.layer,,0.5',
            })
            cy.readStoreValue('getters.visibleLayers').then((layers) => {
                const [wmtsLayer] = layers
                expect(wmtsLayer.opacity).to.eq(0.5)
            })
        })
    })
    context('Layer settings in menu', () => {
        const visibleLayerIds = ['test.wms.layer', 'test.wmts.layer']
        beforeEach(() => {
            cy.goToMapView('en', {
                layers: visibleLayerIds.join(';'),
            })
            // clicking on the menu button
            cy.get('[data-cy="menu-button"]').click()
        })
        const openLayerSettings = (layerId) => {
            cy.get(`[data-cy="button-open-visible-layer-settings-${layerId}"]`)
                .should('be.visible')
                .click()
        }
        it('shows a visible layer in the menu', () => {
            visibleLayerIds.forEach((layerId) => {
                cy.get(`[data-cy="visible-layer-name-${layerId}"]`).should('be.visible')
            })
        })
        it('removes a layer from the visible layers when the "times" button is pressed', () => {
            // using the first layer to test this out
            const layerId = visibleLayerIds[0]
            cy.get(`[data-cy="button-remove-layer-${layerId}"]`).should('be.visible').click()
            cy.readStoreValue('getters.visibleLayers').then((visibleLayers) => {
                expect(visibleLayers).to.be.an('Array')
                expect(visibleLayers.length).to.eq(1)
                expect(visibleLayers[0].id).to.eq(visibleLayerIds[1])
            })
        })
        it('changes the opacity of the layer when the slider for this property is used', () => {
            // using the second layer for this test
            const layerId = visibleLayerIds[1]
            openLayerSettings(layerId)
            // getting current layer opacity
            let initialOpacity = 1.0
            cy.readStoreValue('getters.visibleLayers', (visibleLayers) => {
                initialOpacity = visibleLayers.find((layer) => layer.id === layerId).opacity
            })
            // using the keyboard to change slider's value
            const step = 5
            const repetitions = 6
            const command = '{leftarrow}'.repeat(repetitions)
            cy.get(`[data-cy="slider-opacity-layer-${layerId}"]`).should('be.visible').type(command)
            // checking that the opacity has changed accordingly
            cy.readStoreValue('getters.visibleLayers', (visibleLayers) => {
                const layer = visibleLayers.find((layer) => layer.id === layerId)
                expect(layer.opacity).to.eq(initialOpacity - step * repetitions)
            })
        })
        it('reorders visible layers when corresponding buttons are pressed', () => {
            const [firstLayerId, secondLayerId] = visibleLayerIds
            // lower the order of the first layer
            openLayerSettings(firstLayerId)
            cy.get(`[data-cy="button-lower-order-layer-${firstLayerId}"]`)
                .should('be.visible')
                .click()
            // checking that the order has changed
            cy.readStoreValue('getters.visibleLayers', (visibleLayers) => {
                expect(visibleLayers[0].id).to.eq(secondLayerId)
                expect(visibleLayers[1].id).to.eq(firstLayerId)
            })
            // using the other button
            cy.get(`[data-cy="button-raise-order-layer-${firstLayerId}"]`)
                .should('be.visible')
                .click()
            // re-checking the order that should be back to the starting values
            cy.readStoreValue('getters.visibleLayers', (visibleLayers) => {
                expect(visibleLayers[0].id).to.eq(firstLayerId)
                expect(visibleLayers[1].id).to.eq(secondLayerId)
            })
        })
        it('shows a layer legend when the "i" button is clicked (in layer settings)', () => {
            // using the first layer to test this out
            const layerId = visibleLayerIds[0]
            // mocking up the backend response for the legend
            const fakeHtmlResponse = '<div>Test</div>'
            cy.intercept(`**/rest/services/all/MapServer/${layerId}/legend**`, fakeHtmlResponse).as(
                'legend'
            )
            // opening layer settings
            openLayerSettings(layerId)
            // clicking on the layer info button
            cy.get(`[data-cy="button-show-legend-layer-${layerId}"]`).should('be.visible').click()
            // checking that the backend has been requested for this layer's legend
            cy.wait('@legend')
            // checking that the content of the popup is our mocked up content
            cy.get('[data-cy="layer-legend"]').should('be.visible').contains('Test')
        })
    })
})
