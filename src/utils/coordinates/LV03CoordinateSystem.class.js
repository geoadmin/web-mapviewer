import CoordinateSystemBounds from '@/utils/coordinates/CoordinateSystemBounds.class'
import SwissCoordinateSystem from '@/utils/coordinates/SwissCoordinateSystem.class'

export default class LV03CoordinateSystem extends SwissCoordinateSystem {
    constructor() {
        super(
            21781,
            'CH1903 / LV03',
            '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs',
            new CoordinateSystemBounds(485071.58, 837119.8, 74261.72, 299941.79)
        )
    }
}
