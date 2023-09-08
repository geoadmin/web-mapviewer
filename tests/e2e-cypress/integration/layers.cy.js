/// <reference types="cypress" />

/**
 * This function is used as a parameter to `JSON.stringify` to remove all properties with the name
 * `lang`.
 *
 * @param {String} key The current property name.
 * @param {any} value The current value to stringify.
 * @returns {String} The string representation of the object.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#the_replacer_parameter
 */
const stringifyWithoutLangOrNull = (key, value) =>
    key === 'lang' || value === null ? undefined : value

describe('Test of layer handling', () => {
    const width = Cypress.config('viewportWidth')
    context('Layer in URL at app startup', () => {
        it('starts without any visible layer added opening the app without layers URL param', () => {
            cy.goToMapView()
            cy.readStoreValue('getters.visibleLayers').should('be.empty')
        })
        it('adds a layer to the map when the app is opened through a URL with a layer in it', () => {
            cy.goToMapView({
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
            cy.goToMapView({
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
            cy.goToMapView({
                layers: 'test.wmts.layer,,0.5',
            })
            cy.readStoreValue('getters.visibleLayers').then((layers) => {
                const [wmtsLayer] = layers
                expect(wmtsLayer.opacity).to.eq(0.5)
            })
        })
        it('uses the default timestamp of a time enabled layer when not specified in the URL', () => {
            const timeEnabledLayerId = 'test.timeenabled.wmts.layer'
            cy.goToMapView({
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
                cy.getRandomTimestampFromSeries(timedLayerMetadata).then(
                    (randomTimestampFromLayer) => {
                        cy.goToMapView({
                            layers: `${timeEnabledLayerId}@year=${randomTimestampFromLayer.substring(
                                0,
                                4
                            )}`,
                        })
                        cy.readStoreValue('getters.visibleLayers').then((layers) => {
                            const [timeEnabledLayer] = layers
                            expect(timeEnabledLayer.timeConfig.currentTimestamp).to.eq(
                                randomTimestampFromLayer
                            )
                        })
                    }
                )
            })
        })
        context('External layers', () => {
            it('reads and adds an external WMS correctly', () => {
                const fakeWmsBaseUrl = 'https://fake.wms.base.url'
                const fakeLayerId = 'fake.layer_id'
                const fakeWmsLayerVersion = '9.9.9'
                const fakeLayerName = 'Fake layer name'
                // format is WMS|BASE_URL|LAYER_IDS|WMS_VERSION|LAYER_NAME
                const fakeLayerUrlId = `WMS|${fakeWmsBaseUrl}|${fakeLayerId}|${fakeWmsLayerVersion}|${fakeLayerName}`

                // intercepting call to our fake WMS
                cy.intercept(`${fakeWmsBaseUrl}/**`, {
                    fixture: '256.png',
                }).as('externalWMS')

                cy.goToMapView(
                    {
                        layers: fakeLayerUrlId,
                    },
                    true
                ) // with hash, otherwise the legacy parser kicks in and ruins the day
                cy.wait('@externalWMS')
                cy.readStoreValue('getters.visibleLayers').then((layers) => {
                    expect(layers).to.have.lengthOf(1)
                    const [externalWmsLayer] = layers
                    expect(externalWmsLayer.wmsVersion).to.eq(fakeWmsLayerVersion)
                    expect(externalWmsLayer.name).to.eq(fakeLayerName)
                    expect(externalWmsLayer.externalLayerId).to.eq(fakeLayerId)
                    expect(externalWmsLayer.baseURL).to.eq(fakeWmsBaseUrl)
                    expect(externalWmsLayer.getID()).to.eq(fakeLayerUrlId)
                })
            })
            it('reads and adds an external WMTS correctly', () => {
                const fakeGetCapUrl = 'https://fake.wmts.getcap.url/WMTSGetCapabilities.xml'
                const fakeLayerId = 'fakeLayerId'
                const fakeLayerName = 'Fake layer name'
                // format is WMTS|GET_CAPABILITIES_URL|LAYER_ID|LAYER_NAME
                const fakeLayerUrlId = `WMTS|${fakeGetCapUrl}|${fakeLayerId}|${fakeLayerName}`

                // intercepting call to our fake WMTS
                cy.intercept(`${fakeGetCapUrl}**`, (req) => {
                    // empty XML as response
                    req.reply(
                        '<Capabilities version="1.0.0" xmlns="http://www.opengis.net/wmts/1.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:xlink="http://www.w3.org/1999/xlink"></Capabilities>'
                    )
                }).as('externalGetCap')

                cy.goToMapView(
                    {
                        layers: fakeLayerUrlId,
                    },
                    true
                ) // with hash, otherwise the legacy parser kicks in and ruins the day
                cy.wait('@externalGetCap')
                cy.readStoreValue('getters.visibleLayers').then((layers) => {
                    expect(layers).to.have.lengthOf(1)
                    const [externalWmtsLayer] = layers
                    expect(externalWmtsLayer.getID()).to.eq(fakeLayerUrlId)
                    expect(externalWmtsLayer.name).to.eq(fakeLayerName)
                    expect(externalWmtsLayer.baseURL).to.eq(fakeGetCapUrl)
                    expect(externalWmtsLayer.externalLayerId).to.eq(fakeLayerId)
                })
            })
            it('reads and sets non default layer config; visible and opacity', () => {
                const fakeGetCapUrl = 'https://fake.wmts.getcap.url/WMTSGetCapabilities.xml'
                const fakeLayerId = 'fakeLayerId'
                const fakeLayerName = 'Fake layer name'
                // format is WMTS|GET_CAPABILITIES_URL|LAYER_ID|LAYER_NAME
                const fakeLayerUrlId = `WMTS|${fakeGetCapUrl}|${fakeLayerId}|${fakeLayerName}`

                // intercepting call to our fake WMTS
                cy.intercept(`${fakeGetCapUrl}**`, (req) => {
                    // empty XML as response
                    req.reply(
                        '<Capabilities version="1.0.0" xmlns="http://www.opengis.net/wmts/1.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:xlink="http://www.w3.org/1999/xlink"></Capabilities>'
                    )
                }).as('externalGetCap')

                cy.goToMapView(
                    {
                        layers: `${fakeLayerUrlId},f,0.5`,
                    },
                    true
                ) // with hash, otherwise the legacy parser kicks in and ruins the day
                cy.readStoreValue('getters.visibleLayers').should('be.empty')
                cy.readStoreValue('state.layers.activeLayers').then((layers) => {
                    expect(layers).to.be.an('Array').length(1)
                    const [wmtsLayer] = layers
                    expect(wmtsLayer).to.be.an('Object')
                    expect(wmtsLayer.getID()).to.eq(fakeLayerUrlId)
                    expect(wmtsLayer.visible).to.eq(false)
                    expect(wmtsLayer.opacity).to.eq(0.5)
                })
            })
        })
    })
    context('Background layer in URL at app startup', () => {
        it('sets the background to the topic default if none is defined in the URL', () => {
            cy.fixture('topics.fixture').then((topicFixtures) => {
                const [defaultTopic] = topicFixtures.topics
                cy.goToMapView()
                cy.readStoreValue('state.layers.currentBackgroundLayer').then((bgLayer) => {
                    expect(bgLayer).to.not.be.null
                    expect(bgLayer.getID()).to.eq(defaultTopic.defaultBackground)
                })
            })
        })
        it('sets the background to the topic default if none is defined in the URL, even if a layer (out of topic scope) is defined in it', () => {
            cy.fixture('topics.fixture').then((topicFixtures) => {
                const [defaultTopic] = topicFixtures.topics
                cy.goToMapView({
                    layers: 'test.timeenabled.wmts.layer',
                })
                cy.readStoreValue('state.layers.currentBackgroundLayer').then((bgLayer) => {
                    expect(bgLayer).to.not.be.null
                    expect(bgLayer.getID()).to.eq(defaultTopic.defaultBackground)
                })
                cy.readStoreValue('getters.visibleLayers').then((layers) => {
                    expect(layers).to.be.an('Array')
                    expect(layers.length).to.eq(1)
                    expect(layers[0]).to.be.an('Object')
                    expect(layers[0].getID()).to.eq('test.timeenabled.wmts.layer')
                })
            })
        })
        it('sets the background according to the URL param if present at startup', () => {
            cy.goToMapView({
                bgLayer: 'test.background.layer2',
            })
            cy.readStoreValue('state.layers.currentBackgroundLayer').then((bgLayer) => {
                expect(bgLayer).to.not.be.null
                expect(bgLayer.getID()).to.eq('test.background.layer2')
            })
        })
    })
    context('Layer settings in menu', () => {
        const visibleLayerIds = ['test.wms.layer', 'test.wmts.layer', 'test.timeenabled.wmts.layer']
        const goToMenuWithLayers = (layerIds = visibleLayerIds) => {
            cy.goToMapView(
                {
                    layers: layerIds.join(';'),
                },
                true
            ) // with hash, so that we can have external layer support
            cy.clickOnMenuButtonIfMobile()
        }
        context('Adding/removing layers', () => {
            it('shows active layers in the menu', () => {
                goToMenuWithLayers()
                visibleLayerIds.forEach((layerId) => {
                    cy.get(`[data-cy="active-layer-name${layerId}"]`).should('be.visible')
                })
            })
            it('removes a layer from the visible layers when the "remove" button is pressed', () => {
                goToMenuWithLayers()
                // using the first layer to test this out
                const layerId = visibleLayerIds[0]
                cy.get(`[data-cy="button-remove-layer-${layerId}"]`).should('be.visible').click()
                cy.readStoreValue('getters.visibleLayers').then((visibleLayers) => {
                    expect(visibleLayers).to.be.an('Array')
                    expect(visibleLayers.length).to.eq(visibleLayerIds.length - 1)
                    expect(visibleLayers[0].getID()).to.eq(visibleLayerIds[1])
                })
                cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
                    expect(activeLayers)
                        .to.be.an('Array')
                        .length(visibleLayerIds.length - 1)
                    activeLayers.forEach((layer) => {
                        expect(layer.getID).to.be.not.equal(layerId)
                    })
                })
            })
            it('shows a hyphen when no layer is selected', () => {
                cy.goToMapView()
                cy.clickOnMenuButtonIfMobile()
                cy.get('[data-cy="menu-active-layers"]').click()
                cy.get('[data-cy="menu-section-no-layers"]').should('be.visible')
            })
            it('shows no hyphen when a layer is selected', () => {
                const visibleLayerIds = [
                    'test.wms.layer',
                    'test.wmts.layer',
                    'test.timeenabled.wmts.layer',
                ]
                cy.goToMapView({
                    layers: visibleLayerIds.join(';'),
                })
                cy.clickOnMenuButtonIfMobile()
                cy.get('[data-cy="menu-active-layers"]').click()
                cy.get('[data-cy="menu-section-no-layers"]').should('be.hidden')
            })
            it('add layer from topic (should be visible)', () => {
                cy.goToMapView()
                cy.clickOnMenuButtonIfMobile()
                const testLayerId = 'test.wmts.layer'
                const testLayerSelector = `[data-cy="topic-tree-item-${testLayerId}"]`
                cy.get('[data-cy="menu-topic-section"]').click()
                // opening up layer parents in the topic tree
                cy.get('[data-cy="topic-tree-item-2"]').click()
                cy.get('[data-cy="topic-tree-item-3"]').click()
                // Find the test layer and open the appropriate menu entries.
                cy.get(testLayerSelector)
                    .parentsUntil('[data-cy="menu-topic-section"]')
                    .filter('[data-cy="topic-tree-item"]')
                    .then((menuItems) => {
                        menuItems
                            .toArray()
                            // The first match is the layer itself which we'll handle separately.
                            .slice(1)
                            // We need to reverse the menu items as we started at the layer.
                            .reverse()
                            .forEach((menuItem) => cy.wrap(menuItem).click())
                    })
                // Add the test layer.
                cy.get(testLayerSelector).click().trigger('mouseleave')
                cy.readStoreValue('getters.visibleLayers').then((visibleLayers) => {
                    expect(visibleLayers).to.be.an('Array').length(1)
                    expect(visibleLayers[0].getID(), testLayerId)
                })
            })
            it('add layer from search bar', () => {
                const expectedLayerId = 'test.wmts.layer'
                cy.intercept(`/1.0.0/${expectedLayerId}/default/**`, {
                    statusCode: 200,
                }).as('get-wmts-layer')
                cy.mockupBackendResponse(
                    'rest/services/ech/SearchServer*?type=layers*',
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
                    'rest/services/ech/SearchServer*?type=locations*',
                    { results: [] },
                    'search-locations'
                )
                cy.goToMapView()
                cy.clickOnMenuButtonIfMobile()
                cy.readStoreValue('getters.visibleLayers').should('be.empty')
                cy.get('[data-cy="searchbar"]').paste('test')
                cy.wait(['@search-locations', '@search-layers'])
                cy.get('[data-cy="search-result-entry-layer"]').first().click()
                cy.get('[data-cy="menu-button"]').click()
                cy.readStoreValue('getters.visibleLayers').then((visibleLayers) => {
                    expect(visibleLayers).to.be.an('Array').length(1)
                    expect(visibleLayers[0].getID(), expectedLayerId)
                })
            })
        })
        context('Toggling layers visibility', () => {
            beforeEach(() => {
                goToMenuWithLayers()
            })
            it('allows toggling layers visibility from the topic menu', () => {
                const testLayerId = 'test.wmts.layer'
                const testLayerSelector = `[data-cy="topic-tree-item-${testLayerId}"]`
                cy.get('[data-cy="menu-topic-section"]').click()
                // opening up layer parents in the topic tree
                cy.get('[data-cy="topic-tree-item-2"]').click()
                cy.get('[data-cy="topic-tree-item-3"]').click()
                // Find the test layer and open the appropriate menu entries.
                cy.get(testLayerSelector)
                    .parentsUntil('[data-cy="menu-topic-section"]')
                    .filter('[data-cy="topic-tree-item"]')
                    .then((menuItems) => {
                        menuItems
                            .toArray()
                            // The first match is the layer itself which we'll handle separately.
                            .slice(1)
                            // We need to reverse the menu items as we started at the layer.
                            .reverse()
                            .forEach((menuItem) => cy.wrap(menuItem).click())
                    })
                // Toggle (hide) the test layer.
                cy.get(testLayerSelector).click().trigger('mouseleave')
                cy.readStoreValue('getters.visibleLayers').then((visibleLayers) => {
                    const visibleIds = visibleLayers.map((layer) => layer.getID())
                    expect(visibleIds).to.not.contain(testLayerId)
                })
                // Toggle (show) the test layer.
                cy.get(testLayerSelector).click().trigger('mouseleave')
                cy.readStoreValue('getters.visibleLayers').then((visibleLayers) => {
                    const visibleIds = visibleLayers.map((layer) => layer.getID())
                    expect(visibleIds).to.contain(testLayerId)
                })
            })
        })
        context('Layer settings (cog button)', () => {
            beforeEach(() => {
                goToMenuWithLayers()
            })
            it('changes the opacity of the layer when the slider for this property is used', () => {
                // using the second layer for this test
                const layerId = visibleLayerIds[1]
                cy.openLayerSettings(layerId)
                // getting current layer opacity
                let initialOpacity = 1.0
                cy.readStoreValue('getters.visibleLayers', (visibleLayers) => {
                    initialOpacity = visibleLayers.find(
                        (layer) => layer.getID() === layerId
                    ).opacity
                })
                // using the keyboard to change slider's value
                const step = 5
                const repetitions = 6
                const command = '{leftarrow}'.repeat(repetitions)
                cy.get(`[data-cy="slider-opacity-layer-${layerId}"]`)
                    .should('be.visible')
                    .type(command)
                // checking that the opacity has changed accordingly
                cy.readStoreValue('getters.visibleLayers', (visibleLayers) => {
                    const layer = visibleLayers.find((layer) => layer.getID() === layerId)
                    expect(layer.opacity).to.eq(initialOpacity - step * repetitions)
                })
            })
            it('reorders visible layers when corresponding buttons are pressed', () => {
                const [firstLayerId, secondLayerId] = visibleLayerIds
                // lower the order of the first layer
                cy.openLayerSettings(firstLayerId)
                cy.get(`[data-cy="button-raise-order-layer-${firstLayerId}"]`)
                    .should('be.visible')
                    .click()
                // checking that the order has changed
                cy.readStoreValue('getters.visibleLayers', (visibleLayers) => {
                    expect(visibleLayers[0].getID()).to.eq(secondLayerId)
                    expect(visibleLayers[1].getID()).to.eq(firstLayerId)
                })
                // using the other button
                cy.get(`[data-cy="button-lower-order-layer-${firstLayerId}"]`)
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
                cy.intercept(
                    `**/rest/services/all/MapServer/${layerId}/legend**`,
                    fakeHtmlResponse
                ).as('legend')
                // opening layer settings
                cy.openLayerSettings(layerId)
                // clicking on the layer info button
                cy.get(`[data-cy="button-show-legend-layer-${layerId}"]`)
                    .should('be.visible')
                    .click()
                // checking that the backend has been requested for this layer's legend
                cy.wait('@legend')
                // checking that the content of the popup is our mocked up content
                cy.get('[data-cy="layer-legend"]').should('be.visible').contains('Test')
            })
        })
        context('Timestamp management', () => {
            beforeEach(() => {
                goToMenuWithLayers()
            })
            it('shows all possible timestamps in the timestamp popover', () => {
                const timedLayerId = 'test.timeenabled.wmts.layer'
                cy.get(`[data-cy="time-selector-${timedLayerId}"]`).should('be.visible').click()
                cy.get('[data-cy="time-selection-popup"]').should('be.visible')
                cy.fixture('layers.fixture.json').then((layers) => {
                    const timedLayerMetadata = layers[timedLayerId]
                    const defaultTimestamp = timedLayerMetadata.timeBehaviour
                    timedLayerMetadata.timestamps.forEach((timestamp) => {
                        cy.get(`[data-cy="time-select-${timestamp}"]`).then((timestampButton) => {
                            if (timestamp === defaultTimestamp) {
                                expect(timestampButton).to.have.class('btn-primary')
                            }
                        })
                    })
                })
            })
            it('changes the timestamp of a layer when a time button is clicked', () => {
                const timedLayerId = 'test.timeenabled.wmts.layer'
                cy.get(`[data-cy="time-selector-${timedLayerId}"]`).should('be.visible').click()
                cy.fixture('layers.fixture.json').then((layersMetadata) => {
                    const timedLayerMetadata = layersMetadata[timedLayerId]
                    cy.getRandomTimestampFromSeries(timedLayerMetadata).then((randomTimestamp) => {
                        // "force" is needed, as else there is a false positive "button hidden"
                        cy.get(`[data-cy="time-select-${randomTimestamp}"]`).click({ force: true })
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
            })
        })
        context('Re-ordering of layers', () => {
            beforeEach(() => {
                goToMenuWithLayers()
            })
            const checkOrderButtons = (layerId, lowerShouldBeDisabled, raiseShouldBeDisabled) => {
                cy.get(`[data-cy="button-lower-order-layer-${layerId}"]`)
                    .should('be.visible')
                    .should(`${!lowerShouldBeDisabled ? 'not.' : ''}be.disabled`)
                cy.get(`[data-cy="button-raise-order-layer-${layerId}"]`)
                    .should('be.visible')
                    .should(`${!raiseShouldBeDisabled ? 'not.' : ''}be.disabled`)
            }
            it('Disable the "move front" arrow on the top layer', () => {
                const layerId = visibleLayerIds[0]
                cy.openLayerSettings(layerId)
                checkOrderButtons(layerId, true, false)
            })
            it('Disable the "move back" arrow on the bottom layer', () => {
                const layerId = visibleLayerIds[2]
                cy.openLayerSettings(layerId)
                checkOrderButtons(layerId, false, true)
            })
            it('enables both button for any other layer', () => {
                const layerId = visibleLayerIds[1]
                cy.openLayerSettings(layerId)
                checkOrderButtons(layerId, false, false)
            })
            it('disable the "move front" arrow on a layer which gets to the top layer', () => {
                const layerId = visibleLayerIds[1]
                cy.openLayerSettings(layerId)
                checkOrderButtons(layerId, false, false)
                cy.get(`[data-cy="button-lower-order-layer-${layerId}"]`).click()
                checkOrderButtons(layerId, true, false)
            })
            it('disable the "move back" arrow on a layer which gets to the bottom layer', () => {
                const layerId = visibleLayerIds[1]
                cy.openLayerSettings(layerId)
                checkOrderButtons(layerId, false, false)
                cy.get(`[data-cy="button-raise-order-layer-${layerId}"]`).click()
                checkOrderButtons(layerId, false, true)
            })
            it('enable the "move back" arrow on a layer which is raised from the bottom', () => {
                const layerId = visibleLayerIds[2]
                cy.openLayerSettings(layerId)
                checkOrderButtons(layerId, false, true)
                cy.get(`[data-cy="button-lower-order-layer-${layerId}"]`).click()
                checkOrderButtons(layerId, false, false)
            })
            it('enable the "move front" arrow on a layer which is lowered from the top', () => {
                const layerId = visibleLayerIds[0]
                cy.openLayerSettings(layerId)
                checkOrderButtons(layerId, true, false)
                cy.get(`[data-cy="button-raise-order-layer-${layerId}"]`).click()
                checkOrderButtons(layerId, false, false)
            })
        })
        context('External layers', () => {
            it('does not show a red icon for internal layers', () => {
                goToMenuWithLayers()
                visibleLayerIds.forEach((id) => {
                    cy.get(`[data-cy="menu-active-layer-${id}"]`)
                        .get('[data-cy="menu-external-disclaimer-icon"]')
                        .should('not.exist')
                })
            })
            it('shows a red icon to signify a layer is from an external source', () => {
                const fakeExternalServerUrl = 'https://fake.wms.url'
                const layerId = `WMS|${fakeExternalServerUrl}|fake.wms.layerid|1.3.0|${'Fake layer name'}`
                cy.intercept(`${fakeExternalServerUrl}**`, {
                    fixture: '256.png',
                })
                goToMenuWithLayers([...visibleLayerIds, layerId])
                cy.get(`[data-cy="menu-active-layer-${layerId}"]`)
                    .get('[data-cy="menu-external-disclaimer-icon"]')
                    .should('be.visible')
            })
        })
    })
    context('Language settings in menu', () => {
        it('keeps the layer settings when changing language', () => {
            const langBefore = 'en'
            const langAfter = 'de'
            const visibleLayerIds = [
                'test.wms.layer',
                'test.wmts.layer',
                'test.timeenabled.wmts.layer',
            ]
            let activeLayersConfigBefore

            cy.goToMapView({
                lang: langBefore,
                layers: visibleLayerIds.map((layer) => `${layer},f,0.1`).join(';'),
            })

            // Wait until the active layers are ready.
            cy.waitUntilState((state) => {
                return state.layers.activeLayers.some((layer) => layer.lang === langBefore)
            })

            // CHECK before
            cy.readStoreValue('state').then((state) => {
                // Check the language before the switch.
                expect(state.i18n.lang).to.eq(langBefore)
                state.layers.activeLayers
                    .filter((layer) => 'lang' in layer)
                    .forEach((layer) => expect(layer.lang).to.eq(langBefore))
                // Save the layer configuration before the switch.
                activeLayersConfigBefore = JSON.stringify(
                    state.layers.activeLayers,
                    stringifyWithoutLangOrNull
                )
            })

            // Open the menu and change the language.
            cy.clickOnMenuButtonIfMobile()
            cy.clickOnLanguage(langAfter)

            // Wait until the active layers are updated.
            cy.waitUntilState((state) => {
                return state.layers.activeLayers.some((layer) => layer.lang === langAfter)
            })

            // CHECK after
            cy.readStoreValue('state').then((state) => {
                // Check the language after the switch.
                expect(state.i18n.lang).to.eq(langAfter)
                state.layers.activeLayers
                    .filter((layer) => 'lang' in layer)
                    .forEach((layer) => expect(layer.lang).to.eq(langAfter))
                // Compare the layer configuration (except the language)
                const activeLayersConfigAfter = JSON.stringify(
                    state.layers.activeLayers,
                    stringifyWithoutLangOrNull
                )
                expect(activeLayersConfigAfter).to.eq(activeLayersConfigBefore)
            })
        })
    })
    context('Copyrights/attributions of layers', () => {
        it('hides the copyrights zone when no layer is visible', () => {
            cy.goToMapView({
                bgLayer: 'void',
            })
            cy.get('[data-cy="layers-copyrights"] a').should('not.exist')
        })
        it('shows the copyright as a link when an attribution URL is available', () => {
            cy.fixture('layers.fixture').then((fakeLayers) => {
                const layerWithAttributionUrl = fakeLayers['test.wmts.layer']
                cy.goToMapView({
                    layers: layerWithAttributionUrl.serverLayerName,
                })
                cy.get(`a[data-cy="layer-copyright-${layerWithAttributionUrl.attribution}"]`)
                    .should('be.visible')
                    .should('contain', layerWithAttributionUrl.attribution)
                    .should('have.attr', 'href', layerWithAttributionUrl.attributionUrl)
            })
        })
        it('shows a simple text with data owner name when no attribution URL is available', () => {
            cy.fixture('layers.fixture').then((fakeLayers) => {
                const layerWithoutAttributionUrl = fakeLayers['test.wms.layer']
                cy.goToMapView({
                    layers: layerWithoutAttributionUrl.serverLayerName,
                })
                cy.get(`span[data-cy="layer-copyright-${layerWithoutAttributionUrl.attribution}"]`)
                    .should('be.visible')
                    .should('contain', layerWithoutAttributionUrl.attribution)
            })
        })
        it('renders a simple text when the attribution URL is a malformed', () => {
            cy.fixture('layers.fixture').then((fakeLayers) => {
                const layerWithMalformedAttributionUrl = fakeLayers['test.timeenabled.wmts.layer']
                cy.goToMapView({
                    layers: layerWithMalformedAttributionUrl.serverLayerName,
                })
                cy.get(
                    `span[data-cy="layer-copyright-${layerWithMalformedAttributionUrl.attribution}"]`
                )
                    .should('be.visible')
                    .should('contain', layerWithMalformedAttributionUrl.attribution)
            })
        })
        it('only show once each data owner (attribution) even when multiple layers with the same are shown', () => {
            cy.goToMapView({
                bgLayer: 'test.background.layer2',
                layers: 'test.wmts.layer',
            })
            cy.get('[data-cy="layers-copyrights"]').should('have.length', 1)
        })
    })
})
