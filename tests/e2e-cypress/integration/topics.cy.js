/// <reference types="cypress" />

import { BREAKPOINT_PHONE_WIDTH, BREAKPOINT_TABLET } from '@/config'

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
        it('keeps the topic tree closed at app startup (with default topic)', () => {
            // even though this topic has a topic tree (so the menu should be open)
            // at app startup we do not want that
            cy.goToMapView()
            if (isMobileViewport) {
                cy.get('[data-cy="menu-button"]').click()
            }
            cy.get('[data-cy="menu-topic-tree"]').should('be.hidden')
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
        if (isMobileViewport) {
            it('keeps the menu open/visible after a topic is selected', () => {
                cy.goToMapView()
                // clicking on topic standard
                const topicStandard = mockupTopics.topics[1]
                selectTopicWithId(topicStandard.id)
                cy.readStoreValue('getters.isMenuShown').should('eq', true)
            })
        }
        it('open active layers section in menu when a topic with active layers is selected', () => {
            cy.goToMapView()
            selectTopicWithId('test-topic-standard')
            cy.get('[data-cy="menu-section-active-layers"]').should('be.hidden')
            selectTopicWithId('test-topic-with-active-layers')
            cy.get('[data-cy="menu-section-active-layers"]').should('be.visible')
        })
        it('shows the topic tree in the menu when a topic is selected (that is not the default topic)', () => {
            cy.goToMapView()
            selectTopicWithId('test-topic-standard')
            cy.get('[data-cy="menu-topic-tree"]').should('be.visible')
        })
        it('switches the background to the topic background', () => {
            cy.goToMapView('en', {
                bgLayer: 'void',
            })
            const topicWithActiveLayers = mockupTopics.topics[2]
            selectTopicWithId(topicWithActiveLayers.id)
            cy.readStoreValue('state.layers.backgroundLayerId').should(
                'eq',
                topicWithActiveLayers.defaultBackground
            )
        })
    })

    context('Layer selection in the topic tree', () => {
        beforeEach(() => {
            cy.goToMapView()
            if (isMobileViewport || isTabletViewport) {
                cy.get('[data-cy="menu-button"]').click()
            }
            cy.get('[data-cy="menu-topic-section"]').click()
            cy.get('[data-cy="menu-topic-tree"]').should('be.visible')
        })
        it('does not open the first elements of the tree by default', () => {
            cy.get('[data-cy="topic-tree-item-2"]').should('be.visible')
            cy.get('[data-cy="topic-tree-item-3"]').should('not.be.visible')
        })
        it("shows a topic tree item's children when we click on it", () => {
            cy.get('[data-cy="topic-tree-item-2"]').click()
            cy.get('[data-cy="topic-tree-item-3"]').should('be.visible')
        })
        it('adds a layer to the map when we click on its name in the topic tree', () => {
            cy.get('[data-cy="topic-tree-item-2"]').click()
            cy.get('[data-cy="topic-tree-item-3"]').click()
            cy.readStoreValue('state.layers.activeLayers').should('be.empty')
            cy.get('[data-cy="topic-tree-item-test.wmts.layer"]').click()
            cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
                expect(activeLayers).to.be.an('Array').lengthOf(1)
                const [firstLayer] = activeLayers
                expect(firstLayer.getID()).to.eq('test.wmts.layer')
            })
        })
        it('opens the layer legend popup when clicking the info button', () => {
            const expectedContent = 'Test'
            cy.intercept(
                `**/rest/services/all/MapServer/*/legend**`,
                `<div>${expectedContent}</div>`
            ).as('legend')

            cy.get('[data-cy="topic-tree-item-2"]').click()
            cy.get('[data-cy="topic-tree-item-3"]').click()
            cy.get('[data-cy="topic-tree-item-info"]').first().click()
            cy.get('[data-cy="layer-legend-popup"]').should('be.visible').contains(expectedContent)
        })
        it('previews the layer on hover', () => {
            const expectedLayerId = 'test.wmts.layer'
            const layerSelector = `[data-cy="topic-tree-item-${expectedLayerId}"]`

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
    })

    context('Topic URL param', () => {
        it('adds default topic URL param after startup when nothing was specified', () => {
            cy.goToMapView()
            cy.url().should('contain', 'topic=ech')
        })
        it('switches to the topic specified in the URL after startup', () => {
            cy.fixture('topics.fixture').then((fakeTopics) => {
                const testTopicWithActiveLayers = fakeTopics.topics[2]
                cy.goToMapView('en', {
                    topic: testTopicWithActiveLayers.id,
                })
                cy.readStoreValue('state.topics.current').then((currentTopic) => {
                    expect(currentTopic).to.be.an('Object')
                    expect(currentTopic.id).to.eq(testTopicWithActiveLayers.id)
                })
                cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
                    expect(activeLayers)
                        .to.be.an('Array')
                        .lengthOf(testTopicWithActiveLayers.activatedLayers.length)
                })
            })
        })
    })
})
