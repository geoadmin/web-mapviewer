/// <reference types="cypress" />

import useLayersStore from '@/store/modules/layers'
import usePositionStore from '@/store/modules/position'

import { isMobile } from '../support/utils'

describe('The Import Maps Tool', () => {
    const bgLayer = 'test.background.layer2'
    beforeEach(() => {
        cy.goToMapView({ withHash: true })
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
        cy.get('[data-cy="import-catalogue-input"]').should('be.visible').type('Wms.geo.AdmiN')
        // Item with the filtered text should be visible (it means the group is also expanded)
        cy.get('[data-cy="import-provider-item"]')
            .contains('https://wms.geo.admin.ch')
            .should('be.visible')

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
        cy.get('[data-cy="import-provider-item"]')
            .contains('https://wms.geo.admin.ch')
            .should('be.visible')
        // Select the first one
        cy.get('[data-cy="import-provider-item"]')
            .contains('https://wms.geo.admin.ch')
            .first()
            .click()
        cy.wait('@wms-get-capabilities')

        //-----------------------------------------------------------------------------------------
        cy.log('First external layer should be group of layers')
        const itemId = 'ch.swisstopo-vd.official-survey'
        const itemName = 'Beta OpenData-AV'
        cy.get(`[data-cy="catalogue-tree-item-${itemId}"]`).should('be.visible').contains(itemName)
        cy.get(`[data-cy="catalogue-add-layer-button-${itemId}"]`).should('be.visible')
        cy.get(`[data-cy="catalogue-collapse-layer-button-${itemId}"]`).should('be.visible')
        cy.get(`[data-cy="catalogue-zoom-extent-button-${itemId}"]`).should('be.visible')
        cy.get(`[data-cy="catalogue-tree-item-info-${itemId}"]`).should('not.exist')

        //---------------------------------------------------------------------------------
        cy.log('Add group of layer')
        cy.getPinia().then((pinia) => {
            const layersStore = useLayersStore(pinia)
            expect(layersStore.activeLayers).to.have.length(0)
        })
        cy.get(`[data-cy="catalogue-tree-item-name-${itemId}"]`).should('be.visible').click()
        cy.get(`[data-cy="catalogue-add-layer-button-${itemId}"]`)
            .should('have.class', 'text-primary')
            .find('svg')
            .should('have.class', 'fa-square-check')
        cy.getPinia().then((pinia) => {
            const layersStore2 = useLayersStore(pinia)
            const layers = layersStore2.activeLayers
            expect(layers).to.have.length(1)
            cy.wrap(layers[0]?.name).should('be.equal', itemName)
            cy.wrap(layers[0]?.id).should('be.equal', itemId)
            cy.wrap(layers[0]?.isVisible).should('be.true')
            cy.wrap(layers[0]?.opacity).should('be.equal', 1)
            cy.wrap(layers[0]?.isExternal).should('be.true')
        })

        cy.get(`[data-cy="catalogue-tree-item-name-${itemId}"]`).should('be.visible').click()
        cy.getPinia().then((pinia) => {
            const layersStore3 = useLayersStore(pinia)
            expect(layersStore3.activeLayers).to.have.length(0)
        })
        cy.get(`[data-cy="catalogue-add-layer-button-${itemId}"]`).should('be.visible').click()
        cy.getPinia().then((pinia) => {
            const layersStore4 = useLayersStore(pinia)
            const layers2 = layersStore4.activeLayers
            expect(layers2).to.have.length(1)
            cy.wrap(layers2[0]?.name).should('be.equal', itemName)
        })

        //---------------------------------------------------------------------------------
        cy.log('Check that the group of layer has been added to the map')
        cy.checkOlLayer([bgLayer, itemId])

        //---------------------------------------------------------------------------------
        cy.log('Toggle the sub layers')
        const firstSubItemId = 'ch.swisstopo-vd.official-survey-1'
        const firstSubItemName = 'OpenData-AV 1'
        cy.get(`[data-cy="catalogue-collapse-layer-button-${itemId}"]`)
            .should('be.visible')
            .find('svg')
            .should('have.class', 'fa-caret-right')
        cy.get(`[data-cy="catalogue-collapse-layer-button-${itemId}"]`).should('be.visible').click()
        cy.get(`[data-cy="catalogue-collapse-layer-button-${itemId}"]`)
            .should('be.visible')
            .find('svg')
            .should('have.class', 'fa-caret-down')
        cy.get(`[data-cy="catalogue-tree-item-${firstSubItemId}"]`).contains(firstSubItemName)
        cy.get(`[data-cy="catalogue-collapse-layer-button-${itemId}"]`).should('be.visible').click()
        cy.get(`[data-cy="catalogue-collapse-layer-button-${itemId}"]`)
            .should('be.visible')
            .find('svg')
            .should('have.class', 'fa-caret-right')
        cy.get(`[data-cy="catalogue-tree-item-${firstSubItemId}"]`).should('not.exist')
        cy.get(`[data-cy="catalogue-collapse-layer-button-${itemId}"]`).should('be.visible').click()

        //---------------------------------------------------------------------------------
        cy.log('Add the sub layers')
        cy.get(`[data-cy="catalogue-tree-item-name-${firstSubItemId}"]`)
            .should('be.visible')
            .click()
        cy.getPinia().then((pinia) => {
            const layersStore9 = useLayersStore(pinia)
            const layers6 = layersStore9.activeLayers
            expect(layers6).to.have.length(2)
            cy.wrap(layers6[1]?.name).should('be.equal', firstSubItemName)
        })

        //---------------------------------------------------------------------------------
        cy.log('Check sub layer zoom to extent')
        cy.get(`[data-cy="catalogue-zoom-extent-button-${firstSubItemId}"]`).should('be.visible')
        const layerExtentGraubunden = 'ch.vbs.bundestankstellen-bebeco'
        cy.get(`[data-cy="catalogue-tree-item-${layerExtentGraubunden}"]`).scrollIntoView()
        cy.get(`[data-cy="catalogue-zoom-extent-button-${layerExtentGraubunden}"]`)
            .should('be.visible')
            .click()
        cy.getPinia().then((pinia) => {
            const positionStore = usePositionStore(pinia)
            const center = positionStore.center
            expect(center).to.have.length(2)
            const expectedCenter = [2764440, 1187890]
            cy.wrap(center[0]).should('be.closeTo', expectedCenter[0], 5)
            cy.wrap(center[1]).should('be.closeTo', expectedCenter[1], 5)
        })
        cy.getPinia().then((pinia) => {
            const positionStore2 = usePositionStore(pinia)
            expect(positionStore2.zoom).to.be.closeTo(3, 1)
        })
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
        const lastSubItemId = 'ch.swisstopo-vd.official-survey-3'
        const lastSubItemTitle = 'OpenData-AV 3'
        cy.get(`[data-cy="catalogue-tree-item-info-${lastSubItemId}"]`).should('be.visible').click()
        cy.wait('@getLegendOfficialSurvey3')
        cy.get(`[data-cy="simple-window-title"]`).should('be.visible').contains(lastSubItemTitle)
        cy.get(`[data-cy="layer-description-popup-description-title"]`).should('be.visible')
        cy.get(`[data-cy="layer-description-popup-description-body"]`)
            .should('be.visible')
            .contains('OpenData-AV 3 abstract')
        cy.get(`[data-cy="layer-description-popup-legends-title"]`).should('be.visible')
        cy.get(`[data-cy^="layer-description-popup-legends-body-"]`).should('be.visible')
        cy.get('[data-cy="window-close"]').click()

        //---------------------------------------------------------------------------------
        cy.log('Check sub layer show legend with only abstract')
        const legendAbstractOnlyItemId = 'ch.bafu.naqua-grundwasser_nitrat'
        const legendAbstractOnlyItemTitle = 'Groundwater: Nitrate'
        cy.get(`[data-cy="catalogue-tree-item-info-${legendAbstractOnlyItemId}"]`)
            .should('be.visible')
            .click()

        cy.get(`[data-cy="simple-window-title"]`)
            .should('be.visible')
            .contains(legendAbstractOnlyItemTitle)
        cy.get(`[data-cy="layer-description-popup-description-title"]`).should('be.visible')
        cy.get(`[data-cy="layer-description-popup-description-body"]`)
            .should('be.visible')
            .contains('Nitrates are an essential food for plants.')
        cy.get(`[data-cy="layer-description-popup-legends-title"]`).should('not.exist')
        cy.get(`[data-cy^="layer-description-popup-legends-body-"]`).should('not.exist')
        cy.get('[data-cy="window-close"]').click()

        //---------------------------------------------------------------------------------
        cy.log('Check sub layer show legend without abstract')
        const legendWithoutAbstractLayerId = 'ch.swisstopo-vd.official-survey-2'
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
        cy.get(`[data-cy="catalogue-tree-item-info-${legendWithoutAbstractLayerId}"]`)
            .should('be.visible')
            .click()
        cy.wait('@getLegendOfficialSurvey2')
        cy.get(`[data-cy="simple-window-title"]`)
            .should('be.visible')
            .contains(legendWithoutAbstractItemTitle)
        cy.get(`[data-cy="layer-description-popup-description-title"]`).should('not.exist')
        cy.get(`[data-cy="layer-description-popup-description-body"]`).should('not.exist')
        cy.get(`[data-cy="layer-description-popup-legends-title"]`).should('be.visible')
        cy.get(`[data-cy^="layer-description-popup-legends-body-"]`).should('be.visible')
        cy.get('[data-cy="window-close"]').click()

        //-----------------------------------------------------------------------------------------
        cy.log('Second external layer should be a single layer')
        const singleLayerId = 'ch.vbs.armeelogistikcenter'
        const singleLayerName = 'Centres logistiques de l`armée CLA'
        cy.get(`[data-cy="catalogue-tree-item-${singleLayerId}"]`)
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
        cy.get(`[data-cy="catalogue-tree-item-name-${singleLayerId}"]`).click()
        cy.get(`[data-cy="catalogue-add-layer-button-${singleLayerId}"]`)
            .should('have.class', 'text-primary')
            .find('svg')
            .should('have.class', 'fa-square-check')
        cy.getPinia().then((pinia) => {
            const layersStore5 = useLayersStore(pinia)
            const layers3 = layersStore5.activeLayers
            expect(layers3).to.have.length(3)
            cy.wrap(layers3[2]?.name).should('be.equal', singleLayerName)
            cy.wrap(layers3[2]?.id).should('be.equal', singleLayerId)
            cy.wrap(layers3[2]?.isVisible).should('be.true')
            cy.wrap(layers3[2]?.opacity).should('be.equal', 1)
            cy.wrap(layers3[2]?.isExternal).should('be.true')
        })

        //---------------------------------------------------------------------------------
        cy.log('Check that the single layer has been added to the map')
        cy.checkOlLayer([bgLayer, itemId, `${itemId}-1`, singleLayerId])

        //-----------------------------------------------------------------------------------------
        cy.log('Toggle import menu')
        cy.get('[data-cy="menu-advanced-tools-import_maps"]').should('have.class', 'text-primary')
        cy.get('[data-cy="menu-advanced-tools-import_maps"]').should('exist').click()
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
        cy.get(`[data-cy="catalogue-tree-item-${itemId}"]`).should('be.visible').contains(itemName)

        //------------------------------------------------------------------------------------------
        cy.log('Search in external layers')
        cy.get(`[data-cy="catalogue-tree-item-${layerExtentGraubunden}"]`).should('not.be.visible')
        cy.get('[data-cy="search-catalogue-input"]').should('be.visible').type('bebe')
        cy.get('[data-cy="search-catalogue-clear"]').should('be.visible')
        cy.get(`[data-cy="catalogue-tree-item-${layerExtentGraubunden}"]`).should('be.visible')
        cy.get('[data-cy^="catalogue-tree-item-name-"]:visible').should('have.length', 1)
        cy.get('[data-cy="search-catalogue-clear"]').click()
        cy.get('[data-cy^="catalogue-tree-item-name-"]:visible').should('have.length', 6)
        cy.get('[data-cy="search-catalogue-input"]').should('be.visible').type(firstSubItemName)
        cy.get('[data-cy^="catalogue-tree-item-name-"]:visible').should('have.length', 2)
        cy.get(`[data-cy="catalogue-tree-item-${firstSubItemId}"]`).should('be.visible')
        cy.get(`[data-cy="catalogue-tree-item-${itemId}"]`).should('be.visible')
        cy.get('[data-cy^="catalogue-tree-item-name-"]:visible').should('have.length', 2)
        cy.get('[data-cy="search-catalogue-input"]')
            .should('be.visible')
            .should('have.value', firstSubItemName)
        cy.get(`[data-cy="search-catalogue-clear"]`).click()

        //---------------------------------------------------------------------
        cy.log(`Check that long title are truncated and have a tooltip`)
        cy.get(`[data-cy="catalogue-tree-item-name-${singleLayerId}"]`).should('be.visible')
        cy.get(`[data-cy="catalogue-tree-item-name-${singleLayerId}"]`).trigger('mouseover')
        cy.get(`[data-cy="floating-catalogue-tree-item-name-${singleLayerId}"]`)
            .should('be.visible')
            .contains(singleLayerName)
            .trigger('mouseleave')
        cy.get('[data-cy="menu-advanced-tools-import_maps"]').click() // close the import

        cy.get('[data-cy="menu-button"]').click()
        cy.openMenuIfMobile()

        //---------------------------------------------------------------------
        cy.log('Check layer map attribution')
        cy.get('[data-cy="menu-active-layers"]').should('be.visible').click()
        cy.get('[data-cy="menu-external-disclaimer-icon-cloud"]').should('have.length', 0)
        cy.get('[data-cy="layer-copyright-Das Geoportal des Bundes"]')
            .should('be.visible')
            .contains('Das Geoportal des Bundes')
        cy.get('[data-cy="layer-copyright-Das Geoportal des Bundes"]').realHover()
        cy.get('[data-cy="layer-copyright-Das Geoportal des Bundes"]')
            .should('have.css', 'cursor', 'pointer')
            .should('have.attr', 'href', 'http://www.geo.admin.ch/')

        //---------------------------------------------------------------------
        cy.log('Reload should keep the layers')
        cy.reload()
        cy.waitMapIsReady()
        cy.wait('@wms-get-capabilities')
        cy.openMenuIfMobile()
        cy.get('[data-cy="menu-section-active-layers"]:visible').children().should('have.length', 3)
        cy.get(`[data-cy^="active-layer-name-${singleLayerId}-"]`).should('be.visible')
        cy.get(`[data-cy^="button-loading-metadata-spinner-${singleLayerId}-"]`).should('not.exist')
        cy.get(`[data-cy^="active-layer-name-${firstSubItemId}-"]`).should('be.visible')
        cy.get(`[data-cy^="button-loading-metadata-spinner-${firstSubItemId}-"]`).should(
            'not.exist'
        )
        cy.get(`[data-cy^="active-layer-name-${itemId}-"]`).should('be.visible')
        cy.get(`[data-cy^="button-loading-metadata-spinner-${itemId}-"]`).should('not.exist')

        // -----------------------------------------------------------
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
        // Item with the filtered text should be visible (it means the group is also expanded)
        cy.get('[data-cy="import-provider-group"]')
            .contains('https://wmts.geo.admin.ch')
            .should('be.visible')
        // Select the first provider under the group
        cy.get('[data-cy="import-provider-group"]')
            .contains('https://wmts.geo.admin.ch') // Ensure the group contains the desired text
            .parents('[data-cy="import-provider-group"]') // Navigate to the parent group first
            .find('[data-cy="import-provider-item"]') // Find the child items
            .first()
            .should('be.visible')
            .click()
        cy.wait('@wmts-get-capabilities')
        cy.get('[data-cy="import-catalog-content"]')
            .find('[data-cy^=catalogue-tree-item-name-]')
            .should('have.length', 4)

        //-----------------------------------------------------------------------------------------
        cy.log('Add a WMTS layer')
        const layer1Id = 'layer1'
        const layer1Name = 'Layer 1'

        cy.get(`[data-cy="catalogue-tree-item-${layer1Id}"]`)
            .should('be.visible')
            .contains(layer1Name)
        cy.get(`[data-cy="catalogue-collapse-layer-button-${layer1Id}"]`).should('not.exist')
        cy.get(`[data-cy="catalogue-zoom-extent-button-${layer1Id}"]`).should('be.visible')
        cy.get(`[data-cy="catalogue-tree-item-info-${layer1Id}"]`).should('be.visible')
        cy.get(`[data-cy="catalogue-add-layer-button-${layer1Id}"]`).should('be.visible').click()
        cy.get(`[data-cy="catalogue-tree-item-name-${layer1Id}"]`)
            .parents('.menu-catalogue-item-name')
            .should('have.class', 'text-primary')
        cy.get(`[data-cy="catalogue-add-layer-button-${layer1Id}"]`)
            .should('have.class', 'text-primary')
            .find('svg')
            .should('have.class', 'fa-square-check')
        cy.getPinia().then((pinia) => {
            const layersStore6 = useLayersStore(pinia)
            const layers4 = layersStore6.activeLayers
            expect(layers4).to.have.length(1)
            cy.wrap(layers4[0]?.name).should('be.equal', layer1Name)
            cy.wrap(layers4[0]?.id).should('be.equal', layer1Id)
            cy.wrap(layers4[0]?.isVisible).should('be.true')
            cy.wrap(layers4[0]?.opacity).should('be.equal', 1)
            cy.wrap(layers4[0]?.isExternal).should('be.true')
        })
        cy.checkOlLayer([bgLayer, layer1Id])

        //-----------------------------------------------------------------------------------------
        cy.log('Add a layer without title')
        const layer2Id = 'layer2'
        const layer2Name = 'layer2'

        cy.get(`[data-cy="catalogue-tree-item-${layer2Id}"]`)
            .should('be.visible')
            .contains(layer2Name)

        cy.get(`[data-cy="catalogue-collapse-layer-button-${layer2Id}"]`).should('not.exist')
        cy.get(`[data-cy="catalogue-zoom-extent-button-${layer2Id}"]`).should('not.exist')
        cy.get(`[data-cy="catalogue-tree-item-info-${layer2Id}"]`).should('not.exist')
        cy.get(`[data-cy="catalogue-add-layer-button-${layer2Id}"]`).should('be.visible').click()
        cy.get(`[data-cy="catalogue-tree-item-name-${layer2Id}"]`)
            .parents('.menu-catalogue-item-name')
            .should('have.class', 'text-primary')
        cy.get(`[data-cy="catalogue-add-layer-button-${layer2Id}"]`)
            .should('have.class', 'text-primary')
            .find('svg')
            .should('have.class', 'fa-square-check')
        cy.getPinia().then((pinia) => {
            const layersStore7 = useLayersStore(pinia)
            const layers5 = layersStore7.activeLayers
            expect(layers5).to.have.length(2)
            cy.wrap(layers5[1]?.name).should('be.equal', layer2Name)
            cy.wrap(layers5[1]?.id).should('be.equal', layer2Id)
            cy.wrap(layers5[1]?.isVisible).should('be.true')
            cy.wrap(layers5[1]?.opacity).should('be.equal', 1)
            cy.wrap(layers5[1]?.isExternal).should('be.true')
        })
        cy.checkOlLayer([bgLayer, layer1Id, layer2Id])

        //---------------------------------------------------------------------------------
        cy.log('Check layer 1 show legend')
        cy.intercept('https://wmts.geo.admin.ch/legends/layer1.png', {
            fixture: 'import-tool/legend.png',
        }).as('wmts-legend')
        cy.get(`[data-cy="catalogue-tree-item-info-${layer1Id}"]`).should('be.visible').click()
        cy.wait('@wmts-legend')
        cy.get(`[data-cy="simple-window-title"]`).should('be.visible').contains(layer1Name)
        cy.get(`[data-cy="layer-description-popup-description-title"]`).should('be.visible')
        cy.get(`[data-cy="layer-description-popup-description-body"]`)
            .should('be.visible')
            .contains('This is layer 1')
        cy.get(`[data-cy="layer-description-popup-legends-title"]`).should('be.visible')
        cy.get(`[data-cy^="layer-description-popup-legends-body-"]`)
            .should('be.visible')
            .find('img')
            .should('be.visible')
        cy.get('[data-cy="window-close"]').click()

        cy.get('[data-cy="menu-advanced-tools-import_maps"]').click() // close the import

        //---------------------------------------------------------------------
        cy.log('Check layer map attribution')
        cy.get('[data-cy="menu-active-layers"]').should('be.visible').click()
        cy.get('[data-cy="menu-external-disclaimer-icon-cloud"]').should('have.length', 0)
        cy.openMenuIfMobile()
        if (isMobile()) {
            cy.get('[data-cy="menu-button"]').click()
        }
        cy.get('[data-cy="layer-copyright-My Organization"]')
            .should('be.visible')
            .contains('My Organization')

        //---------------------------------------------------------------------
        cy.log('Check time series layers')
        cy.get('[data-cy="menu-button"]:visible').click()
        cy.get('[data-cy="time-selector-layer1-0"]').should('not.exist')
        cy.get('[data-cy="time-selector-layer2-1"]').should('be.visible').contains(2008).click()
        cy.get('[data-cy="time-select-20081024"]').should('be.visible').contains(2008)
        cy.get('[data-cy="time-select-20110805"]').should('be.visible').contains(2011).click()
        cy.get('[data-cy="time-selector-layer2-1"]').should('be.visible').contains(2011)

        cy.get('[data-cy="menu-tray-tool-section"]').should('be.visible').click()
        cy.get('[data-cy="menu-advanced-tools-import-catalogue"]').click() // open the import

        // Add a layer with non standard timestamp
        const layer4Name = 'Layer 4'
        const layer4Id = 'layer4'

        cy.get(`[data-cy="catalogue-tree-item-${layer4Id}"]`).should('be.visible')
        cy.get(`[data-cy="catalogue-tree-item-${layer4Id}"]`).should('contain', layer4Name)
        cy.get(`[data-cy="catalogue-collapse-layer-button-${layer4Id}"]`).should('not.exist')
        cy.get(`[data-cy="catalogue-zoom-extent-button-${layer4Id}"]`).should('be.visible')
        cy.get(`[data-cy="catalogue-add-layer-button-${layer4Id}"]`).should('be.visible').click()
        cy.get(`[data-cy="catalogue-tree-item-name-${layer4Id}"]`)
            .parents('.menu-catalogue-item-name')
            .should('have.class', 'text-primary')
        cy.get(`[data-cy="catalogue-add-layer-button-${layer4Id}"]`)
            .should('have.class', 'text-primary')
            .find('svg')
            .should('have.class', 'fa-square-check')

        cy.get('[data-cy="menu-advanced-tools-import_maps"]').click() // close the import

        cy.get('[data-cy="menu-button"]').should('be.visible').click()
        cy.openMenuIfMobile()

        cy.checkOlLayer([bgLayer, layer1Id, layer2Id, layer4Id])

        cy.get('[data-cy="menu-active-layers"]').should('be.visible').click()
        cy.get('[data-cy="active-layer-name-layer4-2"]').should('be.visible')
        cy.get('[data-cy="time-selector-layer4-2"]').should('not.exist')

        //-----------------------------------------------------------------------------------------
        cy.log('Reload and check that everything is still present')
        cy.reload()
        cy.checkOlLayer([bgLayer, layer1Id, layer2Id, layer4Id])
        cy.openMenuIfMobile()
        cy.get('[data-cy="active-layer-name-layer1-0"]').should('be.visible')
        cy.get('[data-cy="time-selector-layer1-0"]').should('not.exist')
        cy.get('[data-cy="active-layer-name-layer2-1"]').should('be.visible')
        cy.get('[data-cy="time-selector-layer2-1"]').should('be.visible').contains(2011)
        cy.get('[data-cy="active-layer-name-layer4-2"]').should('be.visible')
        cy.get('[data-cy="time-selector-layer4-2"]').should('not.exist')
    })

    it('Import an external WMS when it is in the URL and shows its third party disclaimer correctly', () => {
        // here : intercept fake.wms.base-1.url to give what we want
        cy.intercept(
            {
                https: true,
                hostname: 'fake.wms.base-1.url',
                query: { REQUEST: 'GetCapabilities' },
            },
            { fixture: 'external-wms-getcap-1.fixture.xml' }
        ).as('wms-get-capabilities')
        cy.intercept(
            {
                method: 'GET',
                hostname: 'fake.wms.base-1.url',
                query: { REQUEST: 'GetMap', LAYERS: 'ch.swisstopo-vd.official-survey' },
                middleware: true,
            },
            (request) => request.reply({ fixture: '256.png' })
        ).as('layer-1-getMap')
        cy.goToMapView({
            queryParams:
            {
                layers: 'WMS|https://fake.wms.base-1.url/?|ch.swisstopo-vd.official-survey',
            },
            withHash: true,
        })
        cy.openMenuIfMobile()
        cy.getPinia().then((pinia) => {
            const layersStore8 = useLayersStore(pinia)
            expect(layersStore8.activeLayers).to.have.length(1)
        })
        //cy.get('[data-cy="menu-active-layers"]').should('be.visible').click()
        cy.get('[data-cy="menu-external-disclaimer-icon-cloud"]')
            .should('have.length', 1)
            .first()
            .should('be.visible')
            .click()
        cy.get('[data-cy="modal-content"]').contains('Warning: Third party data and/or style shown')
        cy.get('[data-cy="modal-close-button"]').should('be.visible').click()
        if (isMobile()) {
            cy.get('[data-cy="menu-button"]').click()
        }
        cy.get('[data-cy="layer-copyright-The federal geoportal"]')
            .should('be.visible')
            .contains('The federal geoportal')
        cy.get('[data-cy="layer-copyright-The federal geoportal"]')
            .should('have.css', 'cursor', 'pointer')
            .should('have.class', 'text-primary')
            .should('have.attr', 'href', 'https://www.geo.admin.ch/attribution')
        cy.get('[data-cy="layer-copyright-The federal geoportal"]').trigger('mouseover')

        cy.get('[data-cy="floating-third-party-disclaimer"]')
            .should('be.visible')
            .contains('Dataset and/or style provided by third party')
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
        // Item with the filtered text should be visible (it means the group is also expanded)
        cy.get('[data-cy="import-provider-group"]')
            .contains('https://wmts.geo.admin.ch')
            .should('be.visible')
        // Select the first provider under the group
        cy.get('[data-cy="import-provider-group"]')
            .contains('https://wmts.geo.admin.ch') // Ensure the group contains the desired text
            .parents('[data-cy="import-provider-group"]') // Navigate to the parent group first
            .find('[data-cy="import-provider-item"]') // Find the child items
            .first()
            .should('be.visible')
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
        // Item with the filtered text should be visible (it means the group is also expanded)
        cy.get('[data-cy="import-provider-group"]')
            .contains('https://wmts.geo.admin.ch')
            .should('be.visible')
        // Select the first provider under the group
        cy.get('[data-cy="import-provider-group"]')
            .contains('https://wmts.geo.admin.ch') // Ensure the group contains the desired text
            .parents('[data-cy="import-provider-group"]') // Navigate to the parent group first
            .find('[data-cy="import-provider-item"]') // Find the child items
            .first()
            .should('be.visible')
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
        // Item with the filtered text should be visible (it means the group is also expanded)
        cy.get('[data-cy="import-provider-group"]')
            .contains('https://wmts.geo.admin.ch')
            .should('be.visible')
        // Select the first provider under the group
        cy.get('[data-cy="import-provider-group"]')
            .contains('https://wmts.geo.admin.ch') // Ensure the group contains the desired text
            .parents('[data-cy="import-provider-group"]') // Navigate to the parent group first
            .find('[data-cy="import-provider-item"]') // Find the child items
            .first()
            .should('be.visible')
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
        // Item with the filtered text should be visible (it means the group is also expanded)
        cy.get('[data-cy="import-provider-group"]')
            .contains('https://wmts.geo.admin.ch')
            .should('be.visible')
        // Select the first provider under the group
        cy.get('[data-cy="import-provider-group"]')
            .contains('https://wmts.geo.admin.ch') // Ensure the group contains the desired text
            .parents('[data-cy="import-provider-group"]') // Navigate to the parent group first
            .find('[data-cy="import-provider-item"]') // Find the child items
            .first()
            .should('be.visible')
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
