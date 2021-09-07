import { fromString } from 'ol/color'

export default class DrawingStyleColor {
    constructor(name, fill, border) {
        this.name = name
        this.fill = fill
        this.border = border
        this.rgb = fromString(fill)
        this.rgbString = `${this.rgb[0]},${this.rgb[1]},${this.rgb[2]}`
        this.textShadow = `-1px -1px 0 ${border}, 1px -1px 0 ${border}, -1px 1px 0 ${border},1px 1px 0 ${border}`
    }
}

export const BLACK = new DrawingStyleColor('black', '#000000', 'white')
export const BLUE = new DrawingStyleColor('blue', '#0000ff', 'white')
export const GRAY = new DrawingStyleColor('gray', '#808080', 'white')
export const GREEN = new DrawingStyleColor('green', '#008000', 'white')
export const ORANGE = new DrawingStyleColor('orange', '#ffa500', 'black')
export const RED = new DrawingStyleColor('red', '#ff0000', 'white')
export const WHITE = new DrawingStyleColor('white', '#ffffff', 'black')
export const YELLOW = new DrawingStyleColor('yellow', '#ffff00', 'black')

export const drawingStyleColors = [BLACK, BLUE, GRAY, GREEN, ORANGE, RED, WHITE, YELLOW]
