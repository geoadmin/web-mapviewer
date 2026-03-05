/// <reference types="cypress" />
function expectLayerCountToBe(viewer, layerCount) {
    const layers = viewer.scene.imageryLayers
    const layerUrls = []
    for (let i = 0; i < layers.length; i++) {
        layerUrls.push(layers.get(i).imageryProvider.url)
    }
    expect(layers.length).to.eq(
        layerCount,
        `Wrong layer count. Expected ${layerCount} but got ${layers.length}. Layers: \n${layerUrls.join('\n')}`
    )
}
describe('Testing the feature selection in 3D', () => {
    context('Feature identification on the cesium map', () => {
        it('can select features in a WMS and a KML', () => {
            cy.goToMapView({
                '3d': true,
                layers: 'test.wms.layer',
            })
            cy.waitUntilCesiumTilesLoaded()

            cy.log('Importing KML file')
            const fileName = 'external-kml-file.kml'
            const localKmlFile = `import-tool/${fileName}`
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
            cy.closeMenuIfMobile()

            cy.log('Verifying that the KML layer is loaded')
            cy.readStoreValue('state.layers.activeLayers.length').should('eq', 2)
            cy.readStoreValue('getters.visibleLayers.length').should('eq', 2)

            cy.readWindowValue('cesiumViewer').should((viewer) => {
                expectLayerCountToBe(viewer, 2)
                expect(viewer.dataSources.length).to.eq(1)
                const kmlLayer = viewer.dataSources.get(0)
                expect(kmlLayer.show).to.eq(true)
            })
            // The KML has not been centered on the view yet, and I could not find an event or anything like that to wait upon.
            // So we wait for an arbitrary amount of time here.
            // eslint-disable-next-line cypress/no-unnecessary-waiting
            cy.wait(2500)

            cy.log('Selecting a feature')
            const FEATURE_COUNT = 11
            cy.get('[data-cy="cesium-map"]').click(160, 270)
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
