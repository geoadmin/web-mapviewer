
let firstRequest = null;


// as we don't have access to mf-geoadmin3's config here, I just copy pasted what was the real PROD config
// instead of using the gaGlobalOptions utils that was present in the old viewer's code
const legacyViewerWmtsMaxZoom = 21; // gaGlobalOptions.tileGridResolutions.length
const legacyViewerMapMaxZoom = 17; // gaGlobalOptions.resolutions.length;
const legacyZoomMapping = {
    0: 7.35,
    1: 7.75,
    2: 8.75,
    3: 10,
    4: 11,
    5: 12.5,
    6: 13.5,
    7: 14.5,
    8: 15.5,
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
 */
const legacyZoomToMercator = (zoom) => {
    if (legacyZoomMapping.includes(zoom)) {
        return legacyZoomMapping[zoom] - (legacyViewerWmtsMaxZoom - legacyViewerMapMaxZoom);
    } else {
        return -1;
    }
}

const legacyPermalinkManagement = (router) => {

    router.beforeEach((to, from, next) => {
        if (!firstRequest) {
            firstRequest = to;
            if (firstRequest.query.zoom) {
                // we need te re-evaluation this zoom, as it is a zoom tailor made for LV95 (and not made to cover the
                // whole globe)
                const newZoom = legacyZoomToMercator(firstRequest.query.zoom);
                if (newZoom !== -1) {
                    // replacing zoom level
                    firstRequest.query.z = newZoom;
                    delete firstRequest.query.zoom;
                }
            }
        }
        next();
    })
}

export default legacyPermalinkManagement;
