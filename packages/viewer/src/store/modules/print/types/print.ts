import type { FlatExtent } from '@swissgeo/coordinates'

import type { PrintLayout } from '@/api/print.api'

export interface NewPrintServiceConfig {
    dpi: number
    layout: string
}

export interface PrintState {
    layouts: PrintLayout[]
    selectedLayout: PrintLayout | undefined
    selectedScale: number | undefined
    printSectionShown: boolean
    printExtent: FlatExtent | undefined
    config: NewPrintServiceConfig
}

export interface PrintLayoutSize {
    width: number
    height: number
}

export interface PrintStoreGetters {
    printLayoutSize: PrintLayoutSize
    selectedDPI: number | undefined
}

export type PrintStore = PrintState & PrintStoreGetters
