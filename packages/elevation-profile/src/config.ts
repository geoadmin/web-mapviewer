import { LogPreDefinedColor } from '@swissgeo/log'

export const BORDER_COLOR: string = 'rgb(255, 99, 132)'
export const FILL_COLOR: string = 'rgba(255, 99, 132, 0.7)'

/**
 * 12.5 meters is what was used in the old viewer, see
 * https://github.com/geoadmin/mf-geoadmin3/blob/ce24a27b0ca8192a0f78f7b8cc07f4e231031304/src/components/GeomUtilsService.js#L207
 *
 * I tried lowering the value, but with the test GPX that were attached to the ticket PB-800, I get
 * the worst hiking time estimation when using something like 5m than if I use this 12.5 meters.
 */
export const GEOMETRY_SIMPLIFICATION_TOLERANCE = 12.5 // meters

export const logConfig = {
    title: '@swissgeo/elevation-profile',
    titleColor: LogPreDefinedColor.Teal,
}
