import log from '@geoadmin/log'

import { readPrintCapabilities } from '@/api/print.api'
import { PRINT_DEFAULT_DPI } from '@/config/print.config'

export default {
    state: {
        /** @deprecated Should be removed as soon as we've switched to the new print backend */
        layouts: [],
        /** @deprecated Should be removed as soon as we've switched to the new print backend */
        selectedLayout: null,
        /** @deprecated Should be removed as soon as we've switched to the new print backend */
        selectedScale: null,
        printSectionShown: false,
        printExtent: [],
        config: {
            dpi: PRINT_DEFAULT_DPI,
            layout: 'A4_L',
        },
    },
    getters: {
        /** @deprecated Should be removed as soon as we've switched to the new print backend */
        printLayoutSize(state) {
            const mapAttributes = state.selectedLayout?.attributes.find(
                (attribute) => attribute.name === 'map'
            )

            return {
                width: mapAttributes?.clientParams?.width?.default ?? 0,
                height: mapAttributes?.clientParams?.height?.default ?? 0,
            }
        },
        /** @deprecated Should be removed as soon as we've switched to the new print backend */
        selectedDPI(state) {
            const mapAttributes = state.selectedLayout.attributes.find(
                (attribute) => attribute.name === 'map'
            )
            return mapAttributes?.clientInfo?.maxDPI
        },
    },
    actions: {
        /** @deprecated Should be removed as soon as we've switched to the new print backend */
        async loadPrintLayouts({ commit }, { dispatcher }) {
            try {
                const layouts = await readPrintCapabilities()
                commit('setPrintLayouts', { layouts, dispatcher })
            } catch (error) {
                log.error('Error while loading print layouts', error)
            }
        },
        /** @deprecated Should be removed as soon as we've switched to the new print backend */
        setSelectedScale({ commit }, { scale, dispatcher }) {
            commit('setSelectedScale', { scale, dispatcher })
        },
        /** @deprecated Should be removed as soon as we've switched to the new print backend */
        setSelectedLayout({ commit }, { layout, dispatcher }) {
            commit('setSelectedLayout', { layout, dispatcher })
        },
        /** @deprecated Should be removed as soon as we've switched to the new print backend */
        setPrintSectionShown({ commit }, { show, dispatcher }) {
            commit('setPrintSectionShown', { show, dispatcher })
        },
        setPrintExtent({ commit }, { printExtent, dispatcher }) {
            commit('setPrintExtent', { printExtent, dispatcher })
        },
        setPrintConfig({ commit }, { config, dispatcher }) {
            commit('setPrintConfig', { config, dispatcher })
        },
    },
    mutations: {
        /** @deprecated Should be removed as soon as we've switched to the new print backend */
        setPrintLayouts: (state, { layouts }) => (state.layouts = layouts),
        /** @deprecated Should be removed as soon as we've switched to the new print backend */
        setSelectedLayout: (state, { layout }) => (state.selectedLayout = layout),
        /** @deprecated Should be removed as soon as we've switched to the new print backend */
        setSelectedScale: (state, { scale }) => (state.selectedScale = scale),
        setPrintSectionShown: (state, { show }) => (state.printSectionShown = show),
        setPrintExtent: (state, { printExtent }) => (state.printExtent = printExtent),
        setPrintConfig: (state, { config }) => (state.config = config),
    },
}
