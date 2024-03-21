/// <reference types="cypress" />
import { WEBMERCATOR } from '@/utils/coordinates/coordinateSystems'

describe('Testing of the compare slider', () => {
    function expectCompareRatioToBe(value) {
        if (!value) {
            cy.readStoreValue('state.ui.compareRatio').should('be.null')
        } else {
            cy.readStoreValue('state.ui.compareRatio').should('be.equal', value)
        }
    }
    //active is the boolean
    function expectCompareSliderToBeActive(active) {
        cy.readStoreValue('state.ui.isCompareSliderActive').should('be.equal', active)
    }
    context('Comportment of compare slider at startup', () => {
        context('Starting the app with different parameters', () => {
            it('does not shows up at startup with no compare slider parameter', () => {
                cy.goToMapView(
                    {
                        layers: ['test-1.wms.layer', 'test-2.wms.layer,,'].join(';'),
                    },
                    true
                )

                expectCompareRatioToBe(null)
                expectCompareSliderToBeActive(false)
                cy.get('[data-cy="compareSlider"]').should('not.exist')
            })
            it('does not shows up with layers and the compare ratio parameter out of bounds or not a number', () => {
                cy.goToMapView(
                    {
                        layers: ['test-1.wms.layer', 'test-2.wms.layer,,'].join(';'),
                        compareRatio: '1.4',
                    },
                    true
                )
                expectCompareRatioToBe(null)
                expectCompareSliderToBeActive(false)

                cy.get('[data-cy="compareSlider"]').should('not.exist')
                cy.goToMapView(
                    {
                        layers: ['test-1.wms.layer', 'test-2.wms.layer,,'].join(';'),
                        compareRatio: '-0.3',
                    },
                    true
                )
                expectCompareRatioToBe(null)
                expectCompareSliderToBeActive(false)

                cy.get('[data-cy="compareSlider"]').should('not.exist')
                cy.goToMapView(
                    {
                        layers: ['test-1.wms.layer', 'test-2.wms.layer,,'].join(';'),
                        compareRatio: 'aRandomText',
                    },
                    true
                )
                expectCompareRatioToBe(null)
                expectCompareSliderToBeActive(false)

                cy.get('[data-cy="compareSlider"]').should('not.exist')
            })
        })
    })

    context('Tests to check if the compare slider is functional', () => {
        function moveSlider(x) {
            /*
                This function moves the slider so the 'left' position of the element will be at x.
                The slider is 40 px wide and we drag it from the center.
            */
            cy.get('[data-cy="compareSlider"]').trigger('mousedown', { button: 0 })
            cy.get('[data-cy="compareSlider"]').trigger('mousemove', {
                clientX: Math.abs(x + 20),
                clientY: 100,
            })
            cy.get('[data-cy="compareSlider"]').trigger('mouseup', { force: true })
        }
        context('Moving the compare slider', () => {
            it('moves when we click on it and drag the mouse', () => {
                cy.goToMapView(
                    {
                        layers: 'test-1.wms.layer',
                        compareRatio: '0.3',
                    },
                    true
                )
                // initial slider position is width * 0.3 -20
                cy.get('[data-cy="compareSlider"]').then((slider) => {
                    cy.readStoreValue('state.ui.width').then((width) => {
                        cy.wrap(slider.position()['left']).should('eq', width * 0.3 - 20)
                    })
                })
                expectCompareRatioToBe(0.3)
                expectCompareSliderToBeActive(true)
                cy.get('[data-cy="compareSlider"]').should('be.visible')
                moveSlider(73)
                cy.get('[data-cy="compareSlider"]').then((slider) => {
                    cy.wrap(slider.position()['left']).should('be.closeTo', 73.0, 0.2)
                })

                cy.log('It refuses to get out of bounds when we move around')
                moveSlider(-10)
                cy.get('[data-cy="compareSlider"]').then((slider) => {
                    //it stops at around 5.999, so we ensure this does not make the test fail, while still being close enough to be relevant

                    cy.wrap(slider.position()['left']).should('be.closeTo', -6.0, 0.2)
                    cy.wrap(slider.position()['left']).should('be.gte', -6.0)
                })

                cy.readStoreValue('state.ui.width').then((width) => {
                    moveSlider(width - 1)
                })

                cy.get('[data-cy="compareSlider"]').then((slider) => {
                    cy.readStoreValue('state.ui.width').then((width) => {
                        cy.wrap(slider.position()['left']).should('be.lte', width - 34.0)
                        cy.wrap(slider.position()['left']).should('be.closeTo', width - 34.0, 0.2)
                    })
                })
            })
        })
        /*
            in the current implementation, cutting a layer doesn't stop it from being selected
            (this is the exact same implementation here as in the old mapviewer). While the features
            are not visible, they are still selectable. Once we have a compare Slider which stops features
            from being selected when cut, we can reactivate the skipped tests here
        */

        context.skip('Cutting layers', () => {
            function checkIfFeaturesAreAt(x, y, expectFeatures) {
                cy.get['ol-map'].click(x, y)
                cy.expect(
                    cy.waitUntilState((state) => {
                        const numberOfFeatures = state.features.selectedFeatures.length
                        return expectFeatures ? numberOfFeatures > 0 : numberOfFeatures === 0
                    })
                ).to.be(true)
                if (expectFeatures) {
                    cy.get('[data-cy="highlighted-features"]').should('be.visible')
                } else {
                    cy.get('[data-cy="highlighted-features"]').should('not.be.visible')
                }
            }

            it('cuts from the correct spot until the end of the map, and only from the top layer', () => {
                let feature_layer_1
                let feature_layer_2
                cy.fixture('features.fixture.json').then((features) => {
                    feature_layer_1 = features['results'][0]
                    feature_layer_2 = features['results'][1]
                })
                const layerIds = ['test1.wms.layer', 'test2.wms.layer']
                const layer1 = layerIds[0]
                const layer2 = layerIds[1]
                const feature_1_coordinates = [
                    feature_layer_1.properties.x,
                    feature_layer_1.properties.y,
                ]
                const feature_2_coordinates = [
                    feature_layer_2.properties.x,
                    feature_layer_2.properties.y,
                ]
                cy.intercept('**/MapServer/identify**', { results: [feature_layer_1] })
                cy.intercept(`**/MapServer/${layer1}/**geometryFormat**`, feature_layer_1)
                cy.intercept(`**/MapServer/${layer2}/**geometryFormat**`, feature_layer_2)
                cy.intercept('**/MapServer/**/htmlPopup**', {
                    fixture: 'html-popup.fixture.html',
                })
                cy.goToMapView(
                    {
                        layers: layerIds.join(';'),
                        compareRatio: '0.5',
                    },
                    true
                )
                cy.log('changing the order of the layers and check which on is cut')

                // in initial state, only feature 2 should be visible
                checkIfFeaturesAreAt(feature_1_coordinates[0], feature_1_coordinates[1], true)
                checkIfFeaturesAreAt(feature_2_coordinates[0], feature_2_coordinates[1], false)
                cy.openMenuIfMobile()
                cy.get(`[data-cy^="button-lower-order-layer-${layer1}-"]`)
                    .should('be.visible')
                    .click()
                cy.closeMenuIfMobile()

                // We check here that feature 1 is present, but feature 2 is not
                checkIfFeaturesAreAt(feature_1_coordinates[0], feature_1_coordinates[1], false)
                checkIfFeaturesAreAt(feature_2_coordinates[0], feature_2_coordinates[1], true)
                // making a clean state for the next parts of the tests
                cy.openMenuIfMobile()
                cy.get(`[data-cy^="button-lower-order-layer-${layer2}-"]`)
                    .should('be.visible')
                    .click()
                cy.closeMenuIfMobile()

                cy.log('Moving the slider around and see what is cut')

                moveSlider(25)
                checkIfFeaturesAreAt(feature_1_coordinates[0], feature_1_coordinates[1], false)
                checkIfFeaturesAreAt(feature_2_coordinates[0], feature_2_coordinates[1], true)

                moveSlider(
                    cy.readStoreValue('state.ui.width').then((width) => {
                        return width - 10
                    })
                )

                checkIfFeaturesAreAt(feature_1_coordinates[0], feature_1_coordinates[1], true)
                checkIfFeaturesAreAt(feature_2_coordinates[0], feature_2_coordinates[1], true)

                // putting the slider back to the left
                moveSlider(25)
                cy.log(
                    'checking that if we remove a layer, the compare slider will cut the other layer'
                )
                cy.openMenuIfMobile()
                cy.get(`[data-cy^="button-toggle-visibility-layer-${layer1}-"`)
                    .should('be.visible')
                    .click()
                cy.closeMenuIfMobile()

                checkIfFeaturesAreAt(feature_1_coordinates[0], feature_1_coordinates[1], false)
                checkIfFeaturesAreAt(feature_2_coordinates[0], feature_2_coordinates[1], false)

                console.log(
                    'checking that we remove the compare slider upon removing the last visible layer'
                )
                cy.openMenuIfMobile()
                cy.get(`[data-cy^="button-toggle-visibility-layer-${layer2}-"`)
                    .should('be.visible')
                    .click()
                cy.closeMenuIfMobile()
                cy.get('[data-cy="compareSlider"]').should('not.exist')
            })
        })
    })

    context('Advanced Menu interactions regarding the compare slider', () => {
        context(
            'Checking if the compare menu shows up, and try to use the compare menu toggle when it is available',
            () => {
                it('appears and no change can be seen upon clicking it when there are no layers', () => {
                    // TODO : PB-262 : with stored ratio, we should be able to activate it,
                    // see it's red, and still not see the compare slider.
                    // So we'll need to check that the button color switched to red / the activated value is true
                    cy.goToMapView({}, true)
                    cy.openMenuIfMobile()
                    cy.get('[data-cy="menu-tray-tool-section"]').click()
                    cy.get('[data-cy="menu-advanced-tools-compare"]').click()
                    cy.readStoreValue('state.ui.compareRatio').then((compareRatio) => {
                        expect(compareRatio).to.eq(0.5)
                    })

                    cy.readStoreValue('state.ui.isCompareSliderActive').then((isSliderActive) => {
                        expect(isSliderActive).to.eq(true)
                    })
                    cy.get('[data-cy="compareSlider"]').should('not.exist')
                })
                it('stays "active" when we remove the last layer', () => {
                    cy.goToMapView({ layers: 'test-1.wms.layer', compareRatio: '0.3' }, true)
                    cy.openMenuIfMobile()
                    cy.readStoreValue('state.ui.compareRatio').then((compareRatio) => {
                        expect(compareRatio).to.eq(0.3)
                    })

                    cy.readStoreValue('state.ui.isCompareSliderActive').then((isSliderActive) => {
                        expect(isSliderActive).to.eq(true)
                    })
                    cy.get('[data-cy="compareSlider"]').should('be.visible')

                    cy.get(`[data-cy^="button-remove-layer-test-1.wms.layer-"]`)
                        .should('be.visible')
                        .click()

                    cy.readStoreValue('state.ui.compareRatio').then((compareRatio) => {
                        expect(compareRatio).to.eq(0.3)
                    })

                    cy.readStoreValue('state.ui.isCompareSliderActive').then((isSliderActive) => {
                        expect(isSliderActive).to.eq(true)
                    })
                    cy.get('[data-cy="compareSlider"]').should('not.exist')
                })
                it('appears and is functional when layers are present in 2d', () => {
                    cy.goToMapView(
                        {
                            layers: ['test-1.wms.layer', 'test-2.wms.layer,,'].join(';'),
                            compareRatio: '0.3',
                        },
                        true
                    )
                    cy.get('[data-cy="compareSlider"]').should('be.visible')
                    cy.openMenuIfMobile()
                    cy.get('[data-cy="menu-tray-tool-section"]').click()
                    cy.get('[data-cy="menu-advanced-tools-compare"]').should('be.visible')
                    cy.readStoreValue('state.ui.compareRatio').then((compareRatio) => {
                        expect(compareRatio).to.eq(0.3)
                    })

                    cy.readStoreValue('state.ui.isCompareSliderActive').then((isSliderActive) => {
                        expect(isSliderActive).to.eq(true)
                    })

                    cy.get('[data-cy="menu-advanced-tools-compare"]').click()
                    cy.readStoreValue('state.ui.compareRatio').then((compareRatio) => {
                        expect(compareRatio).to.eq(0.3)
                    })

                    cy.readStoreValue('state.ui.isCompareSliderActive').then((isSliderActive) => {
                        expect(isSliderActive).to.eq(false)
                    })
                    cy.get('[data-cy="compareSlider"]').should('not.exist')

                    cy.get('[data-cy="menu-advanced-tools-compare"]').click()
                    cy.readStoreValue('state.ui.compareRatio').then((compareRatio) => {
                        expect(compareRatio).to.eq(0.3)
                    })
                    cy.get('[data-cy="compareSlider"]').should('be.visible')
                })
            }
        )
    })
})

