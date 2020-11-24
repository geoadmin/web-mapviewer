/// <reference types="cypress" />

import {round} from "../../../src/numberUtils";

describe('Test on legacy param import', () => {

    const readStoreValue = (key) => cy.window().its(`store.${key}`);

    const visitUrlAndWaitForMap = (url) => {
        cy.visit(url);
        // we leave some room for the CI to catch the DOM element (can be a bit slow depending on the CPU power of CI's VM)
        cy.get('[data-cy="map"]', { timeout: 10000 }).should('be.visible');
    }

    it('transfers valid params to the hash part without changing them', () => {
        const lat = 47.3;
        const lon = 7.3;
        const zoom = 10.4;
        visitUrlAndWaitForMap(`/?lat=${lat}&lon=${lon}&z=${zoom}`);

        // checking in the store that the position has not changed from what was in the URL
        readStoreValue('state.position.zoom').should('eq', zoom);
        readStoreValue('getters.centerEpsg4326').should(center => {
            expect(center[0]).to.eq(lon);
            expect(center[1]).to.eq(lat);
        });
    });

    it('loads correctly if params are already behind the hash', () => {
        const lat = 47;
        const lon = 7.5;
        const zoom = 12;
        visitUrlAndWaitForMap(`/#/map?lat=${lat}&lon=${lon}&z=${zoom}`);

        // checking in the store that the position has not changed from what was in the URL
        readStoreValue('state.position.zoom').should('eq', zoom);
        readStoreValue('getters.centerEpsg4326').should(center => {
            expect(center[0]).to.eq(lon);
            expect(center[1]).to.eq(lat);
        });
    });

    it('reproject LV95 coordinates/zoom param to EPSG:4326', () => {
        const E = 2660000;
        const N = 1200000;
        const lv95zoom = 8;
        visitUrlAndWaitForMap(`/?E=${E}&N=${N}&zoom=${lv95zoom}`);

        // the LV95 zoom level should be translated to a mercator zoom level of 15.5 according to
        // https://github.com/geoadmin/mf-geoadmin3/blob/ce885985e4af5e3e20c87321e67a650388af3602/src/components/map/MapUtilsService.js#L603-L631
        readStoreValue('state.position.zoom').should('eq', 15.5);

        // checking that we are reprojected to lon: 8.2267733° lat: 46.9483767°
        // (according to https://epsg.io/transform#s_srs=2056&t_srs=4326&x=2660000.0000000&y=1200000.0000000)
        readStoreValue('getters.centerEpsg4326').should(center => {
            // the app applies a rounding to the 6th decimal for lon/lat
            expect(center[0]).to.eq(round(8.2267733, 6));
            expect(center[1]).to.eq(round(46.9483767, 6));
        });
    })
})
