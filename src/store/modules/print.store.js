import { readPrintCapabilities } from '@/api/print.api.js'
import log from '@/utils/logging.js'

export default {
    state: {
        layouts: [],
    },
    getters: {},
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
    },
}
