import { defineStore } from 'pinia'

import type { PrintStoreState, PrintStoreGetters } from '@/store/modules/print/types/print'

import { PRINT_DEFAULT_DPI } from '@/config/print.config'
import loadPrintLayouts from '@/store/modules/print/actions/loadPrintLayouts'
import setPrintConfig from '@/store/modules/print/actions/setPrintConfig'
import setPrintExtent from '@/store/modules/print/actions/setPrintExtent'
import setPrintSectionShown from '@/store/modules/print/actions/setPrintSectionShown'
import setSelectedLayout from '@/store/modules/print/actions/setSelectedLayout'
import setSelectedScale from '@/store/modules/print/actions/setSelectedScale'
import printLayoutSize from '@/store/modules/print/getters/printLayoutSize'
import selectedDPI from '@/store/modules/print/getters/selectedDPI'

const state = (): PrintStoreState => ({
    layouts: [],
    selectedLayout: undefined,
    selectedScale: undefined,
    printSectionShown: false,
    printExtent: undefined,
    config: {
        dpi: PRINT_DEFAULT_DPI,
        layout: 'A4_L',
    },
})

const getters: PrintStoreGetters = {
    printLayoutSize,
    selectedDPI,
}

const actions = {
    loadPrintLayouts,
    setSelectedScale,
    setSelectedLayout,
    setPrintSectionShown,
    setPrintExtent,
    setPrintConfig,
}

const usePrintStore = defineStore('print', {
    state,
    getters: { ...getters },
    actions,
})

export default usePrintStore
