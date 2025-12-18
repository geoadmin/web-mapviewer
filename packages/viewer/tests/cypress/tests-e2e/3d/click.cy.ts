/// <reference types="cypress" />
import { registerProj4, WEBMERCATOR, WGS84 } from '@swissgeo/coordinates'
import proj4 from 'proj4'

import useMapStore from '@/store/modules/map'
import { ClickType } from '@/store/modules/map/types'

registerProj4(proj4)

describe('Testing click', () => {
    it('handles left click on the map', () => {
        const lon = 7.451498
        const lat = 46.92805
        const mercatorCoords = proj4(WGS84.epsg, WEBMERCATOR.epsg, [lon, lat])

        cy.goToMapView({
            queryParams: {
                '3d': true,
                center: mercatorCoords.join(','),
                sr: WEBMERCATOR.epsgNumber,
            },
        })
        cy.waitUntilCesiumTilesLoaded()
        cy.log('Filling store with initial click info')
        cy.getPinia().then((pinia) => {
            const mapStore = useMapStore(pinia)
            mapStore.clickInfo = {
                clickType: ClickType.LeftSingleClick,
                coordinate: [7.451498, 46.92805],
                pixelCoordinate: undefined,
                features: [],
            }
            const clickInfo = mapStore.clickInfo
            expect(clickInfo?.clickType).to.equal(
                ClickType.LeftSingleClick,
                'Click type is correctly detected'
            )
        })


        cy.get('[data-cy="cesium-map"] .cesium-viewer').click()
        cy.log('Checking store after click processing in the app where no Tile is present and no coordinate can be retrieved')
        cy.getPinia().then((pinia) => {
            const mapStore = useMapStore(pinia)
            const clickInfo = mapStore.clickInfo
            expect(clickInfo).to.equal(
                undefined,
            )
        })
        // since switching to fake tileset and tiles for testing
        // these tests here do not functioning properly, they are commented until we find
        // a way to give fake tile that Cesium can "pick" (ray trace) with again
        // TODO : BGDIINF_SB-3181
        /*
        expect(clickInfo.coordinate).to.be.an(
            'Array',
            'Coordinate of the click is passed to the store'
        )
        expect(clickInfo.constructor).to.have.lengthOf(2, 'Both X and Y are given')
        expect(clickInfo.coordinate[0]).to.approximately(
            mercatorCoords[0],
            0.01,
            'Longitude is correctly passed in Mercator to the store'
        )
        expect(clickInfo.coordinate[1]).to.approximately(
            mercatorCoords[1],
            0.01,
            'Latitude is correctly passed in Mercator to the store'
        )
         */
    })
})
