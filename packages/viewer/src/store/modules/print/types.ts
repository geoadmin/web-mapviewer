import type { PrintLayout } from '@swissgeo/api'
import type { FlatExtent } from '@swissgeo/coordinates'

import type usePrintStore from '@/store/modules/print'

export interface NewPrintServiceConfig {
    dpi: number
    layout: string
}

export interface PrintStoreState {
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

export type PrintLayoutApiSize = { default: number }

export interface PrintStoreGetters {
    printLayoutSize(): PrintLayoutSize
    selectedDPI(): number | undefined
}

export type PrintStoreStateAndGetters = PrintStoreState & PrintStoreGetters

export type PrintStore = ReturnType<typeof usePrintStore>
