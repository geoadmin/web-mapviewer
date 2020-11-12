/**
 * Module that stores all information related to the UI, for instance if a portion of the UI (like the header) should
 * be visible right now or not.
 * Most actions from this module will be used/synchronized by store plugins as it involved listening to some mutation
 * to trigger this change.
 */
export default {
    state: {
        /** Height of the viewport (in px) */
        height: 0,
        /** Width of the viewport (in px) */
        width: 0,
        showMenuTray: false,
        showHeader: true,
        showFooter: true,
        showBackgroundWheel: true,
    },
    getters: {
        screenDensity: (state) => {
            if (state.height === 0) return 0;
            return state.width / state.height
        }
    },
    actions: {
        setSize: ({commit}, {width, height}) => {
            commit('setSize', {
                height,
                width,
            })
        },
        toggleMenuTray: ({commit, state}) => commit('setShowMenuTray', !state.showMenuTray),
        toggleHeader: ({commit, state}) => commit('setShowHeader', !state.showHeader),
        toggleFooter: ({commit, state}) => commit('setShowFooter', !state.showFooter),
        toggleBackgroundWheel: ({commit, state}) => commit('setShowBackgroundWheel', !state.showBackgroundWheel),
    },
    mutations: {
        setSize: (state, {height, width}) => {
            state.height = height;
            state.width = width;
        },
        setShowMenuTray: (state, flagValue) => state.showMenuTray = flagValue,
        setShowHeader: (state, flagValue) => state.showHeader = flagValue,
        setShowFooter: (state, flagValue) => state.showFooter = flagValue,
        setShowBackgroundWheel: (state, flagValue) => state.showBackgroundWheel = flagValue,
    },
}
