/// <reference types="cypress" />

import type { ExternalWMSLayer, ExternalWMTSLayer, Layer } from '@swissgeo/layers'
import type { Pinia } from 'pinia'

import { WEBMERCATOR, WGS84 } from '@swissgeo/coordinates'
import { assertDefined } from 'support/utils'

import useI18nStore from '@/store/modules/i18n'
import useLayersStore from '@/store/modules/layers'
import { transformLayerIntoUrlString } from '@/store/plugins/storeSync/layersParamParser'

/**
 * This function is used as a parameter to `JSON.stringify` to remove all properties with the name
 * `lang`.
 *
 * @param {String} key The current property name.
 * @param {any} value The current value to stringify.
 * @returns {String} The string representation of the object.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#the_replacer_parameter
 */
// @ts-expect-error the replacer function expects any as a value, but typescript doesn't like it
const stringifyWithoutLangOrundefined = (key: string, value) =>
    key === 'lang' || key === 'uuid' || value === undefined ? undefined : value

describe('Test of layer handling', () => {
    const bgLayer = {
        id: 'test.background.layer2',
    }
    context('Layer in URL at app startup', () => {
        it('starts without any visible layer added opening the app without layers URL param', () => {
            cy.goToMapView()
            cy.getPinia().then((pinia) => {
                const layersStore = useLayersStore(pinia)
                expect(layersStore.visibleLayers).to.be.empty
            })
        })
        it('adds a layers with config to the map when opening the app layers URL param', () => {
            cy.intercept(
                {
                    method: 'GET',
                    hostname: /(wms\d*\.geo\.admin\.ch|sys-wms\d*\.\w+\.bgdi\.ch)/,
                    query: { REQUEST: 'GetMap', LAYERS: 'test-1.wms.layer' },
                    middleware: true, // overwrite intercept set by goToMapView
                },
                (request) => request.reply({ fixture: '256.png' })
            ).as('layer-1-getMap')
            cy.intercept(
                {
                    method: 'GET',
                    hostname: /(wms\d*\.geo\.admin\.ch|sys-wms\d*\.\w+\.bgdi\.ch)/,
                    query: { REQUEST: 'GetMap', LAYERS: 'test-2.wms.layer' },
                    middleware: true, // overwrite intercept set by goToMapView
                },
                (request) => request.reply({ fixture: '256.png' })
            ).as('layer-2-getMap')
            cy.intercept(
                {
                    method: 'GET',
                    hostname: /(wms\d*\.geo\.admin\.ch|sys-wms\d*\.\w+\.bgdi\.ch)/,
                    query: { REQUEST: 'GetMap', LAYERS: 'test-4.wms.layer' },
                    middleware: true, // overwrite intercept set by goToMapView
                },
                (request) => request.reply({ fixture: '256.png' })
            ).as('layer-4-getMap')
            cy.goToMapView({
                queryParams: {
                    layers: [
                        'test-1.wms.layer',
                        'test-2.wms.layer@param=value,,',
                        'test-3.wms.layer,f',
                        'test-4.wms.layer,,0.4',
                        'test.wmts.layer,f,0.5',
                    ].join(';'),
                },
            })

            //-----------------------------------------------------------------
            cy.log(`Check layers in store`)
            cy.getPinia().then((pinia) => {
                const layersStore2 = useLayersStore(pinia)
                const visibleLayers = layersStore2.visibleLayers
                expect(visibleLayers).to.be.an('Array').length(3)
                expect(visibleLayers[0]?.id).to.eq('test-1.wms.layer')
                expect(visibleLayers[1]?.id).to.eq('test-2.wms.layer')
                expect(visibleLayers[2]?.id).to.eq('test-4.wms.layer')
                expect(visibleLayers[2]?.opacity).to.eq(0.4)

                const activeLayers = layersStore2.activeLayers
                expect(activeLayers).to.be.an('Array').length(5)
                expect(activeLayers[0]?.id).to.eq('test-1.wms.layer')
                expect(activeLayers[1]?.id).to.eq('test-2.wms.layer')
                expect(activeLayers[2]?.id).to.eq('test-3.wms.layer')
                expect(activeLayers[3]?.id).to.eq('test-4.wms.layer')
                expect(activeLayers[3]?.opacity).to.eq(0.4)
                expect(activeLayers[4]?.id).to.eq('test.wmts.layer')
                expect(activeLayers[4]?.opacity).to.eq(0.5)
            })

            //-----------------------------------------------------------------
            cy.log('Check layers in OL')
            cy.checkOlLayer([
                bgLayer,
                { id: 'test-1.wms.layer', opacity: 0.75 },
                { id: 'test-2.wms.layer', opacity: 0.75 },
                { id: 'test-4.wms.layer', opacity: 0.4 },
            ])

            //-----------------------------------------------------------------
            cy.log(`Check wms layer custom attributes being passed to wms server`)
            cy.wait('@layer-1-getMap').its('request.query').should('not.have.property', 'param')
            cy.wait('@layer-2-getMap')
                .its('request.query')
                .should('have.property', 'param', 'value')
        })
        it('uses the default timestamp of a time enabled layer when not specified in the URL', () => {
            const timeEnabledLayerId = 'test.timeenabled.wmts.layer'
            cy.goToMapView({ queryParams: { layers: timeEnabledLayerId } })
            cy.getPinia().then((pinia) => {
                const layersStore3 = useLayersStore(pinia)
                const layers = layersStore3.visibleLayers
                const timeEnabledLayer: Layer | undefined = layers[0]
                cy.fixture('layers.fixture.json').then((layersMetadata) => {
                    const timeEnabledLayerMetadata = layersMetadata[timeEnabledLayerId]
                    expect(timeEnabledLayer?.timeConfig.currentTimeEntry?.timestamp).to.eq(
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
                            queryParams: {
                                layers: `${timeEnabledLayerId}@year=${randomTimestampFromLayer?.substring(
                                    0,
                                    4
                                )}`,
                            },
                        })
                        cy.getPinia().then((pinia) => {
                            const layersStore4 = useLayersStore(pinia)
                            const layers = layersStore4.visibleLayers
                            const [timeEnabledLayer] = layers
                            expect(timeEnabledLayer?.timeConfig.currentTimeEntry?.timestamp).to.eq(
                                randomTimestampFromLayer
                            )
                        })
                    }
                )
            })
        })
        context('External layers', () => {
            it.only('reads and adds an external WMS correctly', () => {
                cy.getExternalWmsMockConfig().then((layerObjects) => {
                    layerObjects.forEach((layerObject) => (layerObject.isVisible = true))
                    const [mockExternalWms1, mockExternalWms2, mockExternalWms3, mockExternalWms4] =
                        layerObjects
                    /**
                     * Some WMS allow for options to be passed to the base URL, which caused issues
                     * with the readyness check. Basically, it tested the optionless base URL
                     * against the current one, which caused the layer to be perpetually loading. We
                     * test here that such a situation does not happen anymore.
                     */
                    cy.log(
                        "Adding an option to one of the layer's base URL to check if these calls behave in a correct way"
                    )

                    layerObjects[0]!.baseUrl = layerObjects[0]!.baseUrl + 'item=22_06_86t13214'
                    const layers = layerObjects
                        .map((object) => transformLayerIntoUrlString(object, undefined, undefined))
                        .join(';')
                    cy.goToMapView({ queryParams: { layers } })

                    cy.log(`Verify that the Get capabilities of both server are called`)
                    cy.wait([
                        `@externalWMS-GetCap-${mockExternalWms1?.baseUrl}`,
                        `@externalWMS-GetCap-${mockExternalWms3?.baseUrl}`,
                    ])

                    cy.log(`Verify that extra custom attributes are passed along to the WMS server`)
                    cy.wait(`@externalWMS-GetMap-${mockExternalWms1?.id}`)
                        .its('request.query')
                        .should('have.property', 'item', '22_06_86t13214')

                    cy.log(`Verify that the active layers store match the url input`)
                    cy.getPinia().then((pinia) => {
                        const layersStore5 = useLayersStore(pinia)
                        const activeLayers2 = layersStore5.activeLayers as ExternalWMSLayer[]
                        expect(activeLayers2).to.be.lengthOf(layerObjects.length)

                        activeLayers2.forEach((layer) => {
                            expect(layer.isLoading).to.be.false
                            expect(layer.isExternal).to.be.true
                        })
                        layerObjects.forEach((layer, index) => {
                            expect(activeLayers2[index]?.id).to.be.eq(layer.id)
                            expect(activeLayers2[index]?.baseUrl).to.be.eq(layer.baseUrl)
                            expect(activeLayers2[index]?.name).to.be.eq(layer.name)
                            expect(activeLayers2[index]?.wmsVersion).to.be.eq(layer.wmsVersion)
                            expect(activeLayers2[index]?.isVisible).to.eq(layer.isVisible)
                            expect(activeLayers2[index]?.opacity).to.eq(layer.opacity)
                        })
                    })

                    // shows a red icon to signify a layer is from an external source
                    cy.openMenuIfMobile()
                    cy.get(`[data-cy^="menu-active-layer-"]`).each(($el) => {
                        cy.wrap($el)
                            .get('[data-cy="menu-external-disclaimer-icon-cloud"]')
                            .should('be.visible')
                    })
                    layerObjects.toReversed().forEach((layer: ExternalWMSLayer, index: number) => {
                        cy.get('[data-cy^="menu-active-layer-"]')
                            .eq(index)
                            .should('contain', layer.name)
                    })

                    cy.checkOlLayer([
                        bgLayer,
                        ...layerObjects.map((layer) => {
                            return {
                                id: layer.id,
                                visible: layer.isVisible,
                                opacity: layer.opacity,
                            }
                        }),
                    ])

                    cy.log('getFeatureInfo testing')
                    // layer 1 and 2 have the same "backend", so we deactivate layer 2 and activate layer 3
                    cy.get(
                        `[data-cy^="button-toggle-visibility-layer-${mockExternalWms2?.id}-"]`
                    ).click()
                    cy.get(
                        `[data-cy^="button-toggle-visibility-layer-${mockExternalWms3?.id}-"]`
                    ).click()

                    cy.checkOlLayer([
                        bgLayer,
                        { id: mockExternalWms1!.id, visible: true, opacity: 1.0 },
                        { id: mockExternalWms2!.id, visible: false, opacity: 0.8 },
                        { id: mockExternalWms3!.id, visible: false, opacity: 1.0 },
                        { id: mockExternalWms4!.id, visible: true, opacity: 0.4 },
                    ])

                    // A click on the map should trigger a getFeatureInfo on both visible/active layers 1 and 3.
                    // So we start by defining intercepts for these two requests
                    cy.intercept(
                        {
                            url: `${mockExternalWms1?.baseUrl}**`,
                            query: { REQUEST: 'GetFeatureInfo' },
                        },

                        { features: [] }
                    ).as('getFeatureInfoServer1')
                    cy.intercept(
                        {
                            url: `${mockExternalWms3?.baseUrl}**`,
                            query: { REQUEST: 'GetFeatureInfo' },
                        },
                        { features: [] }
                    ).as('getFeatureInfoServer2')
                    cy.closeMenuIfMobile()
                    cy.get('[data-cy="ol-map"]').click()
                    cy.wait('@getFeatureInfoServer1').then((intercept) => {
                        // server 1 only support POST method, so this should have been sent with this HTTP method
                        cy.wrap(intercept.request.method).should('eq', 'POST')
                        // as this server support application/json, this must be the data type requested
                        cy.wrap(intercept.request.query).should('have.a.property', 'INFO_FORMAT')
                        cy.wrap(intercept.request.query.INFO_FORMAT).should(
                            'eq',
                            'application/json'
                        )
                    })
                    cy.wait('@getFeatureInfoServer2').then((intercept) => {
                        // server 2 support both POST and GET, so the app should default to GET
                        cy.wrap(intercept.request.method).should('eq', 'GET')
                        //this server doesn't support application/json but GML, GML must be the data type requested
                        cy.wrap(intercept.request.query).should('have.a.property', 'INFO_FORMAT')
                        cy.wrap(intercept.request.query.INFO_FORMAT).should(
                            'eq',
                            'application/vnd.ogc.gml'
                        )
                        // this server doesn't support LV95 or LV03, so WGS84 or Mercator should be selected to request it instead
                        cy.wrap(intercept.request.query).should('have.a.property', 'CRS')
                        cy.wrap(intercept.request.query.CRS).should('be.oneOf', [
                            WGS84.epsg,
                            WEBMERCATOR.epsg,
                        ])
                    })
                    cy.openMenuIfMobile()
                    // we play with the transparency to ensure nothing goes wrong
                    cy.log('We ensure transparency works as expected for external layers too')
                    cy.openLayerSettings(mockExternalWms1!.id)

                    cy.get(`[data-cy^="slider-transparency-layer-${mockExternalWms1?.id}-"]`)
                        .should('be.visible')
                        .invoke('val', 1)
                        .trigger('input')
                    cy.openLayerSettings(mockExternalWms4!.id)

                    cy.get(`[data-cy^="slider-transparency-layer-${mockExternalWms4?.id}-"]`)
                        .should('be.visible')
                        .invoke('val', 0)
                        .trigger('input')

                    // we had some issues with wms transparency reverting back to default when reaching 0
                    // we test layer 1 and 3 for transparency 0, since that's both our wms fixtures tested
                    // this way
                    cy.openLayerSettings(mockExternalWms3!.id)

                    cy.get(`[data-cy^="slider-transparency-layer-${mockExternalWms3?.id}-"]`)
                        .should('be.visible')
                        .invoke('val', 1)
                        .trigger('input')

                    cy.checkOlLayer([
                        bgLayer,
                        { id: mockExternalWms1!.id, visible: true, opacity: 0.0 },
                        { id: mockExternalWms2!.id, visible: false, opacity: 0.8 },
                        { id: mockExternalWms3!.id, visible: false, opacity: 0.0 },
                        { id: mockExternalWms4!.id, visible: true, opacity: 1.0 },
                    ])
                })
            })
            it('reads and adds an external WMTS correctly', () => {
                cy.getExternalWmtsMockConfig().then((layerObjects) => {
                    layerObjects.forEach((layerObject) => (layerObject.isVisible = true))
                    const [mockExternalWmts1, _, mockExternalWmts3] = layerObjects

                    cy.goToMapView({
                        queryParams: {
                            layers: layerObjects
                                .map((object) =>
                                    transformLayerIntoUrlString(object, undefined, undefined)
                                )
                                .join(';'),
                        },
                    })

                    cy.wait([
                        `@externalWMTS-GetCap-${mockExternalWmts1?.baseUrl}`,
                        `@externalWMTS-GetCap-${mockExternalWmts3?.baseUrl}`,
                    ])

                    cy.getPinia().then((pinia) => {
                        const layersStore6 = useLayersStore(pinia)
                        const visibleLayers2 = layersStore6.visibleLayers
                        expect(visibleLayers2).to.have.lengthOf(layerObjects.length)
                        visibleLayers2.forEach((layer) => {
                            expect(layer.isLoading).to.be.false
                            expect(layer.isExternal).to.be.true
                        })
                        layerObjects.forEach((layer, index) => {
                            expect(visibleLayers2[index]?.id).to.be.eq(layer.id)
                            expect(visibleLayers2[index]?.baseUrl).to.be.eq(layer.baseUrl)
                            expect(visibleLayers2[index]?.name).to.be.eq(layer.name)
                            expect(visibleLayers2[index]?.isVisible).to.eq(layer.isVisible)
                            expect(visibleLayers2[index]?.opacity).to.eq(layer.opacity)
                        })
                    })
                    cy.checkOlLayer([
                        bgLayer,
                        ...layerObjects.map((layer) => {
                            return {
                                id: layer.id,
                                visible: layer.isVisible,
                                opacity: layer.opacity,
                            }
                        }),
                    ])
                    cy.openMenuIfMobile()
                    cy.get('[data-cy^="menu-active-layer-"]').should(
                        'have.length',
                        layerObjects.length
                    )
                    layerObjects.toReversed().forEach((layer: ExternalWMTSLayer, index: number) => {
                        cy.get('[data-cy^="menu-active-layer-"]')
                            .eq(index)
                            .should('contain', layer.name)
                    })
                    cy.get('[data-cy^="menu-active-layer-"]').each(($layer) => {
                        cy.wrap($layer)
                            .get('[data-cy="menu-external-disclaimer-icon-cloud"]')
                            .should('be.visible')
                    })
                })
            })
            it("reads and adds an external WMTS correctly but doesn't show the invisible layer", () => {
                cy.getExternalWmtsMockConfig().then((layerObjects) => {
                    const [mockExternalWmts1, mockExternalWmts2, mockExternalWmts3] = layerObjects

                    mockExternalWmts1!.isVisible = false
                    mockExternalWmts1!.opacity = 0.5
                    mockExternalWmts2!.isVisible = false
                    mockExternalWmts3!.isVisible = true
                    mockExternalWmts3!.opacity = 0.8
                    const layerObjects2 = [
                        mockExternalWmts1!,
                        mockExternalWmts2!,
                        mockExternalWmts3!,
                    ]
                    // reads and sets non default layer config; visible and opacity
                    cy.goToMapView({
                        queryParams: {
                            layers: layerObjects2
                                .map((object) =>
                                    transformLayerIntoUrlString(object, undefined, undefined)
                                )
                                .join(';'),
                        },
                    })
                    cy.getPinia().then((pinia) => {
                        const layersStore7 = useLayersStore(pinia)
                        expect(layersStore7.visibleLayers).to.have.length(1)
                        const activeLayers3 = layersStore7.activeLayers
                        expect(activeLayers3).to.have.lengthOf(layerObjects2.length)
                        layerObjects2.forEach((layer, index) => {
                            expect(activeLayers3[index]?.id).to.eq(layer.id)
                            expect(activeLayers3[index]?.isVisible).to.eq(layer.isVisible)
                            expect(activeLayers3[index]?.opacity).to.eq(layer.opacity)
                        })
                    })
                    // shows a red icon to signify a layer is from an external source
                    cy.openMenuIfMobile()
                    cy.get('[data-cy^="menu-active-layer-"]').should(
                        'have.length',
                        layerObjects2.length
                    )
                    layerObjects2
                        .toReversed()
                        .forEach((layer: ExternalWMTSLayer, index: number) => {
                            cy.get('[data-cy^="menu-active-layer-"]')
                                .eq(index)
                                .should('contain', layer.name)
                        })
                    cy.get('[data-cy^="menu-active-layer-"]').each(($layer) => {
                        cy.wrap($layer)
                            .get('[data-cy="menu-external-disclaimer-icon-cloud"]')
                            .should('be.visible')
                    })

                    cy.checkOlLayer([
                        bgLayer,
                        ...layerObjects2.map((layer) => {
                            return {
                                id: layer.id,
                                visible: layer.isVisible,
                                opacity: layer.opacity,
                            }
                        }),
                    ])
                    cy.log(`Make sure that the external backend have not been called twice`)
                    cy.get(`@externalWMTS-GetCap-${mockExternalWmts1?.baseUrl}.all`).should(
                        'have.length',
                        1
                    )
                    cy.get(`@externalWMTS-GetCap-${mockExternalWmts3?.baseUrl}.all`).should(
                        'have.length',
                        1
                    )
                })
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

                cy.goToMapView({
                    queryParams: {
                        layers: [
                            wmtsUnreachableUrlId,
                            wmtsInvalidContentUrlId,
                            wmsUnreachableUrlId,
                            wmsInvalidContentUrlId,
                        ].join(';'),
                    },
                    withHash: true,
                }) // with hash, otherwise the legacy parser kicks in and ruins the day
                cy.wait('@external-wmts-unreachable')
                cy.wait('@external-wmts-invalid')
                cy.wait('@external-wms-unreachable')
                cy.wait('@external-wms-invalid')
                cy.openMenuIfMobile()

                //----------------------------------------------------------------------------------
                cy.log('WMTS URL unreachable')
                cy.getPinia().then((pinia) => {
                    const layersStore8 = useLayersStore(pinia)
                    const visibleLayers3 = layersStore8.visibleLayers
                    expect(visibleLayers3).to.have.lengthOf(4)
                    const externaLayer = visibleLayers3[0]
                    expect(externaLayer?.id).to.eq(wmtsUnreachableLayerId)
                    expect(externaLayer?.baseUrl).to.eq(wmtsUnreachableUrl)
                    expect(externaLayer?.isLoading).to.be.false
                })
                cy.get(`[data-cy^="menu-active-layer-${wmtsUnreachableLayerId}-"]`)
                    .get('[data-cy="menu-external-disclaimer-icon-cloud"]')
                    .should('be.visible')

                cy.get(`[data-cy="button-has-error-${wmtsUnreachableLayerId}"]`)
                    .should('be.visible')
                    .trigger('mouseover')
                cy.get(`[data-cy="floating-button-has-error-${wmtsUnreachableLayerId}"]`)
                    .should('have.class', 'tw:bg-red-500')
                    .should('be.visible')
                    .contains('Network error')
                cy.get(`[data-cy="button-has-error-${wmtsUnreachableLayerId}"]`).trigger(
                    'mouseleave'
                )

                //----------------------------------------------------------------------------------
                cy.log('WMTS URL invalid content')
                cy.getPinia().then((pinia) => {
                    const layersStore9 = useLayersStore(pinia)
                    const visibleLayers4 = layersStore9.visibleLayers
                    expect(visibleLayers4).to.have.lengthOf(4)
                    const externaLayer2 = visibleLayers4[1]
                    expect(externaLayer2?.id).to.eq(wmtsInvalidContentLayerId)
                    expect(externaLayer2?.baseUrl).to.eq(wmtsInvalidContentUrl)
                    expect(externaLayer2?.isLoading).to.be.false
                })
                cy.get(`[data-cy^="menu-active-layer-${wmtsInvalidContentLayerId}-"]`)
                    .get('[data-cy="menu-external-disclaimer-icon-cloud"]')
                    .should('be.visible')

                cy.get(`[data-cy="button-has-error-${wmtsInvalidContentLayerId}"]`)
                    .should('be.visible')
                    .trigger('mouseover')
                cy.get(`[data-cy="floating-button-has-error-${wmtsInvalidContentLayerId}"]`)
                    .should('have.class', 'tw:bg-red-500')
                    .should('be.visible')
                    .contains('Invalid WMTS Capabilities')
                cy.get(`[data-cy="button-has-error-${wmtsInvalidContentLayerId}"]`).trigger(
                    'mouseleave'
                )

                //----------------------------------------------------------------------------------
                cy.log('WMS URL unreachable')
                cy.getPinia().then((pinia) => {
                    const layersStore10 = useLayersStore(pinia)
                    const visibleLayers5 = layersStore10.visibleLayers
                    expect(visibleLayers5).to.have.lengthOf(4)
                    const externaLayer3 = visibleLayers5[2]
                    expect(externaLayer3?.id).to.eq(wmsUnreachableLayerId)
                    expect(externaLayer3?.baseUrl).to.eq(wmsUnreachableUrl)
                    expect(externaLayer3?.isLoading).to.be.false
                })
                cy.get(`[data-cy^="menu-active-layer-${wmsUnreachableLayerId}-"]`)
                    .get('[data-cy="menu-external-disclaimer-icon-cloud"]')
                    .should('be.visible')

                cy.get(`[data-cy="button-has-error-${wmsUnreachableLayerId}"]`)
                    .should('be.visible')
                    .trigger('mouseover')
                cy.get(`[data-cy="floating-button-has-error-${wmsUnreachableLayerId}"]`)
                    .should('have.class', 'tw:bg-red-500')
                    .should('be.visible')
                    .contains('Network error')
                cy.get(`[data-cy="button-has-error-${wmsUnreachableLayerId}"]`).trigger(
                    'mouseleave'
                )

                //----------------------------------------------------------------------------------
                cy.log('WMS URL invalid content')
                cy.getPinia().then((pinia) => {
                    const layersStore11 = useLayersStore(pinia)
                    const visibleLayers6 = layersStore11.visibleLayers
                    expect(visibleLayers6).to.have.lengthOf(4)
                    const externaLayer4 = visibleLayers6[3]
                    expect(externaLayer4?.id).to.eq(wmsInvalidContentLayerId)
                    expect(externaLayer4?.baseUrl).to.eq(wmsInvalidContentUrl)
                    expect(externaLayer4?.isLoading).to.be.false
                })
                cy.get(`[data-cy^="menu-active-layer-${wmsInvalidContentLayerId}-"]`)
                    .get('[data-cy="menu-external-disclaimer-icon-cloud"]')
                    .should('be.visible')

                cy.get(`[data-cy="button-has-error-${wmsInvalidContentLayerId}"]`)
                    .should('be.visible')
                    .trigger('mouseover')
                cy.get(`[data-cy="floating-button-has-error-${wmsInvalidContentLayerId}"]`)
                    .should('have.class', 'tw:bg-red-500')
                    .should('be.visible')
                    .contains('Invalid WMS Capabilities')
                cy.get(`[data-cy="button-has-error-${wmsInvalidContentLayerId}"]`).trigger(
                    'mouseleave'
                )
            })
        })
    })
    context('Background layer in URL at app startup', () => {
        it('sets the background to the void layer if we set the bgLayer parameter to "void"', () => {
            cy.goToMapView({ queryParams: { bgLayer: 'void' } })
            cy.getPinia().then((pinia) => {
                const layersStore12 = useLayersStore(pinia)
                expect(layersStore12.currentBackgroundLayer).to.be.undefined
            })
        })
        it('sets the background to the topic default if none is defined in the URL', () => {
            cy.fixture('topics.fixture').then((topicFixtures) => {
                const [defaultTopic] = topicFixtures.topics
                cy.goToMapView()
                cy.getPinia().then((pinia) => {
                    const layersStore13 = useLayersStore(pinia)
                    const bgLayer = layersStore13.currentBackgroundLayer
                    expect(bgLayer).to.not.be.undefined
                    expect(bgLayer?.id).to.eq(defaultTopic.defaultBackground)
                })
            })
        })
        it('sets the background to the topic default if none is defined in the URL, even if a layer (out of topic scope) is defined in it', () => {
            cy.fixture('topics.fixture').then((topicFixtures) => {
                const [defaultTopic] = topicFixtures.topics
                cy.goToMapView({ queryParams: { layers: 'test.timeenabled.wmts.layer' } })
                cy.getPinia().then((pinia) => {
                    const layersStore14 = useLayersStore(pinia)
                    const bgLayer2 = layersStore14.currentBackgroundLayer
                    expect(bgLayer2).to.not.be.undefined
                    expect(bgLayer2?.id).to.eq(defaultTopic.defaultBackground)

                    const visibleLayers7 = layersStore14.visibleLayers
                    expect(visibleLayers7).to.be.an('Array')
                    expect(visibleLayers7.length).to.eq(1)
                    expect(visibleLayers7[0]).to.be.an('Object')
                    expect(visibleLayers7[0]?.id).to.eq('test.timeenabled.wmts.layer')
                })
            })
        })
        it('sets the background according to the URL param if present at startup', () => {
            cy.goToMapView({ queryParams: { bgLayer: 'test.background.layer' } })
            cy.getPinia().then((pinia) => {
                const layersStore15 = useLayersStore(pinia)
                const bgLayer3 = layersStore15.currentBackgroundLayer
                expect(bgLayer3).to.not.be.undefined
                expect(bgLayer3?.id).to.eq('test.background.layer')
            })
        })
    })
    context('Layer settings in menu', () => {
        const visibleLayerIds = ['test.wms.layer', 'test.wmts.layer', 'test.timeenabled.wmts.layer']
        const goToMenuWithLayers = (layerIds = visibleLayerIds) => {
            cy.goToMapView({
                queryParams: { layers: layerIds.join(';') },
                withHash: true,
            }) // with hash, so that we can have external layer support
            cy.openMenuIfMobile()
        }
        context('Adding/removing layers', () => {
            it('shows active layers in the menu', () => {
                goToMenuWithLayers()
                visibleLayerIds.forEach((layerId) => {
                    cy.get(`[data-cy^="active-layer-name-${layerId}-"]`).should('be.visible')
                })
                cy.log(`Check that long title are truncated and have a tooltip`)
                cy.get('[data-cy="active-layer-name-test.wmts.layer-1"]')
                    .should('be.visible')
                    .contains('WMTS test layer')
                cy.get('[data-cy="active-layer-name-test.wmts.layer-1"]').trigger('mouseover', {
                    force: true,
                })
                cy.get('[data-cy="floating-active-layer-name-test.wmts.layer-1"]')
                    .should('be.visible')
                    .contains(
                        'WMTS test layer, with very long title that should be truncated on the menu'
                    )
            })
            it('removes a layer from the visible layers when the "remove" button is pressed', () => {
                goToMenuWithLayers()
                // using the first layer to test this out
                const layerId = visibleLayerIds[0]
                cy.get(`[data-cy^="button-remove-layer-${layerId}-"]`).should('be.visible').click()
                cy.getPinia().then((pinia) => {
                    const layersStore17 = useLayersStore(pinia)
                    const visibleLayers8 = layersStore17.visibleLayers
                    expect(visibleLayers8).to.be.an('Array')
                    expect(visibleLayers8.length).to.eq(visibleLayerIds.length - 1)
                    expect(visibleLayers8[0]?.id).to.eq(visibleLayerIds[1])

                    const activeLayers4 = layersStore17.activeLayers as ExternalWMSLayer[]
                    expect(activeLayers4)
                        .to.be.an('Array')
                        .length(visibleLayerIds.length - 1)
                    activeLayers4.forEach((layer: ExternalWMSLayer) => {
                        expect(layer.id).to.be.not.equal(layerId)
                    })
                })
            })
            it('shows a hyphen when no layer is selected', () => {
                cy.goToMapView()
                cy.openMenuIfMobile()
                cy.get('[data-cy="menu-section-no-layers"]').should('be.visible')
            })
            it('shows no hyphen when a layer is selected', () => {
                const visibleLayerIds = [
                    'test.wms.layer',
                    'test.wmts.layer',
                    'test.timeenabled.wmts.layer',
                ]
                cy.goToMapView({ queryParams: { layers: visibleLayerIds.join(';') } })
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
                cy.getPinia().then((pinia) => {
                    const layersStore18 = useLayersStore(pinia)
                    const visibleLayers9 = layersStore18.visibleLayers
                    expect(visibleLayers9).to.be.an('Array').length(1)
                    expect(visibleLayers9[0]?.id, testLayerId)
                })
            })
            it('add layer from search bar', () => {
                const expectedLayerId = 'test.wmts.layer'
                cy.intercept(`/1.0.0/${expectedLayerId}/default/**`, {
                    statusCode: 200,
                }).as('get-wmts-layer')
                cy.intercept('**/rest/services/ech/SearchServer*?type=layers*', {
                    body: {
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
                }).as('search-layers')
                cy.intercept('**/rest/services/ech/SearchServer*?type=locations*', {
                    body: { results: [] },
                }).as('search-locations')
                cy.goToMapView()
                cy.openMenuIfMobile()
                cy.getPinia().then((pinia) => {
                    const layersStore16 = useLayersStore(pinia)
                    expect(layersStore16.visibleLayers).to.be.empty
                })
                cy.get('[data-cy="searchbar"]').paste('test')
                cy.wait(['@search-locations', '@search-layers'])
                cy.get('[data-cy="search-results-layers"] [data-cy="search-result-entry"]')
                    .first()
                    .click()
                cy.get('[data-cy="menu-button"]').click()
                cy.getPinia().then((pinia) => {
                    const layersStore19 = useLayersStore(pinia)
                    const visibleLayers10 = layersStore19.visibleLayers
                    expect(visibleLayers10).to.be.an('Array').length(1)
                    expect(visibleLayers10[0]?.id, expectedLayerId)
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
                cy.getPinia().then((pinia) => {
                    const layersStore20 = useLayersStore(pinia)
                    const visibleLayers11 = layersStore20.visibleLayers
                    const visibleIds = visibleLayers11.map((layer) => layer.id)
                    expect(visibleIds).to.not.contain(testLayerId)
                })
                // Toggle (show) the test layer.
                cy.get(testLayerSelector).click()
                cy.get(testLayerSelector).trigger('mouseleave')
                cy.getPinia().then((pinia) => {
                    const layersStore21 = useLayersStore(pinia)
                    const visibleLayers12 = layersStore21.visibleLayers
                    const visibleIds2 = visibleLayers12.map((layer) => layer.id)
                    expect(visibleIds2).to.contain(testLayerId)
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
                cy.openLayerSettings(`${layerId}`)
                // getting current layer opacity
                let initialOpacity = 1.0
                cy.getPinia().then((pinia) => {
                    const layersStore22 = useLayersStore(pinia)
                    const visibleLayers13 = layersStore22.visibleLayers
                    initialOpacity = visibleLayers13.find((layer) => layer.id === layerId)!.opacity
                })
                // using the keyboard to change slider's value
                const step = -0.01
                const repetitions = 6
                cy.get(`[data-cy^="slider-transparency-layer-${layerId}-"]`)
                    .should('be.visible')
                    .focus()
                for (let i = 0; i < repetitions; i++) {
                    cy.press('ArrowRight')
                }
                // checking that the opacity has changed accordingly
                cy.getPinia().then((pinia) => {
                    const layersStore23 = useLayersStore(pinia)
                    const visibleLayers14 = layersStore23.visibleLayers
                    const layer = visibleLayers14.find((layer) => layer.id === layerId)
                    expect(layer?.opacity).to.eq(initialOpacity + step * repetitions)
                })

                cy.log(
                    'Check that, for both WMS and WMTS, sliding all the way left gets us an opacity of 0'
                )
                visibleLayerIds.forEach((layerId, index) => {
                    cy.openLayerSettings(layerId)
                    cy.get(`[data-cy="slider-transparency-layer-${layerId}-${index}"]`)
                        .should('be.visible')
                        .invoke('val', 1)
                        .trigger('input')

                    cy.getPinia().then((pinia) => {
                        const layersStore24 = useLayersStore(pinia)
                        const visibleLayers15 = layersStore24.visibleLayers
                        const layer2 = visibleLayers15.find((layer: Layer) => layer.id === layerId)
                        expect(layer2?.opacity).to.eq(0.0)
                    })
                })
            })
            it('reorders visible layers when corresponding buttons are pressed', () => {
                const [firstLayerId, secondLayerId] = visibleLayerIds
                // lower the order of the first layer
                cy.openLayerSettings(`${firstLayerId}`)
                cy.get(`[data-cy^="button-raise-order-layer-${firstLayerId}-"]`)
                    .should('be.visible')
                    .click()
                // checking that the order has changed
                cy.getPinia().then((pinia) => {
                    const layersStore25 = useLayersStore(pinia)
                    const visibleLayers16 = layersStore25.visibleLayers
                    expect(visibleLayers16[0]?.id).to.eq(secondLayerId)
                    expect(visibleLayers16[1]?.id).to.eq(firstLayerId)
                })
                // using the other button
                cy.get(`[data-cy^="button-lower-order-layer-${firstLayerId}-"]`)
                    .should('be.visible')
                    .click()
                // re-checking the order that should be back to the starting values
                cy.getPinia().then((pinia) => {
                    const layersStore26 = useLayersStore(pinia)
                    const visibleLayers17 = layersStore26.visibleLayers
                    expect(visibleLayers17[0]?.id).to.eq(firstLayerId)
                    expect(visibleLayers17[1]?.id).to.eq(secondLayerId)
                })
            })
            it('shows a layer legend when the "i" button is clicked (in layer settings)', () => {
                // using the first layer to test this out
                const layerId = visibleLayerIds[0]
                // mocking up the backend response for the legend
                const fakeHtmlResponse = '<div>Test</div>'
                const germanText = 'Test in German'
                const fakeHtmlResponseGerman = `<div>${germanText}</div>`
                cy.intercept(
                    `**/rest/services/all/MapServer/${layerId}/legend**`,
                    fakeHtmlResponse
                ).as('legend')
                cy.intercept(
                    `**/rest/services/all/MapServer/${layerId}/legend**?lang=de**`,
                    fakeHtmlResponseGerman
                ).as('legendGerman')
                // opening layer settings
                cy.openLayerSettings(`${layerId}`)
                // clicking on the layer info button
                cy.get(`[data-cy^="button-show-description-layer-${layerId}-"]`)
                    .should('be.visible')
                    .click()
                // checking that the backend has been requested for this layer's legend
                const legendCalls = 1
                cy.wait('@legend')
                cy.get('@legend.all').should('have.length', legendCalls)
                // checking that the content of the popup is our mocked up content
                cy.get('[data-cy="layer-description"]').should('be.visible').contains('Test')

                // Changes the language to see if the legend is displayed in the correct language
                cy.viewport(900, 800)
                cy.clickOnLanguage('de')
                cy.wait('@legendGerman')
                cy.get('@legend.all').should('have.length', legendCalls)
                // ISSUE HERE : when we call SET TOPIC through the language, we revert the layers to their default state
                cy.get('[data-cy="layer-description"]').should('be.visible').contains(germanText)
            })
        })
        context('Timestamp management', () => {
            it('layer with timestamp can be configured', () => {
                goToMenuWithLayers()
                cy.log('shows all possible timestamps in the timestamp popover')
                const timedLayerId = 'test.timeenabled.wmts.layer'
                cy.get(`[data-cy^="time-selector-${timedLayerId}-"]`).should('be.visible').click()
                cy.get('[data-cy="time-selection-popup"]').should('be.visible')
                cy.fixture('layers.fixture.json').then((layers) => {
                    const timedLayerMetadata = layers[timedLayerId]
                    const defaultTimestamp = timedLayerMetadata.timeBehaviour
                    timedLayerMetadata.timestamps.forEach((timestamp: string) => {
                        cy.get(`[data-cy="time-select-${timestamp}"]`).should((timestampButton) => {
                            if (timestamp === defaultTimestamp) {
                                expect(timestampButton).to.have.class('btn-primary')
                            }
                        })
                    })
                })

                //---------------------------------------------------------------------------------
                cy.log('changes the timestamp of a layer when a time button is clicked')
                const timestamp = '20160101'
                // "force" is needed, as else there is a false positive "button hidden"
                // in cypress the button is effectively hidden but on real world not, somehow the
                // tooltip with the time selector is displayed on the right in cypress while on mobile
                // it is displayed on the top
                cy.get(`[data-cy="time-select-${timestamp}"]`).click({ force: true })
                cy.get(`[data-cy^="time-selector-${timedLayerId}-"]`)
                    .should('be.visible')
                    .contains(timestamp.slice(0, 4))
                cy.getPinia().then((pinia) => {
                    const layersStore27 = useLayersStore(pinia)
                    const activeLayers5 = layersStore27.activeLayers
                    expect(activeLayers5).to.be.an('Array').length(visibleLayerIds.length)
                    const layer3 = activeLayers5.find((layer: Layer) => layer.id === timedLayerId)
                    expect(layer3).not.to.be.undefined
                    expect(layer3!.timeConfig.currentTimeEntry?.timestamp).to.eq(timestamp)
                })

                //---------------------------------------------------------------------------------
                cy.log('keep timestamp configuration when the language changes')
                // ISSUE, AS ABOVE : changing language resets layers
                cy.clickOnLanguage('fr')
                cy.get('[data-cy="menu-active-layers"]:visible').should('be.visible').click()
                cy.get('[data-cy="time-selector-test.timeenabled.wmts.layer-2"]:visible').contains(
                    '2016'
                )
                cy.clickOnLanguage('en')

                //---------------------------------------------------------------------------------
                cy.log(`duplicate time layer`)
                cy.get(`[data-cy^="button-open-visible-layer-settings-${timedLayerId}-2"]`)
                    .should('be.visible')
                    .click({ force: true })
                // change the opacity to check later on that the new layer as the non default opacity
                cy.get(`[data-cy="slider-transparency-layer-${timedLayerId}-2"]`)
                    .should('be.visible')
                    .invoke('val', 1)
                    .trigger('input')
                cy.get(`[data-cy="button-duplicate-layer-${timedLayerId}-2"]`)
                    .should('be.visible')
                    .trigger('mouseover')
                cy.get(`[data-cy="floating-button-duplicate-layer-${timedLayerId}-2"]`)
                    .should('be.visible')
                    .contains(`Duplicate map`)
                cy.get(`[data-cy="button-duplicate-layer-${timedLayerId}-2"]`).click()

                //---------------------------------------------------------------------------------
                cy.log(`Check duplicate layer`)
                cy.get(`[data-cy="active-layer-name-${timedLayerId}-3"]`).should('be.visible')
                cy.get(`[data-cy="button-toggle-visibility-layer-${timedLayerId}-3"] svg`).should(
                    'have.class',
                    'fa-square-check'
                )
                cy.get(`[data-cy="time-selector-${timedLayerId}-3"]`)
                    .should('be.visible')
                    .contains(timestamp.slice(0, 4))
                cy.getPinia().then((pinia) => {
                    const layersStore28 = useLayersStore(pinia)
                    const activeLayers6 = layersStore28.activeLayers
                    expect(activeLayers6)
                        .to.be.an('Array')
                        .length(visibleLayerIds.length + 1)
                    expect(activeLayers6[3]).not.to.be.undefined
                    expect(activeLayers6[3]!.timeConfig.currentTimeEntry?.timestamp).to.eq(timestamp)
                    expect(activeLayers6[3]?.isVisible).to.be.true
                    expect(activeLayers6[3]?.opacity).to.eq(0)
                })

                //---------------------------------------------------------------------------------
                cy.log(`Change duplicate layer should not change original layer`)
                cy.get(`[data-cy="button-open-visible-layer-settings-${timedLayerId}-3"]`)
                    .should('be.visible')
                    .click({ force: true })
                const newTimestamp = '20200101'
                cy.get(`[data-cy="time-selector-${timedLayerId}-3"]`)
                    .should('be.visible')
                    .click({ force: true })
                // "force" is needed, as else there is a false positive "button hidden"
                // in cypress the button is effectively hidden but on real world not, somehow the
                // tooltip with the time selector is displayed on the right in cypress while on mobile
                // it is displayed on the top
                cy.get(`[data-cy="time-select-${newTimestamp}"]`).click({ force: true })
                cy.get(`[data-cy="time-selector-${timedLayerId}-3"]`)
                    .should('be.visible')
                    .contains(newTimestamp.slice(0, 4))
                cy.get(`[data-cy="button-toggle-visibility-layer-${timedLayerId}-3"] svg`)
                    .should('be.visible')
                    .click()
                cy.get(`[data-cy="slider-transparency-layer-${timedLayerId}-3"]`)
                    .should('be.visible')
                    .invoke('val', 0.5)
                    .trigger('input')
                cy.get(`[data-cy="time-selector-${timedLayerId}-2"]`)
                    .should('be.visible')
                    .contains(timestamp.slice(0, 4))
                cy.get(`[data-cy="button-toggle-visibility-layer-${timedLayerId}-2"] svg`).should(
                    'have.class',
                    'fa-square-check'
                )
                cy.get(`[data-cy="button-toggle-visibility-layer-${timedLayerId}-3"] svg`).should(
                    'have.class',
                    'fa-square'
                )
                cy.getPinia().then((pinia) => {
                    const layersStore29 = useLayersStore(pinia)
                    const activeLayers7 = layersStore29.activeLayers
                    expect(activeLayers7)
                        .to.be.an('Array')
                        .length(visibleLayerIds.length + 1)

                    assertDefined(activeLayers7[3])
                    expect(activeLayers7[3].timeConfig.currentTimeEntry?.timestamp).to.eq(newTimestamp)
                    expect(activeLayers7[3]?.isVisible).to.be.false
                    expect(activeLayers7[3]?.opacity).to.eq(0.5)

                    assertDefined(activeLayers7[2])
                    expect(activeLayers7[2]).not.to.be.undefined
                    expect(activeLayers7[2].timeConfig.currentTimeEntry?.timestamp).to.eq(timestamp)
                    expect(activeLayers7[2]?.isVisible).to.be.true
                    expect(activeLayers7[2]?.opacity).to.eq(0)
                })
            })
        })
        context('Re-ordering of layers', () => {
            beforeEach(() => {
                goToMenuWithLayers()
            })
            const checkOrderButtons = (layerId: string, index: number) => {
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
                    cy.get(`[data-cy^="button-lower-order-layer-${layerId}-"]`)
                        .should('be.visible')
                        .should(`${downArrowEnable ? 'not.' : ''}be.disabled`)
                    cy.get(`[data-cy^="button-raise-order-layer-${layerId}-"]`)
                        .should('be.visible')
                        .should(`${upArrowEnable ? 'not.' : ''}be.disabled`)
                })
            }
            it('Reorder layers using the "move" button', () => {
                const [bottomLayerId, middleLayerId, topLayerId] = visibleLayerIds
                cy.openLayerSettings(`${bottomLayerId}`)
                checkOrderButtons(`${bottomLayerId}`, 2)
                cy.openLayerSettings(`${middleLayerId}`)
                checkOrderButtons(`${middleLayerId}`, 1)
                cy.openLayerSettings(`${topLayerId}`)
                checkOrderButtons(`${topLayerId}`, 0)
                cy.checkOlLayer([
                    bgLayer,
                    { id: `${bottomLayerId}`, opacity: 0.75 },
                    { id: `${middleLayerId}` },
                    { id: `${topLayerId}`, opacity: 0.7 },
                ])

                cy.log('Moving the layers and test the arrow up/dow')

                cy.log(`Moving the layer ${middleLayerId} down`)
                cy.openLayerSettings(`${middleLayerId}`)
                cy.get(`[data-cy^="button-lower-order-layer-${middleLayerId}-"]`).click()
                checkOrderButtons(`${middleLayerId}`, 2)
                cy.checkOlLayer([
                    bgLayer,
                    { id: `${middleLayerId}` },
                    { id: `${bottomLayerId}`, opacity: 0.75 },
                    { id: `${topLayerId}`, opacity: 0.7 },
                ])

                cy.log(`Move ${middleLayerId} back to the middle`)
                cy.get(`[data-cy^="button-raise-order-layer-${middleLayerId}-"]`).click()
                checkOrderButtons(`${middleLayerId}`, 1)

                cy.log(`Move ${middleLayerId} it to the top`)
                cy.get(`[data-cy^="button-raise-order-layer-${middleLayerId}-"]`).click()
                checkOrderButtons(`${middleLayerId}`, 0)

                cy.log(`Move ${middleLayerId} back to the middle`)
                cy.get(`[data-cy^="button-lower-order-layer-${middleLayerId}-"]`).click()
                checkOrderButtons(`${middleLayerId}`, 1)

                cy.log('Moving the layers and toggling the visibility')
                cy.log(`Moving ${middleLayerId} to the top and toggle it visibility`)
                cy.get(`[data-cy^="button-raise-order-layer-${middleLayerId}-"]`).click()
                cy.get(`[data-cy^="button-toggle-visibility-layer-${middleLayerId}-"]`).click()
                cy.checkOlLayer([
                    bgLayer,
                    { id: `${bottomLayerId}`, opacity: 0.75 },
                    { id: `${topLayerId}`, opacity: 0.7 },
                    { id: `${middleLayerId}`, visible: false },
                ])
                cy.get(`[data-cy^="button-toggle-visibility-layer-${middleLayerId}-"]`).click()
                cy.checkOlLayer([
                    bgLayer,
                    { id: `${bottomLayerId}`, opacity: 0.75 },
                    { id: `${topLayerId}`, opacity: 0.7 },
                    { id: `${middleLayerId}`, visible: true, opacity: 1 },
                ])
                cy.log('Moving the layers and change the opacity')
                cy.log(`Moving ${middleLayerId} to the bottom and toggle it visibility`)
                cy.get(`[data-cy^="button-lower-order-layer-${middleLayerId}-"]`).click()
                cy.get(`[data-cy^="slider-transparency-layer-${middleLayerId}-"]`).realClick()
                cy.checkOlLayer([
                    bgLayer,
                    { id: `${bottomLayerId}`, opacity: 0.75 },
                    { id: `${middleLayerId}`, visible: true, opacity: 0.5 },
                    { id: `${topLayerId}`, opacity: 0.7 },
                ])

                cy.log(`Duplicate the time layer and modify it`)
                cy.get(`[data-cy="button-open-visible-layer-settings-${topLayerId}-2"]`)
                    .should('be.visible')
                    .click({ force: true })
                cy.get(`[data-cy="button-duplicate-layer-${topLayerId}-2"]`).click({ force: true })
                cy.get(`[data-cy="button-duplicate-layer-${topLayerId}-2"]`).trigger(
                    'mousemove',
                    15, // move the mouse down a bit to close the tooltip that covers the
                    // button that's clicked next
                    0,
                    {
                        force: true,
                    }
                )
                const newTimestamp = '20200101'
                cy.get(`[data-cy="time-selector-${topLayerId}-2"]:visible`).click({ force: true })
                // "force" is needed, as else there is a false positive "button hidden"
                // in cypress the button is effectively hidden but on real world not, somehow the
                // tooltip with the time selector is displayed on the right in cypress while on mobile
                // it is displayed on the top
                cy.get(`[data-cy="time-select-${newTimestamp}"]`).click({ force: true })
                cy.get(`[data-cy="time-selector-${topLayerId}-2"]:visible`).contains(
                    newTimestamp.slice(0, 4)
                )
                cy.get(`[data-cy="slider-transparency-layer-${topLayerId}-2"]`)
                    .invoke('val', 1)
                    .trigger('input')

                cy.get(`[data-cy="menu-active-layer-${topLayerId}-3"]`).should('be.visible')
                cy.get(`[data-cy="time-selector-${topLayerId}-3"]:visible`).contains('2018')
                cy.log('check OL layer before moving')
                cy.checkOlLayer([
                    bgLayer,
                    { id: `${bottomLayerId}`, opacity: 0.75 },
                    { id: `${middleLayerId}`, opacity: 0.5 },
                    { id: `${topLayerId}`, opacity: 0 },
                    { id: `${topLayerId}`, opacity: 0.7 },
                ])

                cy.log(`Move duplicate layer don't move the other`)
                cy.get(`[data-cy="button-lower-order-layer-${topLayerId}-2"]`).click()
                cy.get(`[data-cy="button-lower-order-layer-${topLayerId}-1"]`).click()
                cy.getPinia().then((pinia) => {
                    const layersStore30 = useLayersStore(pinia)
                    const activeLayers8 = layersStore30.activeLayers
                    expect(activeLayers8).to.be.an('Array').length(4)

                    assertDefined(activeLayers8[3])
                    expect(activeLayers8[3].timeConfig.currentTimeEntry?.timestamp).to.eq('20180101')
                    expect(activeLayers8[3]?.isVisible).to.be.true
                    expect(activeLayers8[3]?.opacity).to.eq(0.7)

                    assertDefined(activeLayers8[0])
                    expect(activeLayers8[0].timeConfig.currentTimeEntry?.timestamp).to.eq(newTimestamp)
                    expect(activeLayers8[0]?.isVisible).to.be.true
                    expect(activeLayers8[0]?.opacity).to.eq(0)
                })
                cy.checkOlLayer([
                    bgLayer,
                    { id: `${topLayerId}`, opacity: 0 },
                    { id: `${bottomLayerId}`, opacity: 0.75 },
                    { id: `${middleLayerId}`, opacity: 0.5 },
                    { id: `${topLayerId}`, opacity: 0.7 },
                ])
            })
            it('reorder layers when they are drag and dropped', () => {

                const [bottomLayerId, middleLayerId, topLayerId] = visibleLayerIds
                cy.get(`[data-cy^="menu-active-layer-${bottomLayerId}-"]`)
                    .should('be.visible')
                    .drag(`[data-cy^="menu-active-layer-${topLayerId}-"]`)
                const checkLayerOrder = (
                    expectedBottomLayerId: string,
                    expectedMiddleLayerId: string,
                    expectedTopLayerId: string
                ) => {
                    cy.location('hash').then((hash) => {
                        const layersParam = new URLSearchParams(hash).get('layers') ?? ''
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
                checkLayerOrder(`${middleLayerId}`, `${topLayerId}`, `${bottomLayerId}`)
                cy.get(`[data-cy^="menu-active-layer-${middleLayerId}-"]`)
                    .should('be.visible')
                    .drag(`[data-cy^="menu-active-layer-${topLayerId}-"]`)
                // new state is
                // - bottomLayer
                // - middleLayer
                // - topLayer
                checkLayerOrder(`${topLayerId}`, `${middleLayerId}`, `${bottomLayerId}`)
            })
        })
        context('External layers', () => {
            it('does not show a red icon for internal layers', () => {
                goToMenuWithLayers()
                visibleLayerIds.forEach((id) => {
                    cy.get(`[data-cy^="menu-active-layer-${id}-"]`)
                        .get('[data-cy="menu-external-disclaimer-icon-cloud"]')
                        .should('not.exist')
                })
            })
        })
    })
    context('Language settings in menu', () => {
        it('keeps the layer settings when changing language', () => {
            // ISSUE HERE
            const langBefore = 'en'
            const langAfter = 'de'
            const visibleLayerIds = [
                'test.wms.layer',
                'test.wmts.layer',
                'test.timeenabled.wmts.layer',
            ]
            let activeLayersConfigBefore: string

            cy.goToMapView({
                queryParams: {
                    lang: langBefore,
                    layers: visibleLayerIds.map((layer) => `${layer},f,0.1`).join(';'),
                },
            })

            // only the WMS layers have a lang attribute
            interface Layer {
                lang?: string
            }

            // Wait until the active layers are ready.
            cy.waitUntilState((pinia: Pinia) => {
                const layersStore = useLayersStore(pinia)
                return layersStore.activeLayers.some((layer: Layer) => layer.lang === langBefore)
            })

            // CHECK before
            cy.getPinia().then((pinia) => {
                const i18nStore = useI18nStore(pinia)
                const layersStore31 = useLayersStore(pinia)
                // Check the language before the switch.
                expect(i18nStore.lang).to.eq(langBefore)
                layersStore31.activeLayers
                    .filter((layer) => 'lang' in layer)
                    .forEach((layer) => expect(layer.lang).to.eq(langBefore))
                // Save the layer configuration before the switch.
                activeLayersConfigBefore = JSON.stringify(
                    layersStore31.activeLayers,
                    stringifyWithoutLangOrundefined
                )
            })

            // Open the menu and change the language.
            cy.openMenuIfMobile()
            cy.clickOnLanguage(langAfter)

            // Wait until the active layers are updated.
            cy.waitUntilState((pinia: Pinia) => {
                const layersStore = useLayersStore(pinia)
                return layersStore.activeLayers.some((layer: Layer) => layer.lang === langAfter)
            })

            // CHECK after
            cy.getPinia().then((pinia) => {
                const i18nStore2 = useI18nStore(pinia)
                const layersStore32 = useLayersStore(pinia)
                // Check the language after the switch.
                expect(i18nStore2.lang).to.eq(langAfter)
                layersStore32.activeLayers
                    .filter((layer) => 'lang' in layer)
                    .forEach((layer) => expect(layer.lang).to.eq(langAfter))
                // Compare the layer configuration (except the language)
                const activeLayersConfigAfter = JSON.stringify(
                    layersStore32.activeLayers,
                    stringifyWithoutLangOrundefined
                )
                expect(activeLayersConfigAfter).to.eq(activeLayersConfigBefore)
            })
        })
    })
    context('Copyrights/attributions of layers', () => {
        it('hides the copyrights zone when no layer is visible', () => {
            cy.goToMapView({ queryParams: { bgLayer: 'void' } })
            cy.get('[data-cy="layers-copyrights"] a').should('not.exist')
        })
        it('shows the copyright as a link when an attribution URL is available', () => {
            cy.fixture('layers.fixture').then((fakeLayers) => {
                const layerWithAttributionUrl = fakeLayers['test.wmts.layer']
                cy.goToMapView({
                    queryParams: { layers: layerWithAttributionUrl.serverLayerName },
                })
                cy.get(
                    `a[data-cy="layer-copyright-${layerWithAttributionUrl.attribution}"]`
                ).realHover()
                cy.get(`a[data-cy="layer-copyright-${layerWithAttributionUrl.attribution}"]`)
                    .should('be.visible')
                    .should('contain', layerWithAttributionUrl.attribution)
                    .should('have.css', 'cursor', 'pointer')
                    .should('have.attr', 'href', layerWithAttributionUrl.attributionUrl)
            })
        })
        it('shows a simple text with data owner name when no attribution URL is available', () => {
            cy.fixture('layers.fixture').then((fakeLayers) => {
                const layerWithoutAttributionUrl = fakeLayers['test.wms.layer']
                cy.goToMapView({
                    queryParams: { layers: layerWithoutAttributionUrl.serverLayerName },
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
                    queryParams: { layers: layerWithMalformedAttributionUrl.serverLayerName },
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
                queryParams: {
                    bgLayer: 'test.background.layer2',
                    layers: 'test.wmts.layer',
                },
            })
            cy.get('[data-cy="layers-copyrights"]').should('have.length', 1)
        })
    })
    context('GeoJSON layer data auto reload', () => {
        it('reloads periodically GeoJSON data when an update delay is set', () => {
            cy.goToMapView({ queryParams: { layers: 'test.geojson.layer' } })
            // waiting on initial load
            cy.wait('@geojson-data')
            // now it should reload every 2500ms (according to layers.fixture.json)
            cy.wait('@geojson-data', { timeout: 5000 })
            cy.wait('@geojson-data', { timeout: 5000 })
            cy.wait('@geojson-data', { timeout: 5000 })
        })
    })
    context('Custom url attributes', () => {
        it('Keeps custom attributes when changing language', () => {
            cy.goToMapView({ queryParams: { lang: 'fr' } })
            cy.wait(['@routeChange', '@layerConfig', '@topics', '@topic-ech'])
            cy.goToMapView({
                queryParams: {
                    lang: 'en',
                    bgLayer: 'ch.swisstopo.pixelkarte-farbe',
                    topic: 'ech',
                    layers: 'WMS|https://wms.geo.admin.ch/?item=2024-10-30t103151|test.background.layer@item=2024-10-30t103151',
                },
            })
            cy.wait(['@routeChange', '@layerConfig', '@topics', '@topic-ech'])
            cy.url().should('contain', 'item=2024-10-30t103151')
        })
    })
})
