import { readPrintCapabilities } from '@/api/print.api.js'
import log from '@/utils/logging.js'

export default {
    state: {
        layouts: [],
        selectedLayout: null,
        selectedScale: null,
        printSectionShown: false,
        printExtent: [],
    },
    getters: {
        printLayoutSize(state) {
            const mapAttributes = state.selectedLayout?.attributes.find(
                (attribute) => attribute.name === 'map'
            )

            return {
                width: mapAttributes?.clientParams?.width?.default ?? 0,
                height: mapAttributes?.clientParams?.height?.default ?? 0,
            }
        },
        selectedDPI(state) {
            const mapAttributes = state.selectedLayout.attributes.find(
                (attribute) => attribute.name === 'map'
            )
            return mapAttributes?.clientInfo?.maxDPI
        },
    },
    actions: {
        async loadPrintLayouts({ commit }, { dispatcher }) {
            try {
                const layouts = await readPrintCapabilities()
                commit('setPrintLayouts', { layouts, dispatcher })
            } catch (error) {
                log.error('Error while loading print layouts', error)
            }
        },
        setSelectedScale({ commit }, { scale, dispatcher }) {
            commit('setSelectedScale', { scale, dispatcher })
        },
        setSelectedLayout({ commit }, { layout, dispatcher }) {
            commit('setSelectedLayout', { layout, dispatcher })
        },
        setPrintSectionShown({ commit }, { show, dispatcher }) {
            commit('setPrintSectionShown', { show, dispatcher })
        },
        setPrintExtent({ commit }, { printExtent, dispatcher }) {
            commit('setPrintExtent', { printExtent, dispatcher })
        },
    },
    mutations: {
        setPrintLayouts: (state, { layouts }) => (state.layouts = layouts),
        setSelectedLayout: (state, { layout }) => (state.selectedLayout = layout),
        setSelectedScale: (state, { scale }) => (state.selectedScale = scale),
        setPrintSectionShown: (state, { show }) => (state.printSectionShown = show),
        setPrintExtent: (state, { printExtent }) => (state.printExtent = printExtent),
    },
}
