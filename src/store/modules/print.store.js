import { readPrintCapabilities } from '@/api/print.api.js'
import log from '@/utils/logging.js'

export default {
    state: {
        layouts: [],
        selectedLayout: {},
        selectedScale: 0,
        printSectionShown: false,
        printingStatus: false,
        useGraticule: false,
        useLegend: false,
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
        useGraticule(state) {
            return state.useGraticule
        },
        useLegend(state) {
            return state.useLegend
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
        setPrintingStatus({ commit }, { isPrinting, dispatcher }) {
            commit('setPrintingStatus', { isPrinting, dispatcher })
        },
        setUseGraticule({ commit }, { useGraticule, dispatcher }) {
            commit('setUseGraticule', { useGraticule, dispatcher })
        },
        setUseLegend({ commit }, { useLegend, dispatcher }) {
            commit('setUseLegend', { useLegend, dispatcher })
        },
    },
    mutations: {
        setPrintLayouts: (state, { layouts }) => (state.layouts = layouts),
        setSelectedLayout: (state, { layout }) => (state.selectedLayout = layout),
        setSelectedScale: (state, { scale }) => (state.selectedScale = scale),
        setPrintSectionShown: (state, { show }) => (state.printSectionShown = show),
        setPrintingStatus: (state, { isPrinting }) => (state.printingStatus = isPrinting),
        setUseGraticule: (state, { useGraticule }) => (state.useGraticule = useGraticule),
        setUseLegend: (state, { useLegend }) => (state.useLegend = useLegend),
    },
}
