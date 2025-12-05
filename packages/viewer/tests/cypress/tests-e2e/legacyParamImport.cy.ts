// import type { KMLLayer } from '@swissgeo/layers'
import type { Pinia } from 'pinia'

// import { LV95, WGS84 } from '@swissgeo/coordinates'
// import proj4 from 'proj4'
// import { assertDefined } from 'support/utils'
// import useCesiumStore from '@/store/modules/cesium'
import useFeaturesStore from '@/store/modules/features'
// import useLayersStore from '@/store/modules/layers'
// import useMapStore from '@/store/modules/map'
// import usePositionStore from '@/store/modules/position'
// import useSearchStore from '@/store/modules/search'
import useUIStore from '@/store/modules/ui'

describe('Test on legacy param import', () => {
    // context('Coordinates import', () => {
    //     it('transfers valid params to the hash part without changing them', () => {
    //         const lat = 47.3
    //         const lon = 7.3
    //         const zoom = 10.4
    //         cy.goToMapView({
    //             queryParams: {
    //                 lat,
    //                 lon,
    //                 zoom: zoom,
    //             },
    //             withHash: false,
    //         })
    //
    //         // checking in the store that the position has not changed from what was in the URL
    //         cy.getPinia().then((pinia) => {
    //             const positionStore = usePositionStore(pinia)
    //             expect(positionStore.zoom).to.eq(zoom)
    //             const centerEpsg4326 = positionStore.centerEpsg4326
    //             expect(centerEpsg4326[0]).to.eq(lon)
    //             expect(centerEpsg4326[1]).to.eq(lat)
    //         })
    //     })
    //     it('loads correctly if params are already behind the hash', () => {
    //         const lat = 47
    //         const lon = 7.5
    //         const zoom = 12
    //         cy.goToMapView({
    //             queryParams: {
    //                 center: proj4(WGS84.epsg, LV95.epsg, [lon, lat]).join(','),
    //                 z: zoom,
    //             },
    //             withHash: true,
    //         })
    //
    //         // checking in the store that the position has not changed from what was in the URL
    //         cy.getPinia().then((pinia) => {
    //             const positionStore2 = usePositionStore(pinia)
    //             expect(positionStore2.zoom).to.eq(zoom)
    //             const centerEpsg43262 = positionStore2.centerEpsg4326
    //             expect(centerEpsg43262[0]).to.eq(lon)
    //             expect(centerEpsg43262[1]).to.eq(lat)
    //         })
    //     })
    //     it('reproject LV95 coordinates param to EPSG:4326', () => {
    //         const E = 2660000
    //         const N = 1200000
    //         const lv95zoom = 8
    //         cy.goToMapView({
    //             queryParams: {
    //                 E,
    //                 N,
    //                 zoom: lv95zoom,
    //             },
    //             withHash: false,
    //         })
    //
    //         cy.getPinia().then((pinia) => {
    //             const positionStore3 = usePositionStore(pinia)
    //             expect(positionStore3.zoom).to.eq(lv95zoom)
    //
    //             // checking that we are reprojected to lon: 8.2267733° lat: 46.9483767°
    //             // (according to https://epsg.io/transform#s_srs=2056&t_srs=4326&x=2660000.0000000&y=1200000.0000000)
    //             const centerEpsg43263 = positionStore3.centerEpsg4326
    //             // the app applies a rounding to the 6th decimal for lon/lat
    //             expect(centerEpsg43263[0]).to.eq(WGS84.roundCoordinateValue(8.2267733))
    //             expect(centerEpsg43263[1]).to.eq(WGS84.roundCoordinateValue(46.9483767))
    //         })
    //     })
    //     it('center where expected when given a X, Y coordinate in LV95', () => {
    //         // NOTE on the old viewer Y := correspond to x in EPSG definition
    //         // NOTE on the old viewer X := correspond to y in EPSG definition
    //         cy.goToMapView({
    //             queryParams: {
    //                 Y: 2660000,
    //                 X: 1200000,
    //             },
    //             withHash: false,
    //         })
    //         // checking that we are reprojected to lon: 8.2267733° lat: 46.9483767°
    //         // (according to https://epsg.io/transform#s_srs=2056&t_srs=4326&x=2660000.0000000&y=1200000.0000000)
    //         cy.getPinia().then((pinia) => {
    //             const positionStore4 = usePositionStore(pinia)
    //             const centerEpsg43264 = positionStore4.centerEpsg4326
    //             // the app applies a rounding to the 6th decimal for lon/lat
    //             expect(centerEpsg43264[0]).to.eq(WGS84.roundCoordinateValue(8.2267733))
    //             expect(centerEpsg43264[1]).to.eq(WGS84.roundCoordinateValue(46.9483767))
    //         })
    //     })
    //     it('center where expected when given a X, Y coordinate in LV03', () => {
    //         // NOTE on the old viewer Y := correspond to x in EPSG definition
    //         // NOTE on the old viewer X := correspond to y in EPSG definition
    //         cy.goToMapView({
    //             queryParams: {
    //                 Y: 600000,
    //                 X: 200000,
    //             },
    //             withHash: false,
    //         })
    //         // checking that we are reprojected to lon: 7.438632° lat: 46.9510828°
    //         // (according to https://epsg.io/transform#s_srs=21781&t_srs=4326&x=600000.0000000&y=200000.0000000)
    //         cy.getPinia().then((pinia) => {
    //             const positionStore5 = usePositionStore(pinia)
    //             const centerEpsg43265 = positionStore5.centerEpsg4326
    //             // the app applies a rounding to the 6th decimal for lon/lat
    //             expect(centerEpsg43265[0]).to.eq(WGS84.roundCoordinateValue(7.438632))
    //             expect(centerEpsg43265[1]).to.eq(WGS84.roundCoordinateValue(46.9510828))
    //         })
    //     })
    // })

    // context('Layers import', () => {
    //     const adminId = 'ABC0987654321'
    //     const kmlId = 'ABC1234567890'
    //     const kmlServiceBaseUrl = 'https://url-for-test'
    //     const kmlServiceBasePath = `/api/kml`
    //     const kmlServiceAdminPath = `${kmlServiceBasePath}/admin`
    //     const kmlServiceFilePath = `${kmlServiceBasePath}/files/${kmlId}`
    //     beforeEach(() => {
    //         // serving a dummy KML so that we don't get a 404
    //         cy.intercept(`**${kmlServiceFilePath}`, '<kml />').as('get-kml')
    //         cy.intercept(`**${kmlServiceAdminPath}?admin_id=${adminId}`, (request) => {
    //             request.reply({
    //                 id: kmlId,
    //                 admin_id: adminId,
    //                 links: {
    //                     self: `${kmlServiceBaseUrl}/api/kml/admin/${kmlId}`,
    //                     kml: `${kmlServiceBaseUrl}/api/kml/files/${kmlId}`,
    //                 },
    //                 created: '2023-01-01T00:00:00+00:00',
    //                 updated: '2023-01-01T00:00:00+00:00',
    //                 author: 'testAuthor',
    //                 author_version: 'testVersion',
    //             })
    //         }).as('get-kml-metada-by-admin-id')
    //         cy.intercept(`**${kmlServiceAdminPath}/${kmlId}`, (request) => {
    //             request.reply({
    //                 id: kmlId,
    //                 links: {
    //                     self: `${kmlServiceBaseUrl}/api/kml/admin/${kmlId}`,
    //                     kml: `${kmlServiceBaseUrl}/api/kml/files/${kmlId}`,
    //                 },
    //                 created: '',
    //                 updated: '',
    //             })
    //         }).as('get-kml-metada')
    //     })
    //
    //     it('Combines all old layers_*** params into the new one', () => {
    //         cy.goToMapView({
    //             queryParams: {
    //                 layers: 'test.wms.layer,test.wmts.layer',
    //                 layers_opacity: '0.6,0.5',
    //                 layers_visibility: 'true,false',
    //             },
    //             withHash: false,
    //         })
    //         cy.getPinia().then((pinia) => {
    //             const layersStore = useLayersStore(pinia)
    //             const activeLayers = layersStore.activeLayers
    //             expect(activeLayers).to.be.an('Array').length(2)
    //             const [wmsLayer, wmtsLayer] = activeLayers
    //             assertDefined(wmsLayer)
    //             expect(wmsLayer.id).to.eq('test.wms.layer')
    //             expect(wmsLayer.opacity).to.eq(0.6)
    //             expect(wmsLayer.isVisible).to.be.true
    //             assertDefined(wmtsLayer)
    //             expect(wmtsLayer.id).to.eq('test.wmts.layer')
    //             expect(wmtsLayer.opacity).to.eq(0.5)
    //             expect(wmtsLayer.isVisible).to.be.false
    //         })
    //     })
    //     it('is able to import an external KML from a legacy param', () => {
    //         cy.goToMapView({
    //             queryParams: {
    //                 layers: `KML||${kmlServiceBaseUrl}${kmlServiceFilePath}`,
    //                 layers_opacity: '0.6',
    //                 layers_visibility: 'true',
    //             },
    //             withHash: false,
    //         })
    //         cy.getPinia().then((pinia) => {
    //             const layersStore2 = useLayersStore(pinia)
    //             const activeLayers2 = layersStore2.activeLayers
    //             expect(activeLayers2).to.be.an('Array').length(1)
    //             const [kmlLayer] = activeLayers2
    //             assertDefined(kmlLayer)
    //             expect(kmlLayer.type).to.eq('KML')
    //             expect(kmlLayer.baseUrl).to.eq(`${kmlServiceBaseUrl}${kmlServiceFilePath}`)
    //             expect(kmlLayer.opacity).to.eq(0.6)
    //             expect(kmlLayer.isVisible).to.be.true
    //             expect((kmlLayer as KMLLayer).style).to.eq('GEOADMIN')
    //         })
    //     })
    //     it('is able to import an external KML from a legacy adminId query param', () => {
    //         cy.goToMapView({
    //             queryParams: {
    //                 adminId: adminId,
    //             },
    //             withHash: false,
    //         })
    //         cy.wait('@get-kml-metada-by-admin-id')
    //         cy.wait('@get-kml')
    //         cy.getPinia().then((pinia) => {
    //             const layersStore3 = useLayersStore(pinia)
    //             const activeLayers3 = layersStore3.activeLayers
    //             expect(activeLayers3).to.be.an('Array').length(1)
    //             const [kmlLayer2] = activeLayers3
    //             assertDefined(kmlLayer2)
    //             expect(kmlLayer2.type).to.eq('KML')
    //             expect(kmlLayer2.baseUrl).to.eq(`${kmlServiceBaseUrl}${kmlServiceFilePath}`)
    //             expect(kmlLayer2.opacity).to.eq(1)
    //             expect(kmlLayer2.isVisible).to.be.true
    //             expect((kmlLayer2 as KMLLayer).adminId).to.equal(adminId)
    //         })
    //     })
    //     it("don't keep KML adminId in URL after import", () => {
    //         cy.goToMapView({
    //             queryParams: {
    //                 adminId: adminId,
    //             },
    //             withHash: false,
    //         })
    //         cy.wait('@get-kml-metada-by-admin-id')
    //         cy.wait('@get-kml')
    //         cy.getPinia().then((pinia) => {
    //             const layersStore4 = useLayersStore(pinia)
    //             const activeLayers4 = layersStore4.activeLayers
    //             expect(activeLayers4).to.be.an('Array').length(1)
    //             const [kmlLayer3] = activeLayers4
    //             assertDefined(kmlLayer3)
    //             expect(kmlLayer3.type).to.eq('KML')
    //             expect(kmlLayer3.baseUrl).to.eq(`${kmlServiceBaseUrl}${kmlServiceFilePath}`)
    //             expect(kmlLayer3.opacity).to.eq(1)
    //             expect(kmlLayer3.isVisible).to.be.true
    //             expect((kmlLayer3 as KMLLayer).adminId).to.be.equal(adminId)
    //         })
    //         cy.url().should('not.contain', adminId)
    //     })
    //     it('is able to import an external KML from a legacy adminId query param with other layers', () => {
    //         cy.goToMapView({
    //             queryParams: {
    //                 adminId: adminId,
    //                 layers: 'test.wms.layer,test.wmts.layer',
    //                 layers_opacity: '0.6,0.5',
    //                 layers_visibility: 'true,false',
    //             },
    //             withHash: false,
    //         })
    //         cy.wait('@get-kml-metada-by-admin-id')
    //         cy.wait('@get-kml')
    //         cy.getPinia().then((pinia) => {
    //             const layersStore5 = useLayersStore(pinia)
    //             const activeLayers5 = layersStore5.activeLayers
    //             expect(activeLayers5).to.be.an('Array').length(3)
    //             const [wmsLayer2, wmtsLayer2, kmlLayer4] = activeLayers5
    //             assertDefined(wmsLayer2)
    //             expect(wmsLayer2.id).to.eq('test.wms.layer')
    //             expect(wmsLayer2.opacity).to.eq(0.6)
    //             expect(wmsLayer2.isVisible).to.be.true
    //             assertDefined(wmtsLayer2)
    //             expect(wmtsLayer2.id).to.eq('test.wmts.layer')
    //             expect(wmtsLayer2.opacity).to.eq(0.5)
    //             expect(wmtsLayer2.isVisible).to.be.false
    //             assertDefined(kmlLayer4)
    //             expect(kmlLayer4.baseUrl).to.eq(`${kmlServiceBaseUrl}${kmlServiceFilePath}`)
    //             expect(kmlLayer4.opacity).to.eq(1)
    //             expect(kmlLayer4.isVisible).to.be.true
    //         })
    //     })
    //     it("doesn't show encoding in the search bar when serving a swisssearch legacy url", () => {
    //         cy.intercept('**/rest/services/ech/SearchServer*?type=layers*', {
    //             body: { results: [] },
    //         }).as('search-layers')
    //         const coordinates: number[] = [2598633.75, 1200386.75]
    //         cy.intercept('**/rest/services/ech/SearchServer*?type=locations*', {
    //             body: {
    //                 results: [
    //                     {
    //                         attrs: {
    //                             detail: '1530 payerne 5822 payerne ch vd',
    //                             label: '  <b>1530 Payerne</b>',
    //                             lat: 46.954559326171875,
    //                             lon: 7.420684814453125,
    //                             y: coordinates[0],
    //                             x: coordinates[1],
    //                         },
    //                     },
    //                 ],
    //             },
    //         }).as('search-locations')
    //         cy.goToMapView({
    //             queryParams: {
    //                 swisssearch: '1530 Payerne',
    //             },
    //             withHash: false,
    //         })
    //         cy.getPinia().then((pinia) => {
    //             const searchStore = useSearchStore(pinia)
    //             expect(searchStore.query).to.eq('1530 Payerne')
    //         })
    //         cy.url().should('not.contain', 'swisssearch')
    //         cy.get('[data-cy="searchbar"]').click()
    //         const acceptableDelta = 0.25
    //
    //         // selects the result if it is only one
    //         cy.getPinia().then((pinia) => {
    //             const mapStore = useMapStore(pinia)
    //             const feature = mapStore.pinnedLocation
    //             expect(feature).to.be.a('array').that.is.not.empty
    //             assertDefined(coordinates[0])
    //             assertDefined(coordinates[1])
    //             assertDefined(feature)
    //             expect(feature[0]).to.be.approximately(coordinates[0], acceptableDelta)
    //             expect(feature[1]).to.be.approximately(coordinates[1], acceptableDelta)
    //         })
    //         cy.get('[data-cy="search-results-locations"]').should('not.be.visible')
    //     })
    //     it('External WMS layer', () => {
    //         cy.getExternalWmsMockConfig().then((mockConfig) => {
    //             const [mockExternalWms1] = mockConfig
    //             assertDefined(mockExternalWms1)
    //
    //             cy.goToMapView({
    //                 queryParams: {
    //                     layers: `test.wms.layer,WMS||${mockExternalWms1.name}||${mockExternalWms1.baseUrl}||${mockExternalWms1.id}||1.3.0`,
    //                     layers_opacity: '1,1',
    //                     layers_visibility: 'false,true',
    //                     layers_timestamp: ',',
    //                 },
    //                 withHash: false,
    //             })
    //             cy.wait(`@externalWMS-GetCap-${mockExternalWms1.baseUrl}`)
    //             cy.getPinia().then((pinia) => {
    //                 const layersStore6 = useLayersStore(pinia)
    //                 const activeLayers6 = layersStore6.activeLayers
    //                 expect(activeLayers6).to.be.an('Array').length(2)
    //                 const externalLayer = activeLayers6[1]
    //                 assertDefined(externalLayer)
    //                 expect(externalLayer.isExternal).to.be.true
    //                 expect(externalLayer.isVisible).to.be.true
    //                 expect(externalLayer.baseUrl).to.eq(mockExternalWms1.baseUrl)
    //                 expect(externalLayer.id).to.eq(mockExternalWms1.id)
    //                 expect(externalLayer.name).to.eq(mockExternalWms1.name)
    //                 expect(externalLayer.isLoading).to.be.false
    //             })
    //             const expectedHash = `layers=test.wms.layer,f,1;WMS%7C${mockExternalWms1.baseUrl}%7C${mockExternalWms1.id}`
    //             cy.location().should((location) => {
    //                 expect(location.hash).to.contain(expectedHash)
    //                 expect(location.search).to.eq('')
    //             })
    //         })
    //     })
    //     it('External WMTS layer', () => {
    //         cy.getExternalWmtsMockConfig().then((mockConfig) => {
    //             const [mockExternalWmts1] = mockConfig
    //             assertDefined(mockExternalWmts1)
    //
    //             cy.goToMapView({
    //                 queryParams: {
    //                     layers: `test.wmts.layer,WMTS||${mockExternalWmts1.id}||${mockExternalWmts1.baseUrl}`,
    //                     layers_opacity: '1,1',
    //                     layers_visibility: 'false,true',
    //                     layers_timestamp: '18641231,',
    //                 },
    //                 withHash: false,
    //             })
    //             cy.wait(`@externalWMTS-GetCap-${mockExternalWmts1.baseUrl}`)
    //             cy.getPinia().then((pinia) => {
    //                 const layersStore7 = useLayersStore(pinia)
    //                 const activeLayers7 = layersStore7.activeLayers
    //                 expect(activeLayers7).to.be.an('Array').length(2)
    //                 const externalLayer2 = activeLayers7[1]
    //                 assertDefined(externalLayer2)
    //                 expect(externalLayer2.isExternal).to.be.true
    //                 expect(externalLayer2.isVisible).to.be.true
    //                 expect(externalLayer2.baseUrl).to.eq(mockExternalWmts1.baseUrl)
    //                 expect(externalLayer2.id).to.eq(mockExternalWmts1.id)
    //                 expect(externalLayer2.name).to.eq(mockExternalWmts1.name)
    //                 expect(externalLayer2.isLoading).to.be.false
    //             })
    //             const expectedQuery = new URLSearchParams(
    //                 `lang=en&center=2660013.5,1185172&z=1&bgLayer=test.background.layer2&topic=ech&layers=test.wmts.layer,f;WMTS%7C${mockExternalWmts1.baseUrl}%7C${mockExternalWmts1.id}`
    //             )
    //
    //             expectedQuery.sort()
    //             cy.location('search').should('be.empty')
    //             cy.location('hash').should('contain', '/map?')
    //             cy.location('hash').then((hash) => {
    //                 const query = new URLSearchParams(hash.replace('#/map?', ''))
    //                 query.sort()
    //                 expect(query.toString()).to.equal(expectedQuery.toString())
    //             })
    //         })
    //     })
    // })

    // context('3D import', () => {
    //     const lat = 47.3
    //     const lon = 7.3
    //     const elevation = 215370
    //     const heading = 318
    //     const pitch = -45
    //
    //     it('transfers camera parameter from legacy URL to the new URL', () => {
    //         cy.goToMapView({
    //             queryParams: {
    //                 lat,
    //                 lon,
    //                 elevation,
    //                 heading,
    //                 pitch,
    //             },
    //             withHash: false,
    //         })
    //
    //         // checking in the store that the parameters have been converted into the new 3D parameters
    //         cy.getPinia().then((pinia) => {
    //             const cesiumStore = useCesiumStore(pinia)
    //             expect(cesiumStore.active).to.eq(true) // cesium should be active
    //
    //             // Checking camera position
    //             const positionStore6 = usePositionStore(pinia)
    //             assertDefined(positionStore6.camera)
    //             expect(positionStore6.camera.x).to.eq(lon)
    //             expect(positionStore6.camera.y).to.eq(lat)
    //             // For some reason, the z value is not exactly the same as the elevation
    //             // There might be a recalculating of the elevation
    //             expect(Number(positionStore6.camera.z)).to.approximately(elevation, 100)
    //             expect(positionStore6.camera.heading).to.eq(heading)
    //             expect(positionStore6.camera.pitch).to.eq(pitch)
    //             expect(positionStore6.camera.roll).to.eq(0)
    //
    //             // EPSG is set to 3857
    //             expect(positionStore6.projection.epsgNumber).to.eq(3857)
    //         })
    //     })
    //     it('transfers camera parameter from legacy URL to the new URL only heading', () => {
    //         cy.goToMapView({
    //             queryParams: {
    //                 lat,
    //                 lon,
    //                 heading,
    //             },
    //             withHash: false,
    //         })
    //
    //         // checking in the store that the parameters have been converted into the new 3D parameters
    //         cy.getPinia().then((pinia) => {
    //             const cesiumStore2 = useCesiumStore(pinia)
    //             expect(cesiumStore2.active).to.eq(true) // cesium should be active
    //
    //             // Checking camera position
    //             const positionStore7 = usePositionStore(pinia)
    //             assertDefined(positionStore7.camera)
    //             expect(positionStore7.camera.x).to.eq(lon)
    //             expect(positionStore7.camera.y).to.eq(lat)
    //             expect(positionStore7.camera.z).to.eq(0)
    //             expect(positionStore7.camera.heading).to.eq(heading)
    //             expect(positionStore7.camera.pitch).to.eq(-90)
    //             expect(positionStore7.camera.roll).to.eq(0)
    //
    //             // EPSG is set to 3857
    //             expect(positionStore7.projection.epsgNumber).to.eq(3857)
    //         })
    //     })
    //     // camera=7.038834,46.766017,193985.5,-47,319,
    //     // camera=8.225457,46.858429,738575.8,-90,,
    //     it('transfers camera parameter from legacy URL to the new URL only elevation', () => {
    //         cy.goToMapView({
    //             queryParams: {
    //                 lat,
    //                 lon,
    //                 elevation,
    //             },
    //             withHash: false,
    //         })
    //
    //         // checking in the store that the parameters have been converted into the new 3D parameters
    //         cy.getPinia().then((pinia) => {
    //             const cesiumStore3 = useCesiumStore(pinia)
    //             expect(cesiumStore3.active).to.eq(true) // cesium should be active
    //
    //             // Checking camera position
    //             // x, y, and z seems recalculated when there is only elevation, so I just check that they are not undefined
    //             const positionStore8 = usePositionStore(pinia)
    //             assertDefined(positionStore8.camera)
    //             expect(positionStore8.camera.x).to.not.be.undefined
    //             expect(positionStore8.camera.y).to.not.be.undefined
    //             expect(positionStore8.camera.z).to.not.be.undefined
    //             expect(positionStore8.camera.heading).to.eq(0)
    //             expect(positionStore8.camera.pitch).to.eq(-90)
    //             expect(positionStore8.camera.roll).to.eq(0)
    //
    //             // EPSG is set to 3857
    //             expect(positionStore8.projection.epsgNumber).to.eq(3857)
    //         })
    //     })
    // })

    // context('Extra Parameter Imports', () => {
    //     it('shows the compare slider at the correct position', () => {
    //         /*  */
    //         cy.goToMapView({
    //             queryParams: {
    //                 layers: 'test-1.wms.layer',
    //                 swipe_ratio: '0.3',
    //             },
    //             withHash: false,
    //         })
    //         // initial slider position is width * 0.3 -20
    //         cy.getPinia().then((pinia) => {
    //             const uiStore = useUIStore(pinia)
    //             cy.get('[data-cy="compareSlider"]').then((slider: JQuery<HTMLElement>) => {
    //                 expect(slider.position()['left']).to.eq(uiStore.width * 0.3 - 20)
    //             })
    //         })
    //         cy.getPinia().then((pinia) => {
    //             const uiStore2 = useUIStore(pinia)
    //             expect(uiStore2.compareRatio).to.be.equal(0.3)
    //             expect(uiStore2.isCompareSliderActive).to.be.equal(true)
    //         })
    //         cy.get('[data-cy="compareSlider"]').should('be.visible')
    //     })
    // })

    context('Feature Pre Selection Import', () => {
        function checkFeatures(featuresIds: string[]) {
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
            cy.waitUntilState((pinia: Pinia) => {
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

    // context('Time slider', () => {
    //     it('shows the time slider on startup when legacy "time" param present in the URL', () => {
    //         cy.goToMapView({
    //             queryParams: {
    //                 layers: `test.timeenabled.wmts.layer`,
    //                 time: 2019,
    //             },
    //             withHash: false,
    //         })
    //         cy.get('[data-cy="time-slider-current-year"]').should('contain', 2019)
    //     })
    // })
})
