/// <reference types="cypress" />

import { registerProj4, WGS84 } from '@geoadmin/coordinates'
import proj4 from 'proj4'

import KmlStyles from '@/api/layers/KmlStyles.enum'
import { DEFAULT_PROJECTION } from '@/config/map.config'
import { FeatureInfoPositions } from '@/store/modules/ui.store'

registerProj4(proj4)

describe('Test on legacy param import', () => {
    context('Coordinates import', () => {
        it('transfers valid params to the hash part without changing them', () => {
            const lat = 47.3
            const lon = 7.3
            const zoom = 10.4
            cy.goToMapView(
                {
                    lat,
                    lon,
                    zoom: zoom,
                },
                false
            )

            // checking in the store that the position has not changed from what was in the URL
            cy.readStoreValue('state.position.zoom').should('eq', zoom)
            cy.readStoreValue('getters.centerEpsg4326').should((center) => {
                expect(center[0]).to.eq(lon)
                expect(center[1]).to.eq(lat)
            })
        })

        it('loads correctly if params are already behind the hash', () => {
            const lat = 47
            const lon = 7.5
            const zoom = 12
            cy.goToMapView(
                {
                    center: proj4(WGS84.epsg, DEFAULT_PROJECTION.epsg, [lon, lat]).join(','),
                    z: zoom,
                },
                true
            )

            // checking in the store that the position has not changed from what was in the URL
            cy.readStoreValue('state.position.zoom').should('eq', zoom)
            cy.readStoreValue('getters.centerEpsg4326').should((center) => {
                expect(center[0]).to.eq(lon)
                expect(center[1]).to.eq(lat)
            })
        })

        it('reproject LV95 coordinates param to EPSG:4326', () => {
            const E = 2660000
            const N = 1200000
            const lv95zoom = 8
            cy.goToMapView(
                {
                    E,
                    N,
                    zoom: lv95zoom,
                },
                false
            )

            cy.readStoreValue('state.position.zoom').should('eq', lv95zoom)

            // checking that we are reprojected to lon: 8.2267733° lat: 46.9483767°
            // (according to https://epsg.io/transform#s_srs=2056&t_srs=4326&x=2660000.0000000&y=1200000.0000000)
            cy.readStoreValue('getters.centerEpsg4326').should((center) => {
                // the app applies a rounding to the 6th decimal for lon/lat
                expect(center[0]).to.eq(WGS84.roundCoordinateValue(8.2267733))
                expect(center[1]).to.eq(WGS84.roundCoordinateValue(46.9483767))
            })
        })
        it('center where expected when given a X, Y coordinate in LV95', () => {
            // NOTE on the old viewer Y := correspond to x in EPSG definition
            // NOTE on the old viewer X := correspond to y in EPSG definition
            cy.goToMapView(
                {
                    Y: 2660000,
                    X: 1200000,
                },
                false
            )
            // checking that we are reprojected to lon: 8.2267733° lat: 46.9483767°
            // (according to https://epsg.io/transform#s_srs=2056&t_srs=4326&x=2660000.0000000&y=1200000.0000000)
            cy.readStoreValue('getters.centerEpsg4326').should((center) => {
                // the app applies a rounding to the 6th decimal for lon/lat
                expect(center[0]).to.eq(WGS84.roundCoordinateValue(8.2267733))
                expect(center[1]).to.eq(WGS84.roundCoordinateValue(46.9483767))
            })
        })
        it('center where expected when given a X, Y coordinate in LV03', () => {
            // NOTE on the old viewer Y := correspond to x in EPSG definition
            // NOTE on the old viewer X := correspond to y in EPSG definition
            cy.goToMapView(
                {
                    Y: 600000,
                    X: 200000,
                },
                false
            )
            // checking that we are reprojected to lon: 7.438632° lat: 46.9510828°
            // (according to https://epsg.io/transform#s_srs=21781&t_srs=4326&x=600000.0000000&y=200000.0000000)
            cy.readStoreValue('getters.centerEpsg4326').should((center) => {
                // the app applies a rounding to the 6th decimal for lon/lat
                expect(center[0]).to.eq(WGS84.roundCoordinateValue(7.438632))
                expect(center[1]).to.eq(WGS84.roundCoordinateValue(46.9510828))
            })
        })
    })

    context('Layers import', () => {
        const adminId = 'ABC0987654321'
        const kmlId = 'ABC1234567890'
        const kmlServiceBaseUrl = 'https://url-for-test'
        const kmlServiceBasePath = `/api/kml`
        const kmlServiceAdminPath = `${kmlServiceBasePath}/admin`
        const kmlServiceFilePath = `${kmlServiceBasePath}/files/${kmlId}`
        beforeEach(() => {
            // serving a dummy KML so that we don't get a 404
            cy.intercept(`**${kmlServiceFilePath}`, '<kml />').as('get-kml')
            cy.intercept(`**${kmlServiceAdminPath}?admin_id=${adminId}`, (request) => {
                request.reply({
                    id: kmlId,
                    admin_id: adminId,
                    links: {
                        self: `${kmlServiceBaseUrl}/api/kml/admin/${kmlId}`,
                        kml: `${kmlServiceBaseUrl}/api/kml/files/${kmlId}`,
                    },
                    created: '',
                    updated: '',
                })
            }).as('get-kml-metada-by-admin-id')
            cy.intercept(`**${kmlServiceAdminPath}/${kmlId}`, (request) => {
                request.reply({
                    id: kmlId,
                    links: {
                        self: `${kmlServiceBaseUrl}/api/kml/admin/${kmlId}`,
                        kml: `${kmlServiceBaseUrl}/api/kml/files/${kmlId}`,
                    },
                    created: '',
                    updated: '',
                })
            }).as('get-kml-metada')
        })

        it('Combines all old layers_*** params into the new one', () => {
            cy.goToMapView(
                {
                    layers: 'test.wms.layer,test.wmts.layer',
                    layers_opacity: '0.6,0.5',
                    layers_visibility: 'true,false',
                },
                false
            )
            cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
                expect(activeLayers).to.be.an('Array').length(2)
                const [wmsLayer, wmtsLayer] = activeLayers
                expect(wmsLayer.id).to.eq('test.wms.layer')
                expect(wmsLayer.opacity).to.eq(0.6)
                expect(wmsLayer.visible).to.be.true
                expect(wmtsLayer.id).to.eq('test.wmts.layer')
                expect(wmtsLayer.opacity).to.eq(0.5)
                expect(wmtsLayer.visible).to.be.false
            })
        })
        it('is able to import an external KML from a legacy param', () => {
            cy.goToMapView(
                {
                    layers: `KML||${kmlServiceBaseUrl}${kmlServiceFilePath}`,
                    layers_opacity: '0.6',
                    layers_visibility: 'true',
                },
                false
            )
            cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
                expect(activeLayers).to.be.an('Array').length(1)
                const [kmlLayer] = activeLayers
                expect(kmlLayer.baseUrl).to.eq(`${kmlServiceBaseUrl}${kmlServiceFilePath}`)
                expect(kmlLayer.opacity).to.eq(0.6)
                expect(kmlLayer.visible).to.be.true
                expect(kmlLayer.style).to.eq(KmlStyles.GEOADMIN)
            })
        })
        it('is able to import an external KML from a legacy adminId query param', () => {
            cy.goToMapView(
                {
                    adminId: adminId,
                },
                false
            )
            cy.wait('@get-kml-metada-by-admin-id')
            cy.wait('@get-kml')
            cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
                expect(activeLayers).to.be.an('Array').length(1)
                const [kmlLayer] = activeLayers
                expect(kmlLayer.baseUrl).to.eq(`${kmlServiceBaseUrl}${kmlServiceFilePath}`)
                expect(kmlLayer.opacity).to.eq(1)
                expect(kmlLayer.visible).to.be.true
                expect(kmlLayer.adminId).to.equal(adminId)
            })
        })
        it("don't keep KML adminId in URL after import", () => {
            cy.goToMapView(
                {
                    adminId: adminId,
                },
                false
            )
            cy.wait('@get-kml-metada-by-admin-id')
            cy.wait('@get-kml')
            cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
                expect(activeLayers).to.be.an('Array').length(1)
                const [kmlLayer] = activeLayers
                expect(kmlLayer.baseUrl).to.eq(`${kmlServiceBaseUrl}${kmlServiceFilePath}`)
                expect(kmlLayer.opacity).to.eq(1)
                expect(kmlLayer.visible).to.be.true
                expect(kmlLayer.adminId).to.be.equal(adminId)
            })
            cy.url().should('not.contain', adminId)
        })
        it('is able to import an external KML from a legacy adminId query param with other layers', () => {
            cy.goToMapView(
                {
                    adminId: adminId,
                    layers: 'test.wms.layer,test.wmts.layer',
                    layers_opacity: '0.6,0.5',
                    layers_visibility: 'true,false',
                },
                false
            )
            cy.wait('@get-kml-metada-by-admin-id')
            cy.wait('@get-kml')
            cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
                expect(activeLayers).to.be.an('Array').length(3)
                const [wmsLayer, wmtsLayer, kmlLayer] = activeLayers
                expect(wmsLayer.id).to.eq('test.wms.layer')
                expect(wmsLayer.opacity).to.eq(0.6)
                expect(wmsLayer.visible).to.be.true
                expect(wmtsLayer.id).to.eq('test.wmts.layer')
                expect(wmtsLayer.opacity).to.eq(0.5)
                expect(wmtsLayer.visible).to.be.false
                expect(kmlLayer.baseUrl).to.eq(`${kmlServiceBaseUrl}${kmlServiceFilePath}`)
                expect(kmlLayer.opacity).to.eq(1)
                expect(kmlLayer.visible).to.be.true
            })
        })
        it("doesn't show encoding in the search bar when serving a swisssearch legacy url", () => {
            cy.intercept('**/rest/services/ech/SearchServer*?type=layers*', {
                body: { results: [] },
            }).as('search-layers')
            const coordinates = [2598633.75, 1200386.75]
            cy.intercept('**/rest/services/ech/SearchServer*?type=locations*', {
                body: {
                    results: [
                        {
                            attrs: {
                                detail: '1530 payerne 5822 payerne ch vd',
                                label: '  <b>1530 Payerne</b>',
                                lat: 46.954559326171875,
                                lon: 7.420684814453125,
                                y: coordinates[0],
                                x: coordinates[1],
                            },
                        },
                    ],
                },
            }).as('search-locations')
            cy.goToMapView(
                {
                    swisssearch: '1530 Payerne',
                },
                false
            )
            cy.readStoreValue('state.search.query').should('eq', '1530 Payerne')
            cy.url().should('not.contain', 'swisssearch')
            cy.get('[data-cy="searchbar"]').click()
            const acceptableDelta = 0.25

            // selects the result if it is only one
            cy.readStoreValue('state.map.pinnedLocation').should((feature) => {
                expect(feature).to.not.be.null
                expect(feature).to.be.a('array').that.is.not.empty
                expect(feature[0]).to.be.approximately(coordinates[0], acceptableDelta)
                expect(feature[1]).to.be.approximately(coordinates[1], acceptableDelta)
            })
            cy.get('[data-cy="search-results-locations"]').should('not.be.visible')
        })
        it('External WMS layer', () => {
            cy.getExternalWmsMockConfig().then((mockConfig) => {
                const [mockExternalWms1] = mockConfig
                cy.goToMapView(
                    {
                        layers: `test.wms.layer,WMS||${mockExternalWms1.name}||${mockExternalWms1.baseUrl}||${mockExternalWms1.id}||1.3.0`,
                        layers_opacity: '1,1',
                        layers_visibility: 'false,true',
                        layers_timestamp: ',',
                    },
                    false
                )
                cy.wait(`@externalWMS-GetCap-${mockExternalWms1.baseUrl}`)
                cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
                    expect(activeLayers).to.be.an('Array').length(2)
                    const externalLayer = activeLayers[1]
                    expect(externalLayer.isExternal).to.be.true
                    expect(externalLayer.visible).to.be.true
                    expect(externalLayer.baseUrl).to.eq(mockExternalWms1.baseUrl)
                    expect(externalLayer.id).to.eq(mockExternalWms1.id)
                    expect(externalLayer.name).to.eq(mockExternalWms1.name)
                    expect(externalLayer.isLoading).to.false
                })
                const expectedHash = `layers=test.wms.layer,f,1;WMS%7C${mockExternalWms1.baseUrl}%7C${mockExternalWms1.id}`
                cy.location().should((location) => {
                    expect(location.hash).to.contain(expectedHash)
                    expect(location.search).to.eq('')
                })
            })
        })
        it('External WMTS layer', () => {
            cy.getExternalWmtsMockConfig().then((mockConfig) => {
                const [mockExternalWmts1] = mockConfig
                cy.goToMapView(
                    {
                        layers: `test.wmts.layer,WMTS||${mockExternalWmts1.id}||${mockExternalWmts1.baseUrl}`,
                        layers_opacity: '1,1',
                        layers_visibility: 'false,true',
                        layers_timestamp: '18641231,',
                    },
                    false
                )
                cy.wait(`@externalWMTS-GetCap-${mockExternalWmts1.baseUrl}`)
                cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
                    expect(activeLayers).to.be.an('Array').length(2)
                    const externalLayer = activeLayers[1]
                    expect(externalLayer.isExternal).to.be.true
                    expect(externalLayer.visible).to.be.true
                    expect(externalLayer.baseUrl).to.eq(mockExternalWmts1.baseUrl)
                    expect(externalLayer.id).to.eq(mockExternalWmts1.id)
                    expect(externalLayer.name).to.eq(mockExternalWmts1.name)
                    expect(externalLayer.isLoading).to.be.false
                })
                const expectedQuery = new URLSearchParams(
                    `lang=en&center=2660013.5,1185172&z=1&bgLayer=test.background.layer2&topic=ech&layers=test.wmts.layer,f;WMTS%7C${mockExternalWmts1.baseUrl}%7C${mockExternalWmts1.id}`
                )

                expectedQuery.sort()
                cy.location('search').should('be.empty')
                cy.location('hash').should('contain', '/map?')
                cy.location('hash').then((hash) => {
                    const query = new URLSearchParams(hash.replace('#/map?', ''))
                    query.sort()
                    expect(query.toString()).to.equal(expectedQuery.toString())
                })
            })
        })
    })

    context('3D import', () => {
        const lat = 47.3
        const lon = 7.3
        const elevation = 215370
        const heading = 318
        const pitch = -45

        it('transfers camera parameter from legacy URL to the new URL', () => {
            cy.goToMapView(
                {
                    lat,
                    lon,
                    elevation,
                    heading,
                    pitch,
                },
                false
            )

            // checking in the store that the parameters have been converted into the new 3D parameters
            cy.readStoreValue('state.cesium.active').should('eq', true) // cesium should be active

            // Checking camera position
            cy.readStoreValue('state.position.camera.x').should('eq', lon)
            cy.readStoreValue('state.position.camera.y').should('eq', lat)
            // For some reason, the z value is not exactly the same as the elevation
            // There might be a recalculating of the elevation
            cy.readStoreValue('state.position.camera.z').then((cameraZ) => {
                expect(Number(cameraZ)).to.approximately(elevation, 100)
            })
            cy.readStoreValue('state.position.camera.heading').should('eq', heading)
            cy.readStoreValue('state.position.camera.pitch').should('eq', pitch)
            cy.readStoreValue('state.position.camera.roll').should('eq', 0)

            // EPSG is set to 3857
            cy.readStoreValue('state.position.projection.epsgNumber').should('eq', 3857)
        })

        it('transfers camera parameter from legacy URL to the new URL only heading', () => {
            cy.goToMapView(
                {
                    lat,
                    lon,
                    heading,
                },
                false
            )

            // checking in the store that the parameters have been converted into the new 3D parameters
            cy.readStoreValue('state.cesium.active').should('eq', true) // cesium should be active

            // Checking camera position
            cy.readStoreValue('state.position.camera.x').should('eq', lon)
            cy.readStoreValue('state.position.camera.y').should('eq', lat)
            cy.readStoreValue('state.position.camera.z').should('eq', 0)
            cy.readStoreValue('state.position.camera.heading').should('eq', heading)
            cy.readStoreValue('state.position.camera.pitch').should('eq', -90)
            cy.readStoreValue('state.position.camera.roll').should('eq', 0)

            // EPSG is set to 3857
            cy.readStoreValue('state.position.projection.epsgNumber').should('eq', 3857)
        })
        // camera=7.038834,46.766017,193985.5,-47,319,
        // camera=8.225457,46.858429,738575.8,-90,,
        it('transfers camera parameter from legacy URL to the new URL only elevation', () => {
            cy.goToMapView(
                {
                    lat,
                    lon,
                    elevation,
                },
                false
            )

            // checking in the store that the parameters have been converted into the new 3D parameters
            cy.readStoreValue('state.cesium.active').should('eq', true) // cesium should be active

            // Checking camera position
            // x, y, and z seems recalculated when there is only elevation, so I just check that they are not null
            cy.readStoreValue('state.position.camera.x').should('not.be.null')
            cy.readStoreValue('state.position.camera.y').should('not.be.null')
            cy.readStoreValue('state.position.camera.z').should('not.be.null')
            cy.readStoreValue('state.position.camera.heading').should('eq', 0)
            cy.readStoreValue('state.position.camera.pitch').should('eq', -90)
            cy.readStoreValue('state.position.camera.roll').should('eq', 0)

            // EPSG is set to 3857
            cy.readStoreValue('state.position.projection.epsgNumber').should('eq', 3857)
        })
    })

    context('Extra Parameter Imports', () => {
        it('shows the compare slider at the correct position', () => {
            /*  */
            cy.goToMapView(
                {
                    layers: 'test-1.wms.layer',
                    swipe_ratio: '0.3',
                },
                false
            )
            // initial slider position is width * 0.3 -20
            cy.get('[data-cy="compareSlider"]').then((slider) => {
                cy.readStoreValue('state.ui.width').should((width) => {
                    expect(slider.position()['left']).to.eq(width * 0.3 - 20)
                })
            })
            cy.readStoreValue('state.ui.compareRatio').should('be.equal', 0.3)

            cy.readStoreValue('state.ui.isCompareSliderActive').should('be.equal', true)
            cy.get('[data-cy="compareSlider"]').should('be.visible')
        })
    })
    it.skip('should show the time slider on startup when setting it in the URL', () => {
        cy.goToMapView(
            {
                layers: `test.timeenabled.wmts.layer`,
                time: 2019,
            },
            false
        ),
            cy.get('[data-cy="time-slider-current-year"]').should('contain', 2019)
    })
    context('Feature Pre Selection Import', () => {
        function checkFeatures(featuresIds) {
            cy.readStoreValue('getters.selectedFeatures').should((features) => {
                expect(features.length).to.eq(featuresIds.length)

                features.forEach((feature) => {
                    expect(featuresIds).to.include(feature.id)
                })
            })
        }

        context('Checks that the legacy bod layer id translate in the new implementation', () => {
            it('Select a few features and shows the tooltip in its correct spot', () => {
                const featuresIds = ['1234', '5678', '9012']
                // ---------------------------------------------------------------------------------
                cy.log('When showTooltip is not specified, we should have no tooltip')

                cy.goToMapView(
                    {
                        'ch.babs.kulturgueter': featuresIds.join(','),
                    },
                    false
                )
                checkFeatures(featuresIds)
                cy.readStoreValue('state.ui.featureInfoPosition').should(
                    'be.equal',
                    FeatureInfoPositions.NONE
                )
                cy.get('[data-cy="popover"]').should('not.exist')
                cy.get('[data-cy="infobox"]').should('not.exist')
                // ---------------------------------------------------------------------------------
                cy.log(
                    'When showTooltip is true, featureInfo should be bottom panel on devices with width < 400 px '
                )

                cy.goToMapView(
                    {
                        'ch.babs.kulturgueter': featuresIds.join(','),
                        showTooltip: 'true',
                    },
                    false
                )
                checkFeatures(featuresIds)
                cy.readStoreValue('state.ui.featureInfoPosition').should(
                    'be.equal',
                    FeatureInfoPositions.BOTTOMPANEL
                )
                cy.get('[data-cy="popover"]').should('not.exist')
                cy.get('[data-cy="infobox"]').should('be.visible')
                // ---------------------------------------------------------------------------------
                cy.log(
                    'When showTooltip is true, featureInfo should be default on devices with width >= 400 px '
                )
                cy.viewport(400, 800)
                cy.goToMapView(
                    {
                        'ch.babs.kulturgueter': featuresIds.join(','),
                        showTooltip: 'true',
                    },
                    false
                )
                checkFeatures(featuresIds)
                cy.readStoreValue('state.ui.featureInfoPosition').should(
                    'be.equal',
                    FeatureInfoPositions.DEFAULT
                )
                cy.get('[data-cy="popover"]').should('not.exist')
                cy.get('[data-cy="infobox"]').should('be.visible')
                // ---------------------------------------------------------------------------------
                cy.log('When showTooltip is given a fantasist value, we should have no tooltip')

                cy.goToMapView(
                    {
                        'ch.babs.kulturgueter': featuresIds.join(','),
                        showTooltip: 'aFantasyValue',
                    },
                    false
                )
                checkFeatures(featuresIds)
                cy.readStoreValue('state.ui.featureInfoPosition').should(
                    'be.equal',
                    FeatureInfoPositions.NONE
                )
                cy.get('[data-cy="popover"]').should('not.exist')
                cy.get('[data-cy="infobox"]').should('not.exist')
            })
        })
    })
})
