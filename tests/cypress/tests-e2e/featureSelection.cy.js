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
            cy.get('[data-cy="popover"]').should('exist')
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
    const timeLayer = 'test.timeenabled.wmts.layer'
    const standardLayer = 'ch.babs.kulturgueter'
    beforeEach(() => {
        // add intercept for all features, and allow their Ids to be used in tests
        cy.fixture('features.fixture.json').then((jsonResult) => {
            const features = [...jsonResult.results]
            const featuresIds = features.map((feature) => feature.id.toString())
            cy.wrap(features).as('features')
            cy.wrap(featuresIds).as('featuresIds')
            features.forEach((feature) => {
                cy.intercept(`**/MapServer/${timeLayer}/${feature.id}**`, {
                    feature: feature,
                }).as(`${timeLayer}_${feature.id}`)
                cy.intercept(`**/MapServer/${standardLayer}/${feature.id}**`, {
                    feature: feature,
                }).as(`${standardLayer}_${feature.id}`)
            })
            // also add intercept for identify on the features we need when clicking
            cy.intercept('**identify**geometry=266**', {
                results: [features[0]],
            }).as(`${standardLayer}_8835`)
            cy.intercept('**identify**geometry=263**', { results: [features[1]] }).as(
                `${standardLayer}_8940`
            )
            cy.intercept(`**identify**${timeLayer}**`, {
                results: [features[0]],
            }).as(`${timeLayer}_8835`)
        })
    })
    context('Feature Selection Tests', () => {
        describe('Checks that when given a parameter, we select the features and vice versa', function () {
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
            it('Synchronise URL and feature selection', () => {
                const expectedFeatureIds = [8835, 8940]
                const mapSelector = '[data-cy="ol-map"]'
                cy.goToMapView({
                    layers: `${standardLayer};${timeLayer}@year=2018,f`,
                })
                // ------------------------------------------------------------------------------------------------
                cy.url().should((url) => {
                    expect(new URLSearchParams(url.split('map')[1]).get('featureInfo')).to.eq(null)
                })
                cy.log('Check that the features appear in the URL')

                cy.get(mapSelector).click()
                cy.wait(`@${standardLayer}_${expectedFeatureIds[0]}`)
                cy.url().should((url) => {
                    expect(new URLSearchParams(url.split('map')[1]).get('featureInfo')).to.eq(
                        'default'
                    )
                })
                cy.url().should((url) => {
                    new URLSearchParams(url.split('map')[1])
                        .get('layers')
                        .split(';')
                        .forEach((layerParam) => {
                            const layerAndFeatures = layerParam.split('@features=')
                            if (layerAndFeatures[0] === standardLayer) {
                                expect(layerAndFeatures[1]).to.eq(expectedFeatureIds[0].toString())
                            } else {
                                expect(layerAndFeatures.length).to.eq(1)
                            }
                        })
                })
                // ------------------------------------------------------------------------------------------------
                cy.log('Check that clicking another feature from the same layer changes the URL')

                cy.get(mapSelector).click(100, 100)

                cy.url().should((url) => {
                    new URLSearchParams(url.split('map')[1])
                        .get('layers')
                        .split(';')
                        .forEach((layerParam) => {
                            const layerAndFeatures = layerParam.split('@features=')
                            if (layerAndFeatures[0] === standardLayer) {
                                expect(layerAndFeatures[1]).to.eq(expectedFeatureIds[1].toString())
                            } else {
                                expect(layerAndFeatures.length).to.eq(1)
                            }
                        })
                })
                // ------------------------------------------------------------------------------------------------
                cy.log('Check that after a reload, features remain selected')
                cy.reload()
                cy.url().should((url) => {
                    new URLSearchParams(url.split('map')[1])
                        .get('layers')
                        .split(';')
                        .forEach((layerParam) => {
                            const layerAndFeatures = layerParam.split('@features=')
                            if (layerAndFeatures[0] === standardLayer) {
                                expect(layerAndFeatures[1]).to.eq(expectedFeatureIds[1].toString())
                            } else {
                                expect(layerAndFeatures.length).to.eq(1)
                            }
                        })
                })
                // ------------------------------------------------------------------------------------------------
                cy.log('Selecting feature from another layer which is time enabled')

                cy.openMenuIfMobile()
                cy.get(`[data-cy="button-toggle-visibility-layer-${standardLayer}-0"]`)
                    .should('be.visible')
                    .click()
                cy.get(`[data-cy="button-toggle-visibility-layer-${timeLayer}-1"]`)
                    .should('be.visible')
                    .click()
                cy.closeMenuIfMobile()

                cy.get(mapSelector).click()
                cy.url().should((url) => {
                    new URLSearchParams(url.split('map')[1])
                        .get('layers')
                        .split(';')
                        .forEach((layerParam) => {
                            const splittedParam = layerParam.split('@')
                            if (splittedParam[0] === timeLayer) {
                                expect(splittedParam.length).to.eq(3)
                                expect(splittedParam.includes('year=2018')).to.eq(true)
                                expect(
                                    splittedParam.includes(`features=${expectedFeatureIds[0]}`)
                                ).to.eq(true)
                            } else {
                                expect(splittedParam.length).to.eq(1)
                            }
                        })
                })
                // ------------------------------------------------------------------------------------------------
                cy.log('Check that upon closing, the features are no longer in the URL')
                cy.get('[data-cy="infobox-close"]').click()
                cy.get('[data-cy="highlighted-features"]').should('not.exist')

                cy.url().should((url) => {
                    const layer = new URLSearchParams(url.split('map')[1])
                        .get('layers')
                        .split('@features')
                    expect(layer.length).to.eq(1)
                })
                // ------------------------------------------------------------------------------------------------
                cy.log(
                    'Check that reloading when there is no feature selected does not add back a previously selected feature'
                )
                cy.reload()
                cy.get('[data-cy="highlighted-features"]').should('not.exist')

                cy.url().should((url) => {
                    const layer = new URLSearchParams(url.split('map')[1])
                        .get('layers')
                        .split('@features')
                    expect(layer.length).to.eq(1)
                })
            })
        })
    })
})
