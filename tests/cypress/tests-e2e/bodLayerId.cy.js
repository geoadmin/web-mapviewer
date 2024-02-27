/// <reference types="cypress" />

//const { isMobile } = require('../support/utils')

//TODO dans un test : ajouter deux couches, vérifier qu'on en a qu'une
describe('Testing the Bod Id Layer Router ', () => {
    function checkFeatures(featuresIds) {
        cy.readStoreValue('state.features.selectedFeatures').then((features) => {
            cy.wrap(features.length).should('be.equal', featuresIds.length)
            features.forEach((feature) => {
                cy.wrap(featuresIds.includes(feature._id)).should('be.true')
            })
        })
    }
    function checkLayers(layerId, expectedActiveLayersLength) {
        cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
            cy.wrap(activeLayers.length).should('be.equal', expectedActiveLayersLength)
            // make general to see if at least one is the correct one
            cy.wrap(activeLayers.some((activeLayer) => activeLayer.getID() === layerId))
        })
    }
    function checkZoomAndPosition(expectedZoom, expectedCenter) {
        cy.readStoreValue('state.position.zoom').should('be.equal', expectedZoom)
        cy.readStoreValue('state.position.center').then((center) => {
            cy.wrap(center[0]).should('be.closeTo', expectedCenter[0], 1)
            cy.wrap(center[1]).should('be.closeTo', expectedCenter[1], 1)
        })
    }
    /* function checkPopupVisibility(showToolTipParam) {
        if (!showToolTipParam) {
            cy.get('[data-cy="infobox"]').should('not.exist')
            cy.get('[data-cy="popover"]').should('not.exist')
        } else if (showToolTipParam === 'fixed' || (showToolTipParam === 'default' && isMobile())) {
            cy.get('[data-cy="infobox"]').should('be.visible')
        } else {
            cy.get('[data-cy="popover"]').should('be.visible')
        }
    } */

    beforeEach(() => {
        // add intercept for layer config
        cy.intercept('**/rest/services/all/MapServer/layersConfig**', {
            fixture: 'layers.fixture',
        })
        cy.intercept('**/MapServer/**/htmlPopup**', {
            fixture: 'html-popup.fixture.html',
        })
    })

    context('Startup', () => {
        describe('Checks that will ensure we show the correct number of layers, features and zoom at the correct level', () => {
            it('Shows only the given layer when there is no layers parameters', () => {
                const features = []
                const nbFeatures = 4
                cy.fixture('features.fixture.json').then((results) => {
                    results['results'].forEach((feature) => {
                        features.push(feature)
                    })
                    const layer = features[0].layerBodId
                    for (let i = 0; i < nbFeatures; i++) {
                        cy.intercept(`**/MapServer/${layer}/${features[i].id}`, {
                            results: [features[i]],
                        })
                    }

                    const featuresIds = []

                    for (let i = 0; i < nbFeatures; i++) {
                        featuresIds.push(features[i].id.toString())
                    }
                    const params = {}
                    params[layer] = featuresIds.join(',')
                    cy.goToMapView(params)

                    checkLayers(layer, 1)
                    checkFeatures(featuresIds)
                    checkZoomAndPosition(8, [2600867, 1199272])
                    //checkPopupVisibility(null)
                })
            })
            it('Shows all layers, when given a layers paramater which contains the given layer', () => {
                const features = []
                cy.fixture('features.fixture.json').then((results) => {
                    results['results'].forEach((feature) => {
                        features.push(feature)
                    })

                    const layer = features[0].layerBodId

                    cy.intercept(`**/MapServer/${layer}/${features[0].id}`, {
                        results: [features[0]],
                    })

                    const featuresIds = []
                    featuresIds.push(features[0].id)
                    const params = {
                        layers: `test.wms-layer.1;${layer}`,
                        //showtooltip: 'default',
                    }
                    params[layer] = features[0].id
                    console.log('-------------------------- TEST 2 ---------------------')
                    cy.goToMapView(params)

                    checkLayers(layer, 2)
                    checkFeatures(featuresIds)
                    checkZoomAndPosition(8, [features[0].properties.x, features[0].properties.y])
                    //checkPopupVisibility("default")
                })
            })
            it('adds a new layer when given a bod layer id that is not part of the layers parameters', () => {
                const features = []
                cy.fixture('features.fixture.json').then((results) => {
                    results['results'].forEach((feature) => {
                        features.push(feature)
                    })
                    const layer = features[0].layerBodId

                    cy.intercept(`**/MapServer/${layer}/${features[0].id}`, {
                        results: [features[0]],
                    })

                    const featuresIds = []
                    featuresIds.push(features[0].id)
                    const params = {
                        layers: 'test.wms.layer.1;test.wmts.layer.2',
                        z: 5,
                        //showtooltip: "floating"
                    }
                    params[layer] = features[0].id

                    console.log('-------------------------- TEST 3 ---------------------')
                    cy.goToMapView(params)

                    checkLayers(layer, 3)
                    checkFeatures(featuresIds)
                    checkZoomAndPosition(5, [features[0].properties.x, features[0].properties.y])
                    //checkPopupVisibility("floating")
                })
            })
            it('shows only one layer when two are given', () => {
                const features = []
                cy.fixture('features.fixture.json').then((results) => {
                    results['results'].forEach((feature) => {
                        features.push(feature)
                    })
                    const layer_1 = features[0].layerBodId
                    const layer_2 = 'test.wms.layer.1'
                    cy.intercept(`**/MapServer/${layer_1}/${features[0].id}`, {
                        results: [features[0]],
                    })

                    const featuresIds = []
                    featuresIds.push(features[0].id)
                    featuresIds.push(features[1].id)
                    const params = {
                        z: 5,
                        //showtooltip: "fixed"
                    }
                    params[layer_1] = features[0].id
                    params[layer_2] = features[1].id
                    cy.goToMapView(params)

                    checkLayers(layer_1, 1)
                    checkFeatures([featuresIds[0]])
                    checkZoomAndPosition(5, [features[0].properties.x, features[0].properties.y])
                    //checkPopupVisibility("fixed")
                })
            })
        })
    })
})