describe('The compare Slider and the menu elements should not be available in 3d', () => {
    context('compare slider non availability in 3d', () => {
        it('does not shows up with layers, a compare slider parameter set, but in 3d', () => {
            cy.goToMapView(
                {
                    layers: ['test-1.wms.layer', 'test-2.wms.layer,,'].join(';'),
                    compareRatio: '0.4',
                    '3d': true,
                    sr: WEBMERCATOR.epsgNumber,
                },
                true
            )
            cy.get('[data-cy="compareSlider"]').should('not.exist')

            cy.readStoreValue('state.ui.compareRatio').then((compareRatio) => {
                expect(compareRatio).to.eq(0.4)
            })
        })
    })
    context('Compare menu component with 3d', () => {
        it('disappears when it is available in 2d and we swith to 3d', () => {
            cy.goToMapView(
                {
                    sr: WEBMERCATOR.epsgNumber,
                },
                true
            )
            cy.openMenuIfMobile()
            cy.get('[data-cy="menu-tray-tool-section"]').click()
            cy.get('[data-cy="menu-advanced-tools-compare"]').should('be.visible')
            cy.closeMenuIfMobile()

            cy.get('[data-cy="3d-button"]').click()

            cy.openMenuIfMobile()

            cy.get('[data-cy="menu-advanced-tools-compare"]').should('not.exist')
        })
    })
})
