export default class DrawingStyleSize {
    constructor(label, textScale, iconScale) {
        this.label = label
        this.textScale = textScale
        this.iconScale = iconScale
    }
}

export const drawingStyleSizes = [
    new DrawingStyleSize('small_size', 1, 0.5),
    new DrawingStyleSize('medium_size', 1.5, 1.0),
    new DrawingStyleSize('big_size', 2, 2.0),
]
