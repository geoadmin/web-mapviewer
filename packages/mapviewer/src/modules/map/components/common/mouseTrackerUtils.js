import { LV03 } from '@geoadmin/coordinates'
import { round } from '@geoadmin/numbers'
import proj4 from 'proj4'

import i18n from '@/modules/i18n/index.js'
import { LV03Format, LV95Format } from '@/utils/coordinates/coordinateFormat'

/**
 * Transform the coordinate, expressed in the given projection, into the wanted display format.
 *
 * There's a catch with LV03, where the precision of our transformation/reprojection with mouse
 * tracked coordinate isn't 100% precise (because transforming between LV95 and LV03 is much more
 * complex than a "simple" matrix reprojection, see the transformation vectors here:
 * https://s.geo.admin.ch/onq5koks0hnf and the REFRAME service we usually use for this here:
 * https://www.swisstopo.admin.ch/en/coordinate-conversion-reframe). So for this case we add a
 * little "approx." text before the coordinate, and round them to the nearest integer.
 *
 * Having precise coordinate in LV03 can be achieved by right-clicking on the map, as this part of
 * the app is using the REFRAME service. Here, as we are transforming coordinate multiple times per
 * second, that would not be a good idea...
 *
 * @param {SingleCoordinate} coordinates
 * @param {CoordinateSystem} projection
 * @param {CoordinateFormat} displayedFormat
 * @returns {string}
 */
export default function getHumanReadableCoordinate({ coordinates, projection, displayedFormat }) {
    if (displayedFormat.id === LV95Format.id) {
        return `${i18n.global.t('coordinates_label')} ${displayedFormat.format(coordinates, projection)}`
    } else if (displayedFormat.id === LV03Format.id) {
        // as we round the values, we have to project here ourselves (the format will otherwise proj4 them and we will lose our rounding)
        const lv03Coordinates =
            projection.epsg === LV03.epsg
                ? coordinates
                : proj4(projection.epsg, LV03.epsg, coordinates)
        return `${i18n.global.t('coordinates_label')} ${i18n.global.t('approx_abbr')} ${displayedFormat.format(
            lv03Coordinates.map((value) => round(value)),
            LV03
        )}`
    }
    return displayedFormat.format(coordinates, projection, true)
}
