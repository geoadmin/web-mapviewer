/// <reference types="cypress" />

import { randomIntBetween } from '../../../src/utils/numberUtils'

describe('Test of layer handling', () => {
    /**
     * Returns a timestamp from the layer's config that is different from the default behaviour
     *
     * @param {Object} layer A layer's metadata, that usually come from the fixture layers.fixture.json
     * @returns {String} One of the layer's timestamp, different from the default one (not equal to
     *   `timeBehaviour`)
     */
    const getRandomTimestampFromSeries = (layer) => {
        expect(layer).to.be.an('Object')
        expect(layer).to.haveOwnProperty('timeBehaviour')
        expect(layer).to.haveOwnProperty('timestamps')
        expect(layer.timestamps).to.be.an('Array')
        expect(layer.timestamps.length).to.be.greaterThan(1)
        const defaultTimestamp = layer.timeBehaviour
        let randomTimestampFromLayer = defaultTimestamp
        do {
            randomTimestampFromLayer =
                layer.timestamps[randomIntBetween(0, layer.timestamps.length - 1)]
        } while (randomTimestampFromLayer === defaultTimestamp)
        return randomTimestampFromLayer
    }

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
                expect(layers[0].getID()).to.eq('test.wms.layer')
                expect(layers[1]).to.be.an('Object')
                expect(layers[1].getID()).to.eq('test.wmts.layer')
            })
        })
        it('adds a layer to active layers without showing it if the URL sets visibility to false', () => {
            cy.goToMapView('en', {
                layers: 'test.wms.layer,f;test.wmts.layer',
            })
            cy.readStoreValue('getters.visibleLayers').then((layers) => {
                expect(layers).to.be.an('Array').length(1)
                const [wmtsLayer] = layers
                expect(wmtsLayer).to.be.an('Object')
                expect(wmtsLayer.getID()).to.eq('test.wmts.layer')
            })
            cy.readStoreValue('state.layers.activeLayers').then((layers) => {
                expect(layers).to.be.an('Array').length(2)
                const [wmsLayer, wmtsLayer] = layers
                expect(wmsLayer).to.be.an('Object')
                expect(wmsLayer.getID()).to.eq('test.wms.layer')
                expect(wmtsLayer).to.be.an('Object')
                expect(wmtsLayer.getID()).to.eq('test.wmts.layer')
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
        it('uses the default timestamp of a time enabled layer when not specified in the URL', () => {
            const timeEnabledLayerId = 'test.timeenabled.wmts.layer'
            cy.goToMapView('en', {
                layers: timeEnabledLayerId,
            })
            cy.readStoreValue('getters.visibleLayers').then((layers) => {
                const [timeEnabledLayer] = layers
                cy.fixture('layers.fixture.json').then((layersMetadata) => {
                    const timeEnabledLayerMetadata = layersMetadata[timeEnabledLayerId]
                    expect(timeEnabledLayer.timeConfig.currentTimestamp).to.eq(
                        timeEnabledLayerMetadata.timeBehaviour
                    )
                })
            })
        })
        it('sets the timestamp of a layer when specified in the layers URL param', () => {
            const timeEnabledLayerId = 'test.timeenabled.wmts.layer'
            cy.fixture('layers.fixture.json').then((layersMetadata) => {
                const timedLayerMetadata = layersMetadata[timeEnabledLayerId]
                const randomTimestampFromLayer = getRandomTimestampFromSeries(timedLayerMetadata)
                cy.goToMapView('en', {
                    layers: `${timeEnabledLayerId}@time=${randomTimestampFromLayer}`,
                })
                cy.readStoreValue('getters.visibleLayers').then((layers) => {
                    const [timeEnabledLayer] = layers
                    expect(timeEnabledLayer.timeConfig.currentTimestamp).to.eq(
                        randomTimestampFromLayer
                    )
                })
            })
        })
    })
    context('Layer settings in menu', () => {
        const visibleLayerIds = ['test.wms.layer', 'test.wmts.layer', 'test.timeenabled.wmts.layer']
        beforeEach(() => {
            cy.goToMapView('en', {
                layers: visibleLayerIds.join(';'),
            })
            // clicking on the menu button
            cy.get('[data-cy="menu-button"]').click()
        })
        const openLayerSettings = (layerId) => {
            cy.get(`[data-cy="div-layer-settings-${layerId}"]`).should('be.hidden')
            cy.get(`[data-cy="button-open-visible-layer-settings-${layerId}"]`)
                .should('be.visible')
                .click()
            cy.get(`[data-cy="div-layer-settings-${layerId}"]`).should('be.visible')
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
                expect(visibleLayers.length).to.eq(visibleLayerIds.length - 1)
                expect(visibleLayers[0].getID()).to.eq(visibleLayerIds[1])
            })
        })
        it('changes the opacity of the layer when the slider for this property is used', () => {
            // using the second layer for this test
            const layerId = visibleLayerIds[1]
            openLayerSettings(layerId)
            // getting current layer opacity
            let initialOpacity = 1.0
            cy.readStoreValue('getters.visibleLayers', (visibleLayers) => {
                initialOpacity = visibleLayers.find((layer) => layer.getID() === layerId).opacity
            })
            // using the keyboard to change slider's value
            const step = 5
            const repetitions = 6
            const command = '{leftarrow}'.repeat(repetitions)
            cy.get(`[data-cy="slider-opacity-layer-${layerId}"]`).should('be.visible').type(command)
            // checking that the opacity has changed accordingly
            cy.readStoreValue('getters.visibleLayers', (visibleLayers) => {
                const layer = visibleLayers.find((layer) => layer.getID() === layerId)
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
                expect(visibleLayers[0].getID()).to.eq(secondLayerId)
                expect(visibleLayers[1].getID()).to.eq(firstLayerId)
            })
            // using the other button
            cy.get(`[data-cy="button-raise-order-layer-${firstLayerId}"]`)
                .should('be.visible')
                .click()
            // re-checking the order that should be back to the starting values
            cy.readStoreValue('getters.visibleLayers', (visibleLayers) => {
                expect(visibleLayers[0].getID()).to.eq(firstLayerId)
                expect(visibleLayers[1].getID()).to.eq(secondLayerId)
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
        it('shows all possible timestamps in the timestamp popover', () => {
            const timedLayerId = 'test.timeenabled.wmts.layer'
            cy.get(`[data-cy="time-selector-${timedLayerId}"]`).should('be.visible').click()
            cy.get('[data-cy="time-selection-popup"]').should('be.visible')
            cy.fixture('layers.fixture.json').then((layers) => {
                const timedLayerMetadata = layers[timedLayerId]
                const defaultTimestamp = timedLayerMetadata.timeBehaviour
                timedLayerMetadata.timestamps.forEach((timestamp) => {
                    cy.get(`[data-cy="time-select-${timestamp}"]`)
                        .should('be.visible')
                        .then((timestampButton) => {
                            if (timestamp === defaultTimestamp) {
                                expect(timestampButton).to.have.class('btn-danger')
                            }
                        })
                })
            })
        })
        it('changes the timestsamp of a layer when a time button is clicked', () => {
            const timedLayerId = 'test.timeenabled.wmts.layer'
            cy.get(`[data-cy="time-selector-${timedLayerId}"]`).should('be.visible').click()
            cy.fixture('layers.fixture.json').then((layersMetadata) => {
                const timedLayerMetadata = layersMetadata[timedLayerId]
                const randomTimestamp = getRandomTimestampFromSeries(timedLayerMetadata)
                cy.get(`[data-cy="time-select-${randomTimestamp}"]`).click()
                cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
                    expect(activeLayers).to.be.an('Array').length(visibleLayerIds.length)
                    activeLayers.forEach((layer) => {
                        if (layer.getID() === timedLayerId) {
                            expect(layer.timeConfig.currentTimestamp).to.eq(randomTimestamp)
                        }
                    })
                })
            })
        })
        context('Re-ordering of layers', () => {
            const checkOrderButtons = (layerId, raiseShouldBeDisabled, lowerShouldBeDisabled) => {
                cy.get(`[data-cy="button-raise-order-layer-${layerId}"]`)
                    .should('be.visible')
                    .should(`${!raiseShouldBeDisabled ? 'not.' : ''}be.disabled`)
                cy.get(`[data-cy="button-lower-order-layer-${layerId}"]`)
                    .should('be.visible')
                    .should(`${!lowerShouldBeDisabled ? 'not.' : ''}be.disabled`)
            }
            it('Disable the "Raise Order" arrow on the top layer', () => {
                const layerId = visibleLayerIds[0]
                openLayerSettings(layerId)
                checkOrderButtons(layerId, true, false)
            })
            it('Disable the "Lower Order" arrow on the bottom layer', () => {
                const layerId = visibleLayerIds[2]
                openLayerSettings(layerId)
                checkOrderButtons(layerId, false, true)
            })
            it('enables both button for any other layer', () => {
                const layerId = visibleLayerIds[1]
                openLayerSettings(layerId)
                checkOrderButtons(layerId, false, false)
            })
            it('disable the "raise order" arrow on a layer which gets to the top layer', () => {
                const layerId = visibleLayerIds[1]
                openLayerSettings(layerId)
                checkOrderButtons(layerId, false, false)
                cy.get(`[data-cy="button-raise-order-layer-${layerId}"]`).click()
                checkOrderButtons(layerId, true, false)
            })
            it('disable the "lower order" arrow on a layer which gets to the bottom layer', () => {
                const layerId = visibleLayerIds[1]
                openLayerSettings(layerId)
                checkOrderButtons(layerId, false, false)
                cy.get(`[data-cy="button-lower-order-layer-${layerId}"]`).click()
                checkOrderButtons(layerId, false, true)
            })
            it('enable the "lower order" arrow on a layer which is raised from the bottom', () => {
                const layerId = visibleLayerIds[2]
                openLayerSettings(layerId)
                checkOrderButtons(layerId, false, true)
                cy.get(`[data-cy="button-raise-order-layer-${layerId}"]`).click()
                checkOrderButtons(layerId, false, false)
            })
            it('enable the "raise order" arrow on a layer which is lowered from the top', () => {
                const layerId = visibleLayerIds[0]
                openLayerSettings(layerId)
                checkOrderButtons(layerId, true, false)
                cy.get(`[data-cy="button-lower-order-layer-${layerId}"]`).click()
                checkOrderButtons(layerId, false, false)
            })
        })
    })
})
