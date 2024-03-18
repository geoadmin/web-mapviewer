const dispatcher = { dispatcher: 'loading-bar-management.plugin' }

/**
 * Plugin setting in the store when the loading bar should be visible
 *
 * @param {Vuex.Store} store
 */
const loadingBarManagementPlugin = (store) => {
    store.subscribe((_, state) => {
        const isLoadingBarVisible = state.ui.showLoadingBar
        // for now, we only check if app is ready and printing status
        // TODO: any pending request to the backend should trigger the loading bar
        const shouldLoadingBarBeVisible = !state.app.isReady || state.print.printingStatus
        if (isLoadingBarVisible !== shouldLoadingBarBeVisible) {
            store.dispatch('toggleLoadingBar', dispatcher)
        }
    })
}

export default loadingBarManagementPlugin
