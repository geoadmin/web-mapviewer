/// <reference types="cypress" />

describe('Testing the feature selection in the URL', () => {
    function checkFeatures(featuresIds) {
        cy.readStoreValue('state.features.selectedFeatures').then((features) => {
            cy.wrap(features.length).should('be.equal', featuresIds.length)

            const modifiedFeaturesIds = featuresIds.map(
                // feature.id returns a string in the form of `layer.id-feature.id`
                // thus a small adaptation to check we get the correct result
                (featureId) => `${features[0].layer.id}-${featureId}`
            )
            console.log(modifiedFeaturesIds)
            features.forEach((feature) => {
                cy.wrap(modifiedFeaturesIds.includes(feature.id)).should('be.true')
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
                cy.fixture('features.fixture.json').then((jsonResult) => {
                    const features = [...jsonResult.results]
                    features.forEach((feature) => {
                        cy.intercept(`**/MapServer/${feature.layerBodId}/${feature.id}`, {
                            results: feature,
                        })
                    })
                    const featuresIds = features.map((feature) => feature.id.toString())
                    cy.goToMapView({
                        layers: `${features[0].layerBodId}@features=${featuresIds.join(':')}`,
                    })
                    checkFeatures(featuresIds)
                })
            })
        })
    })
})
