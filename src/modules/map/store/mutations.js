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
    }
};
