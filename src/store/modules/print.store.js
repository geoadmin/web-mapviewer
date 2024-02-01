import { readPrintCapabilities } from '@/api/print.api.js'
import log from '@/utils/logging.js'

export default {
    state: {
        layouts: [],
        selectedLayout: {},
        selectedScale: 0,
        printSectionShown: false,
    },
    getters: {
        mapSize(state) {
            const mapAttributes = state.selectedLayout.attributes.find((atr) => atr.name === 'map')

            return {
                width: mapAttributes?.clientParams?.width?.default,
                height: mapAttributes?.clientParams?.height?.default,
            }
        },
        getSelectedScale(state) {
            return state.selectedScale
        },
    },
    actions: {
        async loadPrintLayouts({ commit }) {
            try {
                const layouts = await readPrintCapabilities()
                commit('setPrintLayouts', [...layouts])
            } catch (error) {
                log.error('Error while loading print layouts', error)
            }
        },
        setSelectedScale({ commit }, scale) {
            commit('setSelectedScale', scale)
        },
        setSelectedLayout({ commit }, layout) {
            commit('setSelectedLayout', layout)
        },
        setPrintSectionShown({ commit }, isShown) {
            commit('setPrintSectionShown', isShown)
        },
    },
    mutations: {
        setPrintLayouts: (state, layouts) => (state.layouts = layouts),
        setSelectedLayout: (state, layout) => (state.selectedLayout = layout),
        setSelectedScale: (state, scale) => (state.selectedScale = scale),
        setPrintSectionShown: (state, isShown) => (state.printSectionShown = isShown),
    },
}
