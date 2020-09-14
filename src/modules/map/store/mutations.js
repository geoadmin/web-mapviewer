import CLICK_MODES from "./state"

export default {
    identify(state, {latitude, longitude}) {
        state.identify.coordinate = {latitude, longitude};
    },
    setIdentifyResults(state, results) {
        state.identify.results = results;
    },
    toggleClickMode(state) {
        if (state.clickMode === CLICK_MODES.IDENTIFY) {
            state.clickMode = CLICK_MODES.DRAWING;
        } else {
            state.clickMode = CLICK_MODES.IDENTIFY;
        }
    },
    draw(state, {latitude, longitude}) {
        state.draw.coordinates.push([longitude, latitude]);
    },
    clearDrawing(state) {
        state.draw.coordinates = [];
    },
    toggleMapOverlay(state, callbackOnClose) {
        state.overlay.show = !state.overlay.show;
        if (state.overlay.show && callbackOnClose) {
            state.overlay.callbacksOnClose.push(callbackOnClose);
        } else if (!state.overlay.show && state.overlay.callbacksOnClose.length > 0) {
            state.overlay.callbacksOnClose.forEach(callback => {
                callback();
            });
            state.overlay.callbacksOnClose = [];
        }
    },
    clearOverlayCallbacks(state) {
        state.overlay.callbacksOnClose = [];
    }
};
