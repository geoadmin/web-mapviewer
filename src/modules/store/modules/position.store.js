import center from "@turf/center";
import proj4 from "proj4";
import { point, featureCollection } from "@turf/helpers"
import {round} from "@/numberUtils";

// see https://en.wikipedia.org/wiki/Equator#Exact_length and https://en.wikipedia.org/wiki/World_Geodetic_System#A_new_World_Geodetic_System:_WGS_84
// for constants' values
const WGS84_SEMI_MAJOR_AXIS_A = 6378137.0;
const WGS84_EQUATOR_LENGTH_IN_METERS = 2 * Math.PI * WGS84_SEMI_MAJOR_AXIS_A;
const PIXEL_LENGTH_IN_KM_AT_ZOOM_ZERO_WITH_256PX_TILES = WGS84_EQUATOR_LENGTH_IN_METERS / 256;

const state = {
    extent: {
        bottomLeft: [ 650000, 5720000 ],
        topRight: [ 1178000, 6100000 ]
    }
};

const getters = {
    /** with EPSG:3857 projection (pseudo-mercator) */
    center: state => {
        // calculating the center of the current extent in order to get the center of the view
        return center(featureCollection([
            point([state.extent.bottomLeft[0], state.extent.bottomLeft[1]]),
            point([state.extent.topRight[0], state.extent.topRight[1]])
        ])).geometry.coordinates;
    },
    centerEpsg4326: (_, getters) => {
        return proj4("EPSG:3857","EPSG:4326", getters.center);
    },
    /** In meter per pixel */
    resolution: (state, _, rootState) => {
        if (rootState.size.width === 0 || rootState.size.height === 0) return 0;
        const widthResolution = (state.extent.topRight[0] - state.extent.bottomLeft[0]) / rootState.size.width
        const heightResolution = (state.extent.topRight[1] - state.extent.bottomLeft[1]) / rootState.size.height
        return round((widthResolution + heightResolution) / 2, 2)
    },
    zoom: (state, getters) => {
        const latInRad = getters.centerEpsg4326[1] * Math.PI / 180.0;
        // from https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
        // we can revert the formula and state that :
        const zoom = Math.log2(PIXEL_LENGTH_IN_KM_AT_ZOOM_ZERO_WITH_256PX_TILES * Math.cos(latInRad) / getters.resolution)
        return round(zoom,3);
    },
};

const actions = {
    setZoom({ commit, getters, rootState }, zoom) {
        if (typeof zoom !== 'number') {
            return;
        }
        // calculating new resolution, see https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
        const latInRad = getters.centerEpsg4326[1] * Math.PI / 180;
        const newResolution = round(PIXEL_LENGTH_IN_KM_AT_ZOOM_ZERO_WITH_256PX_TILES * Math.cos(latInRad) / (Math.pow(2, zoom)), 2);
        const halfScreenInMeter = {
            width: rootState.size.width / 2 * newResolution,
            height: rootState.size.height / 2 * newResolution
        }
        // recalculating extent with new resolution
        const newBottomLeft = [
            round(getters.center[0] - halfScreenInMeter.width, 2),
            round(getters.center[1] - halfScreenInMeter.height, 2),
        ];
        const newTopRight = [
            round(getters.center[0] + halfScreenInMeter.width, 2),
            round(getters.center[1] + halfScreenInMeter.height, 2),
        ];
        commit('setExtent', { bottomLeft: newBottomLeft, topRight: newTopRight });
    },
    setCenter: ({commit, getters, state}, center) => {
        if (!center || !center.x || !center.y) {
            return;
        }
        const { x, y } = center;
        // shifting extent to new center
        const delta = {
            x: getters.center[0] - x,
            y: getters.center[1] - y,
        };
        commit('setExtent', {
            bottomLeft: [ state.extent.bottomLeft[0] - delta.x, state.extent.bottomLeft[1] - delta.y ],
            topRight: [ state.extent.topRight[0] - delta.x, state.extent.topRight[1] - delta.y ],
        })
    },
    setExtent: ({commit}, extent) => {
        if (extent) {
            if (extent.bottomLeft && extent.topRight) {
                commit('setExtent', extent);
            }
        }
    },
    increaseZoom: ({dispatch, getters}) => dispatch("setZoom", Number(getters.zoom) + 1),
    decreaseZoom: ({dispatch, getters}) => dispatch("setZoom", Number(getters.zoom) - 1)
};

const mutations = {
    setExtent: (state, extent) => state.extent = extent,
};

export default {
    state,
    getters,
    actions,
    mutations
};
