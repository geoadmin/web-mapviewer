/// <reference types="cypress" />

describe('Testing the feature selection in the URL', () => {
    function checkFeatures(featuresIds) {
        cy.readStoreValue('state.features.selectedFeatures').then((features) => {
            cy.wrap(features.length).should('be.equal', featuresIds.length)
            features.forEach((feature) => {
                cy.wrap(featuresIds.includes(feature._id)).should('be.true')
            })
        })
    }

    beforeEach(() => {
        // add intercept for layer config
        cy.intercept('**/rest/services/all/MapServer/layersConfig**', {
            fixture: 'layers.fixture',
        })
        // add intercept for the html popup
        cy.intercept('**/MapServer/**/htmlPopup**', {
            fixture: 'html-popup.fixture.html',
        })
    })

    context('Startup', () => {
        describe('Checks that when given a parameter, we select the features', () => {
            it('Select a few features and shows the tooltip in its correct spot', () => {
                const features = []
                const nbFeatures = 4
                cy.fixture('features.fixture.json').then((results) => {
                    results['results'].forEach((feature) => {
                        features.push(feature)
                    })
                    const layer = features[0].layerBodId
                    for (let i = 0; i < nbFeatures; i++) {
                        // we intercept every feature we want to retrieve
                        cy.intercept(`**/MapServer/${layer}/${features[i].id}`, {
                            results: [features[i]],
                        })
                    }

                    const featuresIds = []

                    for (let i = 0; i < nbFeatures; i++) {
                        featuresIds.push(features[i].id.toString())
                    }
                    cy.goToMapView({ layers: `${layer}@features=${featuresIds.join(':')}` })
                    checkFeatures(featuresIds)
                })
            })
        })
    })
})
