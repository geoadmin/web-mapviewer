describe('Topics', () => {
    // mimic the output of `/rest/services` endpoint
    let mockupTopics = {}
    const selectTopicWithId = (topicId) => {
        cy.get('[data-cy="menu-button"]').click()
        cy.get('[data-cy="change-topic-button"]').click()
        cy.get(`[data-cy="change-to-topic-${topicId}"]`).click()
        cy.wait(`@topic-${topicId}`)
    }
    // Mocking up topic backend
    beforeEach(() => {
        cy.fixture('topics.fixture').then((topics) => {
            mockupTopics = topics
        })
    })
    context('Topics loading at startup', () => {
        it('loads all topics in the state at startup', () => {
            cy.goToMapView()
            cy.readStoreValue('state.topics.config').then((topicConfig) => {
                expect(topicConfig).to.be.an('Array')
                expect(topicConfig.length).to.eq(mockupTopics.topics.length)
            })
        })
        it('starts with topics ech at app startup', () => {
            cy.goToMapView()
            cy.readStoreValue('state.topics.current').then((currentTopic) => {
                expect(currentTopic).to.be.an('Object')
                expect(currentTopic.id).to.eq('ech')
            })
        })
    })
    context('Topic switching', () => {
        const checkThatActiveLayerFromTopicAreActive = (rawTopic) => {
            if (!rawTopic) {
                return
            }
            cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
                expect(activeLayers).to.be.an('Array')
                expect(activeLayers.length).to.eq(rawTopic.activatedLayers.length)
                rawTopic.activatedLayers.forEach((layerIdThatMustBeActive, index) => {
                    const activeLayer = activeLayers[index]
                    expect(activeLayer.getID()).to.eq(layerIdThatMustBeActive)
                })
            })
        }
        it('clears all activate layers and change background layer on topic selection', () => {
            cy.goToMapView('en', {
                layers: 'test.wmts.layer',
            })
            cy.readStoreValue('getters.visibleLayers').then((layers) => {
                expect(layers).to.be.an('Array')
                expect(layers.length).to.eq(1)
                expect(layers[0]).to.be.an('Object')
                expect(layers[0].getID()).to.eq('test.wmts.layer')
            })
            // clicking on topic standard
            const topicStandard = mockupTopics.topics[1]
            selectTopicWithId(topicStandard.id)
            // we expect visible layers to be empty
            cy.readStoreValue('getters.visibleLayers').then((layers) => {
                expect(layers).to.be.an('Array')
                expect(layers.length).to.eq(0)
            })
            // we expect background layer to have switch to the one of the topic
            cy.readStoreValue('state.layers.backgroundLayerId').should(
                'eq',
                topicStandard.defaultBackground
            )
        })
        it('activates layers of the topic after topic swap', () => {
            cy.goToMapView()
            const topicWithActiveLayers = mockupTopics.topics[2]
            selectTopicWithId(topicWithActiveLayers.id)
            // we expect the layer to be activated but not visible
            cy.readStoreValue('getters.visibleLayers').should('be.empty')
            checkThatActiveLayerFromTopicAreActive(topicWithActiveLayers)
        })
        it('activates and set visible layers of the topic after topic swap', () => {
            cy.goToMapView()
            const topicWithVisibleLayers = mockupTopics.topics[3]
            selectTopicWithId(topicWithVisibleLayers.id)
            // there should be visible layers
            cy.readStoreValue('getters.visibleLayers').then((visibleLayers) => {
                expect(visibleLayers).to.be.an('Array')
                expect(visibleLayers.length).to.eq(topicWithVisibleLayers.selectedLayers.length)
                topicWithVisibleLayers.selectedLayers.forEach((layerIdThatMustBeVisible, index) => {
                    expect(visibleLayers[index]).to.be.an('Object')
                    expect(visibleLayers[index].getID()).to.eq(layerIdThatMustBeVisible)
                })
            })
            checkThatActiveLayerFromTopicAreActive(topicWithVisibleLayers)
        })
        it('handles correctly complex topic with custom legacy URL params', () => {
            cy.goToMapView()
            const complexTopic = mockupTopics.topics[4]
            selectTopicWithId(complexTopic.id)
            // from the mocked up response above
            const expectedActiveLayers = ['test.wmts.layer', 'test.wms.layer']
            const expectedVisibleLayers = ['test.wmts.layer']
            const expectedOpacity = {
                'test.wmts.layer': 0.6,
                'test.wms.layer': 0.8,
            }
            const expectedBackgroundLayerId = null // void layer
            cy.readStoreValue('getters.visibleLayers').then((visibleLayers) => {
                expect(visibleLayers).to.be.an('Array')
                expect(visibleLayers.length).to.eq(expectedVisibleLayers.length)
                expectedVisibleLayers.forEach((layerIdThatMustBeVisible, index) => {
                    expect(visibleLayers[index]).to.be.an('Object')
                    expect(visibleLayers[index].getID()).to.eq(layerIdThatMustBeVisible)
                })
            })
            cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
                expect(activeLayers).to.be.an('Array')
                expect(activeLayers.length).to.eq(expectedActiveLayers.length)
                expectedActiveLayers.forEach((layerIdThatMustBeActive, index) => {
                    const activeLayer = activeLayers[index]
                    expect(activeLayer).to.be.an('Object')
                    expect(activeLayer.getID()).to.eq(layerIdThatMustBeActive)
                    expect(activeLayer.opacity).to.eq(expectedOpacity[layerIdThatMustBeActive])
                })
            })
            cy.readStoreValue('state.layers.backgroundLayerId').should(
                'eq',
                expectedBackgroundLayerId
            )
        })
        it('hides the menu and overlay after a topic is selected', () => {
            cy.goToMapView()
            // clicking on topic standard
            const topicStandard = mockupTopics.topics[1]
            selectTopicWithId(topicStandard.id)
            cy.readStoreValue('state.ui.showMenuTray').should('eq', false)
            cy.readStoreValue('state.overlay.show').should('eq', false)
        })
    })
})
