/// <reference types="cypress" />
import { LV95 } from '@/utils/coordinates/coordinateSystems'

describe('Testing of the compare slider', () => {
    context('Comportment of compare slider at startup', () => {
        context('Starting the app with different parameters', () => {
            it('Does not shows up when there are no layers and no compare slider parameter', () => {
                cy.goToMapView()
                cy.readStoreValue('state.ui.compareRatio').then((compareRatio) => {
                    expect(compareRatio).to.eq(-0.5)
                })

                cy.get('[data-cy="compare_slider"]').should('not.exist')
            })
            it('does not shows up with layers, but no compare slider parameter', () => {
                cy.goToMapView({
                    layers: ['test-1.wms.layer', 'test-2.wms.layer,,'].join(';'),
                })
                cy.readStoreValue('state.ui.compareRatio').then((compareRatio) => {
                    expect(compareRatio).to.eq(-0.5)
                })

                cy.get('[data-cy="compare_slider"]').should('not.exist')
            })
            it('shows up when there are layers and a compare slider parameter', () => {
                cy.goToMapView({
                    layers: ['test-1.wms.layer', 'test-2.wms.layer,,'].join(';'),
                    compare_ratio: '0.3',
                })
                cy.readStoreValue('state.ui.compareRatio').then((compareRatio) => {
                    expect(compareRatio).to.eq(0.3)
                })

                cy.get('[data-cy="compare_slider"]').should('be.visible')
            })
            it('does not shows up with layers and the compare ratio parameter out of bounds or not a number', () => {
                cy.goToMapView({
                    layers: ['test-1.wms.layer', 'test-2.wms.layer,,'].join(';'),
                    compare_ratio: '1.4',
                })
                cy.readStoreValue('state.ui.compareRatio').then((compareRatio) => {
                    expect(compareRatio).to.eq(-0.5)
                })

                cy.get('[data-cy="compare_slider"]').should('not.exist')
                cy.goToMapView({
                    layers: ['test-1.wms.layer', 'test-2.wms.layer,,'].join(';'),
                    compare_ratio: '-0.3',
                })
                cy.readStoreValue('state.ui.compareRatio').then((compareRatio) => {
                    expect(compareRatio).to.eq(-0.5)
                })
                cy.get('[data-cy="compare_slider"]').should('not.exist')
                cy.goToMapView({
                    layers: ['test-1.wms.layer', 'test-2.wms.layer,,'].join(';'),
                    compare_ratio: 'aRandomText',
                })
                cy.readStoreValue('state.ui.compareRatio').then((compareRatio) => {
                    expect(compareRatio).to.eq(-0.5)
                })
                cy.get('[data-cy="compare_slider"]').should('not.exist')
            })
            it('does not shows up with layers, a compare slider parameter set, but in 3d', () => {
                cy.goToMapView({
                    layers: ['test-1.wms.layer', 'test-2.wms.layer,,'].join(';'),
                    compare_ratio: '0.4',
                    showIn3d: 'true',
                })
                cy.readStoreValue('state.ui.compareRatio').then((compareRatio) => {
                    expect(compareRatio).to.eq(-0.5)
                })

                cy.get('[data-cy="compare_slider"]').should('not.exist')
            })
        })
    })

    context('Tests to check if the compare slider is functional', () => {
        const feature_layer_1 = {
            geometry: {
                type: 'Point',
                coordinates: [LV95.bounds.center[0], LV95.bounds.center[1]],
            },
            layerBodId: 'ch.swisstopo.test.1',
            bbox: [
                LV95.bounds.center[0] - 1000,
                LV95.bounds.center[1] - 1000,
                LV95.bounds.center[0] + 1000,
                LV95.bounds.center[1] + 1000,
            ],
            featureId: 1234,
            layerName: 'A nice test layer',
            type: 'Feature',
            id: 1234,
            properties: {
                zkob: 'This is a test feature',
                link_title: 'This is a test feature',
                link_uri: 'http://localhost:8080/',
                link_2_title: null,
                link_2_uri: null,
                link_3_title: 'This is a test feature',
                link_3_uri: null,
                label: 'This is a test feature',
                pdf_list: null,
                x: 1234.0,
                y: 1234.0,
            },
        }
        const feature_layer_2 = {
            geometry: {
                type: 'Point',
                coordinates: [LV95.bounds.center[0], LV95.bounds.center[1] + 100],
            },
            layerBodId: 'ch.babs.kulturgueter',
            bbox: [
                LV95.bounds.center[0] - 1000,
                LV95.bounds.center[1] - 1000,
                LV95.bounds.center[0] + 1000,
                LV95.bounds.center[1] + 1000,
            ],
            featureId: 1234,
            layerName: 'A nice test layer',
            type: 'Feature',
            id: 1234,
            properties: {
                zkob: 'This is a test feature',
                link_title: 'This is a test feature',
                link_uri: 'http://localhost:8080/',
                link_2_title: null,
                link_2_uri: null,
                link_3_title: 'This is a test feature',
                link_3_uri: null,
                label: 'This is a test feature',
                pdf_list: null,
                x: 1234.0,
                y: 1234.0,
            },
        }
        context('Moving the compare slider', () => {
            it('moves when we click on it and drag the mouse', () => {
                cy.goToMapView({
                    layers: 'test-1.wms.layer',
                    compare_ratio: '0.5',
                })
                const sliderStyle = getComputedStyle(cy.get('[data-cy="compare_slider"]'))

                cy.readStoreValue('state.ui.compareRatio').then((compareRatio) => {
                    expect(compareRatio).to.eq(0.5)
                })

                expect(sliderStyle.left).to.be.eq(
                    cy.readStoreValue('state.ui.clientWidth').then((width) => {
                        return width / 2
                    })
                )
                cy.get('[data-cy="compare_slider"]')
                    .should('be.visible')
                    .trigger('mousedown', { which: 1 })
                cy.get('[data-cy="compare_slider"]').trigger('mousemove', {
                    screenX: Math.abs(40),
                    screenY: 0,
                })
                cy.readStoreValue('state.ui.compareRatio').then((compareRatio) => {
                    expect(compareRatio).to.eq(0.5)
                })
                expect(sliderStyle.left).to.eq(40)
                cy.get('[data-cy="compare_slider"]').trigger('mouseup', { force: true })

                expect(sliderStyle.left).to.eq(40)
                cy.readStoreValue('state.ui.compareRatio').then((compareRatio) => {
                    expect(compareRatio).to.be.lessThanOrEqual(
                        cy.readStoreValue('state.ui.clientWidth').then((width) => {
                            return 40.0 / width
                        })
                    )
                })
            })
            it('refuses to get out of bounds when we move around', () => {
                cy.goToMapView({
                    layers: 'test-1.wms.layer',
                    compare_ratio: '0.5',
                })
                const sliderStyle = getComputedStyle(cy.get('[data-cy="compare_slider"]'))

                cy.readStoreValue('state.ui.compareRatio').then((compareRatio) => {
                    expect(compareRatio).to.eq(0.5)
                })
                cy.get('[data-cy="compare_slider"').should('have.css', 'left', '50%')
                cy.get('[data-cy="compare_slider"]')
                    .should('be.visible')
                    .trigger('mousedown', { which: 1 })
                cy.get('[data-cy="compare_slider"]').trigger('mousemove', {
                    screenX: Math.abs(
                        cy.readStoreValue('state.ui.clientWidth').then((width) => {
                            return width
                        })
                    ),
                    screenY: 0,
                })
                expect(sliderStyle.left).to.be.eq(
                    cy.readStoreValue('state.ui.clientWidth').then((width) => {
                        return width - 36
                    })
                )
                cy.get('[data-cy="compare_slider"]').trigger('mouseup', { force: true })
                cy.readStoreValue('state.ui.compareRatio').then((compareRatio) => {
                    expect(compareRatio).to.be.lessThan(1.0)
                    expect(compareRatio).to.be.greaterThan(0.9)
                })
                cy.get('[data-cy="compare_slider"]')
                    .should('be.visible')
                    .trigger('mousedown', { which: 1 })
                cy.get('[data-cy="compare_slider"]').trigger('mousemove', {
                    screenX: 0,
                    screenY: 0,
                })
                expect(sliderStyle.left).to.be.eq(1)
                cy.get('[data-cy="compare_slider"]').trigger('mouseup', { force: true })
                cy.readStoreValue('state.ui.compareRatio').then((compareRatio) => {
                    expect(compareRatio).to.be.greaterThan(0.0)
                    expect(compareRatio).to.be.lessThan(0.1)
                })
            })

            it.skip('cuts from the correct spot until the end of the map, and only from the top layer', () => {
                const layerIds = ['test1.wms.layer', 'test2.wms.layer']
                const layer1 = layerIds[0]
                const layer2 = layerIds[1]
                cy.intercept('**/MapServer/identify**', { results: [feature_layer_1] })
                cy.intercept(`**/MapServer/${layer1}/**geometryFormat**`, feature_layer_1)
                cy.intercept(`**/MapServer/${layer2}/**geometryFormat**`, feature_layer_2)
                cy.intercept('**/MapServer/**/htmlPopup**', {
                    fixture: 'html-popup.fixture.html',
                })
                cy.goToMapView({
                    layers: layerIds.join(';'),
                    compare_ratio: '0.5',
                })
                cy.get('[data-cy="compare_slider"]')
                    .should('be.visible')
                    .trigger('mousedown', { which: 1 })
                cy.get('[data-cy="compare_slider"]').trigger('mousemove', {
                    screenX: 15,
                    screenY: 0,
                })
                cy.get['ol-map'].click(LV95.bounds.center[0], LV95.bounds.center[1])
                cy.waitUntilState((state) => {
                    return state.features.selectedFeatures.length > 0
                })
                cy.get('[data-cy="highlighted-features"]').should('be.visible')
                cy.get['ol-map'].click(LV95.bounds.center[0], LV95.bounds.center[1] + 100)
                cy.waitUntilState((state) => {
                    return state.features.selectedFeatures.length > 0
                })
                cy.get('[data-cy="highlighted-features"]').should('be.visible')

                cy.get('[data-cy="compare_slider"]').trigger('mousemove', {
                    screenX: cy.readStoreValue('state.ui.clientWidth').then((width) => {
                        return width
                    }),
                    screenY: 0,
                })
                cy.get['ol-map'].click(LV95.bounds.center[0], LV95.bounds.center[1] + 100)
                cy.waitUntilState((state) => {
                    return state.features.selectedFeatures.length > 0
                })
                cy.get('[data-cy="highlighted-features"]').should('be.visible')
                cy.get['ol-map'].click(LV95.bounds.center[0], LV95.bounds.center[1])
                cy.waitUntilState((state) => {
                    return state.features.selectedFeatures.length == 0
                })
                cy.get('[data-cy="highlighted-features"]').should('not.be.visible')
            })
        })

        context.skip('Changing Layers while the compare slider is active', () => {
            const layerIds = ['test1.wms.layer', 'test2.wms.layer']
            const layer1 = layerIds[0]
            const layer2 = layerIds[1]
            beforeEach(() => {
                cy.intercept('**/MapServer/identify**', { results: [feature_layer_1] })
                cy.intercept(`**/MapServer/${layer1}/**geometryFormat**`, feature_layer_1)
                cy.intercept(`**/MapServer/${layer2}/**geometryFormat**`, feature_layer_2)
                cy.intercept('**/MapServer/**/htmlPopup**', {
                    fixture: 'html-popup.fixture.html',
                })
            })
            it('Changes the layer cut when we switch the layer order and a new one is on top', () => {
                cy.goToMapView({
                    layers: layerIds.join(';'),
                    compare_ratio: '0.3',
                })
                // We check here that feature 2 is present, but feature 1 is not
                cy.get['ol-map'].click(LV95.bounds.center[0], LV95.bounds.center[1] + 100)
                cy.waitUntilState((state) => {
                    return state.features.selectedFeatures.length > 0
                })
                cy.get('[data-cy="highlighted-features"]').should('be.visible')
                cy.get['ol-map'].click(LV95.bounds.center[0], LV95.bounds.center[1])
                cy.waitUntilState((state) => {
                    return state.features.selectedFeatures.length == 0
                })
                cy.get('[data-cy="highlighted-features"]').should('not.be.visible')

                cy.get(`[data-cy="button-lower-order-layer-${layer1}"]`)
                    .should('be.visible')
                    .click()
                // We check here that feature 1 is present, but feature 2 is not
                cy.get['ol-map'].click(LV95.bounds.center[0], LV95.bounds.center[1])
                cy.waitUntilState((state) => {
                    return state.features.selectedFeatures.length > 0
                })
                cy.get('[data-cy="highlighted-features"]').should('be.visible')
                cy.get['ol-map'].click(LV95.bounds.center[0], LV95.bounds.center[1] + 100)
                cy.waitUntilState((state) => {
                    return state.features.selectedFeatures.length == 0
                })
                cy.get('[data-cy="highlighted-features"]').should('not.be.visible')
            })
            it('Changes the layer cut when we remove the top feature', () => {
                cy.goToMapView({
                    layers: layerIds.join(';'),
                    compare_ratio: '0.3',
                })
                cy.clickOnMenuButtonIfMobile()
                cy.get(`[data-cy="button-toggle-visibility-layer-${layer1}"`)
                    .should('be.visible')
                    .click()
                cy.get['ol-map'].click(LV95.bounds.center[0], LV95.bounds.center[1] + 100)
                // maybe wait a bit here
                cy.get('[data-cy="highlighted-features"]').should('not.be.visible')
            })
            it('Removes the compare slider when we remove the last layer', () => {
                cy.goToMapView({
                    layers: layerIds[0],
                    compare_ratio: '0.5',
                })
                cy.get(`[data-cy="button-toggle-visibility-layer-${layer1}"`)
                cy.get('[data-cy="compare_slider"]').should('not.exist')
            })
        })

        context('Compare Slider behaviour when switching between 2d and 3d', () => {
            it('Stops showing the compare slider when it is active and we switch to 3d, and should not show it again on switching back', () => {
                cy.goToMapView({
                    layers: 'test-1.wms.layer',
                    compare_ratio: '0.5',
                })
                cy.get('["data-cy=compare_slider"]').should('be.visible')
                cy.get('[data-cy="3d-button"]').click()
                cy.get('["data-cy=compare_slider"]').should('not.be.visible')
                cy.get('[data-cy="3d-button"]').click()
                cy.get('["data-cy=compare_slider"]').should('not.be.visible')
            })
        })
    })
    context('Advanced Menu interactions regarding the compare slider', () => {
        context(
            'Checking if the compare menu shows up, and try to use the compare menu toggle when it is available',
            () => {
                it('does not appear when there are no layers', () => {
                    cy.goToMapView()
                    cy.clickOnMenuButtonIfMobile()
                    cy.get('[data-cy="menu-tray-tool-section"]').click()
                    cy.get('[data-cy="menu-advanced-tools-Compare"]').should('not.be.visible')
                })
                it('appears and is functional when layers are present in 2d', () => {
                    cy.goToMapView({
                        layers: ['test-1.wms.layer', 'test-2.wms.layer,,'].join(';'),
                        compare_ratio: '0.3',
                    })
                    cy.clickOnMenuButtonIfMobile()
                    cy.get('[data-cy="menu-tray-tool-section"]').click()
                    cy.get('[data-cy="menu-advanced-tools-Compare"]').should('be.visible')
                    cy.readStoreValue('state.ui.compareRatio').then((compareRatio) => {
                        expect(compareRatio).to.eq(0.3)
                    })

                    cy.get('[data-cy="menu-advanced-tools-Compare"]').click()
                    cy.readStoreValue('state.ui.compareRatio').then((compareRatio) => {
                        expect(compareRatio).to.eq(-0.5)
                    })

                    cy.get('[data-cy="menu-advanced-tools-Compare"]').click()
                    cy.readStoreValue('state.ui.compareRatio').then((compareRatio) => {
                        expect(compareRatio).to.eq(0.5)
                    })
                })
                it('disappears when we remove the last layer', () => {
                    const layerId = 'test-1.wms.layer'
                    cy.goToMapView({
                        layers: layerId,
                    })
                    cy.clickOnMenuButtonIfMobile()
                    cy.get('[data-cy="menu-tray-tool-section"]').click()
                    cy.get('[data-cy="menu-advanced-tools-Compare"]').should('be.visible')
                    cy.get(`[data-cy="button-toggle-visibility-layer-${layerId}"]`)
                        .should('be.visible')
                        .click()
                    cy.get('[data-cy="menu-advanced-tools-Compare"]').should('not.be.visible')
                })
                it('disappears when it is available in 2d and we swith to 3d', () => {
                    cy.goToMapView({
                        layers: 'test-1.wms.layer',
                    })
                    cy.clickOnMenuButtonIfMobile()
                    cy.get('[data-cy="menu-tray-tool-section"]').click()
                    cy.get('[data-cy="menu-advanced-tools-Compare"]').should('be.visible')
                    cy.get('[data-cy="3d-button"]').click()
                    cy.get('[data-cy="menu-advanced-tools-Compare"]').should('not.be.visible')
                })
                it('becomes available when we are in 3d and we switch to 2d', () => {
                    cy.goToMapView({
                        layers: 'test-1.wms.layer',
                        '3d': 'true',
                    })
                    cy.clickOnMenuButtonIfMobile()
                    cy.get('[data-cy="menu-tray-tool-section"]').click()
                    cy.get('[data-cy="menu-advanced-tools-Compare"]').should('not.be.visible')
                    cy.get('[data-cy="3d-button"]').click()
                    cy.get('[data-cy="menu-advanced-tools-Compare"]').should('be.visible')
                })
            }
        )
    })
})

describe('Tests to check if the compare slider is functional', () => {})
