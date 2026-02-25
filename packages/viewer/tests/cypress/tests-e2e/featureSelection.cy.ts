/// <reference types="cypress" />
import { registerProj4 } from '@swissgeo/coordinates'
import proj4 from 'proj4'

import { DEFAULT_FEATURE_COUNT_RECTANGLE_SELECTION } from '@/config/map.config'
import { FeatureInfoPositions } from '@/store/modules/ui.store'
import { assertDefined } from 'support/utils'
import type Map from 'ol/Map'
import type LayerFeature from '@/api/features/LayerFeature.class'
import type { MockFeature } from 'support/intercepts'

import { addFeatureIdentificationIntercepts } from '../support/intercepts'

registerProj4(proj4)
type FeatureInfoPosition = (typeof FeatureInfoPositions)[keyof typeof FeatureInfoPositions]

describe('Testing the feature selection', () => {
    context('Feature pre-selection in the URL', () => {
        const timeLayer = 'test.timeenabled.wmts.layer'
        const standardLayer = 'ch.babs.kulturgueter'

        /**
         * @param featureId The feature ID to apply to the single feature returned by the intercept
         * @param layerId The layer ID for which to give the single feature
         */
        function createInterceptWithFeatureId(featureId: number, layerId: string): void {
            cy.fixture('features/features.fixture').then((features: { results: MockFeature[] }) => {
                const featureTemplate = features.results[0]
                const singleFeature = Cypress._.cloneDeep(featureTemplate)
                assertDefined(singleFeature)
                singleFeature.id = featureId.toString()
                singleFeature.featureId = featureId.toString()

                cy.intercept('**identify**', (req) => {
                    const { layers } = req.query as Record<string, string>
                    if (typeof layers === 'string' && layers.includes(layerId)) {
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

        function checkFeatures(): void {
            cy.log(`Ensuring there are 10 selected features, and they're all different`)

            cy.readStoreValue('getters.selectedFeatures').should((features: LayerFeature[]) => {
                expect(features.length).to.eq(10)

                features.forEach((feature: LayerFeature) => {
                    expect(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']).to.include(feature.id)
                })
            })
        }

        function checkFeatureInfoPosition(expectedPosition: FeatureInfoPosition): void {
            cy.readStoreValue('state.ui.featureInfoPosition').should('be.equal', expectedPosition)
            if (FeatureInfoPositions.NONE === expectedPosition) {
                cy.get('[data-cy="popover"]').should('not.exist')
                cy.get('[data-cy="infobox"]').should('not.exist')
            } else if (FeatureInfoPositions.TOOLTIP === expectedPosition) {
                cy.get('[data-cy="popover"]').should('exist')
                cy.get('[data-cy="infobox"]').should('not.exist')
            } else {
                cy.get('[data-cy="popover"]').should('not.exist')
                cy.get('[data-cy="infobox"]').should('be.visible')
            }
        }

        function goToMapViewWithFeatureSelection(featureInfoPosition: FeatureInfoPosition | null = null): void {
            const queryParams: Record<string, string> = {
                layers: `${standardLayer}@features=1:2:3:4:5:6:7:8:9:10`,
            }
            if (featureInfoPosition) {
                queryParams.featureInfo = featureInfoPosition
            }
            console.log('goToMapViewWithFeatureSelection queryParams', queryParams)
            cy.goToMapView({ queryParams })
        }

        it('Adds pre-selected features and place the tooltip according to URL param on a narrow width screen', () => {
            cy.log('When featureInfo is not specified, we should have no tooltip visible')
            goToMapViewWithFeatureSelection()
            checkFeatures()
            checkFeatureInfoPosition(FeatureInfoPositions.NONE)
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
        it('Centers correctly the map when pre-selected features are present', () => {
            cy.log('We ensure that when no center is defined, we are on the center of the extent')
            const preDefinedCenter = [2671500, 1190000]

            // we override the interception to ensure the features are in a fixed position
            cy.goToMapView(
                {
                    layers: `${standardLayer}@features=1:2:3:4:5:6:7:8:9:10`,
                },
                true,
                {},
                {
                    addFeatureIdentificationIntercepts: () =>
                        addFeatureIdentificationIntercepts(preDefinedCenter),
                }
            )

            cy.readStoreValue('state.position.center').should((storeCenter) => {
                expect(storeCenter.length).to.eq(2)
                expect(storeCenter[0]).to.to.approximately(preDefinedCenter[0], 0.01)
                expect(storeCenter[1]).to.to.approximately(preDefinedCenter[1], 0.01)
            })

            cy.log(
                'We ensure that when a center is defined, we are on that center on application startup'
            )
            cy.goToMapView({
                layers: `${standardLayer}@features=1:2:3:4:5:6:7:8:9:10`,
                center: `${preDefinedCenter.join(',')}`,
            })
            cy.readStoreValue('state.position.center').should((storeCenter) => {
                expect(storeCenter.length).to.eq(2)
                expect(storeCenter[0]).to.to.approximately(preDefinedCenter[0], 0.01)
                expect(storeCenter[1]).to.to.approximately(preDefinedCenter[1], 0.01)
            })
        })
        it.skip('Adds pre-selected features and place the tooltip according to URL param on a bigger screen', () => {
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
                queryParams: {
                    layers: `${standardLayer};${timeLayer}@year=2018,f`,
                },
            })
            cy.url().should((url) => {
                expect(new URLSearchParams(url.split('map')[1]).get('featureInfo')).to.eq(null)
            })

            cy.log('Check that the features appear in the URL')
            assertDefined(expectedFeatureIds[0])
            createInterceptWithFeatureId(expectedFeatureIds[0], standardLayer)

            cy.get(mapSelector).click()
            cy.wait(`@${standardLayer}_identify`)
            cy.wait(`@htmlPopup`)

            cy.url().should((url) => {
                expect(new URLSearchParams(url.split('map')[1]).get('featureInfo')).to.eq('bottomPanel')
            })
            cy.url().should((url) => {
                new URLSearchParams(url.split('map')[1])
                    .get('layers')!
                    .split(';')
                    .forEach((layerParam) => {
                        const layerAndAttributes = layerParam.split('@')
                        if (layerAndAttributes[0] === standardLayer) {
                            const featureAttribute = layerAndAttributes
                                .find((attribute) => attribute.startsWith('features'))
                                ?.split('=')
                            expect(featureAttribute![1]).to.eq(`${expectedFeatureIds[0]}`)
                        }
                    })
            })
            // ------------------------------------------------------------------------------------------------
            cy.log('Check that clicking another feature from the same layer changes the URL')
            assertDefined(expectedFeatureIds[1])
            createInterceptWithFeatureId(expectedFeatureIds[1], standardLayer)

            cy.get(mapSelector).click(100, 100)
            cy.wait(`@${standardLayer}_identify`)
            cy.wait(`@htmlPopup`)

            cy.url().should((url) => {
                new URLSearchParams(url.split('map')[1])
                    .get('layers')!
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

            cy.log('Check that after a reload, features remain selected')
            cy.reload()
            cy.waitMapIsReady()
            cy.wait(`@featureDetail_${expectedFeatureIds[1]}`)
            cy.readStoreValue('getters.selectedFeatures').should((features) => {
                expect(features.length).to.eq(1)
                expect(features[0].id).to.eq(`${expectedFeatureIds[1]}`)
            })
            /*
            TODO PB-1889:
            This test is flaky. When reloading, and only in the test environment, the feature
            selected is still present in the store but not in the URL. It doesn't happen on the
            viewer itself, either locally, in dev or in prod.
            It became flaky with the fix to PB-1875, as the re-centering forced the mutation and URL
            change to be taken into account. Currently, in the tests, the feature selected exists in
            the store but not in the URL.
            cy.url().should((url) => {
                new URLSearchParams(url.split('map')[1])
                    .get('layers')!
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

            cy.log('Selecting feature from another layer which is time enabled')
            assertDefined(expectedFeatureIds[0])
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
                    .get('layers')!
                    .split(';')
                    .forEach((layerParam) => {
                        const splittedParam = layerParam.split('@')
                        if (splittedParam[0] === timeLayer) {
                            expect(splittedParam.length).to.eq(3)
                            expect(splittedParam.includes('year=2018')).to.eq(true)
                            expect(splittedParam.includes(`features=${expectedFeatureIds[0]}`)).to.eq(true)
                        } else {
                            expect(splittedParam.length).to.eq(1)
                        }
                    })
            })

            cy.log('Check that upon closing, the features are no longer in the URL')
            cy.get('[data-cy="infobox-close"]').click()
            cy.get('[data-cy="highlighted-features"]').should('not.exist')

            cy.url().should((url) => {
                const layer = new URLSearchParams(url.split('map')[1]).get('layers')!.split('@features')
                expect(layer.length).to.eq(1)
            })

            cy.log(
                'Check that reloading when there is no feature selected does not add back a previously selected feature'
            )
            cy.reload()
            cy.get('[data-cy="highlighted-features"]').should('not.exist')

            cy.url().should((url) => {
                const layer = new URLSearchParams(url.split('map')[1]).get('layers')!.split('@features')
                expect(layer.length).to.eq(1)
            })
        })

        it('Adds pre-selected features and verifys the translation of the feature text after changing the language', () => {
            cy.log('Open the map with a feature preselected in english')
            goToMapViewWithFeatureSelection(FeatureInfoPositions.DEFAULT)
            checkFeatures()
            checkFeatureInfoPosition(FeatureInfoPositions.BOTTOMPANEL)

            cy.wait(`@htmlPopup`)

            cy.get('[data-cy="feature-list-category-title"]').contains('Kultur Gueter')
            cy.get('[data-cy="feature-detail-htmlpopup-container"]')
                .should('have.length', 1)
                .should('contain', 'Description')
                .should('contain', 'Y-Coordinate')
                .should('contain', 'X-Coordinate')
                .should('contain', 'City')
                .should('contain', 'Canton')
                .should('contain', "I'm a test window")
                .should('contain', 'More info')

            cy.log('verifying that the left table cell is not too close to the right table cell')
            cy.get(`[data-cy="htmlpopup-container_cell-left"]`).should('have.css', 'padding-right', '10px')

            cy.intercept('**/rest/services/all/MapServer/layersConfig?lang=de**', {
                fixture: 'layers-german.fixture',
            }).as('layersConfigDe')
            cy.intercept('**/MapServer/**/htmlPopup?**lang=de**', {
                fixture: 'html-popup-german.fixture.html',
            }).as('htmlPopupDe')

            cy.clickOnLanguage('de')
            cy.closeMenuIfMobile()

            cy.wait(`@htmlPopupDe`)
            cy.wait(`@layersConfigDe`)

            cy.log('checking that the feature was translated to german')

            cy.get('[data-cy="highlighted-features"]').as('highlightedFeatures').should('be.visible')

            cy.get('[data-cy="feature-list-category-title"]').contains('Kultur Gueter DE')
            cy.get('[data-cy="feature-detail-htmlpopup-container"]')
                .should('have.length', 1)
                .should('contain', 'Beschreibung')
                .should('contain', 'Y-Koordinate')
                .should('contain', 'X-Koordinate')
                .should('contain', 'Stadt')
                .should('contain', 'Kanton')
                .should('contain', 'Ich bin ein Testfenster')
                .should('contain', 'Mehr Information')

            cy.log('verifying that the left table cell is not too close to the right table cell')
            cy.get(`[data-cy="htmlpopup-container_cell-left"]`).should('have.css', 'padding-right', '10px')
        })
    })

    context('Feature identification on the map', () => {
        function drawRectangleOnMap(pixelsAroundCenter: { x: number; y: number }): void {
            cy.get('@olMap').then((olMapElement: JQuery<HTMLElement>) => {
                const elementSize = {
                    width: olMapElement.width(),
                    height: olMapElement.height(),
                }
                assertDefined(elementSize.width)
                assertDefined(elementSize.height)
                cy.get('@olMap').realMouseDown({
                    x: elementSize.width / 2.0 - pixelsAroundCenter.x / 2.0,
                    y: elementSize.height / 2.0 - pixelsAroundCenter.y / 2.0,
                    position: 'center',
                    ctrlKey: true,
                })
                cy.get('@olMap').realMouseMove(pixelsAroundCenter.x / 2.0, pixelsAroundCenter.y / 2.0, {
                    position: 'center',
                    ctrlKey: true,
                })
                cy.get('@olMap').realMouseUp({
                    x: elementSize.width / 2.0 + pixelsAroundCenter.x / 2.0,
                    y: elementSize.height / 2.0 + pixelsAroundCenter.y / 2.0,
                    position: 'center',
                    ctrlKey: true,
                })
            })
        }

        function clickOnMap(location: number[], ctrlKey = false): void {
            assertDefined(location[0])
            assertDefined(location[1])
            cy.get('@olMap').click(location[0], location[1], { ctrlKey })
        }

        it('can select an area to identify features inside it', () => {
            const fileName = 'external-kml-file.kml'
            const localKmlFile = `import-tool/${fileName}`
            cy.goToMapView({ queryParams: { layers: 'test.wms.layer' } })
            cy.wait(['@routeChange', '@layerConfig', '@topics', '@topic-ech'])

            const featureCountWithKml = DEFAULT_FEATURE_COUNT_RECTANGLE_SELECTION + 1
            cy.openMenuIfMobile()
            cy.get('[data-cy="menu-tray-tool-section"]:visible').click()
            cy.get('[data-cy="menu-advanced-tools-import-file"]:visible').click()
            cy.get('[data-cy="import-file-local-btn"]:visible').click()

            cy.fixture(localKmlFile).as('kmlFile')
            cy.get('[data-cy="file-input"]').selectFile(
                { contents: '@kmlFile', fileName: fileName },
                { force: true }
            )

            cy.get('[data-cy="import-file-load-button"]:visible').click()

            cy.wait(['@icon-sets', '@icon-set-babs', '@icon-set-default'])

            cy.get('[data-cy="file-input-text"]').should('contain.value', fileName)
            cy.get('[data-cy="import-file-close-button"]:visible').click()
            cy.readStoreValue('state.layers.activeLayers.length').should('eq', 2)
            cy.readStoreValue('getters.visibleLayers.length').should('eq', 2)

            cy.closeMenuIfMobile()

            cy.checkOlLayer([
                'test.background.layer2',
                { id: 'test.wms.layer', opacity: 0.75 },
                fileName,
            ])

            cy.get('[data-cy="ol-map"]').as('olMap').should('be.visible')
            cy.log(
                'Selecting a rectangle (by click&drag) while pressing SHIFT, should start a rectangle identification of features'
            )
            drawRectangleOnMap({
                x: 100,
                y: 100,
            })

            cy.log('making sure 51 items are requested when selecting a dragbox on the map')
            cy.wait('@identify').its('request.query.limit').should('eq', `${DEFAULT_FEATURE_COUNT_RECTANGLE_SELECTION}`)
            for (let featureCount = 0; featureCount < DEFAULT_FEATURE_COUNT_RECTANGLE_SELECTION; featureCount++) {
                cy.wait(`@htmlPopup`)
            }

            cy.log('scrolling down at the bottom of the list')
            cy.get('[data-cy="highlighted-features"]').as('highlightedFeatures').should('be.visible')
            cy.log('checking that each feature has been rendered in the list')
            cy.get('@highlightedFeatures')
                .find('[data-cy="feature-item"]')
                .should('have.length', featureCountWithKml)
            cy.get('[data-cy="feature-list-inner"]').scrollTo('bottom')

            cy.get('[data-cy="feature-list-load-more"]').as('loadMore').should('be.visible')
            cy.get('@loadMore').click()
            cy.wait('@routeChange')
            cy.wait('@identify')
                .its('request.query')
                .should((query: { limit: number, offset: number }) => {
                    expect(query.limit).to.eq(`${DEFAULT_FEATURE_COUNT_RECTANGLE_SELECTION}`)
                    expect(query.offset).to.eq(`${DEFAULT_FEATURE_COUNT_RECTANGLE_SELECTION}`)
                })

            for (let featureCount = 0; featureCount < DEFAULT_FEATURE_COUNT_RECTANGLE_SELECTION; featureCount++) {
                cy.wait(`@htmlPopup`)
            }
            cy.get('@highlightedFeatures')
                .find('[data-cy="feature-item"]')
                .should('have.length', 2 * DEFAULT_FEATURE_COUNT_RECTANGLE_SELECTION + 1)

            cy.log('Sending an empty response for further identify')
            cy.intercept('**identify**', {
                results: [],
            }).as('noMoreResults')

            cy.get('[data-cy="feature-list-inner"]').scrollTo('bottom')
            cy.get('@loadMore').click()
            cy.wait('@noMoreResults')

            cy.get('@loadMore').should('not.exist')

            cy.log('verify that the feature selection is cleared for the layer when the layer is toggled off')
            cy.openMenuIfMobile()
            cy.get(`[data-cy^="button-toggle-visibility-layer-${'test.wms.layer'}-0"]`).click()
            cy.closeMenuIfMobile()
            cy.get('[data-cy="highlighted-features"]').as('highlightedFeatures').should('be.visible')
            cy.get('@highlightedFeatures').find('[data-cy="feature-item"]').should('have.length', 1)
            cy.wait('@routeChange')

            cy.log('sending a single feature as response, checking that the "Load more" button is not added')
            cy.goToMapView({ queryParams: { layers: 'test.wms.layer' } })
            cy.wait('@routeChange')

            cy.intercept('**identify**', {
                fixture: 'features/features.fixture',
            }).as('identifySingleFeature')

            drawRectangleOnMap({
                x: 30,
                y: 100,
            })
            cy.wait(['@identifySingleFeature', '@htmlPopup'])

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
                y: 100,
            })
            cy.wait('@emptyIdentify')
            cy.get('@highlightedFeatures').should('not.exist')

            cy.get('@routeChange.all').should('have.length', 6)
            cy.get('@layerConfig.all').should('have.length', 1)
            cy.get('@topics.all').should('have.length', 1)
            cy.get('@topic-ech.all').should('have.length', 1)
            cy.get('@htmlPopup.all').should('have.length', 101)
            cy.get('@noMoreResults.all').should('have.length', 1)
            cy.get('@identify.all').should('have.length', 2)
            cy.get('@identifySingleFeature.all').should('have.length', 1)
            cy.get('@emptyIdentify.all').should('have.length', 1)
        })

        it('can select feature by click, add more feature, and deselect feature', () => {
            const fileName = '4-points.kml'
            const localKmlFile = `import-tool/${fileName}`
            cy.goToMapView()
            cy.wait(['@routeChange', '@layerConfig', '@topics', '@topic-ech'])

            cy.openMenuIfMobile()
            cy.get('[data-cy="menu-tray-tool-section"]:visible').click()
            cy.get('[data-cy="menu-advanced-tools-import-file"]:visible').click()
            cy.get('[data-cy="import-file-local-btn"]:visible').click()

            cy.fixture(localKmlFile).as('kmlFile')
            cy.get('[data-cy="file-input"]').selectFile(
                { contents: '@kmlFile', fileName: fileName },
                { force: true }
            )

            cy.get('[data-cy="import-file-load-button"]:visible').click()

            cy.wait(['@icon-sets', '@icon-set-babs', '@icon-set-default'])

            cy.get('[data-cy="file-input-text"]').should('contain.value', fileName)
            cy.get('[data-cy="import-file-close-button"]:visible').click()
            cy.readStoreValue('state.layers.activeLayers.length').should('eq', 1)
            cy.readStoreValue('getters.visibleLayers.length').should('eq', 1)

            cy.closeMenuIfMobile()

            cy.checkOlLayer(['test.background.layer2', fileName])

            cy.get('[data-cy="ol-map"]').as('olMap').should('be.visible')
            cy.readStoreValue('getters.selectedFeatures.length').should('eq', 0)

            cy.window()
                .its('map')
                .then((olMap: Map) => {
                    const mapProjection: string = olMap.getView().getProjection().getCode()

                    const point1: [number, number] = [7.5176682524165095, 47.10172318866241]
                    const point3: [number, number] = [7.674246396589141, 46.759691186931235]

                    const pixel1 = olMap.getPixelFromCoordinate(proj4('EPSG:4326', mapProjection, point1))
                    const pixel3 = olMap.getPixelFromCoordinate(proj4('EPSG:4326', mapProjection, point3))

                    clickOnMap(pixel3, false)
                    cy.readStoreValue('getters.selectedFeatures.length').should('eq', 1)
                    clickOnMap(pixel1, true)
                    cy.readStoreValue('getters.selectedFeatures.length').should('eq', 2)
                    clickOnMap(pixel1, true)
                    cy.readStoreValue('getters.selectedFeatures.length').should('eq', 1)
                })
        })

        it('can print feature information', () => {
            const fileName = 'external-kml-file.kml'
            const localKmlFile = `import-tool/${fileName}`
            cy.goToMapView({ queryParams: { layers: 'test.wms.layer' } })
            cy.wait(['@routeChange', '@layerConfig', '@topics', '@topic-ech'])

            cy.openMenuIfMobile()
            cy.get('[data-cy="menu-tray-tool-section"]:visible').click()
            cy.get('[data-cy="menu-advanced-tools-import-file"]:visible').click()
            cy.get('[data-cy="import-file-local-btn"]:visible').click()

            cy.fixture(localKmlFile).as('kmlFile')
            cy.get('[data-cy="file-input"]').selectFile(
                { contents: '@kmlFile', fileName: fileName },
                { force: true }
            )

            cy.get('[data-cy="import-file-load-button"]:visible').click()
            cy.get('[data-cy="file-input-text"]').should('contain.value', fileName)

            cy.wait(['@icon-sets', '@icon-set-babs', '@icon-set-default'])

            cy.get('[data-cy="import-file-close-button"]:visible').click()
            cy.readStoreValue('state.layers.activeLayers.length').should('eq', 2)
            cy.readStoreValue('getters.visibleLayers.length').should('eq', 2)

            cy.closeMenuIfMobile()

            cy.checkOlLayer([
                'test.background.layer2',
                { id: 'test.wms.layer', opacity: 0.75 },
                fileName,
            ])

            cy.get('[data-cy="ol-map"]').as('olMap').should('be.visible')
            cy.log(
                'Selecting a rectangle (by click&drag) while pressing SHIFT, should start a rectangle identification of features'
            )
            drawRectangleOnMap({
                x: 10,
                y: 10,
            })

            cy.log('making sure 51 items are requested when selecting a dragbox on the map')
            cy.wait('@identify').its('request.query.limit').should('eq', `${DEFAULT_FEATURE_COUNT_RECTANGLE_SELECTION}`)
            for (let featureCount = 0; featureCount < DEFAULT_FEATURE_COUNT_RECTANGLE_SELECTION; featureCount++) {
                cy.wait(`@htmlPopup`)
            }
            cy.window().then((win) => {
                cy.stub(win, 'print').as('print')
            })
            cy.get('[data-cy=print-button]').should('be.visible').click()
            cy.get('[data-cy=highlighted-features]').should('have.length', 2)
            cy.get('[data-cy=feature-item]')
                .should('have.length', 102)
                .should('contain', 'Sample Placemark')
            cy.get('.htmlpopup-container')
                .should('have.length', 2)
                .should('contain', 'Title')
                .should('contain', 'Sample Placemark')
                .should('contain', 'Description')
                .should('contain', 'This is a sample KML Placemark.')
            cy.get('@print').should('be.calledOnce')
        })
    })
})