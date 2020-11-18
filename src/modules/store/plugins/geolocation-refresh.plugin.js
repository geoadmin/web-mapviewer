import proj4 from "proj4";
import i18n from "@/modules/i18n";

let geolocationWatcher = null;
let firstTimeActivatingGeolocation = true;

const readPositionEpsg3857 = position => {
    const { coords } = position;
    return proj4(proj4.WGS84, 'EPSG:3857', [coords.longitude, coords.latitude]);
};

const handlePositionAndDispatchToStore = (position, store) => {
    const positionEpsg3857 = readPositionEpsg3857(position);
    store.dispatch('setGeolocationPosition', positionEpsg3857);
    store.dispatch('setGeolocationAccuracy', position.coords.accuracy);
}

/**
 * Handles Geolocation API errors
 * @param {PositionError} error
 * @param {Vuex.Store} store
 */
const handlePositionError = (error, store) => {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            store.dispatch('setGeolocationDenied', true);
            alert(i18n.t('geoloc_permission_denied'));
            break;
        default:
            alert(i18n.t('geoloc_unknown'));
    }
}

const geolocationRefreshPlugin = store => {
    store.subscribe((mutation, state) => {
        if (mutation.type === 'setGeolocationActive') {
            if (state.geolocation.active) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        // if geoloc was previously denied, we clear the flag
                        if (state.geolocation.denied) {
                            store.dispatch('setGeolocationDenied', false);
                        }
                        // we center the view on the position of the user
                        store.dispatch('setCenter', readPositionEpsg3857(position));
                        if (firstTimeActivatingGeolocation) {
                            firstTimeActivatingGeolocation = false;
                            // going to zoom level 14.5 corresponding to map 1:25'000 (or zoom level 7 in the old viewer)
                            store.dispatch('setZoom', 14.5);
                        }
                        handlePositionAndDispatchToStore(position, store)
                        geolocationWatcher = navigator.geolocation.watchPosition(position => handlePositionAndDispatchToStore(position, store),
                                                                                   error => handlePositionError(error, store));
                    },
                    error => handlePositionError(error, store)
                )
            } else if (geolocationWatcher) {
                navigator.geolocation.clearWatch(geolocationWatcher);
                geolocationWatcher = null;
            }
        }
    })
};

export default geolocationRefreshPlugin;
