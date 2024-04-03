/// <reference types="cypress" />

import { isMobile } from 'tests/cypress/support/utils'

describe('Topics', () => {
    // mimic the output of `/rest/services` endpoint
    const selectTopicWithId = (topicId) => {
        cy.log(`Select topic ${topicId}`)
        cy.openMenuIfMobile()
        cy.get('[data-cy="change-topic-button"]:visible').click()
        cy.get(`[data-cy="change-to-topic-${topicId}"]`).scrollIntoView()
        cy.get(`[data-cy="change-to-topic-${topicId}"]`).should('be.visible').click()
        cy.wait(`@topic-${topicId}`)
    }
    const checkThatActiveLayerFromTopicAreActive = (rawTopic) => {
        if (!rawTopic) {
            return
        }
        cy.readStoreValue('state.layers.activeLayers').should((activeLayers) => {
            expect(activeLayers).to.be.an('Array')
            expect(activeLayers.length).to.eq(rawTopic.activatedLayers.length)
            // topics layer are in the reverse order as the store layer (topic: top->bottom, layer: bottom->top)
            // so we have to revert the list of layers from the topic before checking their position in the store

            rawTopic.activatedLayers
                .slice()
                .reverse()
                .forEach((layerIdThatMustBeActive, index) => {
                    const activeLayer = activeLayers[index]
                    expect(activeLayer.id).to.eq(layerIdThatMustBeActive)
                })
        })
    }

    it('handle topic correctly', () => {
        cy.log('loads topic correctly at app startup')
        cy.goToMapView()
        // checking that all topics have been loaded
        cy.fixture('topics.fixture').then((mockupTopics) => {
            cy.readStoreValue('state.topics.config').should((topicConfig) => {
                expect(topicConfig).to.be.an('Array')
                expect(topicConfig.length).to.eq(mockupTopics.topics.length)
            })
        })

        // checking the default topic at app startup (must be ech)
        cy.readStoreValue('state.topics.current').should((currentTopic) => {
            expect(currentTopic).to.eq('ech')
        })
        cy.url().should('contain', 'topic=ech')
        cy.openMenuIfMobile()
        // checking that it keeps the topic tree closed at app startup (with default topic)
        // even though this topic has a topic tree (so the menu should be open), at app startup we do not want that
        cy.get('[data-cy="menu-topic-tree"]').should('be.hidden')

        //---------------------------------------------------------------------
        cy.log('can switch topics')
        cy.goToMapView({
            layers: 'test.wmts.layer',
            bgLayer: 'void',
        })
        cy.readStoreValue('getters.visibleLayers').should((layers) => {
            expect(layers).to.be.an('Array')
            expect(layers.length).to.eq(1)
            expect(layers[0]).to.be.an('Object')
            expect(layers[0].id).to.eq('test.wmts.layer')
        })
        // it must clear all activated layers and change background layer on topic selection
        cy.fixture('topics.fixture').then((mockupTopics) => {
            const topicStandard = mockupTopics.topics[1]
            selectTopicWithId(topicStandard.id)
            // we expect visible layers to be empty
            cy.readStoreValue('getters.visibleLayers').should((layers) => {
                expect(layers).to.be.an('Array')
                expect(layers.length).to.eq(0)
            })
            // we expect background layer to have switched to the one of the topic
            cy.readStoreValue('state.layers.currentBackgroundLayer').should((bgLayer) => {
                expect(bgLayer).to.not.be.null
                expect(bgLayer.id).to.eq(topicStandard.defaultBackground)
            })

            // it must show the topic tree in the menu when a topic is selected (that is not the default topic)
            cy.get('[data-cy="menu-topic-tree"]').should('be.visible')
            // no active layer, the "Displayed map" menu section should be hidden
            cy.get('[data-cy="menu-section-active-layers"]').should('be.hidden')

            // checking that it activates layers of the topic after topic swap
            // (if they are supposed to be active, but hidden)
            const topicWithActiveLayers = mockupTopics.topics[2]
            selectTopicWithId(topicWithActiveLayers.id)
            // we expect the layer to be activated but not visible
            cy.readStoreValue('getters.visibleLayers').should('be.empty')
            checkThatActiveLayerFromTopicAreActive(topicWithActiveLayers)
            // now that there are some active layer, the "Displayed map" menu section must be visible
            cy.get('[data-cy="menu-section-active-layers"]').should('be.visible')

            // checking that it activates and set visible layers of the topic after topic swap
            const topicWithVisibleLayers = mockupTopics.topics[3]
            selectTopicWithId(topicWithVisibleLayers.id)
            // there should be visible layers
            cy.readStoreValue('getters.visibleLayers').should((visibleLayers) => {
                expect(visibleLayers).to.be.an('Array')
                expect(visibleLayers.length).to.eq(topicWithVisibleLayers.selectedLayers.length)
                topicWithVisibleLayers.selectedLayers.forEach((layerIdThatMustBeVisible, index) => {
                    expect(visibleLayers[index]).to.be.an('Object')
                    expect(visibleLayers[index].id).to.eq(layerIdThatMustBeVisible)
                })
            })
            checkThatActiveLayerFromTopicAreActive(topicWithVisibleLayers)

            // checking that it correctly handles a complex topic with custom legacy URL params
            const complexTopic = mockupTopics.topics[4]
            selectTopicWithId(complexTopic.id)
            // from the mocked up response above
            const expectedActiveLayers = ['test.wmts.layer', 'test.wms.layer']
            const expectedVisibleLayers = ['test.wmts.layer']
            const expectedOpacity = {
                'test.wmts.layer': 0.6,
                'test.wms.layer': 0.8,
            }
            cy.readStoreValue('getters.visibleLayers').should((visibleLayers) => {
                expect(visibleLayers).to.be.an('Array')
                expect(visibleLayers.length).to.eq(expectedVisibleLayers.length)
                expectedVisibleLayers.forEach((layerIdThatMustBeVisible, index) => {
                    expect(visibleLayers[index]).to.be.an('Object')
                    expect(visibleLayers[index].id).to.eq(layerIdThatMustBeVisible)
                })
            })
            cy.readStoreValue('state.layers.activeLayers').should((activeLayers) => {
                expect(activeLayers).to.be.an('Array')
                expect(activeLayers.length).to.eq(expectedActiveLayers.length)
                expectedActiveLayers.forEach((layerIdThatMustBeActive, index) => {
                    const activeLayer = activeLayers[index]
                    expect(activeLayer).to.be.an('Object')
                    expect(activeLayer.id).to.eq(layerIdThatMustBeActive)
                    expect(activeLayer.opacity).to.eq(expectedOpacity[layerIdThatMustBeActive])
                })
            })
            cy.readStoreValue('state.layers.currentBackgroundLayer').should('be.null') // void layer
        })

        //----------------------------------------------------------------------
        if (isMobile()) {
            cy.log('keeps the menu open/visible after a topic is selected')
            cy.goToMapView()
            cy.fixture('topics.fixture').then((mockupTopics) => {
                // clicking on topic standard
                const topicStandard = mockupTopics.topics[1]
                selectTopicWithId(topicStandard.id)
                cy.readStoreValue('getters.isMenuShown').should('eq', true)
                cy.get('[data-cy="menu-tray"]').should('be.visible')
            })
        }

        //---------------------------------------------------------------------
        cy.log('can select layers in the topic tree (catalogue)')
        cy.goToMapView()
        cy.openMenuIfMobile()
        cy.get('[data-cy="menu-topic-section"]').should('be.visible').click()
        cy.get('[data-cy="menu-topic-tree"]').should('be.visible')

        // it must not open the first elements of the tree by default
        cy.get('[data-cy="catalogue-tree-item-2"]').should('be.visible')
        cy.get('[data-cy="catalogue-tree-item-3"]').should('not.be.visible')

        // shows a topic tree item's children when we click on it
        cy.get('[data-cy="catalogue-tree-item-title-2"]').click()
        cy.get('[data-cy="catalogue-tree-item-3"]').should('be.visible')

        // it adds a layer to the map when we click on its name in the topic tree
        cy.get('[data-cy="catalogue-tree-item-title-3"]').click()
        cy.readStoreValue('state.layers.activeLayers').should('be.empty')
        cy.get('[data-cy="catalogue-tree-item-title-test.wmts.layer"]').click()
        cy.readStoreValue('state.layers.activeLayers').should((activeLayers) => {
            expect(activeLayers).to.be.an('Array').lengthOf(1)
            const [firstLayer] = activeLayers
            expect(firstLayer.id).to.eq('test.wmts.layer')
        })

        // it opens the layer legend popup when clicking the info button
        const expectedContent = 'Test'
        cy.intercept(
            `**/rest/services/all/MapServer/*/legend**`,
            `<div>${expectedContent}</div>`
        ).as('legend')

        cy.get('[data-cy^="catalogue-tree-item-info-"]').first().should('be.visible').click()
        cy.get('[data-cy="layer-description-popup"]').should('be.visible').contains(expectedContent)

        //---------------------------------------------------------------------
        if (!isMobile()) {
            cy.log('previews the layer on hover')
            const expectedLayerId = 'test.wmts.layer'
            const layerSelector = `[data-cy="catalogue-tree-item-${expectedLayerId}"]`

            cy.goToMapView()
            cy.get('[data-cy="menu-topic-section"]:visible').click()
            cy.get('[data-cy="catalogue-tree-item-title-2"]:visible').click()
            cy.get('[data-cy="catalogue-tree-item-title-3"]:visible').click()

            cy.get(layerSelector).trigger('mouseenter')
            cy.readStoreValue('getters.visibleLayers').should((visibleLayers) => {
                const visibleIds = visibleLayers.map((layer) => layer.id)
                expect(visibleIds).to.contain(expectedLayerId)
            })

            cy.get(layerSelector).trigger('mouseleave')
            cy.readStoreValue('getters.visibleLayers').should((visibleLayers) => {
                const visibleIds = visibleLayers.map((layer) => layer.id)
                expect(visibleIds).not.to.contain(expectedLayerId)
            })
        }

        //---------------------------------------------------------------------
        cy.log('loads the topic set in the URL')
        cy.fixture('topics.fixture').then((mockupTopics) => {
            const topicWithActiveLayers = mockupTopics.topics[2]
            cy.goToMapView({
                topic: topicWithActiveLayers.id,
            })
            cy.readStoreValue('state.topics.current').should((currentTopic) => {
                expect(currentTopic).to.eq(topicWithActiveLayers.id)
            })
            cy.url().should('contain', `topic=${topicWithActiveLayers.id}`)
        })

        //---------------------------------------------------------------------
        cy.log('Opens nodes in the topic tree if set by default (or in the URL)')
        cy.goToMapView({
            catalogNodes: '2',
        })
        cy.openMenuIfMobile()

        // it should open the menu section by default if some catalog nodes are set in the URL (even if the default topic is shown)
        cy.get('[data-cy="catalogue-tree-item-2"]').should('be.visible')
        cy.get('[data-cy="catalogue-tree-item-3"]').should('be.visible')
        cy.readStoreValue('state.topics.openedTreeThemesIds').should((currentlyOpenedThemesId) => {
            expect(currentlyOpenedThemesId).to.be.an('Array')
            expect(currentlyOpenedThemesId).to.deep.equal(['2'])
        })
        // TODO PB-295 implement save behavior as old viewer, which means treat catalogNodes as a
        // normal url parameter
        // it must not change the URL when we close on a tree item (it's not meant to be synced with the UI after loading)
        // cy.get('[data-cy="catalogue-tree-item-title-3"]').click()
        // cy.get('[data-cy="catalogue-tree-item-test.wmts.layer"]').should('be.visible')
        // cy.url().should('contain', 'catalogNodes=2')
        // cy.url().should('not.contain', 'catalogNodes=2,')
    })
})
