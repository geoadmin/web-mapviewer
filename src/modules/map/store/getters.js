export default {
    drawGeoJSON: state => {
        return {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "LineString",
                        coordinates: state.draw.coordinates
                    }
                }
            ]
        };
    }
};
