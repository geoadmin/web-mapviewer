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
    context('Layer in URL at app startup', () => {
        it('starts without any visible layer added opening the app without layers URL param', () => {
            cy.goToMapView()
            cy.readStoreValue('getters.visibleLayers').should('be.empty')
        })
        it('adds a layers with config to the map when opening the app layers URL param', () => {
            cy.goToMapView({
                layers: [
                    'test-1.wms.layer',
                    'test-2.wms.layer,,',
                    'test-3.wms.layer,f',
                    'test-4.wms.layer,,0.4',
                    'test.wmts.layer,f,0.5',
                ].join(';'),
            })
            cy.readStoreValue('getters.visibleLayers').then((layers) => {
                expect(layers).to.be.an('Array').length(3)
                expect(layers[0].getID()).to.eq('test-1.wms.layer')
                expect(layers[1].getID()).to.eq('test-2.wms.layer')
                expect(layers[2].getID()).to.eq('test-4.wms.layer')
                expect(layers[2].opacity).to.eq(0.4)
            })
            cy.readStoreValue('state.layers.activeLayers').then((layers) => {
                expect(layers).to.be.an('Array').length(5)
                expect(layers[0].getID()).to.eq('test-1.wms.layer')
                expect(layers[1].getID()).to.eq('test-2.wms.layer')
                expect(layers[2].getID()).to.eq('test-3.wms.layer')
                expect(layers[3].getID()).to.eq('test-4.wms.layer')
                expect(layers[3].opacity).to.eq(0.4)
                expect(layers[4].getID()).to.eq('test.wmts.layer')
                expect(layers[4].opacity).to.eq(0.5)
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
                const fakeWmsBaseUrl = 'https://fake.wms.base.url/?'
                const fakeLayerId = 'ch.swisstopo-vd.official-survey'
                // format is WMS|BASE_URL|LAYER_IDS
                const fakeLayerUrlId = `WMS|${fakeWmsBaseUrl}|${fakeLayerId}`

                // intercepting call to our fake WMS
                cy.intercept(
                    { url: `${fakeWmsBaseUrl}**`, query: { REQUEST: 'GetMap' } },
                    {
                        fixture: '256.png',
                    }
                ).as('externalWMSGetMap')
                cy.intercept(
                    { url: `${fakeWmsBaseUrl}**`, query: { REQUEST: 'GetCapabilities' } },
                    { fixture: 'external-wms-getcap.fixture.xml' }
                ).as('externalWMSGetCap')

                cy.goToMapView(
                    {
                        layers: fakeLayerUrlId,
                    },
                    true
                ) // with hash, otherwise the legacy parser kicks in and ruins the day
                cy.wait('@externalWMSGetMap')
                cy.wait('@externalWMSGetCap')
                cy.readStoreValue('getters.visibleLayers').then((layers) => {
                    expect(layers).to.have.lengthOf(1)
                    const [externalWmsLayer] = layers
                    expect(externalWmsLayer.wmsVersion).to.eq('1.3.0')
                    expect(externalWmsLayer.externalLayerId).to.eq(fakeLayerId)
                    expect(externalWmsLayer.baseURL).to.eq(fakeWmsBaseUrl)
                    expect(externalWmsLayer.getID()).to.eq(fakeLayerUrlId)
                    expect(externalWmsLayer.name).to.eq('OpenData-AV')
                    expect(externalWmsLayer.isLoading).to.be.false
                })

                // shows a red icon to signify a layer is from an external source
                cy.clickOnMenuButtonIfMobile()
                cy.get(`[data-cy="menu-active-layer-${fakeLayerUrlId}"]`)
                    .get('[data-cy="menu-external-disclaimer-icon"]')
                    .should('be.visible')

                cy.checkOlLayer(fakeLayerId)
            })
            it('reads and adds an external WMTS correctly', () => {
                const fakeGetCapUrl = 'https://fake.wmts.getcap.url/WMTSGetCapabilities.xml'
                const fakeLayerId = 'TestExternalWMTS'
                // format is WMTS|GET_CAPABILITIES_URL|LAYER_ID
                const fakeLayerUrlId = `WMTS|${fakeGetCapUrl}|${fakeLayerId}`

                // intercepting call to our fake WMTS
                cy.intercept(`${fakeGetCapUrl}**`, {
                    fixture: 'external-wmts-getcap.fixture.xml',
                }).as('externalWMTSGetCap')
                cy.intercept(
                    'http://test.wmts.png/wmts/1.0.0/TestExternalWMTS/default/ktzh/**/*/*.png',
                    {
                        fixture: '256.png',
                    }
                ).as('externalWMTS')

                cy.goToMapView({
                    layers: fakeLayerUrlId,
                })
                cy.wait('@externalWMTSGetCap')
                cy.readStoreValue('getters.visibleLayers').then((layers) => {
                    expect(layers).to.have.lengthOf(1)
                    const [externalWmtsLayer] = layers
                    expect(externalWmtsLayer.getID()).to.eq(fakeLayerUrlId)
                    expect(externalWmtsLayer.baseURL).to.eq(fakeGetCapUrl)
                    expect(externalWmtsLayer.externalLayerId).to.eq(fakeLayerId)
                    expect(externalWmtsLayer.name).to.eq('Test External WMTS')
                    expect(externalWmtsLayer.isLoading).to.be.false
                })
                cy.checkOlLayer(fakeLayerId)

                // reads and sets non default layer config; visible and opacity
                cy.goToMapView({
                    layers: `${fakeLayerUrlId},f,0.5`,
                })
                // TODO due to a non ideal startup procedure the GetCapabilities is called 3 times
                // therefore we need to wait for all three otherwise the later wait will not be
                // sufficient for the last test.
                cy.wait(Array(3).fill('@externalWMTSGetCap'))
                cy.readStoreValue('getters.visibleLayers').should('be.empty')
                cy.readStoreValue('state.layers.activeLayers').then((layers) => {
                    expect(layers).to.be.an('Array').length(1)
                    const [externalWmtsLayer] = layers
                    expect(externalWmtsLayer).to.be.an('Object')
                    expect(externalWmtsLayer.getID()).to.eq(fakeLayerUrlId)
                    expect(externalWmtsLayer.visible).to.eq(false)
                    expect(externalWmtsLayer.opacity).to.eq(0.5)
                    expect(externalWmtsLayer.isLoading).to.be.false
                })

                // shows a red icon to signify a layer is from an external source
                cy.clickOnMenuButtonIfMobile()
                cy.get(`[data-cy="menu-active-layer-${fakeLayerUrlId}"]`)
                    .get('[data-cy="menu-external-disclaimer-icon"]')
                    .should('be.visible')

                cy.checkOlLayer({ id: fakeLayerId, visible: false })
            })
            it('handles errors correctly', () => {
                const wmtsUnreachableUrl =
                    'https://fake.unreachable.getcap.url/WMTSGetCapabilities.xml'
                const wmtsUnreachableLayerId = 'WMTSUnreachableURL'
                // format is WMTS|GET_CAPABILITIES_URL|LAYER_ID
                const wmtsUnreachableUrlId = `WMTS|${wmtsUnreachableUrl}|${wmtsUnreachableLayerId}`

                const wmtsInvalidContentUrl =
                    'https://fake.invalid.content.getcap.url/WMTSGetCapabilities.xml'
                const wmtsInvalidContentLayerId = 'WMTSInvalidContent'
                // format is WMTS|GET_CAPABILITIES_URL|LAYER_ID
                const wmtsInvalidContentUrlId = `WMTS|${wmtsInvalidContentUrl}|${wmtsInvalidContentLayerId}`

                const wmsUnreachableUrl = 'https://fake.unreachable.getcap.url/WMS'
                const wmsUnreachableLayerId = 'WMSUnreachableURL'
                // format is WMS|GET_CAPABILITIES_URL|LAYER_ID
                const wmsUnreachableUrlId = `WMS|${wmsUnreachableUrl}|${wmsUnreachableLayerId}`

                const wmsInvalidContentUrl = 'https://fake.invalid.content.getcap.url/WMS'
                const wmsInvalidContentLayerId = 'WMSInvalidContent'
                // format is WMS|GET_CAPABILITIES_URL|LAYER_ID
                const wmsInvalidContentUrlId = `WMS|${wmsInvalidContentUrl}|${wmsInvalidContentLayerId}`

                // intercepting call to our fake WMTS
                cy.intercept(`${wmtsUnreachableUrl}**`, {
                    forceNetworkError: true,
                }).as('external-wmts-unreachable')

                cy.intercept(`${wmtsInvalidContentUrl}**`, {
                    body: 'Invalid body',
                }).as('external-wmts-invalid')

                cy.intercept(`${wmsUnreachableUrl}**`, {
                    forceNetworkError: true,
                }).as('external-wms-unreachable')

                cy.intercept(`${wmsInvalidContentUrl}**`, {
                    body: 'Invalid body',
                }).as('external-wms-invalid')

                cy.goToMapView(
                    {
                        layers: [
                            wmtsUnreachableUrlId,
                            wmtsInvalidContentUrlId,
                            wmsUnreachableUrlId,
                            wmsInvalidContentUrlId,
                        ].join(';'),
                    },
                    true
                ) // with hash, otherwise the legacy parser kicks in and ruins the day
                cy.wait('@external-wmts-unreachable')
                cy.wait('@external-wmts-invalid')
                cy.wait('@external-wms-unreachable')
                cy.wait('@external-wms-invalid')
                cy.clickOnMenuButtonIfMobile()

                //----------------------------------------------------------------------------------
                cy.log('WMTS URL unreachable')
                cy.readStoreValue('getters.visibleLayers').then((layers) => {
                    expect(layers).to.have.lengthOf(4)
                    const externaLayer = layers[0]
                    expect(externaLayer.getID()).to.eq(wmtsUnreachableUrlId)
                    expect(externaLayer.baseURL).to.eq(wmtsUnreachableUrl)
                    expect(externaLayer.externalLayerId).to.eq(wmtsUnreachableLayerId)
                    expect(externaLayer.isLoading).to.be.false
                })
                cy.get(`[data-cy="menu-active-layer-${wmtsUnreachableUrlId}"]`)
                    .get('[data-cy="menu-external-disclaimer-icon"]')
                    .should('be.visible')
                cy.get(`[data-cy="button-error-${wmtsUnreachableUrlId}"]`)
                    .should('be.visible')
                    .get('[data-cy="button-has-error"]')
                    .should('have.class', 'text-danger')
                cy.get(`[data-cy="button-error-${wmtsUnreachableUrlId}"]`).click()
                cy.get('[data-cy^="tippy-button-error-"]')
                    .should('be.visible')
                    .contains('Network error')

                //----------------------------------------------------------------------------------
                cy.log('WMTS URL invalid content')
                cy.readStoreValue('getters.visibleLayers').then((layers) => {
                    expect(layers).to.have.lengthOf(4)
                    const externaLayer = layers[1]
                    expect(externaLayer.getID()).to.eq(wmtsInvalidContentUrlId)
                    expect(externaLayer.baseURL).to.eq(wmtsInvalidContentUrl)
                    expect(externaLayer.externalLayerId).to.eq(wmtsInvalidContentLayerId)
                    expect(externaLayer.isLoading).to.be.false
                })
                cy.get(`[data-cy="menu-active-layer-${wmtsInvalidContentUrlId}"]`)
                    .get('[data-cy="menu-external-disclaimer-icon"]')
                    .should('be.visible')
                cy.get(`[data-cy="button-error-${wmtsInvalidContentUrlId}"]`)
                    .should('be.visible')
                    .get('[data-cy="button-has-error"]')
                    .should('have.class', 'text-danger')
                cy.get(`[data-cy="button-error-${wmtsInvalidContentUrlId}"]`).click()
                cy.get('[data-cy^="tippy-button-error-"]')
                    .should('be.visible')
                    .contains('Invalid WMTS Capabilities')

                //----------------------------------------------------------------------------------
                cy.log('WMS URL unreachable')
                cy.readStoreValue('getters.visibleLayers').then((layers) => {
                    expect(layers).to.have.lengthOf(4)
                    const externaLayer = layers[2]
                    expect(externaLayer.getID()).to.eq(wmsUnreachableUrlId)
                    expect(externaLayer.baseURL).to.eq(wmsUnreachableUrl)
                    expect(externaLayer.externalLayerId).to.eq(wmsUnreachableLayerId)
                    expect(externaLayer.isLoading).to.be.false
                })
                cy.get(`[data-cy="menu-active-layer-${wmsUnreachableUrlId}"]`)
                    .get('[data-cy="menu-external-disclaimer-icon"]')
                    .should('be.visible')
                cy.get(`[data-cy="button-error-${wmsUnreachableUrlId}"]`)
                    .should('be.visible')
                    .get('[data-cy="button-has-error"]')
                    .should('have.class', 'text-danger')
                cy.get(`[data-cy="button-error-${wmsUnreachableUrlId}"]`).click()
                cy.get('[data-cy^="tippy-button-error-"]')
                    .should('be.visible')
                    .contains('Network error')

                //----------------------------------------------------------------------------------
                cy.log('WMS URL invalid content')
                cy.readStoreValue('getters.visibleLayers').then((layers) => {
                    expect(layers).to.have.lengthOf(4)
                    const externaLayer = layers[3]
                    expect(externaLayer.getID()).to.eq(wmsInvalidContentUrlId)
                    expect(externaLayer.baseURL).to.eq(wmsInvalidContentUrl)
                    expect(externaLayer.externalLayerId).to.eq(wmsInvalidContentLayerId)
                    expect(externaLayer.isLoading).to.be.false
                })
                cy.get(`[data-cy="menu-active-layer-${wmsInvalidContentUrlId}"]`)
                    .get('[data-cy="menu-external-disclaimer-icon"]')
                    .should('be.visible')
                cy.get(`[data-cy="button-error-${wmsInvalidContentUrlId}"]`)
                    .should('be.visible')
                    .get('[data-cy="button-has-error"]')
                    .should('have.class', 'text-danger')
                cy.get(`[data-cy="button-error-${wmsInvalidContentUrlId}"]`).click()
                cy.get('[data-cy^="tippy-button-error-"]')
                    .should('be.visible')
                    .contains('Invalid WMS Capabilities')
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
                    cy.get(`[data-cy="active-layer-name-${layerId}"]`).should('be.visible')
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
                const testLayerSelector = `[data-cy="catalogue-tree-item-${testLayerId}"]`
                cy.get('[data-cy="menu-topic-section"]').should('be.visible').click()
                // opening up layer parents in the topic tree
                cy.get('[data-cy="catalogue-tree-item-title-2"]').should('be.visible').click()
                cy.get('[data-cy="catalogue-tree-item-title-3"]').should('be.visible').click()

                // Add the test layer.
                cy.get(testLayerSelector).should('be.visible').click()
                cy.get(testLayerSelector).trigger('mouseleave')
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
                const testLayerSelector = `[data-cy="catalogue-tree-item-${testLayerId}"]`
                cy.get('[data-cy="menu-topic-section"]').should('be.visible').click()
                // opening up layer parents in the topic tree
                cy.get('[data-cy="catalogue-tree-item-title-2"]').should('be.visible').click()
                cy.get('[data-cy="catalogue-tree-item-title-3"]').should('be.visible').click()

                // Toggle (hide) the test layer.
                cy.get(testLayerSelector).should('be.visible').click()
                cy.get(testLayerSelector).trigger('mouseleave')
                cy.readStoreValue('getters.visibleLayers').then((visibleLayers) => {
                    const visibleIds = visibleLayers.map((layer) => layer.getID())
                    expect(visibleIds).to.not.contain(testLayerId)
                })
                // Toggle (show) the test layer.
                cy.get(testLayerSelector).click()
                cy.get(testLayerSelector).trigger('mouseleave')
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
            it('Disable/enable the "move" arrow correctly', () => {
                const [bottomLayerId, middleLayerId, topLayerId] = visibleLayerIds
                cy.openLayerSettings(bottomLayerId)
                checkOrderButtons(bottomLayerId, true, false)
                cy.openLayerSettings(topLayerId)
                checkOrderButtons(topLayerId, false, true)
                cy.openLayerSettings(middleLayerId)
                checkOrderButtons(middleLayerId, false, false)

                cy.log('testing disabling of arrow button when order is changing')
                // moving the middle layer back
                cy.get(`[data-cy="button-lower-order-layer-${middleLayerId}"]`).click()
                checkOrderButtons(middleLayerId, true, false)
                // back to the middle
                cy.get(`[data-cy="button-raise-order-layer-${middleLayerId}"]`).click()
                checkOrderButtons(middleLayerId, false, false)
                // now moving it to the top
                cy.get(`[data-cy="button-raise-order-layer-${middleLayerId}"]`).click()
                checkOrderButtons(middleLayerId, false, true)
                // and back to the middle
                cy.get(`[data-cy="button-lower-order-layer-${middleLayerId}"]`).click()
                checkOrderButtons(middleLayerId, false, false)
            })
            it('reorder layers when they are drag and dropped', () => {
                const [bottomLayerId, middleLayerId, topLayerId] = visibleLayerIds
                cy.get(`[data-cy="menu-active-layer-${bottomLayerId}"]`)
                    .should('be.visible')
                    .drag(`[data-cy="menu-active-layer-${topLayerId}"]`)
                const checkLayerOrder = (
                    expectedBottomLayerId,
                    expectedMiddleLayerId,
                    expectedTopLayerId
                ) => {
                    cy.location('hash').should((hash) => {
                        const layersParam = new URLSearchParams(hash).get('layers')
                        const layers = layersParam.split(';')
                        expect(layers).to.be.an('Array').lengthOf(3)
                        const [firstUrlLayer, secondUrlLayer, thirdUrlLayer] = layers
                        expect(firstUrlLayer).to.contains(expectedBottomLayerId)
                        expect(secondUrlLayer).to.contains(expectedMiddleLayerId)
                        expect(thirdUrlLayer).to.contains(expectedTopLayerId)
                    })
                }
                // the bottom layer should now be on top, so the order is now
                // - bottomLayer
                // - topLayer
                // - middleLayer
                checkLayerOrder(middleLayerId, topLayerId, bottomLayerId)
                cy.get(`[data-cy="menu-active-layer-${middleLayerId}"]`)
                    .should('be.visible')
                    .drag(`[data-cy="menu-active-layer-${topLayerId}"]`)
                // new state is
                // - bottomLayer
                // - middleLayer
                // - topLayer
                checkLayerOrder(topLayerId, middleLayerId, bottomLayerId)
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
