/// <reference types="cypress" />

import proj4 from 'proj4'

import { DEFAULT_PROJECTION } from '@/config'
import { WGS84 } from '@/utils/coordinates/coordinateSystems'

describe('Test on legacy param import', () => {
    context('Coordinates import', () => {
        it('transfers valid params to the hash part without changing them', () => {
            const lat = 47.3
            const lon = 7.3
            const zoom = 10.4
            cy.goToMapView({
                lat,
                lon,
                z: zoom,
            })

            // checking in the store that the position has not changed from what was in the URL
            cy.readStoreValue('state.position.zoom').should('eq', 10) // zoom should be rounded to the closest Swisstopo zoom level
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
            cy.goToMapView({
                E,
                N,
                zoom: lv95zoom,
            })

            cy.readStoreValue('state.position.zoom').should('eq', lv95zoom)

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
            cy.intercept(`**/${kmlServiceFilePath}`, '<kml />').as('get-kml')
            cy.intercept(`**/${kmlServiceAdminPath}?admin_id=${adminId}`, (request) => {
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
            cy.intercept(`**/${kmlServiceAdminPath}/${kmlId}`, (request) => {
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
                layers: 'test.wms.layer,test.wmts.layer',
                layers_opacity: '0.6,0.5',
                layers_visibility: 'true,false',
            })
            cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
                expect(activeLayers).to.be.an('Array').length(2)
                const [wmsLayer, wmtsLayer] = activeLayers
                expect(wmsLayer.getID()).to.eq('test.wms.layer')
                expect(wmsLayer.opacity).to.eq(0.6)
                expect(wmsLayer.visible).to.be.true
                expect(wmtsLayer.getID()).to.eq('test.wmts.layer')
                expect(wmtsLayer.opacity).to.eq(0.5)
                expect(wmtsLayer.visible).to.be.false
            })
        })
        it('is able to import an external KML from a legacy param', () => {
            cy.goToMapView({
                layers: `KML||${kmlServiceBaseUrl}${kmlServiceFilePath}`,
                layers_opacity: '0.6',
                layers_visibility: 'true',
            })
            cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
                expect(activeLayers).to.be.an('Array').length(1)
                const [kmlLayer] = activeLayers
                expect(kmlLayer.getURL()).to.eq(`${kmlServiceBaseUrl}${kmlServiceFilePath}`)
                expect(kmlLayer.opacity).to.eq(0.6)
                expect(kmlLayer.visible).to.be.true
            })
        })
        // TODO BGDIINF_SB-2685: re-activate
        it.skip('is able to import an external KML from a legacy adminId query param', () => {
            cy.goToMapView({
                adminId: adminId,
            })
            cy.wait('@get-kml-metada-by-admin-id')
            cy.wait('@get-kml')
            cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
                expect(activeLayers).to.be.an('Array').length(1)
                const [kmlLayer] = activeLayers
                expect(kmlLayer.getURL()).to.eq(`${kmlServiceBaseUrl}${kmlServiceFilePath}`)
                expect(kmlLayer.opacity).to.eq(1)
                expect(kmlLayer.visible).to.be.true
                expect(kmlLayer.adminId).to.equal(adminId)
            })
        })
        // TODO BGDIINF_SB-2685: re-activate
        it.skip("don't keep KML adminId in URL after import", () => {
            cy.goToMapView({
                adminId: adminId,
            })
            cy.wait('@get-kml-metada-by-admin-id')
            cy.wait('@get-kml')
            cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
                expect(activeLayers).to.be.an('Array').length(1)
                const [kmlLayer] = activeLayers
                expect(kmlLayer.getURL()).to.eq(`${kmlServiceBaseUrl}${kmlServiceFilePath}`)
                expect(kmlLayer.opacity).to.eq(1)
                expect(kmlLayer.visible).to.be.true
                expect(kmlLayer.adminId).to.be.equal(adminId)
            })
            cy.url().should('not.contain', adminId)
        })
        // TODO BGDIINF_SB-2685: re-activate
        it.skip('is able to import an external KML from a legacy adminId query param with other layers', () => {
            cy.goToMapView({
                adminId: adminId,
                layers: 'test.wms.layer,test.wmts.layer',
                layers_opacity: '0.6,0.5',
                layers_visibility: 'true,false',
            })
            cy.wait('@get-kml-metada-by-admin-id')
            cy.wait('@get-kml')
            cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
                expect(activeLayers).to.be.an('Array').length(3)
                const [wmsLayer, wmtsLayer, kmlLayer] = activeLayers
                expect(wmsLayer.getID()).to.eq('test.wms.layer')
                expect(wmsLayer.opacity).to.eq(0.6)
                expect(wmsLayer.visible).to.be.true
                expect(wmtsLayer.getID()).to.eq('test.wmts.layer')
                expect(wmtsLayer.opacity).to.eq(0.5)
                expect(wmtsLayer.visible).to.be.false
                expect(kmlLayer.getURL()).to.eq(`${kmlServiceBaseUrl}${kmlServiceFilePath}`)
                expect(kmlLayer.opacity).to.eq(1)
                expect(kmlLayer.visible).to.be.true
            })
        })
        it("doesn't show encoding in the search bar when serving a swisssearch legacy url", () => {
            cy.goToMapView({
                swisssearch: '1530 Payerne',
            })
            cy.readStoreValue('state.search.query').should('eq', '1530 Payerne')
            cy.url().should('include', 'swisssearch=1530+Payerne')
            cy.get('[data-cy="search-result-entry-location"]', { timeout: 8000 }).should(
                'be.visible'
            )
        })
        it('External WMS layer', () => {
            const layerName = 'OpenData-AV'
            const layerId = 'ch.swisstopo-vd.official-survey'
            const url = 'https://fake.wms.base.url/?'
            cy.intercept(
                { url: `${url}**`, query: { REQUEST: 'GetMap' } },
                {
                    fixture: '256.png',
                }
            ).as('externalWMSGetMap')
            cy.intercept(
                { url: `${url}**`, query: { REQUEST: 'GetCapabilities' } },
                { fixture: 'external-wms-getcap.fixture.xml' }
            ).as('externalWMSGetCap')

            cy.goToMapView({
                layers: `test.wms.layer,WMS||${layerName}||${url}||${layerId}||1.3.0`,
                layers_opacity: '1,1',
                layers_visibility: 'false,true',
                layers_timestam: ',',
            })
            cy.wait('@externalWMSGetCap')
            cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
                expect(activeLayers).to.be.an('Array').length(2)
                const externalLayer = activeLayers[1]
                expect(externalLayer.isExternal).to.be.true
                expect(externalLayer.visible).to.be.true
                expect(externalLayer.baseURL).to.eq(url)
                expect(externalLayer.externalLayerId).to.eq(layerId)
                expect(externalLayer.name).to.eq(layerName)
                expect(externalLayer.isLoading).to.false
            })
            const expectedHash = `#/map?layers=test.wms.layer,f,1;WMS%7C${url}%7C${layerId},,1&layers_timestam=,&lang=en&center=2660013.5,1185172&z=1&bgLayer=test.background.layer2&topic=ech`
            cy.location().should((location) => {
                expect(location.hash).to.eq(expectedHash)
                expect(location.search).to.eq('')
            })
        })
        it('External WMTS layer', () => {
            cy.intercept('http://wmts-test.url/**', {
                fixture: 'external-wmts-getcap.fixture.xml',
            }).as('externalWMTSGetCap')
            cy.intercept(
                'http://test.wmts.png/wmts/1.0.0/TestExternalWMTS/default/ktzh/**/*/*.png',
                {
                    fixture: '256.png',
                }
            )
            const layerId = 'TestExternalWMTS'
            const layerName = 'Test External WMTS'
            const url = 'http://wmts-test.url/'
            cy.goToMapView({
                layers: `test.wmts.layer,WMTS||${layerId}||${url}`,
                layers_opacity: '1,1',
                layers_visibility: 'false,true',
                layers_timestam: ',',
            })
            cy.wait('@externalWMTSGetCap')
            cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
                expect(activeLayers).to.be.an('Array').length(2)
                const externalLayer = activeLayers[1]
                expect(externalLayer.isExternal).to.be.true
                expect(externalLayer.visible).to.be.true
                expect(externalLayer.baseURL).to.eq(url)
                expect(externalLayer.externalLayerId).to.eq(layerId)
                expect(externalLayer.name).to.eq(layerName)
                expect(externalLayer.isLoading).to.be.false
            })
            const expectedHash = `#/map?layers=test.wmts.layer,f,1;WMTS%7C${url}%7C${layerId},,1&layers_timestam=,&lang=en&center=2660013.5,1185172&z=1&bgLayer=test.background.layer2&topic=ech`
            cy.location().should((location) => {
                expect(location.hash).to.eq(expectedHash)
                expect(location.search).to.eq('')
            })
        })
    })
})
