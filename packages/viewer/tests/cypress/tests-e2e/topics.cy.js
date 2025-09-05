/// <reference types="cypress" />

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

    /**
     * Resize an element by dragging the bottom right corner If using the startXY coordinates, the
     * startPosition should be undefined and the same for endXY X and Y coordinates are relative to the
     * top left corner of the element
     *
     * @param {Object} options - Options for resizing.
     * @param {string} options.selector - The selector of the element.
     * @param {string} options.startPosition - The start position for dragging.
     * @param {string} options.endPosition - The end position for dragging.
     * @param {Object} options.startXY - The start coordinates for dragging.
     * @param {Object} options.endXY - The end coordinates for dragging.
     * @param {string} options.button - Mouse button to use.
     * @see https://github.com/dmtrKovalenko/cypress-real-events?tab=readme-ov-file#cyrealmousedown
     * @see https://github.com/dmtrKovalenko/cypress-real-events/blob/main/src/commands/mouseDown.ts
     */
    function resizeElement({
             selector = '',
             startPosition = 'bottomRight',
             endPosition = undefined,
             startXY = undefined,
             endXY = { x: 100, y: 100 },
             button = 'left',
         } = {}) {
        cy.get(selector).realMouseDown({
            button,
            ...(startXY ? { x: startXY.x, y: startXY.y } : { position: startPosition }),
        })
        cy.get(selector).realMouseDown({
            button,
            ...(endPosition ? { position: endPosition } : { x: endXY.x, y: endXY.y }),
        })
        cy.get(selector).realMouseUp({ button })

        cy.log('cmd: resizeElement successful')
    }

    it('handle topic changes correctly', () => {
        cy.log('loads topic correctly at app startup')
        cy.goToMapView({
            layers: 'test.wmts.layer',
            bgLayer: 'void',
        })
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
            cy.readStoreValue('getters.currentBackgroundLayer').should((bgLayer) => {
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
            cy.readStoreValue('getters.currentBackgroundLayer').should('be.null') // void layer
        })

        //---------------------------------------------------------------------
        cy.log('can select layers in the topic tree (catalogue)')
        cy.get('[data-cy="menu-topic-tree"]').should('be.visible')

        // it must not open the first elements of the tree by default
        cy.get('[data-cy="catalogue-tree-item-2"]').should('be.visible')
        cy.get('[data-cy="catalogue-tree-item-3"]').should('not.exist')
        cy.get('[data-cy="catalogue-tree-item-5"]').should('not.exist')

        // shows a topic tree item's children when we click on it
        cy.get('[data-cy="catalogue-tree-item-title-2"]').should('be.visible').click()
        cy.get('[data-cy="catalogue-tree-item-3"]').should('be.visible')
        cy.get('[data-cy="catalogue-tree-item-5"]').should('be.visible')

        // it adds a layer to the map when we click on its name in the topic tree
        cy.get('[data-cy="catalogue-tree-item-title-3"]').should('be.visible').click()
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 2)
        cy.readStoreValue('getters.visibleLayers').should('have.length', 1)
        cy.get('[data-cy="catalogue-add-layer-button-test.wmts.layer"] svg').should(
            'have.class',
            'fa-square-check'
        )
        cy.get('[data-cy="catalogue-tree-item-title-test.wmts.layer"]').should('be.visible').click()
        cy.get('[data-cy="catalogue-add-layer-button-test.wmts.layer"] svg').should(
            'have.class',
            'fa-square'
        )
        cy.readStoreValue('state.layers.activeLayers').should((activeLayers) => {
            expect(activeLayers).to.be.an('Array').lengthOf(1)
            const [firstLayer] = activeLayers
            expect(firstLayer.id).to.eq('test.wms.layer')
        })
        cy.get('[data-cy="catalogue-tree-item-title-test.wmts.layer"]').should('be.visible').click()
        cy.get('[data-cy="catalogue-add-layer-button-test.wmts.layer"] svg').should(
            'have.class',
            'fa-square-check'
        )
        cy.readStoreValue('state.layers.activeLayers').should((activeLayers) => {
            expect(activeLayers).to.be.an('Array').lengthOf(2)
            const [firstLayer, secondLayer] = activeLayers
            expect(firstLayer.id).to.eq('test.wms.layer')
            expect(secondLayer.id).to.eq('test.wmts.layer')
        })

        //---------------------------------------------------------------------
        cy.log('it opens the layer legend popup when clicking the info button')
        const expectedContent = 'Test'
        cy.intercept(
            `**/rest/services/all/MapServer/*/legend**`,
            `<div>${expectedContent}</div>`
        ).as('legend')
        cy.get('[data-cy="catalogue-tree-item-info-test.wmts.layer"]').should('be.visible').click()
        cy.get('[data-cy="layer-description-popup"]').should('be.visible').contains(expectedContent)
        cy.get('[data-cy="window-close"]:visible').click()

        //---------------------------------------------------------------------
        cy.log('previews the layer on hover')

        cy.get('[data-cy="catalogue-tree-item-5"]').scrollIntoView()
        cy.get('[data-cy="catalogue-tree-item-5"]').should('be.visible').click()
        cy.get('[data-cy="catalogue-tree-item-name-test.wms.layer"]').scrollIntoView()
        cy.get('[data-cy="catalogue-tree-item-name-test.wms.layer"]').should('be.visible')
        cy.readStoreValue('state.layers.previewLayer').should('be.null')
        cy.get('[data-cy="catalogue-tree-item-name-test.wms.layer"]').trigger('mouseenter')
        cy.readStoreValue('state.layers.previewLayer').should((layer) => {
            expect(layer.id).to.equal('test.wms.layer')
        })

        //----------------------------------------------------------------------
        cy.log('Sets the url parameter catalogNodes when opening/closing catalog themes')
        cy.hash().should('match', /catalogNodes=test-complex-topic,2,3,5(&.*)?$/)
        cy.get('[data-cy="catalogue-tree-item-name-3"]').scrollIntoView()
        cy.get('[data-cy="catalogue-tree-item-name-3"]').should('be.visible').click()
        cy.hash().should('match', /catalogNodes=test-complex-topic,2,5(&.*)?$/)
        cy.get('[data-cy="menu-topic-section"] [data-cy="menu-section-header"]:visible').click()
        cy.hash().should('match', /catalogNodes=2,5(&.*)?$/)
        cy.get('[data-cy="menu-topic-section"] [data-cy="menu-section-header"]:visible').click()
        cy.get('[data-cy="catalogue-tree-item-name-5"]').scrollIntoView()
        cy.get('[data-cy="catalogue-tree-item-name-5"]:visible').click()
        cy.get('[data-cy="catalogue-tree-item-name-2"]:visible').click()
        cy.get('[data-cy="menu-topic-section"] [data-cy="menu-section-header"]:visible').click()
        cy.hash().should('not.contain', 'catalogNodes')
    })
    it('Handle topic and catalogNodes at startup correctly', () => {
        //---------------------------------------------------------------------
        cy.log(
            'Opens nodes in the topic tree if set in the URL and are different from the default in topic'
        )
        cy.goToMapView({
            topic: 'test-topic-with-active-layers',
            catalogNodes: 'test-topic-with-active-layers,2,5',
        })
        cy.openMenuIfMobile()

        // it should open the menu section by default if some catalog nodes are set in the URL (even if the default topic is shown)
        cy.get('[data-cy="menu-topic-tree"]').should('be.visible')
        cy.get('[data-cy="catalogue-tree-item-3"]').should('be.visible')
        cy.get('[data-cy="catalogue-tree-item-5"]').should('be.visible')
        cy.get('[data-cy="catalogue-tree-item-test.wmts.layer"]').should('not.exist')
        cy.get('[data-cy="catalogue-tree-item-test.wms.layer"]').should('be.visible')
        cy.readStoreValue('state.topics.openedTreeThemesIds').should((currentlyOpenedThemesId) => {
            expect(currentlyOpenedThemesId).to.be.an('Array')
            expect(currentlyOpenedThemesId).to.deep.equal([
                'test-topic-with-active-layers',
                '2',
                '5',
            ])
        })
    })

    // This test is very flaky, the legend is only sometimes resized and I have not found a solution yet to make it more stable therefore it is skiped for now
    it.skip('Modify the legend display', () => {
        cy.viewport(1920, 1080)

        cy.goToMapView({
            layers: 'test.wmts.layer',
            bgLayer: 'void',
        })
        cy.wait(['@topics', '@topic-ech', '@layerConfig', '@routeChange', '@routeChange'])
        cy.log('it opens the layer legend popup when clicking the info button')
        cy.fixture('legend.fixture.html').then((legend) => {
            cy.intercept(`**/rest/services/all/MapServer/*/legend**`, legend).as('legend')
            cy.get('[data-cy="button-open-visible-layer-settings-test.wmts.layer-0"]')
                .should('be.visible')
                .click()
            cy.get('[data-cy="button-toggle-visibility-layer-test.wmts.layer-0"]') // this is not necessary but it prevents from selecting random objects from the layer
                .should('be.visible')
                .click()
            cy.get('[data-cy="button-show-description-layer-test.wmts.layer-0"]')
                .should('be.visible')
                .click()
            cy.wait('@legend')

            cy.get('[data-cy="menu-topic-tree"]').should('not.exist')

            const popupSelector = '[data-cy="simple-window"]'
            const popupSelectorHeader = '[data-cy="window-header"]'
            const moveX = 100
            const moveY = 120
            const bottomRightMargin = 3

            cy.get(popupSelector).then((popup) => {
                const rect = popup[0].getBoundingClientRect()
                const initialPosition = { x: rect.x, y: rect.y }
                cy.get(popupSelectorHeader).trigger('mousedown', { button: 0 })
                cy.get(popupSelectorHeader).trigger('mousemove', { button: 0, clientX: 0, clientY: 0, force: true }) // this is needed to make the drag work
                cy.get(popupSelectorHeader).trigger('mousemove', { button: 0, clientX: moveX, clientY: moveY, force: true })
                cy.get(popupSelectorHeader).trigger('mouseup', { button: 0 })

                cy.get(popupSelector).then((popup) => {
                    const rect = popup[0].getBoundingClientRect()
                    expect(rect.x).to.be.closeTo(initialPosition.x + moveX, 1) // Allow small margin for floating-point
                    expect(rect.y).to.be.closeTo(initialPosition.y + moveY, 1)
                })
            })
            const increasedX = 100
            const increasedY = 100
            cy.log('resize the legend popup')
            cy.log('reduce the size of the legend popup to the half')
            cy.get(popupSelector).then((popup) => {
                const rect = popup[0].getBoundingClientRect()
                const initialDimensions = { height: rect.height, width: rect.width }
                let genArr = Array.from({ length: 15 }, (v, k) => k + 1)
                cy.wrap(genArr).each((index) => {
                    cy.log('reduce size loop 1 for index', index)
                    resizeElement({
                        selector: popupSelector,
                        startXY: {
                            x: initialDimensions.width - bottomRightMargin - index,
                            y: initialDimensions.height - bottomRightMargin - index,
                        },
                        endPosition: 'right',
                    })
                })
                cy.wrap(genArr).each((index) => {
                    cy.log('reduce size loop 2 for index', index)
                    resizeElement({
                        selector: popupSelector,
                        startXY: {
                            x: initialDimensions.width - bottomRightMargin + index,
                            y: initialDimensions.height - bottomRightMargin + index,
                        },
                        endPosition: 'right',
                    })
                })
                cy.wrap(genArr).each((index) => {
                    cy.log('reduce size loop 3 for index', index)
                    cy.get(popupSelector).realMouseDown({
                        button: 'left',
                        x: initialDimensions.width - bottomRightMargin - index,
                        y: initialDimensions.height - bottomRightMargin - index,
                    })
                    cy.get(popupSelector).realMouseDown({
                        button: 'left',
                        endPosition: 'right',
                    })
                    cy.get(popupSelector).realMouseUp({ button: 'left' })
                })

                cy.get(popupSelector).then((popup) => {
                    const rect = popup[0].getBoundingClientRect()
                    expect(rect.height).to.not.eq(initialDimensions.height)
                })
            })

            cy.log('increase the size of the legend popup by 100px')
            cy.get(popupSelector).then((popup) => {
                const rect = popup[0].getBoundingClientRect()
                const initialDimensions = { height: rect.height, width: rect.width }

                let genArr = Array.from({ length: 15 }, (v, k) => k + 1)
                cy.wrap(genArr).each((index) => {
                    cy.log('increase sice loop 1 for index', index)
                    resizeElement({
                        selector: popupSelector,
                        startXY: {
                            x: initialDimensions.width - bottomRightMargin - index,
                            y: initialDimensions.height - bottomRightMargin - index,
                        },
                        endXY: {
                            x: increasedX + initialDimensions.width,
                            y: increasedY + initialDimensions.height,
                        },
                    })
                })
                cy.wrap(genArr).each((index) => {
                    cy.log('increase size loop 2 for index', index)
                    resizeElement({
                        selector: popupSelector,
                        startXY: {
                            x: initialDimensions.width - bottomRightMargin + index,
                            y: initialDimensions.height - bottomRightMargin + index,
                        },
                        endXY: {
                            x: increasedX + initialDimensions.width,
                            y: increasedY + initialDimensions.height,
                        },
                    })
                })
                cy.wrap(genArr).each((index) => {
                    cy.log('increase size loop 3 for index', index)
                    resizeElement({
                        selector: popupSelector,
                        startPosition: 'bottomRight',
                        endXY: {
                            x: increasedX + initialDimensions.width,
                            y: increasedY + initialDimensions.height,
                        },
                    })
                })
                cy.get(popupSelector).then((popup) => {
                    const rect = popup[0].getBoundingClientRect()
                    expect(rect.width).to.not.eq(initialDimensions.width)
                    expect(rect.height).to.not.eq(initialDimensions.height)
                })
            })
        })
    })
})
