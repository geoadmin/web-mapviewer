import CoordinateSystemBounds from '@/proj/CoordinateSystemBounds'
import SwissCoordinateSystem from '@/proj/SwissCoordinateSystem'

export default class LV03CoordinateSystem extends SwissCoordinateSystem {
    constructor() {
        super({
            epsgNumber: 21781,
            label: 'CH1903 / LV03',
            technicalName: 'LV03',
            // matrix is coming fom https://epsg.io/21781.proj4
            proj4transformationMatrix:
                '+proj=somerc +lat_0=46.9524055555556 +lon_0=7.43958333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs +type=crs',
            // bound is coming from https://epsg.io/21781
            bounds: new CoordinateSystemBounds({
                lowerX: 485071.58,
                upperX: 837119.8,
                lowerY: 74261.72,
                upperY: 299941.79,
            }),
            usesMercatorPyramid: false,
        })
    }
}
