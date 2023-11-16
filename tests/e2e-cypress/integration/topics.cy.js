/// <reference types="cypress" />

import { BREAKPOINT_PHONE_WIDTH, BREAKPOINT_TABLET } from '@/config'

function getSpecificUrlParameter(parameterName) {
    const url = cy.url
    const allParameters = url.split('/?')[1].split('&')
    allParameters.forEach((param) => {
        const [key, value] = param.split('=')
        if (key === parameterName) {
            return value
        }
    })
    return null
}

describe('Topics', () => {
    const width = Cypress.config('viewportWidth')
    const isMobileViewport = width < BREAKPOINT_PHONE_WIDTH
    const isTabletViewport = !isMobileViewport && width < BREAKPOINT_TABLET
    // mimic the output of `/rest/services` endpoint
    let mockupTopics = {}
    const selectTopicWithId = (topicId) => {
        cy.readStoreValue('state.ui').then((ui) => {
            // only click on the menu button if the menu is not opened yet
            if (!ui.showMenu) {
                cy.get('[data-cy="menu-button"]').click()
            }
        })
        cy.get('[data-cy="change-topic-button"]').click()
        cy.get(`[data-cy="change-to-topic-${topicId}"]`).click()
        cy.wait(`@topic-${topicId}`)
    }
    const checkThatActiveLayerFromTopicAreActive = (rawTopic) => {
        if (!rawTopic) {
            return
        }
        cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
            expect(activeLayers).to.be.an('Array')
            expect(activeLayers.length).to.eq(rawTopic.activatedLayers.length)
            // topics layer are in the reverse order as the store layer (topic: top->bottom, layer: bottom->top)
            // so we have to revert the list of layers from the topic before checking their position in the store

            rawTopic.activatedLayers
                .slice()
                .reverse()
                .forEach((layerIdThatMustBeActive, index) => {
                    const activeLayer = activeLayers[index]
                    expect(activeLayer.getID()).to.eq(layerIdThatMustBeActive)
                })
        })
    }

    // Mocking up topic backend
    beforeEach(() => {
        cy.fixture('topics.fixture').then((topics) => {
            mockupTopics = topics
        })
    })
    it('loads topic correctly at app startup', () => {
        cy.goToMapView()
        // checking that all topics have been loaded
        cy.readStoreValue('state.topics.config').then((topicConfig) => {
            expect(topicConfig).to.be.an('Array')
            expect(topicConfig.length).to.eq(mockupTopics.topics.length)
        })
        // checking the default topic at app startup (must be ech)
        cy.readStoreValue('state.topics.current').then((currentTopic) => {
            expect(currentTopic).to.be.an('Object')
            expect(currentTopic.id).to.eq('ech')
        })
        cy.url().should('contain', 'topic=ech')
        // checking that it keeps the topic tree closed at app startup (with default topic)
        // even though this topic has a topic tree (so the menu should be open), at app startup we do not want that
        if (isMobileViewport) {
            cy.get('[data-cy="menu-button"]').click()
        }
        cy.get('[data-cy="menu-topic-tree"]').should('be.hidden')
    })

    it('can switch topics', () => {
        cy.goToMapView({
            layers: 'test.wmts.layer',
            bgLayer: 'void',
        })
        cy.readStoreValue('getters.visibleLayers').then((layers) => {
            expect(layers).to.be.an('Array')
            expect(layers.length).to.eq(1)
            expect(layers[0]).to.be.an('Object')
            expect(layers[0].getID()).to.eq('test.wmts.layer')
        })
        // it must clear all activated layers and change background layer on topic selection
        const topicStandard = mockupTopics.topics[1]
        selectTopicWithId(topicStandard.id)
        // we expect visible layers to be empty
        cy.readStoreValue('getters.visibleLayers').then((layers) => {
            expect(layers).to.be.an('Array')
            expect(layers.length).to.eq(0)
        })
        // we expect background layer to have switched to the one of the topic
        cy.readStoreValue('state.layers.currentBackgroundLayer').then((bgLayer) => {
            expect(bgLayer).to.not.be.null
            expect(bgLayer.getID()).to.eq(topicStandard.defaultBackground)
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
        cy.readStoreValue('getters.visibleLayers').then((visibleLayers) => {
            expect(visibleLayers).to.be.an('Array')
            expect(visibleLayers.length).to.eq(topicWithVisibleLayers.selectedLayers.length)
            topicWithVisibleLayers.selectedLayers.forEach((layerIdThatMustBeVisible, index) => {
                expect(visibleLayers[index]).to.be.an('Object')
                expect(visibleLayers[index].getID()).to.eq(layerIdThatMustBeVisible)
            })
        })
        checkThatActiveLayerFromTopicAreActive(topicWithVisibleLayers)

        // checking that it correctly handles a complex topic with custom legacy URL params
        const complexTopic = mockupTopics.topics[4]
        selectTopicWithId(complexTopic.id)
        // from the mocked up response above
        const expectedActiveLayers = ['test.wms.layer', 'test.wmts.layer']
        const expectedVisibleLayers = ['test.wmts.layer']
        const expectedOpacity = {
            'test.wmts.layer': 0.6,
            'test.wms.layer': 0.8,
        }
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
        cy.readStoreValue('state.layers.currentBackgroundLayer').should('be.null') // void layer
    })
    if (isMobileViewport) {
        it('keeps the menu open/visible after a topic is selected', () => {
            cy.goToMapView()
            // clicking on topic standard
            const topicStandard = mockupTopics.topics[1]
            selectTopicWithId(topicStandard.id)
            cy.readStoreValue('getters.isMenuShown').should('eq', true)
        })
    }

    it('can select layers in the topic tree (catalogue)', () => {
        cy.goToMapView()
        if (isMobileViewport) {
            cy.get('[data-cy="menu-button"]').click()
        }
        cy.get('[data-cy="menu-topic-section"]').click()
        cy.get('[data-cy="menu-topic-tree"]').should('be.visible')

        // it must not open the first elements of the tree by default
        cy.get('[data-cy="topic-tree-item-2"]').should('be.visible')
        cy.get('[data-cy="topic-tree-item-3"]').should('not.be.visible')

        // shows a topic tree item's children when we click on it
        cy.get('[data-cy="topic-tree-item-2"]').click()
        cy.get('[data-cy="topic-tree-item-3"]').should('be.visible')

        // it adds a layer to the map when we click on its name in the topic tree
        cy.get('[data-cy="topic-tree-item-3"]').click()
        cy.readStoreValue('state.layers.activeLayers').should('be.empty')
        cy.get('[data-cy="topic-tree-item-test.wmts.layer"]').click()
        cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
            expect(activeLayers).to.be.an('Array').lengthOf(1)
            const [firstLayer] = activeLayers
            expect(firstLayer.getID()).to.eq('test.wmts.layer')
        })

        // it opens the layer legend popup when clicking the info button
        const expectedContent = 'Test'
        cy.intercept(
            `**/rest/services/all/MapServer/*/legend**`,
            `<div>${expectedContent}</div>`
        ).as('legend')

        cy.get('[data-cy="topic-tree-item-info"]').first().click()
        cy.get('[data-cy="layer-legend-popup"]').should('be.visible').contains(expectedContent)
    })

    if (!isMobileViewport) {
        it('previews the layer on hover', () => {
            const expectedLayerId = 'test.wmts.layer'
            const layerSelector = `[data-cy="topic-tree-item-${expectedLayerId}"]`

            cy.goToMapView()
            cy.get('[data-cy="menu-topic-section"]').click()
            cy.get('[data-cy="topic-tree-item-2"]').click()
            cy.get('[data-cy="topic-tree-item-3"]').click()

            cy.get(layerSelector).trigger('mouseenter')
            cy.readStoreValue('getters.visibleLayers').then((visibleLayers) => {
                const visibleIds = visibleLayers.map((layer) => layer.getID())
                expect(visibleIds).to.contain(expectedLayerId)
            })

            cy.get(layerSelector).trigger('mouseleave')
            cy.readStoreValue('getters.visibleLayers').then((visibleLayers) => {
                const visibleIds = visibleLayers.map((layer) => layer.getID())
                expect(visibleIds).not.to.contain(expectedLayerId)
            })
        })
    }

    it('loads the topic set in the URL', () => {
        const topicWithActiveLayers = mockupTopics.topics[2]
        cy.goToMapView({
            topic: topicWithActiveLayers.id,
        })
        cy.readStoreValue('state.topics.current').then((currentTopic) => {
            expect(currentTopic).to.be.an('Object')
            expect(currentTopic.id).to.eq(topicWithActiveLayers.id)
        })
        cy.url().should('contain', `topic=${topicWithActiveLayers.id}`)
    })

    it('Opens nodes in the topic tree if set by default (or in the URL)', () => {
        cy.goToMapView({
            catalogNodes: '2',
        })
        if (isMobileViewport) {
            cy.get('[data-cy="menu-button"]').click()
        }

        // it should open the menu section by default if some catalog nodes are set in the URL (even if the default topic is shown)
        cy.get('[data-cy="topic-tree-item-2"]').should('be.visible')
        cy.get('[data-cy="topic-tree-item-3"]').should('be.visible')
        cy.readStoreValue('state.topics.openedTreeThemesIds').then((currentlyOpenedThemesId) => {
            expect(currentlyOpenedThemesId).to.be.an('Array')
            expect(currentlyOpenedThemesId).to.deep.equal(['2'])
        })
        // it must not change the URL when we close on a tree item (it's not meant to be synced with the UI after loading)
        cy.get('[data-cy="topic-tree-item-3"]').click()
        cy.get('[data-cy="topic-tree-item-test.wmts.layer"]').should('be.visible')
        cy.url().should('contain', 'catalogNodes=2')
        cy.url().should('not.contain', 'catalogNodes=2,3')
    })
})
