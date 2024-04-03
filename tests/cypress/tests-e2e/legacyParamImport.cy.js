/// <reference types="cypress" />

import proj4 from 'proj4'

import { DEFAULT_PROJECTION } from '@/config'
import { FeatureInfoPositions } from '@/store/modules/ui.store'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'

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
        it('center where expected when given a X, Y coordinate', () => {
            cy.goToMapView(
                {
                    X: 2660000,
                    Y: 1200000,
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
            })
        })
        // TODO BGDIINF_SB-2685: re-activate
        it.skip('is able to import an external KML from a legacy adminId query param', () => {
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
        // TODO BGDIINF_SB-2685: re-activate
        it.skip("don't keep KML adminId in URL after import", () => {
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
        // TODO BGDIINF_SB-2685: re-activate
        it.skip('is able to import an external KML from a legacy adminId query param with other layers', () => {
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
            cy.intercept('**/rest/services/ech/SearchServer*?type=locations*', {
                body: {
                    results: [
                        {
                            attrs: {
                                detail: '1530 payerne 5822 payerne ch vd',
                                label: '  <b>1530 Payerne</b>',
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
            cy.url().should('include', 'swisssearch=1530+Payerne')
            cy.get('[data-cy="search-results-locations"]').should('be.visible')
        })
        it('External WMS layer', () => {
            const layerName = 'OpenData-AV'
            const layerId = 'ch.swisstopo-vd.official-survey'
            const url = 'https://fake.wms.base-1.url/?'
            cy.intercept(
                { url: `${url}**`, query: { REQUEST: 'GetMap' } },
                {
                    fixture: '256.png',
                }
            ).as('externalWMSGetMap')
            cy.intercept(
                { url: `${url}**`, query: { REQUEST: 'GetCapabilities' } },
                { fixture: 'external-wms-getcap-1.fixture.xml' }
            ).as('externalWMSGetCap')

            cy.goToMapView(
                {
                    layers: `test.wms.layer,WMS||${layerName}||${url}||${layerId}||1.3.0`,
                    layers_opacity: '1,1',
                    layers_visibility: 'false,true',
                    layers_timestamp: ',',
                },
                false
            )
            cy.wait('@externalWMSGetCap')
            cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
                expect(activeLayers).to.be.an('Array').length(2)
                const externalLayer = activeLayers[1]
                expect(externalLayer.isExternal).to.be.true
                expect(externalLayer.visible).to.be.true
                expect(externalLayer.baseUrl).to.eq(url)
                expect(externalLayer.externalLayerId).to.eq(layerId)
                expect(externalLayer.name).to.eq(layerName)
                expect(externalLayer.isLoading).to.false
            })
            const expectedHash = `#/map?lang=en&center=2660013.5,1185172&z=1&bgLayer=test.background.layer2&topic=ech&layers=test.wms.layer,f,1;WMS%7C${url}%7C${layerId}`
            cy.location().should((location) => {
                expect(location.hash).to.eq(expectedHash)
                expect(location.search).to.eq('')
            })
        })
        it('External WMTS layer', () => {
            cy.intercept('http://wmts-test.url/**', {
                fixture: 'external-wmts-getcap-1.fixture.xml',
            }).as('externalWMTSGetCap')
            cy.intercept(
                'http://test.wmts.png/wmts/1.0.0/TestExternalWMTS-*/default/ktzh/**/*/*.png',
                {
                    fixture: '256.png',
                }
            )
            const layerId = 'TestExternalWMTS-1'
            const layerName = 'Test External WMTS 1'
            const url = 'http://wmts-test.url/'
            cy.goToMapView(
                {
                    layers: `test.wmts.layer,WMTS||${layerId}||${url}`,
                    layers_opacity: '1,1',
                    layers_visibility: 'false,true',
                    layers_timestamp: '18641231,',
                },
                false
            )
            cy.wait('@externalWMTSGetCap')
            cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
                expect(activeLayers).to.be.an('Array').length(2)
                const externalLayer = activeLayers[1]
                expect(externalLayer.isExternal).to.be.true
                expect(externalLayer.visible).to.be.true
                expect(externalLayer.baseUrl).to.eq(url)
                expect(externalLayer.externalLayerId).to.eq(layerId)
                expect(externalLayer.name).to.eq(layerName)
                expect(externalLayer.isLoading).to.be.false
            })

            const expectedQuery = new URLSearchParams(
                `lang=en&center=2660013.5,1185172&z=1&bgLayer=test.background.layer2&topic=ech&layers=test.wmts.layer,f;WMTS%7C${url}%7C${layerId}`
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
            cy.readStoreValue('state.position.camera.z').should('eq', elevation)
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
            cy.readStoreValue('state.position.camera.pitch').should('eq', 0)
            cy.readStoreValue('state.position.camera.roll').should('eq', 0)

            // EPSG is set to 3857
            cy.readStoreValue('state.position.projection.epsgNumber').should('eq', 3857)
        })

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

    context('Feature Pre Selection Import', () => {
        function checkFeatures() {
            cy.get('@featuresIds').then((featuresIds) => {
                cy.readStoreValue('state.features.selectedFeatures').should((features) => {
                    expect(features.length).to.eq(featuresIds.length)

                    features.forEach((feature) => {
                        expect(featuresIds.includes(feature.id)).to.eq(true)
                    })
                })
            })
        }

        beforeEach(() => {
            // add intercept for all features, and allow their Ids to be used in tests
            cy.fixture('features.fixture.json').then((jsonResult) => {
                const features = [...jsonResult.results]
                const featuresIds = features.map((feature) => feature.id.toString())
                cy.wrap(features).as('features')
                cy.wrap(featuresIds).as('featuresIds')
                features.forEach((feature) => {
                    cy.intercept(`**/MapServer/${feature.layerBodId}/${feature.id}`, {
                        results: feature,
                    })
                })
            })
        })

        describe('Checks that the legacy bod layer id translate in the new implementation', () => {
            it('Select a few features and shows the tooltip in its correct spot', () => {
                // ---------------------------------------------------------------------------------
                cy.log('When showTooltip is not specified, we should have no tooltip')

                cy.get('@featuresIds').then((featuresIds) => {
                    const params = {
                        'ch.babs.kulturgueter': featuresIds.join(','),
                    }
                    cy.goToMapView(params, false)
                })
                checkFeatures()
                cy.readStoreValue('state.ui.featureInfoPosition').should(
                    'be.equal',
                    FeatureInfoPositions.NONE
                )
                cy.get('[data-cy="popover"]').should('not.exist')
                cy.get('[data-cy="infobox"]').should('not.exist')
                // ---------------------------------------------------------------------------------
                cy.log('When showTooltip is true, featureInfo should be none ')

                cy.get('@featuresIds').then((featuresIds) => {
                    const params = {
                        'ch.babs.kulturgueter': featuresIds.join(','),
                        showTooltip: 'true',
                    }
                    cy.goToMapView(params, false)
                })
                checkFeatures()
                cy.readStoreValue('state.ui.featureInfoPosition').should(
                    'be.equal',
                    FeatureInfoPositions.DEFAULT
                )
                cy.get('[data-cy="popover"]').should('not.exist')
                cy.get('[data-cy="infobox"]').should('be.visible')
                // ---------------------------------------------------------------------------------
                cy.log('When showTooltip is given a fantasist value, we should have no tooltip')

                cy.get('@featuresIds').then((featuresIds) => {
                    const params = {
                        'ch.babs.kulturgueter': featuresIds.join(','),
                        showTooltip: 'aFantasyValue',
                    }
                    cy.goToMapView(params, false)
                })
                checkFeatures()
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
