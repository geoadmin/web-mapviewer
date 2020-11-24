import proj4 from "proj4";
import {round} from "@/utils/numberUtils";
import {ZOOM_LEVEL_1_25000_MAP} from "@/modules/store/modules/position.store";

const lv95ZoomMapping = {
    0: 7.35,
    1: 7.75,
    2: 8.75,
    3: 10,
    4: 11,
    5: 12.5,
    6: 13.5,
    7: 14.5,
    8: ZOOM_LEVEL_1_25000_MAP,
    9: 15.75,
    10: 16.7,
    11: 17.75,
    12: 18.75,
    13: 20,
    14: 21 // not defined at the moment
};

/**
 * Mapping between Swiss map zooms and Web Mercator zooms.
 * Copy/pasted from https://github.com/geoadmin/mf-geoadmin3/blob/ce885985e4af5e3e20c87321e67a650388af3602/src/components/map/MapUtilsService.js#L603-L631
 * @param {String} zoom
 */
const lv95ZoomToMercator = (zoom) => {
    if (Object.keys(lv95ZoomMapping).includes(zoom)) {
        return lv95ZoomMapping[zoom];
    } else {
        // if the value is not defined in the old zoom system, we use the 'default' zoom level of 8 (which will roughly
        // show the whole territory of Switzerland)
        return 8;
    }
}

/**
 * @param {String} search
 * @returns {*}
 */
const parseLegacyParams = (search) => {
    const parts = search.match(/(\?|&)([^=]+)=([^&]+)/g);
    const params = {};
    if (parts && Array.isArray(parts)) {
        parts.forEach(part => {
            const equalSignIndex = part.indexOf('=');
            const paramName = part.substr(1, equalSignIndex - 1);
            params[paramName] = part.substr(equalSignIndex + 1);
        })
    }
    return params;
}

/**
 * @param {VueRouter} router
 */
const legacyPermalinkManagement = (router) => {

    let isFirstRequest = true;
    const legacyParams = window.location && window.location.search ? parseLegacyParams(window.location.search) : null;

    router.beforeEach((to, from, next) => {
        if (isFirstRequest) {
            // before the first request, we check out if we need to manage any legacy params (from the old viewer)
            isFirstRequest = false;
            if (legacyParams) {
                // if so, we transfer all old param (stored before vue-router's /#) and transfer them to the MapView
                // we will also transform legacy zoom level here (see comment below)
                const newQuery = { ...to.query };
                const legacyCoordinates = [];
                Object.keys(legacyParams).forEach(param => {
                    let value;
                    let key = param;
                    switch (param) {

                        // we need te re-evaluate LV95 zoom, as it was a zoom level tailor made for this projection
                        // (and not made to cover the whole globe)
                        case 'zoom':
                            value = lv95ZoomToMercator(legacyParams[param]);
                            key = 'z';
                            break;

                        // storing coordinate parts for later conversion
                        case 'E':
                            legacyCoordinates[0] = Number(legacyParams[param]);
                            break;
                        case 'N':
                            legacyCoordinates[1] = Number(legacyParams[param]);
                            break;

                        // if no special work to do, we just copy past legacy params to the new viewer
                        default:
                            value = legacyParams[param];
                    }

                    // if a legacy coordinate (x,y or N,E) was used, we need to guess the SRS used (either LV95 or LV03)
                    // and covert it back to EPSG:4326 (Mercator)
                    if (legacyCoordinates.length === 2 && legacyCoordinates[0] && legacyCoordinates[1]) {
                        const center = proj4('EPSG:2056', 'EPSG:4326', legacyCoordinates);
                        newQuery['lon'] = round(center[0], 6);
                        newQuery['lat'] = round(center[1], 6);
                    }
                    if (value) {
                        newQuery[key] = value;
                    }
                })
                // removing old query part (new ones will be added by vue-router after the /# part of the URL)
                const urlWithoutQueryParam = window.location.href.substr(0, window.location.href.indexOf('?'));
                window.history.replaceState({}, document.title, urlWithoutQueryParam);
                next({
                    name: 'MapView',
                    query: newQuery
                })
            } else {
                next();
            }
        } else {
            next();
        }
    })
}

export default legacyPermalinkManagement;
