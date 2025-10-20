import type { FlatExtent } from '@swissgeo/coordinates'

import log, { LogPreDefinedColor } from '@swissgeo/log'
import { defineStore } from 'pinia'

import type { ActionDispatcher } from '@/store/types'

import { PrintLayout, readPrintCapabilities } from '@/api/print.api'
import { PRINT_DEFAULT_DPI } from '@/config/print.config'
import { PrintStoreActions } from '@/store/actions'

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

            const params = mapAttributes?.clientParams

            if (!params) {
                return { width: 0, height: 0 }
            }

            type size = { default: number }

            return {
                width: (params.width as size).default ?? 0,
                height: (params.height as size).default ?? 0,
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
        async [PrintStoreActions.LoadPrintLayouts](dispatcher: ActionDispatcher) {
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

        [PrintStoreActions.SetSelectedScale](
            scale: number | undefined,
            dispatcher: ActionDispatcher
        ) {
            this.selectedScale = scale
        },

        [PrintStoreActions.SetSelectedLayout](
            layout: PrintLayout | undefined,
            dispatcher: ActionDispatcher
        ) {
            this.selectedLayout = layout
        },

        [PrintStoreActions.SetPrintSectionShown](show: boolean, dispatcher: ActionDispatcher) {
            this.printSectionShown = show
        },

        [PrintStoreActions.SetPrintExtent](
            printExtent: FlatExtent | undefined,
            dispatcher: ActionDispatcher
        ) {
            this.printExtent = printExtent
        },

        [PrintStoreActions.SetPrintConfig](
            config: NewPrintServiceConfig,
            dispatcher: ActionDispatcher
        ) {
            this.config = config
        },
    },
})

export default usePrintStore
