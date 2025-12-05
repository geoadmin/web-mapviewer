import { LV95, WGS84 } from '@swissgeo/coordinates'
import proj4 from 'proj4'

import useCesiumStore from '@/store/modules/cesium'
import useFeaturesStore from '@/store/modules/features'
import useLayersStore from '@/store/modules/layers'
import useMapStore from '@/store/modules/map'
import usePositionStore from '@/store/modules/position'
import useSearchStore from '@/store/modules/search'
import useUIStore from '@/store/modules/ui'

describe('Test on legacy param import', () => {
    context('Coordinates import', () => {
        it('transfers valid params to the hash part without changing them', () => {
            const lat = 47.3
            const lon = 7.3
            const zoom = 10.4
            cy.goToMapView({
                queryParams: {
                    lat,
                    lon,
                    zoom: zoom,
                },
                withHash: false,
            })

            // checking in the store that the position has not changed from what was in the URL
            cy.getPinia().then((pinia) => {
                const positionStore = usePositionStore(pinia)
                expect(positionStore.zoom).to.eq(zoom)
                const centerEpsg4326 = positionStore.centerEpsg4326
                expect(centerEpsg4326[0]).to.eq(lon)
                expect(centerEpsg4326[1]).to.eq(lat)
            })
        })
        it('loads correctly if params are already behind the hash', () => {
            const lat = 47
            const lon = 7.5
            const zoom = 12
            cy.goToMapView({
                queryParams: {
                    center: proj4(WGS84.epsg, LV95.epsg, [lon, lat]).join(','),
                    z: zoom,
                },
                withHash: true,
            })

            // checking in the store that the position has not changed from what was in the URL
            cy.getPinia().then((pinia) => {
                const positionStore2 = usePositionStore(pinia)
                expect(positionStore2.zoom).to.eq(zoom)
                const centerEpsg43262 = positionStore2.centerEpsg4326
                expect(centerEpsg43262[0]).to.eq(lon)
                expect(centerEpsg43262[1]).to.eq(lat)
            })
        })
        it('reproject LV95 coordinates param to EPSG:4326', () => {
            const E = 2660000
            const N = 1200000
            const lv95zoom = 8
            cy.goToMapView({
                queryParams: {
                    E,
                    N,
                    zoom: lv95zoom,
                },
                withHash: false,
            })

            cy.getPinia().then((pinia) => {
                const positionStore3 = usePositionStore(pinia)
                expect(positionStore3.zoom).to.eq(lv95zoom)

                // checking that we are reprojected to lon: 8.2267733° lat: 46.9483767°
                // (according to https://epsg.io/transform#s_srs=2056&t_srs=4326&x=2660000.0000000&y=1200000.0000000)
                const centerEpsg43263 = positionStore3.centerEpsg4326
                // the app applies a rounding to the 6th decimal for lon/lat
                expect(centerEpsg43263[0]).to.eq(WGS84.roundCoordinateValue(8.2267733))
                expect(centerEpsg43263[1]).to.eq(WGS84.roundCoordinateValue(46.9483767))
            })
        })
        it('center where expected when given a X, Y coordinate in LV95', () => {
            // NOTE on the old viewer Y := correspond to x in EPSG definition
            // NOTE on the old viewer X := correspond to y in EPSG definition
            cy.goToMapView({
                queryParams: {
                    Y: 2660000,
                    X: 1200000,
                },
                withHash: false,
            })
            // checking that we are reprojected to lon: 8.2267733° lat: 46.9483767°
            // (according to https://epsg.io/transform#s_srs=2056&t_srs=4326&x=2660000.0000000&y=1200000.0000000)
            cy.getPinia().then((pinia) => {
                const positionStore4 = usePositionStore(pinia)
                const centerEpsg43264 = positionStore4.centerEpsg4326
                // the app applies a rounding to the 6th decimal for lon/lat
                expect(centerEpsg43264[0]).to.eq(WGS84.roundCoordinateValue(8.2267733))
                expect(centerEpsg43264[1]).to.eq(WGS84.roundCoordinateValue(46.9483767))
            })
        })
        it('center where expected when given a X, Y coordinate in LV03', () => {
            // NOTE on the old viewer Y := correspond to x in EPSG definition
            // NOTE on the old viewer X := correspond to y in EPSG definition
            cy.goToMapView({
                queryParams: {
                    Y: 600000,
                    X: 200000,
                },
                withHash: false,
            })
            // checking that we are reprojected to lon: 7.438632° lat: 46.9510828°
            // (according to https://epsg.io/transform#s_srs=21781&t_srs=4326&x=600000.0000000&y=200000.0000000)
            cy.getPinia().then((pinia) => {
                const positionStore5 = usePositionStore(pinia)
                const centerEpsg43265 = positionStore5.centerEpsg4326
                // the app applies a rounding to the 6th decimal for lon/lat
                expect(centerEpsg43265[0]).to.eq(WGS84.roundCoordinateValue(7.438632))
                expect(centerEpsg43265[1]).to.eq(WGS84.roundCoordinateValue(46.9510828))
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
                    created: '2023-01-01T00:00:00+00:00',
                    updated: '2023-01-01T00:00:00+00:00',
                    author: 'testAuthor',
                    author_version: 'testVersion',
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
            cy.goToMapView({
                queryParams: {
                    layers: 'test.wms.layer,test.wmts.layer',
                    layers_opacity: '0.6,0.5',
                    layers_visibility: 'true,false',
                },
                withHash: false,
            })
            cy.getPinia().then((pinia) => {
                const layersStore = useLayersStore(pinia)
                const activeLayers = layersStore.activeLayers
                expect(activeLayers).to.be.an('Array').length(2)
                const [wmsLayer, wmtsLayer] = activeLayers
                expect(wmsLayer).to.be.an('Object')
                expect(wmsLayer.id).to.eq('test.wms.layer')
                expect(wmsLayer.opacity).to.eq(0.6)
                expect(wmsLayer.isVisible).to.be.true
                expect(wmtsLayer).to.be.an('Object')
                expect(wmtsLayer.id).to.eq('test.wmts.layer')
                expect(wmtsLayer.opacity).to.eq(0.5)
                expect(wmtsLayer.isVisible).to.be.false
            })
        })
        it('is able to import an external KML from a legacy param', () => {
            cy.goToMapView({
                queryParams: {
                    layers: `KML||${kmlServiceBaseUrl}${kmlServiceFilePath}`,
                    layers_opacity: '0.6',
                    layers_visibility: 'true',
                },
                withHash: false,
            })
            cy.getPinia().then((pinia) => {
                const layersStore = useLayersStore(pinia)
                const activeLayers = layersStore.activeLayers
                expect(activeLayers).to.be.an('Array').length(1)
                const [kmlLayer] = activeLayers
                expect(kmlLayer).to.be.an('Object')
                expect(kmlLayer.type).to.eq('KML')
                expect(kmlLayer.baseUrl).to.eq(`${kmlServiceBaseUrl}${kmlServiceFilePath}`)
                expect(kmlLayer.opacity).to.eq(0.6)
                expect(kmlLayer.isVisible).to.be.true
                expect(kmlLayer.style).to.eq('GEOADMIN')
            })
        })
        it('is able to import an external KML from a legacy adminId query param', () => {
            cy.goToMapView({
                queryParams: {
                    adminId: adminId,
                },
                withHash: false,
            })
            cy.wait('@get-kml-metada-by-admin-id')
            cy.wait('@get-kml')
            cy.getPinia().then((pinia) => {
                const layersStore = useLayersStore(pinia)
                const activeLayers = layersStore.activeLayers
                expect(activeLayers).to.be.an('Array').length(1)
                const [kmlLayer] = activeLayers
                expect(kmlLayer).to.be.an('Object')
                expect(kmlLayer.type).to.eq('KML')
                expect(kmlLayer.baseUrl).to.eq(`${kmlServiceBaseUrl}${kmlServiceFilePath}`)
                expect(kmlLayer.opacity).to.eq(1)
                expect(kmlLayer.isVisible).to.be.true
                expect(kmlLayer.adminId).to.equal(adminId)
            })
        })
        it("don't keep KML adminId in URL after import", () => {
            cy.goToMapView({
                queryParams: {
                    adminId: adminId,
                },
                withHash: false,
            })
            cy.wait('@get-kml-metada-by-admin-id')
            cy.wait('@get-kml')
            cy.getPinia().then((pinia) => {
                const layersStore = useLayersStore(pinia)
                const activeLayers = layersStore.activeLayers
                expect(activeLayers).to.be.an('Array').length(1)
                const [kmlLayer] = activeLayers
                expect(kmlLayer).to.be.an('Object')
                expect(kmlLayer.type).to.eq('KML')
                expect(kmlLayer.baseUrl).to.eq(`${kmlServiceBaseUrl}${kmlServiceFilePath}`)
                expect(kmlLayer.opacity).to.eq(1)
                expect(kmlLayer.isVisible).to.be.true
                expect(kmlLayer.adminId).to.be.equal(adminId)
            })
            cy.url().should('not.contain', adminId)
        })
        it('is able to import an external KML from a legacy adminId query param with other layers', () => {
            cy.goToMapView({
                queryParams: {
                    adminId: adminId,
                    layers: 'test.wms.layer,test.wmts.layer',
                    layers_opacity: '0.6,0.5',
                    layers_visibility: 'true,false',
                },
                withHash: false,
            })
            cy.wait('@get-kml-metada-by-admin-id')
            cy.wait('@get-kml')
            cy.getPinia().then((pinia) => {
                const layersStore = useLayersStore(pinia)
                const activeLayers = layersStore.activeLayers
                expect(activeLayers).to.be.an('Array').length(3)
                const [wmsLayer, wmtsLayer, kmlLayer] = activeLayers
                expect(wmsLayer).to.be.an('Object')
                expect(wmsLayer.id).to.eq('test.wms.layer')
                expect(wmsLayer.opacity).to.eq(0.6)
                expect(wmsLayer.isVisible).to.be.true
                expect(wmtsLayer).to.be.an('Object')
                expect(wmtsLayer.id).to.eq('test.wmts.layer')
                expect(wmtsLayer.opacity).to.eq(0.5)
                expect(wmtsLayer.isVisible).to.be.false
                expect(kmlLayer).to.be.an('Object')
                expect(kmlLayer.baseUrl).to.eq(`${kmlServiceBaseUrl}${kmlServiceFilePath}`)
                expect(kmlLayer.opacity).to.eq(1)
                expect(kmlLayer.isVisible).to.be.true
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
            cy.goToMapView({
                queryParams: {
                    swisssearch: '1530 Payerne',
                },
                withHash: false,
            })
            cy.getPinia().then((pinia) => {
                const searchStore = useSearchStore(pinia)
                expect(searchStore.query).to.eq('1530 Payerne')
            })
            cy.url().should('not.contain', 'swisssearch')
            cy.get('[data-cy="searchbar"]').click()
            const acceptableDelta = 0.25

            // selects the result if it is only one
            cy.getPinia().then((pinia) => {
                const mapStore = useMapStore(pinia)
                const feature = mapStore.pinnedLocation
                expect(feature).to.be.a('array').that.is.not.empty
                expect(coordinates).to.have.lengthOf(2)
                expect(coordinates[0]).to.be.a('number')
                expect(coordinates[1]).to.be.a('number')
                expect(feature).to.be.an('array').that.is.not.empty
                expect(feature[0]).to.be.a('number')
                expect(feature[1]).to.be.a('number')
                expect(feature[0]).to.be.approximately(coordinates[0], acceptableDelta)
                expect(feature[1]).to.be.approximately(coordinates[1], acceptableDelta)
            })
            cy.get('[data-cy="search-results-locations"]').should('not.be.visible')
        })
        it('External WMS layer', () => {
            cy.getExternalWmsMockConfig().then((mockConfig) => {
                const [mockExternalWms] = mockConfig
                expect(mockExternalWms).to.be.an('Object')

                cy.goToMapView({
                    queryParams: {
                        layers: `test.wms.layer,WMS||${mockExternalWms.name}||${mockExternalWms.baseUrl}||${mockExternalWms.id}||1.3.0`,
                        layers_opacity: '1,1',
                        layers_visibility: 'false,true',
                        layers_timestamp: ',',
                    },
                    withHash: false,
                })
                cy.wait(`@externalWMS-GetCap-${mockExternalWms.baseUrl}`)
                cy.getPinia().then((pinia) => {
                    const layersStore = useLayersStore(pinia)
                    const activeLayers = layersStore.activeLayers
                    expect(activeLayers).to.be.an('Array').length(2)
                    const externalLayer = activeLayers[1]
                    expect(externalLayer).to.be.an('Object')
                    expect(externalLayer.isExternal).to.be.true
                    expect(externalLayer.isVisible).to.be.true
                    expect(externalLayer.baseUrl).to.eq(mockExternalWms.baseUrl)
                    expect(externalLayer.id).to.eq(mockExternalWms.id)
                    expect(externalLayer.name).to.eq(mockExternalWms.name)
                    expect(externalLayer.isLoading).to.be.false
                })
                const expectedHash = `layers=test.wms.layer,f,1;WMS%7C${mockExternalWms.baseUrl}%7C${mockExternalWms.id}`
                cy.location().should((location) => {
                    expect(location.hash).to.contain(expectedHash)
                    expect(location.search).to.eq('')
                })
            })
        })
        it('External WMTS layer', () => {
            cy.getExternalWmtsMockConfig().then((mockConfig) => {
                const [mockExternalWmts] = mockConfig
                expect(mockExternalWmts).to.be.an('Object')

                cy.goToMapView({
                    queryParams: {
                        layers: `test.wmts.layer,WMTS||${mockExternalWmts.id}||${mockExternalWmts.baseUrl}`,
                        layers_opacity: '1,1',
                        layers_visibility: 'false,true',
                        layers_timestamp: '18641231,',
                    },
                    withHash: false,
                })
                cy.wait(`@externalWMTS-GetCap-${mockExternalWmts.baseUrl}`)
                cy.getPinia().then((pinia) => {
                    const layersStore = useLayersStore(pinia)
                    const activeLayers = layersStore.activeLayers
                    expect(activeLayers).to.be.an('Array').length(2)
                    const externalLayer = activeLayers[1]
                    expect(externalLayer).to.be.an('Object')
                    expect(externalLayer.isExternal).to.be.true
                    expect(externalLayer.isVisible).to.be.true
                    expect(externalLayer.baseUrl).to.eq(mockExternalWmts.baseUrl)
                    expect(externalLayer.id).to.eq(mockExternalWmts.id)
                    expect(externalLayer.name).to.eq(mockExternalWmts.name)
                    expect(externalLayer.isLoading).to.be.false
                })
                const expectedQuery = new URLSearchParams(
                    `lang=en&center=2660013.5,1185172&z=1&bgLayer=test.background.layer2&topic=ech&layers=test.wmts.layer,f;WMTS%7C${mockExternalWmts.baseUrl}%7C${mockExternalWmts.id}`
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

    context.skip('3D import', () => {
        const lat = 47.3
        const lon = 7.3
        const elevation = 215370
        const heading = 318
        const pitch = -45

        it('transfers camera parameter from legacy URL to the new URL', () => {
            cy.goToMapView({
                queryParams: {
                    lat,
                    lon,
                    elevation,
                    heading,
                    pitch,
                },
                withHash: false,
            })

            // checking in the store that the parameters have been converted into the new 3D parameters
            cy.getPinia().then((pinia) => {
                const cesiumStore = useCesiumStore(pinia)
                expect(cesiumStore.active).to.eq(true) // cesium should be active

                // Checking camera position
                const positionStore = usePositionStore(pinia)
                expect(positionStore.camera).to.be.an('Object')
                expect(positionStore.camera.x).to.eq(lon)
                expect(positionStore.camera.y).to.eq(lat)
                // For some reason, the z value is not exactly the same as the elevation
                // There might be a recalculating of the elevation
                expect(Number(positionStore.camera.z)).to.approximately(elevation, 100)
                expect(positionStore.camera.heading).to.eq(heading)
                expect(positionStore.camera.pitch).to.eq(pitch)
                expect(positionStore.camera.roll).to.eq(0)

                // EPSG is set to 3857
                expect(positionStore.projection.epsgNumber).to.eq(3857)
            })
        })
        it('transfers camera parameter from legacy URL to the new URL only heading', () => {
            cy.goToMapView({
                queryParams: {
                    lat,
                    lon,
                    heading,
                },
                withHash: false,
            })

            // checking in the store that the parameters have been converted into the new 3D parameters
            cy.getPinia().then((pinia) => {
                const cesiumStore = useCesiumStore(pinia)
                expect(cesiumStore.active).to.be.true // cesium should be active

                // Checking camera position
                const positionStore = usePositionStore(pinia)
                expect(positionStore.camera).to.be.an('Object')
                expect(positionStore.camera.x).to.eq(lon)
                expect(positionStore.camera.y).to.eq(lat)
                expect(positionStore.camera.z).to.eq(0)
                expect(positionStore.camera.heading).to.eq(heading)
                expect(positionStore.camera.pitch).to.eq(-90)
                expect(positionStore.camera.roll).to.eq(0)

                // EPSG is set to 3857
                expect(positionStore.projection.epsgNumber).to.eq(3857)
            })
        })
        // camera=7.038834,46.766017,193985.5,-47,319,
        // camera=8.225457,46.858429,738575.8,-90,,
        it('transfers camera parameter from legacy URL to the new URL only elevation', () => {
            cy.goToMapView({
                queryParams: {
                    lat,
                    lon,
                    elevation,
                },
                withHash: false,
            })

            // checking in the store that the parameters have been converted into the new 3D parameters
            cy.getPinia().then((pinia) => {
                const cesiumStore = useCesiumStore(pinia)
                expect(cesiumStore.active).to.be.true // cesium should be active

                // Checking camera position
                // x, y, and z seems recalculated when there is only elevation, so I just check that they are not undefined
                const positionStore = usePositionStore(pinia)
                expect(positionStore.camera).to.be.an('Object')
                expect(positionStore.camera.x).to.not.be.undefined
                expect(positionStore.camera.y).to.not.be.undefined
                expect(positionStore.camera.z).to.not.be.undefined
                expect(positionStore.camera.heading).to.eq(0)
                expect(positionStore.camera.pitch).to.eq(-90)
                expect(positionStore.camera.roll).to.eq(0)

                // EPSG is set to 3857
                expect(positionStore.projection.epsgNumber).to.eq(3857)
            })
        })
    })

    context.skip('Extra Parameter Imports', () => {
        it('shows the compare slider at the correct position', () => {
            cy.goToMapView({
                queryParams: {
                    layers: 'test-1.wms.layer',
                    swipe_ratio: '0.3',
                },
                withHash: false,
            })
            // the initial slider position is width*0.3-20
            cy.getPinia().then((pinia) => {
                const uiStore = useUIStore(pinia)
                cy.get('[data-cy="compareSlider"]').then((slider) => {
                    expect(slider.position()['left']).to.eq(uiStore.width * 0.3 - 20)
                })
            })
            cy.getPinia().then((pinia) => {
                const uiStore = useUIStore(pinia)
                expect(uiStore.compareRatio).to.be.equal(0.3)
                expect(uiStore.isCompareSliderActive).to.be.equal(true)
            })
            cy.get('[data-cy="compareSlider"]').should('be.visible')
        })
    })

    context.skip('Feature Pre Selection Import', () => {
        /** @param {string[]} featuresIds */
        function checkFeatures(featuresIds) {
            cy.getPinia().then((pinia) => {
                const featuresStore = useFeaturesStore(pinia)
                expect(featuresStore.selectedFeatures.length).to.eq(featuresIds.length)
                featuresStore.selectedFeatures.forEach((feature) => {
                    expect(featuresIds).to.include(feature.id)
                })
            })
        }

        it('Select a few features and shows the tooltip in its correct spot', () => {
            const featuresIds = ['1234', '5678', '9012']
            // ---------------------------------------------------------------------------------
            cy.log('When showTooltip is not specified, we should have no tooltip')

            cy.goToMapView({
                queryParams: {
                    'ch.babs.kulturgueter': featuresIds.join(','),
                },
                withHash: false,
            })
            checkFeatures(featuresIds)
            cy.waitUntilState((pinia) => {
                const uiStore = useUIStore(pinia)
                return uiStore.featureInfoPosition === 'none'
            })
            cy.get('[data-cy="popover"]').should('not.exist')
            cy.get('[data-cy="infobox"]').should('not.exist')
            // ---------------------------------------------------------------------------------
            cy.log(
                'When showTooltip is true, featureInfo should be bottom panel on devices with width < 400 px '
            )

            cy.goToMapView({
                queryParams: {
                    'ch.babs.kulturgueter': featuresIds.join(','),
                    showTooltip: 'true',
                },
                withHash: false,
            })
            // checkFeatures(featuresIds)
            cy.getPinia().then((pinia) => {
                const uiStore = useUIStore(pinia)
                expect(uiStore.featureInfoPosition).to.be.equal('bottompanel')
            })
            cy.get('[data-cy="popover"]').should('not.exist')
            cy.get('[data-cy="infobox"]').should('be.visible')
            // ---------------------------------------------------------------------------------
            cy.log(
                'When showTooltip is true, featureInfo should be default on devices with width >= 400 px '
            )
            cy.viewport(400, 800)
            cy.goToMapView({
                queryParams: {
                    'ch.babs.kulturgueter': featuresIds.join(','),
                    showTooltip: 'true',
                },
                withHash: false,
            })
            // checkFeatures(featuresIds)
            cy.getPinia().then((pinia) => {
                const uiStore = useUIStore(pinia)
                expect(uiStore.featureInfoPosition).to.be.equal('default')
            })
            cy.get('[data-cy="popover"]').should('not.exist')
            cy.get('[data-cy="infobox"]').should('be.visible')
            // ---------------------------------------------------------------------------------
            cy.log('When showTooltip is given a fantasist value, we should have no tooltip')

            cy.goToMapView({
                queryParams: {
                    'ch.babs.kulturgueter': featuresIds.join(','),
                    showTooltip: 'aFantasyValue',
                },
                withHash: false,
            })
            checkFeatures(featuresIds)
            cy.getPinia().then((pinia) => {
                const uiStore = useUIStore(pinia)
                expect(uiStore.featureInfoPosition).to.be.equal('none')
            })
            cy.get('[data-cy="popover"]').should('not.exist')
            cy.get('[data-cy="infobox"]').should('not.exist')
        })
    })

    context('Time slider', () => {
        it('shows the time slider on startup when legacy "time" param present in the URL', () => {
            cy.goToMapView({
                queryParams: {
                    layers: `test.timeenabled.wmts.layer`,
                    time: 2019,
                },
                withHash: false,
            })
            cy.get('[data-cy="time-slider-current-year"]').should('contain', 2019)
        })
    })
})
