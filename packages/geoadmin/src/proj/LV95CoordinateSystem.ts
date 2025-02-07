import CoordinateSystemBounds from '@/proj/CoordinateSystemBounds'
import SwissCoordinateSystem from '@/proj/SwissCoordinateSystem'

export default class LV95CoordinateSystem extends SwissCoordinateSystem {
    constructor() {
        super(
            2056,
            'CH1903+ / LV95',
            // matrix is coming fom https://epsg.io/2056.proj4
            '+proj=somerc +lat_0=46.9524055555556 +lon_0=7.43958333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs +type=proj',
            /**
             * This can be used to constrain OpenLayers (or another mapping framework) to only ask
             * for tiles that are within the extent. It should remove, for instance, the big white
             * zone that is around the pixelkarte-farbe.
             *
             * Values are a ripoff of mf-geoadmin3 (see link below) and are not technically the
             * mathematical bounds of the system, but the limit at which we do not serve data
             * anymore.
             *
             * Those are coordinates expressed in EPSG:2056 (or LV95)
             *
             * @see https://github.com/geoadmin/mf-geoadmin3/blob/0ec560069e93fdceb54ce126a3c2d0ef23a50f45/mk/config.mk#L140
             */
            new CoordinateSystemBounds(2420000, 2900000, 1030000, 1350000)
        )
    }
}
