/// <reference types="cypress" />

import { encodeExternalLayerParam } from '@/api/layers/layers-external.api'
import { encodeLayerParam } from '@/router/storeSync/layersParamParser'

/**
 * This function is used as a parameter to `JSON.stringify` to remove all properties with the name
 * `lang`.
 *
 * @param {String} key The current property name.
 * @param {any} value The current value to stringify.
 * @returns {String} The string representation of the object.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#the_replacer_parameter
 */
const stringifyWithoutLangOrNull = (key, value) =>
    key === 'lang' || value === null ? undefined : value

describe('Test of layer handling', () => {
    const bgLayer = 'test.background.layer2'
    context('Layer in URL at app startup', () => {
        it('starts without any visible layer added opening the app without layers URL param', () => {
            cy.goToMapView()
            cy.readStoreValue('getters.visibleLayers').should('be.empty')
        })
        it('adds a layers with config to the map when opening the app layers URL param', () => {
            cy.goToMapView({
                layers: [
                    'test-1.wms.layer',
                    'test-2.wms.layer,,',
                    'test-3.wms.layer,f',
                    'test-4.wms.layer,,0.4',
                    'test.wmts.layer,f,0.5',
                ].join(';'),
            })
            cy.readStoreValue('getters.visibleLayers').then((layers) => {
                expect(layers).to.be.an('Array').length(3)
                expect(layers[0].id).to.eq('test-1.wms.layer')
                expect(layers[1].id).to.eq('test-2.wms.layer')
                expect(layers[2].id).to.eq('test-4.wms.layer')
                expect(layers[2].opacity).to.eq(0.4)
            })
            cy.readStoreValue('state.layers.activeLayers').then((layers) => {
                expect(layers).to.be.an('Array').length(5)
                expect(layers[0].id).to.eq('test-1.wms.layer')
                expect(layers[1].id).to.eq('test-2.wms.layer')
                expect(layers[2].id).to.eq('test-3.wms.layer')
                expect(layers[3].id).to.eq('test-4.wms.layer')
                expect(layers[3].opacity).to.eq(0.4)
                expect(layers[4].id).to.eq('test.wmts.layer')
                expect(layers[4].opacity).to.eq(0.5)
            })
        })
        it('uses the default timestamp of a time enabled layer when not specified in the URL', () => {
            const timeEnabledLayerId = 'test.timeenabled.wmts.layer'
            cy.goToMapView({
                layers: timeEnabledLayerId,
            })
            cy.readStoreValue('getters.visibleLayers').then((layers) => {
                const [timeEnabledLayer] = layers
                cy.fixture('layers.fixture.json').then((layersMetadata) => {
                    const timeEnabledLayerMetadata = layersMetadata[timeEnabledLayerId]
                    expect(timeEnabledLayer.timeConfig.currentTimestamp).to.eq(
                        timeEnabledLayerMetadata.timeBehaviour
                    )
                })
            })
        })
        it('sets the timestamp of a layer when specified in the layers URL param', () => {
            const timeEnabledLayerId = 'test.timeenabled.wmts.layer'
            cy.fixture('layers.fixture.json').then((layersMetadata) => {
                const timedLayerMetadata = layersMetadata[timeEnabledLayerId]
                cy.getRandomTimestampFromSeries(timedLayerMetadata).then(
                    (randomTimestampFromLayer) => {
                        cy.goToMapView({
                            layers: `${timeEnabledLayerId}@year=${randomTimestampFromLayer.substring(
                                0,
                                4
                            )}`,
                        })
                        cy.readStoreValue('getters.visibleLayers').then((layers) => {
                            const [timeEnabledLayer] = layers
                            expect(timeEnabledLayer.timeConfig.currentTimestamp).to.eq(
                                randomTimestampFromLayer
                            )
                        })
                    }
                )
            })
        })
        context('External layers', () => {
            // Fake WMS
            const fakeWmsBaseUrl1 = 'https://fake.wms.base-1.url/?'
            const fakeWmsBaseUrl2 = 'https://fake.wms.base-2.url/?'

            const fakeWmsLayerId1 = 'ch.swisstopo-vd.official-survey'
            const fakeWmsLayerId2 = 'Periodic Tracking, with | comma & @ ; äö'
            const fakeWmsLayerId3 = 'ch.swisstopo-vd.spannungsarme-gebiete-2'
            const fakeWmsLayerId4 = 'ch.swisstopo-vd.stand-oerebkataster-2'

            const fakeWmsLayerName1 = 'OpenData-AV'
            const fakeWmsLayerName2 = 'Periodic Tracking, with | comma & @ ; äö'
            const fakeWmsLayerName3 = 'Spannungsarme Gebiete 2'
            const fakeWmsLayerName4 = 'Verfügbarkeit des ÖREB-Katasters 2'

            // format is WMS|BASE_URL|LAYER_IDS
            const fakeWmsLayerUrlId1 = `WMS|${fakeWmsBaseUrl1}|${fakeWmsLayerId1}`
            const fakeWmsLayerUrlId2 = `WMS|${fakeWmsBaseUrl1}|${encodeExternalLayerParam(fakeWmsLayerId2)}`
            const fakeWmsLayerUrlId3 = `WMS|${fakeWmsBaseUrl2}|${fakeWmsLayerId3}`
            const fakeWmsLayerUrlId4 = `WMS|${fakeWmsBaseUrl2}|${fakeWmsLayerId4}`

            // Fake WMTS
            const fakeWmtsGetCapUrl1 = 'https://fake.wmts.getcap-1.url/WMTSGetCapabilities.xml'
            const fakeWmtsGetCapUrl2 = 'https://fake.wmts.getcap-2.url/WMTSGetCapabilities.xml'
            const fakeWmtsLayerId1 = 'TestExternalWMTS-1'
            const fakeWmtsLayerId2 = 'TestExternalWMTS-2;,|@special-chars-äö'
            const fakeWmtsLayerId3 = 'TestExternalWMTS-3'
            const fakeWmtsLayerId4 = 'TestExternalWMTS-4'
            const fakeWmtsLayerName1 = 'Test External WMTS 1'
            const fakeWmtsLayerName2 = 'Test External WMTS 2;,|@special-chars-äö'
            const fakeWmtsLayerName3 = 'Test External WMTS 3'
            const fakeWmtsLayerName4 = 'Test External WMTS 4'
            // format is WMTS|GET_CAPABILITIES_URL|LAYER_ID
            const fakeWmtsLayerUrlId1 = `WMTS|${fakeWmtsGetCapUrl1}|${fakeWmtsLayerId1}`
            const fakeWmtsLayerUrlId2 = `WMTS|${fakeWmtsGetCapUrl1}|${encodeExternalLayerParam(fakeWmtsLayerId2)}`
            const fakeWmtsLayerUrlId3 = `WMTS|${fakeWmtsGetCapUrl2}|${fakeWmtsLayerId3}`
            const fakeWmtsLayerUrlId4 = `WMTS|${fakeWmtsGetCapUrl2}|${fakeWmtsLayerId4}`

            beforeEach(() => {
                // WMS intercept URL 1
                cy.intercept(
                    { url: `${fakeWmsBaseUrl1}**`, query: { REQUEST: 'GetMap' } },
                    {
                        fixture: '256.png',
                    }
                ).as('externalWMSGetMap-1')
                cy.intercept(
                    { url: `${fakeWmsBaseUrl1}**`, query: { REQUEST: 'GetCapabilities' } },
                    { fixture: 'external-wms-getcap-1.fixture.xml' }
                ).as('externalWMSGetCap-1')

                // WMS intercept URL 2
                cy.intercept(
                    { url: `${fakeWmsBaseUrl2}**`, query: { REQUEST: 'GetMap' } },
                    {
                        fixture: '256.png',
                    }
                ).as('externalWMSGetMap-2')
                cy.intercept(
                    { url: `${fakeWmsBaseUrl2}**`, query: { REQUEST: 'GetCapabilities' } },
                    { fixture: 'external-wms-getcap-2.fixture.xml' }
                ).as('externalWMSGetCap-2')

                // WMTS intercept URL 1
                cy.intercept(`${fakeWmtsGetCapUrl1}`, {
                    fixture: 'external-wmts-getcap-1.fixture.xml',
                }).as('externalWMTSGetCapOl-1')
                cy.intercept(`${fakeWmtsGetCapUrl1}?**`, {
                    fixture: 'external-wmts-getcap-1.fixture.xml',
                }).as('externalWMTSGetCap-1')

                // WMTS intercept URL 2
                cy.intercept(`${fakeWmtsGetCapUrl2}`, {
                    fixture: 'external-wmts-getcap-2.fixture.xml',
                }).as('externalWMTSGetCapOl-2')
                cy.intercept(`${fakeWmtsGetCapUrl2}?**`, {
                    fixture: 'external-wmts-getcap-2.fixture.xml',
                }).as('externalWMTSGetCap-2')

                cy.intercept(
                    'http://test.wmts.png/wmts/1.0.0/TestExternalWMTS-*/default/ktzh/**/*/*.png',
                    {
                        fixture: '256.png',
                    }
                ).as('externalWMTS')
            })

            it('reads and adds an external WMS correctly', () => {
                const layers = [
                    fakeWmsLayerUrlId1,
                    `${encodeLayerParam(fakeWmsLayerUrlId2)},,0.8`,
                    `${fakeWmsLayerUrlId3},f`,
                    `${fakeWmsLayerUrlId4},f,0.4`,
                ].join(';')
                cy.goToMapView({ layers })

                cy.wait(['@externalWMSGetCap-1', '@externalWMSGetCap-2'])
                cy.readStoreValue('state.layers.activeLayers').then((layers) => {
                    cy.wrap(layers).should('have.length', 4)
                    layers.forEach((layer) => {
                        cy.wrap(layer.isLoading).should('be.false')
                        cy.wrap(layer.isExternal).should('be.true')
                    })
                    cy.wrap(layers[0].id).should('be.eq', fakeWmsLayerUrlId1)
                    cy.wrap(layers[0].baseUrl).should('be.eq', fakeWmsBaseUrl1)
                    cy.wrap(layers[0].externalLayerId).should('be.eq', fakeWmsLayerId1)
                    cy.wrap(layers[0].name).should('be.eq', fakeWmsLayerName1)
                    cy.wrap(layers[0].wmsVersion).should('be.eq', '1.3.0')
                    cy.wrap(layers[0].visible).should('be.true')
                    cy.wrap(layers[0].opacity).should('be.eq', 1.0)

                    cy.wrap(layers[1].id).should('be.eq', fakeWmsLayerUrlId2)
                    cy.wrap(layers[1].baseUrl).should('be.eq', fakeWmsBaseUrl1)
                    cy.wrap(layers[1].externalLayerId).should('be.eq', fakeWmsLayerId2)
                    cy.wrap(layers[1].name).should('be.eq', fakeWmsLayerName2)
                    cy.wrap(layers[1].wmsVersion).should('be.eq', '1.3.0')
                    cy.wrap(layers[1].visible).should('be.true')
                    cy.wrap(layers[1].opacity).should('be.eq', 0.8)

                    cy.wrap(layers[2].id).should('be.eq', fakeWmsLayerUrlId3)
                    cy.wrap(layers[2].baseUrl).should('be.eq', fakeWmsBaseUrl2)
                    cy.wrap(layers[2].externalLayerId).should('be.eq', fakeWmsLayerId3)
                    cy.wrap(layers[2].name).should('be.eq', fakeWmsLayerName3)
                    cy.wrap(layers[2].wmsVersion).should('be.eq', '1.3.0')
                    cy.wrap(layers[2].visible).should('be.false')
                    cy.wrap(layers[2].opacity).should('be.eq', 1.0)

                    cy.wrap(layers[3].id).should('be.eq', fakeWmsLayerUrlId4)
                    cy.wrap(layers[3].baseUrl).should('be.eq', fakeWmsBaseUrl2)
                    cy.wrap(layers[3].externalLayerId).should('be.eq', fakeWmsLayerId4)
                    cy.wrap(layers[3].name).should('be.eq', fakeWmsLayerName4)
                    cy.wrap(layers[3].layers).should('have.length.above', 0)
                    cy.wrap(layers[3].visible).should('be.false')
                    cy.wrap(layers[3].opacity).should('be.eq', 0.4)
                })

                // shows a red icon to signify a layer is from an external source
                cy.openMenuIfMobile()
                cy.get(`[data-cy^="menu-active-layer-"]`).each(($el) => {
                    cy.wrap($el)
                        .get('[data-cy="menu-external-disclaimer-icon"]')
                        .should('be.visible')
                })
                cy.get('[data-cy^="menu-active-layer-"]').eq(0).should('contain', fakeWmsLayerName4)
                cy.get('[data-cy^="menu-active-layer-"]').eq(1).should('contain', fakeWmsLayerName3)
                cy.get('[data-cy^="menu-active-layer-"]').eq(2).should('contain', fakeWmsLayerName2)
                cy.get('[data-cy^="menu-active-layer-"]').eq(3).should('contain', fakeWmsLayerName1)

                cy.checkOlLayer([
                    bgLayer,
                    { id: fakeWmsLayerId1, visible: true, opacity: 1.0 },
                    { id: fakeWmsLayerId2, visible: true, opacity: 0.8 },
                    { id: fakeWmsLayerId3, visible: false, opacity: 1.0 },
                    { id: fakeWmsLayerId4, visible: false, opacity: 0.4 },
                ])
            })
            it('reads and adds an external WMTS correctly', () => {
                const layers = [
                    fakeWmtsLayerUrlId1,
                    encodeLayerParam(fakeWmtsLayerUrlId2),
                    fakeWmtsLayerUrlId3,
                    fakeWmtsLayerUrlId4,
                ]

                cy.goToMapView({
                    layers: layers.join(';'),
                })
                cy.wait(['@externalWMTSGetCap-1', '@externalWMTSGetCap-2'])
                cy.readStoreValue('getters.visibleLayers').then((layers) => {
                    cy.wrap(layers).should('have.length', 4)
                    layers.forEach((layer) => {
                        cy.wrap(layer.isLoading).should('be.false')
                        cy.wrap(layer.visible).should('be.true')
                        cy.wrap(layer.opacity).should('be.eq', 1.0)
                    })
                    cy.wrap(layers[0].id).should('be.eq', fakeWmtsLayerUrlId1)
                    cy.wrap(layers[0].baseUrl).should('be.eq', fakeWmtsGetCapUrl1)
                    cy.wrap(layers[0].externalLayerId).should('be.eq', fakeWmtsLayerId1)
                    cy.wrap(layers[0].name).should('be.eq', fakeWmtsLayerName1)

                    cy.wrap(layers[1].id).should('be.eq', fakeWmtsLayerUrlId2)
                    cy.wrap(layers[1].baseUrl).should('be.eq', fakeWmtsGetCapUrl1)
                    cy.wrap(layers[1].externalLayerId).should('be.eq', fakeWmtsLayerId2)
                    cy.wrap(layers[1].name).should('be.eq', fakeWmtsLayerName2)

                    cy.wrap(layers[2].id).should('be.eq', fakeWmtsLayerUrlId3)
                    cy.wrap(layers[2].baseUrl).should('be.eq', fakeWmtsGetCapUrl2)
                    cy.wrap(layers[2].externalLayerId).should('be.eq', fakeWmtsLayerId3)
                    cy.wrap(layers[2].name).should('be.eq', fakeWmtsLayerName3)

                    cy.wrap(layers[3].id).should('be.eq', fakeWmtsLayerUrlId4)
                    cy.wrap(layers[3].baseUrl).should('be.eq', fakeWmtsGetCapUrl2)
                    cy.wrap(layers[3].externalLayerId).should('be.eq', fakeWmtsLayerId4)
                    cy.wrap(layers[3].name).should('be.eq', fakeWmtsLayerName4)
                })
                cy.checkOlLayer([
                    bgLayer,
                    fakeWmtsLayerId1,
                    fakeWmtsLayerId2,
                    fakeWmtsLayerId3,
                    fakeWmtsLayerId4,
                ])
                cy.openMenuIfMobile()
                cy.get('[data-cy^="menu-active-layer-"]').should('have.length', 4)
                cy.get('[data-cy^="menu-active-layer-"]')
                    .eq(0)
                    .should('contain', fakeWmtsLayerName4)
                cy.get('[data-cy^="menu-active-layer-"]')
                    .eq(1)
                    .should('contain', fakeWmtsLayerName3)
                cy.get('[data-cy^="menu-active-layer-"]')
                    .eq(2)
                    .should('contain', fakeWmtsLayerName2)
                cy.get('[data-cy^="menu-active-layer-"]')
                    .eq(3)
                    .should('contain', fakeWmtsLayerName1)
                cy.get('[data-cy^="menu-active-layer-"]').each(($layer) => {
                    cy.wrap($layer)
                        .get('[data-cy="menu-external-disclaimer-icon"]')
                        .should('be.visible')
                })

                // reads and sets non default layer config; visible and opacity
                cy.goToMapView({
                    layers: `${fakeWmtsLayerUrlId1},f,0.5;${encodeLayerParam(fakeWmtsLayerUrlId2)},f;${fakeWmtsLayerUrlId3},,0.8`,
                })
                cy.readStoreValue('getters.visibleLayers').should('have.length', 1)
                cy.readStoreValue('state.layers.activeLayers').then((layers) => {
                    cy.wrap(layers).should('have.length', 3)

                    cy.wrap(layers[0].id).should('be.eq', fakeWmtsLayerUrlId1)
                    cy.wrap(layers[0].visible).should('be.false')
                    cy.wrap(layers[0].opacity).should('be.eq', 0.5)

                    cy.wrap(layers[1].id).should('be.eq', fakeWmtsLayerUrlId2)
                    cy.wrap(layers[1].visible).should('be.false')
                    cy.wrap(layers[1].opacity).should('be.eq', 1.0)

                    cy.wrap(layers[2].id).should('be.eq', fakeWmtsLayerUrlId3)
                    cy.wrap(layers[2].visible).should('be.true')
                    cy.wrap(layers[2].opacity).should('be.eq', 0.8)
                })

                // shows a red icon to signify a layer is from an external source
                cy.openMenuIfMobile()
                cy.get('[data-cy^="menu-active-layer-"]').should('have.length', 3)
                cy.get('[data-cy^="menu-active-layer-"]')
                    .eq(0)
                    .should('contain', fakeWmtsLayerName3)
                cy.get('[data-cy^="menu-active-layer-"]')
                    .eq(1)
                    .should('contain', fakeWmtsLayerName2)
                cy.get('[data-cy^="menu-active-layer-"]')
                    .eq(2)
                    .should('contain', fakeWmtsLayerName1)
                cy.get('[data-cy^="menu-active-layer-"]').each(($layer) => {
                    cy.wrap($layer)
                        .get('[data-cy="menu-external-disclaimer-icon"]')
                        .should('be.visible')
                })
                cy.checkOlLayer([
                    bgLayer,
                    { id: fakeWmtsLayerId3, visible: true, opacity: 0.8 },
                    { id: fakeWmtsLayerId2, visible: false, opacity: 1.0 },
                    { id: fakeWmtsLayerId1, visible: false, opacity: 0.5 },
                ])

                cy.log(`Make sure that the external backend have not been called twice`)
                cy.get('@externalWMTSGetCap-1.all').should('have.length', 1)
                cy.get('@externalWMTSGetCap-2.all').should('have.length', 1)
            })
            it('handles errors correctly', () => {
                const wmtsUnreachableUrl =
                    'https://fake.unreachable.getcap.url/WMTSGetCapabilities.xml'
                const wmtsUnreachableLayerId = 'WMTSUnreachableURL'
                // format is WMTS|GET_CAPABILITIES_URL|LAYER_ID
                const wmtsUnreachableUrlId = `WMTS|${wmtsUnreachableUrl}|${wmtsUnreachableLayerId}`

                const wmtsInvalidContentUrl =
                    'https://fake.invalid.content.getcap.url/WMTSGetCapabilities.xml'
                const wmtsInvalidContentLayerId = 'WMTSInvalidContent'
                // format is WMTS|GET_CAPABILITIES_URL|LAYER_ID
                const wmtsInvalidContentUrlId = `WMTS|${wmtsInvalidContentUrl}|${wmtsInvalidContentLayerId}`

                const wmsUnreachableUrl = 'https://fake.unreachable.getcap.url/WMS'
                const wmsUnreachableLayerId = 'WMSUnreachableURL'
                // format is WMS|GET_CAPABILITIES_URL|LAYER_ID
                const wmsUnreachableUrlId = `WMS|${wmsUnreachableUrl}|${wmsUnreachableLayerId}`

                const wmsInvalidContentUrl = 'https://fake.invalid.content.getcap.url/WMS'
                const wmsInvalidContentLayerId = 'WMSInvalidContent'
                // format is WMS|GET_CAPABILITIES_URL|LAYER_ID
                const wmsInvalidContentUrlId = `WMS|${wmsInvalidContentUrl}|${wmsInvalidContentLayerId}`

                // intercepting call to our fake WMTS
                cy.intercept(`${wmtsUnreachableUrl}**`, {
                    forceNetworkError: true,
                }).as('external-wmts-unreachable')

                cy.intercept(`${wmtsInvalidContentUrl}**`, {
                    body: 'Invalid body',
                }).as('external-wmts-invalid')

                cy.intercept(`${wmsUnreachableUrl}**`, {
                    forceNetworkError: true,
                }).as('external-wms-unreachable')

                cy.intercept(`${wmsInvalidContentUrl}**`, {
                    body: 'Invalid body',
                }).as('external-wms-invalid')

                cy.goToMapView(
                    {
                        layers: [
                            wmtsUnreachableUrlId,
                            wmtsInvalidContentUrlId,
                            wmsUnreachableUrlId,
                            wmsInvalidContentUrlId,
                        ].join(';'),
                    },
                    true
                ) // with hash, otherwise the legacy parser kicks in and ruins the day
                cy.wait('@external-wmts-unreachable')
                cy.wait('@external-wmts-invalid')
                cy.wait('@external-wms-unreachable')
                cy.wait('@external-wms-invalid')
                cy.openMenuIfMobile()

                //----------------------------------------------------------------------------------
                cy.log('WMTS URL unreachable')
                cy.readStoreValue('getters.visibleLayers').then((layers) => {
                    expect(layers).to.have.lengthOf(4)
                    const externaLayer = layers[0]
                    expect(externaLayer.id).to.eq(wmtsUnreachableUrlId)
                    expect(externaLayer.baseUrl).to.eq(wmtsUnreachableUrl)
                    expect(externaLayer.externalLayerId).to.eq(wmtsUnreachableLayerId)
                    expect(externaLayer.isLoading).to.be.false
                })
                cy.get(`[data-cy="menu-active-layer-${wmtsUnreachableUrlId}"]`)
                    .get('[data-cy="menu-external-disclaimer-icon"]')
                    .should('be.visible')
                cy.get(`[data-cy="button-error-${wmtsUnreachableUrlId}"]`)
                    .should('be.visible')
                    .get('[data-cy="button-has-error"]')
                    .should('have.class', 'text-danger')
                cy.get(`[data-cy="button-error-${wmtsUnreachableUrlId}"]`).click()
                cy.get('[data-cy^="tippy-button-error-"]')
                    .should('be.visible')
                    .contains('Network error')

                //----------------------------------------------------------------------------------
                cy.log('WMTS URL invalid content')
                cy.readStoreValue('getters.visibleLayers').then((layers) => {
                    expect(layers).to.have.lengthOf(4)
                    const externaLayer = layers[1]
                    expect(externaLayer.id).to.eq(wmtsInvalidContentUrlId)
                    expect(externaLayer.baseUrl).to.eq(wmtsInvalidContentUrl)
                    expect(externaLayer.externalLayerId).to.eq(wmtsInvalidContentLayerId)
                    expect(externaLayer.isLoading).to.be.false
                })
                cy.get(`[data-cy="menu-active-layer-${wmtsInvalidContentUrlId}"]`)
                    .get('[data-cy="menu-external-disclaimer-icon"]')
                    .should('be.visible')
                cy.get(`[data-cy="button-error-${wmtsInvalidContentUrlId}"]`)
                    .should('be.visible')
                    .get('[data-cy="button-has-error"]')
                    .should('have.class', 'text-danger')
                cy.get(`[data-cy="button-error-${wmtsInvalidContentUrlId}"]`).click()
                cy.get('[data-cy^="tippy-button-error-"]')
                    .should('be.visible')
                    .contains('Invalid WMTS Capabilities')

                //----------------------------------------------------------------------------------
                cy.log('WMS URL unreachable')
                cy.readStoreValue('getters.visibleLayers').then((layers) => {
                    expect(layers).to.have.lengthOf(4)
                    const externaLayer = layers[2]
                    expect(externaLayer.id).to.eq(wmsUnreachableUrlId)
                    expect(externaLayer.baseUrl).to.eq(wmsUnreachableUrl)
                    expect(externaLayer.externalLayerId).to.eq(wmsUnreachableLayerId)
                    expect(externaLayer.isLoading).to.be.false
                })
                cy.get(`[data-cy="menu-active-layer-${wmsUnreachableUrlId}"]`)
                    .get('[data-cy="menu-external-disclaimer-icon"]')
                    .should('be.visible')
                cy.get(`[data-cy="button-error-${wmsUnreachableUrlId}"]`)
                    .should('be.visible')
                    .get('[data-cy="button-has-error"]')
                    .should('have.class', 'text-danger')
                cy.get(`[data-cy="button-error-${wmsUnreachableUrlId}"]`).click()
                cy.get('[data-cy^="tippy-button-error-"]')
                    .should('be.visible')
                    .contains('Network error')

                //----------------------------------------------------------------------------------
                cy.log('WMS URL invalid content')
                cy.readStoreValue('getters.visibleLayers').then((layers) => {
                    expect(layers).to.have.lengthOf(4)
                    const externaLayer = layers[3]
                    expect(externaLayer.id).to.eq(wmsInvalidContentUrlId)
                    expect(externaLayer.baseUrl).to.eq(wmsInvalidContentUrl)
                    expect(externaLayer.externalLayerId).to.eq(wmsInvalidContentLayerId)
                    expect(externaLayer.isLoading).to.be.false
                })
                cy.get(`[data-cy="menu-active-layer-${wmsInvalidContentUrlId}"]`)
                    .get('[data-cy="menu-external-disclaimer-icon"]')
                    .should('be.visible')
                cy.get(`[data-cy="button-error-${wmsInvalidContentUrlId}"]`)
                    .should('be.visible')
                    .get('[data-cy="button-has-error"]')
                    .should('have.class', 'text-danger')
                cy.get(`[data-cy="button-error-${wmsInvalidContentUrlId}"]`).click()
                cy.get('[data-cy^="tippy-button-error-"]')
                    .should('be.visible')
                    .contains('Invalid WMS Capabilities')
            })
        })
    })
    context('Background layer in URL at app startup', () => {
        it('sets the background to the topic default if none is defined in the URL', () => {
            cy.fixture('topics.fixture').then((topicFixtures) => {
                const [defaultTopic] = topicFixtures.topics
                cy.goToMapView()
                cy.readStoreValue('state.layers.currentBackgroundLayer').then((bgLayer) => {
                    expect(bgLayer).to.not.be.null
                    expect(bgLayer.id).to.eq(defaultTopic.defaultBackground)
                })
            })
        })
        it('sets the background to the topic default if none is defined in the URL, even if a layer (out of topic scope) is defined in it', () => {
            cy.fixture('topics.fixture').then((topicFixtures) => {
                const [defaultTopic] = topicFixtures.topics
                cy.goToMapView({
                    layers: 'test.timeenabled.wmts.layer',
                })
                cy.readStoreValue('state.layers.currentBackgroundLayer').then((bgLayer) => {
                    expect(bgLayer).to.not.be.null
                    expect(bgLayer.id).to.eq(defaultTopic.defaultBackground)
                })
                cy.readStoreValue('getters.visibleLayers').then((layers) => {
                    expect(layers).to.be.an('Array')
                    expect(layers.length).to.eq(1)
                    expect(layers[0]).to.be.an('Object')
                    expect(layers[0].id).to.eq('test.timeenabled.wmts.layer')
                })
            })
        })
        it('sets the background according to the URL param if present at startup', () => {
            cy.goToMapView({
                bgLayer: 'test.background.layer2',
            })
            cy.readStoreValue('state.layers.currentBackgroundLayer').then((bgLayer) => {
                expect(bgLayer).to.not.be.null
                expect(bgLayer.id).to.eq('test.background.layer2')
            })
        })
    })
    context('Layer settings in menu', () => {
        const visibleLayerIds = ['test.wms.layer', 'test.wmts.layer', 'test.timeenabled.wmts.layer']
        const goToMenuWithLayers = (layerIds = visibleLayerIds) => {
            cy.goToMapView(
                {
                    layers: layerIds.join(';'),
                },
                true
            ) // with hash, so that we can have external layer support
            cy.openMenuIfMobile()
        }
        context('Adding/removing layers', () => {
            it('shows active layers in the menu', () => {
                goToMenuWithLayers()
                visibleLayerIds.forEach((layerId) => {
                    cy.get(`[data-cy="active-layer-name-${layerId}"]`).should('be.visible')
                })
            })
            it('removes a layer from the visible layers when the "remove" button is pressed', () => {
                goToMenuWithLayers()
                // using the first layer to test this out
                const layerId = visibleLayerIds[0]
                cy.get(`[data-cy="button-remove-layer-${layerId}"]`).should('be.visible').click()
                cy.readStoreValue('getters.visibleLayers').then((visibleLayers) => {
                    expect(visibleLayers).to.be.an('Array')
                    expect(visibleLayers.length).to.eq(visibleLayerIds.length - 1)
                    expect(visibleLayers[0].id).to.eq(visibleLayerIds[1])
                })
                cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
                    expect(activeLayers)
                        .to.be.an('Array')
                        .length(visibleLayerIds.length - 1)
                    activeLayers.forEach((layer) => {
                        expect(layer.id).to.be.not.equal(layerId)
                    })
                })
            })
            it('shows a hyphen when no layer is selected', () => {
                cy.goToMapView()
                cy.openMenuIfMobile()
                cy.get('[data-cy="menu-active-layers"]').click()
                cy.get('[data-cy="menu-section-no-layers"]').should('be.visible')
            })
            it('shows no hyphen when a layer is selected', () => {
                const visibleLayerIds = [
                    'test.wms.layer',
                    'test.wmts.layer',
                    'test.timeenabled.wmts.layer',
                ]
                cy.goToMapView({
                    layers: visibleLayerIds.join(';'),
                })
                cy.openMenuIfMobile()
                cy.get('[data-cy="menu-active-layers"]').click()
                cy.get('[data-cy="menu-section-no-layers"]').should('be.hidden')
            })
            it('add layer from topic (should be visible)', () => {
                cy.goToMapView()
                cy.openMenuIfMobile()
                const testLayerId = 'test.wmts.layer'
                const testLayerSelector = `[data-cy="catalogue-tree-item-${testLayerId}"]`
                cy.get('[data-cy="menu-topic-section"]').should('be.visible').click()
                // opening up layer parents in the topic tree
                cy.get('[data-cy="catalogue-tree-item-title-2"]').should('be.visible').click()
                cy.get('[data-cy="catalogue-tree-item-title-3"]').should('be.visible').click()

                // Add the test layer.
                cy.get(testLayerSelector).should('be.visible').click()
                cy.get(testLayerSelector).trigger('mouseleave')
                cy.readStoreValue('getters.visibleLayers').then((visibleLayers) => {
                    expect(visibleLayers).to.be.an('Array').length(1)
                    expect(visibleLayers[0].id, testLayerId)
                })
            })
            it('add layer from search bar', () => {
                const expectedLayerId = 'test.wmts.layer'
                cy.intercept(`/1.0.0/${expectedLayerId}/default/**`, {
                    statusCode: 200,
                }).as('get-wmts-layer')
                cy.mockupBackendResponse(
                    'rest/services/ech/SearchServer*?type=layers*',
                    {
                        results: [
                            {
                                id: 4321,
                                weight: 1,
                                attrs: {
                                    label: '<b>Test layer</b>',
                                    layer: expectedLayerId,
                                },
                            },
                        ],
                    },
                    'search-layers'
                )
                cy.mockupBackendResponse(
                    'rest/services/ech/SearchServer*?type=locations*',
                    { results: [] },
                    'search-locations'
                )
                cy.goToMapView()
                cy.openMenuIfMobile()
                cy.readStoreValue('getters.visibleLayers').should('be.empty')
                cy.get('[data-cy="searchbar"]').paste('test')
                cy.wait(['@search-locations', '@search-layers'])
                cy.get('[data-cy="search-result-entry-layer"]').first().click()
                cy.get('[data-cy="menu-button"]').click()
                cy.readStoreValue('getters.visibleLayers').then((visibleLayers) => {
                    expect(visibleLayers).to.be.an('Array').length(1)
                    expect(visibleLayers[0].id, expectedLayerId)
                })
            })
        })
        context('Toggling layers visibility', () => {
            beforeEach(() => {
                goToMenuWithLayers()
            })
            it('allows toggling layers visibility from the topic menu', () => {
                const testLayerId = 'test.wmts.layer'
                const testLayerSelector = `[data-cy="catalogue-tree-item-${testLayerId}"]`
                cy.get('[data-cy="menu-topic-section"]').should('be.visible').click()
                // opening up layer parents in the topic tree
                cy.get('[data-cy="catalogue-tree-item-title-2"]').should('be.visible').click()
                cy.get('[data-cy="catalogue-tree-item-title-3"]').should('be.visible').click()

                // Toggle (hide) the test layer.
                cy.get(testLayerSelector).should('be.visible').click()
                cy.get(testLayerSelector).trigger('mouseleave')
                cy.readStoreValue('getters.visibleLayers').then((visibleLayers) => {
                    const visibleIds = visibleLayers.map((layer) => layer.id)
                    expect(visibleIds).to.not.contain(testLayerId)
                })
                // Toggle (show) the test layer.
                cy.get(testLayerSelector).click()
                cy.get(testLayerSelector).trigger('mouseleave')
                cy.readStoreValue('getters.visibleLayers').then((visibleLayers) => {
                    const visibleIds = visibleLayers.map((layer) => layer.id)
                    expect(visibleIds).to.contain(testLayerId)
                })
            })
        })
        context('Layer settings (cog button)', () => {
            beforeEach(() => {
                goToMenuWithLayers()
            })
            it('changes the opacity of the layer when the slider for this property is used', () => {
                // using the second layer for this test
                const layerId = visibleLayerIds[1]
                cy.openLayerSettings(layerId)
                // getting current layer opacity
                let initialOpacity = 1.0
                cy.readStoreValue('getters.visibleLayers', (visibleLayers) => {
                    initialOpacity = visibleLayers.find((layer) => layer.id === layerId).opacity
                })
                // using the keyboard to change slider's value
                const step = 5
                const repetitions = 6
                const command = '{leftarrow}'.repeat(repetitions)
                cy.get(`[data-cy="slider-opacity-layer-${layerId}"]`)
                    .should('be.visible')
                    .type(command)
                // checking that the opacity has changed accordingly
                cy.readStoreValue('getters.visibleLayers', (visibleLayers) => {
                    const layer = visibleLayers.find((layer) => layer.id === layerId)
                    expect(layer.opacity).to.eq(initialOpacity - step * repetitions)
                })
            })
            it('reorders visible layers when corresponding buttons are pressed', () => {
                const [firstLayerId, secondLayerId] = visibleLayerIds
                // lower the order of the first layer
                cy.openLayerSettings(firstLayerId)
                cy.get(`[data-cy="button-raise-order-layer-${firstLayerId}"]`)
                    .should('be.visible')
                    .click()
                // checking that the order has changed
                cy.readStoreValue('getters.visibleLayers', (visibleLayers) => {
                    expect(visibleLayers[0].id).to.eq(secondLayerId)
                    expect(visibleLayers[1].id).to.eq(firstLayerId)
                })
                // using the other button
                cy.get(`[data-cy="button-lower-order-layer-${firstLayerId}"]`)
                    .should('be.visible')
                    .click()
                // re-checking the order that should be back to the starting values
                cy.readStoreValue('getters.visibleLayers', (visibleLayers) => {
                    expect(visibleLayers[0].id).to.eq(firstLayerId)
                    expect(visibleLayers[1].id).to.eq(secondLayerId)
                })
            })
            it('shows a layer legend when the "i" button is clicked (in layer settings)', () => {
                // using the first layer to test this out
                const layerId = visibleLayerIds[0]
                // mocking up the backend response for the legend
                const fakeHtmlResponse = '<div>Test</div>'
                cy.intercept(
                    `**/rest/services/all/MapServer/${layerId}/legend**`,
                    fakeHtmlResponse
                ).as('legend')
                // opening layer settings
                cy.openLayerSettings(layerId)
                // clicking on the layer info button
                cy.get(`[data-cy="button-show-legend-layer-${layerId}"]`)
                    .should('be.visible')
                    .click()
                // checking that the backend has been requested for this layer's legend
                cy.wait('@legend')
                // checking that the content of the popup is our mocked up content
                cy.get('[data-cy="layer-legend"]').should('be.visible').contains('Test')
            })
        })
        context('Timestamp management', () => {
            beforeEach(() => {
                goToMenuWithLayers()
            })
            it('shows all possible timestamps in the timestamp popover', () => {
                const timedLayerId = 'test.timeenabled.wmts.layer'
                cy.get(`[data-cy="time-selector-${timedLayerId}"]`).should('be.visible').click()
                cy.get('[data-cy="time-selection-popup"]').should('be.visible')
                cy.fixture('layers.fixture.json').then((layers) => {
                    const timedLayerMetadata = layers[timedLayerId]
                    const defaultTimestamp = timedLayerMetadata.timeBehaviour
                    timedLayerMetadata.timestamps.forEach((timestamp) => {
                        cy.get(`[data-cy="time-select-${timestamp}"]`).then((timestampButton) => {
                            if (timestamp === defaultTimestamp) {
                                expect(timestampButton).to.have.class('btn-primary')
                            }
                        })
                    })
                })
            })
            it('changes the timestamp of a layer when a time button is clicked', () => {
                const timedLayerId = 'test.timeenabled.wmts.layer'
                cy.get(`[data-cy="time-selector-${timedLayerId}"]`).should('be.visible').click()
                cy.fixture('layers.fixture.json').then((layersMetadata) => {
                    const timedLayerMetadata = layersMetadata[timedLayerId]
                    cy.getRandomTimestampFromSeries(timedLayerMetadata).then((randomTimestamp) => {
                        // "force" is needed, as else there is a false positive "button hidden"
                        cy.get(`[data-cy="time-select-${randomTimestamp}"]`).click({ force: true })
                        cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
                            expect(activeLayers).to.be.an('Array').length(visibleLayerIds.length)
                            activeLayers.forEach((layer) => {
                                if (layer.id === timedLayerId) {
                                    expect(layer.timeConfig.currentTimestamp).to.eq(randomTimestamp)
                                }
                            })
                        })
                    })
                })
            })
        })
        context('Re-ordering of layers', () => {
            beforeEach(() => {
                goToMenuWithLayers()
            })
            const checkOrderButtons = (layerId, index) => {
                cy.log(`Check that layer ${layerId} is at index ${index}`)
                cy.get('[data-cy^="menu-active-layer-"]')
                    .eq(index)
                    .should('have.attr', 'data-layer-id', layerId)

                cy.get('[data-cy^="menu-active-layer-"]').then(($el) => {
                    const lastIndex = $el.length - 1
                    const upArrowEnable = index !== 0
                    const downArrowEnable = index < lastIndex
                    cy.log(
                        `Check that layer ${layerId} has correct move arrow depending on its index ${index}`
                    )
                    cy.get(`[data-cy="button-lower-order-layer-${layerId}"]`)
                        .should('be.visible')
                        .should(`${downArrowEnable ? 'not.' : ''}be.disabled`)
                    cy.get(`[data-cy="button-raise-order-layer-${layerId}"]`)
                        .should('be.visible')
                        .should(`${upArrowEnable ? 'not.' : ''}be.disabled`)
                })
            }
            it('Reorder layers using the "move" button', () => {
                const [bottomLayerId, middleLayerId, topLayerId] = visibleLayerIds
                cy.openLayerSettings(bottomLayerId)
                checkOrderButtons(bottomLayerId, 2)
                cy.openLayerSettings(middleLayerId)
                checkOrderButtons(middleLayerId, 1)
                cy.openLayerSettings(topLayerId)
                checkOrderButtons(topLayerId, 0)
                cy.checkOlLayer([
                    'test.background.layer2',
                    { id: bottomLayerId, opacity: 0.75 },
                    middleLayerId,
                    { id: topLayerId, opacity: 0.7 },
                ])

                cy.log('Moving the layers and test the arrow up/dow')

                cy.log(`Moving the layer ${middleLayerId} down`)
                cy.openLayerSettings(middleLayerId)
                cy.get(`[data-cy="button-lower-order-layer-${middleLayerId}"]`).click()
                checkOrderButtons(middleLayerId, 2)
                cy.checkOlLayer([
                    'test.background.layer2',
                    middleLayerId,
                    { id: bottomLayerId, opacity: 0.75 },
                    { id: topLayerId, opacity: 0.7 },
                ])

                cy.log(`Move ${middleLayerId} back to the middle`)
                cy.get(`[data-cy="button-raise-order-layer-${middleLayerId}"]`).click()
                checkOrderButtons(middleLayerId, 1)

                cy.log(`Move ${middleLayerId} it to the top`)
                cy.get(`[data-cy="button-raise-order-layer-${middleLayerId}"]`).click()
                checkOrderButtons(middleLayerId, 0)

                cy.log(`Move ${middleLayerId} back to the middle`)
                cy.get(`[data-cy="button-lower-order-layer-${middleLayerId}"]`).click()
                checkOrderButtons(middleLayerId, 1)

                cy.log('Moving the layers and toggling the visibility')
                cy.log(`Moving ${middleLayerId} to the top and toggle it visibility`)
                cy.get(`[data-cy="button-raise-order-layer-${middleLayerId}"]`).click()
                cy.get(`[data-cy="button-toggle-visibility-layer-${middleLayerId}"]`).click()
                cy.checkOlLayer([
                    'test.background.layer2',
                    { id: bottomLayerId, opacity: 0.75 },
                    { id: topLayerId, opacity: 0.7 },
                    { id: middleLayerId, visible: false },
                ])
                cy.get(`[data-cy="button-toggle-visibility-layer-${middleLayerId}"]`).click()
                cy.checkOlLayer([
                    'test.background.layer2',
                    { id: bottomLayerId, opacity: 0.75 },
                    { id: topLayerId, opacity: 0.7 },
                    { id: middleLayerId, visible: true, opacity: 1 },
                ])

                cy.log('Moving the layers and change the opacity')
                cy.log(`Moving ${middleLayerId} to the bottom and toggle it visibility`)
                cy.get(`[data-cy="button-lower-order-layer-${middleLayerId}"]`).click()
                cy.get(`[data-cy="slider-opacity-layer-${middleLayerId}"]`).realClick()
                cy.checkOlLayer([
                    'test.background.layer2',
                    { id: bottomLayerId, opacity: 0.75 },
                    { id: middleLayerId, visible: true, opacity: 0.5 },
                    { id: topLayerId, opacity: 0.7 },
                ])
            })
            it.skip('reorder layers when they are drag and dropped', () => {
                const [bottomLayerId, middleLayerId, topLayerId] = visibleLayerIds
                cy.get(`[data-cy="menu-active-layer-${bottomLayerId}"]`)
                    .should('be.visible')
                    .drag(`[data-cy="menu-active-layer-${topLayerId}"]`)
                const checkLayerOrder = (
                    expectedBottomLayerId,
                    expectedMiddleLayerId,
                    expectedTopLayerId
                ) => {
                    cy.location('hash').then((hash) => {
                        const layersParam = new URLSearchParams(hash).get('layers')
                        const layers = layersParam.split(';')
                        cy.wrap(layers).should('have.lengthOf', 3)
                        const [firstUrlLayer, secondUrlLayer, thirdUrlLayer] = layers
                        cy.wrap(firstUrlLayer).should('contain', expectedBottomLayerId)
                        cy.wrap(secondUrlLayer).should('contain', expectedMiddleLayerId)
                        cy.wrap(thirdUrlLayer).should('contain', expectedTopLayerId)
                    })
                }
                // the bottom layer should now be on top, so the order is now
                // - bottomLayer
                // - topLayer
                // - middleLayer
                checkLayerOrder(middleLayerId, topLayerId, bottomLayerId)
                cy.get(`[data-cy="menu-active-layer-${middleLayerId}"]`)
                    .should('be.visible')
                    .drag(`[data-cy="menu-active-layer-${topLayerId}"]`)
                // new state is
                // - bottomLayer
                // - middleLayer
                // - topLayer
                checkLayerOrder(topLayerId, middleLayerId, bottomLayerId)
            })
        })
        context('External layers', () => {
            it('does not show a red icon for internal layers', () => {
                goToMenuWithLayers()
                visibleLayerIds.forEach((id) => {
                    cy.get(`[data-cy="menu-active-layer-${id}"]`)
                        .get('[data-cy="menu-external-disclaimer-icon"]')
                        .should('not.exist')
                })
            })
        })
    })
    context('Language settings in menu', () => {
        it('keeps the layer settings when changing language', () => {
            const langBefore = 'en'
            const langAfter = 'de'
            const visibleLayerIds = [
                'test.wms.layer',
                'test.wmts.layer',
                'test.timeenabled.wmts.layer',
            ]
            let activeLayersConfigBefore

            cy.goToMapView({
                lang: langBefore,
                layers: visibleLayerIds.map((layer) => `${layer},f,0.1`).join(';'),
            })

            // Wait until the active layers are ready.
            cy.waitUntilState((state) => {
                return state.layers.activeLayers.some((layer) => layer.lang === langBefore)
            })

            // CHECK before
            cy.readStoreValue('state').then((state) => {
                // Check the language before the switch.
                expect(state.i18n.lang).to.eq(langBefore)
                state.layers.activeLayers
                    .filter((layer) => 'lang' in layer)
                    .forEach((layer) => expect(layer.lang).to.eq(langBefore))
                // Save the layer configuration before the switch.
                activeLayersConfigBefore = JSON.stringify(
                    state.layers.activeLayers,
                    stringifyWithoutLangOrNull
                )
            })

            // Open the menu and change the language.
            cy.openMenuIfMobile()
            cy.clickOnLanguage(langAfter)

            // Wait until the active layers are updated.
            cy.waitUntilState((state) => {
                return state.layers.activeLayers.some((layer) => layer.lang === langAfter)
            })

            // CHECK after
            cy.readStoreValue('state').then((state) => {
                // Check the language after the switch.
                expect(state.i18n.lang).to.eq(langAfter)
                state.layers.activeLayers
                    .filter((layer) => 'lang' in layer)
                    .forEach((layer) => expect(layer.lang).to.eq(langAfter))
                // Compare the layer configuration (except the language)
                const activeLayersConfigAfter = JSON.stringify(
                    state.layers.activeLayers,
                    stringifyWithoutLangOrNull
                )
                expect(activeLayersConfigAfter).to.eq(activeLayersConfigBefore)
            })
        })
    })
    context('Copyrights/attributions of layers', () => {
        it('hides the copyrights zone when no layer is visible', () => {
            cy.goToMapView({
                bgLayer: 'void',
            })
            cy.get('[data-cy="layers-copyrights"] a').should('not.exist')
        })
        it('shows the copyright as a link when an attribution URL is available', () => {
            cy.fixture('layers.fixture').then((fakeLayers) => {
                const layerWithAttributionUrl = fakeLayers['test.wmts.layer']
                cy.goToMapView({
                    layers: layerWithAttributionUrl.serverLayerName,
                })
                cy.get(`a[data-cy="layer-copyright-${layerWithAttributionUrl.attribution}"]`)
                    .should('be.visible')
                    .should('contain', layerWithAttributionUrl.attribution)
                    .should('have.attr', 'href', layerWithAttributionUrl.attributionUrl)
            })
        })
        it('shows a simple text with data owner name when no attribution URL is available', () => {
            cy.fixture('layers.fixture').then((fakeLayers) => {
                const layerWithoutAttributionUrl = fakeLayers['test.wms.layer']
                cy.goToMapView({
                    layers: layerWithoutAttributionUrl.serverLayerName,
                })
                cy.get(`span[data-cy="layer-copyright-${layerWithoutAttributionUrl.attribution}"]`)
                    .should('be.visible')
                    .should('contain', layerWithoutAttributionUrl.attribution)
            })
        })
        it('renders a simple text when the attribution URL is a malformed', () => {
            cy.fixture('layers.fixture').then((fakeLayers) => {
                const layerWithMalformedAttributionUrl = fakeLayers['test.timeenabled.wmts.layer']
                cy.goToMapView({
                    layers: layerWithMalformedAttributionUrl.serverLayerName,
                })
                cy.get(
                    `span[data-cy="layer-copyright-${layerWithMalformedAttributionUrl.attribution}"]`
                )
                    .should('be.visible')
                    .should('contain', layerWithMalformedAttributionUrl.attribution)
            })
        })
        it('only show once each data owner (attribution) even when multiple layers with the same are shown', () => {
            cy.goToMapView({
                bgLayer: 'test.background.layer2',
                layers: 'test.wmts.layer',
            })
            cy.get('[data-cy="layers-copyrights"]').should('have.length', 1)
        })
    })
})
