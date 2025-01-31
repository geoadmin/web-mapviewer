// In the old mapviewer, a magic number (90) was set to make some compensation between the print and the viewer,
// to keep the scale between the two services. In the current implementation, 144 seems to be giving the best results.
export const PRINT_DPI_COMPENSATION = 144

// when the scale is too low, the print backend can't read the exponent.
//So when there is a non 0 scale, we set its minimum to 0.0001
export const MIN_PRINT_SCALE_SIZE = 0.0001
