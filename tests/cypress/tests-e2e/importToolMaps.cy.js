/// <reference types="cypress" />

import { isMobile } from 'tests/cypress/support/utils'

describe('The Import Maps Tool', () => {
    const bgLayer = 'test.background.layer2'
    beforeEach(() => {
        cy.goToMapView({}, true)
        cy.openMenuIfMobile()
    })
    it('Import external wms layers', () => {
        cy.intercept(
            {
                https: true,
                hostname: 'wms.geo.admin.ch',
                query: { REQUEST: 'GetCapabilities' },
            },
            { fixture: 'import-tool/wms-geo-admin-get-capabilities.xml' }
        ).as('wms-get-capabilities')

        //-----------------------------------------------------------------------------------------
        cy.log('Select an external provider')
        cy.get('[data-cy="menu-tray-tool-section"]').should('be.visible').click()
        cy.get('[data-cy="menu-advanced-tools-import-catalogue"]').should('be.visible').click()
        cy.get('[data-cy="import-catalogue-input"]').should('be.visible').type('wms.geo.admin')
        cy.get('[data-cy="import-provider-list"]')
            .children()
            .contains('https://wms.geo.admin.ch')
            .click()

        //-----------------------------------------------------------------------------------------
        cy.log('Clear the external layer')
        cy.get('[data-cy="import-input-clear"]').should('be.visible').click()
        cy.get('[data-cy="import-catalogue-input"]').should('be.empty')
        cy.get('[data-cy="import-provider-list"]')
            .should('be.visible')
            .children()
            .should('have.length.above', 0)

        //-----------------------------------------------------------------------------------------
        cy.log('Toggle and search for provider')
        cy.get('[data-cy="import-catalogue-input"]').type('wms.geo')
        cy.get('[data-cy="import-provider-list"]').children().contains('https://wms.geo.admin.ch')
        cy.get('[data-cy="import-catalogue-providers-toggle"]')
            .should('be.visible')
            .find('svg')
            .should('have.class', 'fa-caret-up')
        cy.get('[data-cy="import-catalogue-providers-toggle"]').click()
        cy.get('[data-cy="import-catalogue-providers-toggle"]')
            .should('be.visible')
            .find('svg')
            .should('have.class', 'fa-caret-down')
        cy.get('[data-cy="import-provider-list"]').should('not.be.visible')
        cy.get('[data-cy="import-catalogue-providers-toggle"]').click()
        cy.get('[data-cy="import-provider-list"]')
            .children()
            .contains('https://wms.geo.admin.ch')
            .click()
        cy.wait('@wms-get-capabilities')

        //-----------------------------------------------------------------------------------------
        cy.log('First external layer should be group of layers')
        const itemId = 'ch.swisstopo-vd.official-survey'
        const itemFullId = `WMS|https://wms.geo.admin.ch/?|${itemId}`
        const itemName = 'Beta OpenData-AV'
        cy.get(`[data-cy="catalogue-tree-item-${itemFullId}"]`)
            .should('be.visible')
            .contains(itemName)
        cy.get(`[data-cy="catalogue-add-layer-button-${itemFullId}"]`).should('be.visible')
        cy.get(`[data-cy="catalogue-collapse-layer-button-${itemFullId}"]`).should('be.visible')
        cy.get(`[data-cy="catalogue-zoom-extent-button-${itemFullId}"]`).should('be.visible')
        cy.get(`[data-cy="catalogue-tree-item-info-${itemFullId}"]`).should('not.exist')

        //---------------------------------------------------------------------------------
        cy.log('Add group of layer')
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 0)
        cy.get(`[data-cy="catalogue-tree-item-name-${itemFullId}"]`).should('be.visible').click()
        cy.get(`[data-cy="catalogue-add-layer-button-${itemFullId}"]`)
            .should('have.class', 'text-primary')
            .find('svg')
            .should('have.class', 'fa-square-check')
        cy.readStoreValue('state.layers.activeLayers')
            .should('have.length', 1)
            .then((layers) => {
                cy.wrap(layers[0].name).should('be.equal', itemName)
                cy.wrap(layers[0].externalLayerId).should('be.equal', itemId)
                cy.wrap(layers[0].visible).should('be.true')
                cy.wrap(layers[0].opacity).should('be.equal', 1)
                cy.wrap(layers[0].isExternal).should('be.true')
            })
        cy.get(`[data-cy="catalogue-tree-item-name-${itemFullId}"]`).should('be.visible').click()
        cy.readStoreValue('state.layers.activeLayers').should('have.length', 0)
        cy.get(`[data-cy="catalogue-add-layer-button-${itemFullId}"]`).should('be.visible').click()
        cy.readStoreValue('state.layers.activeLayers')
            .should('have.length', 1)
            .then((layers) => {
                cy.wrap(layers[0].name).should('be.equal', itemName)
            })

        //---------------------------------------------------------------------------------
        cy.log('Check that the group of layer has been added to the map')
        cy.checkOlLayer([bgLayer, `${itemId}-1`, `${itemId}-2`, `${itemId}-3`])

        //---------------------------------------------------------------------------------
        cy.log('Toggle the sub layers')
        const firstSubItemId = 'WMS|https://wms.geo.admin.ch/?|ch.swisstopo-vd.official-survey-1'
        const firstSubItemName = 'OpenData-AV 1'
        cy.get(`[data-cy="catalogue-collapse-layer-button-${itemFullId}"]`)
            .should('be.visible')
            .find('svg')
            .should('have.class', 'fa-circle-plus')
        cy.get(`[data-cy="catalogue-collapse-layer-button-${itemFullId}"]`)
            .should('be.visible')
            .click()
        cy.get(`[data-cy="catalogue-collapse-layer-button-${itemFullId}"]`)
            .should('be.visible')
            .find('svg')
            .should('have.class', 'fa-circle-minus')
        cy.get(`[data-cy="catalogue-tree-item-${firstSubItemId}"]`).contains(firstSubItemName)
        cy.get(`[data-cy="catalogue-collapse-layer-button-${itemFullId}"]`)
            .should('be.visible')
            .click()
        cy.get(`[data-cy="catalogue-collapse-layer-button-${itemFullId}"]`)
            .should('be.visible')
            .find('svg')
            .should('have.class', 'fa-circle-plus')
        cy.get(`[data-cy="catalogue-tree-item-${firstSubItemId}"]`).should('not.be.visible')
        cy.get(`[data-cy="catalogue-collapse-layer-button-${itemFullId}"]`)
            .should('be.visible')
            .click()

        //---------------------------------------------------------------------------------
        cy.log('Add the sub layers')
        cy.get(`[data-cy="catalogue-tree-item-name-${firstSubItemId}"]`)
            .should('be.visible')
            .click()
        cy.get(`[data-cy="catalogue-add-layer-button-${firstSubItemId}"]`)
            .should('have.class', 'text-primary')
            .find('svg')
            .should('have.class', 'fa-square-check')
        cy.readStoreValue('state.layers.activeLayers')
            .should('have.length', 2)
            .then((layers) => {
                cy.wrap(layers[1].name).should('be.equal', firstSubItemName)
            })

        //---------------------------------------------------------------------------------
        cy.log('Check sub layer zoom to extent')
        cy.get(`[data-cy="catalogue-zoom-extent-button-${firstSubItemId}"]`).should('be.visible')
        const layerExtentGraubunden = 'ch.vbs.bundestankstellen-bebeco'
        const itemExtentGraubunden = `WMS|https://wms.geo.admin.ch/?|${layerExtentGraubunden}`
        cy.get(`[data-cy="catalogue-tree-item-${itemExtentGraubunden}"]`).scrollIntoView()
        cy.get(`[data-cy="catalogue-zoom-extent-button-${itemExtentGraubunden}"]`)
            .should('be.visible')
            .click()
        cy.readStoreValue('state.position.center')
            .should('have.length', 2)
            .then(($center) => {
                // expected center, see https://s.geo.admin.ch/v6gi8a9w4o1e
                const expectedCenter = [2764440, 1187890]
                cy.wrap($center[0]).should('be.closeTo', expectedCenter[0], 5)
                cy.wrap($center[1]).should('be.closeTo', expectedCenter[1], 5)
            })
        cy.readStoreValue('state.position.zoom').should('be.closeTo', 3, 1)
        if (isMobile()) {
            // on mobile the menu button should have been closed
            cy.get('[data-cy="menu-tray"]').should('not.be.visible')
            cy.get('[data-cy="menu-button"]').should('be.visible').click()
        }

        //---------------------------------------------------------------------------------
        cy.log('Check sub layer show legend')
        cy.intercept(
            {
                method: 'GET',
                hostname: 'wms.geo.admin.ch',
                query: {
                    service: 'WMS',
                    request: 'GetLegendGraphic',
                    layer: 'ch.swisstopo-vd.official-survey-3',
                },
            },
            {
                statusCode: 200,
                fixture: 'import-tool/legend.png',
            }
        ).as('getLegendOfficialSurvey3')
        const lastSubItemId = 'WMS|https://wms.geo.admin.ch/?|ch.swisstopo-vd.official-survey-3'
        const lastSubItemTitle = 'OpenData-AV 3'
        cy.get(`[data-cy="catalogue-tree-item-info-${lastSubItemId}"]`).should('be.visible').click()
        cy.wait('@getLegendOfficialSurvey3')
        cy.get(`[data-cy="modal-with-backdrop-title"]`)
            .should('be.visible')
            .contains(lastSubItemTitle)
        cy.get(`[data-cy="layer-legend-popup-description-title"]`).should('be.visible')
        cy.get(`[data-cy="layer-legend-popup-description-body"]`)
            .should('be.visible')
            .contains('OpenData-AV 3 abstract')
        cy.get(`[data-cy="layer-legend-popup-legends-title"]`).should('be.visible')
        cy.get(`[data-cy^="layer-legend-popup-legends-body-"]`).should('be.visible')
        cy.get('[data-cy="modal-close-button"]').click()

        //---------------------------------------------------------------------------------
        cy.log('Check sub layer show legend with only abstract')
        const legendAbstractOnlyItemId =
            'WMS|https://wms.geo.admin.ch/?|ch.bafu.naqua-grundwasser_nitrat'
        const legendAbstractOnlyItemTitle = 'Groundwater: Nitrate'
        cy.get(`[data-cy="catalogue-tree-item-info-${legendAbstractOnlyItemId}"]`)
            .should('be.visible')
            .click()

        cy.get(`[data-cy="modal-with-backdrop-title"]`)
            .should('be.visible')
            .contains(legendAbstractOnlyItemTitle)
        cy.get(`[data-cy="layer-legend-popup-description-title"]`).should('be.visible')
        cy.get(`[data-cy="layer-legend-popup-description-body"]`)
            .should('be.visible')
            .contains('Nitrates are an essential food for plants.')
        cy.get(`[data-cy="layer-legend-popup-legends-title"]`).should('not.exist')
        cy.get(`[data-cy^="layer-legend-popup-legends-body-"]`).should('not.exist')
        cy.get('[data-cy="modal-close-button"]').click()

        //---------------------------------------------------------------------------------
        cy.log('Check sub layer show legend without abstract')
        const legendWithoutAbstractLayerId = 'ch.swisstopo-vd.official-survey-2'
        const legendWithoutAbstractItemId = `WMS|https://wms.geo.admin.ch/?|${legendWithoutAbstractLayerId}`
        const legendWithoutAbstractItemTitle = 'OpenData-AV 2'
        cy.intercept(
            {
                method: 'GET',
                hostname: 'wms.geo.admin.ch',
                query: {
                    service: 'WMS',
                    request: 'GetLegendGraphic',
                    layer: legendWithoutAbstractLayerId,
                },
            },
            {
                statusCode: 200,
                fixture: 'import-tool/legend.png',
            }
        ).as('getLegendOfficialSurvey2')
        cy.get(`[data-cy="catalogue-tree-item-info-${legendWithoutAbstractItemId}"]`)
            .should('be.visible')
            .click()
        cy.wait('@getLegendOfficialSurvey2')
        cy.get(`[data-cy="modal-with-backdrop-title"]`)
            .should('be.visible')
            .contains(legendWithoutAbstractItemTitle)
        cy.get(`[data-cy="layer-legend-popup-description-title"]`).should('not.exist')
        cy.get(`[data-cy="layer-legend-popup-description-body"]`).should('not.exist')
        cy.get(`[data-cy="layer-legend-popup-legends-title"]`).should('be.visible')
        cy.get(`[data-cy^="layer-legend-popup-legends-body-"]`).should('be.visible')
        cy.get('[data-cy="modal-close-button"]').click()

        //-----------------------------------------------------------------------------------------
        cy.log('Second external layer should be a single layer')
        const singleLayerId = 'ch.vbs.armeelogistikcenter'
        const singleLayerFullId = `WMS|https://wms.geo.admin.ch/?|${singleLayerId}`
        const singleLayerName = 'Centres logistiques de l`armée CLA'
        cy.get(`[data-cy="catalogue-tree-item-${singleLayerFullId}"]`)
            .should('be.visible')
            .within(() => {
                cy.contains(singleLayerName)
                cy.get('[data-cy^="catalogue-add-layer-button"]').should('be.visible')
                cy.get('[data-cy^="catalogue-collapse-layer-button"]').should('not.exist')
                cy.get('[data-cy^="catalogue-zoom-extent-button"]').should('be.visible')
                cy.get('[data-cy^="catalogue-tree-item-info"]').should('be.visible')
            })

        //-----------------------------------------------------------------------------------------
        cy.log('Add a single layer')
        cy.get(`[data-cy="catalogue-tree-item-name-${singleLayerFullId}"]`).click()
        cy.get(`[data-cy="catalogue-add-layer-button-${singleLayerFullId}"]`)
            .should('have.class', 'text-primary')
            .find('svg')
            .should('have.class', 'fa-square-check')
        cy.readStoreValue('state.layers.activeLayers')
            .should('have.length', 3)
            .then((layers) => {
                cy.wrap(layers[2].name).should('be.equal', singleLayerName)
                cy.wrap(layers[2].externalLayerId).should('be.equal', singleLayerId)
                cy.wrap(layers[2].visible).should('be.true')
                cy.wrap(layers[2].opacity).should('be.equal', 1)
                cy.wrap(layers[2].isExternal).should('be.true')
            })

        //---------------------------------------------------------------------------------
        cy.log('Check that the single layer has been added to the map')
        // NOTE here below itemId-1 should be present twice, one from the group of layer itemId and
        // once as single layer
        cy.checkOlLayer([
            bgLayer,
            `${itemId}-1`,
            `${itemId}-2`,
            `${itemId}-3`,
            `${itemId}-1`,
            singleLayerId,
        ])

        //-----------------------------------------------------------------------------------------
        cy.log('Toggle import menu')
        cy.get('[data-cy="menu-advanced-tools-import_maps"]').should('have.class', 'text-primary')
        cy.get('[data-cy="menu-advanced-tools-import_maps"]').should('be.visible').click()
        cy.get('[data-cy="menu-advanced-tools-import_maps"]').should(
            'not.have.class',
            'text-primary'
        )
        cy.get('[data-cy="import-catalog-content"]').should('not.be.visible')
        cy.get('[data-cy="menu-advanced-tools-import_maps"]').click()
        cy.get('[data-cy="menu-advanced-tools-import_maps"]').should('have.class', 'text-primary')
        cy.get('[data-cy="import-catalog-content"]').should('be.visible')
        cy.get('[data-cy="import-catalogue-input"]')
            .should('be.visible')
            .should('have.value', 'https://wms.geo.admin.ch/')
        cy.get(`[data-cy="catalogue-tree-item-${itemFullId}"]`)
            .should('be.visible')
            .contains(itemName)

        //------------------------------------------------------------------------------------------
        cy.log('Search in external layers')
        cy.get(`[data-cy="catalogue-tree-item-${itemExtentGraubunden}"]`).should('not.be.visible')
        cy.get('[data-cy="search-catalogue-input"]').should('be.visible').type('bebe')
        cy.get('[data-cy="search-catalogue-clear"]').should('be.visible')
        cy.get(`[data-cy="catalogue-tree-item-${itemExtentGraubunden}"]`).should('be.visible')
        cy.get('[data-cy^="catalogue-tree-item-name-"]:visible').should('have.length', 1)
        cy.get('[data-cy="search-catalogue-clear"]').click()
        cy.get('[data-cy^="catalogue-tree-item-name-"]:visible').should('have.length', 6)
        cy.get('[data-cy="search-catalogue-input"]').should('be.visible').type(firstSubItemName)
        cy.get('[data-cy^="catalogue-tree-item-name-"]:visible').should('have.length', 2)
        cy.get(`[data-cy="catalogue-tree-item-${firstSubItemId}"]`).should('be.visible')
        cy.get(`[data-cy="catalogue-tree-item-${itemFullId}"]`).should('be.visible')
        cy.get('[data-cy="menu-advanced-tools-import_maps"]').should('be.visible').click()
        cy.get('[data-cy="menu-advanced-tools-import_maps"]').should('be.visible').click()
        cy.get('[data-cy^="catalogue-tree-item-name-"]:visible').should('have.length', 2)
        cy.get('[data-cy="search-catalogue-input"]')
            .should('be.visible')
            .should('have.value', firstSubItemName)

        //---------------------------------------------------------------------
        cy.log('Check layer map attribution')
        cy.get('[data-cy="menu-active-layers"]').should('be.visible').click()
        cy.get('[data-cy="menu-external-disclaimer-icon"]')
            .should('have.length', 3)
            .first()
            .should('be.visible')
            .click()
        cy.get('[data-cy="modal-content"]').contains(
            'Warning: Third party data and/or style shown (Das Geoportal des Bundes)'
        )
        cy.get('[data-cy="modal-close-button"]').should('be.visible').click()
        if (isMobile()) {
            cy.get('[data-cy="menu-button"]').click()
        }
        cy.get('[data-cy="layer-copyright-Das Geoportal des Bundes"]')
            .should('be.visible')
            .contains('Das Geoportal des Bundes')

        //---------------------------------------------------------------------
        cy.log('Reload should keep the layers')
        cy.reload()
        cy.waitMapIsReady()
        cy.wait('@wms-get-capabilities')
        cy.openMenuIfMobile()
        cy.get('[data-cy="menu-section-active-layers"]:visible').children().should('have.length', 3)
        cy.get(`[data-cy^="active-layer-name-${singleLayerFullId}-"]`).should('be.visible')
        cy.get(`[data-cy^="button-loading-metadata-spinner-${singleLayerFullId}-"]`).should(
            'not.exist'
        )
        cy.get(`[data-cy^="active-layer-name-${firstSubItemId}-"]`).should('be.visible')
        cy.get(`[data-cy^="button-loading-metadata-spinner-${firstSubItemId}-"]`).should(
            'not.exist'
        )
        cy.get(`[data-cy^="active-layer-name-${itemFullId}-"]`).should('be.visible')
        cy.get(`[data-cy^="button-loading-metadata-spinner-${itemFullId}-"]`).should('not.exist')
    })
    it('Import external WMTS layers', () => {
        cy.intercept(
            {
                url: 'https://wmts.geo.admin.ch/1.0.0/WMTSCapabilities.xml*',
            },
            { fixture: 'import-tool/wmts-geo-admin-get-capabilities.xml' }
        ).as('wmts-get-capabilities')

        //-----------------------------------------------------------------------------------------
        cy.log('Select an external WMTS provider')
        cy.get('[data-cy="menu-tray-tool-section"]').should('be.visible').click()
        cy.get('[data-cy="menu-advanced-tools-import-catalogue"]').should('be.visible').click()
        cy.get('[data-cy="import-catalogue-input"]').should('be.visible').type('wmts.geo.admin')
        cy.get('[data-cy="import-provider-list"]')
            .children()
            .contains('https://wmts.geo.admin.ch')
            .click()
        cy.wait('@wmts-get-capabilities')
        cy.get('[data-cy="import-catalog-content"]')
            .find('[data-cy^=catalogue-tree-item-name-]')
            .should('have.length', 4)

        //-----------------------------------------------------------------------------------------
        cy.log('Add a WMTS layer')
        const layer1Id = 'layer1'
        const layer1FullId = `WMTS|https://wmts.geo.admin.ch/1.0.0/WMTSCapabilities.xml|${layer1Id}`
        const layer1Name = 'Layer 1'

        cy.get(`[data-cy="catalogue-tree-item-${layer1FullId}"]`)
            .should('be.visible')
            .contains(layer1Name)
        cy.get(`[data-cy="catalogue-collapse-layer-button-${layer1FullId}"]`).should('not.exist')
        cy.get(`[data-cy="catalogue-zoom-extent-button-${layer1FullId}"]`).should('be.visible')
        cy.get(`[data-cy="catalogue-tree-item-info-${layer1FullId}"]`).should('be.visible')
        cy.get(`[data-cy="catalogue-add-layer-button-${layer1FullId}"]`)
            .should('be.visible')
            .click()
        cy.get(`[data-cy="catalogue-tree-item-name-${layer1FullId}"]`).should(
            'have.class',
            'text-primary'
        )
        cy.get(`[data-cy="catalogue-add-layer-button-${layer1FullId}"]`)
            .should('have.class', 'text-primary')
            .find('svg')
            .should('have.class', 'fa-square-check')
        cy.readStoreValue('state.layers.activeLayers')
            .should('have.length', 1)
            .then((layers) => {
                cy.wrap(layers[0].name).should('be.equal', layer1Name)
                cy.wrap(layers[0].externalLayerId).should('be.equal', layer1Id)
                cy.wrap(layers[0].visible).should('be.true')
                cy.wrap(layers[0].opacity).should('be.equal', 1)
                cy.wrap(layers[0].isExternal).should('be.true')
            })
        cy.checkOlLayer([bgLayer, layer1Id])

        //-----------------------------------------------------------------------------------------
        cy.log('Add a layer without title')
        const layer2Id = 'layer2'
        const layer2FullId = `WMTS|https://wmts.geo.admin.ch/1.0.0/WMTSCapabilities.xml|${layer2Id}`
        const layer2Name = 'layer2'

        cy.get(`[data-cy="catalogue-tree-item-${layer2FullId}"]`)
            .should('be.visible')
            .contains(layer2Name)
        cy.get(`[data-cy="catalogue-collapse-layer-button-${layer2FullId}"]`).should('not.exist')
        cy.get(`[data-cy="catalogue-zoom-extent-button-${layer2FullId}"]`).should('not.exist')
        cy.get(`[data-cy="catalogue-tree-item-info-${layer2FullId}"]`).should('not.exist')
        cy.get(`[data-cy="catalogue-add-layer-button-${layer2FullId}"]`)
            .should('be.visible')
            .click()
        cy.get(`[data-cy="catalogue-tree-item-name-${layer2FullId}"]`).should(
            'have.class',
            'text-primary'
        )
        cy.get(`[data-cy="catalogue-add-layer-button-${layer2FullId}"]`)
            .should('have.class', 'text-primary')
            .find('svg')
            .should('have.class', 'fa-square-check')
        cy.readStoreValue('state.layers.activeLayers')
            .should('have.length', 2)
            .then((layers) => {
                cy.wrap(layers[1].name).should('be.equal', layer2Name)
                cy.wrap(layers[1].externalLayerId).should('be.equal', layer2Id)
                cy.wrap(layers[1].visible).should('be.true')
                cy.wrap(layers[1].opacity).should('be.equal', 1)
                cy.wrap(layers[1].isExternal).should('be.true')
            })
        cy.checkOlLayer([bgLayer, layer1Id, layer2Id])

        //---------------------------------------------------------------------------------
        cy.log('Check layer 1 show legend')
        cy.intercept('https://wmts.geo.admin.ch/legends/layer1.png', {
            fixture: 'import-tool/legend.png',
        }).as('wmts-legend')
        cy.get(`[data-cy="catalogue-tree-item-info-${layer1FullId}"]`).should('be.visible').click()
        cy.wait('@wmts-legend')
        cy.get(`[data-cy="modal-with-backdrop-title"]`).should('be.visible').contains(layer1Name)
        cy.get(`[data-cy="layer-legend-popup-description-title"]`).should('be.visible')
        cy.get(`[data-cy="layer-legend-popup-description-body"]`)
            .should('be.visible')
            .contains('This is layer 1')
        cy.get(`[data-cy="layer-legend-popup-legends-title"]`).should('be.visible')
        cy.get(`[data-cy^="layer-legend-popup-legends-body-"]`)
            .should('be.visible')
            .find('img')
            .should('be.visible')
        cy.get('[data-cy="modal-close-button"]').click()

        //---------------------------------------------------------------------
        cy.log('Check layer map attribution')
        cy.get('[data-cy="menu-active-layers"]').should('be.visible').click()
        cy.get('[data-cy="menu-external-disclaimer-icon"]')
            .should('have.length', 2)
            .first()
            .should('be.visible')
            .click()
        cy.get('[data-cy="modal-content"]').contains(
            'Warning: Third party data and/or style shown (My Organization)'
        )
        cy.get('[data-cy="modal-close-button"]').should('be.visible').click()
        if (isMobile()) {
            cy.get('[data-cy="menu-button"]').click()
        }
        cy.get('[data-cy="layer-copyright-My Organization"]')
            .should('be.visible')
            .contains('My Organization')
    })
    it('handles error correctly', () => {
        //-----------------------------------------------------------------------------------------
        cy.log('Select an unreachable external WMTS provider')
        cy.intercept(
            {
                url: 'https://wmts.geo.admin.ch/1.0.0/WMTSCapabilities.xml*',
            },
            { forceNetworkError: true }
        ).as('wmts-get-capabilities-unreachable')

        cy.get('[data-cy="menu-tray-tool-section"]').should('be.visible').click()
        cy.get('[data-cy="menu-advanced-tools-import-catalogue"]').should('be.visible').click()
        cy.get('[data-cy="import-catalogue-input"]').should('be.visible').type('wmts.geo.admin')
        cy.get('[data-cy="import-provider-list"]')
            .children()
            .contains('https://wmts.geo.admin.ch')
            .click()
        cy.wait('@wmts-get-capabilities-unreachable')
        cy.get('[data-cy="import-catalogue-input"]').should('have.class', 'is-invalid')
        cy.get('[data-cy="import-catalogue-input"]').should('not.have.class', 'is-valid')
        cy.get('[data-cy="import-catalog-invalid-feedback"]')
            .should('be.visible')
            .contains('Network error')
        cy.get('[data-cy="import-catalog-content"]')
            .find('[data-cy^="catalogue-tree-item-"]')
            .should('have.length', 0)

        cy.get('[data-cy="import-input-clear"]').should('be.visible').click()
        cy.get('[data-cy="import-catalogue-providers-toggle"]').should('be.visible').click()
        cy.get('[data-cy="import-catalogue-input"]').should('not.have.class', 'is-invalid')
        cy.get('[data-cy="import-catalogue-input"]').should('not.have.class', 'is-valid')
        cy.get('[data-cy="import-catalog-invalid-feedback"]').should('not.exist')

        //-----------------------------------------------------------------------------------------
        cy.log('Select an external WMTS provider which returns an error')
        cy.intercept(
            {
                url: 'https://wmts.geo.admin.ch/1.0.0/WMTSCapabilities.xml*',
            },
            { statusCode: 400 }
        ).as('wmts-get-capabilities-unreachable')

        cy.get('[data-cy="menu-advanced-tools-import-catalogue"]').should('be.visible').click()
        cy.get('[data-cy="import-catalogue-input"]').should('be.visible').type('wmts.geo.admin')
        cy.get('[data-cy="import-provider-list"]')
            .children()
            .contains('https://wmts.geo.admin.ch')
            .click()
        cy.wait('@wmts-get-capabilities-unreachable')
        cy.get('[data-cy="import-catalogue-input"]').should('have.class', 'is-invalid')
        cy.get('[data-cy="import-catalogue-input"]').should('not.have.class', 'is-valid')
        cy.get('[data-cy="import-catalog-invalid-feedback"]')
            .should('be.visible')
            .contains('Network error')
        cy.get('[data-cy="import-catalog-content"]')
            .find('[data-cy^="catalogue-tree-item-"]')
            .should('have.length', 0)

        cy.get('[data-cy="import-input-clear"]').should('be.visible').click()
        cy.get('[data-cy="import-catalogue-providers-toggle"]').should('be.visible').click()
        cy.get('[data-cy="import-catalogue-input"]').should('not.have.class', 'is-invalid')
        cy.get('[data-cy="import-catalogue-input"]').should('not.have.class', 'is-valid')
        cy.get('[data-cy="import-catalog-invalid-feedback"]').should('not.exist')

        //-----------------------------------------------------------------------------------------
        cy.log('Select an external WMTS provider which return an invalid content type')
        cy.intercept(
            {
                url: 'https://wmts.geo.admin.ch/1.0.0/WMTSCapabilities.xml*',
            },
            { body: 'Invalid body' }
        ).as('wmts-get-capabilities-unreachable')
        cy.get('[data-cy="menu-advanced-tools-import-catalogue"]').should('be.visible').click()
        cy.get('[data-cy="import-catalogue-input"]').should('be.visible').type('wmts.geo.admin')
        cy.get('[data-cy="import-provider-list"]')
            .children()
            .contains('https://wmts.geo.admin.ch')
            .click()
        cy.wait('@wmts-get-capabilities-unreachable')
        cy.get('[data-cy="import-catalogue-input"]').should('have.class', 'is-invalid')
        cy.get('[data-cy="import-catalogue-input"]').should('not.have.class', 'is-valid')
        cy.get('[data-cy="import-catalog-invalid-feedback"]')
            .should('be.visible')
            .contains('Unsupported response content type')
        cy.get('[data-cy="import-catalog-content"]')
            .find('[data-cy^="catalogue-tree-item-"]')
            .should('have.length', 0)

        cy.get('[data-cy="import-input-clear"]').should('be.visible').click()
        cy.get('[data-cy="import-catalogue-providers-toggle"]').should('be.visible').click()
        cy.get('[data-cy="import-catalogue-input"]').should('not.have.class', 'is-invalid')
        cy.get('[data-cy="import-catalogue-input"]').should('not.have.class', 'is-valid')
        cy.get('[data-cy="import-catalog-invalid-feedback"]').should('not.exist')

        //-----------------------------------------------------------------------------------------
        cy.log('Select an external WMTS provider which return an invalid xml')
        cy.intercept(
            {
                url: 'https://wmts.geo.admin.ch/1.0.0/WMTSCapabilities.xml*',
            },
            {
                body: '<xml>Not a valid xml get capabilities</xml>',
                headers: { 'Content-Type': 'text/xml' },
            }
        ).as('wmts-get-capabilities-unreachable')
        cy.get('[data-cy="menu-advanced-tools-import-catalogue"]').should('be.visible').click()
        cy.get('[data-cy="import-catalogue-input"]').should('be.visible').type('wmts.geo.admin')
        cy.get('[data-cy="import-provider-list"]')
            .children()
            .contains('https://wmts.geo.admin.ch')
            .click()
        cy.wait('@wmts-get-capabilities-unreachable')
        cy.get('[data-cy="import-catalogue-input"]').should('have.class', 'is-invalid')
        cy.get('[data-cy="import-catalogue-input"]').should('not.have.class', 'is-valid')
        cy.get('[data-cy="import-catalog-invalid-feedback"]')
            .should('be.visible')
            .contains('Unsupported response content type')
        cy.get('[data-cy="import-catalog-content"]')
            .find('[data-cy^="catalogue-tree-item-"]')
            .should('have.length', 0)

        cy.get('[data-cy="import-input-clear"]').should('be.visible').click()
        cy.get('[data-cy="import-catalogue-providers-toggle"]').should('be.visible').click()
        cy.get('[data-cy="import-catalogue-input"]').should('not.have.class', 'is-invalid')
        cy.get('[data-cy="import-catalogue-input"]').should('not.have.class', 'is-valid')
        cy.get('[data-cy="import-catalog-invalid-feedback"]').should('not.exist')
    })
})
