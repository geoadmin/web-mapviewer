import proj4 from "proj4";
import CLICK_MODES from "./state"

proj4.defs(
    "EPSG:2056",
    "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs"
);

export default {
    click({ state, commit }, coordinate) {
        if (state.clickMode === CLICK_MODES.IDENTIFY) {
            commit("identify", coordinate);
            const lv95position = proj4(proj4.WGS84, "EPSG:2056", [
                coordinate.longitude,
                coordinate.latitude
            ]);
            return fetch(
                `https://api3.geo.admin.ch/rest/services/all/MapServer/identify?layers=all:ch.bav.haltestellen-oev&geometryType=esriGeometryPoint&geometryFormat=geojson&geometry=${
                    lv95position[0]
                },${
                    lv95position[1]
                }&sr=2056&mapExtent=2466000,1069000,2835500,1303150&imageDisplay=1200,1000,96&tolerance=1`
            )
                .then(response => response.json())
                .then(json => {
                    const { results } = json;
                    commit("setIdentifyResults", results);
                });
        } else if (state.clickMode === CLICK_MODES.DRAWING) {
            commit("draw", coordinate);
        }
    },
    identify({ commit }, coordinates) {
        commit("identify", coordinates);
    },
    clearIdentify({ commit }) {
        commit("identify", {
            latitude: 0,
            longitude: 0
        });
        commit("setIdentifyResults", []);
    },
    toggleClickMode({ commit }) {
        commit("toggleClickMode");
    },
    clearDrawing({ commit }) {
        commit("clearDrawing");
    }
};
