/// <reference types="cypress" />

describe('Testing the Bod Id Layer Router ', () => {
    const features = []
    cy.fixture('features.fixture.json').then((features) => {
        features['results'].forEach((feature) => {
            features.push(feature)
        })
    })
    const layer = features[0].layer

    function intercept(numberOfFeatures) {
        for (let i = 0; i < numberOfFeatures; i++) {
            cy.intercept(`**/MapServer/${layer}/${features[i].id}`, { results: [features[i]] })
        }
    }
    beforeEach(() => {
        cy.intercept('**/MapServer/**/htmlPopup**', {
            fixture: 'html-popup.fixture.html',
        })
    })
    context('Startup', () => {
        it('Shows only the given layer when there is no layers parameters', () => {
            const featuresIds = []
            for (let i = 0; i < 4; i++) {
                featuresIds.push(features[i].id)
            }
            intercept(4)
            const params = {}
            params[layer] = featuresIds.join(';')
            cy.goToMapView(params)

            cy.readStoreValue('state.features.selectedFeatures').then((features) => {
                expect(cy.wrap(features.length)).to.equal(4)
                features.every((feature) => {
                    featuresIds.include(feature.getID())
                })
            })

            expect(cy.readStoreValue('state.features.highlightedFeature').getID()).to.equal(
                features[0].getID()
            )

            cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
                cy.expect(activeLayers.length).to.be(1)
                cy.expect(activeLayers[0].getID()).to.be(layer.getID())
            })
            cy.readStoreValue('state.ui.zoom').should.be(8)
            cy.readStoreValue('state.ui.center').should.equal(features[0].geometry.coordinates)

            cy.get('data-cy=["popover"]').should('be.visible')
        })
        it('Shows all layers, when given a layers paramater which contains the given layer', () => {
            const feature = features[0]
            intercept(1)
            const params = {
                layers: `test.wms-layer.1,${feature.layer}`,
                showtooltip: 'false',
            }
            params[feature.layer] = feature.id
            cy.goToMapView(params)

            cy.readStoreValue('state.features.selectedFeatures').then((features) => {
                expect(cy.wrap(features.length)).to.equal(1)
                expect(cy.wrap(features[0].id).to.equal(feature.id))
            })

            expect(cy.readStoreValue('state.features.highlightedFeature').getID()).to.equal(
                feature.getID()
            )

            cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
                cy.expect(activeLayers.length).to.be(2)
                cy.expect(activeLayers.include(layer)).to.be(true)
            })
            cy.readStoreValue('state.ui.zoom').should.be(8)
            cy.readStoreValue('state.ui.center').should.equal(feature.geometry.coordinates)

            // if we decide to go with 'showtooltip = false' --> infobox : data-cy=["infobox"]
        })
        it('adds a new layer when given a bod layer id that is not part of the layers parameters', () => {
            const feature = features[0]
            intercept(1)
            const params = {
                layers: 'test.wms.layer.1,test.wmts.layer.2',
                z: 5,
            }
            params[feature.layer] = feature.id
            cy.goToMapView(params)
            cy.readStoreValue('state.features.selectedFeatures').then((features) => {
                expect(cy.wrap(features.length)).to.equal(1)
                expect(cy.wrap(features[0].id).to.equal(feature.id))
            })
            expect(cy.readStoreValue('state.features.highlightedFeature').getID()).to.equal(
                feature.getID()
            )

            // CHECK layers
            cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
                cy.expect(activeLayers.length).to.be(3)
                cy.expect(activeLayers.include(layer)).to.be(true)
            })
            cy.readStoreValue('state.ui.zoom').should.be(5)
            cy.readStoreValue('state.ui.center').should.equal(feature.geometry.coordinates)
        })
    })
})
