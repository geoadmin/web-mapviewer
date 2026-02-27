// In the old mapviewer, a magic number (90) was set to make some compensation between the print and the viewer,
// to keep the scale between the two services. In the current implementation, 144 seems to be giving the best results.
export const PRINT_DPI_COMPENSATION: number = 144

// when the scale is too low, the print backend can't read the exponent.
//So when there is a non 0 scale, we set its minimum to 0.0001
export const MIN_PRINT_SCALE_SIZE: number = 0.0001

export enum PrintLayout {
    A0 = 'A0',
    A1 = 'A1',
    A2 = 'A2',
    A3 = 'A3',
    A4 = 'A4',
    A5 = 'A5',
    A6 = 'A6',
}

/** Dimensions in mm of the viewport for each print format */
export const PRINT_DIMENSIONS: Record<PrintLayout, [number, number]> = {
    A0: [1189, 841],
    A1: [841, 594],
    A2: [594, 420],
    A3: [420, 297],
    A4: [297, 210],
    A5: [210, 148],
    A6: [148, 105],
}

export const PRINT_DEFAULT_DPI: number = 96

export const PRINT_MARGIN_IN_MILLIMETERS: number = 4
