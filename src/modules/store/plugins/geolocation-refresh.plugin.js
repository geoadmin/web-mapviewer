import proj4 from "proj4";

let geolocationRefreshInterval = null;
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

const geolocationRefreshPlugin = store => {
    store.subscribe((mutation, state) => {
        if (mutation.type === 'setGeolocationActive') {
            if (state.geolocation.active) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        // we center the view on the position of the user
                        store.dispatch('setCenter', readPositionEpsg3857(position));
                        if (firstTimeActivatingGeolocation) {
                            firstTimeActivatingGeolocation = false;
                            // going to zoom level 14.5 corresponding to map 1:25'000 (or zoom level 7 in the old viewer)
                            store.dispatch('setZoom', 14.5);
                        }
                        handlePositionAndDispatchToStore(position, store)
                        geolocationRefreshInterval = setInterval(() => {
                            navigator.geolocation.getCurrentPosition(position => handlePositionAndDispatchToStore(position, store));
                        }, 2000);
                    },
                    error => {
                        console.log(error.message);
                    },
                )
            } else if (geolocationRefreshInterval) {
                clearInterval(geolocationRefreshInterval);
                geolocationRefreshInterval = null;
            }
        }
    })
};

export default geolocationRefreshPlugin;
