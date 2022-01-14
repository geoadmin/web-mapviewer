/// <reference types="cypress" />

// can't use @ notation with Cypress (Vue's webpack config is not shared with it)
import { round } from '../../../src/utils/numberUtils'

const kmlServiceBaseUrl = `${Cypress.env('VUE_APP_API_SERVICE_KML_BASE_URL')}api/kml`

describe('Test on legacy param import', () => {
    context('Coordinates import', () => {
        it('transfers valid params to the hash part without changing them', () => {
            const lat = 47.3
            const lon = 7.3
            const zoom = 10.4
            cy.goToMapView('en', {
                lat,
                lon,
                z: zoom,
            })

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
                'en',
                {
                    lat,
                    lon,
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

        it('reproject LV95 coordinates/zoom param to EPSG:4326', () => {
            const E = 2660000
            const N = 1200000
            const lv95zoom = 8
            cy.goToMapView('en', {
                E,
                N,
                zoom: lv95zoom,
            })

            // the LV95 zoom level should be translated to a mercator zoom level of 15.5 according to
            // https://github.com/geoadmin/mf-geoadmin3/blob/ce885985e4af5e3e20c87321e67a650388af3602/src/components/map/MapUtilsService.js#L603-L631
            cy.readStoreValue('state.position.zoom').should('eq', 15.5)

            // checking that we are reprojected to lon: 8.2267733° lat: 46.9483767°
            // (according to https://epsg.io/transform#s_srs=2056&t_srs=4326&x=2660000.0000000&y=1200000.0000000)
            cy.readStoreValue('getters.centerEpsg4326').should((center) => {
                // the app applies a rounding to the 6th decimal for lon/lat
                expect(center[0]).to.eq(round(8.2267733, 6))
                expect(center[1]).to.eq(round(46.9483767, 6))
            })
        })
    })

    context('Layers import', () => {
        it('Combines all old layers_*** params into the new one', () => {
            cy.goToMapView('en', {
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
            const kmlServiceFileUrl = `${kmlServiceBaseUrl}/files/1234567890`
            // serving a dummy KML so that we don't get a 404
            cy.intercept(kmlServiceFileUrl, '<kml />')
            cy.goToMapView('en', {
                layers: encodeURIComponent(`KML||${kmlServiceFileUrl}`),
                layers_opacity: '0.6',
                layers_visibility: 'true',
            })
            cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
                expect(activeLayers).to.be.an('Array').length(1)
                const [kmlLayer] = activeLayers
                expect(kmlLayer.getURL()).to.eq(kmlServiceFileUrl)
                expect(kmlLayer.opacity).to.eq(0.6)
                expect(kmlLayer.visible).to.be.true
            })
        })
        it('is able to import an external KML from a legacy adminid query param', () => {
            const adminId = '0987654321'
            const kmlId = '1234567890'
            const kmlServiceAdminUrl = `${kmlServiceBaseUrl}/admin`
            const kmlServiceFileUrl = `${kmlServiceBaseUrl}/files/${kmlId}`
            // serving a dummy KML so that we don't get a 404
            cy.intercept(kmlServiceFileUrl, '<kml />').as('get-kml')
            cy.intercept(`${kmlServiceAdminUrl}?admin_id=${adminId}`, (request) => {
                request.reply({
                    id: kmlId,
                    admin_id: adminId,
                    links: { self: `${request.url}/${kmlId}`, kml: kmlServiceFileUrl },
                    created: '',
                    updated: '',
                })
            }).as('get-kml-id')
            cy.goToMapView('en', {
                adminid: adminId,
            })
            cy.wait('@get-kml-id')
            cy.wait('@get-kml')
            cy.readStoreValue('state.layers.activeLayers').then((activeLayers) => {
                expect(activeLayers).to.be.an('Array').length(1)
                const [kmlLayer] = activeLayers
                expect(kmlLayer.getURL()).to.eq(kmlServiceFileUrl)
                expect(kmlLayer.opacity).to.eq(1)
                expect(kmlLayer.visible).to.be.true
            })
        })
        it('is able to import an external KML from a legacy adminid query param with other layers', () => {
            const adminId = '0987654321'
            const kmlId = '1234567890'
            const kmlServiceBaseUrl = `${Cypress.env('VUE_APP_API_SERVICE_KML_BASE_URL')}api/kml`
            const kmlServiceAdminUrl = `${kmlServiceBaseUrl}/admin`
            const kmlServiceFileUrl = `${kmlServiceBaseUrl}/files/${kmlId}`
            // serving a dummy KML so that we don't get a 404
            cy.intercept(kmlServiceFileUrl, '<kml />').as('get-kml')
            cy.intercept(`${kmlServiceAdminUrl}?admin_id=${adminId}`, (request) => {
                request.reply({
                    id: kmlId,
                    admin_id: adminId,
                    links: { self: `${request.url}/${kmlId}`, kml: kmlServiceFileUrl },
                    created: '',
                    updated: '',
                })
            }).as('get-kml-id')
            cy.goToMapView('en', {
                adminid: adminId,
                layers: 'test.wms.layer,test.wmts.layer',
                layers_opacity: '0.6,0.5',
                layers_visibility: 'true,false',
            })
            cy.wait('@get-kml-id')
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
                expect(kmlLayer.getURL()).to.eq(kmlServiceFileUrl)
                expect(kmlLayer.opacity).to.eq(1)
                expect(kmlLayer.visible).to.be.true
            })
        })
    })
})
