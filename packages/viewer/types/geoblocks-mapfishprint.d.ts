// Mark this file as a module, so the block below is treated as an augmentation.
// Without it, the declaration below is treated as the full declaration
// (ignoring any other types from the package itself)
export {}

import type { MFPMap } from '@geoblocks/mapfishprint/src/types'

// TODO remove after https://github.com/geoblocks/mapfishprint/pull/45 and https://github.com/geoblocks/mapfishprint/pull/46 have been merged and released
declare module '@geoblocks/mapfishprint' {

    /** Either icons or classes should be defined */
    interface MFPLegend {
        name: string
        dpi?: number
        icons?: string[]
        classes?: MFPLegend[]
    }

    interface MFPAttributes {
        map: MFPMap;
        legend: MFPLegend
        copyright?: string
        url?: string
        qrimage: string
        printDate: string
    }

    interface MFPSpec {
        attributes: Partial<MFPAttributes>
        layout: string
        format: string
        lang?: string
        smtp?: Record<string, string>
        outputFilename?: string
    }
}
