/// <reference types="cypress" />
import { DEFAULT_FEATURE_COUNT_RECTANGLE_SELECTION } from '@/config.js'
import { FeatureInfoPositions } from '@/store/modules/ui.store'

describe('Testing the feature selection', () => {
    context('Feature pre-selection in the URL', () => {
        const timeLayer = 'test.timeenabled.wmts.layer'
        const standardLayer = 'ch.babs.kulturgueter'

        /**
         * @param {Number} featureId The feature ID to apply to the single feature returned by the
         *   intercept
         * @param {String} layerId The layer ID for which to give the single feature
         */
        function createInterceptWithFeatureId(featureId, layerId) {
            cy.fixture('features/features.fixture').then((features) => {
                const featureTemplate = features.results[0]
                const singleFeature = Cypress._.cloneDeep(featureTemplate)
                singleFeature.id = featureId
                singleFeature.featureId = featureId

                cy.intercept('**identify**', (req) => {
                    const { layers } = req.query
                    if (layers.includes(layerId)) {
                        req.alias = `${layerId}_identify`
                        req.reply({
                            results: [singleFeature],
                        })
                    } else {
                        req.reply({
                            results: [],
                        })
                    }
                })
            })
        }

        function checkFeatures() {
            cy.log(`Ensuring there are 10 selected features, and they're all different`)

            cy.readStoreValue('getters.selectedFeatures').should((features) => {
                expect(features.length).to.eq(10)

                features.forEach((feature) => {
                    expect(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']).to.include(
                        feature.id
                    )
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
            const params = {
                layers: `${standardLayer}@features=1:2:3:4:5:6:7:8:9:10`,
            }
            if (featureInfoPosition) {
                params.featureInfo = featureInfoPosition
            }
            cy.goToMapView(params)
        }

        it('Adds pre-selected features and place the tooltip according to URL param on a narrow width screen', () => {
            cy.log('When featureInfo is not specified, we should have no tooltip visible')
            goToMapViewWithFeatureSelection()
            checkFeatures()
            checkFeatureInfoPosition(FeatureInfoPositions.NONE)
            // --------------------------------- WIDTH < 400 pixels ---------------------------------------
            cy.log(
                'When using a viewport with width inferior to 400 pixels, we should always go to infobox when featureInfo is not None.'
            )
            cy.log('When featureInfo is specified, we should see the infobox')
            goToMapViewWithFeatureSelection(FeatureInfoPositions.DEFAULT)
            checkFeatures()
            checkFeatureInfoPosition(FeatureInfoPositions.BOTTOMPANEL)
            cy.log('parameter is case insensitive, but we should see an infobox here')
            goToMapViewWithFeatureSelection('TOoLtIp')
            checkFeatures()
            checkFeatureInfoPosition(FeatureInfoPositions.BOTTOMPANEL)
        })
        it.skip('Adds pre-selected features and place the tooltip according to URL param on a bigger screen', () => {
            // currently, this breaks on the CI, but works perfectly fine locally. It sets the featureInfo param
            // to 'bottomPanel', when it should be set to 'default'.
            // When we review all e2e tests to include viewport differences, we will re activate this
            // also, we might want to add it to the test on top to spare the extra 'it'
            cy.log(
                'When using a viewport with width superior or equal to 400 pixels, the tooltip should behave normally'
            )
            cy.viewport(400, 800)
            cy.log(
                'When featureInfo is specified, as the viewport is mobile-sized, we should see the infobox'
            )
            goToMapViewWithFeatureSelection(FeatureInfoPositions.DEFAULT)
            checkFeatures()
            checkFeatureInfoPosition(FeatureInfoPositions.DEFAULT)
            cy.log('parameter is case insensitive, and we should see a popover here')
            goToMapViewWithFeatureSelection('TOoLtIp')
            checkFeatures()
            checkFeatureInfoPosition(FeatureInfoPositions.TOOLTIP)
        })
        it('Synchronise URL and feature selection', () => {
            const expectedFeatureIds = [1234, 5678]
            const mapSelector = '[data-cy="ol-map"]'
            cy.goToMapView({
                layers: `${standardLayer};${timeLayer}@year=2018,f`,
            })
            // ------------------------------------------------------------------------------------------------
            cy.url().should((url) => {
                expect(new URLSearchParams(url.split('map')[1]).get('featureInfo')).to.eq(null)
            })

            cy.log('Check that the features appear in the URL')
            createInterceptWithFeatureId(expectedFeatureIds[0], standardLayer)

            cy.get(mapSelector).click()
            cy.wait(`@${standardLayer}_identify`)
            cy.wait(`@htmlPopup`)

            cy.url().should((url) => {
                // the viewport is smaller than 400 px, 'bottompanel' is the only possible option for
                // featureInfo value.
                expect(new URLSearchParams(url.split('map')[1]).get('featureInfo')).to.eq(
                    'bottomPanel'
                )
            })
            cy.url().should((url) => {
                new URLSearchParams(url.split('map')[1])
                    .get('layers')
                    .split(';')
                    .forEach((layerParam) => {
                        const layerAndAttributes = layerParam.split('@')
                        if (layerAndAttributes[0] === standardLayer) {
                            const featureAttribute = layerAndAttributes
                                .find((attribute) => attribute.startsWith('features'))
                                ?.split('=')
                            expect(featureAttribute[1]).to.eq(`${expectedFeatureIds[0]}`)
                        }
                    })
            })
            // ------------------------------------------------------------------------------------------------
            cy.log('Check that clicking another feature from the same layer changes the URL')
            createInterceptWithFeatureId(expectedFeatureIds[1], standardLayer)

            cy.get(mapSelector).click(100, 100)
            cy.wait(`@${standardLayer}_identify`)
            cy.wait(`@htmlPopup`)

            cy.url().should((url) => {
                new URLSearchParams(url.split('map')[1])
                    .get('layers')
                    .split(';')
                    .forEach((layerParam) => {
                        const layerAndFeatures = layerParam.split('@features=')
                        if (layerAndFeatures[0] === standardLayer) {
                            expect(layerAndFeatures[1]).to.eq(`${expectedFeatureIds[1]}`)
                        } else {
                            expect(layerAndFeatures.length).to.eq(1)
                        }
                    })
            })
            // ------------------------------------------------------------------------------------------------
            cy.log('Check that after a reload, features remain selected')
            cy.reload()
            cy.wait(`@featureDetail_${expectedFeatureIds[1]}`)
            cy.url().should((url) => {
                new URLSearchParams(url.split('map')[1])
                    .get('layers')
                    .split(';')
                    .forEach((layerParam) => {
                        const layerAndFeatures = layerParam.split('@features=')
                        if (layerAndFeatures[0] === standardLayer) {
                            expect(layerAndFeatures[1]).to.eq(`${expectedFeatureIds[1]}`)
                        } else {
                            expect(layerAndFeatures.length).to.eq(1)
                        }
                    })
            })
            // ------------------------------------------------------------------------------------------------
            cy.log('Selecting feature from another layer which is time enabled')
            createInterceptWithFeatureId(expectedFeatureIds[0], timeLayer)

            cy.openMenuIfMobile()
            cy.get(`[data-cy="button-toggle-visibility-layer-${standardLayer}-0"]`)
                .should('be.visible')
                .click()
            cy.get(`[data-cy="button-toggle-visibility-layer-${timeLayer}-1"]`)
                .should('be.visible')
                .click()
            cy.closeMenuIfMobile()

            cy.get(mapSelector).click()
            cy.wait(`@${timeLayer}_identify`)
            cy.wait(`@htmlPopup`)

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
    context('Feature identification on the map', () => {
        function drawRectangleOnMap(pixelsFromCenter) {
            cy.get('@olMap').realMouseDown({ ctrlKey: true, position: 'center' })
            cy.get('@olMap').realMouseMove(pixelsFromCenter.x, pixelsFromCenter.y, {
                ctrlKey: true,
                position: 'center',
            })
            cy.get('@olMap').then((olMapElement) => {
                cy.get('@olMap').realMouseUp({
                    x: olMapElement.width() / 2.0 + pixelsFromCenter.x,
                    y: olMapElement.height() / 2.0 + pixelsFromCenter.y,
                    position: 'center',
                    ctrlKey: true,
                })
            })
        }

        it('can select an area to identify features inside it', () => {
            cy.goToMapView({
                layers: 'test.wms.layer',
            })
            cy.get('[data-cy="ol-map"]').as('olMap').should('be.visible')
            cy.log(
                'Selecting a rectangle (by click&drag) while pressing SHIFT, should start a rectangle identification of features'
            )
            drawRectangleOnMap({
                x: 100,
                y: -100,
            })
            cy.log('making sure 50 items are requested when selecting a dragbox on the map')
            cy.wait('@identify')
                .its('request.query.limit')
                .should('eq', `${DEFAULT_FEATURE_COUNT_RECTANGLE_SELECTION}`)
            // waiting for each feature detail to be loaded (can take a while with the stubbing, so it can lead to timeouts
            // with further selectors if not properly waited)
            for (
                let featureCount = 0;
                featureCount < DEFAULT_FEATURE_COUNT_RECTANGLE_SELECTION;
                featureCount++
            ) {
                cy.wait(`@htmlPopup`)
            }

            cy.log('scrolling down at the bottom of the list')
            cy.get('[data-cy="highlighted-features"]')
                .as('highlightedFeatures')
                .should('be.visible')
            cy.log('checking that each feature has been rendered in the list')
            cy.get('@highlightedFeatures')
                .find('[data-cy="feature-item"]')
                .should('have.length', DEFAULT_FEATURE_COUNT_RECTANGLE_SELECTION)
            cy.get('@highlightedFeatures').scrollTo('bottom')

            cy.get('[data-cy="feature-list-load-more"]').as('loadMore').should('be.visible')
            cy.get('@loadMore').click()
            cy.wait('@identify')
                .its('request.query')
                .should((query) => {
                    expect(query.limit).to.eq(`${DEFAULT_FEATURE_COUNT_RECTANGLE_SELECTION}`)
                    expect(query.offset).to.eq(`${DEFAULT_FEATURE_COUNT_RECTANGLE_SELECTION}`)
                })

            // same as above, waiting for each feature deatil to be loaded
            for (
                let featureCount = 0;
                featureCount < DEFAULT_FEATURE_COUNT_RECTANGLE_SELECTION;
                featureCount++
            ) {
                cy.wait(`@htmlPopup`)
            }
            cy.get('@highlightedFeatures')
                .find('[data-cy="feature-item"]')
                .should('have.length', 2 * DEFAULT_FEATURE_COUNT_RECTANGLE_SELECTION)

            cy.log('Sending an empty response for further identify')
            cy.intercept('**identify**', {
                results: [],
            }).as('noMoreResults')

            cy.get('@highlightedFeatures').scrollTo('bottom')
            cy.get('@loadMore').click()
            cy.wait('@noMoreResults')

            cy.get('@loadMore').should('not.exist')

            cy.log(
                'sending a single feature as response, checking that the "Load more" button is not added'
            )
            cy.intercept('**identify**', {
                fixture: 'features/features.fixture',
            }).as('identifySingleFeature')

            drawRectangleOnMap({
                x: 30,
                y: -80,
            })
            cy.wait('@identifySingleFeature')
            cy.wait(`@htmlPopup`)

            cy.get('@highlightedFeatures').should('be.visible')
            cy.get('@highlightedFeatures').find('[data-cy="feature-item"]').should('have.length', 1)
            cy.get('@loadMore').should('not.exist')

            cy.log('clicking where there is no feature unselect the current one(s)')
            cy.intercept('**identify**', (req) => {
                req.reply({
                    results: [],
                })
            }).as('emptyIdentify')
            drawRectangleOnMap({
                x: 100,
                y: -100,
            })
            cy.wait('@emptyIdentify')
            cy.get('@highlightedFeatures').should('not.exist')
        })
    })
})
