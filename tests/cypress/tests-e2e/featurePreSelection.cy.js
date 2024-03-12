/// <reference types="cypress" />
import { FeatureInfoPositions } from '@/store/modules/ui.store'

describe('Testing the feature selection in the URL', () => {
    function checkFeatures() {
        cy.readStoreValue('state.features.selectedFeatures').then((features) => {
            cy.get('@featuresIds').then((featuresIds) => {
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
        })
    }
    function checkFeatureInfoPosition(expectedPosition) {
        cy.readStoreValue('state.ui.featureInfoPosition').should('be.equal', expectedPosition)
        if (FeatureInfoPositions.NONE === expectedPosition) {
            cy.get('[data-cy="popover"]').should('not.exist')
            cy.get('[data-cy="infobox"]').should('not.exist')
        } else if (FeatureInfoPositions.TOOLTIP === expectedPosition) {
            // as tests are in phone mode, tooltip is only set if specified
            cy.get('[data-cy="popover"]').should('be.visible')
            cy.get('[data-cy="infobox"]').should('not.exist')
        } else {
            cy.get('[data-cy="popover"]').should('not.exist')
            cy.get('[data-cy="infobox"]').should('be.visible')
        }
    }
    function goToMapViewWithFeatureSelection(featureInfoPosition = null) {
        cy.get('@features').then((features) => {
            cy.get('@featuresIds').then((featuresIds) => {
                const params = {
                    layers: `${features[0].layerBodId}@features=${featuresIds.join(':')}`,
                }
                if (featureInfoPosition) {
                    params.featureInfo = featureInfoPosition
                }
                cy.goToMapView(params)
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
        // add intercept for all features, and allow their Ids to be used in tests
        cy.fixture('features.fixture.json').then((jsonResult) => {
            const features = [...jsonResult.results]
            const featuresIds = features.map((feature) => feature.id.toString())
            cy.wrap(features).as('features')
            cy.wrap(featuresIds).as('featuresIds')
            features.forEach((feature) => {
                cy.intercept(`**/MapServer/${feature.layerBodId}/${feature.id}`, {
                    results: feature,
                })
            })
        })
    })

    context('Startup', () => {
        describe('Checks that when given a parameter, we select the features', function () {
            it('Select a few features and shows the tooltip does not appear when featureInfoPosition is not specified', () => {
                goToMapViewWithFeatureSelection()
                checkFeatures()
                checkFeatureInfoPosition(FeatureInfoPositions.NONE)
            })
            it('Shows the tooltip in its correct position when set to default (bottom Panel on Phone)', function () {
                goToMapViewWithFeatureSelection(FeatureInfoPositions.DEFAULT)
                checkFeatures()
                checkFeatureInfoPosition(FeatureInfoPositions.DEFAULT)
            })
            it('Shows the tooltip on the map when featureInfo is set to tooltip, and handle strange cases', function () {
                goToMapViewWithFeatureSelection('TOoLtIp')
                checkFeatures()
                checkFeatureInfoPosition(FeatureInfoPositions.TOOLTIP)
            })
        })
    })
})
