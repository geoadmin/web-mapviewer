import { readPrintCapabilities } from '@/api/print.api.js'
import log from '@/utils/logging.js'

export default {
    state: {
        layouts: [],
        selectedLayout: null,
        selectedScale: 0,
        printSectionShown: false,
    },
    getters: {
        mapSize(state) {
            const mapAttributes = state.selectedLayout.attributes.find(
                (attribute) => attribute.name === 'map'
            )

            return {
                width: mapAttributes?.clientParams?.width?.default,
                height: mapAttributes?.clientParams?.height?.default,
            }
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
            commit('setSelectedScale', { scale: layout.scales[0], dispatcher })
        },
        setPrintSectionShown({ commit }, { show, dispatcher }) {
            commit('setPrintSectionShown', { show, dispatcher })
        },
    },
    mutations: {
        setPrintLayouts: (state, { layouts }) => (state.layouts = layouts),
        setSelectedLayout: (state, { layout }) => (state.selectedLayout = layout),
        setSelectedScale: (state, { scale }) => (state.selectedScale = scale),
        setPrintSectionShown: (state, { show }) => (state.printSectionShown = show),
    },
}
