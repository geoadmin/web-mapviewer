import type { MFPLegend, MFPMap } from '@geoblocks/mapfishprint/src/types'

declare module '@geoblocks/mapfishprint' {
    export interface MFPAttributes {
        map: MFPMap
        legend: MFPLegend

        /**
         * Flag telling if the legend should be printed (1) or not (0). If not set, will print the
         * legend (as if '1' was given)
         *
         * This is an "optional" attribute from our own template
         *
         * @see https://github.com/geoadmin/service-print3/blob/develop/print-apps/mapviewer/requestData_no_legend.json
         */
        printLegend?: 1 | 0
        printDate?: string

        // There can be many other "optional" attributes, a template can declare as many as needed
        [key: string]: unknown
    }
}
