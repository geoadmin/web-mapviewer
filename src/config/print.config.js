// 90 Was the old mapviewer magic number set to compensate for the DPI difference between the
// mapviewer and the service print. Currently, 150 seems to be giving better results at keeping
// the same scale overall.
// We're going to check thoroughly if this works as intended, or if this is a monitor dpi setting element.
export const PRINT_MAGIC_NUMBER = 150
