import center from "@turf/center";
import { point, featureCollection } from "@turf/helpers"
import proj4 from "proj4";
import {round} from "@/utils/numberUtils";

// for constants' values
// see https://en.wikipedia.org/wiki/Equator#Exact_length and https://en.wikipedia.org/wiki/World_Geodetic_System#A_new_World_Geodetic_System:_WGS_84
const WGS84_SEMI_MAJOR_AXIS_A = 6378137.0;
const WGS84_EQUATOR_LENGTH_IN_METERS = 2 * Math.PI * WGS84_SEMI_MAJOR_AXIS_A;
const PIXEL_LENGTH_IN_KM_AT_ZOOM_ZERO_WITH_256PX_TILES = WGS84_EQUATOR_LENGTH_IN_METERS / 256;

export const ZOOM_LEVEL_1_25000_MAP = 15.5;

const state = {
    zoom: 7,
    // center of the LV:95 projection (from https://epsg.io/2056) reprojected in EPSG:3857
    center: [915602.81, 5911929.47],
};

const calculateResolution = (zoom, latitudeInRad) => {
    // from https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
    // resolution = 156543.03 meters/pixel * cos(latitude) / (2 ^ zoomlevel)
    return round(Math.abs(PIXEL_LENGTH_IN_KM_AT_ZOOM_ZERO_WITH_256PX_TILES * Math.cos(latitudeInRad) / (Math.pow(2, zoom))), 2)
}

const getters = {
    centerEpsg4326: (state) => {
        const centerEpsg4326Unrounded = proj4("EPSG:3857","EPSG:4326", state.center);
        return [
            // a precision of 6 digits means we can track position with 0.111m accuracy
            // see http://wiki.gis.com/wiki/index.php/Decimal_degrees
            round(centerEpsg4326Unrounded[0], 6),
            round(centerEpsg4326Unrounded[1], 6)
        ]
    },
    centerEpsg4326InRadian: (_, getters) => {
        const centerEpsg4326 = getters.centerEpsg4326;
        return [
            centerEpsg4326[0] * Math.PI / 180.0,
            centerEpsg4326[1] * Math.PI / 180.0,
        ];
    },
    /** In meter per pixel */
    resolution: (state, getters) => calculateResolution(state.zoom, getters.centerEpsg4326InRadian[1]),
    extent: (state, getters, rootState) => {
        const halfScreenInMeter = {
            width: rootState.ui.width / 2 * getters.resolution,
            height: rootState.ui.height / 2 * getters.resolution
        }
        // calculating extent with resolution
        const bottomLeft = [
            round(state.center[0] - halfScreenInMeter.width, 2),
            round(state.center[1] - halfScreenInMeter.height, 2),
        ];
        const topRight = [
            round(state.center[0] + halfScreenInMeter.width, 2),
            round(state.center[1] + halfScreenInMeter.height, 2),
        ];
        return [bottomLeft, topRight]
    },
};

const actions = {
    setZoom({ commit }, zoom) {
        if (typeof zoom !== 'number' || zoom < 0) {
            return;
        }
        commit('setZoom', round(zoom, 3));
    },
    setCenter: ({commit}, center) => {
        if (!center
            || (Array.isArray(center) && center.length !== 2)
            || (!Array.isArray(center) && (!center.x || !center.y))) {
            console.debug('bad center received, ignoring', center);
            return;
        }
        if (Array.isArray(center)) {
            commit('setCenter', {
                x: center[0],
                y: center[1]
            })
        } else {
            const { x, y } = center;
            commit('setCenter', {x, y});
        }
    },
    setExtent: ({commit, getters, rootState}, extent) => {
        if (extent && Array.isArray(extent) && extent.length === 2) {
            // calculating center of this extent
            const centerOfExtentEpsg4326 = center(featureCollection([
                point(proj4('EPSG:3857', proj4.WGS84, extent[0])),
                point(proj4('EPSG:3857', proj4.WGS84, extent[0]))
            ])).geometry.coordinates;
            const centerOfExtent = proj4(proj4.WGS84, 'EPSG:3857', centerOfExtentEpsg4326);
            if (centerOfExtent && Array.isArray(centerOfExtent) && centerOfExtent.length === 2) {
                commit('setCenter', {
                    x: centerOfExtent[0],
                    y: centerOfExtent[1]
                });
            }
            const newResolution = (extent[1][0] - extent[0][0]) / rootState.ui.width;
            // calculating new zoom level by reversing
            // resolution = 156543.03 meters/pixel * cos(latitude) / (2 ^ zoomlevel)
            const zoom = Math.abs(Math.log2(newResolution / PIXEL_LENGTH_IN_KM_AT_ZOOM_ZERO_WITH_256PX_TILES / Math.cos(getters.centerEpsg4326InRadian[1])));
            commit('setZoom', zoom);
        }
    },
    setLatitude: ({dispatch, getters}, latInDeg) => {
        if (typeof latInDeg === 'number') {
            const newCenter = [getters.centerEpsg4326[0], latInDeg];
            const newCenterEpsg3857 = proj4(proj4.WGS84, "EPSG:3857", newCenter);
            dispatch('setCenter', {
                x: newCenterEpsg3857[0],
                y: newCenterEpsg3857[1]
            });
        }
    },
    setLongitude: ({dispatch, getters}, lonInDeg) => {
        if (typeof lonInDeg === 'number') {
            const newCenter = [lonInDeg, getters.centerEpsg4326[1]];
            const newCenterEpsg3857 = proj4(proj4.WGS84, "EPSG:3857", newCenter);
            dispatch('setCenter', {
                x: newCenterEpsg3857[0],
                y: newCenterEpsg3857[1]
            });
        }
    },
    increaseZoom: ({dispatch, state}) => dispatch("setZoom", Number(state.zoom) + 1),
    decreaseZoom: ({dispatch, state}) => dispatch("setZoom", Number(state.zoom) - 1),
};

const mutations = {
    setZoom: (state, zoom) => state.zoom = zoom,
    setCenter: (state, {x, y}) => state.center = [x, y],
};

export default {
    state,
    getters,
    actions,
    mutations
};
