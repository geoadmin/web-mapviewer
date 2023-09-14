/// <reference types="cypress" />
import { ClickType } from '@/store/modules/map.store'
import { WEBMERCATOR, WGS84 } from '@/utils/coordinates/coordinateSystems'
import { Cartesian3 } from 'cesium'
import proj4 from 'proj4'

describe('Testing click', () => {
    context('click', () => {
        beforeEach(() => {
            cy.goToMapView({
                '3d': true,
            })
        })
        it('left click', () => {
            cy.waitUntilCesiumTilesLoaded().then((viewer) => {
                const lon = 7.451498
                const lat = 46.92805
                viewer.camera.flyTo({
                    destination: Cartesian3.fromDegrees(lon, lat, 1000),
                    duration: 0.0,
                })
                cy.waitUntilCesiumTilesLoaded().then(() => {
                    cy.get('[data-cy="cesium-map"] .cesium-viewer').click()
                    cy.readStoreValue('state.map.clickInfo').then((clickInfo) => {
                        expect(clickInfo.clickType).to.equal(ClickType.LEFT_SINGLECLICK)
                        expect(clickInfo.features.length).to.equal(0)
                        expect(clickInfo.pixelCoordinate[0]).to.equal(
                            Cypress.config('viewportWidth') / 2
                        )
                        expect(clickInfo.pixelCoordinate[1]).to.equal(
                            Cypress.config('viewportHeight') / 2
                        )
                        const mercatorCoords = proj4(WGS84.epsg, WEBMERCATOR.epsg, [lon, lat])
                        expect(clickInfo.coordinate[0]).to.approximately(mercatorCoords[0], 0.001)
                        expect(clickInfo.coordinate[1]).to.approximately(mercatorCoords[1], 0.001)
                    })
                })
            })
        })
    })
})
