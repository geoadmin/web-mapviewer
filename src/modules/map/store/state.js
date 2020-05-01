
export const CLICK_MODES = {
    IDENTIFY: "IDENTIFY",
    DRAWING: "DRAWING"
};

export default {
    identify: {
        coordinate: {
            latitude: 0,
            longitude: 0
        },
        results: []
    },
    draw: {
        coordinates: []
    },
    clickMode: CLICK_MODES.IDENTIFY
};
