/// <reference types="cypress" />

import { WEBMERCATOR, WGS84 } from '@geoadmin/coordinates'

import { transformLayerIntoUrlString } from '@/router/storeSync/layersParamParser'

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
    key === 'lang' || key === 'uuid' || value === null ? undefined : value

describe('Test of layer handling', () => {
    const bgLayer = 'test.background.layer2'
    context('Layer in URL at app startup', () => {
        it('starts without any visible layer added opening the app without layers URL param', () => {
            cy.goToMapView()
            cy.readStoreValue('getters.visibleLayers').should('be.empty')
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
                layers: [
                    'test-1.wms.layer',
                    'test-2.wms.layer@param=value,,',
                    'test-3.wms.layer,f',
                    'test-4.wms.layer,,0.4',
                    'test.wmts.layer,f,0.5',
                ].join(';'),
            })

            //-----------------------------------------------------------------
            cy.log(`Check layers in store`)
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
            it('reads and adds an external WMS correctly', () => {
                cy.getExternalWmsMockConfig().then((layerObjects) => {
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
                    layerObjects[1].baseUrl = layerObjects[1].baseUrl + 'item=22_06_86t13214'
                    const layers = layerObjects.map(transformLayerIntoUrlString).join(';')
                    cy.goToMapView({ layers })

                    cy.log(`Verify that the Get capabilities of both server are called`)
                    cy.wait([
                        `@externalWMS-GetCap-${mockExternalWms1.baseUrl}`,
                        `@externalWMS-GetCap-${mockExternalWms3.baseUrl}`,
                    ])

                    cy.log(`Verify that extra custom attributes are passed along to the WMS server`)
                    cy.wait(`@externalWMS-GetMap-${mockExternalWms1.id}`)
                        .its('request.query')
                        .should('have.property', 'item', 'MyItem')

                    cy.log(`Verify that the active layers store match the url input`)
                    cy.readStoreValue('state.layers.activeLayers').should((layers) => {
                        expect(layers).to.be.lengthOf(layerObjects.length)

                        layers.forEach((layer) => {
                            expect(layer.isLoading).to.be.false
                            expect(layer.isExternal).to.be.true
                        })
                        layerObjects.forEach((layer, index) => {
                            expect(layers[index].id).to.be.eq(layer.id)
                            expect(layers[index].baseUrl).to.be.eq(layer.baseUrl)
                            expect(layers[index].name).to.be.eq(layer.name)
                            expect(layers[index].wmsVersion).to.be.eq(layer.wmsVersion)
                            expect(layers[index].visible).to.eq(layer.visible)
                            expect(layers[index].opacity).to.eq(layer.opacity)
                        })
                    })

                    // shows a red icon to signify a layer is from an external source
                    cy.openMenuIfMobile()
                    cy.get(`[data-cy^="menu-active-layer-"]`).each(($el) => {
                        cy.wrap($el)
                            .get('[data-cy="menu-external-disclaimer-icon-cloud"]')
                            .should('be.visible')
                    })
                    layerObjects.toReversed().forEach((layer, index) => {
                        cy.get('[data-cy^="menu-active-layer-"]')
                            .eq(index)
                            .should('contain', layer.name)
                    })

                    cy.checkOlLayer([
                        bgLayer,
                        ...layerObjects.map((layer) => {
                            return {
                                id: layer.id,
                                visible: layer.visible,
                                opacity: layer.opacity,
                            }
                        }),
                    ])

                    cy.log('getFeatureInfo testing')
                    // layer 1 and 2 have the same "backend", so we deactivate layer 2 and activate layer 3
                    cy.get(
                        `[data-cy^="button-toggle-visibility-layer-${mockExternalWms2.id}-"]`
                    ).click()
                    cy.get(
                        `[data-cy^="button-toggle-visibility-layer-${mockExternalWms3.id}-"]`
                    ).click()
                    cy.checkOlLayer([
                        bgLayer,
                        { id: mockExternalWms1.id, visible: true, opacity: 1.0 },
                        { id: mockExternalWms2.id, visible: false, opacity: 0.8 },
                        { id: mockExternalWms3.id, visible: true, opacity: 1.0 },
                        { id: mockExternalWms4.id, visible: false, opacity: 0.4 },
                    ])

                    // A click on the map should trigger a getFeatureInfo on both visible/active layers 1 and 3.
                    // So we start by defining intercepts for these two requests
                    cy.intercept(
                        {
                            url: `${mockExternalWms1.baseUrl}**`,
                            query: { REQUEST: 'GetFeatureInfo' },
                        },

                        { features: [] }
                    ).as('getFeatureInfoServer1')
                    cy.intercept(
                        {
                            url: `${mockExternalWms3.baseUrl}**`,
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
                    cy.openLayerSettings(mockExternalWms1.id)

                    cy.get(`[data-cy^="slider-transparency-layer-${mockExternalWms1.id}-"]`)
                        .should('be.visible')
                        .invoke('val', 1)
                        .trigger('input')
                    cy.openLayerSettings(mockExternalWms4.id)

                    cy.get(`[data-cy^="slider-transparency-layer-${mockExternalWms4.id}-"]`)
                        .should('be.visible')
                        .invoke('val', 0)
                        .trigger('input')

                    // we had some issues with wms transparency reverting back to default when reaching 0
                    // we test layer 1 and 3 for transparency 0, since that's both our wms fixtures tested
                    // this way
                    cy.openLayerSettings(mockExternalWms3.id)

                    cy.get(`[data-cy^="slider-transparency-layer-${mockExternalWms3.id}-"]`)
                        .should('be.visible')
                        .invoke('val', 1)
                        .trigger('input')

                    cy.checkOlLayer([
                        bgLayer,
                        { id: mockExternalWms1.id, visible: true, opacity: 0.0 },
                        { id: mockExternalWms2.id, visible: false, opacity: 0.8 },
                        { id: mockExternalWms3.id, visible: true, opacity: 0.0 },
                        { id: mockExternalWms4.id, visible: false, opacity: 1.0 },
                    ])
                })
            })
            it('reads and adds an external WMTS correctly', () => {
                cy.getExternalWmtsMockConfig().then((layerObjects) => {
                    const [mockExternalWmts1, _, mockExternalWmts3] = layerObjects

                    cy.goToMapView({
                        layers: layerObjects
                            .map((object) => transformLayerIntoUrlString(object))
                            .join(';'),
                    })

                    cy.wait([
                        `@externalWMTS-GetCap-${mockExternalWmts1.baseUrl}`,
                        `@externalWMTS-GetCap-${mockExternalWmts3.baseUrl}`,
                    ])

                    cy.readStoreValue('getters.visibleLayers').should((layers) => {
                        expect(layers).to.have.lengthOf(layerObjects.length)
                        layers.forEach((layer) => {
                            expect(layer.isLoading).to.be.false
                            expect(layer.isExternal).to.be.true
                        })
                        layerObjects.forEach((layer, index) => {
                            expect(layers[index].id).to.be.eq(layer.id)
                            expect(layers[index].baseUrl).to.be.eq(layer.baseUrl)
                            expect(layers[index].name).to.be.eq(layer.name)
                            expect(layers[index].visible).to.eq(layer.visible)
                            expect(layers[index].opacity).to.eq(layer.opacity)
                        })
                    })
                    cy.checkOlLayer([
                        bgLayer,
                        ...layerObjects.map((layer) => {
                            return {
                                id: layer.id,
                                visible: layer.visible,
                                opacity: layer.opacity,
                            }
                        }),
                    ])
                    cy.openMenuIfMobile()
                    cy.get('[data-cy^="menu-active-layer-"]').should(
                        'have.length',
                        layerObjects.length
                    )
                    layerObjects.toReversed().forEach((layer, index) => {
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

                    mockExternalWmts1.visible = false
                    mockExternalWmts1.opacity = 0.5
                    mockExternalWmts2.visible = false
                    mockExternalWmts3.visible = true
                    mockExternalWmts3.opacity = 0.8

                    const layerObjects2 = [
                        mockExternalWmts1.clone(),
                        mockExternalWmts2.clone(),
                        mockExternalWmts3.clone(),
                    ]
                    // reads and sets non default layer config; visible and opacity
                    cy.goToMapView({
                        layers: layerObjects2
                            .map((object) => transformLayerIntoUrlString(object))
                            .join(';'),
                    })
                    cy.readStoreValue('getters.visibleLayers').should('have.length', 1)
                    cy.readStoreValue('state.layers.activeLayers').should((layers) => {
                        expect(layers).to.have.lengthOf(layerObjects2.length)
                        layerObjects2.forEach((layer, index) => {
                            expect(layers[index].id).to.eq(layer.id)
                            expect(layers[index].visible).to.eq(layer.visible)
                            expect(layers[index].opacity).to.eq(layer.opacity)
                        })
                    })
                    // shows a red icon to signify a layer is from an external source
                    cy.openMenuIfMobile()
                    cy.get('[data-cy^="menu-active-layer-"]').should(
                        'have.length',
                        layerObjects2.length
                    )
                    layerObjects2.toReversed().forEach((layer, index) => {
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
                                visible: layer.visible,
                                opacity: layer.opacity,
                            }
                        }),
                    ])
                    cy.log(`Make sure that the external backend have not been called twice`)
                    cy.get(`@externalWMTS-GetCap-${mockExternalWmts1.baseUrl}.all`).should(
                        'have.length',
                        1
                    )
                    cy.get(`@externalWMTS-GetCap-${mockExternalWmts3.baseUrl}.all`).should(
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
                    expect(externaLayer.id).to.eq(wmtsUnreachableLayerId)
                    expect(externaLayer.baseUrl).to.eq(wmtsUnreachableUrl)
                    expect(externaLayer.isLoading).to.be.false
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
                cy.readStoreValue('getters.visibleLayers').then((layers) => {
                    expect(layers).to.have.lengthOf(4)
                    const externaLayer = layers[1]
                    expect(externaLayer.id).to.eq(wmtsInvalidContentLayerId)
                    expect(externaLayer.baseUrl).to.eq(wmtsInvalidContentUrl)
                    expect(externaLayer.isLoading).to.be.false
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
                cy.readStoreValue('getters.visibleLayers').then((layers) => {
                    expect(layers).to.have.lengthOf(4)
                    const externaLayer = layers[2]
                    expect(externaLayer.id).to.eq(wmsUnreachableLayerId)
                    expect(externaLayer.baseUrl).to.eq(wmsUnreachableUrl)
                    expect(externaLayer.isLoading).to.be.false
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
                cy.readStoreValue('getters.visibleLayers').then((layers) => {
                    expect(layers).to.have.lengthOf(4)
                    const externaLayer = layers[3]
                    expect(externaLayer.id).to.eq(wmsInvalidContentLayerId)
                    expect(externaLayer.baseUrl).to.eq(wmsInvalidContentUrl)
                    expect(externaLayer.isLoading).to.be.false
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
            cy.goToMapView({ bgLayer: 'void' })
            cy.readStoreValue('getters.currentBackgroundLayer').should('be.null')
        })
        it('sets the background to the topic default if none is defined in the URL', () => {
            cy.fixture('topics.fixture').then((topicFixtures) => {
                const [defaultTopic] = topicFixtures.topics
                cy.goToMapView()
                cy.readStoreValue('getters.currentBackgroundLayer').then((bgLayer) => {
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
                cy.readStoreValue('getters.currentBackgroundLayer').then((bgLayer) => {
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
            cy.readStoreValue('getters.currentBackgroundLayer').then((bgLayer) => {
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
                cy.get('[data-cy="search-results-layers"] [data-cy="search-result-entry"]')
                    .first()
                    .click()
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
                const command = '{rightarrow}'.repeat(repetitions)
                cy.get(`[data-cy^="slider-transparency-layer-${layerId}-"]`)
                    .should('be.visible')
                    .type(command)
                // checking that the opacity has changed accordingly
                cy.readStoreValue('getters.visibleLayers', (visibleLayers) => {
                    const layer = visibleLayers.find((layer) => layer.id === layerId)
                    expect(layer.opacity).to.eq(initialOpacity + step * repetitions)
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

                    cy.readStoreValue('getters.visibleLayers').should((visibleLayers) => {
                        const layer = visibleLayers.find((layer) => layer.id === layerId)
                        expect(layer.opacity).to.eq(0.0)
                    })
                })
            })
            it('reorders visible layers when corresponding buttons are pressed', () => {
                const [firstLayerId, secondLayerId] = visibleLayerIds
                // lower the order of the first layer
                cy.openLayerSettings(firstLayerId)
                cy.get(`[data-cy^="button-raise-order-layer-${firstLayerId}-"]`)
                    .should('be.visible')
                    .click()
                // checking that the order has changed
                cy.readStoreValue('getters.visibleLayers', (visibleLayers) => {
                    expect(visibleLayers[0].id).to.eq(secondLayerId)
                    expect(visibleLayers[1].id).to.eq(firstLayerId)
                })
                // using the other button
                cy.get(`[data-cy^="button-lower-order-layer-${firstLayerId}-"]`)
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
                cy.openLayerSettings(layerId)
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
                    timedLayerMetadata.timestamps.forEach((timestamp) => {
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
                cy.readStoreValue('state.layers.activeLayers').should((activeLayers) => {
                    expect(activeLayers).to.be.an('Array').length(visibleLayerIds.length)
                    const layer = activeLayers.find((l) => l.id === timedLayerId)
                    expect(layer).not.to.be.undefined
                    expect(layer.timeConfig.currentTimestamp).to.eq(timestamp)
                })

                //---------------------------------------------------------------------------------
                cy.log('keep timestamp configuration when the language changes')
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
                cy.readStoreValue('state.layers.activeLayers').should((activeLayers) => {
                    expect(activeLayers)
                        .to.be.an('Array')
                        .length(visibleLayerIds.length + 1)
                    expect(activeLayers[3]).not.to.be.undefined
                    expect(activeLayers[3].timeConfig.currentTimestamp).to.eq(timestamp)
                    expect(activeLayers[3].visible).to.be.true
                    expect(activeLayers[3].opacity).to.eq(0)
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
                cy.readStoreValue('state.layers.activeLayers').should((activeLayers) => {
                    expect(activeLayers)
                        .to.be.an('Array')
                        .length(visibleLayerIds.length + 1)

                    expect(activeLayers[3]).not.to.be.undefined
                    expect(activeLayers[3].timeConfig.currentTimestamp).to.eq(newTimestamp)
                    expect(activeLayers[3].visible).to.be.false
                    expect(activeLayers[3].opacity).to.eq(0.5)

                    expect(activeLayers[2]).not.to.be.undefined
                    expect(activeLayers[2].timeConfig.currentTimestamp).to.eq(timestamp)
                    expect(activeLayers[2].visible).to.be.true
                    expect(activeLayers[2].opacity).to.eq(0)
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
                cy.get(`[data-cy^="button-lower-order-layer-${middleLayerId}-"]`).click()
                checkOrderButtons(middleLayerId, 2)
                cy.checkOlLayer([
                    'test.background.layer2',
                    middleLayerId,
                    { id: bottomLayerId, opacity: 0.75 },
                    { id: topLayerId, opacity: 0.7 },
                ])

                cy.log(`Move ${middleLayerId} back to the middle`)
                cy.get(`[data-cy^="button-raise-order-layer-${middleLayerId}-"]`).click()
                checkOrderButtons(middleLayerId, 1)

                cy.log(`Move ${middleLayerId} it to the top`)
                cy.get(`[data-cy^="button-raise-order-layer-${middleLayerId}-"]`).click()
                checkOrderButtons(middleLayerId, 0)

                cy.log(`Move ${middleLayerId} back to the middle`)
                cy.get(`[data-cy^="button-lower-order-layer-${middleLayerId}-"]`).click()
                checkOrderButtons(middleLayerId, 1)

                cy.log('Moving the layers and toggling the visibility')
                cy.log(`Moving ${middleLayerId} to the top and toggle it visibility`)
                cy.get(`[data-cy^="button-raise-order-layer-${middleLayerId}-"]`).click()
                cy.get(`[data-cy^="button-toggle-visibility-layer-${middleLayerId}-"]`).click()
                cy.checkOlLayer([
                    'test.background.layer2',
                    { id: bottomLayerId, opacity: 0.75 },
                    { id: topLayerId, opacity: 0.7 },
                    { id: middleLayerId, visible: false },
                ])
                cy.get(`[data-cy^="button-toggle-visibility-layer-${middleLayerId}-"]`).click()
                cy.checkOlLayer([
                    'test.background.layer2',
                    { id: bottomLayerId, opacity: 0.75 },
                    { id: topLayerId, opacity: 0.7 },
                    { id: middleLayerId, visible: true, opacity: 1 },
                ])

                cy.log('Moving the layers and change the opacity')
                cy.log(`Moving ${middleLayerId} to the bottom and toggle it visibility`)
                cy.get(`[data-cy^="button-lower-order-layer-${middleLayerId}-"]`).click()
                cy.get(`[data-cy^="slider-transparency-layer-${middleLayerId}-"]`).realClick()
                cy.checkOlLayer([
                    'test.background.layer2',
                    { id: bottomLayerId, opacity: 0.75 },
                    { id: middleLayerId, visible: true, opacity: 0.5 },
                    { id: topLayerId, opacity: 0.7 },
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
                    'test.background.layer2',
                    { id: bottomLayerId, opacity: 0.75 },
                    { id: middleLayerId, opacity: 0.5 },
                    { id: topLayerId, opacity: 0 },
                    { id: topLayerId, opacity: 0.7 },
                ])

                cy.log(`Move duplicate layer don't move the other`)
                cy.get(`[data-cy="button-lower-order-layer-${topLayerId}-2"]`).click()
                cy.get(`[data-cy="button-lower-order-layer-${topLayerId}-1"]`).click()
                cy.readStoreValue('state.layers.activeLayers').should((activeLayers) => {
                    expect(activeLayers).to.be.an('Array').length(4)

                    expect(activeLayers[3]).not.to.be.undefined
                    expect(activeLayers[3].timeConfig.currentTimestamp).to.eq('20180101')
                    expect(activeLayers[3].visible).to.be.true
                    expect(activeLayers[3].opacity).to.eq(0.7)

                    expect(activeLayers[0]).not.to.be.undefined
                    expect(activeLayers[0].timeConfig.currentTimestamp).to.eq(newTimestamp)
                    expect(activeLayers[0].visible).to.be.true
                    expect(activeLayers[0].opacity).to.eq(0)
                })
                cy.checkOlLayer([
                    'test.background.layer2',
                    { id: topLayerId, opacity: 0 },
                    { id: bottomLayerId, opacity: 0.75 },
                    { id: middleLayerId, opacity: 0.5 },
                    { id: topLayerId, opacity: 0.7 },
                ])
            })
            it.skip('reorder layers when they are drag and dropped', () => {
                const [bottomLayerId, middleLayerId, topLayerId] = visibleLayerIds
                cy.get(`[data-cy^="menu-active-layer-${bottomLayerId}-"]`)
                    .should('be.visible')
                    .drag(`[data-cy^="menu-active-layer-${topLayerId}-"]`)
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
                cy.get(`[data-cy^="menu-active-layer-${middleLayerId}-"]`)
                    .should('be.visible')
                    .drag(`[data-cy^="menu-active-layer-${topLayerId}-"]`)
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
                    cy.get(`[data-cy^="menu-active-layer-${id}-"]`)
                        .get('[data-cy="menu-external-disclaimer-icon-cloud"]')
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
            cy.readStoreValue('state').should((state) => {
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
            cy.readStoreValue('state').should((state) => {
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
    context('GeoJSON layer data auto reload', () => {
        it('reloads periodically GeoJSON data when an update delay is set', () => {
            cy.goToMapView({
                layers: 'test.geojson.layer',
            })
            // waiting on initial load
            cy.wait('@geojson-data')
            // now it should reload every 2500ms (according to layers.fixture.json)
            cy.wait('@geojson-data', { timeout: 5000 })
            cy.wait('@geojson-data', { timeout: 5000 })
            cy.wait('@geojson-data', { timeout: 5000 })
        })
    })
    context('Custom url attributes', () => {
        it('Keep custom attributes when changing language', () => {
            cy.goToMapView({
                lang: 'fr',
            })
            cy.wait(['@routeChange', '@layerConfig', '@topics', '@topic-ech'])
            cy.goToMapView({
                lang: 'en',
                bgLayer: 'ch.swisstopo.pixelkarte-farbe',
                topic: 'ech',
                layers: 'WMS|https://wms.geo.admin.ch/?item=2024-10-30t103151|test.background.layer@item=2024-10-30t103151',
            })
            cy.wait(['@routeChange', '@layerConfig', '@topics', '@topic-ech'])
            cy.url().should('contain', 'item=2024-10-30t103151')
        })
    })
})
