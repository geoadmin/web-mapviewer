import { Style, Circle, Fill, Stroke } from 'ol/style'

export const selectStyle = new Style({
    image: new Circle({
        fill: new Fill({
            color: [255, 255, 255, 0.4],
        }),
        stroke: new Stroke({
            color: [0, 0, 0, 1.0],
            width: 1,
        }),
        radius: 7,
    }),
})
