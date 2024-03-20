/// <reference types="cypress" />
import { FeatureInfoPositions } from '@/store/modules/ui.store'

describe('Testing the feature selection in the URL', () => {
    function checkFeatures() {
        cy.readStoreValue('state.features.selectedFeatures').then((features) => {
            cy.get('@featuresIds').then((featuresIds) => {
                cy.wrap(features.length).should('be.equal', featuresIds.length)

                features.forEach((feature) => {
                    cy.log('checking feature', feature.id, 'is part of', featuresIds.join(','))
                    cy.wrap(featuresIds.includes(feature.id)).should('be.true')
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
            it('Select a few features and check if the tooltip appears (or not) where we expect it', () => {
                cy.log('When featureInfo is not specified, we should have no tooltip')
                goToMapViewWithFeatureSelection()
                checkFeatures()
                checkFeatureInfoPosition(FeatureInfoPositions.NONE)
                cy.log('When featureInfo is specified, as on mobile, we should see the infobox ')
                goToMapViewWithFeatureSelection(FeatureInfoPositions.DEFAULT)
                checkFeatures()
                checkFeatureInfoPosition(FeatureInfoPositions.DEFAULT)
                cy.log('parameter is case insensitive, and we should see a popover here')
                goToMapViewWithFeatureSelection('TOoLtIp')
                checkFeatures()
                checkFeatureInfoPosition(FeatureInfoPositions.TOOLTIP)
            })
        })
    })
})
