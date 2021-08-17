import { fromString } from 'ol/color'

export default class DrawingStyleColor {
    constructor(name, fill, border) {
        this.name = name
        this.fill = fill
        this.border = border
        this.rgb = fromString(fill)
        this.textShadow = `-1px -1px 0 ${border}, 1px -1px 0 ${border}, -1px 1px 0 ${border},1px 1px 0 ${border}`
    }
}

export const drawingStyleColors = [
    new DrawingStyleColor('black', '#000000', 'white'),
    new DrawingStyleColor('blue', '#0000ff', 'white'),
    new DrawingStyleColor('gray', '#808080', 'white'),
    new DrawingStyleColor('green', '#008000', 'white'),
    new DrawingStyleColor('orange', '#ffa500', 'black'),
    new DrawingStyleColor('red', '#ff0000', 'white'),
    new DrawingStyleColor('white', '#ffffff', 'black'),
    new DrawingStyleColor('yellow', '#ffff00', 'black'),
]
