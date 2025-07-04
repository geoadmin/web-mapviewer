/// <reference types="cypress" />

import { registerProj4, WGS84 } from '@geoadmin/coordinates'
import proj4 from 'proj4'

import { proxifyUrl } from '@/api/file-proxy.api.js'
import { DEFAULT_PROJECTION } from '@/config/map.config'

registerProj4(proj4)
function checkVectorLayerHighlightingSegment(lastIndex = -1) {
    let currentIndex = -1
    cy.readWindowValue('map').should((map) => {
        const vectorLayers = map
            .getLayers()
            .getArray()
            .filter((layer) => layer.get('id').startsWith('vector-layer-'))
        const geomHighlightFeature = vectorLayers.find((layer) => {
            return layer
                .getSource()
                .getFeatures()
                .find((feature) => feature.get('id').startsWith('geom-segment-'))
        })
        expect(geomHighlightFeature).to.not.be.undefined
        currentIndex = vectorLayers.indexOf(geomHighlightFeature)
        if (lastIndex === -1) {
            expect(lastIndex).not.to.equal(currentIndex)
        }
    })
    return currentIndex
}
describe('The Import File Tool', () => {
    function createHeadAndGetIntercepts(
        url,
        aliasName,
        getConfig,
        headConfig = {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/vnd.google-earth.kml+xml',
            },
        }
    ) {
        cy.intercept('HEAD', url, headConfig).as(`head${aliasName}`)
        cy.intercept('GET', url, getConfig).as(`get${aliasName}`)

        cy.intercept('GET', proxifyUrl(url), getConfig).as(`proxyfied${aliasName}`)
    }

    it('Import KML file', () => {
        cy.goToMapView({}, true)
        cy.readStoreValue('state.layers.activeLayers').should('be.empty')
        cy.openMenuIfMobile()
        cy.get('[data-cy="menu-tray-tool-section"]:visible').click()
        cy.get('[data-cy="menu-advanced-tools-import-file"]:visible').click()

        //---------------------------------------------------------------------
        // Test the menu should be automatically closed on opening import tool box
        cy.log('the menu should be automatically closed on opening import tool box')
        cy.get('[data-cy="menu-tray"]').should('not.be.visible')
        cy.get('[data-cy="import-file-content"]').should('be.visible')
        cy.get('[data-cy="import-file-online-content"]').should('be.visible')

        // Import big KML file with chunks and verify profile that there are no segments
        cy.log(
            'Test import big KML file divided into multiple chunks by the API and verify profile'
        )
        const bigKmlFileName = 'big-external-kml-file.kml'
        const bigKmlFileFixture = `import-tool/${bigKmlFileName}`

        cy.readStoreValue('state.layers.activeLayers').should('be.empty')
        cy.openMenuIfMobile()

        cy.fixture(bigKmlFileFixture, null).as('kmlFixture')
        cy.get('[data-cy="file-input"]').selectFile('@kmlFixture', {
            force: true,
        })
        cy.get('[data-cy="import-file-local-btn"]:visible').click()
        cy.get('[data-cy="import-file-load-button"]:visible').click()

        const profileIntercept = '**/rest/services/profile.json**'
        cy.intercept(profileIntercept, {
            fixture: 'service-alti/profile.fixture.json',
        }).as('profile')

        cy.closeMenuIfMobile()

        cy.get('[data-cy="window-close"]').click()
        cy.get('[data-cy="ol-map"]').click(150, 400)

        cy.get('[data-cy="show-profile"]').click()
        Object.entries({
            profile_elevation_difference: '0.00m',
            profile_elevation_down: '0.20m',
            profile_elevation_up: '0.20m',
            profile_poi_down: "1'342m",
            profile_poi_up: "1'342m",
            profile_distance: '9.00m',
            profile_slope_distance: '9.01m',
        }).forEach(([key, value]) => {
            cy.get(`[data-cy="profile-popup-info-${key}"]`).should('contain.text', value)
        })
        cy.get('[data-cy="profile-graph"]').trigger('mouseenter')
        cy.get('[data-cy="profile-graph"]').trigger('mousemove', 'center')
        cy.get(
            '[data-cy="profile-popup-tooltip"] [data-cy="profile-popup-tooltip-distance"]'
        ).should('contain.text', '3 m')
        cy.get(
            '[data-cy="profile-popup-tooltip"] [data-cy="profile-popup-tooltip-elevation"]'
        ).should('contain.text', '1341.8 m')
        cy.get('[data-cy="profile-segment-button-0"]').should('not.exist')
        cy.get('[data-cy="infobox-close"]').click()
        cy.openMenuIfMobile()
        cy.get(`[data-cy^="button-remove-layer-${bigKmlFileName}"]:visible`).click({ force: true })
        cy.get('[data-cy="menu-tray-tool-section"]:visible').click()
        cy.get('[data-cy="menu-advanced-tools-import-file"]:visible').click()

        cy.log(
            'Test if kml is sanitized and external content is blocked and description is truncated'
        )
        const iframeTestFile = 'iframe-test.kml'
        const iframeTestFileFixture = `import-tool/${iframeTestFile}`

        cy.readStoreValue('state.layers.activeLayers').should('be.empty')
        cy.openMenuIfMobile()

        cy.fixture(iframeTestFileFixture, null).as('kmlFixture')
        cy.get('[data-cy="file-input"]').selectFile('@kmlFixture', {
            force: true,
        })
        cy.get('[data-cy="import-file-local-btn"]:visible').click()
        cy.get('[data-cy="import-file-load-button"]:visible').click()

        cy.closeMenuIfMobile()

        cy.get('[data-cy="window-close"]').click()
        cy.get('[data-cy="ol-map"]').click(160, 250)

        cy.get('[data-cy=feature-item]').should('have.length', 1)
        cy.get('.htmlpopup-container')
        cy.get('.htmlpopup-container')
            .should('have.length', 1)
            .should('contain', 'Title')
            .should('contain', 'test title')
            .should('contain', 'Phone: +1234567890')
            .should('contain', 'SMS: +1234567890')
            .should('contain', 'Check out this [BLOCKED EXTERNAL CONTENT] for more')
            .should('contain', 'Description')
            .should('contain', 'Contains third party content')
        cy.get('[data-cy="infobox-close"]').click()
        cy.openMenuIfMobile()
        cy.get(`[data-cy^="button-remove-layer-${iframeTestFile}"]:visible`).click()
        cy.get('[data-cy="menu-tray-tool-section"]:visible').click()
        cy.get('[data-cy="menu-advanced-tools-import-file"]:visible').click()

        //---------------------------------------------------------------------
        // Test the import of an online KML file
        cy.log('Test online import')
        const localKmlFile = 'import-tool/external-kml-file.kml'
        const validOnlineUrl = 'https://example.com/valid-kml-file.kml'
        createHeadAndGetIntercepts(validOnlineUrl, 'ValidKmlFile', { fixture: localKmlFile })

        // Type a valid online KML file URL
        cy.get('[data-cy="text-input"]:visible').type(validOnlineUrl)
        cy.get('[data-cy="import-file-load-button"]:visible').click()
        cy.wait(['@headValidKmlFile', '@getValidKmlFile'])

        // Assertions for successful import
        cy.get('[data-cy="text-input"]')
            .should('have.class', 'is-valid')
            .should('not.have.class', 'is-invalid')
        cy.get('[data-cy="text-input-valid-feedback"]')
            .should('be.visible')
            .contains('File successfully imported')
        cy.get('[data-cy="import-file-load-button"]').should('be.visible').contains('Import')
        cy.get('[data-cy="import-file-local-content"]').should('not.be.visible')
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 1)
        cy.log('Test that the single kml feature is in center of the view (zoom to extent check)')
        cy.readStoreValue('state.position.center').then((center) => {
            cy.wrap(center[0]).should('be.closeTo', 2776665.92, 1)
            cy.wrap(center[1]).should('be.closeTo', 1175560.21, 1)
        })

        //---------------------------------------------------------------------
        // RE-click on the import button should not add the layer a second time
        cy.log('Test re-adding the layer, should not have effect')
        cy.get('[data-cy="import-file-load-button"]:visible').click()
        cy.wait(['@headValidKmlFile', '@getValidKmlFile'])
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 1)

        //----------------------------------------------------------------------
        cy.log('Test adding another external online KML layer')
        const secondLocalKmlFile = 'import-tool/second-external-kml-file.kml'
        const secondValidOnlineUrl = 'https://example.com/second-valid-kml-file.kml'
        createHeadAndGetIntercepts(secondValidOnlineUrl, 'SecondValidKmlFile', {
            fixture: secondLocalKmlFile,
        })

        cy.get('[data-cy="text-input"]:visible')
        cy.get('[data-cy="text-input-clear"]:visible').click()
        cy.get('[data-cy="text-input"]:visible').type(secondValidOnlineUrl)
        cy.get('[data-cy="import-file-load-button"]:visible').click()
        cy.wait(['@headSecondValidKmlFile', '@getSecondValidKmlFile'])

        // Assertions for successful import
        cy.get('[data-cy="text-input"]')
            .should('have.class', 'is-valid')
            .should('not.have.class', 'is-invalid')
        cy.get('[data-cy="text-input-valid-feedback"]')
            .should('be.visible')
            .contains('File successfully imported')
        cy.get('[data-cy="import-file-load-button"]').should('be.visible').contains('Import')
        cy.get('[data-cy="import-file-local-content"]').should('not.be.visible')
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 2)

        //----------------------------------------------------------------------
        // Test local import
        cy.log('Switch to local import')
        cy.get('[data-cy="import-file-local-btn"]:visible').click()
        cy.get('[data-cy="import-file-local-content"]').should('be.visible')

        //----------------------------------------------------------------------
        // Attach a local KML file
        cy.log('Test add a local KML file')
        cy.fixture(localKmlFile, null).as('kmlFixture')
        cy.get('[data-cy="file-input"]').selectFile('@kmlFixture', {
            force: true,
        })
        cy.get('[data-cy="import-file-load-button"]:visible').click()

        // Assertions for successful import
        cy.get('[data-cy="file-input-text"]')
            .should('have.class', 'is-valid')
            .should('not.have.class', 'is-invalid')
        cy.get('[data-cy="file-input-valid-feedback"]')
            .should('be.visible')
            .contains('File successfully imported')
        cy.get('[data-cy="import-file-load-button"]').should('be.visible').contains('Import')
        cy.get('[data-cy="import-file-online-content"]').should('not.be.visible')
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 3)

        //----------------------------------------------------------------------
        // RE-add the layer should have no effect (no duplicate layer)
        cy.log('Test re-adding the layer, should not have effect')
        cy.get('[data-cy="import-file-load-button"]:visible').click()
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 3)

        //----------------------------------------------------------------------
        // Attach a another local KML file
        cy.log('Test add another local KML file - feature being in bound and outbound')
        const lineAccrossEuFileName = 'line-accross-eu.kml'
        const lineAccrossEuFile = `import-tool/${lineAccrossEuFileName}`
        cy.fixture(lineAccrossEuFile, null).as('lineAccrossEuFixture')
        cy.get('[data-cy="file-input"]').selectFile('@lineAccrossEuFixture', {
            force: true,
        })
        cy.get('[data-cy="import-file-load-button"]:visible').click()

        //----------------------------------------------------------------------
        // Attach a local KML file with a broken feature inside
        cy.log('Test add another local KML file - feature being in bound and outbound')
        const kmlFeatureError = 'import-tool/kml_feature_error.kml'
        cy.fixture(kmlFeatureError, null).as('kmlFeatureError')
        cy.get('[data-cy="file-input"]').selectFile('@kmlFeatureError', {
            force: true,
        })
        cy.get('[data-cy="import-file-load-button"]:visible').click()

        // Assertions for successful import
        cy.get('[data-cy="file-input-text"]')
            .should('have.class', 'is-valid')
            .should('not.have.class', 'is-invalid')
        cy.get('[data-cy="file-input-valid-feedback"]')
            .should('be.visible')
            .contains('File successfully imported')
        cy.get('[data-cy="import-file-load-button"]').should('be.visible').contains('Import')
        cy.get('[data-cy="import-file-online-content"]').should('not.be.visible')
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 5)

        //----------------------------------------------------------------------
        cy.log('Switching back to online tab, should keep previous entry')
        // Switch back to the import of an online KML file
        cy.get('[data-cy="import-file-online-btn"]:visible').click()
        cy.get('[data-cy="import-file-online-content"]').should('be.visible')
        cy.get('[data-cy="text-input"]')
            .should('be.visible')

            .should('have.class', 'is-valid')
            .should('have.value', secondValidOnlineUrl)

        //----------------------------------------------------------------------
        // Close the import tool
        cy.log('Test close import tool')
        cy.get('[data-cy="import-file-close-button"]:visible').click()
        cy.get('[data-cy="import-file-content"]').should('not.exist')

        //----------------------------------------------------------------------
        // Open the menu and check the layer list
        cy.log('Check that the external layers have been added to the active layers menu')
        cy.openMenuIfMobile()
        cy.get('[data-cy="menu-section-active-layers"]')
            .should('be.visible')
            .children()
            .should('have.length', 5)
            .each(($layer, index) => {
                cy.wrap($layer).find('[data-cy^="button-error"]').should('not.exist')
                cy.wrap($layer)
                    .find('[data-cy^="button-loading-metadata-spinner"]')
                    .should('not.exist')
                switch (index) {
                    case 0:
                        cy.wrap($layer).contains('uetlibergwege_kml')
                        cy.wrap($layer)
                            .find('[data-cy="menu-external-disclaimer-icon-hard-drive"]')
                            .should('be.visible')
                        cy.wrap($layer)
                            .find('[data-cy="button-has-warning-kml_feature_error.kml"]')
                            .should('be.visible')
                        break
                    case 1:
                        cy.wrap($layer).contains('Line accross europe')
                        cy.wrap($layer)
                            .find('[data-cy="menu-external-disclaimer-icon-hard-drive"]')
                            .should('be.visible')
                        cy.wrap($layer)
                            .find('[data-cy="button-has-warning-line-accross-eu.kml"]')
                            .should('be.visible')
                        break
                    case 2:
                        cy.wrap($layer).contains('Sample KML File')
                        cy.wrap($layer)
                            .find('[data-cy="menu-external-disclaimer-icon-hard-drive"]')
                            .should('be.visible')
                        break
                    case 3:
                        cy.wrap($layer).contains('Another KML')
                        cy.wrap($layer)
                            .find('[data-cy="menu-external-disclaimer-icon-cloud"]')
                            .should('be.visible')
                        break
                    case 4:
                        cy.wrap($layer).contains('Sample KML File')
                        cy.wrap($layer)
                            .find('[data-cy="menu-external-disclaimer-icon-cloud"]')
                            .should('be.visible')
                        break
                }
            })

        // Test the search for a feature in the local KML file
        const expectedSecondCenterEpsg4326 = [8.117189, 46.852375] // lon/lat
        const expectedCenterEpsg4326 = [9.74921, 46.707841] // lon/lat
        const expectedSecondCenterDefaultProjection = proj4(
            WGS84.epsg,
            DEFAULT_PROJECTION.epsg,
            expectedSecondCenterEpsg4326
        )
        const expectedCenterDefaultProjection = proj4(
            WGS84.epsg,
            DEFAULT_PROJECTION.epsg,
            expectedCenterEpsg4326
        )
        const expectedLayerId = 'external-kml-file.kml'
        const expectedOnlineLayerId = 'https://example.com/second-valid-kml-file.kml'
        const acceptedDelta = 0.2
        const checkLocation = (expected, result) => {
            expect(result).to.be.an('Array')
            expect(result.length).to.eq(2)
            expect(result[0]).to.approximately(expected[0], acceptedDelta)
            expect(result[1]).to.approximately(expected[1], acceptedDelta)
        }
        const emptySearchResponse = {
            results: [],
        }
        cy.mockupBackendResponse(
            'rest/services/ech/SearchServer*?type=layers*',
            emptySearchResponse,
            'search-layers'
        )
        cy.mockupBackendResponse(
            'rest/services/ech/SearchServer*?type=locations*',
            emptySearchResponse,
            'search-locations'
        )

        cy.log('Test search for a feature in the local KML file')
        cy.closeMenuIfMobile()

        // 2 warnings to remove
        cy.get('[data-cy="warning-window"]').contains(
            "The imported file 'Line accross europe' is partially outside the swiss boundaries. Some functionalities might not be available."
        )
        cy.get('[data-cy="warning-window-close"]').click({ force: true })
        cy.get('[data-cy="warning-window"]').contains(
            "The imported KML file 'uetlibergwege_kml' is malformed, please verify your file."
        )
        cy.get('[data-cy="warning-window-close"]').click({ force: true })

        cy.get('[data-cy="searchbar"]').paste('placemark')
        cy.wait(['@search-layers', '@search-locations'])
        cy.get('[data-cy="search-results"]').should('be.visible')
        cy.get('[data-cy="search-result-entry"]').as('layerSearchResults').should('have.length', 3)
        cy.get('@layerSearchResults').invoke('text').should('contain', 'Sample Placemark')
        cy.get('@layerSearchResults').first().trigger('mouseenter')
        cy.readStoreValue('getters.visibleLayers').should((visibleLayers) => {
            const visibleIds = visibleLayers.map((layer) => layer.id)
            expect(visibleIds).to.contain(expectedLayerId)
        })
        cy.get('@layerSearchResults').first().realClick()
        // checking that the view has centered on the feature
        cy.readStoreValue('state.position.center').should((center) =>
            checkLocation(expectedCenterDefaultProjection, center)
        )

        cy.log('Test search for a feature in the online KML file')
        cy.get('[data-cy="searchbar-clear"]').click()
        cy.get('[data-cy="searchbar"]').paste('another sample')
        cy.wait(['@search-layers', '@search-locations'])
        cy.get('[data-cy="search-results"]').should('be.visible')
        cy.get('[data-cy="search-result-entry"]').as('layerSearchResults').should('have.length', 1)
        cy.get('@layerSearchResults').invoke('text').should('contain', 'Another Sample Placemark')
        cy.get('@layerSearchResults').first().trigger('mouseenter')
        cy.readStoreValue('getters.visibleLayers').should((visibleLayers) => {
            const visibleIds = visibleLayers.map((layer) => layer.id)
            expect(visibleIds).to.contain(expectedOnlineLayerId)
        })
        cy.get('@layerSearchResults').first().realClick()
        // checking that the view has centered on the feature
        cy.readStoreValue('state.position.center').should((center) =>
            checkLocation(expectedSecondCenterDefaultProjection, center)
        )

        //---------------------------------------------------------------------
        // Test the disclaimer
        cy.log('Test the external layer disclaimer')
        cy.openMenuIfMobile()
        cy.get('[data-cy="menu-section-active-layers"]')
            .children()
            .find('[data-cy="menu-external-disclaimer-icon-hard-drive"]:visible')
            .eq(1)
            .click()
        cy.get('[data-cy="modal-content"]')
            .should('be.visible')
            .contains('Warning: Third party data')
            .contains(lineAccrossEuFile.replace(/.*?\//, ''))
        cy.get('[data-cy="modal-close-button"]:visible').click()

        //---------------------------------------------------------------------
        // Test removing a layer
        cy.log('Test removing an external layer')
        cy.get(`[data-cy^="button-remove-layer-${validOnlineUrl}"]:visible`).click()
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 4)
        cy.get('[data-cy="menu-section-active-layers"]').children().should('have.length', 4)

        //---------------------------------------------------------------------
        // Test the disclaimer in the footer
        cy.log('Test the external layer disclaimer in the footer')
        cy.closeMenuIfMobile()
        cy.get('[data-cy="layer-copyright-example.com"]')
            .should('be.visible')
            .should('have.class', 'text-primary')
        cy.get('[data-cy="layer-copyright-example.com"]').realHover()
        cy.get('[data-cy="floating-third-party-disclaimer"]')
            .should('be.visible')
            .contains('Dataset and/or style provided by third party')
        cy.get('[data-cy="layer-copyright-example.com"]')
            .should('have.css', 'cursor', 'pointer')
            .should('not.have.attr', 'href')
        cy.get('[data-cy="layer-copyright-example.com"]').click()
        cy.get('[data-cy="modal-content"]')
            .should('be.visible')
            .contains('Warning: Third party data and/or style shown')
        cy.get('[data-cy="modal-close-button"]:visible').click()

        //---------------------------------------------------------------------
        // Test reloading the page
        cy.log('Test reloading the page should only keep online external layers')
        cy.reload()
        cy.waitMapIsReady()
        cy.openMenuIfMobile()
        cy.get('[data-cy="menu-section-active-layers"]:visible').children().should('have.length', 1)
        cy.get(`[data-cy^="active-layer-name-${secondValidOnlineUrl}"]`).should('be.visible')
        cy.get('[data-cy^="button-loading-metadata-spinner"]').should('not.exist')

        // Test the import of an online KML file that don't support CORS
        cy.log('Test online import - Non CORS server')
        const validOnlineNonCORSUrl = 'https://example.com/valid-kml-file-non-cors.kml'
        createHeadAndGetIntercepts(
            validOnlineNonCORSUrl,
            'KmlNoCORS',
            { fixture: localKmlFile },
            { forceNetworkError: true }
        )

        cy.openMenuIfMobile()
        cy.get('[data-cy="menu-tray-tool-section"]:visible').click()
        cy.get('[data-cy="menu-advanced-tools-import-file"]:visible').click()

        // Type a valid online GPX file URL
        cy.get('[data-cy="text-input"]:visible').type(validOnlineNonCORSUrl)
        cy.get('[data-cy="import-file-load-button"]:visible').click()
        cy.wait(['@headKmlNoCORS', '@proxyfiedKmlNoCORS'])
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 2)

        cy.log('switching to 3D and checking that online file is correctly loaded on 3D viewer')
        cy.get('[data-cy="import-window"] [data-cy="window-close"]').click()
        // 3 warnings to remove before being able to see the 3D button (on mobile)
        cy.get('[data-cy="warning-window"]').contains(
            'You have reloaded while a local layer was imported, or received a link containing a local layer, which has not been loaded. If you have the file containing the KML|external-kml-file.kml layer, please re-import it.'
        )
        cy.get('[data-cy="warning-window-close"]').click({ force: true })
        cy.get('[data-cy="warning-window"]').contains(
            'You have reloaded while a local layer was imported, or received a link containing a local layer, which has not been loaded. If you have the file containing the KML|line-accross-eu.kml layer, please re-import it.'
        )
        cy.get('[data-cy="warning-window-close"]').click({ force: true })
        cy.get('[data-cy="warning-window"]').contains(
            'You have reloaded while a local layer was imported, or received a link containing a local layer, which has not been loaded. If you have the file containing the KML|kml_feature_error.kml layer, please re-import it.'
        )
        cy.get('[data-cy="warning-window-close"]').click({ force: true })
        cy.get('[data-cy="3d-button"]:visible').click()
        cy.waitUntilCesiumTilesLoaded()
        cy.readWindowValue('cesiumViewer').should((viewer) => {
            expect(viewer.scene.primitives.length).to.eq(
                4,
                'should have 1 primitive (KML file) on top of labels and buildings primitives'
            )
        })

        cy.log('adding a local KML file while being in the 3D viewer')
        cy.openMenuIfMobile()
        cy.get('[data-cy="menu-tray-tool-section"]:visible').click()
        cy.get('[data-cy="menu-advanced-tools-import-file"]:visible').click()
        cy.get('[data-cy="import-file-local-btn"]').click()
        cy.get('[data-cy="file-input"]').selectFile('@lineAccrossEuFixture', {
            force: true,
        })
        cy.get('[data-cy="import-file-load-button"]:visible').click()
        cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
            const kmlLayerCount = activeLayers.filter((layer) => layer.type === 'KML').length
            cy.readWindowValue('cesiumViewer').should((viewer) => {
                expect(viewer.dataSources.length).to.eq(
                    kmlLayerCount,
                    `should have ${kmlLayerCount} date source (KML files)`
                )
            })
        })

        cy.log('testing the import and profile viewer with a KML MultiPolygon file')
        cy.get('[data-cy="import-window"] [data-cy="window-close"]').click()
        cy.get('[data-cy="3d-button"]:visible').click()

        cy.openMenuIfMobile()

        cy.get(
            `[data-cy^="button-remove-layer-${validOnlineNonCORSUrl}"]:visible`
        ).click()

        cy.get(`[data-cy^="button-remove-layer-${secondValidOnlineUrl}"]:visible`).click()
        cy.get(`[data-cy^="button-remove-layer-${lineAccrossEuFileName}"]:visible`).click()

        cy.get('[data-cy="menu-tray-tool-section"]:visible').click()
        cy.get('[data-cy="menu-advanced-tools-import-file"]:visible').click()

        const kmlMultiPolygonFileName = 'kml-multi-polygon.kml'
        const kmlMultiPolygonFileNameFixture = `import-tool/${kmlMultiPolygonFileName}`
        const validMutiPolygonOnlineUrl =
            'https://example.com/kml-multi-polygon.kml'
        createHeadAndGetIntercepts(
            validMutiPolygonOnlineUrl,
            'KmlNoCORS',
            {
                fixture: kmlMultiPolygonFileNameFixture,
            },
            {
                statusCode: 200,
                headers: { 'Content-Type': 'application/kml+xml' },
            }
        )
        cy.get('[data-cy="text-input"]:visible').type(validMutiPolygonOnlineUrl)
        cy.get('[data-cy="import-file-load-button"]:visible').click()
        cy.closeMenuIfMobile()
        cy.get('[data-cy="window-close"]').click()

        cy.get('[data-cy="ol-map"]').click(150, 250)

        cy.get('[data-cy="show-profile"]').click()

        let lastSegmentIndex = checkVectorLayerHighlightingSegment()

        cy.get('[data-cy="profile-segment-button-1"]').click()
        cy.readStoreValue('state.profile.currentFeatureSegmentIndex').should('be.equal', 1)
        checkVectorLayerHighlightingSegment(lastSegmentIndex)
    })
    it('Import KML file error handling', () => {
        const outOfBoundKMLFile = 'import-tool/paris.kml'
        const emptyKMLFile = 'import-tool/empty.kml'

        cy.intercept('HEAD', 'https://example.com/*', {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/vnd.google-earth.kml+xml',
            },
        }).as('headRequest')

        const invalidFileOnlineUrl = 'https://example.com/invalid-file.kml'
        createHeadAndGetIntercepts(invalidFileOnlineUrl, 'InvalidKmlFile', {
            body: `<html>Not a KML</html>`,
        })

        const onlineUrlNotReachable = 'https://example.com/kml-file.kml'
        createHeadAndGetIntercepts(onlineUrlNotReachable, 'UnreachableKmlFile', {
            statusCode: 403,
        })

        const outOfBoundKMLUrl = 'https://example.com/out-of-bound-kml-file.kml'
        createHeadAndGetIntercepts(outOfBoundKMLUrl, 'OutOfBoundKmlFile', {
            fixture: outOfBoundKMLFile,
        })

        const validOnlineUrlWithInvalidContentType = 'https://somes3bucket.com/valid-kml-file.kml'
        createHeadAndGetIntercepts(
            validOnlineUrlWithInvalidContentType,
            'ValidKmlFileWrongContentType',
            {
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
                statusCode: 200,
                body: `<kml> This is an empty kml</kml>`,
            },
            {
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
                statusCode: 200,
            }
        )

        cy.goToMapView(
            {
                layers: [
                    `KML|${outOfBoundKMLUrl}`,
                    `KML|${invalidFileOnlineUrl}`,
                    `KML|${onlineUrlNotReachable}`,
                    `KML|${validOnlineUrlWithInvalidContentType}`,
                ].join(';'),
            },
            true
        )
        cy.openMenuIfMobile()

        //---------------------------------------------------------------------
        cy.log('Test invalid external KML file from url parameter')

        // Wait for all network calls to resolve
        const kmlRequests = [
            '@headInvalidKmlFile',
            '@getInvalidKmlFile',
            '@headUnreachableKmlFile',
            '@getUnreachableKmlFile',
            '@headOutOfBoundKmlFile',
            '@getOutOfBoundKmlFile',
            '@headValidKmlFileWrongContentType',
            '@getValidKmlFileWrongContentType',
        ]
        cy.wait(kmlRequests)

        // Expected values per index - this is to avoid having nested
        // if statements
        const errorDataMap = {
            [validOnlineUrlWithInvalidContentType]: {
                shouldHaveError: false,
            },
            [onlineUrlNotReachable]: {
                shouldHaveError: true,
                errorMessage: 'file not accessible',
            },
            [invalidFileOnlineUrl]: {
                shouldHaveError: true,
                errorMessage: 'Invalid file',
            },
            [outOfBoundKMLUrl]: {
                shouldHaveError: true,
                errorMessage: 'out of projection bounds',
            },
        }

        // Validate store and visible layers
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 4)
        cy.get('[data-cy="menu-section-active-layers"]')
            .should('be.visible')
            .children()
            .should('have.length', 4)
            .each(($layer) => {
                const url = $layer.attr('data-layer-id')
                const errorData = errorDataMap[url]

                cy.wrap($layer)
                    .find('[data-cy="menu-external-disclaimer-icon-cloud"]')
                    .should('be.visible')

                if (errorData.shouldHaveError) {
                    cy.wrap($layer)
                        .find('[data-cy^="button-has-error"]')
                        .should('be.visible')
                        .trigger('mouseover')

                    cy.get(`[data-cy^="floating-button-has-error-${url}"]`)
                        .should('be.visible')
                        .contains(errorData.errorMessage)

                    cy.get(`[data-cy^="floating-button-has-error-${url}"]`).trigger('mouseout', {
                        force: true,
                    })
                } else {
                    cy.get(`[data-cy^="floating-button-has-error-${url}"]`).should('not.exist')
                }

                // Ensure no spinner is shown
                cy.wrap($layer)
                    .find('[data-cy^="button-loading-metadata-spinner"]')
                    .should('not.exist')
            })

        //---------------------------------------------------------------------
        // Test removing a layer
        cy.log('Test removing all kml layer')
        cy.get(
            `[data-cy^="button-remove-layer-${validOnlineUrlWithInvalidContentType}"]:visible`
        ).click({
            force: true,
        })
        cy.get(`[data-cy^="button-remove-layer-${invalidFileOnlineUrl}"]:visible`).click({
            force: true,
        })
        cy.get(`[data-cy^="button-remove-layer-${onlineUrlNotReachable}"]:visible`).click({
            force: true,
        })
        cy.get(`[data-cy^="button-remove-layer-${outOfBoundKMLUrl}"]:visible`).click({
            force: true,
        })
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 0)
        cy.get('[data-cy="menu-section-active-layers"]').children().should('have.length', 0)
        //---------------------------------------------------------------------

        cy.log('Test online import invalid file')

        cy.get('[data-cy="menu-tray-tool-section"]:visible').click()
        cy.get('[data-cy="menu-advanced-tools-import-file"]:visible').click()

        cy.get('[data-cy="text-input"]:visible').type(invalidFileOnlineUrl)
        cy.get('[data-cy="import-file-load-button"]:visible').click()
        cy.wait(['@headInvalidKmlFile', '@getInvalidKmlFile'])

        cy.get('[data-cy="text-input"]')

            .should('have.class', 'is-invalid')
            .should('not.have.class', 'is-valid')
        cy.get('[data-cy="text-input-invalid-feedback"]')
            .should('be.visible')
            .contains('Invalid file')
        cy.get('[data-cy="import-file-load-button"]:visible').should('not.be.disabled')

        //---------------------------------------------------------------------
        cy.log('Test online import invalid url')
        const invalidOnlineUrl = 'hello world'

        cy.get('[data-cy="text-input"]:visible')
        cy.get('[data-cy="text-input-clear"]:visible').click()

        cy.get('[data-cy="text-input"]:visible').type(invalidOnlineUrl)

        cy.get('[data-cy="text-input"]')
            .should('have.class', 'is-invalid')
            .should('not.have.class', 'is-valid')

        cy.get('[data-cy="text-input-invalid-feedback"]')
            .should('be.visible')
            .contains('URL is not valid')

        cy.get('[data-cy="import-file-load-button"]:visible').should('not.be.disabled')

        cy.get('[data-cy="text-input"]').type('{enter}')
        cy.get('[data-cy="text-input-invalid-feedback"]')
            .should('be.visible')
            .contains('URL is not valid')

        //---------------------------------------------------------------------
        cy.log('Test online import url not reachable')

        cy.get('[data-cy="text-input"]:visible')
        cy.get('[data-cy="text-input-clear"]:visible').click()

        cy.get('[data-cy="text-input"]:visible').type(onlineUrlNotReachable)
        cy.get('[data-cy="import-file-load-button"]:visible').click()
        cy.wait(['@headUnreachableKmlFile', '@getUnreachableKmlFile'])

        cy.get('[data-cy="text-input"]')

            .should('have.class', 'is-invalid')
            .should('not.have.class', 'is-valid')
        cy.get('[data-cy="text-input-invalid-feedback"]')
            .should('be.visible')
            .contains('file not accessible')
        cy.get('[data-cy="import-file-load-button"]:visible').should('not.be.disabled')

        //----------------------------------------------------------------------
        // Attach an online KML file that is out of bounds
        cy.log('Test add an online KML file that is out of bounds')
        cy.get('[data-cy="text-input"]:visible')
        cy.get('[data-cy="text-input-clear"]:visible').click()
        cy.get('[data-cy="text-input"]:visible').type(outOfBoundKMLUrl)
        cy.get('[data-cy="import-file-load-button"]:visible').click()
        cy.wait(['@headOutOfBoundKmlFile', '@getOutOfBoundKmlFile'])

        cy.get('[data-cy="text-input"]')

            .should('have.class', 'is-invalid')
            .should('not.have.class', 'is-valid')
        cy.get('[data-cy="text-input-invalid-feedback"]')
            .should('be.visible')
            .contains('out of projection bounds')
        cy.get('[data-cy="import-file-load-button"]:visible').should('not.be.disabled')

        //----------------------------------------------------------------------
        // Attach an online empty KML file
        cy.log('Test add an online empty KML file')
        const emptyKMLUrl = 'https://example.com/empty-kml-file.kml'
        createHeadAndGetIntercepts(emptyKMLUrl, 'EmptyKmlFile', { fixture: emptyKMLFile })

        cy.get('[data-cy="text-input"]:visible')
        cy.get('[data-cy="text-input-clear"]:visible').click()
        cy.get('[data-cy="text-input"]:visible').type(emptyKMLUrl)
        cy.get('[data-cy="import-file-load-button"]:visible').click()
        cy.wait(['@headEmptyKmlFile', '@getEmptyKmlFile'])

        cy.get('[data-cy="text-input"]')

            .should('have.class', 'is-invalid')
            .should('not.have.class', 'is-valid')
        cy.get('[data-cy="text-input-invalid-feedback"]')
            .should('be.visible')
            .contains('file is empty')
        cy.get('[data-cy="import-file-load-button"]:visible').should('not.be.disabled')

        //----------------------------------------------------------------------
        // Test the import of a valid online KML with invalid content-type
        cy.log('Test online import with invalid content-type')

        cy.get('[data-cy="text-input"]:visible')
        cy.get('[data-cy="text-input-clear"]:visible').click()
        cy.get('[data-cy="text-input"]:visible').type(validOnlineUrlWithInvalidContentType)
        cy.get('[data-cy="import-file-load-button"]:visible').click()
        cy.wait(['@headValidKmlFileWrongContentType', '@getValidKmlFileWrongContentType'])

        //this means the kml was parsed despite the wrong content type
        cy.get('[data-cy="text-input"]').should('have.class', 'is-invalid')

        //close import menu
        cy.get('[data-cy="import-file-close-button"]:visible').click()
        cy.get('[data-cy="import-file-content"]').should('not.exist')

        //open menu and open import tool again
        cy.openMenuIfMobile()
        cy.get('[data-cy="menu-tray-tool-section"]:visible').click()
        cy.get('[data-cy="menu-advanced-tools-import-file"]:visible').click()
        cy.get('[data-cy="import-file-content"]').should('be.visible')

        //----------------------------------------------------------------------
        // Test local import error handling
        cy.log('Switch to local import')
        cy.get('[data-cy="import-file-local-btn"]:visible').click()
        cy.get('[data-cy="import-file-local-content"]').should('be.visible')
        cy.get('[data-cy="import-file-load-button"]:visible').click()
        cy.get('[data-cy="file-input-text"]').should('have.class', 'is-invalid')
        cy.get('[data-cy="file-input-invalid-feedback"]')
            .should('have.class', 'invalid-feedback')
            .should('be.visible')
            .should('contain', 'No file')

        //----------------------------------------------------------------------
        // Attach a local invalid KML file
        cy.log('Test add a local invalid KML file')
        cy.get('[data-cy="file-input"]').selectFile(
            {
                contents: Cypress.Buffer.from('Invalid kml file contents'),
                fileName: 'file.txt',
                mimeType: 'text/plain',
                lastModified: Date.now(),
            },
            { force: true }
        )
        cy.get('[data-cy="import-file-load-button"]:visible').click()

        cy.get('[data-cy="file-input-text"]')
            .should('have.class', 'is-invalid')
            .should('not.have.class', 'is-valid')
        cy.get('[data-cy="file-input-invalid-feedback"]')
            .should('have.class', 'invalid-feedback')
            .should('be.visible')
            .should('contain', 'This file format is not supported')

        //----------------------------------------------------------------------
        // Attach a local KML file that is out of bounds
        cy.log('Test add a local KML file that is out of bounds')
        cy.fixture(outOfBoundKMLFile, null).as('outOfBoundKMLFileFixture')
        cy.get('[data-cy="file-input"]').selectFile('@outOfBoundKMLFileFixture', {
            force: true,
        })
        cy.get('[data-cy="import-file-load-button"]:visible').click()

        cy.get('[data-cy="file-input-text"]')
            .should('have.class', 'is-invalid')
            .should('not.have.class', 'is-valid')
        cy.get('[data-cy="file-input-invalid-feedback"]')
            .should('be.visible')
            .contains('out of projection bounds')

        //----------------------------------------------------------------------
        // Attach a local empty KML file
        cy.log('Test add a local invalid KML file')
        cy.fixture(emptyKMLFile, null).as('emptyKMLFileFixture')
        cy.get('[data-cy="file-input"]').selectFile('@emptyKMLFileFixture', {
            force: true,
        })
        cy.get('[data-cy="import-file-load-button"]:visible').click()

        cy.get('[data-cy="file-input-text"]')
            .should('have.class', 'is-invalid')
            .should('not.have.class', 'is-valid')
        cy.get('[data-cy="file-input-invalid-feedback"]')
            .should('be.visible')
            .contains('file is empty')

        //----------------------------------------------------------------------
        // Close the import tool
        cy.log('Test close import tool')
        cy.get('[data-cy="import-file-close-button"]:visible').click()
        cy.get('[data-cy="import-file-content"]').should('not.exist')

        cy.openMenuIfMobile()
        cy.get('[data-cy="menu-section-active-layers"]').should('not.be.visible')
        cy.get('[data-cy="menu-section-no-layers"]').should('be.visible')
    })
    it('Import GPX file', () => {
        const gpxFileName = 'external-gpx-file.gpx'
        const gpxFileFixture = `import-tool/${gpxFileName}`

        cy.goToMapView({}, true)
        cy.readStoreValue('state.layers.activeLayers').should('be.empty')
        cy.openMenuIfMobile()
        cy.get('[data-cy="menu-tray-tool-section"]:visible').click()
        cy.get('[data-cy="menu-advanced-tools-import-file"]:visible').click()

        // the menu should be automatically closed on opening import tool box
        cy.get('[data-cy="menu-tray"]').should('not.be.visible')
        cy.get('[data-cy="import-file-content"]').should('be.visible')
        cy.get('[data-cy="import-file-online-content"]').should('be.visible')

        // Test the import of an online GPX file
        cy.log('Test online import')
        const validOnlineUrl = 'https://example.com/valid-gpx-file.gpx'
        const gpxOnlineLayerId = `GPX|${validOnlineUrl}`
        createHeadAndGetIntercepts(
            validOnlineUrl,
            'GpxFile',
            {
                fixture: gpxFileFixture,
            },
            {
                statusCode: 200,
                headers: { 'Content-Type': 'application/gpx+xml' },
            }
        )

        // Type a valid online GPX file URL
        cy.get('[data-cy="text-input"]:visible').type(validOnlineUrl)
        cy.get('[data-cy="import-file-load-button"]:visible').click()
        cy.wait(['@headGpxFile', '@getGpxFile'])

        // Assertions for successful import
        cy.get('[data-cy="text-input"]')
            .should('have.class', 'is-valid')
            .should('not.have.class', 'is-invalid')
        cy.get('[data-cy="text-input-valid-feedback"]')
            .should('be.visible')
            .contains('File successfully imported')
        cy.get('[data-cy="import-file-load-button"]').should('be.visible').contains('Import')
        cy.get('[data-cy="import-file-local-content"]').should('not.be.visible')
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 1)
        cy.log('Test that the single gpx feature is in center of the view (zoom to extent check)')
        cy.readStoreValue('state.position.center').then((center) => {
            cy.wrap(center[0]).should('be.closeTo', 2604663.19, 1)
            cy.wrap(center[1]).should('be.closeTo', 1210998.57, 1)
        })
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 1)

        cy.get('[data-cy="import-file-local-btn"]:visible').click()
        cy.get('[data-cy="import-file-local-content"]').should('be.visible')

        cy.log('Test adding a local GPX file')
        cy.fixture(gpxFileFixture).as('gpxFileFixture')
        cy.get('[data-cy="file-input"]').selectFile('@gpxFileFixture', {
            force: true,
        })
        cy.get('[data-cy="import-file-load-button"]:visible').click()

        // Assertions for successful import
        cy.get('[data-cy="file-input-text"]')
            .should('have.class', 'is-valid')
            .should('not.have.class', 'is-invalid')
        cy.get('[data-cy="file-input-valid-feedback"]')
            .should('be.visible')
            .contains('File successfully imported')
        cy.get('[data-cy="import-file-load-button"]').should('be.visible').contains('Import')
        cy.get('[data-cy="import-file-online-content"]').should('not.be.visible')

        cy.log('Check that the GPX layer has been added to the map')
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 2)

        cy.get('[data-cy="import-file-close-button"]:visible').click()
        cy.get('[data-cy="import-file-content"]').should('not.exist')

        //---------------------------------------------------------------------
        // Test reloading the page
        cy.log('Test reloading the page should only keep online external layers')
        cy.reload()
        cy.wait(['@headGpxFile', '@getGpxFile'])
        cy.waitMapIsReady()

        // Test removing a layer
        cy.log('Test removing an external GPX layer')
        cy.openMenuIfMobile()
        cy.get(`[data-cy^="button-remove-layer-${gpxOnlineLayerId}"]:visible`).click()
        cy.readStoreValue('state.layers.activeLayers').should('be.empty')

        // Test the import of an online GPX file that don't support CORS
        cy.log('Test online import - Non CORS server')
        const validOnlineNonCORSUrl = 'https://example.com/valid-gpx-file-non-cors.gpx'
        createHeadAndGetIntercepts(
            validOnlineNonCORSUrl,
            'GpxNoCORS',
            {
                fixture: gpxFileFixture,
            },
            {
                forceNetworkError: true,
            }
        )

        cy.openMenuIfMobile()
        cy.get('[data-cy="menu-tray-tool-section"]:visible').click()
        cy.get('[data-cy="menu-advanced-tools-import-file"]:visible').click()

        // Type a valid online GPX file URL
        cy.get('[data-cy="text-input"]:visible').type(validOnlineNonCORSUrl)
        cy.get('[data-cy="import-file-load-button"]:visible').click()
        cy.wait(['@headGpxNoCORS', '@proxyfiedGpxNoCORS'])
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 1)
        cy.get(
            '[data-cy="import-file-online-content"] [data-cy="import-file-close-button"]'
        ).click()

        // Import multi segment GPX file and verify profile
        cy.log('Test import multi segment GPX file and verify profile')
        const gpxMultiSegmentFileName = 'external-gpx-file-multi-segment.gpx'
        const gpxMultiSegmentFileFixture = `import-tool/${gpxMultiSegmentFileName}`

        cy.openMenuIfMobile()
        cy.get(`[data-cy^="button-remove-layer-GPX|${validOnlineNonCORSUrl}"]:visible`).click()
        cy.readStoreValue('state.layers.activeLayers').should('be.empty')
        cy.get('[data-cy="menu-tray-tool-section"]:visible').click()
        cy.get('[data-cy="menu-advanced-tools-import-file"]:visible').click()

        // the menu should be automatically closed on opening import tool box
        cy.get('[data-cy="menu-tray"]').should('not.be.visible')
        cy.get('[data-cy="import-file-content"]').should('be.visible')
        cy.get('[data-cy="import-file-online-content"]').should('be.visible')

        const validMultiSegmentOnlineUrl = 'https://example.com/valid-multi-segement-gpx-file.gpx'
        createHeadAndGetIntercepts(
            validMultiSegmentOnlineUrl,
            'GpxFile',
            {
                fixture: gpxMultiSegmentFileFixture,
            },
            {
                statusCode: 200,
                headers: { 'Content-Type': 'application/gpx+xml' },
            }
        )
        cy.openMenuIfMobile()
        cy.get('[data-cy="text-input"]:visible').type(validMultiSegmentOnlineUrl)
        cy.get('[data-cy="import-file-load-button"]:visible').click()

        const profileIntercept = '**/rest/services/profile.json**'
        cy.intercept(profileIntercept, {
            fixture: 'service-alti/profile.fixture.json',
        }).as('profile')

        cy.closeMenuIfMobile()

        cy.get('[data-cy="window-close"]').click()
        cy.get('[data-cy="warning-window-close"]').click()
        cy.get('[data-cy="ol-map"]').click(150, 250)

        cy.get('[data-cy="show-profile"]').click()
        Object.entries({
            profile_elevation_difference: '0.00m',
            profile_elevation_down: '0.10m',
            profile_elevation_up: '0.10m',
            profile_poi_down: "1'342m",
            profile_poi_up: "1'342m",
            profile_distance: '4.50m',
            profile_slope_distance: '4.51m',
        }).forEach(([key, value]) => {
            cy.get(`[data-cy="profile-popup-info-${key}"]`).should('contain.text', value)
        })
        cy.get('[data-cy="profile-graph"]').trigger('mouseenter')
        cy.get('[data-cy="profile-graph"]').trigger('mousemove', 'center')
        cy.get(
            '[data-cy="profile-popup-tooltip"] [data-cy="profile-popup-tooltip-distance"]'
        ).should('contain.text', '2.5 m')
        cy.get(
            '[data-cy="profile-popup-tooltip"] [data-cy="profile-popup-tooltip-elevation"]'
        ).should('contain.text', '1341.8 m')
        cy.log(
            'Checking that the stitching of the GPX track was successful, and no segment was left (all were stitched together as a single track)'
        )
        cy.get('[data-cy="profile-segment-button-0"]').should('not.exist')
        cy.get('[data-cy="infobox-close"]').click()

        cy.log('Loading separated multi segment GPX file to test segment buttons')
        cy.openMenuIfMobile()
        cy.get(`[data-cy^="button-remove-layer-GPX|${validMultiSegmentOnlineUrl}"]:visible`).click()
        cy.readStoreValue('state.layers.activeLayers').should('be.empty')
        cy.get('[data-cy="menu-tray-tool-section"]:visible').click()
        cy.get('[data-cy="menu-advanced-tools-import-file"]:visible').click()

        // the menu should be automatically closed on opening import tool box
        cy.get('[data-cy="menu-tray"]').should('not.be.visible')
        cy.get('[data-cy="import-file-content"]').should('be.visible')
        cy.get('[data-cy="import-file-online-content"]').should('be.visible')
        const gpxMultiSeparatedSegmentFileName = 'external-gpx-file-multi-separated-segment.gpx'
        const gpxMultiSeparatedSegmentFileFixture = `import-tool/${gpxMultiSeparatedSegmentFileName}`
        const validMultiSeparatedSegmentOnlineUrl =
            'https://example.com/valid-multi-separated-segement-gpx-file.gpx'
        createHeadAndGetIntercepts(
            validMultiSeparatedSegmentOnlineUrl,
            'GpxFile',
            {
                fixture: gpxMultiSeparatedSegmentFileFixture,
            },
            {
                statusCode: 200,
                headers: { 'Content-Type': 'application/gpx+xml' },
            }
        )
        cy.openMenuIfMobile()
        cy.get('[data-cy="text-input"]:visible').type(validMultiSeparatedSegmentOnlineUrl)
        cy.get('[data-cy="import-file-load-button"]:visible').click()
        cy.closeMenuIfMobile()
        cy.get('[data-cy="window-close"]').click()

        cy.get('[data-cy="ol-map"]').click(150, 250)

        cy.get('[data-cy="show-profile"]').click()
        // Test segment buttons and highlights
        cy.log('Check that the segment buttons are working and that the segment is highlighted')
        // waiting for the highlight layer to be loaded by checking its ID (with retry-ability)
        // without this "active" wait, the CI goes straight into the next test and fails
        // (because OL didn't have the time to load the layer)
        let lastSegmentIndex = checkVectorLayerHighlightingSegment()

        cy.get('[data-cy="profile-segment-button-1"]').click()
        cy.readStoreValue('state.profile.currentFeatureSegmentIndex').should('be.equal', 1)
        lastSegmentIndex = checkVectorLayerHighlightingSegment(lastSegmentIndex)

        cy.get('[data-cy="profile-segment-button-2"]').click()
        cy.readStoreValue('state.profile.currentFeatureSegmentIndex').should('be.equal', 2)
        checkVectorLayerHighlightingSegment(lastSegmentIndex)

        // Import file partially out of bounds
        cy.log('Test import file partially out of bounds')
        const gpxOutOfBoundsFileName = 'external-gpx-file-out-of-bounds.gpx'
        const gpxOutOfBoundsFileFixture = `import-tool/${gpxOutOfBoundsFileName}`

        cy.openMenuIfMobile()
        cy.get(
            `[data-cy^="button-remove-layer-GPX|${validMultiSeparatedSegmentOnlineUrl}"]:visible`
        ).click()
        cy.readStoreValue('state.layers.activeLayers').should('be.empty')
        cy.get('[data-cy="menu-tray-tool-section"]:visible').click()
        cy.get('[data-cy="menu-advanced-tools-import-file"]:visible').click()

        // the menu should be automatically closed on opening import tool box
        cy.get('[data-cy="menu-tray"]').should('not.be.visible')
        cy.get('[data-cy="import-file-content"]').should('be.visible')
        cy.get('[data-cy="import-file-online-content"]').should('be.visible')

        const validOutOfBoundsOnlineUrl = 'https://example.com/valid-out-of-bounds-gpx-file.gpx'
        createHeadAndGetIntercepts(
            validOutOfBoundsOnlineUrl,
            'GpxFile',
            {
                fixture: gpxOutOfBoundsFileFixture,
            },
            {
                statusCode: 200,
                headers: { 'Content-Type': 'application/gpx+xml' },
            }
        )
        cy.openMenuIfMobile()
        cy.get('[data-cy="text-input"]:visible').type(validOutOfBoundsOnlineUrl)
        cy.get('[data-cy="import-file-load-button"]:visible').click()

        cy.closeMenuIfMobile()

        cy.get('[data-cy="window-close"]').click()
        cy.get('[data-cy="ol-map"]').click(170, 250)

        cy.intercept(profileIntercept, {
            body: [],
        }).as('emptyProfile')

        cy.log('Check that the error is displayed in the profile popup')
        cy.get('[data-cy="show-profile"]').click()
        cy.wait('@emptyProfile')
        cy.get('[data-cy="profile-popup-content"]').should('be.visible')
        cy.get('[data-cy="profile-error-message"]').contains(
            'Error: the profile could not be generated'
        )
    })
})
