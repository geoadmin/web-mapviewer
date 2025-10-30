/// <reference types="cypress" />

import type { Viewer } from "cesium"

import useLayersStore from '@/store/modules/layers'

function expectLayerCountToBe(viewer: Viewer, layerCount: number) {
    const layers = viewer.scene.imageryLayers
    expect(layers.length).to.eq(
        layerCount,
        `Wrong layer count. Expected ${layerCount} but got ${layers.length}.`
    )
}
describe('Testing the feature selection in 3D', () => {
    context('Feature identification on the cesium map', () => {
        it('can select a KML feature', () => {
            const FEATURE_COUNT = 11
            // Import KML file
            cy.log('Importing KML file')
            const fileName = 'external-kml-file.kml'
            const localKmlFile = `import-tool/${fileName}`
            cy.goToMapView({
                queryParams: {
                    '3d': true,
                    layers: 'test.wms.layer',
                }
            },
            )
            cy.waitUntilCesiumTilesLoaded()


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
            cy.get('[data-cy="import-file-close-button"]:visible').click()
            cy.getPinia().then((pinia) => {
                const layersStore = useLayersStore(pinia)
                expect(layersStore.activeLayers.length).to.eq(2)
                expect(layersStore.visibleLayers.length).to.eq(2)
            })

            cy.closeMenuIfMobile()

            cy.log('Verifying that the KML layer is loaded')
            cy.window().its('cesiumViewer').then((viewer) => {
                expectLayerCountToBe(viewer, 2)
                expect(viewer.dataSources.length).to.eq(1)
                const kmlLayer = viewer.dataSources.get(0)
                expect(kmlLayer.show).to.eq(true)
            })

            cy.log('Selecting a feature')
            cy.get('[data-cy="cesium-map"] .cesium-viewer').click(160, 270)
            cy.wait('@identify')
            cy.wait(`@htmlPopup`)
            cy.get('[data-cy="highlighted-features"]')
                .as('highlightedFeatures')
                .should('be.visible')
            cy.get('@highlightedFeatures')
                .find('[data-cy="feature-item"]')
                .should('have.length', FEATURE_COUNT)

            cy.log('Switching to 2D to verify that the feature is still selected')
            cy.get('[data-cy="3d-button"]').click()
            cy.get('@highlightedFeatures')
                .find('[data-cy="feature-item"]')
                .should('be.visible')
                .should('have.length', FEATURE_COUNT)

            cy.log('Switching to 3D to verify that the feature is still selected')
            cy.get('[data-cy="3d-button"]').click()
            cy.waitUntilCesiumTilesLoaded()

            cy.get('@highlightedFeatures')
                .find('[data-cy="feature-item"]')
                .should('be.visible')
                .should('have.length', FEATURE_COUNT)
        })
    })
})
