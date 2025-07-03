import log, { LogPreDefinedColor } from '@geoadmin/log'
import { defineStore } from 'pinia'

import type { ActionDispatcher } from '@/store/store'
import type { FlatExtent } from '@/utils/extentUtils'

import { PrintLayout, readPrintCapabilities } from '@/api/print.api'
import { PRINT_DEFAULT_DPI } from '@/config/print.config'

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

const usePrintStore = defineStore('print', {
    state: (): PrintState => ({
        layouts: [],
        selectedLayout: undefined,
        selectedScale: undefined,
        printSectionShown: false,
        printExtent: undefined,
        config: {
            dpi: PRINT_DEFAULT_DPI,
            layout: 'A4_L',
        },
    }),
    getters: {
        printLayoutSize(): PrintLayoutSize {
            const mapAttributes = this.selectedLayout?.attributes.find(
                (attribute) => attribute.name === 'map'
            )

            return {
                width: mapAttributes?.clientParams?.width?.default ?? 0,
                height: mapAttributes?.clientParams?.height?.default ?? 0,
            }
        },

        selectedDPI(): number | undefined {
            const mapAttributes = this.selectedLayout?.attributes.find(
                (attribute) => attribute.name === 'map'
            )
            return mapAttributes?.clientInfo?.maxDPI
        },
    },
    actions: {
        async loadPrintLayouts(dispatcher: ActionDispatcher) {
            try {
                this.layouts = await readPrintCapabilities()
            } catch (error) {
                log.error({
                    title: 'Print store / loadPrintLayouts',
                    titleStyle: {
                        backgroundColor: LogPreDefinedColor.Red,
                    },
                    messages: ['Error while loading print layouts', error],
                })
            }
        },

        setSelectedScale(scale: number | undefined, dispatcher: ActionDispatcher) {
            this.selectedScale = scale
        },

        setSelectedLayout(layout: PrintLayout | undefined, dispatcher: ActionDispatcher) {
            this.selectedLayout = layout
        },

        setPrintSectionShown(show: boolean, dispatcher: ActionDispatcher) {
            this.printSectionShown = show
        },

        setPrintExtent(printExtent: FlatExtent | undefined, dispatcher: ActionDispatcher) {
            this.printExtent = printExtent
        },

        setPrintConfig(config: NewPrintServiceConfig, dispatcher: ActionDispatcher) {
            this.config = config
        },
    },
})

export default usePrintStore
