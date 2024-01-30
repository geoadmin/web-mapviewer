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
            var mapAttributes = state.selectedLayout.attributes.find((atr) => atr.name === 'map')

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
    },
    mutations: {
        setPrintLayouts: (state, layouts) => (state.layouts = layouts),
        setSelectedLayout: (state, layout) => (state.selectedLayout = layout),
        setSelectedScale: (state, scale) => (state.selectedScale = scale),
        setprintSectionShown: (state, isShown) => (state.printSectionShown = isShown),
    },
}
