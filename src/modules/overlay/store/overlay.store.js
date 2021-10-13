export default {
    state: {
        /**
         * Flag telling if the app overlay should be visible
         *
         * @type Boolean
         */
        show: false,
        /**
         * Flag telling if the app overlay should be brought front (higher z-index) or not. Useful
         * when you want to show a popup, while the menu is already using the overlay.
         *
         * @type Boolean
         */
        shouldBeFront: false,
        /**
         * A list of functions that will be called each one after the other when the overlay will
         * close (because it has been clicked on).
         *
         * If a callback returns `true`, it won't keep popping the next callback, leave the overlay,
         * and keep the other callbacks in.
         *
         * @type Function[]
         */
        callbacksOnClose: [],
    },
    getters: {},
    mutations: {
        showOverlay(state, callbackOnClose) {
            state.show = true
            if (typeof callbackOnClose === 'function') {
                state.callbacksOnClose.push(callbackOnClose)
            }
        },
        setOverlayShouldBeFront: (state, flag) => (state.shouldBeFront = !!flag),
        hideOverlay(state) {
            state.shouldBeFront = false
            if (state.callbacksOnClose.length > 0) {
                // popping one callback at a time and check if they return true, starting with the latest added
                let lastCallbackIndex = state.callbacksOnClose.length
                let keepDiggingIntoCallback = true
                do {
                    lastCallbackIndex--
                    const callback = state.callbacksOnClose[lastCallbackIndex]
                    // if the next callback returns true, we stop the callbacks loop
                    keepDiggingIntoCallback = keepDiggingIntoCallback && !callback()
                } while (keepDiggingIntoCallback && lastCallbackIndex !== 0)
                // if all callbacks have been processed, we hide the overlay
                if (lastCallbackIndex === 0) {
                    state.callbacksOnClose = []
                    state.show = false
                } else {
                    // otherwise, we leave the overlay active, and keep the other callbacks
                    // (removing all callbacks until the one returning true)
                    state.callbacksOnClose = state.callbacksOnClose.slice(0, lastCallbackIndex)
                }
            } else {
                state.show = false
            }
        },
        hideOverlayIgnoringCallbacks(state) {
            state.show = false
            state.callbacksOnClose = []
        },
    },
    actions: {
        showOverlay: ({ commit }, callbacksOnClose) => commit('showOverlay', callbacksOnClose),
        setOverlayShouldBeFront: ({ commit }, flag) => commit('setOverlayShouldBeFront', flag),
        hideOverlay: ({ commit }) => commit('hideOverlay'),
        hideOverlayIgnoringCallbacks: ({ commit }) => commit('hideOverlayIgnoringCallbacks'),
    },
}
